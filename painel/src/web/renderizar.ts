import { marked } from "marked"
import type { Imagem } from "../vault/tipos.ts"
import { urlDaImagem } from "./compartilhar.ts"

const WIKILINK = /(!?)\[\[([^\]]+?)\]\]/g

function escapar(texto: string): string {
  return texto.replace(/[&<>"]/g, (caractere) => `&#${caractere.charCodeAt(0)};`)
}

/**
 * Markdown do Obsidian para HTML: `![[imagem]]` vira `<img>` do vault e
 * `[[nota]]` vira link com `data-entidade` e `[[#Cena]]` com `data-cena`; a página
 * trata os dois no clique.
 */
export function renderizar(md: string, imagemPorNome: Map<string, Imagem>): string {
  const convertido = md.replace(WIKILINK, (_, embutido: string, conteudo: string) => {
    const [destino = "", rotulo] = conteudo.split(/\\?\|/, 2)
    const [alvoBruto = "", secao = ""] = destino.split("#", 2)
    const alvo = alvoBruto.trim()
    if (alvo === "" && secao !== "") {
      return `<a href="#" data-cena="${escapar(secao.trim())}">${escapar(rotulo ?? secao.trim())}</a>`
    }
    if (embutido) {
      const imagem = imagemPorNome.get(alvo.toLowerCase())
      return imagem === undefined ? "" : `<img src="${urlDaImagem(imagem)}" alt="${escapar(alvo)}">`
    }
    return `<a href="#" data-entidade="${escapar(alvo)}">${escapar(rotulo ?? alvo)}</a>`
  })
  return marked.parse(convertido, { async: false })
}
