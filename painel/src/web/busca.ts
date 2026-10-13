import { extendedMatch, Fzf, type FzfResultItem } from "fzf"
import { textoPlano } from "../vault/markdown.ts"
import type { Entidade, Trecho, Vault } from "../vault/tipos.ts"

export const DESTINOS_EXTERNOS = {
  b: { nome: "D&D Beyond", aba: "ammodes-beyond", url: "https://www.dndbeyond.com/search?q=" },
  g: { nome: "Google", aba: "ammodes-google", url: "https://www.google.com/search?q=" },
} as const

export type Consulta =
  | { tipo: "vazia" }
  | { tipo: "externa"; destino: keyof typeof DESTINOS_EXTERNOS; termo: string }
  | { tipo: "vault"; termo: string }

/** `b termo` e `g termo` vão para fora; o resto procura no vault. */
export function interpretarConsulta(texto: string): Consulta {
  const externa = /^([bg])\s+(\S.*)$/.exec(texto.trim())
  if (externa?.[1] === "b" || externa?.[1] === "g") {
    return { tipo: "externa", destino: externa[1], termo: externa[2] ?? "" }
  }
  return texto.trim() === "" ? { tipo: "vazia" } : { tipo: "vault", termo: texto.trim() }
}

export function abrirExterna(consulta: Extract<Consulta, { tipo: "externa" }>) {
  const destino = DESTINOS_EXTERNOS[consulta.destino]
  window.open(destino.url + encodeURIComponent(consulta.termo), destino.aba)
}

export type Resultado =
  | { tipo: "entidade"; entidade: Entidade; posicoes: Set<number>; pontuacao: number }
  | { tipo: "trecho"; trecho: Trecho; posicoes: Set<number>; pontuacao: number }

const LIMITE_DE_TRECHOS = 20

/**
 * Nomes de entidade casam por fuzzy, como o fzf. Trechos são longos e casariam
 * qualquer coisa por fuzzy; neles cada palavra da consulta precisa aparecer inteira.
 * As duas listas saem misturadas pela pontuação do fzf, para que um fuzzy fraco
 * num nome não enterre o trecho que contém a palavra exata.
 */
export function criarBusca(vault: Vault): (termo: string) => Resultado[] {
  const entidades = new Fzf(vault.entidades, {
    selector: (entidade) => [entidade.nome, ...entidade.aliases].join(" · "),
  })
  const trechos = new Fzf(vault.sessao?.trechos ?? [], {
    selector: rotuloDeBusca,
    match: extendedMatch,
    fuzzy: false,
    limit: LIMITE_DE_TRECHOS,
  })
  return (termo) =>
    [
      ...entidades.find(termo).map(
        (achado: FzfResultItem<Entidade>): Resultado => ({
          tipo: "entidade",
          entidade: achado.item,
          posicoes: achado.positions,
          pontuacao: achado.score,
        }),
      ),
      ...trechos.find(termo).map(
        (achado: FzfResultItem<Trecho>): Resultado => ({
          tipo: "trecho",
          trecho: achado.item,
          posicoes: achado.positions,
          pontuacao: achado.score,
        }),
      ),
    ].sort((a, b) => b.pontuacao - a.pontuacao)
}

/** Seções entram na busca: "criatura" acha os monstros de "Criaturas relevantes". */
export function rotuloDeBusca(trecho: Trecho): string {
  return [...trecho.secoes, trecho.texto].map(textoPlano).join(" · ")
}
