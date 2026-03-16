import { defineStore } from 'pinia'
import { UPGRADES_POOL } from '~/constants/upgrades'
import { applyUpgradeEffect } from '~/utils/upgrade-effects'
import { gerarListaCartasMemoria } from '~/utils/game-logic'
import { bancoEmojis } from '~/utils/banco-emojis'
import { maxBoardSize, maxLives } from '~/constants/constantes'

export const useGameStore = defineStore('game', () => {
  const tabuleiro = ref<Card[]>([])

  const lives = ref(3)
  const floor = ref({ number: 1, goal: 22, time: -1 })
  const collectedUpgradeIds = ref<string[]>(['👀', '✂️', '⌚', '🎲', '🪦'])
  const isGameOver = ref(false)
  const pairsFoundInAndar = ref(0)

  const activeUpgrades = computed(() => {
    return collectedUpgradeIds.value.map(id =>
      UPGRADES_POOL.find(u => u.id === id)
    ).filter(Boolean)
  })

  function iniciarTabuleiro() {
    tabuleiro.value = gerarListaCartasMemoria(bancoEmojis, { totalPares: (floor.value.goal <= maxBoardSize) ? floor.value.goal : maxBoardSize, colunas: 4 })
  }

  function registerMatch() {
    pairsFoundInAndar.value++
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
    collectedUpgradeIds.value = []
    pairsFoundInAndar.value = 0
  }

  function nextFloor(addToGoal: number) {
    floor.value.number++
    floor.value.goal += addToGoal
    pairsFoundInAndar.value = 0
  }

  return {
    lives,
    floor,
    collectedUpgradeIds,
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
