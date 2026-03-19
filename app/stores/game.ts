import { defineStore } from 'pinia'
import { UPGRADES_POOL, type Upgrade, type CollectedUpgrade } from '~/constants/upgrades'
import { applyUpgradeEffect, getFloorTime } from '~/utils/upgrade-effects'
import { gerarListaCartasMemoria } from '~/utils/game-logic'
import { bancoEmojis } from '~/utils/banco-emojis'
import { maxBoardSize, maxLives, INITIAL_LIVES, INITIAL_GOAL, GOAL_INCREMENT_PER_FLOOR } from '~/constants/constantes'

export const useGameStore = defineStore('game', () => {
  const tabuleiro = ref<Card[]>([])

  const gameStarted = ref(false)
  const lives = ref(INITIAL_LIVES)
  const floor = ref({ number: 1, goal: INITIAL_GOAL, time: -1 })
  const { start: startTimer, stop: stopTimer, timeRemaining } = useTimer()
  const comboStreak = ref(0)
  const floorGoalModifier = ref(0)

  const collectedUpgrades = ref<CollectedUpgrade[]>([])
  const isGameOver = ref(false)
  const pairsFoundInAndar = ref(0)
  const opcoesUpgrade = ref<Upgrade[]>([])
  const activeUpgrades = computed(() => {
    return collectedUpgrades.value.map((cu) => {
      const metadata = UPGRADES_POOL.find(u => u.id === cu.id)
      return metadata ? { ...metadata, floorsLeft: cu.floorsLeft, instanceId: cu.instanceId } : null
    }).filter(Boolean) as (Upgrade & { floorsLeft: number, instanceId: string })[]
  })

  const pairsRemaining = computed(() => {
    return Math.max(0, currentGoal.value - pairsFoundInAndar.value)
  })

  const currentGoal = computed(() => {
    let goal = floor.value.goal
    if (activeUpgrades.value.some(up => up.id === '✂️')) {
      goal = Math.floor(goal / 2)
    }
    return Math.max(1, goal - floorGoalModifier.value)
  })

  function selecionarUpgrade(upgrade: Upgrade) {
    addUpgrade(upgrade.id)
    opcoesUpgrade.value = []
    iniciarTabuleiro()
  }

  function pularUpgrade() {
    opcoesUpgrade.value = []
    iniciarTabuleiro()
  }

  function iniciarTabuleiro() {
    stopTimer()
    floorGoalModifier.value = 0

    // Sorte de Principiante (🎲)
    if (activeUpgrades.value.some(up => up.id === '🎲') && Math.random() < 0.02) {
      floorGoalModifier.value++
    }

    // Pacto Maldito (🪦)
    if (activeUpgrades.value.some(up => up.id === '🪦')) {
      if (Math.random() < 0.30) floorGoalModifier.value++
      if (Math.random() < 0.10) loseLife()
    }

    // Pacto da Morte (💀)
    if (activeUpgrades.value.some(up => up.id === '💀')) {
      if (Math.random() < 0.30) floorGoalModifier.value += 4
      if (Math.random() < 0.50) loseLife()
    }

    tabuleiro.value = gerarListaCartasMemoria(bancoEmojis, (currentGoal.value <= maxBoardSize) ? currentGoal.value : maxBoardSize)

    // Cálculo do Tempo do Andar (Centralizado)
    const floorTime = getFloorTime(floor.value.number, collectedUpgrades.value)

    if (floorTime === -1) {
      timeRemaining.value = -1
    } else {
      startTimer(floorTime, () => {
        handleDeath()
      })
    }

    // Visão do além: Revelar cards por 0.5s após terminarem de aparecer
    if (activeUpgrades.value.some(up => up.id === '👁️')) {
      const currentCards = tabuleiro.value
      currentCards.forEach(card => card.revelada = true)

      // Cálculo do tempo: (delay do último card) + (duração da animação) + (tempo de exibição)
      // delay = index * 100ms, animação = 500ms, exibição = 500ms
      const totalAppearTime = (currentCards.length - 1) * 100 + 500
      const peekTime = 500

      setTimeout(() => {
        currentCards.forEach((card) => {
          if (!card.combinada) card.revelada = false
        })
      }, totalAppearTime + peekTime)
    }
  }

  function registerMatch() {
    pairsFoundInAndar.value++
    comboStreak.value++

    if (comboStreak.value === 3 && activeUpgrades.value.some(up => up.id === '💪')) {
      addLife()
      comboStreak.value = 0
    }

    if (pairsFoundInAndar.value >= currentGoal.value) {
      stopTimer()
    }
  }

  function resetStreak() {
    comboStreak.value = 0
  }

  function addUpgrade(id: string) {
    const upgrade = UPGRADES_POOL.find(u => u.id === id)
    if (!upgrade) return

    if (id === '❤️') {
      applyUpgradeEffect(id, { lives, floor })
      return
    }

    const isItem = upgrade.type === 'item'

    if (isItem) {
      // Itens sempre repetem na lista
      collectedUpgrades.value.push({
        instanceId: `inst-${Date.now()}-${Math.random()}`,
        id,
        floorsLeft: upgrade.floors ?? -1
      })
    } else {
      // Passivas e Maldições somam andares
      const existing = collectedUpgrades.value.find(cu => cu.id === id)
      if (existing) {
        existing.floorsLeft += (upgrade.floors ?? 0)
      } else {
        collectedUpgrades.value.push({
          instanceId: `inst-${Date.now()}-${Math.random()}`,
          id,
          floorsLeft: upgrade.floors ?? -1
        })
      }
    }
    applyUpgradeEffect(id, { lives, floor })
  }

  function handleDeath() {
    const hasBadDream = collectedUpgrades.value.some(up => up.id === '🛏️')

    if (hasBadDream && floor.value.number > 1) {
      // Consumir o upgrade (Sonho Ruim)
      collectedUpgrades.value = collectedUpgrades.value.filter(up => up.id !== '🛏️')

      lives.value = 1
      floor.value.number--
      floor.value.goal -= GOAL_INCREMENT_PER_FLOOR
      pairsFoundInAndar.value = 0

      iniciarTabuleiro()
    } else {
      isGameOver.value = true
    }
  }

  function loseLife() {
    if (lives.value > 0) lives.value--
    if (lives.value === 0) handleDeath()
  }

  function addLife() {
    if (lives.value < maxLives) lives.value++
  }

  function resetRun() {
    stopTimer()
    lives.value = INITIAL_LIVES
    isGameOver.value = false
    floor.value = {
      number: 1,
      goal: INITIAL_GOAL,
      time: -1
    }
    timeRemaining.value = -1
    collectedUpgrades.value = []
    pairsFoundInAndar.value = 0
    gameStarted.value = false
  }

  function startNewGame() {
    resetRun()
    gameStarted.value = true
    iniciarTabuleiro()
  }

  function nextFloor(addToGoal: number) {
    const floorJustFinished = floor.value.number
    floor.value.number++
    floor.value.goal += addToGoal
    pairsFoundInAndar.value = 0
    resetStreak()

    // Gerenciar duração dos upgrades
    collectedUpgrades.value = collectedUpgrades.value
      .map((up) => {
        const metadata = UPGRADES_POOL.find(u => u.id === up.id)
        const isItem = metadata?.type === 'item'

        // Itens NÃO perdem andares. Passivas perdurarão.
        if (isItem) return up

        return {
          ...up,
          floorsLeft: up.floorsLeft === -1 ? -1 : up.floorsLeft - 1
        }
      })
      .filter(up => up.floorsLeft !== 0)

    if (floorJustFinished % 2 === 0) {
      opcoesUpgrade.value = [...UPGRADES_POOL]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
    } else {
      iniciarTabuleiro()
    }
  }

  function triggerTestUpgrade() {
    const perk = UPGRADES_POOL.find(u => u.type === 'perk')
    const item = UPGRADES_POOL.find(u => u.type === 'item')
    const curse = UPGRADES_POOL.find(u => u.type === 'curse')
    opcoesUpgrade.value = [perk, curse, item].filter(Boolean) as Upgrade[]
  }

  return {
    triggerTestUpgrade,
    opcoesUpgrade,
    selecionarUpgrade,
    pularUpgrade,
    lives,
    floor,
    collectedUpgrades,
    isGameOver,
    pairsFoundInAndar,
    activeUpgrades,
    pairsRemaining,
    currentGoal,
    loseLife,
    addLife,
    resetRun,
    nextFloor,
    registerMatch,
    resetStreak,
    addUpgrade,
    iniciarTabuleiro,
    tabuleiro,
    timeRemaining,
    gameStarted,
    startNewGame
  }
})
