<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { useUpgradeStore } from '@/stores/upgrade'
import { useMapStore } from '@/stores/map'
import { NodeType } from '~/utils/map-generator'
import { UPGRADES_POOL, type Upgrade } from '~/constants/upgrades'
import {
  DURATION_DAMAGE_EFFECT,
  DURATION_SHAKE_EFFECT
} from '~/constants/constantes'

const gameStore = useGameStore()
const upgradeStore = useUpgradeStore()
const mapStore = useMapStore()
const { selectCard, tabuleiroLimpo, ganhouFase } = useCardGame()

const gamePhase = ref<'map' | 'combat'>('map')
const showTowerComplete = ref(false)
const showRestDialog = ref(false)
const showCurseDialog = ref(false)
const appliedCurse = ref<Upgrade | null>(null)

onMounted(() => {
  if (!gameStore.gameStarted) {
    gameStore.startNewGame()
  }
})

watch(tabuleiroLimpo, (limpo) => {
  if (limpo && !ganhouFase.value) {
    gameStore.iniciarTabuleiro()
    console.log('Nova leva de cartas! Continue!')
  }
})

const gridColsClass = computed(() => {
  const numCards = gameStore.tabuleiro.length
  const colsPC = Math.ceil(numCards / 4)

  let colsMobile = 'grid-cols-4'
  if (numCards <= 4) colsMobile = 'grid-cols-2'
  if (numCards <= 8) colsMobile = 'grid-cols-4'

  return {
    class: colsMobile,
    colsPC
  }
})

const showDamageEffect = ref(false)
const isShaking = ref(false)

watch(() => gameStore.lives, (newLives, oldLives) => {
  if (newLives < oldLives && newLives >= 0) {
    showDamageEffect.value = true
    isShaking.value = true

    setTimeout(() => {
      showDamageEffect.value = false
    }, DURATION_DAMAGE_EFFECT)

    setTimeout(() => {
      isShaking.value = false
    }, DURATION_SHAKE_EFFECT)
  }
})

watch(() => gameStore.gameStarted, (started) => {
  if (!started) {
    navigateTo('/')
  }
})

function startCombat(nodeId: string) {
  const node = mapStore.getNode(nodeId)
  if (!node) return

  if (!node.pairCount) {
    applyNonCombatNode(node)
    return
  }

  gameStore.startCombatFromNode(node.pairCount, nodeId)
  gamePhase.value = 'combat'
  gameStore.isInCombat = true
}

function applyNonCombatNode(node: { id: string, type: NodeType }) {
  switch (node.type) {
    case NodeType.REST:
      gameStore.addLife()
      showRestDialog.value = true
      break
    case NodeType.ARTIFACT:
      upgradeStore.gerarOpcoesUpgrade()
      break
    case NodeType.CURSE:
      applyRandomCurse()
      showCurseDialog.value = true
      break
    case NodeType.TREASURE:
      upgradeStore.gerarOpcoesUpgrade()
      break
  }
}

function closeRestDialog() {
  showRestDialog.value = false
  mapStore.completeCurrentNode()
  checkTowerAdvance()
}

function closeCurseDialog() {
  showCurseDialog.value = false
  mapStore.completeCurrentNode()
  checkTowerAdvance()
}

function restartGame() {
  gameStore.startNewGame()
  gamePhase.value = 'map'
  gameStore.isInCombat = false
  showTowerComplete.value = false
  showRestDialog.value = false
  showCurseDialog.value = false
  appliedCurse.value = null
}

function onActivateItem(instanceId: string) {
  const item = upgradeStore.activeUpgrades.find(u => u.instanceId === instanceId)
  if (!item) return

  if (item.id === '🔑') {
    const node = mapStore.currentNode
    if (node?.type === NodeType.COMBAT_BOSS) {
      const toast = useToast()
      toast.add({
        title: 'Não pode pular!',
        description: 'Você precisa enfrentar o chefe!',
        icon: 'i-lucide-ban',
        color: 'error',
        duration: 3000
      })
      return
    }
    upgradeStore.activateItem(instanceId)
    handleNodeCompletion()
    return
  }

  upgradeStore.activateItem(instanceId)
}

function handleNodeCompletion() {
  const node = mapStore.currentNode
  if (!node) return

  gameStore.stopTimer()
  gameStore.resetCombatSession()

  if (
    node.type === NodeType.COMBAT_SMALL
    || node.type === NodeType.COMBAT_MEDIUM
    || node.type === NodeType.COMBAT_BOSS
  ) {
    upgradeStore.decrementUpgradeDurations()
  }

  switch (node.type) {
    case NodeType.ARTIFACT: {
      upgradeStore.gerarOpcoesUpgrade()
      break
    }
    case NodeType.TREASURE: {
      upgradeStore.gerarOpcoesUpgrade()
      break
    }
    default: {
      mapStore.completeCurrentNode()
      gamePhase.value = 'map'
      gameStore.isInCombat = false
      checkTowerAdvance()
    }
  }
}

