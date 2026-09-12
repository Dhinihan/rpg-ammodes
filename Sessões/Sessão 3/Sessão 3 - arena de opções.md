---
title: "Sessão 3 — arena de opções de painel"
tipo: nota
tags:
  - sessão
  - painel
---

# Sessão 3 — arena de opções de painel

O painel `Sessão 3.html` era denso demais para uso ao vivo: as 12 seções ficavam abertas ao mesmo tempo, com 16.630 caracteres de texto visível. Quatro subagentes independentes produziram uma alternativa cada, com direções de design distintas, e um juiz independente avaliou os quatro sem saber qual modelo gerou cada um. Nenhum candidato falhou na entrega.

## As quatro opções

Todas são autocontidas, funcionam offline e guardam marcações e notas em uma chave própria de `localStorage`; o `Sessão 3.html` original não foi alterado.

1. `opções/Sessão 3 - 1 consulta rápida.html` — abertura forte como herói e uma grade de cartões-resumo; cada seção abre sozinha em um painel focado, com Esc para fechar. Chave local: `ammodes-sessao-3-consulta`.
2. `opções/Sessão 3 - 2 abas (recomendada).html` — um rail com as 12 seções e uma seção por vez, atalhos de teclado 1–9/0 e setas, contadores por seção e fichas cruzadas. Chave local: `ammodes-sessao-3-abas`.
3. `opções/Sessão 3 - 3 roteiro de mesa.html` — a sessão como 6 beats na ordem da ficção, com uma gaveta de referência que guarda todo o resto. Chave local: `ammodes-sessao-3-roteiro`.
4. `opções/Sessão 3 - 4 modo duplo.html` — alternância entre MESA (só o jogo) e PREPARO (documento completo), em dois níveis de densidade. Chave local: `ammodes-sessao-3-modo-duplo`.

## Recomendação: opção 2

O juiz independente e a minha leitura convergiram na opção 2. É a de menor carga visual (1.639 caracteres visíveis contra 16.630 do painel antigo, medidos em navegador real), coloca qualquer seção a uma tecla ou um clique e não impõe uma ordem de condução à mesa. A opção 3 tem o melhor modelo para seguir a ficção, mas chega à referência em dois passos e sugere uma sequência que o Markdown não garante; a opção 1 mantém um herói pesado na abertura; a opção 4 esconde no modo MESA justamente criaturas e orientações de condução que a mesa usa.

## Grafts aplicados na opção 2

- Da opção 3: fichas cruzadas ("Fichas à mão") que saltam para o NPC, pista, criatura ou recompensa e destacam o alvo, cobrindo o ponto fraco de ver uma seção por vez.
- Da opção 1: contador global "X de 39 usados" no topo e contagem de caracteres no contador de notas.
- Da opção 4: botões "Expandir tudo / Recolher tudo" por seção com blocos recolhíveis.
- Correções próprias: `role="tablist"` no rail, remoção dos atalhos falsos "←" em Auditoria e Notas e o hex do Simeno padronizado com o painel antigo (`#63e0bd`).

Rejeitados: o seletor MESA/PREPARO (a seção ativa já resolve a densidade), a ordem fixa de beats e a grade de cartões como navegação principal.

## Conteúdo restaurado

As falas do Casse ("Pode gritar, pode bater...") e os CRs das opções conhecidas existiam apenas no painel antigo, não no Markdown. Foram restaurados nas quatro opções para a comparação ficar justa. Se preferir manter só o que está no Markdown, é só pedir a remoção.

## Verificação

- Verificação em navegador real (Playwright e Chromium) nas cinco páginas: persistência de marcações e notas após recarregar, limpeza com confirmação, teclado com foco visível, links em nova aba, 390px e 768px sem overflow horizontal, `prefers-reduced-motion` e console limpo.
- Um defeito foi encontrado e corrigido: a opção 4 tinha `id="notas"` duplicado no `<details>` e no `<textarea>`, o que impedia as notas de salvar. O checador estrutural agora acusa ids duplicados.
- Teste dirigido na opção 2: fichas cruzadas, contador global e expandir/recolher funcionam, sem erros de console.
- O painel antigo continua sendo a referência de conteúdo; as opções não foram exercitadas em mesa.

## Próximo passo

Escolha uma opção e ela pode ser promovida a `Sessão 3/Sessão 3.html` no lugar do painel atual; as outras podem ser removidas em seguida.
