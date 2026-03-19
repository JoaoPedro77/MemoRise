<script setup lang="ts">
import { useGameStore } from './stores/game'

const gameStore = useGameStore()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'pt-br'
  }
})

const title = 'Jogo da Memória'
const description = 'Jogo da Memória'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/favicon.ico',
  twitterImage: '/favicon.ico',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp class="flex flex-col h-dvh overflow-hidden">
    <UHeader
      class="h-18 fixed w-full bg-neutral-950/50 backdrop-blur-sm"
      :toggle="false"
    >
      <template #left>
        <div class=" flex items-center justify-around">
          <div class="flex flex-wrap max-w-35 items-center gap-1">
            <p class="text-2xl font-bold">
              Vidas
            </p>
            <UIcon
              v-for="life in gameStore.lives"
              :key="life"
              name="pixel:heart-solid"
              class="text-rose-700 text-xl"
            />
          </div>
        </div>
      </template>
      <template #right>
        <div class="flex flex-col gap-2 justify-center items-end">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              <UIcon
                name="game-icons:stone-tower"
                class="text-primary-500 text-2xl"
              />
              <span class="text-2xl font-bold select-none">
                {{ gameStore.floor.number }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <UIcon
                name="game-icons:ace"
                class="text-primary-500 text-2xl"
              />
              <span class="text-2xl font-bold select-none">
                {{ gameStore.pairsRemaining }}
              </span>
            </div>
            <div class="flex items-center gap-1 relative">
              <UIcon
                name="game-icons:hourglass"
                class="text-primary-500 text-2xl"
                :class="{
                  'animate-pulse text-error-500': gameStore.timeRemaining !== -1 && gameStore.timeRemaining < 30,
                  'animate-shake': gameStore.showTimePenaltyAnim
                }"
              />
              <span class="text-2xl font-bold select-none">
                {{ gameStore.timeRemaining === -1 ? '∞' : `${Math.floor(gameStore.timeRemaining / 60)}:${(gameStore.timeRemaining % 60).toString().padStart(2, '0')}` }}
              </span>

              <!-- Penalty Animation -->
              <div
                v-if="gameStore.showTimePenaltyAnim"
                class="fixed text-error-500 font-bold text-4xl pointer-events-none z-2000 -translate-x-1/2 penalty-float"
                :style="{ left: gameStore.penaltyPos.x + 'px', top: gameStore.penaltyPos.y + 'px' }"
              >
                -{{ gameStore.lastTimePenalty }}s
              </div>
            </div>
          </div>
        </div>
      </template>
    </UHeader>

    <UMain class="flex-1 h-dvh min-h-0">
      <NuxtPage />
    </UMain>

    <EyeAnimation v-if="gameStore.showEyeAnimation" />
  </UApp>
</template>

<style>
.penalty-float {
  text-shadow:
    2px 2px 0 #0a0a0a,
    -2px -2px 0 #0a0a0a,
    2px -2px 0 #0a0a0a,
    -2px 2px 0 #0a0a0a,
    0 4px 10px rgba(0,0,0,0.5);
  animation: float-up-anim 1s ease-out forwards;
}

@keyframes float-up-anim {
  0% {
    opacity: 0;
    transform: translate(-50%, 0);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -30px);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -80px);
  }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
