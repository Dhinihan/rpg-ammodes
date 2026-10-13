import { beforeAll, describe, expect, test } from "bun:test"
import { join } from "node:path"
import { trechosQueCitam } from "./consulta.ts"
import { lerVault } from "./ler-vault.ts"
import { primeiroCallout, trechos, wikilinks } from "./markdown.ts"
import type { IdEntidade, Vault } from "./tipos.ts"

const RAIZ = join(import.meta.dir, "../../..")

describe("Markdown do Obsidian", () => {
  test("wikilink com rótulo escapado em tabela e com seção", () => {
    expect(wikilinks("| ![[Cyfrin.png\\|250]] | [[Llosg#Segredos|o mago]] |")).toEqual([
      { alvo: "Cyfrin.png", rotulo: "250", embutido: true },
      { alvo: "Llosg", rotulo: "o mago", embutido: false },
    ])
  })

  test("callout ignora o `::` do Dataview e os campos vazios", () => {
    const corpo = "> [!info] Resumo Rápido\n> **O que é:** :: Um salão.\n> **Estado:** ::\n\nTexto"
    expect(primeiroCallout(corpo)).toEqual([{ campo: "O que é", valor: "Um salão." }])
  })

  test("cada item de lista vira um trecho com as seções acima e o negrito como título", () => {
    const corpo = [
      "# Sessão",
      "## 3. Cenas",
      "1. **Escritório do [[Llosg]]:** o diário",
      "   continua aqui.",
      "### Guardião",
      "- [Mimic](https://x) — caixa.",
      "",
      "Parágrafo solto.",
    ].join("\n")
    expect(trechos(corpo)).toEqual([
      {
        secoes: ["3. Cenas"],
        titulo: "Escritório do Llosg",
        texto: "**Escritório do [[Llosg]]:** o diário\n   continua aqui.",
      },
      { secoes: ["3. Cenas", "Guardião"], titulo: null, texto: "[Mimic](https://x) — caixa." },
      { secoes: ["3. Cenas", "Guardião"], titulo: null, texto: "Parágrafo solto." },
    ])
  })
})

describe("formato de monstro da skill preparar-sessao-ammodes", () => {
  test("o nome em negrito com link vira o título e o encontro liga o local", () => {
    const corpo = [
      "## 7. Monstros relevantes",
      "### Emboscada no [[Salão Acromático]]",
      "- **[Mimic](https://www.dndbeyond.com/monsters/1-mimic)** (CR 2): ataca. ![[Mimic.png]]",
    ].join("\n")
    const [mimic] = trechos(corpo)
    expect(mimic?.titulo).toBe("Mimic")
    expect(mimic?.secoes).toEqual(["7. Monstros relevantes", "Emboscada no [[Salão Acromático]]"])
    expect(wikilinks(mimic?.secoes.join("\n") ?? "").map((link) => link.alvo)).toEqual([
      "Salão Acromático",
    ])
  })
})

describe("vault real", () => {
  let vault: Vault
  beforeAll(async () => {
    vault = await lerVault(RAIZ, { sessao: 3 })
  })
  const entidade = (nome: string) => vault.entidades.find((achada) => achada.nome === nome)
  const citam = (nome: string) => trechosQueCitam(vault.sessao, nome as IdEntidade)

  test("índices da wiki e notas privadas não viram entidades", () => {
    const nomes = vault.entidades.map((achada) => achada.nome)
    expect(nomes).not.toContain("NPCs")
    expect(nomes).not.toContain("Regras da casa")
    expect(nomes.some((nome) => nome.endsWith("Notas privadas"))).toBe(false)
  })

  test("NPC traz retrato, resumo de interpretação e notas privadas", () => {
    const llosg = entidade("Llosg")
    expect(llosg?.categoria).toBe("npc")
    expect(String(llosg?.imagem?.caminho)).toBe("NPCs/Llosg.png")
    expect(llosg?.notasPrivadas).toContain("A Mão de Athroniaeth")
    expect(entidade("Cyfrin")?.resumo.map((campo) => campo.campo)).toContain("Voz e Trejeitos")
  })

  test("o card do Llosg lembra o diário, o mímico e a Pérola da sessão 3", () => {
    const textos = citam("Llosg").map((trecho) => trecho.texto)
    expect(textos.some((texto) => texto.startsWith("**Escritório do [[Llosg]]:**"))).toBe(true)
    expect(textos.some((texto) => texto.startsWith("O diário de [[Llosg]]"))).toBe(true)
    // O mímico cita o Llosg só pelo título da seção.
    expect(textos.some((texto) => texto.startsWith("[Mimic]"))).toBe(true)
    expect(textos.some((texto) => texto.includes("Pérola do Poder"))).toBe(true)
  })

  test("uma seção com o nome da entidade cita a entidade sem link", () => {
    expect(citam("Cyfrin").some((trecho) => trecho.texto.startsWith("Elfo, assistente"))).toBe(true)
  })

  test("sem sessão pedida, abre a de maior número", async () => {
    const atual = await lerVault(RAIZ)
    expect(atual.sessao?.nome).toBe("Sessão 3")
  })

  test("sessão inexistente diz quais existem", async () => {
    await expect(lerVault(RAIZ, { sessao: 99 })).rejects.toThrow("há 1, 1.5, 2, 3")
  })
})
