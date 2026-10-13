import { describe, expect, test } from "bun:test"
import type { IdCena } from "../vault/tipos.ts"
import {
  abrir,
  alternarInicio,
  avancar,
  NAVEGACAO_VAZIA,
  type Navegacao,
  type Pagina,
  paginaAtual,
  voltar,
} from "./navegacao.ts"

const cena = (id: string): Pagina => ({ tipo: "cena", id: id as IdCena })
const trecho = (id: string): Pagina => ({ tipo: "trecho", id })
const passos = (...funcoes: ((nav: Navegacao) => Navegacao)[]) =>
  funcoes.reduce((nav, funcao) => funcao(nav), NAVEGACAO_VAZIA)

describe("navegação do painel", () => {
  test("← e → andam no histórico, e ← além da primeira página leva ao início", () => {
    const nav = passos(
      (n) => abrir(n, cena("escritório")),
      (n) => abrir(n, trecho("diário")),
      voltar,
    )
    expect(paginaAtual(nav)).toEqual(cena("escritório"))
    expect(paginaAtual(avancar(nav))).toEqual(trecho("diário"))
    expect(paginaAtual(voltar(nav))).toBeNull()
  })

  test("Esc vai ao início e, no início, volta para onde se estava", () => {
    const naPagina = passos(
      (n) => abrir(n, cena("escritório")),
      (n) => abrir(n, trecho("diário")),
      voltar,
    )
    const noInicio = alternarInicio(naPagina)
    expect(paginaAtual(noInicio)).toBeNull()
    expect(paginaAtual(alternarInicio(noInicio))).toEqual(cena("escritório"))
  })

  test("Esc no início alcançado por ← volta para a última página aberta", () => {
    const nav = passos((n) => abrir(n, cena("escritório")), voltar, alternarInicio)
    expect(paginaAtual(nav)).toEqual(cena("escritório"))
  })

  test("abrir depois de voltar descarta o que estava à frente", () => {
    const nav = passos(
      (n) => abrir(n, cena("escritório")),
      (n) => abrir(n, trecho("diário")),
      voltar,
      (n) => abrir(n, trecho("mimic")),
    )
    expect(nav.paginas).toEqual([cena("escritório"), trecho("mimic")])
    expect(paginaAtual(avancar(nav))).toEqual(trecho("mimic"))
  })
})
