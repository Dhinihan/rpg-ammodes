import { type KeyboardEvent, type MouseEvent, useCallback, useMemo, useRef, useState } from "react"
import { CATEGORIAS, type Imagem, type Vault } from "../vault/tipos.ts"
import {
  abrirExterna,
  DESTINOS_EXTERNOS,
  interpretarConsulta,
  type Resultado,
  termoExterno,
} from "./busca.ts"
import { haTextoSelecionado, useCompartilhar, useTeclas } from "./ganchos.ts"
import { criarIndice, type Indice, resumoCurto, secaoCurta } from "./indice.ts"
import { menu, type Opcao } from "./menu.ts"
import {
  abrir,
  alternarInicio,
  avancar,
  NAVEGACAO_VAZIA,
  type Navegacao,
  type Pagina,
  paginaAtual,
  voltar,
} from "./navegacao.ts"
import { Aviso, Retrato } from "./pecas.tsx"
import { TelaCena, TelaEntidade, TelaInicial, TelaSecao, TelaTrecho } from "./telas.tsx"

const LIMITE_DE_RESULTADOS = 12

export function Painel({ vault }: { vault: Vault }) {
  const indice = useMemo(() => criarIndice(vault), [vault])
  const { aviso, compartilhar } = useCompartilhar()
  const [nav, setNav] = useState<Navegacao>(NAVEGACAO_VAZIA)
  const [texto, setTexto] = useState("")
  const [indiceDoResultado, setIndiceDoResultado] = useState(0)
  const [notaAberta, setNotaAberta] = useState(false)
  const campo = useRef<HTMLInputElement>(null)

  // Uma página que sumiu do vault (nota renomeada no Obsidian) cai na tela inicial.
  const pagina = existe(paginaAtual(nav), indice) ? paginaAtual(nav) : null
  const blocos = menu(pagina, indice)
  const opcoes = blocos.flatMap((achado) => achado.opcoes)

  const consulta = interpretarConsulta(texto)
  const resultados =
    consulta.tipo === "vault" ? indice.busca(consulta.termo).slice(0, LIMITE_DE_RESULTADOS) : []

  const irPara = useCallback((destino: Pagina) => {
    setNav((atual) => abrir(atual, destino))
    setTexto("")
    setNotaAberta(false)
    campo.current?.blur()
  }, [])
  const aoAbrir = (opcao: Opcao) => irPara(opcao.pagina)

  useTeclas((evento) => {
    const semModificador = !evento.ctrlKey && !evento.altKey && !evento.metaKey
    const imagem = imagemDaPagina(pagina, indice)
    if (evento.key === "Escape") setNav(alternarInicio)
    else if (evento.key === "ArrowLeft" && semModificador) setNav(voltar)
    else if (evento.key === "ArrowRight" && semModificador) setNav(avancar)
    else if (evento.key === "c" && evento.ctrlKey && imagem !== null && !haTextoSelecionado()) {
      compartilhar(imagem)
    } else if (/^[1-9]$/.test(evento.key) && semModificador) {
      const escolhida = opcoes[Number(evento.key) - 1]
      if (escolhida !== undefined) aoAbrir(escolhida)
    } else if (evento.key === "n" && semModificador && pagina?.tipo === "entidade") {
      setNotaAberta((aberta) => !aberta)
    } else if (evento.key.length === 1 && semModificador) {
      // Qualquer letra leva para a busca e já entra nela.
      campo.current?.focus()
      return
    } else return
    evento.preventDefault()
  })

  const aoTeclarNoCampo = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === "ArrowDown") {
      setIndiceDoResultado((atual) => Math.min(atual + 1, resultados.length - 1))
    } else if (evento.key === "ArrowUp") {
      setIndiceDoResultado((atual) => Math.max(atual - 1, 0))
    } else if (evento.key === "Escape") {
      setTexto("")
      campo.current?.blur()
    } else if (evento.key === "Enter") {
      const escolhido = resultados[indiceDoResultado]
      if (consulta.tipo === "externa") abrirExterna(consulta)
      else if (escolhido !== undefined) irPara(paginaDoResultado(escolhido))
    } else return
    evento.preventDefault()
  }

  // Links dentro do Markdown: `[[#Cena]]` e `[[nota]]` navegam; link externo abre na aba do Beyond.
  const aoClicar = (evento: MouseEvent) => {
    const link = evento.target instanceof Element ? evento.target.closest("a") : null
    if (link === null) return
    evento.preventDefault()
    const cena = indice.cenaDoTitulo(link.dataset.cena ?? "")
    const entidade = indice.entidadeDoLink(link.dataset.entidade ?? "")
    if (cena !== undefined) irPara({ tipo: "cena", id: cena.id })
    else if (entidade !== undefined) irPara({ tipo: "entidade", id: entidade.id })
    else if (link.href.startsWith("http")) window.open(link.href, DESTINOS_EXTERNOS.b.aba)
  }

  const propsDaTela = { indice, blocos, aoAbrir, aoCompartilhar: compartilhar }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: delega o clique dos links do Markdown
    // biome-ignore lint/a11y/useKeyWithClickEvents: os links são <a> e respondem ao teclado
    <div className="flex h-screen flex-col overflow-hidden" onClick={aoClicar}>
      <Aviso texto={aviso} />
      <header className="relative mx-auto flex w-full max-w-6xl shrink-0 items-center gap-3 px-6 pt-3">
        {pagina !== null && (
          <button
            type="button"
            onClick={() => setNav(alternarInicio)}
            className="shrink-0 text-stone-500 hover:text-stone-200"
          >
            Sessão
          </button>
        )}
        <input
          ref={campo}
          value={texto}
          onChange={(evento) => {
            setTexto(evento.target.value)
            setIndiceDoResultado(0)
          }}
          onKeyDown={aoTeclarNoCampo}
          placeholder="Digite para buscar   ·   b termo: Beyond   ·   g termo: Google"
          className="w-full rounded-lg bg-stone-900 px-4 py-2 text-lg outline-none ring-amber-500/60 focus:ring-2"
        />
        {texto !== "" && (
          <ul className="absolute inset-x-6 top-full z-40 mt-1 overflow-hidden rounded-lg bg-stone-900 shadow-2xl">
            {consulta.tipo === "externa" && (
              <li className="px-4 py-2 text-stone-300">
                Enter abre "{termoExterno(consulta)}" no {DESTINOS_EXTERNOS[consulta.destino].nome}
              </li>
            )}
            {resultados.map((resultado, posicao) => (
              <li
                key={resultado.tipo === "entidade" ? resultado.entidade.id : resultado.trecho.id}
                className={`flex items-center gap-3 px-4 py-1.5 ${
                  posicao === indiceDoResultado ? "bg-stone-700" : ""
                }`}
              >
                <LinhaDeResultado resultado={resultado} />
              </li>
            ))}
          </ul>
        )}
      </header>

      <main className="mx-auto min-h-0 w-full max-w-6xl flex-1 overflow-y-auto px-6 pt-4 pb-10">
        <Tela
          pagina={pagina}
          indice={indice}
          notaAberta={notaAberta}
          propsDaTela={propsDaTela}
          irPara={irPara}
        />
      </main>

      <footer className="pointer-events-none fixed inset-x-0 bottom-0 bg-stone-950 py-1.5 text-center text-stone-600 text-xs">
        letra busca · 1-9 abre · Esc início e volta · ← → histórico · Ctrl+C manda a imagem
        {pagina?.tipo === "entidade" && " · N nota inteira"}
      </footer>
    </div>
  )
}

