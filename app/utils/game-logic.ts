interface ConfigJogo {
  totalPares: number
  colunas: number
}

export interface Card {
  id: number
  valor: string
  revelada: boolean
  combinada: boolean
  jaViu: boolean
  usouSegundaChance?: boolean // Para o perk de Memória Curta
}

export function gerarMatrizMemoria(banco: string[], config: ConfigJogo): Card[][] {
  const { totalPares, colunas } = config

  // 1. Validação simples: temos emojis suficientes no banco?
  if (totalPares > banco.length) {
    throw new Error(`Banco de dados insuficiente. Você pediu ${totalPares} pares, mas só temos ${banco.length} emojis.`)
  }

  // 2. Selecionar N emojis aleatórios do banco para serem os pares da rodada
  // Embaralhamos o banco primeiro para pegar emojis diferentes a cada jogo
  const emojisSelecionados = [...banco]
    .sort(() => Math.random() - 0.5) // Embaralhar simples serve aqui para a seleção
    .slice(0, totalPares)

  // 3. Criar a lista plana com as duplas
  const listaPlana: Card[] = [...emojisSelecionados, ...emojisSelecionados].map((emoji, index) => ({
    id: index,
    valor: emoji,
    revelada: false,
    combinada: false,
    jaViu: false,
    usouSegundaChance: false
  }))

  // 4. Aplicar Fisher-Yates (O embaralhamento real e justo)
  for (let i = listaPlana.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = listaPlana[i]
    listaPlana[i] = listaPlana[j] as Card
    listaPlana[j] = temp as Card
  }

  // 5. Agrupar em sub-arrays (Matriz)
  const matriz: Card[][] = []
  for (let i = 0; i < listaPlana.length; i += colunas) {
    matriz.push(listaPlana.slice(i, i + colunas))
  }

  return matriz
}
