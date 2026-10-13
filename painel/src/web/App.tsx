import { useEffect, useState } from "react"
import type { Vault } from "../vault/tipos.ts"
import { Painel } from "./Painel.tsx"
import { aoMudarOVault } from "./vault-ao-vivo.ts"

type Carga =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "pronta"; vault: Vault }

export function App() {
  const [carga, setCarga] = useState<Carga>({ tipo: "carregando" })

  useEffect(() => {
    const carregar = async () => {
      const resposta = await fetch("/api/vault")
      setCarga(
        resposta.ok
          ? { tipo: "pronta", vault: (await resposta.json()) as Vault }
          : { tipo: "erro", mensagem: await resposta.text() },
      )
    }
    carregar()
    return aoMudarOVault(carregar)
  }, [])

  if (carga.tipo === "carregando") return <p className="p-6 text-stone-400">Lendo o vault...</p>
  if (carga.tipo === "erro") return <p className="p-6 text-red-300">{carga.mensagem}</p>
  return <Painel vault={carga.vault} />
}
