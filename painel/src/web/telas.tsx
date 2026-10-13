import { textoPlano } from "../vault/markdown.ts"
import { CATEGORIAS, type Cena, type Entidade, type Imagem, type Trecho } from "../vault/tipos.ts"
import { type Indice, tituloLimpo } from "./indice.ts"
import { type Bloco, bloco, type Opcao } from "./menu.ts"
import type { Pagina } from "./navegacao.ts"
import { ImagemCompartilhavel, Linhas, Markdown, Retrato, Rotulo } from "./pecas.tsx"

interface PropsDaTela {
  indice: Indice
  blocos: Bloco[]
  aoAbrir: (opcao: Opcao) => void
  aoCompartilhar: (imagem: Imagem) => void
}

export function TelaInicial(props: PropsDaTela & { aoAbrirPagina: (pagina: Pagina) => void }) {
  const { indice } = props
  return (
    <div className="space-y-5">
      {indice.abertura !== null && (
        <p className="text-lg text-stone-400 leading-snug">
          <span className="mr-2 text-amber-500 text-xs uppercase tracking-wider">Abertura</span>
          {textoPlano(indice.abertura.texto)}
        </p>
      )}
      <section>
        <Rotulo>Cenas</Rotulo>
        <Linhas opcoes={bloco(props.blocos, "cenas")} aoAbrir={props.aoAbrir} grande />
      </section>
      <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
        {indice.secoes.map((secao) => (
          <button
            key={secao}
            type="button"
            onClick={() => props.aoAbrirPagina({ tipo: "secao", secao })}
            className="hover:text-stone-200"
          >
            {tituloLimpo(secao)}
          </button>
        ))}
      </nav>
    </div>
  )
}

