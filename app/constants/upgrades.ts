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
    description: 'Se você morrer, acorda com 1 vida',
    floors: 3,
    type: 'perk'
  },
  {
    id: '📄',
    name: 'Amigo da Morte',
    icon: 'game-icons:reaper-scythe',
    description: 'Permite ver a mesma carta 2x sem perder vida',
    floors: 5,
    type: 'perk'
  },
  {
    id: '👁️',
    name: 'Visão do além',
    icon: 'game-icons:eyeball',
    description: 'todas as cartas aparecem desviradas no começo da partida',
    floors: 2,
    type: 'perk'
  },
  {
    id: '❤️',
    name: 'Pote de coração',
    icon: 'game-icons:heart-bottle',
    description: '+2 Vida',
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
    description: 'O timer só começa após você acertar o primeiro par',
    floors: 5,
    type: 'perk'
  },
  {
    id: '✂️',
    name: 'Corte de Custos',
    icon: 'game-icons:scissors',
    description: 'Próximo andar de batalha tem metade dos pares',
    floors: 1,
    type: 'perk'
  },
  {
    id: '💪',
    name: 'Memória Muscular',
    icon: 'game-icons:muscle-fat',
    description: 'Acertar um par de primeira recupera 1 vida. (Não o último par).',
    floors: 3,
    type: 'perk'
  },
  {
    id: '🎲',
    name: 'Sorte de principiante',
    icon: 'game-icons:dice-fire',
    description: 'tem 15% de chance de começar com -1 par',
    floors: 10,
    type: 'perk'
  },
  {
    id: '🛡️',
    name: 'Escudo Divino',
    icon: 'game-icons:shield',
    description: 'Uma vez por andar, o primeiro erro não custa vida',
    floors: 3,
    type: 'perk'
  },
  {
    id: '🔮',
    name: 'Premonição',
    icon: 'game-icons:crystal-ball',
    description: 'A primeira carta clicada revela outra aleatória por 800ms',
    floors: 2,
    type: 'perk'
  },
  {
    id: '🧠',
    name: 'Mente Aguçada',
    icon: 'game-icons:brain',
    description: '+1 par no objetivo. Mas a cada 3 pares sem erro, recupera 1 vida',
    floors: 3,
    type: 'perk'
  },
  {
    id: '🤝',
    name: 'Sorte Compartilhada',
    icon: 'game-icons:shaking-hands',
    description: 'Acertar 2 pares seguidos dá +10s no timer',
    floors: 3,
    type: 'perk'
  },
  {
    id: '🏃',
    name: 'Corrida',
    icon: 'game-icons:run',
    description: 'Timer pausa por 8s após cada par encontrado',
    floors: 3,
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
    id: '🦗',
    name: 'Silêncio',
    icon: 'game-icons:cricket',
    description: 'Timer começa com -45s',
    floors: 5,
    type: 'curse'
  },
  {
    id: '🌀',
    name: 'Caos',
    icon: 'game-icons:vortex',
    description: 'A cada 15s, cartas viradas são reembaralhadas',
    floors: 3,
    type: 'curse'
  },
  {
    id: '👻',
    name: 'Aparição',
    icon: 'game-icons:ghost',
    description: '20% de uma carta aleatória virar sozinha após sua jogada',
    floors: 4,
    type: 'curse'
  },
  {
    id: '🕳️',
    name: 'Esquecimento',
    icon: 'game-icons:hole',
    description: 'Errar 2 vezes seguidas desfaz um par já combinado',
    floors: 5,
    type: 'curse'
  },
  {
    id: '💤',
    name: 'Sono Pesado',
    icon: 'game-icons:sleepy',
    description: 'A primeira carta clicada no andar vira e desvira sem efeito',
    floors: 2,
    type: 'curse'
  },

  {
    id: '🔄',
    name: 'Renovação',
    icon: 'game-icons:rolling-energy',
    description: 'Recarrega todos os perks ativos para a duração máxima',
    type: 'perk'
  },

  // Itens
  {
    id: '🔑',
    name: 'Chave do andar',
    icon: 'game-icons:key-lock',
    description: 'Pula o andar de batalha atual como se tivesse vencido',
    floors: 1,
    type: 'item'
  },
  {
    id: '🔍',
    name: 'Lupa de Cristal',
    icon: 'game-icons:magnifying-glass',
    description: 'a proxima carta clicada revela ser par',
    floors: 1,
    type: 'item'
  },

  {
    id: '🧪',
    name: 'Poção da Loucura',
    icon: 'game-icons:potion-of-madness',
    description: 'Vira e desvira cartas aleatoriamente por um tempo',
    floors: 1,
    type: 'item'
  },
  {
    id: '🧲',
    name: 'Ímã',
    icon: 'game-icons:magnet',
    description: 'A par da carta clicada troca de lugar com uma carta vizinha',
    floors: 1,
    type: 'item'
  },
  {
    id: '⏳',
    name: 'Ampulheta Pequena',
    icon: 'game-icons:sands-of-time',
    description: '+30s no timer atual',
    floors: 1,
    type: 'item'
  },
  {
    id: '🪞',
    name: 'Escudo de Vidro',
    icon: 'game-icons:glass-heart',
    description: 'O próximo erro não custa vida (quebra depois)',
    floors: 1,
    type: 'item'
  },
  {
    id: '🔭',
    name: 'Telescópio',
    icon: 'game-icons:telescope',
    description: 'Revela 3 cartas aleatórias por 2s no início do combate',
    floors: 1,
    type: 'item'
  }
]
