<script setup lang="ts">
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

async function handleStartNew() {
  gameStore.startNewGame()
  await navigateTo('/game')
}
</script>

<template>
  <div class="fixed inset-0 z-100 flex flex-col items-center justify-center bg-neutral-950 overflow-hidden">
    <!-- Background Decorativo -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-900/20 blur-[120px] rounded-full" />
      <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary-900/20 blur-[120px] rounded-full" />
    </div>

    <div class="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center space-y-12 animate-in fade-in zoom-in duration-700">
      <!-- Logo Principal -->
      <div class="relative group">
        <div class="absolute inset-0 bg-primary-500/20 blur-2xl group-hover:bg-primary-500/40 transition-all duration-500 rounded-full scale-110" />
        <NuxtImg
          src="/logo.png"
          alt="MemoRise Logo"
          class="relative w-64 md:w-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform duration-500 hover:scale-105"
        />
      </div>

      <!-- Título e Subtítulo -->
      <div class="space-y-4">
        <p class="text-neutral-400 font-medium text-sm md:text-base leading-relaxed max-w-[280px] mx-auto">
          Suba os andares e colete relíquias em uma jornada testando sua memória.
        </p>
      </div>

      <!-- Ações -->
      <div class="flex flex-col gap-4 w-full">
        <UButton
          icon="game-icons:stone-tower"
          label="Subir a torre"
          size="xl"
          color="primary"
          variant="solid"
          block
          class="font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(var(--primary-500),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-500),0.5)] transition-all"
          @click="handleStartNew()"
        />
      </div>

      <!-- Footer / Versão -->
      <div class="pt-8 opacity-30 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-neutral-500">
        <UIcon name="game-icons:shield" />
        v1.2.0
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.fade-in { animation: fade-in 1s ease-out; }
.zoom-in { animation: zoom-in 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
</style>
