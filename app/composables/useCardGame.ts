import type { Card } from '~/utils/game-logic'
import { DELAY_CHECK_MATCH, DELAY_FLIP_BACK } from '~/constants/constantes'

export function useCardGame() {
  const gameStore = useGameStore()
  const upgradeStore = useUpgradeStore()

  const firstCard = ref<Card | null>(null)
  const secondCard = ref<Card | null>(null)
  const lockBoard = ref(false)
  const lastClickPos = ref({ x: 0, y: 0 })

  function selectCard(card: Card, event?: MouseEvent) {
    if (card.revelada || card.combinada || lockBoard.value) return

    if (event) {
      lastClickPos.value = { x: event.clientX, y: event.clientY }
    }

    card.revelada = true

    if (!firstCard.value) {
      firstCard.value = card
    } else {
      secondCard.value = card
      lockBoard.value = true

      setTimeout(() => {
        checkMatch()
      }, DELAY_CHECK_MATCH)
    }

    if (upgradeStore.isLupaActive) {
      const pair = gameStore.tabuleiro.find(c => c.valor === card.valor && c.id !== card.id)
      if (pair) {
        pair.revelada = true
        pair.combinada = true
        card.combinada = true
        gameStore.registerMatch()
        upgradeStore.isLupaActive = false
        resetTurn()
      }
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
  }

  function handleFailure() {
    gameStore.resetStreak()
    const hasContract = upgradeStore.hasActiveUpgrade('📄')
    const hasPocketWatch = upgradeStore.hasActiveUpgrade('⌚')

    let loseLife = false
    let penaltyTime = false

    if (firstCard.value?.jaViu) {
      if (hasContract && !firstCard.value.usouSegundaChance) {
        firstCard.value.usouSegundaChance = true
      } else if (hasPocketWatch) {
        penaltyTime = true
      } else {
        loseLife = true
      }
    }

    if (secondCard.value?.jaViu) {
      if (hasContract && !secondCard.value.usouSegundaChance) {
        secondCard.value.usouSegundaChance = true
      } else if (hasPocketWatch) {
        penaltyTime = true
      } else {
        loseLife = true
      }
    }

    if (penaltyTime && !loseLife) {
      gameStore.subtractTime(30, lastClickPos.value.x, lastClickPos.value.y)
    } else if (loseLife) {
      gameStore.loseLife()
    }

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

  return {
    selectCard,
    tabuleiroLimpo,
    ganhouFase
  }
}
