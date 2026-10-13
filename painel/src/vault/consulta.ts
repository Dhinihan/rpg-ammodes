import type { IdEntidade, Sessao, Trecho } from "./tipos.ts"

/** Trechos da preparação que citam a entidade: o bloco "Nesta sessão" do card. */
export function trechosQueCitam(sessao: Sessao | null, id: IdEntidade): Trecho[] {
  return sessao?.trechos.filter((trecho) => trecho.citadas.includes(id)) ?? []
}
