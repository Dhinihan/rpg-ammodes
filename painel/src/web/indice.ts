// O que as telas consultam, derivado do vault uma vez por versão dele.

import { textoPlano, wikilinks } from "../vault/markdown.ts"
import type { Cena, Entidade, IdCena, IdEntidade, Imagem, Trecho, Vault } from "../vault/tipos.ts"
import { criarBusca } from "./busca.ts"

const SECAO_DE_CENAS = /cenas/i
const SECAO_DE_SEGREDOS = /segredos|pistas/i
const SECAO_DE_ABERTURA = /abertura/i

export const eSegredo = (trecho: Trecho) => SECAO_DE_SEGREDOS.test(trecho.secoes[0] ?? "")

/** Título de seção sem marcação e sem a numeração do método ("4. Segredos" vira "Segredos"). */
export function tituloLimpo(secao: string): string {
  return textoPlano(secao).replace(/^\d+\.\s*/, "")
}

/** A linha de relance de um trecho: o negrito do início, ou a primeira oração. */
export function resumoCurto(trecho: Trecho, limite = 80): string {
  if (trecho.titulo !== null) return trecho.titulo
  const plano = textoPlano(trecho.texto)
  // A oração termina no primeiro sinal depois dos primeiros caracteres, para
  // não cortar em "Arcana CD 15:" logo no começo.
  const corte = plano.slice(12).search(/[.;:—]/)
  const primeira = corte === -1 ? plano : plano.slice(0, corte + 12)
  return primeira.length > limite ? `${primeira.slice(0, limite).trimEnd()}...` : primeira
}

export function secaoCurta(trecho: Trecho): string {
  return tituloLimpo(trecho.secoes.at(-1) ?? "")
}

export function criarIndice(vault: Vault) {
  const trechos = vault.sessao?.trechos ?? []
  const cenas = vault.sessao?.cenas ?? []
  const entidadePorId = new Map(vault.entidades.map((entidade) => [entidade.id, entidade]))
  const trechoPorId = new Map(trechos.map((trecho) => [trecho.id, trecho]))
  const cenaPorId = new Map(cenas.map((cena) => [cena.id, cena]))
  const imagemPorNome = new Map(vault.imagens.map((imagem) => [imagem.nome.toLowerCase(), imagem]))

  const entidadePorNome = new Map<string, Entidade>()
  for (const entidade of vault.entidades) {
    for (const nome of [entidade.nome, ...entidade.aliases]) {
      entidadePorNome.set(nome.toLowerCase(), entidade)
    }
  }
  /** A entidade que um título de seção nomeia, como `### Cyfrin`. */
  const entidadeDoTitulo = (titulo: string) =>
    entidadePorNome.get(tituloLimpo(titulo).toLowerCase())
  const entidadeDoLink = (alvo: string) => entidadePorNome.get(alvo.toLowerCase())

  const daLista = (ids: string[]) =>
    ids.map((id) => trechoPorId.get(id)).filter((trecho) => trecho !== undefined)
  const entidades = (ids: IdEntidade[]) =>
    [...new Set(ids)]
      .map((id) => entidadePorId.get(id))
      .filter((entidade) => entidade !== undefined)

  /** Seções de primeiro nível, na ordem da preparação, fora a das cenas. */
  const secoes = [...new Set(trechos.map((trecho) => trecho.secoes[0] ?? ""))].filter(
    (secao) => secao !== "" && !SECAO_DE_CENAS.test(secao),
  )

  return {
    busca: criarBusca(vault),
    cenas,
    secoes,
    imagemPorNome,
    entidadeDoLink,
    abertura: trechos.find((trecho) => SECAO_DE_ABERTURA.test(trecho.secoes[0] ?? "")) ?? null,
    cena: (id: IdCena) => cenaPorId.get(id),
    entidade: (id: IdEntidade) => entidadePorId.get(id),
    trecho: (id: string) => trechoPorId.get(id),
    cenaDoTitulo: (titulo: string) =>
      cenas.find((cena) => cena.titulo.toLowerCase() === titulo.toLowerCase()),

    segredosDaCena: (cena: Cena) => daLista(cena.ligados).filter(eSegredo),
    outrosDaCena: (cena: Cena) => daLista(cena.ligados).filter((trecho) => !eSegredo(trecho)),
    detalhesDaCena: (cena: Cena) => daLista(cena.detalhes),
    elencoDaCena: (cena: Cena) => entidades(daLista(cena.detalhes).flatMap((t) => t.citadas)),
    cenasDoTrecho: (trecho: Trecho) =>
      trecho.cenas.map((id) => cenaPorId.get(id)).filter((cena) => cena !== undefined),
    citadasNoTrecho: (trecho: Trecho) => entidades(trecho.citadas),

    /**
     * Onde a entidade aparece na sessão: a preparação dela (os itens sob um
     * título com o nome dela), as cenas em que está e os demais trechos.
     */
    presenca: (entidade: Entidade) => {
      const preparacao = trechos.filter(
        (trecho) =>
          trecho.secoes.length > 1 && entidadeDoTitulo(trecho.secoes.at(-1) ?? "") === entidade,
      )
      const emCenas = cenas.filter((cena) =>
        daLista(cena.detalhes).some((trecho) => trecho.citadas.includes(entidade.id)),
      )
      const jaListados = new Set([
        ...preparacao.map((trecho) => trecho.id),
        ...emCenas.flatMap((cena) => cena.detalhes),
      ])
      const outros = trechos.filter(
        (trecho) => trecho.citadas.includes(entidade.id) && !jaListados.has(trecho.id),
      )
      return { preparacao, cenas: emCenas, outros }
    },

    /**
     * Uma seção com subtítulos lista um grupo por subtítulo (um por NPC, por
     * local, por encontro); os itens soltos vêm depois.
     */
    conteudoDaSecao: (secao: string) => {
      const daSecao = trechos.filter((trecho) => trecho.secoes[0] === secao)
      const grupos = [...new Set(daSecao.map((trecho) => trecho.secoes[1]))]
        .filter((grupo) => grupo !== undefined)
        .map((grupo) => ({
          grupo,
          entidade: entidadeDoTitulo(grupo) ?? null,
          trechos: daSecao.filter((trecho) => trecho.secoes[1] === grupo),
        }))
      return { grupos, soltos: daSecao.filter((trecho) => trecho.secoes.length === 1) }
    },

    /** Imagens que um trecho oferece: as embutidas nele e os retratos de quem ele cita. */
    imagensDoTrecho: (trecho: Trecho): { rotulo: string; imagem: Imagem }[] => [
      ...wikilinks(trecho.texto)
        .filter((link) => link.embutido)
        .map((link) => imagemPorNome.get(link.alvo.toLowerCase()))
        .filter((imagem) => imagem !== undefined)
        .map((imagem) => ({ rotulo: imagem.nome.replace(/\.\w+$/, ""), imagem })),
      ...entidades(trecho.citadas).flatMap((entidade) =>
        entidade.imagem === null ? [] : [{ rotulo: entidade.nome, imagem: entidade.imagem }],
      ),
    ],
  }
}

export type Indice = ReturnType<typeof criarIndice>
