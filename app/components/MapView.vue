<script setup lang="ts">
import type { MapNode } from '~/utils/map-generator'

const mapStore = useMapStore()

const ROW_HEIGHT = 90
const NODE_SIZE = 36
const SVG_PADDING = 10
const NODE_GAP = 20

const containerRef = ref<HTMLElement | null>(null)

const groupedNodes = computed(() => {
  const groups: MapNode[][] = []
  for (let r = 0; r < mapStore.rows; r++) {
    groups.push(mapStore.nodes.filter(n => n.row === r))
  }
  return groups
})

const containerWidth = ref(320)

function updateWidth() {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
  }
}

onMounted(() => {
  updateWidth()
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})

interface NodePos {
  id: string
  centerX: number
  centerY: number
  left: number
  top: number
}

const nodePositions = computed(() => {
  const positions: NodePos[] = []
  const w = Math.max(containerWidth.value, 320)

  for (const node of mapStore.nodes) {
    const rowNodes = groupedNodes.value[node.row]
    if (!rowNodes) continue
    const totalWidth = w - NODE_GAP * 2
    const spacing = totalWidth / (rowNodes.length + 1)
    const centerX = NODE_GAP + spacing * (node.col + 1)
    const centerY = node.row * ROW_HEIGHT + ROW_HEIGHT / 2 + SVG_PADDING
    positions.push({
      id: node.id,
      centerX,
      centerY,
      left: centerX - NODE_SIZE / 2,
      top: centerY - NODE_SIZE / 2
    })
  }
  return positions
})

const nodePosMap = computed(() => {
  const map = new Map<string, NodePos>()
  for (const pos of nodePositions.value) {
    map.set(pos.id, pos)
  }
  return map
})

const svgWidth = computed(() => Math.max(containerWidth.value, 320))
const svgHeight = computed(() => mapStore.rows * ROW_HEIGHT + SVG_PADDING * 2)

interface ConnectionPath {
  d: string
  isActive: boolean
}

const connectionPaths = computed(() => {
  const paths: ConnectionPath[] = []

  for (const conn of mapStore.connections) {
    const from = nodePosMap.value.get(conn.from)
    const to = nodePosMap.value.get(conn.to)
    if (!from || !to) continue

    const startX = from.centerX
    const startY = from.centerY + NODE_SIZE / 2
    const endX = to.centerX
    const endY = to.centerY - NODE_SIZE / 2
    const midY = (startY + endY) / 2

    const d = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`
    const isActive = mapStore.isOnPath(conn.from) && mapStore.isOnPath(conn.to)
    paths.push({ d, isActive })
  }

  return paths
})

function handleNodeSelect(nodeId: string) {
  mapStore.selectNode(nodeId)
}

const emit = defineEmits<{
  startCombat: [nodeId: string]
}>()

watch(() => mapStore.currentNodeId, (nodeId) => {
  if (nodeId) {
    emit('startCombat', nodeId)
  }
})
</script>

<template>
  <div class="w-full max-w-md mx-auto">
    <div class="text-center mb-6">
      <p class="text-xs uppercase tracking-widest text-neutral-400 font-bold">
        Torre {{ mapStore.towerNumber }}
      </p>
      <p class="text-lg font-black text-primary-400">
        Mapa da Jornada
      </p>
    </div>

    <div
      ref="containerRef"
      class="relative mx-auto"
      :style="{ height: `${svgHeight}px` }"
    >
      <svg
        :width="svgWidth"
        :height="svgHeight"
        class="absolute inset-0 pointer-events-none z-0"
      >
        <path
          v-for="(line, i) in connectionPaths"
          :key="i"
          :d="line.d"
          fill="none"
          :stroke="line.isActive ? 'rgb(96, 165, 250)' : 'rgb(64, 64, 64)'"
          :stroke-width="line.isActive ? 3 : 2"
          stroke-linecap="round"
        />
      </svg>

      <div
        v-for="pos in nodePositions"
        :key="pos.id"
        class="absolute z-10"
        :style="{ left: `${pos.left}px`, top: `${pos.top}px` }"
      >
        <MapNode
          :node="mapStore.getNode(pos.id)!"
          :is-on-path="mapStore.isOnPath(pos.id)"
          @select="handleNodeSelect"
        />
      </div>
    </div>
  </div>
</template>
