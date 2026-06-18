import { defineStore } from 'pinia'
import { generateMap, type MapNode, type MapConnection, NodeState, NodeType } from '~/utils/map-generator'

export const useMapStore = defineStore('map', () => {
  const nodes = ref<MapNode[]>([])
  const rows = ref(0)
  const connections = ref<MapConnection[]>([])
  const towerNumber = ref(1)
  const currentNodeId = ref<string | null>(null)
  const selectedPathIds = ref<Set<string>>(new Set())

  const currentNode = computed(() => nodes.value.find(n => n.id === currentNodeId.value))
  const availableNodes = computed(() => nodes.value.filter(n => n.state === NodeState.AVAILABLE))
  const visitedNodes = computed(() => nodes.value.filter(n => n.state === NodeState.VISITED))
  const bossNode = computed(() => nodes.value.find(n => n.type === NodeType.COMBAT_BOSS))
  const isBossDefeated = computed(() => bossNode.value?.state === NodeState.VISITED)
  const hasAvailableNodes = computed(() => availableNodes.value.length > 0)

  function initRun() {
    towerNumber.value = 1
    generateNewMap()
  }

  function generateNewMap() {
    const map = generateMap(towerNumber.value)
    nodes.value = map.nodes
    rows.value = map.rows
    connections.value = map.connections
    currentNodeId.value = null
    selectedPathIds.value = new Set()
  }

  function selectNode(nodeId: string) {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node || node.state !== NodeState.AVAILABLE) return

    for (const n of nodes.value) {
      if (n.row === node.row && n.id !== nodeId && n.state === NodeState.AVAILABLE) {
        n.state = NodeState.LOCKED
      }
    }

    selectedPathIds.value.add(nodeId)
    currentNodeId.value = nodeId
  }

  function completeCurrentNode() {
    if (!currentNodeId.value) return
    const node = nodes.value.find(n => n.id === currentNodeId.value)
    if (!node) return

    node.state = NodeState.VISITED

    for (const targetId of node.connections) {
      const target = nodes.value.find(n => n.id === targetId)
      if (target && target.state === NodeState.LOCKED) {
        target.state = NodeState.AVAILABLE
      }
    }

    currentNodeId.value = null
  }

  function startNextTower() {
    towerNumber.value++
    generateNewMap()
  }

  function getNode(id: string): MapNode | undefined {
    return nodes.value.find(n => n.id === id)
  }

  function isOnPath(nodeId: string): boolean {
    return selectedPathIds.value.has(nodeId)
  }

  function reset() {
    nodes.value = []
    rows.value = 0
    connections.value = []
    towerNumber.value = 1
    currentNodeId.value = null
    selectedPathIds.value = new Set()
  }

  return {
    nodes,
    rows,
    connections,
    towerNumber,
    currentNodeId,
    currentNode,
    availableNodes,
    visitedNodes,
    bossNode,
    isBossDefeated,
    hasAvailableNodes,
    initRun,
    generateNewMap,
    selectNode,
    completeCurrentNode,
    startNextTower,
    getNode,
    isOnPath,
    reset
  }
})
