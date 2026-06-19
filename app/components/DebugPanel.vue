<script setup lang="ts">
import { UPGRADES_POOL } from '~/constants/upgrades'
import type { Card } from '~/utils/game-logic'

const gameStore = useGameStore()
const upgradeStore = useUpgradeStore()
const mapStore = useMapStore()

const showDebug = ref(false)
const activeTab = ref<'cards' | 'perks' | 'curses' | 'items' | 'state'>('cards')

function addUpgrade(id: string) {
  upgradeStore.addUpgrade(id)
}

function removeUpgrade(id: string) {
  upgradeStore.removeUpgrade(id)
}

function toggleCard(card: Card) {
  card.revelada = !card.revelada
}

function toggleMatched(card: Card) {
  card.combinada = !card.combinada
}

function shuffleBoard() {
  const nonMatched = gameStore.tabuleiro.map((c, i) => ({ c, i })).filter(x => !x.c.combinada)
  const shuffled = [...nonMatched.map(x => x.c)].sort(() => Math.random() - 0.5)
  nonMatched.forEach((entry, i) => {
    const card = shuffled[i]
    if (card) gameStore.tabuleiro[entry.i] = card
  })
}

function completeFloor() {
  gameStore.pairsFoundInAndar = gameStore.currentGoal
}

function triggerGameOver() {
  gameStore.handleDeath()
}
</script>

