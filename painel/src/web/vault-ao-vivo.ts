import { EVENTO_VAULT_MUDOU } from "../vault/tipos.ts"

// O Vite descarta os ouvintes de `import.meta.hot.on` registrados depois da
// execução do módulo quando o módulo recebe HMR. Registrar aqui, no topo de um
// módulo que quase não muda, e repassar como evento da janela mantém o aviso
// vivo enquanto os componentes são editados.
import.meta.hot?.on(EVENTO_VAULT_MUDOU, () => window.dispatchEvent(new Event(EVENTO_VAULT_MUDOU)))

export function aoMudarOVault(callback: () => void): () => void {
  window.addEventListener(EVENTO_VAULT_MUDOU, callback)
  return () => window.removeEventListener(EVENTO_VAULT_MUDOU, callback)
}
