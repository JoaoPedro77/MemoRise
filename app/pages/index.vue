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
  }, 500)
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
  <main class="flex flex-col items-center h-full pt-21 px-4">
    <div
      v-if="gameStore.activeUpgrades.length > 0"
      class="flex flex-wrap items-center justify-start gap-3 p-2 bg-neutral-800/50 rounded-xl backdrop-blur-sm"
    >
      <UTooltip
        v-for="up in gameStore.activeUpgrades"
        :key="up?.id"
        :text="up?.description"
      >
        <UIcon
          :name="up?.icon"
          class="text-xl transition-transform hover:scale-110"
          :class="up?.type === 'curse' ? 'text-error-500' : 'text-secondary-400'"
        />
      </UTooltip>
    </div>
    <section class="flex flex-col gap-2 mt-3">
      <div
        v-for="(linha, i) in gameStore.tabuleiro"
        :key="`linha-${i}`"
        class="flex gap-2 justify-center"
      >
        <CartasJogo
          v-for="card in linha"
          :key="card.id"
          :card="card"
          @click="selectCard(card)"
        />
      </div>
    </section>

    <UModal
      v-model:open="gameStore.isGameOver"
      prevent-close
    >
      <template #content>
        <div class="p-8 text-center flex flex-col items-center gap-6">
          <h2 class="text-4xl flex items-center gap-3 text-error-500 font-black italic">
            <UIcon name="game-icons:broken-skull" />
            GAME OVER
          </h2>

          <p class="text-gray-400">
            Sua jornada terminou no andar {{ gameStore.floor.number }}.
          </p>

          <UButton
            icon="game-icons:anticlockwise-rotation"
            label="Tentar Novamente"
            color="primary"
            variant="solid"
            size="xl"
            block
            @click="gameStore.resetRun(); gameStore.iniciarTabuleiro()"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="ganhouFase"
      prevent-close
    >
      <template #content>
        <div class="p-8 text-center flex flex-col items-center gap-6">
          <div class="space-y-1">
            <p class="text-sm uppercase tracking-widest text-primary-400 font-bold">
              Andar {{ gameStore.floor.number }}
            </p>
            <h2 class="text-4xl flex items-center justify-center gap-2 text-white font-black">
              <UIcon
                name="game-icons:stone-tower"
                class="text-primary-500"
              />
              CONCLUÍDO!
            </h2>
          </div>

          <UButton
            icon="game-icons:3d-stairs"
            label="Subir para o Próximo Andar"
            color="primary"
            variant="solid"
            size="xl"
            block
            @click="gameStore.nextFloor(2); gameStore.iniciarTabuleiro()"
          />
        </div>
      </template>
    </UModal>
  </main>
</template>
