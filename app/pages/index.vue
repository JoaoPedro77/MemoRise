<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import type { Card } from '~/utils/game-logic'

const gameStore = useGameStore()

// Inicia o jogo apenas se o tabuleiro estiver vazio
onMounted(() => {
  if (gameStore.tabuleiro.length === 0) {
    gameStore.iniciarTabuleiro()
  }
})

const firstCard = ref<Card | null>(null)
const secondCard = ref<Card | null>(null)
const lockBoard = ref(false)

function selectCard(card: Card) {
  // Ignora se já estiver virada, combinada ou se o tabuleiro estiver travado
  if (card.revelada || card.combinada || lockBoard.value) return
  card.revelada = true

  if (!firstCard.value) {
    // Escolheu a primeira
    firstCard.value = card
  } else {
    // Escolheu a segunda
    secondCard.value = card
    lockBoard.value = true

    // Pequena pausa para o jogador ver a carta antes de validar
    setTimeout(() => {
      checkMatch()
    }, 500)
  }
}

function checkMatch() {
  const isMatch = firstCard.value?.valor === secondCard.value?.valor

  if (isMatch) {
    handleSuccess()
  } else {
    handleFailure()
  }
  if (secondCard.value) secondCard.value.jaViu = true
  if (firstCard.value) firstCard.value.jaViu = true
}

function handleSuccess() {
  if (firstCard.value) firstCard.value.combinada = true
  if (secondCard.value) secondCard.value.combinada = true

  resetTurn()

  // TODO: Adicionar lógica de pontuação aqui se desejar
}

function handleFailure() {
  if (secondCard.value?.jaViu || firstCard.value?.jaViu) gameStore.loseLife()

  // Vira de volta após um tempo
  setTimeout(() => {
    if (firstCard.value) firstCard.value.revelada = false
    if (secondCard.value) secondCard.value.revelada = false
    resetTurn()
  }, 1000)
}

function resetTurn() {
  firstCard.value = null
  secondCard.value = null
  lockBoard.value = false
}

const ganhouFase = computed(() => {
  return gameStore.tabuleiro.flat().every(card => card.combinada)
})
</script>

<template>
  <div class="flex pt-23 flex-col items-center h-full">
    <div
      v-for="(linha, i) in gameStore.tabuleiro"
      :key="i"
      class="flex mb-2"
    >
      <CartasJogo
        v-for="card in linha"
        :key="card.id"
        :card="card"
        @click="selectCard(card)"
      />
    </div>

    <!-- Feedback de Game Over -->
    <UModal
      v-model:open="gameStore.isGameOver"
      class="mt-8 text-center"
    >
      <template #content>
        <h2 class="text-3xl text-rose-500 font-bold mb-4">
          GAME OVER
        </h2>
        <UButton
          label="Tentar Novamente"
          color="neutral"
          @click="gameStore.resetRun(); gameStore.iniciarTabuleiro()"
        />
      </template>
    </UModal>
    <UModal
      v-model:open="ganhouFase"
      class="mt-8 text-center"
    >
      <template #content>
        <h2 class="text-3xl text-rose-500 font-bold mb-4">
          PARABÉNS!
        </h2>
        <UButton
          label="Próximo Andar"
          color="neutral"
          @click="gameStore.nextFloor(2); gameStore.iniciarTabuleiro()"
        />
      </template>
    </UModal>
  </div>
</template>