function Tela(props: {
  pagina: Pagina | null
  indice: Indice
  notaAberta: boolean
  propsDaTela: Omit<Parameters<typeof TelaCena>[0], "cena">
  irPara: (pagina: Pagina) => void
}) {
  const { pagina, indice, propsDaTela } = props
  if (pagina === null) return <TelaInicial {...propsDaTela} aoAbrirPagina={props.irPara} />
  switch (pagina.tipo) {
    case "cena": {
      const cena = indice.cena(pagina.id)
      return cena === undefined ? null : <TelaCena {...propsDaTela} cena={cena} />
    }
    case "entidade": {
      const entidade = indice.entidade(pagina.id)
      return entidade === undefined ? null : (
        <TelaEntidade {...propsDaTela} entidade={entidade} notaAberta={props.notaAberta} />
      )
    }
    case "trecho": {
      const trecho = indice.trecho(pagina.id)
      return trecho === undefined ? null : <TelaTrecho {...propsDaTela} trecho={trecho} />
    }
    case "secao":
      return <TelaSecao {...propsDaTela} titulo={pagina.secao} />
    case "grupo":
      return <TelaSecao {...propsDaTela} titulo={pagina.grupo} acima={pagina.secao} />
  }
}

function LinhaDeResultado({ resultado }: { resultado: Resultado }) {
  if (resultado.tipo === "entidade") {
    return (
      <>
        <Retrato imagem={resultado.entidade.imagem} className="size-7 rounded-full" />
        <span className="text-lg">{resultado.entidade.nome}</span>
        <span className="text-sm text-stone-500">{CATEGORIAS[resultado.entidade.categoria]}</span>
      </>
    )
  }
  return (
    <>
      <span className="w-7 shrink-0 text-center text-amber-500 text-xs">prep</span>
      <span className="truncate text-lg">{resumoCurto(resultado.trecho)}</span>
      <span className="shrink-0 text-sm text-stone-500">{secaoCurta(resultado.trecho)}</span>
    </>
  )
}

function paginaDoResultado(resultado: Resultado): Pagina {
  return resultado.tipo === "entidade"
    ? { tipo: "entidade", id: resultado.entidade.id }
    : { tipo: "trecho", id: resultado.trecho.id }
}

function existe(pagina: Pagina | null, indice: Indice): boolean {
  if (pagina === null) return true
  switch (pagina.tipo) {
    case "cena":
      return indice.cena(pagina.id) !== undefined
    case "entidade":
      return indice.entidade(pagina.id) !== undefined
    case "trecho":
      return indice.trecho(pagina.id) !== undefined
    case "secao":
    case "grupo":
      return indice.secoes.includes(pagina.secao)
  }
}

/** A imagem que Ctrl+C manda: o retrato da entidade, ou a primeira do trecho. */
function imagemDaPagina(pagina: Pagina | null, indice: Indice): Imagem | null {
  if (pagina?.tipo === "entidade") return indice.entidade(pagina.id)?.imagem ?? null
  if (pagina?.tipo === "trecho") {
    const trecho = indice.trecho(pagina.id)
    return trecho === undefined ? null : (indice.imagensDoTrecho(trecho)[0]?.imagem ?? null)
  }
  return null
}
