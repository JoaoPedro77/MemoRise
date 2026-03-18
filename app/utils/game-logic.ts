export interface Card {
  id: number | string
  valor: string
  revelada: boolean
  combinada: boolean
  jaViu: boolean
  usouSegundaChance?: boolean
}

export function gerarListaCartasMemoria(banco: string[], totalPares: number): Card[] {
  if (totalPares > banco.length) {
    throw new Error(`Banco de dados insuficiente. Você pediu ${totalPares} pares, mas só temos ${banco.length} emojis.`)
  }

  const emojisSelecionados = [...banco]
    .sort(() => Math.random() - 0.5)
    .slice(0, totalPares)

  const boardId = Math.random().toString(36).substring(2, 9)
  const listaPlana: Card[] = [...emojisSelecionados, ...emojisSelecionados].map((emoji, index) => ({
    id: `${boardId}-${index}`,
    valor: emoji,
    revelada: false,
    combinada: false,
    jaViu: false,
    usouSegundaChance: false
  }))

  for (let i = listaPlana.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = listaPlana[i]
    listaPlana[i] = listaPlana[j] as Card
    listaPlana[j] = temp as Card
  }

  return listaPlana
}
