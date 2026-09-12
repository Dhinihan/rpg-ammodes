# Painel HTML da sessão

## Papel do painel

O Markdown é a fonte de verdade. O HTML é o painel de consulta durante o jogo. Grave-o no Git junto com o Markdown. Não crie script, template ou gerador e não sincronize marcações ou notas do painel de volta ao repositório.

## Contrato da mesa

Mantenha o casco atual do painel até o usuário dizer o contrário. Exemplo canônico: `Sessões/Sessão 3/Sessão 3 - cena dossiê.html`.

Preencha esse casco com o Markdown aprovado. Não invente uma página nova. Não traduza o MD num layout inédito.

Se a sessão já tem um painel nesse casco, atualize-o. Se não tem, copie o canônico e troque só o conteúdo.

### Ossos (obrigatórios)

- Foto na própria coluna.
- Texto: 2/3 Puxa a cena, 1/3 elenco `{ nome, papel, achado? }`.
- Batidas da esquerda conservam as linhas de corpo.
- Sem duas listas espremidas.
- Sem texto pequeno ilegível.
- Não preencha o vão sob o elenco.

### Pele

Paleta, foto e carimbo só mudam se o usuário pedir. O padrão é manter este casco.

Mantenha CSS e JavaScript embutidos, sem bibliotecas, fontes ou ativos externos. O arquivo deve funcionar localmente e sem conexão, exceto pelos links deliberados para referências como D&D Beyond. Não use ícones no texto ou na interface.

## Capacidades obrigatórias

O painel deve permitir:

- localizar a abertura forte imediatamente;
- navegar entre todas as seções usadas no Markdown;
- recolher e expandir seções;
- marcar cenas usadas;
- marcar pistas reveladas;
- marcar NPCs, locais, monstros e recompensas utilizados;
- registrar notas rápidas;
- persistir marcações e notas em `localStorage`, com chave exclusiva para a sessão;
- limpar o estado local mediante confirmação;
- abrir links de referência em nova aba.

O estado do painel serve apenas para organização durante o jogo. Não ofereça exportação e não altere Markdown, registros ou wiki.

## Qualidade

Olhe o painel no navegador se houver um à mão. Não bloqueie a conclusão por falta de Playwright ou de automação.

A interface deve ser legível em desktop, responsiva, navegável por teclado, possuir foco visível e respeitar `prefers-reduced-motion`. Contraste e tamanho de texto devem sustentar consulta rápida em uma sessão longa.

Depois de preencher o casco:

1. abra o arquivo se o navegador estiver disponível;
2. confira de relance se o casco da mesa está intacto e o conteúdo do Markdown cabe;
3. se der, teste marcações, notas, recarga e links;
4. corrija defeito óbvio encontrado.

O painel está concluído quando o Markdown aprovado está no casco da mesa, as capacidades obrigatórias existem e nada exigiu uma página nova.
