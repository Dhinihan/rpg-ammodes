import { useCallback, useEffect, useState } from "react"
import type { Imagem } from "../vault/tipos.ts"
import { copiarImagem, irParaOWhatsApp } from "./compartilhar.ts"

const DURACAO_DO_AVISO_MS = 4000

/** Copia a imagem, pula para o WhatsApp e mostra um aviso que some sozinho. */
export function useCompartilhar() {
  const [aviso, setAviso] = useState<string | null>(null)
  useEffect(() => {
    if (aviso === null) return
    const prazo = setTimeout(() => setAviso(null), DURACAO_DO_AVISO_MS)
    return () => clearTimeout(prazo)
  }, [aviso])
  const compartilhar = useCallback(async (imagem: Imagem) => {
    try {
      await copiarImagem(imagem)
      setAviso(`${imagem.nome} copiada. Ctrl+V no WhatsApp.`)
      irParaOWhatsApp()
    } catch (erro) {
      setAviso(`Não consegui copiar ${imagem.nome}: ${String(erro)}`)
    }
  }, [])
  return { aviso, compartilhar }
}

/** Atalhos da página inteira; não disparam enquanto se digita num campo. */
export function useTeclas(aoTeclar: (evento: KeyboardEvent) => void) {
  useEffect(() => {
    const ouvinte = (evento: KeyboardEvent) => {
      if (evento.target instanceof Element && evento.target.closest("input, textarea")) return
      aoTeclar(evento)
    }
    window.addEventListener("keydown", ouvinte)
    return () => window.removeEventListener("keydown", ouvinte)
  }, [aoTeclar])
}

export function haTextoSelecionado(): boolean {
  return (window.getSelection()?.toString() ?? "") !== ""
}
