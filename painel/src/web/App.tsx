import { type KeyboardEvent, type MouseEvent, useEffect, useMemo, useRef, useState } from "react"
import { trechosQueCitam } from "../vault/consulta.ts"
import { textoPlano } from "../vault/markdown.ts"
import {
  CATEGORIAS,
  type Entidade,
  type IdEntidade,
  type Imagem,
  type Trecho,
  type Vault,
} from "../vault/tipos.ts"
import {
  abrirExterna,
  criarBusca,
  DESTINOS_EXTERNOS,
  interpretarConsulta,
  type Resultado,
} from "./busca.ts"
import { copiarImagem, irParaOWhatsApp, urlDaImagem } from "./compartilhar.ts"
import { renderizar } from "./renderizar.ts"
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

type Selecao = { tipo: "entidade"; id: IdEntidade } | { tipo: "trecho"; id: string }

function Painel({ vault }: { vault: Vault }) {
  const busca = useMemo(() => criarBusca(vault), [vault])
  const imagemPorNome = useMemo(
    () => new Map(vault.imagens.map((imagem) => [imagem.nome.toLowerCase(), imagem])),
    [vault],
  )
  const [texto, setTexto] = useState("")
  const [indice, setIndice] = useState(0)
  const [selecao, setSelecao] = useState<Selecao | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const campo = useRef<HTMLInputElement>(null)

  const consulta = interpretarConsulta(texto)
  const resultados = consulta.tipo === "vault" ? busca(consulta.termo).slice(0, 40) : []

  useEffect(() => {
    const aoTeclar = (evento: globalThis.KeyboardEvent) => {
      if (evento.key === "/" && document.activeElement !== campo.current) {
        evento.preventDefault()
        campo.current?.select()
      }
    }
    window.addEventListener("keydown", aoTeclar)
    return () => window.removeEventListener("keydown", aoTeclar)
  }, [])

  const selecionar = (resultado: Resultado | undefined) => {
    if (resultado === undefined) return
    setSelecao(
      resultado.tipo === "entidade"
        ? { tipo: "entidade", id: resultado.entidade.id }
        : { tipo: "trecho", id: resultado.trecho.id },
    )
  }

  const aoTeclarNoCampo = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === "ArrowDown") setIndice((atual) => Math.min(atual + 1, resultados.length - 1))
    else if (evento.key === "ArrowUp") setIndice((atual) => Math.max(atual - 1, 0))
    else if (evento.key === "Escape") setTexto("")
    else if (evento.key === "Enter") {
      if (consulta.tipo === "externa") abrirExterna(consulta)
      else selecionar(resultados[indice])
    } else return
    evento.preventDefault()
  }

  const compartilhar = async (imagem: Imagem) => {
    try {
      await copiarImagem(imagem)
      setAviso(`${imagem.nome} copiada. Ctrl+V no WhatsApp.`)
      irParaOWhatsApp()
    } catch (erro) {
      setAviso(`Não consegui copiar ${imagem.nome}: ${String(erro)}`)
    }
  }

  // Links dentro do Markdown renderizado: `[[nota]]` seleciona, link externo abre em outra aba.
  const aoClicarNoMarkdown = (evento: MouseEvent) => {
    const link = (evento.target as HTMLElement).closest("a")
    if (link === null) return
    evento.preventDefault()
    const alvo = link.dataset.entidade
    const entidade = vault.entidades.find(
      (achada) =>
        achada.nome.toLowerCase() === alvo?.toLowerCase() ||
        achada.aliases.some((alias) => alias.toLowerCase() === alvo?.toLowerCase()),
    )
    if (entidade !== undefined) setSelecao({ tipo: "entidade", id: entidade.id })
    else if (link.href.startsWith("http")) window.open(link.href, DESTINOS_EXTERNOS.b.aba)
  }

  const entidadeSelecionada =
    selecao?.tipo === "entidade"
      ? vault.entidades.find((achada) => achada.id === selecao.id)
      : undefined
  const trechoSelecionado =
    selecao?.tipo === "trecho"
      ? vault.sessao?.trechos.find((achado) => achado.id === selecao.id)
      : undefined

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: delega o clique dos links do Markdown
    // biome-ignore lint/a11y/useKeyWithClickEvents: os links são <a> e já respondem ao teclado
    <div className="flex h-screen flex-col" onClick={aoClicarNoMarkdown}>
      <header className="flex items-center gap-4 border-stone-800 border-b p-3">
        <input
          ref={campo}
          // biome-ignore lint/a11y/noAutofocus: a busca é a porta de entrada do painel
          autoFocus
          value={texto}
          onChange={(evento) => {
            setTexto(evento.target.value)
            setIndice(0)
          }}
          onKeyDown={aoTeclarNoCampo}
          placeholder="Buscar no vault e na sessão   ·   b termo: D&D Beyond   ·   g termo: Google"
          className="flex-1 rounded bg-stone-900 px-4 py-2 text-lg outline-none ring-amber-500 focus:ring-2"
        />
        <span className="text-stone-500 text-sm">{vault.sessao?.nome ?? "sem sessão"}</span>
      </header>
      {aviso !== null && (
        <p className="bg-amber-900/40 px-4 py-1 text-amber-200 text-sm">{aviso}</p>
      )}
      <main className="flex min-h-0 flex-1">
        <ul className="w-96 shrink-0 overflow-y-auto border-stone-800 border-r">
          {consulta.tipo === "externa" && (
            <li className="p-3 text-stone-300">
              Enter abre "{consulta.termo}" no {DESTINOS_EXTERNOS[consulta.destino].nome}
            </li>
          )}
          {resultados.map((resultado, posicao) => (
            <li key={resultado.tipo === "entidade" ? resultado.entidade.id : resultado.trecho.id}>
              <button
                type="button"
                onClick={() => selecionar(resultado)}
                className={`w-full px-3 py-2 text-left ${posicao === indice ? "bg-stone-800" : ""}`}
              >
                {resultado.tipo === "entidade" ? (
                  <>
                    <span className="font-medium">{resultado.entidade.nome}</span>{" "}
                    <span className="text-stone-500 text-xs">
                      {CATEGORIAS[resultado.entidade.categoria]}
                    </span>
                  </>
                ) : (
                  <span className="line-clamp-2 text-sm text-stone-300">
                    {resultado.trecho.titulo ?? textoPlano(resultado.trecho.texto)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <section className="min-w-0 flex-1 overflow-y-auto p-6">
          {entidadeSelecionada !== undefined && (
            <CardDeEntidade
              entidade={entidadeSelecionada}
              trechos={trechosQueCitam(vault.sessao, entidadeSelecionada.id)}
              imagemPorNome={imagemPorNome}
              aoEscolherTrecho={(trecho) => setSelecao({ tipo: "trecho", id: trecho.id })}
              aoCompartilhar={compartilhar}
            />
          )}
          {trechoSelecionado !== undefined && (
            <CardDeTrecho
              trecho={trechoSelecionado}
              vault={vault}
              imagemPorNome={imagemPorNome}
              aoEscolherEntidade={(id) => setSelecao({ tipo: "entidade", id })}
            />
          )}
        </section>
      </main>
    </div>
  )
}

function CardDeEntidade(props: {
  entidade: Entidade
  trechos: Trecho[]
  imagemPorNome: Map<string, Imagem>
  aoEscolherTrecho: (trecho: Trecho) => void
  aoCompartilhar: (imagem: Imagem) => void
}) {
  const { entidade, trechos, imagemPorNome } = props
  const [notaAberta, setNotaAberta] = useState(false)
  return (
    <article className="flex gap-6">
      {entidade.imagem !== null && (
        <figure className="w-72 shrink-0">
          <img src={urlDaImagem(entidade.imagem)} alt={entidade.nome} className="w-full rounded" />
          <button
            type="button"
            onClick={() => entidade.imagem !== null && props.aoCompartilhar(entidade.imagem)}
            className="mt-2 w-full rounded bg-emerald-800 px-3 py-2 hover:bg-emerald-700"
          >
            Copiar e ir ao WhatsApp
          </button>
        </figure>
      )}
      <div className="min-w-0 flex-1 space-y-4">
        <header>
          <h1 className="font-semibold text-3xl">{entidade.nome}</h1>
          <p className="text-stone-500">{CATEGORIAS[entidade.categoria]}</p>
        </header>
        {entidade.resumo.length > 0 ? (
          <dl className="space-y-1">
            {entidade.resumo.map((campo) => (
              <div key={campo.campo}>
                <dt className="inline font-medium text-stone-400">{campo.campo}: </dt>
                <dd className="inline">{textoPlano(campo.valor)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          entidade.abertura !== null && <p>{textoPlano(entidade.abertura)}</p>
        )}
        {trechos.length > 0 && (
          <section>
            <h2 className="mb-1 font-medium text-amber-400">Nesta sessão</h2>
            <ul className="space-y-1">
              {trechos.map((trecho) => (
                <li key={trecho.id}>
                  <button
                    type="button"
                    onClick={() => props.aoEscolherTrecho(trecho)}
                    className="text-left hover:text-amber-200"
                  >
                    <span className="text-stone-500 text-xs">
                      {textoPlano(trecho.secoes.at(-1) ?? "")} ·{" "}
                    </span>
                    {trecho.titulo ?? textoPlano(trecho.texto)}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        <button
          type="button"
          onClick={() => setNotaAberta((aberta) => !aberta)}
          className="text-stone-400 underline"
        >
          {notaAberta ? "Fechar nota inteira" : "Nota inteira"}
        </button>
        {notaAberta && (
          <div
            className="nota"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown do próprio vault, local
            dangerouslySetInnerHTML={{
              __html: renderizar(
                entidade.corpo +
                  (entidade.notasPrivadas === null ? "" : `\n\n---\n\n${entidade.notasPrivadas}`),
                imagemPorNome,
              ),
            }}
          />
        )}
      </div>
    </article>
  )
}

function CardDeTrecho(props: {
  trecho: Trecho
  vault: Vault
  imagemPorNome: Map<string, Imagem>
  aoEscolherEntidade: (id: IdEntidade) => void
}) {
  const { trecho, vault } = props
  return (
    <article className="max-w-3xl space-y-4">
      <p className="text-stone-500 text-sm">{trecho.secoes.map(textoPlano).join(" > ")}</p>
      <div
        className="nota text-lg"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown do próprio vault, local
        dangerouslySetInnerHTML={{ __html: renderizar(trecho.texto, props.imagemPorNome) }}
      />
      <div className="flex flex-wrap gap-2">
        {trecho.citadas.map((id) => {
          const entidade = vault.entidades.find((achada) => achada.id === id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => props.aoEscolherEntidade(id)}
              className="flex items-center gap-2 rounded bg-stone-800 py-1 pr-3 pl-1 hover:bg-stone-700"
            >
              {entidade?.imagem != null && (
                <img
                  src={urlDaImagem(entidade.imagem)}
                  alt=""
                  className="size-8 rounded object-cover"
                />
              )}
              {entidade?.nome ?? id}
            </button>
          )
        })}
      </div>
    </article>
  )
}
