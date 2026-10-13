import type { IdCena, IdEntidade } from "../vault/tipos.ts"

/**
 * Uma página do painel. Guarda ids, não objetos, para continuar válida quando
 * o vault recarrega depois de uma edição no Obsidian.
 */
export type Pagina =
  | { tipo: "cena"; id: IdCena }
  | { tipo: "entidade"; id: IdEntidade }
  | { tipo: "trecho"; id: string }
  | { tipo: "secao"; secao: string }
  | { tipo: "grupo"; secao: string; grupo: string }

/**
 * Histórico de páginas, como o do navegador: ← e → andam nele. A tela inicial
 * fica por cima dele: Esc vai para ela e, nela, Esc volta para onde se estava.
 */
export interface Navegacao {
  paginas: Pagina[]
  /** Página atual; -1 quando se voltou antes da primeira. */
  pos: number
  noInicio: boolean
}

export const NAVEGACAO_VAZIA: Navegacao = { paginas: [], pos: -1, noInicio: false }

/** A página à vista; `null` é a tela inicial. */
export function paginaAtual(nav: Navegacao): Pagina | null {
  return nav.noInicio ? null : (nav.paginas[nav.pos] ?? null)
}

/** Abrir uma página descarta o que estava à frente no histórico, como no navegador. */
export function abrir(nav: Navegacao, pagina: Pagina): Navegacao {
  const paginas = [...nav.paginas.slice(0, nav.pos + 1), pagina]
  return { paginas, pos: paginas.length - 1, noInicio: false }
}

export function alternarInicio(nav: Navegacao): Navegacao {
  if (paginaAtual(nav) !== null) return { ...nav, noInicio: true }
  return { ...nav, noInicio: false, pos: nav.pos < 0 ? nav.paginas.length - 1 : nav.pos }
}

export function voltar(nav: Navegacao): Navegacao {
  return { ...nav, noInicio: false, pos: Math.max(nav.pos - 1, -1) }
}

export function avancar(nav: Navegacao): Navegacao {
  return { ...nav, noInicio: false, pos: Math.min(nav.pos + 1, nav.paginas.length - 1) }
}