function checkTowerAdvance() {
  if (mapStore.isBossDefeated) {
    gameStore.updateBestFloor()
    showTowerComplete.value = true
  }
}

function advanceTower() {
  showTowerComplete.value = false
  mapStore.startNextTower()
  gamePhase.value = 'map'
  gameStore.isInCombat = false
}

function applyRandomCurse() {
  const curseIds = ['🪦', '💀']
  const id = curseIds[Math.floor(Math.random() * curseIds.length)]
  if (!id) return
  upgradeStore.addUpgrade(id)
  appliedCurse.value = UPGRADES_POOL.find(u => u.id === id) ?? null
}

watch(() => upgradeStore.opcoesUpgrade.length, (newLen, oldLen) => {
  if (oldLen > 0 && newLen === 0) {
    mapStore.completeCurrentNode()
    gamePhase.value = 'map'
    gameStore.isInCombat = false
    checkTowerAdvance()
  }
})

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    upgradeStore.deselectItem()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <main
    class="flex flex-col items-center min-h-screen pt-21 px-4 gap-2 overflow-y-auto relative"
    :class="{ 'shake-animation': isShaking }"
    @click="upgradeStore.deselectItem()"
  >
    <div
      class="fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 bg-error-500/30"
      :class="showDamageEffect ? 'opacity-100' : 'opacity-0'"
    />

    <template v-if="gamePhase === 'map'">
      <MapView @start-combat="startCombat" />
    </template>

    <template v-if="gamePhase === 'combat'">
      <aside
        v-if="upgradeStore.activeUpgrades.some(u => u?.type !== 'item')"
        class="flex flex-row md:flex-col items-center justify-start md:justify-center gap-3 p-3 bg-neutral-800/50 rounded-xl backdrop-blur-sm md:absolute md:left-4 md:top-25 overflow-x-auto max-w-full no-scrollbar"
      >
        <UTooltip
          v-for="up in upgradeStore.activeUpgrades.filter(u => u?.type !== 'item')"
          :key="up?.instanceId"
          :text="up?.description"
        >
          <div class="relative group">
            <UIcon
              :name="up?.icon"
              class="text-xl transition-transform hover:scale-110"
              :class="up?.type === 'curse' ? 'text-error-500' : 'text-secondary-400'"
            />
            <span
              v-if="up?.floorsLeft > 0"
              class="absolute font-fredoka -top-1 -right-1 flex items-center justify-center bg-neutral-900 border border-white/10 text-[8px] w-3.5 h-3.5 rounded-full text-white"
            >
              {{ up.floorsLeft }}
            </span>
          </div>
        </UTooltip>
      </aside>

      <TransitionGroup
        tag="section"
        move-class="card-move"
        class="grid gap-2 md:gap-3 max-w-7xl justify-items-center md:grid-cols-[repeat(var(--cols-pc),minmax(0,1fr))]"
        :class="gridColsClass.class"
        :style="{ '--cols-pc': gridColsClass.colsPC }"
      >
        <CartasJogo
          v-for="(card, j) in gameStore.tabuleiro"
          :key="card.id"
          :card="card"
          :index="j"
          @click="selectCard(card, $event)"
        />
      </TransitionGroup>

      <div
        v-if="upgradeStore.activeUpgrades.some(u => u?.type === 'item')"
        class="fixed -bottom-8 left-1/2 -translate-x-1/2 flex -space-x-8 sm:-space-x-10 items-end h-[200px] px-10 pb-0 pointer-events-none"
      >
        <ItemCard
          v-for="(up, i) in upgradeStore.activeUpgrades.filter(u => u?.type === 'item')"
          :key="up?.instanceId"
          :item="up"
          :index="i"
          :selected="upgradeStore.selectedItemInstanceId === up.instanceId"
          @click="upgradeStore.selectItem(up.instanceId)"
          @activate="onActivateItem(up.instanceId)"
        />
      </div>
    </template>

    <UModal
      :open="showRestDialog"
      prevent-close
    >
      <template #content>
        <div class="p-8 text-center flex flex-col items-center gap-6">
          <div class="space-y-2">
            <UIcon
              name="game-icons:campfire"
              class="text-5xl text-primary-400"
            />
            <h2 class="text-2xl font-black text-white">
              Descanso
            </h2>
            <p class="text-neutral-400">
              Você descansou ao redor da fogueira e recuperou suas energias.
            </p>
            <p class="text-lg font-bold text-green-400">
              ❤️ +1 Vida ({{ gameStore.lives }})
            </p>
          </div>

          <UButton
            label="Continuar"
            color="primary"
            variant="solid"
            size="lg"
            block
            @click="closeRestDialog"
          />
        </div>
      </template>
    </UModal>

    <UModal
      :open="showCurseDialog"
      prevent-close
    >
      <template #content>
        <div class="p-8 text-center flex flex-col items-center gap-6">
          <div class="space-y-2">
            <h2 class="text-2xl font-black text-white">
              Maldição!
            </h2>
            <p class="text-neutral-400">
              Você foi amaldiçoado por forças sombrias...
            </p>
          </div>

          <div v-if="appliedCurse">
            <CartaUpgrade
              :upgrade="appliedCurse"
              :index="0"
            />
          </div>

          <UButton
            label="Entendi"
            color="secondary"
            variant="solid"
            size="lg"
            block
            @click="closeCurseDialog"
          />
        </div>
      </template>
    </UModal>

    <UModal
      :open="upgradeStore.opcoesUpgrade.length > 0"
      prevent-close
      size="w-3xl"
    >
      <template #content>
        <div class="p-2 md:p-8 text-center flex flex-col items-center">
          <div class="space-y-1">
            <h2 class="text-4xl flex items-center justify-center gap-3 text-secondary-500 font-black italic">
              <UIcon name="game-icons:open-treasure-chest" />
              Relíquias
            </h2>
            <p class="text-neutral-400 text-sm font-medium">
              Escolha um artefato para prosseguir na sua jornada
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-0 sm:gap-2 w-full">
            <CartaUpgrade
              v-for="(up, i) in upgradeStore.opcoesUpgrade"
              :key="up?.id"
              :upgrade="up"
              :index="i"
              @click="upgradeStore.selecionarUpgrade(up)"
            />
          </div>

          <div class="w-full flex flex-col items-center gap-3 border-t border-white/5 pt-4">
            <UButton
              label="Pular Upgrade"
              icon="game-icons:card-discard"
              color="secondary"
              variant="solid"
              size="lg"
              class="font-bold w-full justify-center mb-2"
              @click="upgradeStore.pularUpgrade()"
            />
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      :open="gameStore.isGameOver"
      prevent-close
    >
      <template #content>
        <div class="p-8 text-center flex flex-col items-center gap-6">
          <h2 class="text-4xl flex items-center gap-3 text-error-500 font-black italic">
            <UIcon name="game-icons:broken-skull" />
            GAME OVER
          </h2>

          <p class="text-gray-400">
            Sua jornada terminou na Torre {{ mapStore.towerNumber }}.
            <span
              v-if="gameStore.bestFloor > 0"
              class="block mt-2 text-xs font-bold text-primary-500 uppercase tracking-widest"
            >
              Seu Recorde: Torre {{ gameStore.bestFloor }}
            </span>
          </p>

          <UButton
            icon="game-icons:anticlockwise-rotation"
            label="Tentar Novamente"
            color="primary"
            variant="solid"
            size="xl"
            block
            @click="restartGame"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="ganhouFase"
      prevent-close
    >
      <template #content>
        <div class="p-8 text-center flex flex-col items-center gap-6">
          <div class="space-y-1">
            <p class="text-sm uppercase tracking-widest text-primary-400 font-bold">
              Torre {{ mapStore.towerNumber }}
            </p>
            <h2 class="text-4xl flex items-center justify-center gap-2 text-white font-black">
              <UIcon
                name="game-icons:stone-tower"
                class="text-primary-500"
              />
              ANDAR CONCLUÍDO!
            </h2>
          </div>

          <UButton
            icon="game-icons:3d-stairs"
            label="Continuar Jornada"
            color="primary"
            variant="solid"
            size="xl"
            block
            @click="handleNodeCompletion"
          />
        </div>
      </template>
    </UModal>

    <UModal
      :open="showTowerComplete"
      prevent-close
    >
      <template #content>
        <div class="p-8 text-center flex flex-col items-center gap-6">
          <div class="space-y-1">
            <p class="text-sm uppercase tracking-widest text-primary-400 font-bold">
              Torre {{ mapStore.towerNumber }} Concluída!
            </p>
            <h2 class="text-4xl flex items-center justify-center gap-2 text-white font-black">
              <UIcon
                name="game-icons:stone-tower"
                class="text-primary-500"
              />
              TORRE CONQUISTADA!
            </h2>
            <p class="text-neutral-400 text-sm">
              Você derrotou o chefe! Prepare-se para a Torre {{ mapStore.towerNumber + 1 }}.
            </p>
          </div>

          <UButton
            icon="game-icons:3d-stairs"
            label="Próxima Torre"
            color="primary"
            variant="solid"
            size="xl"
            block
            @click="advanceTower"
          />
        </div>
      </template>
    </UModal>
  </main>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

.card-move {
  transition: transform 0.6s ease;
}
</style>
