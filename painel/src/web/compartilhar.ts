import type { Imagem } from "../vault/tipos.ts"

const LADO_MAXIMO = 1600
const ABA_DO_WHATSAPP = "ammodes-whatsapp"

export function urlDaImagem(imagem: Imagem): string {
  return `/vault/${imagem.caminho.split("/").map(encodeURIComponent).join("/")}`
}

/** Copia a imagem reduzida para a área de transferência, pronta para Ctrl+V no WhatsApp Web. */
export async function copiarImagem(imagem: Imagem): Promise<void> {
  const original = await createImageBitmap(await (await fetch(urlDaImagem(imagem))).blob())
  const escala = Math.min(1, LADO_MAXIMO / Math.max(original.width, original.height))
  const tela = new OffscreenCanvas(
    Math.round(original.width * escala),
    Math.round(original.height * escala),
  )
  tela.getContext("2d")?.drawImage(original, 0, 0, tela.width, tela.height)
  // O Chrome só aceita PNG na área de transferência.
  const png = await tela.convertToBlob({ type: "image/png" })
  await navigator.clipboard.write([new ClipboardItem({ "image/png": png })])
}

/**
 * Traz a aba do WhatsApp Web que o próprio painel abriu. Na primeira vez abre
 * a aba; depois só tenta focá-la, sem recarregar a conversa.
 */
export function irParaOWhatsApp() {
  const aba = window.open("", ABA_DO_WHATSAPP)
  if (aba === null) return
  let vazia = false
  try {
    // Ler a URL de uma aba de outra origem lança erro: a aba já está no WhatsApp.
    vazia = aba.location.href === "about:blank"
  } catch {}
  if (vazia) aba.location.href = "https://web.whatsapp.com"
  aba.focus()
}
