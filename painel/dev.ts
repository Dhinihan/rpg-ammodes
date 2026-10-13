// `pnpm dev --sessao 3` abre outra sessão; sem o parâmetro, a de maior número.
// O CLI do Vite recusa parâmetros que não conhece, por isso o painel sobe pela API.

import { parseArgs } from "node:util"
import { createServer } from "vite"

const { values } = parseArgs({ options: { sessao: { type: "string" } } })
const sessao = values.sessao === undefined ? undefined : Number(values.sessao)
if (Number.isNaN(sessao)) throw new Error("--sessao espera um número, como `--sessao 3`")
if (sessao !== undefined) process.env.SESSAO = String(sessao)

const servidor = await createServer()
try {
  await servidor.listen()
} catch (erro) {
  await servidor.close()
  if (erro instanceof Error && erro.message.includes("already in use")) {
    const porta = servidor.config.server.port
    console.error(
      `O painel já está rodando em http://localhost:${porta}. Feche o outro terminal ou use a aba aberta.`,
    )
    process.exit(1)
  }
  throw erro
}
servidor.printUrls()
servidor.bindCLIShortcuts({ print: true })
