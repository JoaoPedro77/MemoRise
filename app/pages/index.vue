<script setup lang="ts">
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

// No menu principal, paramos qualquer timer ativo por segurança
onMounted(() => {
  gameStore.gameStarted = false
})
</script>

<template>
  <main class="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
    <TelaInicial />
  </main>
</template>
