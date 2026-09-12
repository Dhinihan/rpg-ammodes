---
title: "Sessão 3 — arena de mesa sem scroll"
tipo: nota
tags:
  - sessão
  - painel
---

# Sessão 3 — arena de mesa sem scroll

Segunda arena, sobre a direção "modo duplo" escolhida. Desafio: o modo de mesa caber inteiro na tela do notebook, sem scroll, com pouco texto, hierarquia clara, links para o preparo e imagens do projeto. Nenhum candidato falhou na entrega; um juiz independente entregou o parecer e dois foram cancelados por não concluírem.

## As quatro opções (nesta pasta)

Todas mantêm o modo PREPARO completo, a troca de modo e uma chave de `localStorage` própria. As imagens usam caminho relativo, por isso os arquivos ficam na pasta da sessão e não em `opções/`.

1. `Sessão 3 - mesa 1 grade fixa.html` — seis blocos de mesa visíveis ao mesmo tempo numa grade; tudo à vista, com fonte menor e contadores.
2. `Sessão 3 - mesa 2 foco único.html` — um bloco por vez com tipografia grande, rail numerado e atalhos de teclado.
3. `Sessão 3 - mesa 3 trilha (recomendada).html` — seis momentos da ficção em abas, com "Decide a cena", marcações em chips, uma imagem por momento e notas sempre visíveis.
4. `Sessão 3 - mesa 4 atalhos.html` — tela de repouso mínima; as teclas 1–7 abrem painéis curtos com o essencial de cada seção.

## Recomendação: mesa 3 (trilha)

O juiz independente deu 45/50 à trilha e a recomendou como base; a minha leitura convergiu. É a mais forte em hierarquia, com "Decide a cena" destacado em cada momento, seis imagens usadas com propósito e as notas sempre à mão. Passou em todos os testes sem defeito estrutural: zero scroll e zero corte nos seis momentos em 1152×648, 1280×720, 1366×768 e 1440×900; contadores sem duplicidade; marcações sincronizadas entre mesa e preparo. Riscos: a trilha organiza a noite em momentos (mitigado pelo aviso "ordem sugerida, não trilho") e duas pistas não tinham chip na mesa, o que foi corrigido.

## Grafts e correções na base (mesa 3)

- Do candidato 2: a tecla Esc no preparo volta para a mesa.
- Correções próprias: chips das pistas 4 (broche) e 7 (Vialis) nos momentos 3 e 6; o contador da seção NPCs no preparo passa a contar só a própria seção (0/2 em vez de 0/11).
- Rejeitados: o "Agora" dinâmico do candidato 4 (redundante com o momento ativo explícito), os polegares de NPC no cabeçalho e a grade de visão total do candidato 1 (outra direção), e o foco único do candidato 2 como base (contadores e sincronização quebrados — corrigidos para a entrega como opção).

## Correções nas alternativas

- Opção 2: marcações agora sincronizam ao vivo entre mesa e preparo; os contadores passam a contar 39 marcas únicas (antes somavam cópias e mostravam "1/71").
- Opção 4: deixas do Casse restauradas no preparo; sete `<figcaption>` abertos; legendas de imagem corrigidas (o retrato de Llosg não é o mímico; o Periapt não é a Pérola); foco preso nos painéis e devolvido ao atalho ao fechar.
- Opção 1: piso da fonte de 10px para 11px, sem cortes nas quatro janelas.

## Verificação

- Playwright e Chromium: sem scroll e sem corte em 1152×648, 1280×720, 1366×768 e 1440×900 nas quatro opções; na trilha, também nos seis momentos.
- Capacidades: persistência, limpeza com confirmação, teclado com foco visível, links em nova aba, movimento reduzido, console limpo e imagens carregando.
- Julgamento: o juiz independente recomendou a trilha (45/50); dois juízes não entregaram (GLM v1 e Qwen) e foram cancelados.

## Próximo passo

Escolher uma opção; a escolhida pode substituir `Sessão 3.html`. Se o notebook tiver menos de cerca de 1150×650 de área útil, vale testar a escolhida nessa janela antes da sessão.
