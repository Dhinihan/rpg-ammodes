# Formato para o painel

O painel de mesa (`painel/`) lê ao vivo o Markdown da sessão e o torna pesquisável durante o jogo. O rascunho é o próprio material de mesa; escreva-o neste formato desde o primeiro passo.

## Como o painel lê a sessão

- Lê todos os `.md` da pasta da sessão de maior número.
- Cada item de lista de primeiro nível e cada parágrafo vira um **trecho**: um resultado de busca que leva os títulos de seção acima dele. Subitens continuam dentro do item pai.
- O negrito no início do item vira o título do trecho, a linha que o Mestre bate o olho na lista de resultados. Um link dentro do negrito continua clicável no card.
- Os títulos de seção entram na busca: uma palavra do título lista todos os trechos da seção.
- Um `[[link]]` no trecho, ou num título de seção acima dele, põe o trecho no bloco "Nesta sessão" do card da entidade. Uma seção `### Nome` com o nome exato de uma entidade também conta.
- `![[imagem.png]]` aparece no card do trecho.

## Ligações

Ligue com `[[ ]]` toda entidade que deve lembrar o trecho na mesa: quem está na cena, o local onde ela acontece, a facção envolvida. É pelos links que o Mestre reencontra a preparação: busca o lugar onde os jogadores entraram e o card lista o que foi preparado ali. Um trecho sem link só aparece para quem lembrar as palavras dele.

## Monstros

Seção `Monstros relevantes`, um item por criatura:

```markdown
- **[Mimic](https://www.dndbeyond.com/monsters/5195123-mimic)** (CR 2): disfarçado de caixa de fundo falso no escritório do [[Llosg]]; ataca quem destrava o fundo. ![[Mimic.png]]
```

- O nome em negrito leva o link do D&D Beyond.
- O ND vem logo depois do nome.
- A função provável fica em uma linha.
- Os `[[links]]` apontam para o local, o NPC ou a facção onde a criatura pode surgir.
- A imagem, quando houver, fica na pasta da sessão e entra embutida no item.

**Encontro organizado:** uma subseção `### Nome do encontro`, com o local ligado no título, e um item por criatura abaixo dela. O título liga todas as criaturas ao local.

**Monstro solto**, sem encontro: o mesmo item, direto na seção. Os links para o local, o NPC ou a facção são o que o faz aparecer no card certo durante o jogo.

## Recompensas

Mesma forma dos monstros: nome em negrito com o link do D&D Beyond, e `[[links]]` para quem entrega a recompensa ou onde ela está.
