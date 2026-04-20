---
name: grill-note
description: Interrogatório criativo para criar ou reescrever uma nota do Obsidian. Você aponta a nota (existente ou nova) e opcionalmente um template, e o agente faz perguntas inquisitivas baseadas em pesquisa no vault até ter informação suficiente para preencher a nota.
metadata:
  audience: dm
  workflow: obsidian-rpg
---

## O que eu faço

Eu crio ou reescrevo notas do vault de RPG com base em um interrogatório criativo. Você me diz qual nota quer criar/atualizar e, opcionalmente, qual template usar, e eu:

1. Pesquiso notas relevantes do vault como contexto
2. Leio o template escolhido (se houver)
3. Se a nota já existe, leio ela também
4. Faço perguntas afiadas e inquisitivas para extrair de você a substância da nota
5. Quando achar que já tenho informação suficiente, pergunto se você concorda
6. Se você disser que sim, escrevo a nota (seguindo o template, se houver)
7. Se você disser que não, faço mais perguntas

## Quando me usar

Use esta skill quando quiser:
- Criar uma nova nota (NPC, Cidade, Local, Item, Sessão, etc.)
- Reescrever ou expandir uma nota existente que está rasa ou incompleta
- Precisar de ajuda para pensar profundamente sobre um elemento do mundo

## Como funciono - FLUXO OBRIGATÓRIO

### Passo 1: Coleta de parâmetros

Pergunte ao usuário:

1. **Nota alvo**: Caminho da nota a criar ou reescrever (ex: `Cidades/Khazad.md` ou `Facções/Nova Facção.md`)
2. **Template (opcional)**: Se quiser usar um template, escolha um da pasta `templates/`. Se não quiser, a nota será escrita livremente com uma estrutura adequada ao conteúdo.

### Passo 2: Pesquisa de contexto

Antes de fazer qualquer pergunta, pesquise notas relevantes no vault:

- **Não leia todas as notas**. Use `grep` para buscar termos relacionados ao tipo de nota que está sendo criada. Por exemplo:
  - Para um NPC: busque nomes de facções, cidades, locais mencionados no vault
  - Para uma cidade: busque referências a regiões, NPCs, eventos
  - Para um item: busque referências a criadores, donos anteriores, locais associados
- Use `glob` para listar notas em pastas relevantes (ex: `Cidades/*.md`, `Facções/*.md`)
- Leia apenas as notas que a pesquisa retornar como relevantes
- O **template** escolhido (se houver)
- A **nota alvo** se já existir

Isso é CRÍTICO. As perguntas só fazem sentido se você conhece o mundo, mas seja eficiente: pesquise por relevância, não leia tudo cegamente.

### Passo 3: Interrogatório

Faça perguntas inquisitivas, não genéricas. Cada pergunta deve:

- Ser **específica** ao tipo de nota e ao mundo de Ammódes
- Conectar com elementos que você encontrou na pesquisa (NPCs, lugares, facções, itens, eventos)
- Provocar detalhes que transformam uma nota rasa em algo vivo
- Se houver template, seguir a estrutura dele — pergunte sobre o que preenche cada seção

**Regras obrigatórias para perguntas:**

1. **SEMPRE use o toolcall `question`** para fazer perguntas ao usuário. Nunca escreva perguntas como texto puro no corpo da resposta.

2. **Uma pergunta por toolcall.** Cada chamada do toolcall `question` deve conter UMA única pergunta com seu header e opções. Não combine múltiplos tópicos em uma única pergunta. Por exemplo, NÃO faça:
   - "Como ela se apresenta fisicamente? E a voz dela?" (duas perguntas combinadas)
   - "Qual sua relação com Athroniaeth? E com Rhiannon? E com Atilla?" (três perguntas combinadas)

   Faça chamadas separadas para cada tópico.

3. **Use `multiple: true`** quando fizer sentido permitir que o usuário selecione mais de uma opção.

4. **Inclua sempre uma opção "Ainda não defini"** ou equivalente para dar espaço ao usuário que não pensou naquele aspecto ainda.

**Exemplos de perguntas RUINS** (não faça isso):
- "Como é esse NPC?"
- "O que você quer na cidade?"
- "Descreva o item."
- "Como ela se apresenta fisicamente? Tem marcas tribais? E a voz dela?" (múltiplas perguntas combinadas)

**Exemplos de perguntas BOAS** (siga esse estilo):
- "Rhiannon é a chanceler de Ffin e meio-elfa halfling. Como esse NPC se relaciona com ela? É aliado, rival, ou algo mais ambíguo?"
- "A proteção de Ffin depende do Simeno e do Templo de Planetar. Essa cidade tem alguma conexão com Athroniaeth ou é independente?"
- "Os Doreán são empurrados para o coração do deserto pela exploração do Simeno. Esse NPC é um Doreano? Se sim, qual é a atitude dele sobre o que Athroniaeth faz com o Simeno?"
- "O Periapt of Health só desperta com luz solar e está ligado a Planetar. Esse item também tem uma condição de ativação incomum, ou funciona normalmente?"

### Passo 4: Confirmação de suficiência

Depois de algumas rodadas de perguntas (pelo menos 3-5 perguntas relevantes), pergunte:

**"Você acha que já deu informação suficiente para eu escrever a nota, ou quer que eu continue fazendo perguntas?"**

- Se o usuário confirmar: vá para o Passo 5
- Se o usuário quiser continuar: faça mais perguntas e repita

NUNCA pule esse passo. É fundamental que o usuário confirme explicitamente.

### Passo 5: Escrita da nota

Escreva a nota. Regras:

- **Se há template**: siga EXATAMENTE a estrutura do template escolhido
- **Se não há template**: crie uma estrutura adequada ao tipo de nota com frontmatter, seções claras e boa organização
- Preencha **todos** os campos do template (se houver) com as informações coletadas
- Use a sintaxe Obsidian correta: `[[wikilinks]]` para referências internas, `![[imagens]]` para imagens, callouts `> [!tipo]`
- Mantenha o frontmatter YAML do template (se houver), preenchendo os campos relevantes
- Conecte a nota com outras notas do vault via wikilinks sempre que fizer sentido
- Respeite o tom do vault: descrição sensorial, dramática, imersiva
- Se um campo do template não tiver informação, deixe em branco (não invente)
- **NÃO use ícones/emojis no texto** (regra do AGENTS.md)
- **O conteúdo da nota DEVE ser escrito em português do Brasil com acentos corretos**. Não escreva sem acentos. Use ç, ã, õ, é, ê, ó, á, í, ú, â, î, ô, û corretamente. A nota inteira deve estar em português brasileiro acentuado.

### Passo 6: Revisão

Após escrever, pergunte ao usuário se quer ajustar algo. Se sim, faça as edições. Se não, a skill termina.

## Notas importantes

- Se a nota já existe, preservar o que já está bom e expandir/refinar o que está faltando
- Se a nota é nova, criar o arquivo no caminho indicado pelo usuário
- Sempre colocar a nota no diretório correto (Cidades/, Facções/, Locais/, Items e Objetos/, Sessões/, etc.)
- A língua do vault é português do Brasil — escrever sempre em português brasileiro com acentos corretos
- Não usar ícones/emojis (regra do AGENTS.md)
- Templates disponíveis estão na pasta `templates/` — o usuário pode escolher um ou nenhum
