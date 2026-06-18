import {
  PAIR_SMALL_VALUES,
  PAIR_MEDIUM_VALUES,
  PAIR_BOSS_VALUES,
  TOWER_PAIR_INCREMENT,
  MAP_MIN_ROWS,
  MAP_MAX_ROWS,
  MAP_START_ROW_NODES,
  MAP_BOSS_ROW_NODES,
  MAP_MIN_NODES_PER_ROW,
  MAP_MAX_NODES_PER_ROW
} from '~/constants/constantes'

export enum NodeType {
  COMBAT_SMALL = 'combat_small',
  COMBAT_MEDIUM = 'combat_medium',
  COMBAT_BOSS = 'combat_boss',
  REST = 'rest',
  ARTIFACT = 'artifact',
  CURSE = 'curse',
  TREASURE = 'treasure'
}

export enum NodeState {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  VISITED = 'visited'
}

export interface MapNode {
  id: string
  type: NodeType
  row: number
  col: number
  state: NodeState
  connections: string[]
  pairCount?: number
  icon: string
  label: string
}

export interface MapConnection {
  from: string
  to: string
}

export interface MapData {
  nodes: MapNode[]
  rows: number
  connections: MapConnection[]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = a[i]!
    a[i] = a[j]!
    a[j] = temp
  }
  return a
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pickWeighted<T>(items: { type: T, weight: number }[]): T {
  const total = items.reduce((s, item) => s + item.weight, 0)
  let r = Math.random() * total
  for (const item of items) {
    r -= item.weight
    if (r <= 0) return item.type
  }
  return items[items.length - 1]!.type
}

function getNodeIcon(type: NodeType): string {
  switch (type) {
    case NodeType.COMBAT_SMALL: return 'game-icons:crossed-swords'
    case NodeType.COMBAT_MEDIUM: return 'game-icons:dripping-sword'
    case NodeType.COMBAT_BOSS: return 'game-icons:dragon-head'
    case NodeType.REST: return 'game-icons:campfire'
    case NodeType.ARTIFACT: return 'game-icons:open-treasure-chest'
    case NodeType.CURSE: return 'game-icons:cursed-star'
    case NodeType.TREASURE: return 'game-icons:swap-bag'
  }
}

