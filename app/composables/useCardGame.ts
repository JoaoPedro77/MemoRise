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

    // 💤 Sono Pesado: primeira carta clicada vira e desvira sem efeito
    if (upgradeStore.hasActiveUpgrade('💤') && !gameStore.primeiroCliqueFeito) {
      gameStore.primeiroCliqueFeito = true
      card.revelada = true
      setTimeout(() => {
        card.revelada = false
      }, 500)
      return
    }

    // 🔮 Premonição (primeira carta do turno): revela outra aleatória
    if (upgradeStore.hasActiveUpgrade('🔮') && !firstCard.value) {
      const extra = gameStore.tabuleiro.find(c => c.id !== card.id && !c.combinada)
      if (extra) {
        extra.revelada = true
        setTimeout(() => {
          extra.revelada = false
        }, 800)
      }
    }

    // 🧲 Ímã: troca a par com vizinho
    if (upgradeStore.isImaActive) {
      const match = gameStore.tabuleiro.find(c => c.valor === card.valor && c.id !== card.id)
      if (match) {
        const idx = gameStore.tabuleiro.indexOf(match)
        const adj = idx > 0 ? idx - 1 : (idx < gameStore.tabuleiro.length - 1 ? idx + 1 : null)
        if (adj !== null && adj !== idx && gameStore.tabuleiro[adj]) {
          const temp = gameStore.tabuleiro[adj]
          gameStore.tabuleiro[adj] = gameStore.tabuleiro[idx] as Card
          gameStore.tabuleiro[idx] = temp as Card
        }
      }
      upgradeStore.isImaActive = false
      return
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

    const firstTimeMatch = !firstCard.value?.jaViu && !secondCard.value?.jaViu
    gameStore.registerMatch(firstTimeMatch)
    gameStore.errosConsecutivos = 0

    afterTurnEffects()
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

    // 🕳️ Esquecimento: 2 erros seguidos desfaz par
    gameStore.errosConsecutivos++
    if (gameStore.errosConsecutivos >= 2 && upgradeStore.hasActiveUpgrade('🕳️')) {
      gameStore.desfazerPar()
    }

    setTimeout(() => {
      if (firstCard.value) firstCard.value.revelada = false
      if (secondCard.value) secondCard.value.revelada = false
      afterTurnEffects()
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

  function afterTurnEffects() {
    // 👻 Aparição: 20% de virar carta aleatória
    if (upgradeStore.hasActiveUpgrade('👻') && Math.random() < 0.2) {
      const targets = gameStore.tabuleiro.filter(c => !c.combinada)
      if (targets.length > 0) {
        const ghost = targets[Math.floor(Math.random() * targets.length)]
        if (!ghost) return
        ghost.revelada = true
        setTimeout(() => {
          ghost.revelada = false
        }, 600)
      }
    }
  }

  return {
    selectCard,
    tabuleiroLimpo,
    ganhouFase
  }
}
