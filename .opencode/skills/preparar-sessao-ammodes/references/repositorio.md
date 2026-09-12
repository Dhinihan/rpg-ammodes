# Repositório e persistência

## Fontes de verdade

Aplique esta precedência:

1. correção explícita do usuário;
2. `Registros de Aventura/`, para o que ocorreu em mesa;
3. wiki, para lore estabelecido;
4. `Sessões/`, para preparação e possibilidades não utilizadas.

Preparação antiga não utilizada é inspiração, não cânone. Quando houver divergência, apresente-a ao usuário em vez de escolher silenciosamente.

## Próxima sessão

Detecte a próxima numeração a partir dos registros e pastas existentes. Crie um único Markdown em `Sessões/Sessão N/Sessão N.md`. Atualize-o após cada passo confirmado. Não crie arquivos separados por cena.

O HTML irmão é derivado e ignorado pelo Git por `Sessões/**/*.html`.

## Momentos de persistência

O reconhecimento inicial é somente leitura. Depois que o usuário confirmar o estado reconstruído, sincronize fatos da sessão jogada mais recente nas notas não publicadas de personagens, NPCs e locais. Depois da auditoria e aprovação final, sincronize possibilidades novas da preparação.

## Personagens jogadores

Use `templates/Personagem.md` e as notas em `Personagens/`. Registre motivações, vínculos e preferências somente quando forem explícitos. Coloque ações e acontecimentos na seção `Fatos observados em mesa`, com ligação para o registro de origem.

## NPCs e locais

Use `templates/NPC.md` para NPCs não publicados e `templates/Local.md` para locais não publicados. A ausência da tag `published` identifica uma possibilidade fora da wiki; não acrescente campo de estado. Esses arquivos continuam visíveis no repositório GitHub público.

Mantenha possibilidades fora dos índices públicos `NPCs/NPCs.md` e `Locais/Locais.md`.

### Entidade sem artigo público

Crie `NPCs/Nome.md` ou `Locais/Nome.md` sem `published`, seguindo o template correspondente.

### Entidade com artigo público

Preserve o artigo publicado. Guarde preparação em `NPCs/Nome - Notas privadas.md` ou `Locais/Nome - Notas privadas.md`, sem `published`. Consulte artigo e nota não publicada nas preparações futuras.

Arquivos com a tag `published` recebem somente informações adequadas aos jogadores; motivações ocultas, segredos e preparação ficam na nota não publicada.

## Escrita no repositório

Mantenha links Obsidian para entidades existentes. Escreva em português com acentuação correta e sem ícones. Preserve conteúdo anterior ao atualizar notas; em conflito, peça decisão ao usuário.
