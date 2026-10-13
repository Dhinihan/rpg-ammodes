import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { pluginVault } from "./src/vault/plugin-vault.ts"

const RAIZ_DO_VAULT = fileURLToPath(new URL("..", import.meta.url))

/** O `dev.ts` traduz `--sessao N` para esta variável. */
const SESSAO = process.env.SESSAO === undefined ? undefined : Number(process.env.SESSAO)

export default defineConfig({
  plugins: [react(), tailwindcss(), pluginVault(RAIZ_DO_VAULT, SESSAO)],
  server: { port: 5180, strictPort: true, open: true },
})
