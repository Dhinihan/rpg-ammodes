// O que cada página oferece nas teclas 1-9, em blocos na ordem da tela.

import { CATEGORIAS, type Cena, type Entidade, type Imagem, type Trecho } from "../vault/tipos.ts"
import { type Indice, resumoCurto, secaoCurta, tituloLimpo } from "./indice.ts"
import type { Pagina } from "./navegacao.ts"

export interface Opcao {
  pagina: Pagina
  rotulo: string
  /** Texto miúdo ao lado do rótulo; vazio quando não há. */
  detalhe: string
  /** Retrato ao lado do rótulo; `undefined` quando a opção não tem lugar para ele. */
  imagem?: Imagem | null
  /** Frase mais longa, para blocos que quebram a linha em vez de cortar. */
  frase: string
  /** Número da tecla, de 1 em diante. */
  numero: number
}

export type ChaveDoBloco =
  | "cenas"
  | "segredos"
  | "elenco"
  | "tambem"
  | "nestaSessao"
  | "grupos"
  | "soltos"
  | "ligacoes"

export interface Bloco {
  chave: ChaveDoBloco
  opcoes: Opcao[]
}

type OpcaoSemNumero = Omit<Opcao, "numero">

const deCena = (cena: Cena, indice: Indice): OpcaoSemNumero => {
  const segredos = indice.segredosDaCena(cena).length
  return {
    pagina: { tipo: "cena", id: cena.id },
    rotulo: cena.titulo,
    detalhe: segredos === 0 ? "" : `${segredos} ${segredos > 1 ? "segredos" : "segredo"}`,
    frase: cena.titulo,
  }
}

const deEntidade = (entidade: Entidade): OpcaoSemNumero => ({
  pagina: { tipo: "entidade", id: entidade.id },
  rotulo: entidade.nome,
  detalhe: CATEGORIAS[entidade.categoria],
  imagem: entidade.imagem,
  frase: entidade.nome,
})

const deTrecho = (trecho: Trecho): OpcaoSemNumero => ({
  pagina: { tipo: "trecho", id: trecho.id },
  rotulo: resumoCurto(trecho),
  detalhe: secaoCurta(trecho),
  frase: resumoCurto(trecho, 160),
})

function blocosDe(pagina: Pagina | null, indice: Indice): [ChaveDoBloco, OpcaoSemNumero[]][] {
  if (pagina === null) {
    return [["cenas", indice.cenas.map((cena) => deCena(cena, indice))]]
  }
  if (pagina.tipo === "cena") {
    const cena = indice.cena(pagina.id)
    if (cena === undefined) return []
    return [
      ["segredos", indice.segredosDaCena(cena).map(deTrecho)],
      ["elenco", indice.elencoDaCena(cena).map(deEntidade)],
      ["tambem", indice.outrosDaCena(cena).map(deTrecho)],
    ]
  }
  if (pagina.tipo === "entidade") {
    const entidade = indice.entidade(pagina.id)
    if (entidade === undefined) return []
    const { cenas, outros } = indice.presenca(entidade)
    return [
      ["nestaSessao", [...cenas.map((cena) => deCena(cena, indice)), ...outros.map(deTrecho)]],
    ]
  }
  if (pagina.tipo === "trecho") {
    const trecho = indice.trecho(pagina.id)
    if (trecho === undefined) return []
    return [
      [
        "ligacoes",
        [
          ...indice.cenasDoTrecho(trecho).map((cena) => deCena(cena, indice)),
          ...indice.citadasNoTrecho(trecho).map(deEntidade),
        ],
      ],
    ]
  }
  if (pagina.tipo === "secao") {
    const { grupos, soltos } = indice.conteudoDaSecao(pagina.secao)
    return [
      [
        "grupos",
        grupos.map(({ grupo, entidade, trechos }) =>
          entidade === null
            ? {
                pagina: { tipo: "grupo", secao: pagina.secao, grupo },
                rotulo: tituloLimpo(grupo),
                detalhe: `${trechos.length} ${trechos.length > 1 ? "itens" : "item"}`,
                frase: tituloLimpo(grupo),
              }
            : deEntidade(entidade),
        ),
      ],
      ["soltos", soltos.map(deTrecho)],
    ]
  }
  const grupo = indice
    .conteudoDaSecao(pagina.secao)
    .grupos.find((achado) => achado.grupo === pagina.grupo)
  return [["soltos", (grupo?.trechos ?? []).map(deTrecho)]]
}

/** Os blocos da página, numerados em sequência para as teclas 1-9. */
export function menu(pagina: Pagina | null, indice: Indice): Bloco[] {
  let numero = 0
  return blocosDe(pagina, indice).map(([chave, opcoes]) => ({
    chave,
    opcoes: opcoes.map((opcao) => {
      numero += 1
      return { ...opcao, numero }
    }),
  }))
}

export function bloco(blocos: Bloco[], chave: ChaveDoBloco): Opcao[] {
  return blocos.find((achado) => achado.chave === chave)?.opcoes ?? []
}
