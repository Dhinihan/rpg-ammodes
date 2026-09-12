# Painel HTML da sessão

## Papel do painel

Gere `Sessões/Sessão N/Sessão N.html` diretamente e grave-o no Git junto com o Markdown da sessão. O Markdown continua sendo a fonte de verdade; o HTML é o painel de consulta durante o jogo. Não crie script, template ou gerador e não sincronize marcações ou notas do painel de volta ao repositório.

## Liberdade visual

Crie uma direção estética própria para cada sessão, fundamentada em seus locais, tensões e materiais. Paleta, tipografia, composição e interação podem mudar entre sessões; não reutilize um layout fixo.

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

Antes de gerar, confirme que há automação de navegador disponível. Quando essa capacidade estiver ausente, informe o bloqueio e encerre a materialização como incompleta, em vez de simular validação.

A interface deve ser legível em desktop, responsiva, navegável por teclado, possuir foco visível e respeitar `prefers-reduced-motion`. Contraste e tamanho de texto devem sustentar consulta rápida em uma sessão longa.

Depois de gerar:

1. abra o arquivo no navegador;
2. faça uma revisão visual da tela inteira e das regiões densas;
3. teste expansão, todas as categorias de marcação, notas, recarga, persistência, limpeza e links;
4. percorra os controles por teclado e confira o foco;
5. inspecione o comportamento responsivo, a regra de movimento reduzido e o console;
6. corrija todo defeito encontrado e repita os testes afetados.

O painel está concluído somente quando todo conteúdo aprovado está acessível; expansão, cenas, pistas, demais marcações, notas, persistência, limpeza e links funcionam; teclado, foco, responsividade e movimento reduzido foram verificados; e o console não apresenta erros.
