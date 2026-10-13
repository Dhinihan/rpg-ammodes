// Leitura do Markdown do Obsidian que o vault usa. Funções puras, sem disco.

import { parse as parseYaml } from "yaml"
import type { CampoDeResumo } from "./tipos.ts"

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export function separarFrontmatter(texto: string): {
  dados: Record<string, unknown>
  corpo: string
} {
  const achado = FRONTMATTER.exec(texto)
  if (achado === null) return { dados: {}, corpo: texto }
  const dados: unknown = parseYaml(achado[1] ?? "")
  return {
    dados: typeof dados === "object" && dados !== null ? (dados as Record<string, unknown>) : {},
    corpo: texto.slice(achado[0].length),
  }
}

export interface Wikilink {
  /** Nome da nota ou do arquivo, sem `#seção` e sem rótulo. Vazio em `[[#Seção]]`. */
  alvo: string
  /** O que vem depois do `#`: em `[[#Escritório do Llosg]]`, a cena da mesma nota. */
  secao: string | null
  rotulo: string | null
  embutido: boolean
}

// Dentro de tabela o Obsidian escreve o rótulo como `\|`.
const WIKILINK = /(!?)\[\[([^\]]+?)\]\]/g

export function wikilinks(texto: string): Wikilink[] {
  return [...texto.matchAll(WIKILINK)].map((achado) => {
    const [destino = "", rotulo] = (achado[2] ?? "").split(/\\?\|/, 2)
    const [alvo = "", secao] = destino.split("#", 2)
    return {
      alvo: alvo.trim(),
      secao: secao?.trim() || null,
      rotulo: rotulo?.trim() || null,
      embutido: achado[1] === "!",
    }
  })
}

/** Texto para ler de relance e buscar: sem marcação de link, ênfase ou código. */
export function textoPlano(md: string): string {
  return md
    .replace(WIKILINK, (_, __, conteudo: string) => {
      const [destino = "", rotulo] = conteudo.split(/\\?\|/, 2)
      const [alvo = "", secao = ""] = destino.split("#", 2)
      return rotulo ?? (alvo.trim() || secao.trim())
    })
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__|\*|_|`)/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

const INICIO_DE_CALLOUT = /^>\s*\[!\w+\]/
const CAMPO_DE_CALLOUT = /^>\s*\*\*(.+?):\*\*\s*(?:::)?\s*(.*)$/

/** Pares `**Campo:** valor` do primeiro callout da nota. Campos vazios ficam de fora. */
export function primeiroCallout(corpo: string): CampoDeResumo[] {
  const linhas = corpo.split("\n")
  const inicio = linhas.findIndex((linha) => INICIO_DE_CALLOUT.test(linha))
  if (inicio === -1) return []
  const campos: CampoDeResumo[] = []
  for (const linha of linhas.slice(inicio + 1)) {
    if (!linha.startsWith(">")) break
    const achado = CAMPO_DE_CALLOUT.exec(linha)
    const valor = achado?.[2]?.trim()
    if (achado?.[1] !== undefined && valor) campos.push({ campo: achado[1].trim(), valor })
  }
  return campos
}

/** Primeiro parágrafo de texto corrido, ignorando títulos, imagens, callouts e tabelas. */
export function primeiroParagrafo(corpo: string): string | null {
  const paragrafo: string[] = []
  for (const linha of corpo.split("\n")) {
    const limpa = linha.trim()
    const corrido = limpa !== "" && !/^(#|>|\||!\[\[|---|[-*+]\s|\d+\.\s)/.test(limpa)
    if (corrido) paragrafo.push(limpa)
    else if (paragrafo.length > 0) break
  }
  return paragrafo.length > 0 ? paragrafo.join(" ") : null
}

export interface TrechoBruto {
  secoes: string[]
  titulo: string | null
  texto: string
  /** Item de lista; falso para parágrafo solto. */
  item: boolean
}

const TITULO_DE_SECAO = /^(#{1,6})\s+(.*)$/
const ITEM_DE_LISTA = /^(?:[-*+]|\d+\.)\s+/
const NEGRITO_INICIAL = /^\*\*(.+?)\*\*/

/**
 * Divide a preparação em trechos: cada item de lista de primeiro nível e cada
 * parágrafo vira um trecho, com os títulos de seção acima dele. O título `#`
 * da nota não entra nas seções.
 */
export function trechos(corpo: string): TrechoBruto[] {
  const resultado: TrechoBruto[] = []
  const secoesPorNivel: string[] = []
  let aberto: { tipo: "lista" | "paragrafo"; linhas: string[] } | null = null

  const fechar = () => {
    if (aberto === null) return
    const texto = aberto.linhas.join("\n").trim()
    if (texto !== "") {
      const negrito = NEGRITO_INICIAL.exec(texto)?.[1]
      resultado.push({
        // Um `###` sem `##` acima deixa buraco no array; o filtro tira.
        secoes: secoesPorNivel.filter((secao) => secao),
        titulo: negrito === undefined ? null : textoPlano(negrito).replace(/:$/, "").trim(),
        texto,
        item: aberto.tipo === "lista",
      })
    }
    aberto = null
  }

  for (const linha of corpo.split("\n")) {
    const titulo = TITULO_DE_SECAO.exec(linha)
    if (titulo !== null) {
      fechar()
      const nivel = titulo[1]?.length ?? 1
      // Nível 1 é o título da nota; as seções começam no 2.
      secoesPorNivel.length = Math.max(0, nivel - 2)
      if (nivel >= 2) secoesPorNivel[nivel - 2] = (titulo[2] ?? "").trim()
      continue
    }
    if (linha.trim() === "" || /^\s*---\s*$/.test(linha)) {
      fechar()
      continue
    }
    if (ITEM_DE_LISTA.test(linha)) {
      fechar()
      aberto = { tipo: "lista", linhas: [linha.replace(ITEM_DE_LISTA, "")] }
      continue
    }
    if (aberto === null) aberto = { tipo: "paragrafo", linhas: [] }
    aberto.linhas.push(aberto.tipo === "lista" ? linha : linha.trim())
  }
  fechar()
  return resultado
}
