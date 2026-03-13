import { defineStore } from 'pinia'
import { UPGRADES_POOL } from '~/constants/upgrades'
import { applyUpgradeEffect } from '~/utils/upgrade-effects'
import { gerarMatrizMemoria } from '~/utils/game-logic'
import { bancoEmojis } from '~/utils/banco-emojis'

export const useGameStore = defineStore('game', () => {
  const tabuleiro = ref<Card[][]>([])

  const lives = ref(3)
  const floor = ref({ number: 1, goal: 4 })
  const collectedUpgradeIds = ref<string[]>([])
  const isGameOver = ref(false)

  const activeUpgrades = computed(() => {
    return collectedUpgradeIds.value.map(id =>
      UPGRADES_POOL.find(u => u.id === id)
    ).filter(Boolean)
  })

  function iniciarTabuleiro() {
    tabuleiro.value = gerarMatrizMemoria(bancoEmojis, { totalPares: floor.value.goal, colunas: 4 })
  }

  function addUpgrade(id: string) {
    if (!collectedUpgradeIds.value.includes(id)) {
      collectedUpgradeIds.value.push(id)
      applyUpgradeEffect(id, { lives, floor })
    }
  }
  function loseLife() {
    if (lives.value > 0) lives.value--
    if (lives.value === 0) isGameOver.value = true
  }

  function addLife() {
    if (lives.value < 12) lives.value++
  }

  function resetRun() {
    lives.value = 3
    isGameOver.value = false
    floor.value = {
      number: 1,
      goal: 4
    }
    collectedUpgradeIds.value = []
  }

  function nextFloor(addToGoal: number) {
    floor.value.number++
    floor.value.goal += addToGoal
  }

  return {
    lives,
    floor,
    collectedUpgradeIds,
    isGameOver,
    activeUpgrades,
    loseLife,
    addLife,
    resetRun,
    nextFloor,
    addUpgrade,
    iniciarTabuleiro,
    tabuleiro
  }
})
