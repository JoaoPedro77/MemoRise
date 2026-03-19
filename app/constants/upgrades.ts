export interface Upgrade {
  id: string
  name: string
  description: string
  icon: string
  floors?: number
  type: 'perk' | 'item' | 'curse'
}

export interface CollectedUpgrade {
  instanceId: string
  id: string
  floorsLeft: number
}

export const UPGRADES_POOL: Upgrade[] = [
  // Perks
  {
    id: '⌚',
    name: 'Relógio de bolso',
    icon: 'game-icons:pocket-watch',
    description: 'Clicar em uma carta já vista, não dá dano, mas perde 30 segundos.',
    floors: 2,
    type: 'perk'
  },
  {
    id: '🛏️',
    name: 'Sonho ruim',
    icon: 'game-icons:bed',
    description: 'Se você morrer, volta para o andar anterior com 1 vida',
    floors: 3,
    type: 'perk'
  },
  {
    id: '📄',
    name: 'Contrato com a Morte',
    icon: 'game-icons:reaper-scythe',
    description: 'Permite ver a mesma carta 2x sem perder vida',
    floors: 5,
    type: 'perk'
  },
  {
    id: '👁️',
    name: 'Visão do além',
    icon: 'game-icons:eyeball',
    description: 'todas as cartas aparecem vidas pra cima no começo da partida',
    floors: 2,
    type: 'perk'
  },
  {
    id: '❤️',
    name: 'Coração Extra',
    icon: 'game-icons:heart-bottle',
    description: '+1 Vida',
    type: 'perk'
  },

  {
    id: '👀',
    name: 'Visão Aguçada',
    icon: 'game-icons:beast-eye',
    description: 'Permite ver qual carta você já viu antes',
    floors: 3,
    type: 'perk'
  },
  {
    id: '⌛',
    name: 'Ampulheta',
    icon: 'game-icons:sands-of-time',
    description: 'Mais 1 min. para completar o andar',
    floors: 5,
    type: 'perk'
  },
  {
    id: '✂️',
    name: 'Corte de Custos',
    icon: 'game-icons:scissors',
    description: 'Próximo andar tem metade do objetivo',
    floors: 1,
    type: 'perk'
  },
  {
    id: '💪',
    name: 'Memória Muscular',
    icon: 'game-icons:muscle-fat',
    description: 'Se você acertar 3 pares seguidos, recupera 1 ponto de vida.',
    floors: 3,
    type: 'perk'
  },
  {
    id: '🎲',
    name: 'Sorte de principiante',
    icon: 'game-icons:dice-fire',
    description: 'tem 2% de chance de começar com -1 par',
    floors: 20,
    type: 'perk'
  },

  // Maldições
  {
    id: '🪦',
    name: 'Pacto maldito',
    icon: 'game-icons:skull-in-jar',
    description: '30% de chance: -1 par \n 10% de chance: -1 vida',
    floors: 5,
    type: 'curse'
  },
  {
    id: '💀',
    name: 'Pacto Da Morte',
    icon: 'game-icons:chewed-skull',
    description: '30% de chance: -4 par \n 50% de chance: -1 vida',
    floors: 5,
    type: 'curse'
  },

  // Itens
  {
    id: '🔍',
    name: 'Lupa de Cristal',
    icon: 'game-icons:magnifying-glass',
    description: 'Revela o par de uma carta clicada',
    floors: 1,
    type: 'item'
  },
  {
    id: '🔑',
    name: 'Chave do andar',
    icon: 'game-icons:key-lock',
    description: 'Pula para o próximo andar',
    floors: 1,
    type: 'item'
  },
  {
    id: '🧪',
    name: 'Poção da Loucura',
    icon: 'game-icons:potion-of-madness',
    description: 'Vira e desvira cartas aleatoriamente por 1 segundo',
    floors: 1,
    type: 'item'
  }

]
