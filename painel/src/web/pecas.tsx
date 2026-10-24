import type { ReactNode } from "react"
import type { Imagem } from "../vault/tipos.ts"
import { urlDaImagem } from "./compartilhar.ts"
import type { Indice } from "./indice.ts"
import type { Opcao } from "./menu.ts"
import { renderizar } from "./renderizar.ts"

export function Aviso({ texto }: { texto: string | null }) {
  if (texto === null) return null
  return (
    <p className="fixed top-4 right-4 z-50 rounded bg-emerald-900 px-4 py-2 text-emerald-100 shadow-lg">
      {texto}
    </p>
  )
}

/** Imagem na largura inteira da tela; imagem alta rola. Clique ou Esc fecha. */
export function Ampliada(props: { src: string; aoFechar: () => void }) {
  return (
    <button
      type="button"
      onClick={props.aoFechar}
      className="fixed inset-0 z-50 cursor-zoom-out overflow-y-auto bg-black/95"
    >
      <img src={props.src} alt="" className="min-h-full w-full object-contain" />
    </button>
  )
}

export function Retrato(props: { imagem: Imagem | null; className: string; alt?: string }) {
  if (props.imagem === null) return <div className={`bg-stone-800 ${props.className}`} />
  return (
    <img
      src={urlDaImagem(props.imagem)}
      alt={props.alt ?? ""}
      loading="lazy"
      decoding="async"
      className={`object-cover ${props.className}`}
    />
  )
}

export function Markdown(props: { md: string; indice: Indice; className?: string }) {
  return (
    <div
      className={`nota ${props.className ?? ""}`}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown do próprio vault, local
      dangerouslySetInnerHTML={{ __html: renderizar(props.md, props.indice.imagemPorNome) }}
    />
  )
}

export function Rotulo({ children }: { children: ReactNode }) {
  return <h2 className="mb-1 text-amber-500 text-xs uppercase tracking-wider">{children}</h2>
}

/**
 * Lista de opções com o número da tecla. `inteiro` quebra a linha em vez de
 * cortar e esconde o texto miúdo, para frases que precisam ser lidas inteiras.
 */
export function Linhas(props: {
  opcoes: Opcao[]
  aoAbrir: (opcao: Opcao) => void
  grande?: boolean
  inteiro?: boolean
}) {
  return (
    <ol className="space-y-0.5">
      {props.opcoes.map((opcao) => (
        <li key={opcao.numero}>
          <button
            type="button"
            onClick={() => props.aoAbrir(opcao)}
            className={`flex w-full gap-3 rounded-md px-2 py-1 text-left hover:bg-stone-900 ${
              props.inteiro ? "items-baseline" : "items-center"
            }`}
          >
            <kbd className="w-5 shrink-0 text-amber-500 text-sm">
              {opcao.numero <= 9 ? opcao.numero : ""}
            </kbd>
            {opcao.imagem !== undefined && (
              <Retrato imagem={opcao.imagem} className="size-7 shrink-0 rounded-full" />
            )}
            <span
              className={`min-w-0 ${props.inteiro ? "" : "truncate"} ${
                props.grande ? "text-2xl" : "text-lg"
              }`}
            >
              {props.inteiro ? opcao.frase : opcao.rotulo}
            </span>
            {opcao.detalhe !== "" && !props.inteiro && (
              <span className="shrink-0 text-sm text-stone-500">{opcao.detalhe}</span>
            )}
          </button>
        </li>
      ))}
    </ol>
  )
}

/** Miniatura que manda a imagem no WhatsApp ao clicar. */
export function ImagemCompartilhavel(props: {
  rotulo: string
  imagem: Imagem
  aoCompartilhar: (imagem: Imagem) => void
}) {
  return (
    <button
      type="button"
      onClick={() => props.aoCompartilhar(props.imagem)}
      className="group relative overflow-hidden rounded-lg"
      title="Mandar no WhatsApp"
    >
      <Retrato imagem={props.imagem} alt={props.rotulo} className="h-28 w-24" />
      <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 text-xs">
        {props.rotulo}
        <span className="block text-emerald-300 opacity-0 group-hover:opacity-100">WhatsApp</span>
      </span>
    </button>
  )
}
