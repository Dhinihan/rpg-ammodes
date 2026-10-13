// Lê o vault do disco e monta o modelo que a página consome.

import { readdir, readFile } from "node:fs/promises"
import { basename, extname, join, relative, sep } from "node:path"
import {
  primeiroCallout,
  primeiroParagrafo,
  separarFrontmatter,
  textoPlano,
  trechos,
  wikilinks,
} from "./markdown.ts"
import {
  CATEGORIAS,
  type CaminhoNoVault,
  type Categoria,
  type Cena,
  type Entidade,
  type IdCena,
  type IdEntidade,
  type Imagem,
  type Sessao,
  type Trecho,
  type Vault,
} from "./tipos.ts"

const EXTENSOES_DE_IMAGEM = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"])
const PASTAS_FORA_DO_VAULT = new Set([
  ".git",
  ".obsidian",
  ".agents",
  "node_modules",
  "painel",
  "docs",
  "templates",
])
const SUFIXO_PRIVADO = " - Notas privadas"
const PASTA_DE_SESSOES = "Sessões"
const NOME_DE_SESSAO = /^Sessão (\d+(?:\.\d+)?)$/

export interface OpcoesDeLeitura {
  /** Número da sessão; sem ele, a de maior número. */
  sessao?: number
}

export async function lerVault(raiz: string, opcoes: OpcoesDeLeitura = {}): Promise<Vault> {
  const arquivos = await listarArquivos(raiz)
  const imagens = arquivos
    .filter((caminho) => EXTENSOES_DE_IMAGEM.has(extname(caminho).toLowerCase()))
    .map((caminho): Imagem => ({ nome: basename(caminho), caminho }))
  const imagemPorNome = new Map(imagens.map((imagem) => [imagem.nome.toLowerCase(), imagem]))

  const entidades = await lerEntidades(raiz, arquivos, imagemPorNome)
  const resolver = resolvedorDeLinks(entidades)
  const sessao = await lerSessao(raiz, arquivos, opcoes.sessao, resolver)
  return { sessao, entidades, imagens }
}

async function listarArquivos(raiz: string): Promise<CaminhoNoVault[]> {
  const entradas = await readdir(raiz, { recursive: true, withFileTypes: true })
  return entradas
    .filter((entrada) => entrada.isFile())
    .map((entrada) => relative(raiz, join(entrada.parentPath, entrada.name)).split(sep).join("/"))
    .filter((caminho) => !PASTAS_FORA_DO_VAULT.has(caminho.split("/", 1)[0] ?? ""))
    .sort() as CaminhoNoVault[]
}

function categoriaDe(caminho: CaminhoNoVault): Categoria | null {
  const pasta = caminho.split("/", 1)[0]
  const par = Object.entries(CATEGORIAS).find(([, nome]) => nome === pasta)
  return par === undefined ? null : (par[0] as Categoria)
}

async function lerEntidades(
  raiz: string,
  arquivos: CaminhoNoVault[],
  imagemPorNome: Map<string, Imagem>,
): Promise<Entidade[]> {
  const notas = arquivos.filter((caminho) => caminho.endsWith(".md") && categoriaDe(caminho))
  const privadas = new Map<string, CaminhoNoVault>()
  const publicas: CaminhoNoVault[] = []
  for (const caminho of notas) {
    const nome = basename(caminho, ".md")
    if (nome.endsWith(SUFIXO_PRIVADO)) privadas.set(nome.slice(0, -SUFIXO_PRIVADO.length), caminho)
    // A nota com o nome da própria pasta é o índice da wiki, não uma entidade.
    else if (nome !== caminho.split("/", 1)[0]) publicas.push(caminho)
  }

  return Promise.all(
    publicas.map(async (caminho): Promise<Entidade> => {
      const nome = basename(caminho, ".md")
      const { dados, corpo } = separarFrontmatter(await readFile(join(raiz, caminho), "utf8"))
      const privada = privadas.get(nome)
      const notasPrivadas =
        privada === undefined
          ? null
          : separarFrontmatter(await readFile(join(raiz, privada), "utf8")).corpo
      const embutida = wikilinks(corpo).find(
        (link) => link.embutido && imagemPorNome.has(link.alvo.toLowerCase()),
      )
      const imagem =
        imagemPorNome.get((embutida?.alvo ?? "").toLowerCase()) ??
        [...EXTENSOES_DE_IMAGEM]
          .map((extensao) => imagemPorNome.get(`${nome}${extensao}`.toLowerCase()))
          .find((achada) => achada !== undefined) ??
        null
      return {
        id: nome as IdEntidade,
        nome,
        categoria: categoriaDe(caminho) as Categoria,
        caminho,
        aliases: Array.isArray(dados.aliases) ? dados.aliases.map(String) : [],
        frontmatter: dados,
        imagem,
        resumo: primeiroCallout(corpo),
        abertura: primeiroParagrafo(corpo),
        corpo,
        notasPrivadas,
      }
    }),
  )
}

