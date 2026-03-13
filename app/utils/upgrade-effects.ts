export const applyUpgradeEffect = (upgradeId: string, state: { lives: Ref<number>, floor: Ref<{ number: number, goal: number }> }) => {
  switch (upgradeId) {
    case 'extra-life':
      state.lives.value++
      break
    case 'tax-cut':
      state.floor.value.goal = Math.floor(state.floor.value.goal / 2)
      break
  }
}
