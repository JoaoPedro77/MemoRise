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
            <div class="flex items-center gap-1">
              <UIcon
                name="game-icons:hourglass"
                class="text-primary-500 text-2xl"
                :class="{ 'animate-pulse text-error-500': gameStore.timeRemaining !== -1 && gameStore.timeRemaining < 30 }"
              />
              <span class="text-2xl font-bold select-none">
                {{ gameStore.timeRemaining === -1 ? '∞' : `${Math.floor(gameStore.timeRemaining / 60)}:${(gameStore.timeRemaining % 60).toString().padStart(2, '0')}` }}
              </span>
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