/** Resolve o alvo de um `[[link]]` pelo nome da nota ou por um alias, como o Obsidian. */
function resolvedorDeLinks(entidades: Entidade[]): (alvo: string) => IdEntidade | null {
  const porNome = new Map<string, IdEntidade>()
  for (const entidade of entidades) {
    for (const alias of entidade.aliases) porNome.set(alias.toLowerCase(), entidade.id)
  }
  // Nome de nota vence alias.
  for (const entidade of entidades) porNome.set(entidade.nome.toLowerCase(), entidade.id)
  return (alvo) => porNome.get(alvo.toLowerCase()) ?? null
}

async function lerSessao(
  raiz: string,
  arquivos: CaminhoNoVault[],
  pedida: number | undefined,
  resolver: (alvo: string) => IdEntidade | null,
): Promise<Sessao | null> {
  const pastas = new Map<number, string>()
  for (const caminho of arquivos) {
    const [topo, pasta] = caminho.split("/")
    const numero = NOME_DE_SESSAO.exec(pasta ?? "")?.[1]
    if (topo === PASTA_DE_SESSOES && pasta !== undefined && numero !== undefined) {
      pastas.set(Number(numero), pasta)
    }
  }
  if (pastas.size === 0) return null
  const numero = pedida ?? Math.max(...pastas.keys())
  const nome = pastas.get(numero)
  if (nome === undefined) {
    const existentes = [...pastas.keys()].sort((a, b) => a - b).join(", ")
    throw new Error(`a sessão ${numero} não existe em ${PASTA_DE_SESSOES}/; há ${existentes}`)
  }

  const pasta = `${PASTA_DE_SESSOES}/${nome}` as CaminhoNoVault
  const notas = arquivos.filter(
    (caminho) => caminho.startsWith(`${pasta}/`) && caminho.endsWith(".md"),
  )
  const porArquivo = await Promise.all(
    notas.map(async (arquivo) => {
      const { corpo } = separarFrontmatter(await readFile(join(raiz, arquivo), "utf8"))
      return trechos(corpo).map((bruto, indice): Trecho => {
        const citadas = new Set<IdEntidade>()
        for (const secao of bruto.secoes) {
          // Uma seção como `### Cyfrin` cita a entidade mesmo sem link.
          const pelaSecao = resolver(textoPlano(secao).replace(/^\d+\.\s*/, ""))
          if (pelaSecao !== null) citadas.add(pelaSecao)
        }
        for (const link of wikilinks([...bruto.secoes, bruto.texto].join("\n"))) {
          const id = resolver(link.alvo)
          if (id !== null) citadas.add(id)
        }
        const cenas = wikilinks([...bruto.secoes, bruto.texto].join("\n"))
          .filter((link) => link.alvo === "" && link.secao !== null)
          .map((link) => idDeCena(link.secao ?? ""))
        return {
          id: `${arquivo}#${indice}`,
          arquivo,
          ...bruto,
          citadas: [...citadas],
          cenas: [...new Set(cenas)],
        }
      })
    }),
  )
  const todos = porArquivo.flat()
  return { numero, nome, pasta, trechos: todos, cenas: montarCenas(todos) }
}

const SECAO_DE_CENAS = /cenas/i

function idDeCena(titulo: string): IdCena {
  return textoPlano(titulo).toLowerCase().replace(/\s+/g, " ").trim() as IdCena
}

/**
 * Cada `###` dentro da seção de cenas é uma cena; os trechos abaixo dele são os
 * detalhes. Trechos de fora que apontam `[[#Cena]]` ficam ligados a ela.
 */
function montarCenas(todos: Trecho[]): Cena[] {
  const cenas = new Map<IdCena, Cena>()
  for (const trecho of todos) {
    const [secao, subsecao] = trecho.secoes
    if (secao === undefined || subsecao === undefined || !SECAO_DE_CENAS.test(secao)) continue
    const id = idDeCena(subsecao)
    const cena = cenas.get(id) ?? { id, titulo: textoPlano(subsecao), detalhes: [], ligados: [] }
    cena.detalhes.push(trecho.id)
    cenas.set(id, cena)
  }
  for (const trecho of todos) {
    for (const id of trecho.cenas) {
      const cena = cenas.get(id)
      if (cena !== undefined && !cena.detalhes.includes(trecho.id)) cena.ligados.push(trecho.id)
    }
  }
  // Link para cena que não existe não liga nada.
  for (const trecho of todos) trecho.cenas = trecho.cenas.filter((id) => cenas.has(id))
  return [...cenas.values()]
}
