# Painel da mesa

Painel local para consultar durante a sessão de jogo, sem sair da tela. Substitui o HTML de painel feito por sessão.

## Problema

- Durante a sessão, o Mestre esquece a preparação. Na sessão 3, o diário do [[Llosg]] estava preparado em sete trechos diferentes do Markdown e não apareceu na mesa.
- Trocar de janela e ler durante o jogo não funciona: a memória e a impaciência ganham.
- Achar o retrato de um NPC novo ou um estandarte e mandar no grupo do WhatsApp demora.
- O painel da sessão 3, organizado por momentos, não foi consultado.

## Decisões

- **Uso:** só o notebook, com Chrome a 150%: a área útil é de cerca de 1280x650. O celular transmite a mesa para o jogador remoto e não serve de tela.
- **Menos é mais:** o Mestre digita, lê e volta para o jogo; não fica olhando a tela. Nada aparece sem motivo.
- **Tela inicial:** a abertura, as cenas numeradas (com quantos segredos podem surgir em cada) e uma linha com as demais seções da preparação. As teclas 1-9 abrem; qualquer letra vai para a busca.
- **Tela da cena:** os detalhes, os segredos que podem surgir ali em destaque, quem está na cena e o resto ligado a ela.
- **Segredo ligado a cena:** cada segredo aponta com `[[#Cena]]` as cenas onde pode surgir. É lembrete, não trilho. Segredo sem cena é oportunidade para pensar em mais cenas.
- **Navegação:** Esc vai para a tela inicial e, nela, volta para onde se estava; ← e → andam no histórico, como no navegador.
- **Seção com subtítulos:** lista um item por subtítulo; um NPC preparado abre o card dele com a preparação inteira.
- **Só leitura:** nada de marcar cenas, pistas ou anotar. O Mestre nunca marcou nada em mesa.
- **Busca fuzzy** em NPCs, Locais, Facções, Itens e Objetos, Cidades, Personagens, Regras da casa e nos trechos da sessão atual. Notícias e registros de aventura ficam de fora.
- **Nesta sessão:** o card de cada entidade lista os trechos da preparação que a citam com `[[link]]`. Os trechos também são resultados próprios da busca.
- **Nota inteira** da entidade, com as notas privadas, abre sob demanda; o card fica curto.
- **Sessão atual:** a de maior número em `Sessões/`; `--sessao N` escolhe outra.
- **Imagens:** todas as do vault. Compartilhar copia a imagem reduzida para cerca de 1600 px (`ClipboardItem`) e tenta focar uma aba nomeada do WhatsApp Web; se não der, o plano B é Ctrl+Tab e Ctrl+V.
- **Busca externa:** `b termo` abre o D&D Beyond e `g termo` abre o Google com o prefixo "d&d 2024", cada um numa aba nomeada reaproveitada.
- **Ao vivo:** o painel lê o vault ao vivo e atualiza quando um `.md` muda no Obsidian.

## Stack

Vite com TypeScript estrito, React e Tailwind, pnpm, Biome e `bun test`. Um único projeto: um plugin do Vite lê o vault no lado Node e entrega os dados à página. Roda com `pnpm dev`; não há build de produção.

Testes no leitor do vault, contra o vault real, e na navegação. As telas não têm teste porque ainda vão mudar.

## Fatos verificados

- O Chrome 155 no Linux não tem `navigator.share`; em `localhost`, `ClipboardItem` existe.
- O D&D Beyond manda `X-Frame-Options: SAMEORIGIN` e não abre em iframe.
- Na mesa: copiar a imagem, Ctrl+C, o foco na aba do WhatsApp Web e o tamanho da imagem colada funcionam.
- O vault tem 39 imagens, somando 163 MB, a maior com 10 MB; embutir num HTML único não serve.

## Descartado e por quê

- **HTML feito à mão por sessão:** a busca no vault inteiro vira trabalho manual, e o painel por momentos não foi usado.
- **HTML estático gerado:** precisa regerar a cada edição e não copia imagens, porque `file://` bloqueia a área de transferência.
- **Python:** a escolha é Vite com TypeScript.
- **Stack inteira do better-jira-view** (Effect, monorepo, react-query): pesada para ler Markdown local. Fica só a parte web, React e Tailwind.
- **Lakebed:** não entra.
- **Assumir colunas ou trilha por momentos:** o layout sai de iterações até ficar ergonômico.
- **Cabine** (toda a preparação à vista em painéis) e **Mesa** (cartas lado a lado): perderam para o Lançador, mais simples. Estão na branch `prototipo/painel-layout`.
- **Faixa de retratos na tela inicial:** o espaço vai para a navegação da sessão.
- **Iframe do D&D Beyond:** o site recusa.

## Feito

1. Projeto, leitor do vault e busca, com testes do leitor.
2. Protótipos de layout com dados reais da sessão 3, testados com dois roteiros: "os jogadores entram no escritório do Llosg, o que não posso esquecer?" e "apareceu um NPC novo, mande o retrato no grupo". Venceu o Lançador; o protótipo inteiro está na branch `prototipo/painel-layout`.
3. O Lançador virou o painel, com navegação testada.
4. A skill `preparar-sessao-ammodes` já não gera HTML: `references/painel.md` descreve como o painel lê a sessão e o formato de cenas, segredos, monstros e recompensas. O HTML da sessão 3 fica como histórico; o Markdown dela foi convertido para o formato novo.

## Depois do MVP

- Tracker de iniciativa.
- Alguma forma de consultar o D&D Beyond sem sair do painel.
- Pasta `Monstros/` para criaturas recorrentes, com card e imagem.
- Miniaturas, se carregar imagens de até 10 MB pesar.
