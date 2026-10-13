// Plugin do Vite que entrega o vault à página e avisa quando ele muda.

import { createReadStream } from "node:fs"
import { extname, join, relative, sep } from "node:path"
import type { Plugin } from "vite"
import { lerVault } from "./ler-vault.ts"
import { CATEGORIAS, EVENTO_VAULT_MUDOU, type Vault } from "./tipos.ts"

const TIPOS_DE_IMAGEM: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
}

export function pluginVault(raiz: string, sessao: number | undefined): Plugin {
  let lido: Promise<Vault> | null = null
  const ler = () => {
    lido ??= lerVault(raiz, sessao === undefined ? {} : { sessao })
    return lido
  }
  const pastas = [...Object.values(CATEGORIAS), "Sessões"].map((pasta) => join(raiz, pasta))

  return {
    name: "vault",
    configureServer(server) {
      ler().catch((erro: unknown) => server.config.logger.error(String(erro)))

      server.watcher.add(pastas)
      const aoMudar = (arquivo: string) => {
        if (!pastas.some((pasta) => arquivo.startsWith(pasta + sep))) return
        lido = null
        server.ws.send({ type: "custom", event: EVENTO_VAULT_MUDOU })
      }
      server.watcher.on("add", aoMudar)
      server.watcher.on("change", aoMudar)
      server.watcher.on("unlink", aoMudar)

      server.middlewares.use("/api/vault", (_req, res) => {
        ler().then(
          (vault) => {
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JSON.stringify(vault))
          },
          (erro: unknown) => {
            lido = null
            res.statusCode = 500
            res.setHeader("Content-Type", "text/plain; charset=utf-8")
            res.end(erro instanceof Error ? erro.message : String(erro))
          },
        )
      })

      // Só imagens, e só de dentro do vault.
      server.middlewares.use("/vault", (req, res, next) => {
        const caminho = join(raiz, decodeURIComponent((req.url ?? "").split("?", 1)[0] ?? ""))
        const tipo = TIPOS_DE_IMAGEM[extname(caminho).toLowerCase()]
        if (tipo === undefined || relative(raiz, caminho).startsWith("..")) return next()
        res.setHeader("Content-Type", tipo)
        createReadStream(caminho)
          .on("error", () => {
            res.statusCode = 404
            res.end()
          })
          .pipe(res)
      })
    },
  }
}
