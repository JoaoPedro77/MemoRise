import { defineStore } from 'pinia'
import { UPGRADES_POOL, type Upgrade, type CollectedUpgrade } from '~/constants/upgrades'
import { applyUpgradeEffect, getFloorTime } from '~/utils/upgrade-effects'
import { gerarListaCartasMemoria } from '~/utils/game-logic'
import { bancoEmojis } from '~/utils/banco-emojis'
import { maxBoardSize, maxLives, INITIAL_LIVES, INITIAL_GOAL, GOAL_INCREMENT_PER_FLOOR, MAX_ITEMS } from '~/constants/constantes'

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

  // Itens e Ativações
  const selectedItemInstanceId = ref<string | null>(null)
  const isLupaActive = ref(false)
  const toast = useToast()

  onMounted(() => {
    if (import.meta.client) {
      const saved = localStorage.getItem('memorise-best-floor')
      if (saved) bestFloor.value = parseInt(saved)
    }
  })

  function updateBestFloor() {
    if (floor.value.number > bestFloor.value) {
      bestFloor.value = floor.value.number
      if (import.meta.client) {
        localStorage.setItem('memorise-best-floor', bestFloor.value.toString())
      }
    }
  }

  const isTurnInProgress = computed(() => {
    return tabuleiro.value.some(card => card.revelada && !card.combinada)
  })

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
    if (upgrade.type === 'item') {
      const currentItems = activeUpgrades.value.filter(up => up.type === 'item').length
      if (currentItems >= MAX_ITEMS) {
        showToast(`Você já tem ${MAX_ITEMS} itens e esse é o máximo!`)
        return
      }
    }
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

      showEyeAnimation.value = true
      setTimeout(() => {
        showEyeAnimation.value = false
      }, 2000)

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

  function showToast(message: string, title: string = 'Ação Bloqueada') {
    toast.add({
      id: 'toast',
      title,
      description: message,
      icon: 'i-lucide-triangle-alert',
      color: 'error',
      duration: 3000
    })
  }

  function selectItem(instanceId: string) {
    if (selectedItemInstanceId.value === instanceId) {
      selectedItemInstanceId.value = null
    } else {
      selectedItemInstanceId.value = instanceId
    }
  }

  function deselectItem() {
    selectedItemInstanceId.value = null
  }

  function activateItem(instanceId: string) {
    if (isTurnInProgress.value) {
      showToast('Termine sua jogada antes de usar um item!')
      return
    }

    const item = activeUpgrades.value.find(up => up.instanceId === instanceId)
    if (!item) return

    // Lógica específica de cada item
    switch (item.id) {
      case '🔍': // Lupa de Cristal
        isLupaActive.value = true
        break
      case '🔑': // Chave do andar
        nextFloor(GOAL_INCREMENT_PER_FLOOR)
        break
      case '🧪': // Poção da Loucura
        triggerMadnessEffect()
        break
    }

    // Remover item após o uso
    collectedUpgrades.value = collectedUpgrades.value.filter(up => up.instanceId !== instanceId)
    selectedItemInstanceId.value = null
  }

  function triggerMadnessEffect() {
    // Vira e desvira cartas aleatoriamente por 1 segundo
    const interval = setInterval(() => {
      const card = tabuleiro.value[Math.floor(Math.random() * tabuleiro.value.length)]
      if (card && !card.combinada) {
        card.revelada = !card.revelada
      }
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      // Garantir que as cartas não combinadas voltem a ficar viradas para baixo
      tabuleiro.value.forEach((card) => {
        if (!card.combinada) card.revelada = false
      })
    }, 1500)
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
    selectedItemInstanceId.value = null
    isLupaActive.value = false
  }

  function startNewGame() {
    resetRun()
    gameStarted.value = true
    iniciarTabuleiro()
  }

  function nextFloor(addToGoal: number) {
    const floorJustFinished = floor.value.number
    floor.value.number++
    updateBestFloor()
    floor.value.goal += addToGoal
    pairsFoundInAndar.value = 0
    resetStreak()
    selectedItemInstanceId.value = null
    isLupaActive.value = false

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
    bestFloor,
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
    subtractTime,
    resetRun,
    nextFloor,
    registerMatch,
    resetStreak,
    addUpgrade,
    iniciarTabuleiro,
    tabuleiro,
    timeRemaining,
    showEyeAnimation,
    lastTimePenalty,
    showTimePenaltyAnim,
    penaltyPos,
    gameStarted,
    startNewGame,
    // Itens
    selectedItemInstanceId,
    selectItem,
    deselectItem,
    activateItem,
    isLupaActive,
    isTurnInProgress,
    showToast
  }
})
