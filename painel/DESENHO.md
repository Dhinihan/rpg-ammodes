# Painel da mesa

Painel local para consultar durante a sessão de jogo, sem sair da tela. Substitui o HTML de painel feito por sessão.

## Problema

- Durante a sessão, o Mestre esquece a preparação. Na sessão 3, o diário do [[Llosg]] estava preparado em sete trechos diferentes do Markdown e não apareceu na mesa.
- Trocar de janela e ler durante o jogo não funciona: a memória e a impaciência ganham.
- Achar o retrato de um NPC novo ou um estandarte e mandar no grupo do WhatsApp demora.
- O painel da sessão 3, organizado por momentos, não foi consultado.

## Decisões

- **Uso:** só o notebook (1920x1200), com Chrome. O celular transmite a mesa para o jogador remoto e não serve de tela.
- **Só leitura:** nada de marcar cenas, pistas ou anotar. O Mestre nunca marcou nada em mesa.
- **Busca fuzzy** em NPCs, Locais, Facções, Itens e Objetos, Cidades, Personagens, Regras da casa e nos trechos da sessão atual. Notícias e registros de aventura ficam de fora.
- **Nesta sessão:** o card de cada entidade lista os trechos da preparação que a citam com `[[link]]`. Os trechos também são resultados próprios da busca.
- **Nota inteira** da entidade, com as notas privadas, abre sob demanda; o card fica curto.
- **Sessão atual:** a de maior número em `Sessões/`; `--sessao N` escolhe outra.
- **Imagens:** todas as do vault. Compartilhar copia a imagem reduzida para cerca de 1600 px (`ClipboardItem`) e tenta focar uma aba nomeada do WhatsApp Web; se não der, o plano B é Ctrl+Tab e Ctrl+V.
- **Busca externa:** `b termo` abre o D&D Beyond e `g termo` abre o Google, cada um numa aba nomeada reaproveitada.
- **Ao vivo:** o painel lê o vault ao vivo e atualiza quando um `.md` muda no Obsidian.

## Stack

Vite com TypeScript estrito, React e Tailwind, pnpm, Biome e `bun test`. Um único projeto: um plugin do Vite lê o vault no lado Node e entrega os dados à página. Roda com `pnpm dev`; não há build de produção.

Testes só no leitor do vault, contra o vault real. O layout não tem teste porque vai mudar muito.

## Fatos verificados

- O Chrome 155 no Linux não tem `navigator.share`; em `localhost`, `ClipboardItem` existe.
- O D&D Beyond manda `X-Frame-Options: SAMEORIGIN` e não abre em iframe.
- O vault tem 39 imagens, somando 163 MB, a maior com 10 MB; embutir num HTML único não serve.

## Descartado e por quê

- **HTML feito à mão por sessão:** a busca no vault inteiro vira trabalho manual, e o painel por momentos não foi usado.
- **HTML estático gerado:** precisa regerar a cada edição e não copia imagens, porque `file://` bloqueia a área de transferência.
- **Python:** a escolha é Vite com TypeScript.
- **Stack inteira do better-jira-view** (Effect, monorepo, react-query): pesada para ler Markdown local. Fica só a parte web, React e Tailwind.
- **Lakebed:** não entra.
- **Assumir colunas ou trilha por momentos:** o layout sai de iterações até ficar ergonômico.
- **Iframe do D&D Beyond:** o site recusa.

## Ordem

1. Projeto, leitor do vault e busca, com testes do leitor.
2. Protótipos de layout com dados reais da sessão 3, testados com dois roteiros: "os jogadores entram no escritório do Llosg, o que não posso esquecer?" e "apareceu um NPC novo, mande o retrato no grupo".
3. Decididos nos protótipos: layout, o que fica sempre à vista, o texto curto dos trechos, o conteúdo do card, os atalhos e se o foco na aba do WhatsApp funciona.
4. A skill `preparar-sessao-ammodes` já não gera HTML: `references/painel.md` descreve como o painel lê a sessão e a forma de monstros e recompensas. O texto curto dos demais trechos entra nessa referência depois dos protótipos. O HTML da sessão 3 fica como histórico.

## Depois do MVP

- Tracker de iniciativa.
- Alguma forma de consultar o D&D Beyond sem sair do painel.
