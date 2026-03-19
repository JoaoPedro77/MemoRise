<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import type { Card } from '~/utils/game-logic'
import {
  DELAY_CHECK_MATCH,
  DELAY_FLIP_BACK,
  DURATION_DAMAGE_EFFECT,
  DURATION_SHAKE_EFFECT,
  GOAL_INCREMENT_PER_FLOOR
} from '~/constants/constantes'

const gameStore = useGameStore()

// Se o jogo não estiver começado (ex: reload da página), inicia uma nova partida automaticamente
onMounted(() => {
  if (!gameStore.gameStarted) {
    gameStore.startNewGame()
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
    }, DELAY_CHECK_MATCH)
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
  gameStore.resetStreak()
  const hasContract = gameStore.activeUpgrades.some(u => u.id === '📄')

  let loseLife = false
  if (firstCard.value?.jaViu) {
    if (hasContract && !firstCard.value.usouSegundaChance) {
      firstCard.value.usouSegundaChance = true
    } else {
      loseLife = true
    }
  }

  if (secondCard.value?.jaViu) {
    if (hasContract && !secondCard.value.usouSegundaChance) {
      secondCard.value.usouSegundaChance = true
    } else {
      loseLife = true
    }
  }

  if (loseLife) gameStore.loseLife()

  // Vira de volta após um tempo
  setTimeout(() => {
    if (firstCard.value) firstCard.value.revelada = false
    if (secondCard.value) secondCard.value.revelada = false
    resetTurn()
  }, DELAY_FLIP_BACK)
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
  return gameStore.pairsFoundInAndar >= gameStore.currentGoal
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
  const colsPC = Math.ceil(numCards / 4)

  let colsMobile = 'grid-cols-4'
  if (numCards <= 4) colsMobile = 'grid-cols-2'
  if (numCards <= 8) colsMobile = 'grid-cols-4'

  return {
    class: colsMobile,
    colsPC
  }
})

// Efeito de Dano e Tremor (Shake)
const showDamageEffect = ref(false)
const isShaking = ref(false)

watch(() => gameStore.lives, (newLives, oldLives) => {
  if (newLives < oldLives && newLives >= 0) {
    showDamageEffect.value = true
    isShaking.value = true

    setTimeout(() => {
      showDamageEffect.value = false
    }, DURATION_DAMAGE_EFFECT)

    setTimeout(() => {
      isShaking.value = false
    }, DURATION_SHAKE_EFFECT)
  }
})

// Se o estado de jogo mudar para falso (ex: reset total), volta pro menu
watch(() => gameStore.gameStarted, (started) => {
  if (!started) {
    navigateTo('/')
  }
})
</script>

<template>
  <main
    class="flex flex-col md:flex-row items-center md:items-start md:justify-center min-h-screen pt-21 px-4 gap-2 overflow-hidden relative"
    :class="{ 'shake-animation': isShaking }"
  >
    <!-- Efeito de Dano (Overlay) -->
    <div
      class="fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 bg-error-500/30"
      :class="showDamageEffect ? 'opacity-100' : 'opacity-0'"
    />
    <!-- BARRA LATERAL (Upgrades) -->
    <aside
      v-if="gameStore.activeUpgrades.some(u => u?.type !== 'item')"
      class="flex flex-row md:flex-col items-center justify-start md:justify-center gap-3 p-3 bg-neutral-800/50 rounded-xl backdrop-blur-sm md:sticky md:top-25 overflow-x-auto max-w-full no-scrollbar"
    >
      <UTooltip
        v-for="up in gameStore.activeUpgrades.filter(u => u?.type !== 'item')"
        :key="up?.instanceId"
        :text="up?.description"
      >
        <div class="relative group">
          <UIcon
            :name="up?.icon"
            class="text-xl transition-transform hover:scale-110"
            :class="up?.type === 'curse' ? 'text-error-500' : 'text-secondary-400'"
          />
          <span
            v-if="up?.floorsLeft > 0"
            class="absolute font-fredoka -top-1 -right-1 flex items-center justify-center bg-neutral-900 border border-white/10 text-[8px] w-3.5 h-3.5 rounded-full text-white"
          >
            {{ up.floorsLeft }}
          </span>
        </div>
      </UTooltip>
    </aside>

    <!-- ÁREA DO JOGO -->
    <section
      class="grid gap-2 md:gap-3 max-w-7xl justify-items-center md:grid-cols-[repeat(var(--cols-pc),minmax(0,1fr))]"
      :class="gridColsClass.class"
      :style="{ '--cols-pc': gridColsClass.colsPC }"
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
    <div
      v-if="gameStore.activeUpgrades.some(u => u?.type === 'item')"
      class="fixed bottom-0 left-2/5 -translate-x-1/2 flex gap-4 pointer-events-none translate-y-15 opacity-80"
    >
      <UTooltip
        v-for="up in gameStore.activeUpgrades.filter(u => u?.type === 'item')"
        :key="up?.instanceId"
        :text="up?.description"
      >
        <UIcon
          :name="up?.icon"
          class="text-xl transition-transform hover:scale-110 text-neutral-100"
        />
      </UTooltip>
      <NuxtImg
        src="cartaUpgrade.png"
        class="w-[80px] h-[110px] sm:w-[100px] sm:h-[135px] rotate-3 -translate-y-4 shadow-2xl"
      />
    </div>

    <!-- BOTÃO DE TESTE (DEBUG) -->
    <div class="fixed top-4 left-4 z-50">
      <UButton
        icon="game-icons:test-tubes"
        color="neutral"
        variant="ghost"
        @click="gameStore.triggerTestUpgrade()"
      />
    </div>

    <UModal
      :open="gameStore.opcoesUpgrade.length > 0 "
      prevent-close
      size="w-3xl"
    >
      <template #content>
        <div class="p-2 md:p-8 text-center flex flex-col items-center">
          <div class="space-y-1">
            <h2 class="text-4xl flex items-center justify-center gap-3 text-secondary-500 font-black italic">
              <UIcon name="game-icons:open-treasure-chest" />
              Relíquias
            </h2>
            <p class="text-neutral-400 text-sm font-medium">
              Escolha um artefato para prosseguir na sua jornada
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-0 sm:gap-2 w-full">
            <CartaUpgrade
              v-for="(up, i) in gameStore.opcoesUpgrade"
              :key="up?.id"
              :upgrade="up"
              :index="i"
              @click="gameStore.selecionarUpgrade(up)"
            />
          </div>

          <div class="w-full flex flex-col items-center gap-3 border-t border-white/5 pt-4">
            <UButton
              label="Pular Upgrade"
              icon="game-icons:card-discard"
              color="secondary"
              variant="solid"
              size="lg"
              class="font-bold w-full justify-center mb-2"
              @click="gameStore.pularUpgrade()"
            />
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      :open="gameStore.isGameOver"
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
            @click="gameStore.nextFloor(GOAL_INCREMENT_PER_FLOOR)"
          />
        </div>
      </template>
    </UModal>
  </main>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
</style>
