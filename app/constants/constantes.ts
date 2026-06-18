// Limites e Configurações Iniciais
export const maxLives = 10
export const maxBoardSize = 10
export const INITIAL_LIVES = 3
export const INITIAL_GOAL = 4
export const MAX_ITEMS = 5

// Progressão
export const GOAL_INCREMENT_PER_FLOOR = 2
export const TIMER_START_FLOOR = 2
export const TIMER_DECREASE_INTERVAL = 5
export const TIMER_DECREASE_AMOUNT = 30
export const TIMER_BASE_SECONDS = 360
export const TIMER_MIN_SECONDS = 120
export const TIMER_BONUS_HOURGLASS = 60

// Mapa - Pares por Tipo de Nó (valores exatos)
export const PAIR_SMALL_VALUES = [4, 6] as const
export const PAIR_MEDIUM_VALUES = [8, 10] as const
export const PAIR_BOSS_VALUES = [12, 15] as const
export const TOWER_PAIR_INCREMENT = 1

// Mapa - Geração Procedural
export const MAP_MIN_ROWS = 6
export const MAP_MAX_ROWS = 8
export const MAP_START_ROW_NODES = 1
export const MAP_BOSS_ROW_NODES = 1
export const MAP_MIN_NODES_PER_ROW = 2
export const MAP_MAX_NODES_PER_ROW = 3

// Animações e Delays (ms)
export const DELAY_CHECK_MATCH = 500
export const DELAY_FLIP_BACK = 500
export const DURATION_DAMAGE_EFFECT = 150
export const DURATION_SHAKE_EFFECT = 500
