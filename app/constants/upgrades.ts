export interface Upgrade {
  id: string
  name: string
  description: string
  icon: string
  type: 'perk' | 'item'
}

export const UPGRADES_POOL: Upgrade[] = [
  {
    id: 'extra-life',
    name: 'Coração de Pixel',
    icon: 'pixel:heart-solid',
    description: '+1 Vida Máxima',
    type: 'perk'
  },
  {
    id: 'peek-master',
    name: 'Memória Curta',
    icon: 'lucide:eye',
    description: 'Permite ver a mesma carta 2x sem perder vida',
    type: 'perk'
  },
  {
    id: 'crystal-lens',
    name: 'Lupa de Cristal',
    icon: 'lucide:search',
    description: 'Revela o par de uma carta clicada (1x por andar)',
    type: 'item'
  },
  {
    id: 'hourglass',
    name: 'Ampulheta',
    icon: 'lucide:hourglass',
    description: 'Mais tempo para completar o andar',
    type: 'perk'
  },
  {
    id: 'tax-cut',
    name: 'Corte de Custos',
    icon: 'lucide:scissors',
    description: 'Próximo andar tem metade do objetivo',
    type: 'perk'
  }
]
