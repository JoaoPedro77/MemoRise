import { TIMER_BASE_SECONDS, TIMER_DECREASE_INTERVAL, TIMER_DECREASE_AMOUNT, TIMER_MIN_SECONDS, TIMER_BONUS_HOURGLASS, TIMER_START_FLOOR } from '~/constants/constantes'

export const getFloorTime = (floorNumber: number, collectedUpgrades: { id: string }[]) => {
  if (floorNumber < TIMER_START_FLOOR) return -1

  const baseTime = TIMER_BASE_SECONDS
  const deduction = Math.floor((floorNumber - TIMER_START_FLOOR) / TIMER_DECREASE_INTERVAL) * TIMER_DECREASE_AMOUNT
  let floorTime = Math.max(TIMER_MIN_SECONDS, baseTime - deduction)

  if (collectedUpgrades.some(cu => cu.id === '⌛')) {
    floorTime += TIMER_BONUS_HOURGLASS
  }

  return floorTime
}

export function processFloorStartEffects(
  activeIds: Set<string>,
  floorGoalModifier: { value: number },
  loseLife: () => void
) {
  if (activeIds.has('🎲') && Math.random() < 0.15) {
    floorGoalModifier.value++
  }

  if (activeIds.has('🪦')) {
    if (Math.random() < 0.30) floorGoalModifier.value++
    if (Math.random() < 0.10) loseLife()
  }
}

export function getPeekDuration(cardsLength: number): number {
  const totalAppearTime = (cardsLength - 1) * 100 + 500
  return totalAppearTime + 500
}

export function shouldRestoreLife(comboStreak: number, activeIds: Set<string>): boolean {
  return comboStreak === 3 && activeIds.has('💪')
}
