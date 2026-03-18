import { defineStore } from 'pinia'
import { UPGRADES_POOL, type Upgrade, type CollectedUpgrade } from '~/constants/upgrades'
import { applyUpgradeEffect } from '~/utils/upgrade-effects'
import { gerarListaCartasMemoria } from '~/utils/game-logic'
import { bancoEmojis } from '~/utils/banco-emojis'
import { maxBoardSize, maxLives } from '~/constants/constantes'

export const useGameStore = defineStore('game', () => {
  const tabuleiro = ref<Card[]>([])

  const lives = ref(3)
  const floor = ref({ number: 1, goal: 4, time: -1 })
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
    tabuleiro.value = gerarListaCartasMemoria(bancoEmojis, (floor.value.goal <= maxBoardSize) ? floor.value.goal : maxBoardSize)
  }

  function registerMatch() {
    pairsFoundInAndar.value++
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

  function loseLife() {
    if (lives.value > 0) lives.value--
    if (lives.value === 0) isGameOver.value = true
  }

  function addLife() {
    if (lives.value < maxLives) lives.value++
  }

  function resetRun() {
    lives.value = 3
    isGameOver.value = false
    floor.value = {
      number: 1,
      goal: 4,
      time: -1
    }
    collectedUpgrades.value = []
    pairsFoundInAndar.value = 0
  }

  function nextFloor(addToGoal: number) {
    const floorJustFinished = floor.value.number
    floor.value.number++
    floor.value.goal += addToGoal
    pairsFoundInAndar.value = 0

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
    loseLife,
    addLife,
    resetRun,
    nextFloor,
    registerMatch,
    addUpgrade,
    iniciarTabuleiro,
    tabuleiro
  }
})