function getNodeLabel(type: NodeType): string {
  switch (type) {
    case NodeType.COMBAT_SMALL:
    case NodeType.COMBAT_MEDIUM:
    case NodeType.COMBAT_BOSS: return 'Batalha'
    case NodeType.REST: return 'Descanso'
    case NodeType.ARTIFACT: return 'Artefato'
    case NodeType.CURSE: return 'Maldição'
    case NodeType.TREASURE: return 'Tesouro'
  }
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function getPairCount(type: NodeType, towerNumber: number): number | undefined {
  const values = (() => {
    switch (type) {
      case NodeType.COMBAT_SMALL: return PAIR_SMALL_VALUES
      case NodeType.COMBAT_MEDIUM: return PAIR_MEDIUM_VALUES
      case NodeType.COMBAT_BOSS: return PAIR_BOSS_VALUES
      default: return undefined
    }
  })()

  if (values === undefined) return undefined

  const towerBonus = (towerNumber - 1) * TOWER_PAIR_INCREMENT
  return pickRandom(values) + towerBonus
}

const MIDDLE_ROW_WEIGHTS: { type: NodeType, weight: number }[] = [
  { type: NodeType.COMBAT_SMALL, weight: 35 },
  { type: NodeType.COMBAT_MEDIUM, weight: 20 },
  { type: NodeType.REST, weight: 12 },
  { type: NodeType.ARTIFACT, weight: 12 },
  { type: NodeType.CURSE, weight: 10 },
  { type: NodeType.TREASURE, weight: 11 }
]

const FIRST_ROW_WEIGHTS: { type: NodeType, weight: number }[] = [
  { type: NodeType.COMBAT_SMALL, weight: 80 },
  { type: NodeType.REST, weight: 10 },
  { type: NodeType.ARTIFACT, weight: 10 }
]

export function generateMap(towerNumber: number): MapData {
  const rows = randomInt(MAP_MIN_ROWS, MAP_MAX_ROWS)
  const nodesPerRow: number[] = []

  nodesPerRow.push(MAP_START_ROW_NODES)

  for (let r = 1; r < rows - 1; r++) {
    nodesPerRow.push(randomInt(MAP_MIN_NODES_PER_ROW, MAP_MAX_NODES_PER_ROW))
  }

  nodesPerRow.push(MAP_BOSS_ROW_NODES)

  const allNodes: MapNode[] = []
  const idMap = new Map<string, MapNode>()

  for (let row = 0; row < rows; row++) {
    const count = nodesPerRow[row]

    for (let col = 0; col < count!; col++) {
      let type: NodeType

      if (row === 0) {
        type = NodeType.COMBAT_SMALL
      } else if (row === rows - 1) {
        type = NodeType.COMBAT_BOSS
      } else if (row === 1) {
        type = pickWeighted(FIRST_ROW_WEIGHTS)
      } else {
        type = pickWeighted(MIDDLE_ROW_WEIGHTS)
      }

      const id = `${row}-${col}`
      const node: MapNode = {
        id,
        type,
        row,
        col,
        state: row === 0 ? NodeState.AVAILABLE : NodeState.LOCKED,
        connections: [],
        pairCount: getPairCount(type, towerNumber),
        icon: getNodeIcon(type),
        label: getNodeLabel(type)
      }

      allNodes.push(node)
      idMap.set(id, node)
    }
  }

  for (let row = 0; row < rows - 1; row++) {
    const currentRow = allNodes.filter(n => n.row === row)
    const nextRow = allNodes.filter(n => n.row === row + 1)

    const shuffledCurrent = shuffle(currentRow)
    const shuffledNext = shuffle(nextRow)

    for (const nextNode of shuffledNext) {
      const from = shuffledCurrent[Math.floor(Math.random() * shuffledCurrent.length)]
      if (from && !from.connections.includes(nextNode.id)) {
        from.connections.push(nextNode.id)
      }
    }

    for (const currentNode of shuffledCurrent) {
      const remaining = shuffledNext.filter(n => !currentNode.connections.includes(n.id))
      const extraCount = Math.min(
        randomInt(0, Math.min(2, nextRow.length - 1)),
        remaining.length
      )

      for (let i = 0; i < extraCount; i++) {
        const target = remaining[i]
        if (target) currentNode.connections.push(target.id)
      }
    }
  }

  // Garantir que todo nó tenha caminho até o chefe
  const safe = new Set<string>()
  const bossNodes = allNodes.filter(n => n.row === rows - 1)
  for (const n of bossNodes) safe.add(n.id)

  for (let row = rows - 2; row >= 0; row--) {
    const currentRow = allNodes.filter(n => n.row === row)
    const nextRow = allNodes.filter(n => n.row === row + 1)

    for (const node of currentRow) {
      const hasSafeConnection = node.connections.some(id => safe.has(id))
      if (!hasSafeConnection) {
        const safeTargets = nextRow.filter(n => safe.has(n.id))
        const pick = safeTargets[Math.floor(Math.random() * safeTargets.length)]
        if (pick) node.connections.push(pick.id)
      }
    }

    for (const n of currentRow) safe.add(n.id)
  }

  const connections: MapConnection[] = []
  for (const node of allNodes) {
    for (const targetId of node.connections) {
      connections.push({ from: node.id, to: targetId })
    }
  }

  return { nodes: allNodes, rows, connections }
}

export function getNodeNeighbors(nodeId: string, nodes: MapNode[]): MapNode[] {
  const node = nodes.find(n => n.id === nodeId)
  if (!node) return []
  return node.connections
    .map(id => nodes.find(n => n.id === id))
    .filter((n): n is MapNode => n !== undefined)
}

export function findAvailableNodes(nodes: MapNode[]): MapNode[] {
  return nodes.filter(n => n.state === NodeState.AVAILABLE)
}

export function canReachBoss(nodes: MapNode[]): boolean {
  const boss = nodes.find(n => n.type === NodeType.COMBAT_BOSS)
  if (!boss) return false

  const visited = new Set<string>()
  const queue: string[] = []

  const startNodes = nodes.filter(n => n.state === NodeState.AVAILABLE || n.state === NodeState.VISITED)
  for (const n of startNodes) {
    queue.push(n.id)
    visited.add(n.id)
  }

  while (queue.length > 0) {
    const current = queue.shift()!
    const node = nodes.find(n => n.id === current)
    if (!node) continue

    if (node.id === boss.id) return true

    for (const connId of node.connections) {
      if (!visited.has(connId)) {
        visited.add(connId)
        queue.push(connId)
      }
    }
  }

  return false
}
