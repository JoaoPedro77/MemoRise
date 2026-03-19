import { TIMER_BASE_SECONDS, TIMER_DECREASE_INTERVAL, TIMER_DECREASE_AMOUNT, TIMER_MIN_SECONDS, TIMER_BONUS_HOURGLASS, TIMER_START_FLOOR } from '~/constants/constantes'

export const applyUpgradeEffect = (upgradeId: string, state: { lives: Ref<number>, floor: Ref<{ number: number, goal: number }> }) => {
  switch (upgradeId) {
    case '❤️':
      state.lives.value++
      break
  }
}

export const getFloorTime = (floorNumber: number, collectedUpgrades: { id: string }[]) => {
  if (floorNumber < TIMER_START_FLOOR) return -1

  const baseTime = TIMER_BASE_SECONDS
  const deduction = Math.floor((floorNumber - TIMER_START_FLOOR) / TIMER_DECREASE_INTERVAL) * TIMER_DECREASE_AMOUNT
  let floorTime = Math.max(TIMER_MIN_SECONDS, baseTime - deduction)

  // Se tiver a Ampulheta ativa, adiciona bônus
  if (collectedUpgrades.some(cu => cu.id === '⌛')) {
    floorTime += TIMER_BONUS_HOURGLASS
  }

  return floorTime
}