<template>
  <div>
    <UButton
      icon="i-lucide-bug"
      color="neutral"
      variant="solid"
      size="sm"
      class="fixed bottom-4 right-4 z-50 opacity-30 hover:opacity-100 hover:scale-110 transition-all"
      @click="showDebug = true"
    />

    <UModal v-model:open="showDebug">
      <template #content>
        <div class="p-6 space-y-4 max-h-[80vh] overflow-y-auto max-w-4xl">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-white">
              Debug Panel
            </h2>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="showDebug = false"
            />
          </div>

          <div class="flex gap-2 border-b border-neutral-700 pb-2">
            <UButton
              v-for="tab in ([
                { id: 'cards', label: 'Cartas' },
                { id: 'perks', label: 'Perks' },
                { id: 'curses', label: 'Maldições' },
                { id: 'items', label: 'Itens' },
                { id: 'state', label: 'Estado' }
              ] as const)"
              :key="tab.id"
              :label="tab.label"
              :color="activeTab === tab.id ? 'primary' : 'neutral'"
              variant="solid"
              size="sm"
              @click="activeTab = tab.id"
            />
          </div>

          <!-- CARTAS -->
          <div
            v-if="activeTab === 'cards'"
            class="space-y-2"
          >
            <div class="flex items-center gap-2 text-sm text-neutral-400">
              <span>{{ gameStore.tabuleiro.length }} cartas</span>
              <span>|</span>
              <span>{{ gameStore.pairsFoundInAndar }}/{{ gameStore.currentGoal }} pares</span>
              <span>|</span>
              <span>Timer: {{ gameStore.timeRemaining }}</span>
              <UButton
                label="Embaralhar"
                color="warning"
                variant="solid"
                size="xs"
                @click="shuffleBoard"
              />
            </div>
            <div class="grid grid-cols-5 sm:grid-cols-8 gap-1.5">
              <div
                v-for="(card, i) in gameStore.tabuleiro"
                :key="card.id"
                class="flex flex-col items-center gap-0.5 p-1 rounded-lg text-xs"
                :class="card.combinada ? 'bg-green-900/30 ring-1 ring-green-500/30' : card.revelada ? 'bg-blue-900/30 ring-1 ring-blue-500/30' : 'bg-neutral-800/50'"
              >
                <span class="font-emoji text-xl">{{ card.valor }}</span>
                <span class="text-neutral-500 text-[10px]">#{{ i }}</span>
                <div class="flex gap-1">
                  <span
                    class="text-[8px]"
                    :class="card.revelada ? 'text-blue-400' : 'text-neutral-600'"
                  >R</span>
                  <span
                    class="text-[8px]"
                    :class="card.combinada ? 'text-green-400' : 'text-neutral-600'"
                  >C</span>
                  <span
                    class="text-[8px]"
                    :class="card.jaViu ? 'text-yellow-400' : 'text-neutral-600'"
                  >V</span>
                </div>
                <div class="flex gap-1">
                  <UButton
                    label="R"
                    color="neutral"
                    variant="solid"
                    size="xs"
                    @click="toggleCard(card)"
                  />
                  <UButton
                    label="M"
                    color="neutral"
                    variant="solid"
                    size="xs"
                    @click="toggleMatched(card)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- PERKS -->
          <div
            v-if="activeTab === 'perks'"
            class="flex flex-wrap justify-center gap-4 w-full"
          >
            <div
              v-for="(up, i) in UPGRADES_POOL.filter(u => u.type === 'perk')"
              :key="up.id"
              class="relative"
              :class="{ 'ring-2 ring-secondary-500 rounded-xl': upgradeStore.hasActiveUpgrade(up.id) }"
            >
              <CartaUpgrade
                :upgrade="up"
                :index="i"
              />
              <div class="absolute top-2 right-2 z-10 flex flex-col gap-1">
                <UButton
                  v-if="!upgradeStore.hasActiveUpgrade(up.id)"
                  icon="i-lucide-plus"
                  color="primary"
                  variant="solid"
                  size="xs"
                  @click="addUpgrade(up.id)"
                />
                <UButton
                  v-if="upgradeStore.hasActiveUpgrade(up.id)"
                  icon="i-lucide-minus"
                  color="error"
                  variant="solid"
                  size="xs"
                  @click="removeUpgrade(up.id)"
                />
              </div>
            </div>
          </div>

          <!-- MALDIÇÕES -->
          <div
            v-if="activeTab === 'curses'"
            class="flex flex-wrap justify-center gap-4 w-full"
          >
            <div
              v-for="(up, i) in UPGRADES_POOL.filter(u => u.type === 'curse')"
              :key="up.id"
              class="relative"
              :class="{ 'ring-2 ring-error-500 rounded-xl': upgradeStore.hasActiveUpgrade(up.id) }"
            >
              <CartaUpgrade
                :upgrade="up"
                :index="i"
              />
              <div class="absolute top-2 right-2 z-10 flex flex-col gap-1">
                <UButton
                  v-if="!upgradeStore.hasActiveUpgrade(up.id)"
                  icon="i-lucide-plus"
                  color="primary"
                  variant="solid"
                  size="xs"
                  @click="addUpgrade(up.id)"
                />
                <UButton
                  v-if="upgradeStore.hasActiveUpgrade(up.id)"
                  icon="i-lucide-minus"
                  color="error"
                  variant="solid"
                  size="xs"
                  @click="removeUpgrade(up.id)"
                />
              </div>
            </div>
          </div>

          <!-- ITENS -->
          <div
            v-if="activeTab === 'items'"
            class="flex flex-wrap justify-center gap-4 w-full"
          >
            <div
              v-for="(up, i) in UPGRADES_POOL.filter(u => u.type === 'item')"
              :key="up.id"
              class="relative"
              :class="{ 'ring-2 ring-pink-500 rounded-xl': upgradeStore.hasActiveUpgrade(up.id) }"
            >
              <CartaUpgrade
                :upgrade="up"
                :index="i"
              />
              <div class="absolute top-2 right-2 z-10 flex flex-col gap-1">
                <UButton
                  v-if="!upgradeStore.hasActiveUpgrade(up.id)"
                  icon="i-lucide-plus"
                  color="primary"
                  variant="solid"
                  size="xs"
                  @click="addUpgrade(up.id)"
                />
                <UButton
                  v-if="upgradeStore.hasActiveUpgrade(up.id)"
                  icon="i-lucide-minus"
                  color="error"
                  variant="solid"
                  size="xs"
                  @click="removeUpgrade(up.id)"
                />
              </div>
            </div>
          </div>

          <!-- ESTADO -->
          <div
            v-if="activeTab === 'state'"
            class="space-y-4"
          >
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="flex flex-col gap-1 p-3 rounded-lg bg-neutral-800/50">
                <span class="text-[10px] uppercase tracking-widest text-neutral-500">Vidas</span>
                <span class="text-2xl font-bold text-rose-400">{{ gameStore.lives }}</span>
                <div class="flex gap-1 mt-1">
                  <UButton
                    label="+1"
                    color="primary"
                    variant="solid"
                    size="xs"
                    @click="gameStore.addLife()"
                  />
                  <UButton
                    label="-1"
                    color="error"
                    variant="solid"
                    size="xs"
                    @click="gameStore.loseLife()"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1 p-3 rounded-lg bg-neutral-800/50">
                <span class="text-[10px] uppercase tracking-widest text-neutral-500">Timer</span>
                <span class="text-2xl font-bold text-primary-400">{{ gameStore.timeRemaining === -1 ? '∞' : gameStore.timeRemaining + 's' }}</span>
                <div class="flex gap-1 mt-1">
                  <UButton
                    label="+30"
                    color="primary"
                    variant="solid"
                    size="xs"
                    @click="gameStore.addTime(30)"
                  />
                  <UButton
                    label="-30"
                    color="warning"
                    variant="solid"
                    size="xs"
                    @click="gameStore.subtractTime(30, 0, 0)"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1 p-3 rounded-lg bg-neutral-800/50">
                <span class="text-[10px] uppercase tracking-widest text-neutral-500">Torre</span>
                <span class="text-2xl font-bold text-secondary-400">{{ mapStore.towerNumber }}</span>
                <div class="flex gap-1 mt-1">
                  <UButton
                    label="+1"
                    color="primary"
                    variant="solid"
                    size="xs"
                    @click="mapStore.startNextTower()"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1 p-3 rounded-lg bg-neutral-800/50">
                <span class="text-[10px] uppercase tracking-widest text-neutral-500">Pares</span>
                <span class="text-2xl font-bold text-white">{{ gameStore.pairsFoundInAndar }}/{{ gameStore.currentGoal }}</span>
                <div class="flex gap-1 mt-1">
                  <UButton
                    label="+1"
                    color="primary"
                    variant="solid"
                    size="xs"
                    @click="gameStore.pairsFoundInAndar++"
                  />
                  <UButton
                    label="Completar"
                    color="success"
                    variant="solid"
                    size="xs"
                    @click="completeFloor"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                label="Reset Game"
                color="warning"
                variant="solid"
                size="sm"
                @click="gameStore.resetRun()"
              />
              <UButton
                label="Game Over"
                color="error"
                variant="solid"
                size="sm"
                @click="triggerGameOver"
              />
              <UButton
                label="Nova Fase"
                color="primary"
                variant="solid"
                size="sm"
                @click="gameStore.iniciarTabuleiro()"
              />
              <UButton
                label="Limpar Upgrades"
                color="neutral"
                variant="solid"
                size="sm"
                @click="upgradeStore.clearUpgrades()"
              />
              <UButton
                label="Gerar Opções"
                color="secondary"
                variant="solid"
                size="sm"
                @click="upgradeStore.gerarOpcoesUpgrade()"
              />
            </div>

            <div class="p-3 rounded-lg bg-neutral-800/50 space-y-1">
              <span class="text-[10px] uppercase tracking-widest text-neutral-500">Upgrades Ativos</span>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="up in upgradeStore.activeUpgrades"
                  :key="up.instanceId"
                  class="text-xs px-2 py-0.5 rounded-full"
                  :class="up.type === 'perk' ? 'bg-secondary-900/50 text-secondary-300' : up.type === 'curse' ? 'bg-error-900/50 text-error-300' : 'bg-pink-900/50 text-pink-300'"
                >
                  {{ up.id }} ({{ up.floorsLeft }})
                </span>
                <span
                  v-if="upgradeStore.activeUpgrades.length === 0"
                  class="text-xs text-neutral-500"
                >Nenhum</span>
              </div>
            </div>

            <div class="p-3 rounded-lg bg-neutral-800/50 space-y-1">
              <span class="text-[10px] uppercase tracking-widest text-neutral-500">Flags</span>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
                <span>isInCombat: {{ gameStore.isInCombat }}</span>
                <span>isGameOver: {{ gameStore.isGameOver }}</span>
                <span>comboStreak: {{ gameStore.comboStreak }}</span>
                <span>chaosShuffling: {{ gameStore.chaosShufflingInProgress }}</span>
                <span>isTurnInProgress: {{ gameStore.isTurnInProgress }}</span>
                <span>errosConsecutivos: {{ gameStore.errosConsecutivos }}</span>
                <span>primeiroCliqueFeito: {{ gameStore.primeiroCliqueFeito }}</span>
                <span>escudoVidroAtivo: {{ gameStore.escudoVidroAtivo }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
