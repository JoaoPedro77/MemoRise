import { defineStore } from 'pinia'
import { getFloorTime, processFloorStartEffects, getPeekDuration } from '~/utils/upgrade-effects'
import { gerarListaCartasMemoria } from '~/utils/game-logic'
import { bancoEmojis } from '~/utils/banco-emojis'
import { maxBoardSize, maxLives, INITIAL_LIVES, INITIAL_GOAL, TIMER_BASE_SECONDS } from '~/constants/constantes'
import { NodeType } from '~/utils/map-generator'

export const useGameStore = defineStore('game', () => {
  const tabuleiro = ref<Card[]>([])

  const gameStarted = ref(false)
  const lives = ref(INITIAL_LIVES)
  const floor = ref({ number: 1, goal: INITIAL_GOAL, time: -1 })
  const { start: startTimer, stop: stopTimer, timeRemaining } = useTimer()
  const bestFloor = ref(0)
  const comboStreak = ref(0)
  const floorGoalModifier = ref(0)
  const showEyeAnimation = ref(false)
  const lastTimePenalty = ref(0)
  const showTimePenaltyAnim = ref(false)
  const penaltyPos = ref({ x: 0, y: 0 })
  const isGameOver = ref(false)
  const pairsFoundInAndar = ref(0)

  // Map-driven combat state
  const sessionPairCount = ref(0)
  const currentCombatNodeId = ref<string | null>(null)

  onMounted(() => {
    if (import.meta.client) {
      const saved = localStorage.getItem('memorise-best-floor')
      if (saved) bestFloor.value = parseInt(saved)
    }
  })

  function updateBestFloor() {
    const mapStore = useMapStore()
    const tower = mapStore.towerNumber
    if (tower > bestFloor.value) {
      bestFloor.value = tower
      if (import.meta.client) {
        localStorage.setItem('memorise-best-floor', bestFloor.value.toString())
      }
    }
  }

  const isTurnInProgress = computed(() => {
    return tabuleiro.value.some(card => card.revelada && !card.combinada)
  })

  const pairsRemaining = computed(() => {
    return Math.max(0, currentGoal.value - pairsFoundInAndar.value)
  })

  const currentGoal = computed(() => {
    if (sessionPairCount.value > 0) return sessionPairCount.value
    const { activeUpgradeIds } = useUpgradeStore()
    let goal = floor.value.goal
    if (activeUpgradeIds.has('✂️')) {
      goal = Math.floor(goal / 2)
    }
    return Math.max(1, goal - floorGoalModifier.value)
  })

  function iniciarTabuleiro(pairCount?: number) {
    const upgradeStore = useUpgradeStore()
    stopTimer()
    floorGoalModifier.value = 0

    processFloorStartEffects(upgradeStore.activeUpgradeIds, floorGoalModifier, loseLife)

    const count = pairCount ?? currentGoal.value
    tabuleiro.value = gerarListaCartasMemoria(bancoEmojis, Math.min(count, maxBoardSize))

    const mapStore = useMapStore()
    const node = currentCombatNodeId.value ? mapStore.getNode(currentCombatNodeId.value) : null
    const shouldUseTimer = node?.type === NodeType.COMBAT_MEDIUM || node?.type === NodeType.COMBAT_BOSS

    if (shouldUseTimer) {
      const floorTime = getFloorTime(floor.value.number, upgradeStore.collectedUpgrades)
      startTimer(floorTime > 0 ? floorTime : TIMER_BASE_SECONDS, () => {
        handleDeath()
      })
    } else {
      timeRemaining.value = -1
    }

    if (upgradeStore.activeUpgradeIds.has('👁️')) {
      const currentCards = tabuleiro.value
      currentCards.forEach(card => card.revelada = true)

      setTimeout(() => {
        currentCards.forEach((card) => {
          if (!card.combinada) card.revelada = false
        })
      }, getPeekDuration(currentCards.length))
    }
  }

  function registerMatch() {
    const { activeUpgradeIds } = useUpgradeStore()
    pairsFoundInAndar.value++
    comboStreak.value++

    if (comboStreak.value === 3 && activeUpgradeIds.has('💪')) {
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

  function handleDeath() {
    const upgradeStore = useUpgradeStore()
    const hasBadDream = upgradeStore.hasActiveUpgrade('🛏️')

    if (hasBadDream) {
      upgradeStore.removeUpgrade('🛏️')
      lives.value = 1
      iniciarTabuleiro(sessionPairCount.value)
      return
    }

    isGameOver.value = true
  }

  function loseLife() {
    if (lives.value > 0) lives.value--
    if (lives.value === 0) handleDeath()
  }

  function addLife() {
    if (lives.value < maxLives) lives.value++
  }

  function subtractTime(seconds: number, x: number = 0, y: number = 0) {
    if (timeRemaining.value !== -1) {
      const oldTime = timeRemaining.value
      timeRemaining.value = Math.max(0, timeRemaining.value - seconds)
      lastTimePenalty.value = oldTime - timeRemaining.value

      penaltyPos.value = { x, y }
      showTimePenaltyAnim.value = true
      setTimeout(() => {
        showTimePenaltyAnim.value = false
      }, 1000)

      if (timeRemaining.value === 0 && oldTime > 0) {
        stopTimer()
        handleDeath()
      }
    }
  }

  function startCombatFromNode(pairCount: number, nodeId: string) {
    sessionPairCount.value = pairCount
    currentCombatNodeId.value = nodeId
    pairsFoundInAndar.value = 0
    resetStreak()
    iniciarTabuleiro(pairCount)
  }

  function resetCombatSession() {
    sessionPairCount.value = 0
    currentCombatNodeId.value = null
    pairsFoundInAndar.value = 0
    floorGoalModifier.value = 0
  }

  function resetRun() {
    stopTimer()
    useUpgradeStore().clearUpgrades()
    lives.value = INITIAL_LIVES
    isGameOver.value = false
    floor.value = {
      number: 1,
      goal: INITIAL_GOAL,
      time: -1
    }
    timeRemaining.value = -1
    pairsFoundInAndar.value = 0
    gameStarted.value = false
    sessionPairCount.value = 0
    currentCombatNodeId.value = null
  }

  function startNewGame() {
    resetRun()
    const mapStore = useMapStore()
    mapStore.initRun()
    gameStarted.value = true
  }

  function nextFloor(addToGoal: number) {
    const upgradeStore = useUpgradeStore()
    const floorJustFinished = floor.value.number
    floor.value.number++
    updateBestFloor()
    floor.value.goal += addToGoal
    pairsFoundInAndar.value = 0
    resetStreak()
    upgradeStore.clearSelection()
    upgradeStore.decrementUpgradeDurations()

    if (floorJustFinished % 2 === 0) {
      upgradeStore.gerarOpcoesUpgrade()
    } else {
      iniciarTabuleiro()
    }
  }

  return {
    tabuleiro,
    lives,
    floor,
    gameStarted,
    isGameOver,
    timeRemaining,
    pairsFoundInAndar,
    pairsRemaining,
    currentGoal,
    comboStreak,
    bestFloor,
    stopTimer,
    floorGoalModifier,
    showEyeAnimation,
    lastTimePenalty,
    showTimePenaltyAnim,
    penaltyPos,
    isTurnInProgress,
    iniciarTabuleiro,
    registerMatch,
    resetStreak,
    loseLife,
    addLife,
    subtractTime,
    resetRun,
    startNewGame,
    nextFloor,
    handleDeath,
    updateBestFloor,
    sessionPairCount,
    currentCombatNodeId,
    startCombatFromNode,
    resetCombatSession
  }
})
