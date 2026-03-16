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
  gameStore.registerMatch()

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

const tabuleiroLimpo = computed(() => {
  return gameStore.tabuleiro.every(card => card.combinada)
})

const ganhouFase = computed(() => {
  return gameStore.pairsFoundInAndar >= gameStore.floor.goal
})

watch(tabuleiroLimpo, (limpo) => {
  if (limpo && !ganhouFase.value) {
    // REEMBALHAR!
    // Gera novas 12 cartas para o jogador continuar pontuando no mesmo andar
    gameStore.iniciarTabuleiro()
    //////////////////////////////////////////////////////////////////
    console.log('Nova leva de cartas! Continue!')
  }
})

const gridColsClass = computed(() => {
  const numCards = gameStore.tabuleiro.length
  // No PC (MD+), tentamos manter 4 linhas
  const colsPC = Math.ceil(numCards / 4)

  // No Mobile, mantemos a lógica anterior flexível
  let colsMobile = 'grid-cols-4'
  if (numCards <= 4) colsMobile = 'grid-cols-2'
  if (numCards <= 8) colsMobile = 'grid-cols-4'

  return `${colsMobile} md:grid-cols-${colsPC}`
})
</script>

<template>
  <main class="flex flex-col md:flex-row items-center md:items-start md:justify-center min-h-screen pt-21 px-4 gap-2 overflow-hidden relative">
    <!-- BARRA LATERAL (Upgrades) -->
    <aside
      v-if="gameStore.activeUpgrades.length > 0"
      class="flex flex-row md:flex-col items-center justify-center gap-3 p-3 bg-neutral-800/50 rounded-xl backdrop-blur-sm md:sticky md:top-25"
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
    </aside>

    <!-- ÁREA DO JOGO -->
    <section
      class="grid gap-2 md:gap-3 max-w-7xl justify-items-center"
      :class="gridColsClass"
    >
      <CartasJogo
        v-for="(card, j) in gameStore.tabuleiro"
        :key="card.id"
        :card="card"
        :index="j"
        @click="selectCard(card)"
      />
    </section>

    <!-- CARTAS DE ITEMS ARRUMAR DEPOIS -->
    <div class="fixed bottom-0 left-2/5 -translate-x-1/2 flex gap-4 pointer-events-none translate-y-15 opacity-80">
      <NuxtImg
        src="cartaUpgrade.png"
        class="w-[80px] h-[110px] sm:w-[100px] sm:h-[135px] rotate-3 -translate-y-4 shadow-2xl"
      />
    </div>

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
