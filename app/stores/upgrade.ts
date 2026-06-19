import { defineStore } from 'pinia'
import { UPGRADES_POOL, type Upgrade, type CollectedUpgrade } from '~/constants/upgrades'
import { MAX_ITEMS } from '~/constants/constantes'

export const useUpgradeStore = defineStore('upgrade', () => {
  const collectedUpgrades = ref<CollectedUpgrade[]>([])
  const opcoesUpgrade = ref<Upgrade[]>([])
  const selectedItemInstanceId = ref<string | null>(null)
  const isLupaActive = ref(false)

  const activeUpgrades = computed(() => {
    return collectedUpgrades.value.map((cu) => {
      const metadata = UPGRADES_POOL.find(u => u.id === cu.id)
      return metadata ? { ...metadata, floorsLeft: cu.floorsLeft, instanceId: cu.instanceId } : null
    }).filter(Boolean) as (Upgrade & { floorsLeft: number, instanceId: string })[]
  })

  const activeUpgradeIds = computed(() => new Set(activeUpgrades.value.map(u => u.id)))

  function hasActiveUpgrade(id: string): boolean {
    return collectedUpgrades.value.some(up => up.id === id)
  }

  function addUpgrade(id: string) {
    const upgrade = UPGRADES_POOL.find(u => u.id === id)
    if (!upgrade) return

    if (id === '❤️') {
      const gameStore = useGameStore()
      gameStore.lives++
      return
    }

    if (id === '🔄') {
      collectedUpgrades.value.forEach((cu) => {
        const original = UPGRADES_POOL.find(u => u.id === cu.id)
        if (original?.floors && original.type !== 'item' && original.type !== 'curse') {
          cu.floorsLeft = original.floors
        }
      })
      return
    }

    const isItem = upgrade.type === 'item'

    if (isItem) {
      collectedUpgrades.value.push({
        instanceId: `inst-${Date.now()}-${Math.random()}`,
        id,
        floorsLeft: upgrade.floors ?? -1
      })
    } else {
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
  }

  function selecionarUpgrade(upgrade: Upgrade) {
    if (upgrade.type === 'item') {
      const currentItems = activeUpgrades.value.filter(up => up.type === 'item').length
      if (currentItems >= MAX_ITEMS) {
        const toast = useToast()
        toast.add({
          id: 'toast',
          title: 'Ação Bloqueada',
          description: `Você já tem ${MAX_ITEMS} itens e esse é o máximo!`,
          icon: 'i-lucide-triangle-alert',
          color: 'error',
          duration: 3000
        })
        return
      }
    }
    addUpgrade(upgrade.id)
    opcoesUpgrade.value = []
  }

  function pularUpgrade() {
    opcoesUpgrade.value = []
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
    const gameStore = useGameStore()

    if (gameStore.isTurnInProgress) {
      const toast = useToast()
      toast.add({
        id: 'toast',
        title: 'Ação Bloqueada',
        description: 'Termine sua jogada antes de usar um item!',
        icon: 'i-lucide-triangle-alert',
        color: 'error',
        duration: 3000
      })
      return
    }

    const item = activeUpgrades.value.find(up => up.instanceId === instanceId)
    if (!item) return

    switch (item.id) {
      case '🔍':
        isLupaActive.value = true
        break
      case '🔑':
        break
      case '🧪':
        triggerMadnessEffect()
        break
    }

    collectedUpgrades.value = collectedUpgrades.value.filter(up => up.instanceId !== instanceId)
    selectedItemInstanceId.value = null
  }

  function triggerMadnessEffect() {
    const interval = setInterval(() => {
      const gameStore = useGameStore()
      const card = gameStore.tabuleiro[Math.floor(Math.random() * gameStore.tabuleiro.length)]
      if (card && !card.combinada) {
        card.revelada = !card.revelada
      }
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      const gameStore = useGameStore()
      gameStore.tabuleiro.forEach((card) => {
        if (!card.combinada) card.revelada = false
      })
    }, 1500)
  }

  function removeUpgrade(id: string) {
    collectedUpgrades.value = collectedUpgrades.value.filter(up => up.id !== id)
  }

  function decrementUpgradeDurations() {
    collectedUpgrades.value = collectedUpgrades.value
      .map((up) => {
        const metadata = UPGRADES_POOL.find(u => u.id === up.id)
        const isItem = metadata?.type === 'item'
        if (isItem) return up
        return {
          ...up,
          floorsLeft: up.floorsLeft === -1 ? -1 : up.floorsLeft - 1
        }
      })
      .filter(up => up.floorsLeft !== 0)
  }

  function gerarOpcoesUpgrade() {
    opcoesUpgrade.value = [...UPGRADES_POOL]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
  }

  function clearUpgrades() {
    collectedUpgrades.value = []
    opcoesUpgrade.value = []
    selectedItemInstanceId.value = null
    isLupaActive.value = false
  }

  function clearSelection() {
    selectedItemInstanceId.value = null
    isLupaActive.value = false
  }

  function triggerTestUpgrade() {
    const perk = UPGRADES_POOL.find(u => u.type === 'perk')
    const item = UPGRADES_POOL.find(u => u.type === 'item')
    const curse = UPGRADES_POOL.find(u => u.type === 'curse')
    opcoesUpgrade.value = [perk, curse, item].filter(Boolean) as Upgrade[]
  }

  return {
    collectedUpgrades,
    opcoesUpgrade,
    selectedItemInstanceId,
    isLupaActive,
    activeUpgrades,
    activeUpgradeIds,
    hasActiveUpgrade,
    selecionarUpgrade,
    pularUpgrade,
    addUpgrade,
    selectItem,
    deselectItem,
    activateItem,
    triggerMadnessEffect,
    removeUpgrade,
    decrementUpgradeDurations,
    gerarOpcoesUpgrade,
    clearUpgrades,
    clearSelection,
    triggerTestUpgrade
  }
})
