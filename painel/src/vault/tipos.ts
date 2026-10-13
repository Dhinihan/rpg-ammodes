// Modelo do vault como a página o recebe. Sem dependência de Node: o servidor
// monta, a página consome.

export const CATEGORIAS = {
  npc: "NPCs",
  local: "Locais",
  faccao: "Facções",
  item: "Items e Objetos",
  cidade: "Cidades",
  personagem: "Personagens",
  regra: "Regras da casa",
} as const

/** Evento do servidor do Vite quando uma nota ou imagem do vault muda. */
export const EVENTO_VAULT_MUDOU = "vault:mudou"

export type Categoria = keyof typeof CATEGORIAS

/** Caminho relativo à raiz do vault, com `/`. */
export type CaminhoNoVault = string & { readonly __caminho: unique symbol }

/** Nome do arquivo sem `.md`: é a chave que o Obsidian resolve em `[[link]]`. */
export type IdEntidade = string & { readonly __idEntidade: unique symbol }

export interface Imagem {
  /** Nome do arquivo com extensão, como aparece em `![[Cyfrin.png]]`. */
  nome: string
  caminho: CaminhoNoVault
}

/** Um par `**Campo:** valor` de um callout de resumo. */
export interface CampoDeResumo {
  campo: string
  valor: string
}

export interface Entidade {
  id: IdEntidade
  nome: string
  categoria: Categoria
  caminho: CaminhoNoVault
  aliases: string[]
  frontmatter: Record<string, unknown>
  imagem: Imagem | null
  /** Campos do primeiro callout (Resumo de Interpretação, Resumo Rápido). */
  resumo: CampoDeResumo[]
  /** Primeiro parágrafo de texto corrido, para notas sem callout. */
  abertura: string | null
  /** Markdown da nota, sem frontmatter. */
  corpo: string
  /** Markdown de `<nome> - Notas privadas.md`, sem frontmatter. */
  notasPrivadas: string | null
}

/** Um item da preparação: um item de lista ou parágrafo do Markdown da sessão. */
export interface Trecho {
  id: string
  arquivo: CaminhoNoVault
  /** Títulos de seção acima do trecho, do mais externo ao mais interno. */
  secoes: string[]
  /** Negrito inicial do item, sem o `:` final, quando houver. */
  titulo: string | null
  /** Markdown do trecho, com o título. */
  texto: string
  /** Item de lista; falso para parágrafo solto. */
  item: boolean
  /** Entidades citadas no trecho ou nos títulos de seção acima dele. */
  citadas: IdEntidade[]
  /** Cenas apontadas com `[[#Cena]]` no trecho ou nos títulos de seção acima dele. */
  cenas: IdCena[]
}

/** Título da cena normalizado: o que `[[#Título]]` resolve. */
export type IdCena = string & { readonly __idCena: unique symbol }

/** Um `###` dentro da seção de cenas da preparação. */
export interface Cena {
  id: IdCena
  titulo: string
  /** Trechos escritos dentro da cena. */
  detalhes: string[]
  /** Trechos de fora que apontam a cena: segredos, monstros, recompensas. */
  ligados: string[]
}

export interface Sessao {
  numero: number
  nome: string
  pasta: CaminhoNoVault
  trechos: Trecho[]
  /** Na ordem em que aparecem na preparação. */
  cenas: Cena[]
}

export interface Vault {
  sessao: Sessao | null
  entidades: Entidade[]
  imagens: Imagem[]
}