export function TelaCena(props: PropsDaTela & { cena: Cena }) {
  const { cena, indice, blocos } = props
  const segredos = bloco(blocos, "segredos")
  const elenco = bloco(blocos, "elenco")
  const tambem = bloco(blocos, "tambem")
  return (
    <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-8">
      <div className="space-y-5">
        <h1 className="font-semibold text-3xl">{cena.titulo}</h1>
        <ul className="list-disc space-y-1 pl-5 text-lg leading-snug">
          {indice.detalhesDaCena(cena).map((trecho) => (
            <li key={trecho.id}>
              <Markdown md={trecho.texto} indice={indice} className="[&_p]:mb-0" />
            </li>
          ))}
        </ul>
        {segredos.length > 0 && (
          <section className="rounded-lg border border-amber-600/50 bg-amber-950/40 p-3">
            <Rotulo>Pode surgir aqui</Rotulo>
            <Linhas opcoes={segredos} aoAbrir={props.aoAbrir} inteiro />
          </section>
        )}
      </div>
      <aside className="space-y-5">
        {elenco.length > 0 && (
          <section>
            <Rotulo>Quem está aqui</Rotulo>
            <ol className="space-y-2">
              {elenco.map((opcao) => (
                <li key={opcao.numero} className="group flex items-center gap-3">
                  <kbd className="w-5 text-amber-500 text-sm">
                    {opcao.numero <= 9 ? opcao.numero : ""}
                  </kbd>
                  <button
                    type="button"
                    onClick={() => props.aoAbrir(opcao)}
                    className="flex items-center gap-3 text-left"
                  >
                    <Retrato imagem={opcao.imagem ?? null} className="size-12 rounded-lg" />
                    <span className="text-lg">{opcao.rotulo}</span>
                  </button>
                  {opcao.imagem != null && (
                    <button
                      type="button"
                      onClick={() => opcao.imagem && props.aoCompartilhar(opcao.imagem)}
                      className="invisible ml-auto rounded bg-emerald-800 px-2 text-sm group-hover:visible"
                    >
                      WhatsApp
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
        {tambem.length > 0 && (
          <section>
            <Rotulo>Também nesta cena</Rotulo>
            <Linhas opcoes={tambem} aoAbrir={props.aoAbrir} inteiro />
          </section>
        )}
      </aside>
    </div>
  )
}

export function TelaEntidade(props: PropsDaTela & { entidade: Entidade; notaAberta: boolean }) {
  const { entidade, indice } = props
  const { preparacao } = indice.presenca(entidade)
  const nestaSessao = bloco(props.blocos, "nestaSessao")
  return (
    <div className="flex gap-8">
      {entidade.imagem !== null && (
        <figure className="relative w-[32%] shrink-0 self-start">
          <Retrato
            imagem={entidade.imagem}
            alt={entidade.nome}
            className="max-h-[70vh] w-full rounded-xl"
          />
          <button
            type="button"
            onClick={() => entidade.imagem && props.aoCompartilhar(entidade.imagem)}
            className="absolute right-3 bottom-3 rounded-md bg-emerald-700 px-3 py-1.5 shadow-lg hover:bg-emerald-600"
          >
            WhatsApp · Ctrl+C
          </button>
        </figure>
      )}
      <div className="min-w-0 flex-1 space-y-4">
        <header>
          <h1 className="font-semibold text-4xl">{entidade.nome}</h1>
          <p className="text-stone-500">{CATEGORIAS[entidade.categoria]}</p>
        </header>
        {entidade.resumo.length > 0 ? (
          <dl className="space-y-2">
            {entidade.resumo.map((campo) => (
              <div key={campo.campo}>
                <dt className="text-amber-500/80 text-xs uppercase tracking-wider">
                  {campo.campo}
                </dt>
                <dd className="text-xl leading-snug">{textoPlano(campo.valor)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          entidade.abertura !== null && (
            <p className="text-xl leading-snug">{textoPlano(entidade.abertura)}</p>
          )
        )}
        {preparacao.length > 0 && (
          <section>
            <Rotulo>Preparação</Rotulo>
            <ul className="list-disc space-y-1 pl-5 text-lg leading-snug">
              {preparacao.map((trecho) => (
                <li key={trecho.id}>
                  <Markdown md={trecho.texto} indice={indice} className="[&_p]:mb-0" />
                </li>
              ))}
            </ul>
          </section>
        )}
        {nestaSessao.length > 0 && (
          <section>
            <Rotulo>Nesta sessão</Rotulo>
            <Linhas opcoes={nestaSessao} aoAbrir={props.aoAbrir} />
          </section>
        )}
        {props.notaAberta && (
          <Markdown
            md={
              entidade.corpo +
              (entidade.notasPrivadas === null ? "" : `\n\n---\n\n${entidade.notasPrivadas}`)
            }
            indice={indice}
          />
        )}
      </div>
    </div>
  )
}

export function TelaTrecho(props: PropsDaTela & { trecho: Trecho }) {
  const { trecho, indice } = props
  const imagens = indice.imagensDoTrecho(trecho)
  return (
    <div className="max-w-4xl space-y-5">
      <p className="text-stone-500">{trecho.secoes.map(textoPlano).join(" > ")}</p>
      <Markdown md={trecho.texto} indice={indice} className="text-2xl leading-snug" />
      <Linhas opcoes={bloco(props.blocos, "ligacoes")} aoAbrir={props.aoAbrir} />
      {imagens.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {imagens.map(({ rotulo, imagem }) => (
            <ImagemCompartilhavel
              key={imagem.caminho}
              rotulo={rotulo}
              imagem={imagem}
              aoCompartilhar={props.aoCompartilhar}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/** Uma seção da preparação, ou um grupo dentro dela (um encontro, um local sem nota). */
export function TelaSecao(props: PropsDaTela & { titulo: string; acima?: string }) {
  return (
    <section>
      {props.acima !== undefined && <p className="text-stone-500">{tituloLimpo(props.acima)}</p>}
      <h1 className="mb-3 font-semibold text-3xl">{tituloLimpo(props.titulo)}</h1>
      <Linhas opcoes={bloco(props.blocos, "grupos")} aoAbrir={props.aoAbrir} />
      <Linhas opcoes={bloco(props.blocos, "soltos")} aoAbrir={props.aoAbrir} />
    </section>
  )
}
