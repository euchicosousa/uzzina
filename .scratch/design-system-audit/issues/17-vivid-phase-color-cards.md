# DS17 — Testar a cor viva da fase nos cartões de ação

**Status.** Aberto em 13/11/2026 a pedido do proprietário. Estudo entregue em 13/11 (bancada e relatório abaixo); aguarda a decisão do proprietário. Nenhuma alteração no app.

## O que a pessoa vê

Hoje, com "Cor da fase" ligada (menu Visualizar no parceiro, Sprint e Semana/Mês; botão no Hoje), o cartão da ação recebe um **tom suave** da cor da fase: 7% sobre o fundo no claro, 14% no escuro, com texto escuro/claro derivado da fase (DS11, classe `phase-surface` em `app/tailwind.css`).

No rascunho da página inicial (DS08, encerrado e descartado em 13/11), o cartão de exemplo usava a **cor da fase pura e cheia** (amarelo de Ideia, laranja de Fazer, rosa de Fazendo, roxo de Análise, azul de Feito, verde de Concluído) com texto preto. O proprietário gostou desse visual e quer testá-lo nos cartões reais como uma **versão alternativa**, comparada com as que já existem.

## O que comparar

1. **Três aparências lado a lado,** com dados fictícios: Padrão (sem cor), Cor da fase atual (tom suave do DS11) e Cor viva (fundo cheio da fase).
2. **Onde aparece:** Hoje, Sprint, calendário Semana/Mês do parceiro e da Home, nas variantes Linha, Bloco e Conteúdo.
3. **Legibilidade:** contraste do texto, ícones, data e avatares sobre cada uma das seis cores, no claro e no escuro. O preto passa em todas? O escuro do app com cartões cheios fica pesado?
4. **Convivência com os sinais:** atraso (hoje vermelho), Sprint, seleção, foco por teclado, hover, arraste e a sombra colorida da paleta (DS14).
5. **Densidade:** uma tela cheia de cartões vivos (calendário do mês) cansa a vista ou ajuda a ler o fluxo?
6. **Como seria oferecido:** um terceiro valor na opção "Cor da fase" (ex.: Suave / Viva) ou uma substituição. Verificar se a preferência atual aceita um novo valor sem mudança no banco.

## Critérios de conclusão

- [x] Prévia comparável das três aparências nas seis fases, claro e escuro, com atraso, Sprint, seleção e foco.
- [x] Medição de contraste do texto em cada cor e proposta de ajuste onde não passar.
- [x] Recomendação de como oferecer (opção nova ou substituição), alcance das telas e se precisa de mudança no banco.
- [x] Roteiro curto para o proprietário comparar e decidir. A implementação só começa depois da aprovação.

## Relatório do estudo (13/11/2026)

Bancada: [comparativo-ds17-cor-viva.html](../comparativo-ds17-cor-viva.html) (abrir no navegador; arquivo local, sem dados reais). Os cartões imitam o desenho real da ação nas variantes Linha, Bloco e Conteúdo, nas três aparências (Padrão, Suave e Viva), nas seis fases, no claro e no escuro. Há chaves para ver a cor viva **com e sem ajustes de leitura** e, no escuro, a cor **pura ou atenuada**. Nenhum arquivo do app foi alterado.

### Contraste sobre o fundo cheio de cada fase

| Fase | Título preto | Secundário 65% (hoje) | Data 50% (hoje) | Ajuste 85% | Título branco | Alfa mínimo do preto para 4,5:1 |
| --- | --- | --- | --- | --- | --- | --- |
| Ideia `#fbbf24` | 12,58 | 5,67 | 3,55 ✗ | 10,02 | 1,67 ✗ | 58% |
| Fazer `#f97316` | 7,49 | 4,36 ✗ | 3,04 ✗ | 6,44 | 2,80 ✗ | 67% |
| Fazendo `#ec4899` | 5,95 | 3,82 ✗ | 2,80 ✗ | 5,26 | 3,53 ✗ | 74% |
| Análise `#a855f7` | 5,31 | 3,53 ✗ | 2,65 ✗ | 4,72 | 3,96 ✗ | 81% |
| Feito `#38bdf8` | 9,80 | 5,03 | 3,31 ✗ | 8,12 | 2,14 ✗ | 61% |
| Concluído `#4ade80` | 12,05 | 5,57 | 3,52 ✗ | 9,68 | 1,74 ✗ | 59% |

Valores em X:1, limite 4,5:1 para texto normal. O ícone e a bolinha da fase, desenhados na própria cor, ficam com 1:1 nas seis.

### O que o estudo mostra

1. **O preto passa em todas as seis cores** para o título. O branco reprova em todas. A pergunta do ticket ("o preto passa?") tem resposta sim.
2. **O texto secundário e a data, do jeito que estão hoje, não passam.** A data (50%) reprova nas seis cores; o secundário (65%) reprova em Fazer, Fazendo e Análise. Na cor viva, os dois precisam ir para 85% de preto.
3. **A bolinha da fase (Linha) e o anel da fase (Bloco e Conteúdo) somem** no fundo da mesma cor. Na cor viva eles passam a ser desenhados em preto (anel vazado na Linha, anel de progresso preto no Bloco, círculo preto com check no Concluído).
4. **Ícones coloridos brigam com o fundo:** a categoria usa a cor dela (por exemplo Carrossel magenta sobre Fazendo rosa) e a prioridade usa azul, verde ou vermelho (verde sobre Concluído quase some). Na cor viva, os dois ficam pretos. Avatares mantêm as cores do parceiro, com o contorno do cartão.
5. **Atrasada continua vencendo a fase** (fundo vermelho claro, anel vermelho, ícone de alerta), como no DS11. No mês cheio de cartões vivos ela fica mais clara que os vizinhos; isso destaca, mas pode parecer "apagada". Fica para o olhar do proprietário (D4).
6. **Sprint, seleção e foco** usam o anel e o contorno da cor primária de hoje e aparecem bem nas seis cores. Seleção e Sprint continuam com o mesmo anel, como já é hoje.
7. **Hover:** escurecer levemente o fundo (luminosidade −0,04) e usar a sombra tingida da fase. Responde bem nas seis cores.
8. **Escuro:** a cor pura sobre o fundo escuro do app brilha bastante em telas cheias. A versão atenuada (luminosidade 0,72 e croma 80%) continua com o preto acima de 7,8:1 e cansa menos.
9. **Densidade:** no mês, a cor viva deixa o fluxo legível de longe (blocos de amarelo, rosa e verde mostram onde está o trabalho), mas a tela fica muito mais pesada que a Suave, principalmente no escuro.
10. **Conteúdo:** a capa mantém a cor própria da ação; só a moldura e o cabeçalho do cartão recebem a cor da fase.

### Como oferecer (recomendação)

- **Terceiro valor, sem substituir o Suave:** "Cor da fase" passa de liga/desliga para **Nenhuma / Suave / Viva** (grupo de escolha única no menu Visualizar; no Hoje, o botão vira um pequeno seletor das três opções). O Suave foi aceito no DS11 e é melhor para uso contínuo; a Viva serve para leitura rápida do fluxo.
- **Sem mudança no banco:** hoje a opção não é salva em lugar nenhum. Cada tela guarda o valor só enquanto está aberta (estado local em `UViewOptions` e no botão do Hoje) e volta a "desligada" ao recarregar. Trocar o valor de sim/não para três opções não toca o banco. **Só haveria mudança no banco** se o proprietário quiser que a escolha fique lembrada entre visitas; aí seria uma nova chave de preferência, com a função de preferências do banco atualizada antes do frontend.
- **Alcance:** as mesmas telas do DS11: calendário do parceiro, Sprint e Semana/Mês da Home, Hoje nas vistas Parceiros e Categorias (Kanban e Feed continuam sem a opção). Variantes Linha, Bloco e Conteúdo.
- **Tamanho da implementação:** uma classe nova ao lado da `phase-surface` em `app/tailwind.css`, a troca de classe e os ícones monocromáticos em `ActionItem` e variantes, o tipo da opção em `UViewOptions` e o seletor do Hoje, mais a galeria `/ui`. Sem API, sem banco.

### Decisões do proprietário

- **D1.** Oferecer a Viva como terceira opção (recomendado) ou substituir o Suave?
- **D2.** Aceitar os ajustes de leitura (texto secundário e data a 85%, ícones da fase, categoria e prioridade em preto)? Sem eles, a data reprova em todas as fases.
- **D3.** No escuro: cor pura ou atenuada (recomendado: atenuada)?
- **D4.** Atrasada na cor viva: manter o vermelho claro de hoje (recomendado) ou testar outra marcação?
- **D5.** Lembrar a escolha entre visitas? Se sim, entra uma mudança no banco antes do frontend.

### Roteiro para comparar e decidir

1. Abra a bancada e deixe "Com ajustes de leitura" e "Cor pura".
2. Seção 1: compare as três colunas no claro e no escuro. Troque para "Sem ajustes" e veja a bolinha sumir e a data apagar.
3. Seção 3: olhe Atrasada, Sprint, seleção, foco e hover na coluna Viva.
4. Seção 4: alterne Padrão, Suave e Viva no mês e, no topo, "Atenuada" para o escuro.
5. Responda D1 a D5. A implementação só começa depois.

## Referências

- [DS11 — Cor da fase nos cartões](../../archive/resolved-tickets.md) (encerrado em 12/11; plano e medidas no histórico).
- Referência visual do DS08 (descartada): cartão com `backgroundColor` igual à cor da fase, texto preto, selo da fase em `bg-black/10`, `rounded-3xl` e `shadow-lg`.
- Cores das fases: `PHASES` em `app/lib/CONSTANTS.ts`.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Montar a bancada de comparação com os cartões reais e medir contraste; escopo visual bem delimitado.
- **Codex — GPT-6 Luna.** Alternativa leve para gerar as prévias e a tabela de contraste, seguindo a lista de telas acima.
- **Claude Code — Opus 5.5.** Se a cor viva conflitar com atraso, seleção e sombra da paleta a ponto de exigir redesenhar a precedência no cartão.

## Estudo de 13/11/2026

Só estudo: nenhum código do app, banco ou configuração foi alterado e nada foi commitado. Entregável: a bancada [`comparativo-ds17-cor-viva.html`](../comparativo-ds17-cor-viva.html) (arquivo único; abra no navegador). Ela usa o CSS compilado do app (as mesmas classes do `ActionItem`, `phase-surface`, paletas e sombras do DS14), com dados fictícios. O que é **Observação** foi medido ou visto na bancada; o que é **Proposta** é sugestão minha, ainda não existe no app.

### O que foi comparado

Três aparências lado a lado: **Padrão** (sem cor), **Suave** (o DS11 de hoje) e **Cor viva** (fundo cheio da fase, texto preto, como o rascunho do DS08). Nas seis fases, nas variantes Linha, Bloco e Conteúdo, claro e escuro, em 11 paletas (inclusive as planas Carbono e Cobalto). Estados: repouso, hover, foco de teclado, modo seleção, selecionada, atrasada, em Sprint e atrasada + Sprint + selecionada. Mais um calendário de mês cheio nas três aparências e uma seção só do escuro.

### Contraste (Observação, WCAG 2.1 AA; texto normal 4,5:1, grande e ícones 3:1)

Preto sobre a cor cheia da fase:

| Fase | Cor | Preto 100% | Preto 85% (data, proposta) | Preto 50% (data de hoje) | Branco |
| --- | --- | --- | --- | --- | --- |
| Ideia | #fbbf24 | 12,58:1 | 10,02:1 | 3,55:1 | 1,67:1 |
| Fazer | #f97316 | 7,49:1 | 6,44:1 | 3,04:1 | 2,80:1 |
| Fazendo | #ec4899 | 5,95:1 | 5,26:1 | 2,80:1 | 3,53:1 |
| Análise | #a855f7 | 5,31:1 | 4,72:1 | 2,65:1 | 3,96:1 |
| Feito | #38bdf8 | 9,80:1 | 8,12:1 | 3,31:1 | 2,14:1 |
| Concluído | #4ade80 | 12,05:1 | 9,68:1 | 3,52:1 | 1,74:1 |

- O **preto puro passa em todas as seis** (mínimo 5,31:1, em Análise). O branco falha em quase todas, então a cor viva precisa de texto preto também no escuro.
- **Problema achado:** a data/hora do cartão usa 50% de opacidade. Sobre cor cheia ela cai para 2,65 a 3,55:1 e não passa em nenhuma fase. Com 72% ainda falha em Análise (3,97) e Fazendo (4,35). Com **85%** passa em todas (mínimo 4,72:1).
- **Outro problema:** os ícones de categoria têm cor própria (rosa, laranja, roxo) e a bolinha/anel/check da fase têm a cor da fase, ou seja, a mesma do fundo. Na cor viva a bolinha some e o ícone briga com o fundo. Na bancada eles viram tinta (a cor do texto) na cor viva.
- Suave de hoje: texto entre 9,9 e 10,4:1 no claro (Ônix); sem risco.
- No escuro (Ônix), menor contraste do texto principal: **A** (cor cheia igual) 5,31:1, **B** (cor 7% mais funda e 15% menos saturada) 4,53:1 em Análise, **C** (36% da cor sobre o fundo escuro, texto claro) 5,44:1 em Ideia. Os três passam no texto principal. Na data (85%), A passa em tudo; B falha em Análise (4,07) e fica no limite em Fazendo (4,50); C fica no limite em Ideia (4,45). Quem escolher B ou C precisa de data mais forte (cerca de 95%).

### Observações por ponto do ticket

1. **Legibilidade.** Observação: com preto, título e ícones leem bem nas seis cores no claro. No Bloco, o título grande (24px) tem folga. A bolinha da fase precisa virar preta e o ícone de categoria também; sem isso, a cor viva perde a informação da fase (que passaria a ser só o fundo). O selo com o nome da fase (rascunho do DS08, `bg-black/10`) cabe no Bloco largo, mas em coluna estreita (cerca de 230px) é cortado ("Faz...") quando disputa espaço com a data.
2. **Sinais (atraso, Sprint, seleção, foco, hover).**
   - Observação: o foco por teclado e a seleção usam anel de 2px na cor primária; sobre cor cheia continuam visíveis (preto no Ônix claro, branco no escuro). Em Ônix, anel de Sprint, de foco e de seleção são iguais, como já é hoje no app (a seleção se diferencia pela caixa marcada).
   - Observação: o atraso de hoje (fundo vermelho suave) **não aparece** em cartão cheio, por isso precisa de outro sinal. Proposta (as duas estão na bancada, botão "Atraso na viva"): **A**, o cartão mantém a cor da fase e ganha anel vermelho forte de 2px, brilho vermelho e um selo vermelho com alerta no lugar da bolinha; **B**, vermelho cheio com texto branco (como hoje o atraso vence a fase). Minha leitura: **A** é a melhor, porque não perde a fase e nem se confunde com Fazendo (rosa) e Fazer (laranja); na B esses dois ficam parecidos com o vermelho (há um teste de confusão na bancada). Limite da A: em paleta plana não há brilho, fica só anel e selo (ainda legível).
   - Observação: a sombra colorida da paleta (DS14) continua valendo no repouso; na cor viva usei sombra derivada da própria fase (mais forte), e paletas planas continuam sem sombra, como hoje.
3. **Densidade (mês cheio).** Observação: no mês, a cor viva dá leitura rápida do fluxo (verde dos concluídos contra o resto), mas o conjunto fica visivelmente mais pesado; com poucas ações por dia funciona bem, com 3 ou 4 por célula o olho cansa mais do que no Suave. Atrasadas viram o foco (anel vermelho) nesse mar de cor. No Conteúdo a cor viva só aparece na faixa do cabeçalho do cartão (a prévia ocupa o resto), então o efeito é pequeno e quase igual ao Suave. Proposta: oferecer a cor viva principalmente onde há poucos cartões (Hoje, Sprint, semana) e deixar o Suave como opção do mês.
4. **Escuro.** Observação: a opção A (cor cheia igual ao claro) é fiel ao rascunho, mas "acende" a tela: blocos claros sobre fundo escuro. A B reduz um pouco o brilho mas perde contraste. A C é a mais confortável e parece um Suave mais forte; é também a que menos lembra o rascunho. Proposta: começar por A ou B para quem quer cor viva de verdade e decidir olhando a bancada no escuro (seção 5).

### Como oferecer (Proposta)

- **Recomendação:** transformar o liga/desliga "Cor da fase" em três escolhas: **Desligada / Suave / Viva** (mantendo o nome "Cor da fase"), em vez de substituir o Suave. Motivos: o Suave é a versão já aceita e mais discreta para telas cheias (mês); a Viva é mais forte e tem custos próprios (ícones em tinta, atraso redesenhado, data mais forte, escuro). Substituir obrigaria a aceitar tudo isso em todas as telas.
- **Alcance:** as mesmas telas do DS11 (menu Visualizar no parceiro, Sprint e Semana/Mês; botão no Hoje). No Hoje o botão hoje é um liga/desliga; passaria a menu ou a alternância de três estados.
- **Código previsto (só para dimensionar, nada feito):** uma classe nova ao lado de `phase-surface` em `app/tailwind.css`; `showPhaseColor` de booleano para três valores no `ActionItem` e nos pontos que o repassam; `UPhaseIcon` e os ícones de categoria com modo "sobre cor"; data com 85% na cor viva; escolha do atraso e do escuro conforme a decisão.
- **Banco:** **não precisa de mudança.** Conferi em leitura: "Cor da fase" é estado de tela (`phaseColor` em `useUViewOptions` e `useState` em `useTodayPhaseColor`), não é gravado em `preferences`, em `app/lib/preferences.ts` nem em `update_my_preferences` (as migrações existentes não têm essa chave). Um terceiro valor entra sem tocar no banco. Só haveria migração (nova chave de preferência validada em `update_my_preferences`, que rejeita chaves desconhecidas) se o proprietário quiser que a escolha seja lembrada entre sessões, o que hoje já não acontece com o liga/desliga.

### Roteiro para o proprietário (5 a 8 passos)

1. Abra `.scratch/design-system-audit/comparativo-ds17-cor-viva.html` no navegador (celular também funciona). No topo, deixe as três aparências ligadas e a paleta Ônix.
2. Seção 2 (seis fases): compare Padrão, Suave e Cor viva em Linha, Bloco e Conteúdo. Pergunte-se: a cor viva ainda diz a fase só pela cor? Repare no selo "Ideia/Fazer..." no Bloco.
3. Seção 3 (estados): troque a fase para Fazendo e olhe hover, foco, seleção, Sprint e atrasada na cor viva. Dá para reconhecer cada um?
4. Seção 4 (atraso): compare as propostas A (anel + selo) e B (vermelho cheio) e escolha uma. Veja o teste de confusão no fim da seção.
5. Seção 6 (mês cheio): veja se o calendário com cor viva cansa. Use o botão "Mostrar" para ver só a Suave ou só a Viva.
6. Alterne para o tema Escuro e a seção 5: escolha entre A (cheia), B (rebaixada) e C (intermediária).
7. Experimente uma paleta colorida (Rubi, Fúcsia) e uma plana (Carbono, Cobalto): o anel de seleção e de Sprint continua visível sobre a cor?
8. Decida: (a) oferecer Desligada/Suave/Viva ou substituir; (b) atraso A ou B; (c) escuro A, B ou C; (d) se a Viva vale também no calendário do mês ou só no Hoje/Sprint/semana. A implementação só começa depois dessa decisão.

### Verificação e limites

Observação: a bancada abriu sem erros de console no painel do navegador, com os botões de tema, paleta, aparências, escuro e atraso funcionando; conferida em desktop e em 375px (sem rolagem horizontal da página; o mês rola dentro da própria caixa). Não foi testada em outros navegadores nem em celular real; a cor viva é uma simulação com CSS próprio (não existe no app) e hover/foco fixos são simulados com as mesmas variáveis do app. Contrastes: os da tabela de cores cheias são cálculo WCAG; os de escuro (B, C) e do Suave foram medidos nos pixels renderizados na paleta Ônix e podem variar um pouco em outras paletas.

### Ajuste da bancada após a primeira conferência (13/11/2026)

O proprietário apontou dois pontos na cor viva:

- **Borda:** no claro, o contorno do cartão era um anel preto a 8%, que sobre a cor cheia parecia cinza; no escuro ele sumia (e ficava bonito). Agora o contorno é um tom um pouco mais escuro da própria fase (`oklch` da cor com luminosidade −0,06), em repouso e no hover, nos dois temas.
- **Brilho de cima** (a borda superior clara que simula luz): estava com 45% de branco sobre a cor, forte demais no escuro. Agora o padrão é 22% no claro e 10% no escuro, e a bancada ganhou o seletor **Brilho de cima (Viva)** com "Como estava", "Suave" e "Sem brilho" para comparar.

Proposta, a confirmar na conferência: se o proprietário aprovar, a mesma lógica (contorno no tom da fase) vale para a aparência Suave do DS11, que hoje usa a cor da fase a 30%/55%. Verificado no painel do navegador: estilos calculados conferidos nos dois temas, seletor funcionando, sem erros no console.

### Segundo ajuste da bancada (13/11/2026)

Pedidos do proprietário e o que mudou na bancada:

- **Texto da cor viva:** na Suave, o texto tem um toque da cor da fase; na Viva estava preto puro. O proprietário pediu o inverso: texto quase branco com um toque da fase (`oklch` da cor com luminosidade 0,98 e croma 0,025), aplicado também aos ícones, à data e ao texto secundário no modo "Com ajustes de leitura". Novo seletor **Texto (Viva)**: "Claro da fase" (padrão) ou "Preto". **Observação de contraste** (coluna nova na tabela): o texto claro fica abaixo de 4,5:1 em todas as fases (Ideia 1,58; Concluído 1,66; Feito 2,02; Fazer 2,59; Fazendo 3,25; Análise 3,70). Para o texto claro passar, o fundo teria de ficar bem mais escuro; isso fica para decisão depois de ver.
- **Brilho de cima:** padrão agora é forte no claro (45% de branco, como estava) e suave no escuro (10%). Seletor com "Forte no claro, suave no escuro", "Suave nos dois" e "Sem brilho".
- **Brilho no hover:** com "Sem brilho", a linha voltava a aparecer ao passar o mouse, porque o fundo escurecia e a borda de cima não acompanhava. Corrigido: a borda de cima segue o fundo do hover.
- **Borda no escuro:** contorno mais escuro que no claro (luminosidade da fase −0,14 no escuro, −0,06 no claro).

Verificado no painel do navegador: estilos calculados, seletores e tabela; sem erros no console.

### Terceiro ajuste da bancada (13/11/2026)

Decisões e pedidos do proprietário após conferir:

- **Texto claro descartado:** ficou ruim em todas as fases. O texto da Viva passa a ser a **cor escura com tom da fase**, a mesma do texto da Suave no claro (`oklch` da fase com luminosidade 0,35 e croma 0,07), não preto puro. O seletor de texto saiu da bancada. **Observação de contraste** (tabela): título passa em Ideia (6,81), Concluído (6,27), Feito (5,21); fica abaixo de 4,5:1 em Fazer (4,12), Fazendo (3,32) e Análise (2,93). A data e o secundário a 85% dessa cor ficam abaixo em quase todas. Se a cor for aprovada, a proposta é escurecer só essas fases (luminosidade menor) até passar.
- **Escuro, cor pura x atenuada:** o proprietário achou a atenuada interessante no calendário do mês e a cor pura bonita; segue em aberto, com o seletor mantido.
- **Brilho de cima:** forte no claro está decidido. No escuro segue em dúvida; o seletor agora compara "Forte no claro, suave no escuro" e "Forte no claro e no escuro", além de "Sem brilho".
- **Sem brilho:** a borda de cima fica **transparente** (não mais da cor do fundo), na Viva e na Suave, para não aparecer quando o hover troca o fundo com atraso. A borda de cima também passou a ter a mesma transição do fundo. Essa versão é candidata às paletas sem relevo.

Verificado no painel do navegador: cor do texto, brilho nas três opções e borda transparente após a transição; sem erros no console.

### Decisões de 13/11/2026 e quarto ajuste da bancada

Decidido pelo proprietário:

- **Ajuste de leitura fixo na Viva:** anel da fase, ícones de prioridade e categoria, data e texto secundário na cor do texto da Viva. O seletor "sem ajustes" saiu.
- **Cor pura no escuro como padrão**, com a atenuada como escolha da pessoa.
- **Duas preferências novas em Minha Conta → Aparência:** "Cor viva no escuro" (Pura / Atenuada) e "Texto na cor viva" (Escuro / Claro), independentes. Os dois tons são calculados em tempo real a partir da cor fixa de cada fase; não é preciso guardar cores.
- **Brilho de cima:** 45% no claro (decidido). No escuro, um valor intermediário entre 10% e 45%; a bancada usa 25% e tem um controle deslizante para o proprietário achar o ponto.
- **Sem brilho** vale para as paletas sem relevo (Carbono e Cobalto, conferido em `app/lib/palettes.ts`): a borda de cima fica transparente em todos os cartões, inclusive Padrão e Suave.
- **Hover:** com texto escuro, o hover clareia o fundo (aumenta o contraste); com texto claro, escurece. Proposta, a confirmar na conferência.
- **Conteúdo:** continua com a cor da fase por enquanto (o proprietário pensou em tirar, mas manteve).
- **Contraste:** o proprietário está ciente de que texto escuro falha em Fazer, Fazendo e Análise e texto claro falha em todas; fica como escolha da pessoa. A tabela mostra as duas colunas.

Na bancada: bloco "Minha Conta → Aparência (simulação)" com as duas preferências, seletor de paleta com e sem relevo e o controle do brilho no escuro.

**Para a implementação (depois do aceite):** "Cor da fase" com Desligada / Suave / Viva nos menus Visualizar e no Hoje (estado de tela, sem banco). As duas preferências de Minha Conta precisam ser salvas: `update_my_preferences` rejeita chaves desconhecidas, então exigem migração no banco, além de `app/lib/preferences.ts` e `preference-persistence.ts`.

Verificado no painel do navegador: ajuste fixo, cor do texto nas duas opções, brilho a 25% e 40% no escuro, borda transparente nas paletas sem relevo; sem erros no console.

## Plano de implementação (13/11/2026, para conferência antes de disparar)

Aprovado o visual da bancada pelo proprietário em 13/11. Lista do que muda, onde e em quais arquivos.

### A. Opção "Cor da fase" com três escolhas (estado de tela, sem banco)

- **Menus Visualizar** (página do parceiro, Sprint e calendário Semana/Mês da Home): o item liga/desliga vira escolha única **Desligada / Suave / Viva**. Arquivos: `app/components/uzzina/UViewOptions.tsx` (tipo `phaseColor` passa de `boolean` para `"off" | "soft" | "vivid"`), `app/routes/app/partner/$slug.tsx`, `app/components/features/home/HomeSprintView.tsx`, `app/components/features/home/HomeCalendarView.tsx`.
- **Hoje** (Home e página dedicada, visões Parceiros e Categorias): o botão com ícone de paleta passa a alternar entre as três escolhas (ou abre um menu pequeno com elas). Arquivos: `app/components/features/home/TodayViewParts.tsx` (`useTodayPhaseColor`), `HomeTodayView.tsx`, `app/components/features/today/TodayPageView.tsx`.
- **Repasse até o cartão:** a prop `showPhaseColor` (boolean) vira o modo em `app/components/features/ActionItem.tsx`, `app/components/layout/PartnersBoard.tsx`, `CategoriesBoard.tsx`, `app/components/features/CalendarWithDnd.tsx`, `CalendarDayCell.tsx`.

### B. Visual da cor viva (CSS)

- `app/tailwind.css`: nova utility `phase-vivid` ao lado da `phase-surface`, com as regras validadas na bancada:
  - fundo cheio da fase; texto escuro da fase (`oklch` 0,35 / 0,07) ou claro (0,98 / 0,025) conforme a preferência;
  - ajuste de leitura fixo: data e texto secundário a 85% da cor do texto; bolinha da fase como anel; ícones de prioridade e categoria na cor do texto;
  - contorno no tom da fase (luminosidade −0,06 no claro, −0,14 no escuro);
  - brilho de cima 45% no claro e 25% no escuro, acompanhando o fundo no hover e com a mesma transição; nas paletas sem relevo (Carbono, Cobalto) fica transparente, usando o mesmo controle que o app já tem (`--action-top-border-override`, `--action-relief` em `app/lib/palette-vars.ts`);
  - hover clareia com texto escuro e escurece com texto claro;
  - escuro atenuado (`oklch` 0,72 e croma × 0,8) quando a preferência pedir.
- `ActionItem.tsx`: aplicar `phase-vivid` no modo Viva; os ícones de prioridade, categoria e fase recebem a cor do texto nesse modo. Atrasada continua vencendo a cor da fase (regra atual). Linha, Bloco e Conteúdo recebem a cor.

### C. Duas preferências novas em Minha Conta → Aparência (salvas no banco)

- **Cor viva no escuro:** Pura (padrão) / Atenuada. Chave proposta `vividDarkTone: "pure" | "dim"`.
- **Texto na cor viva:** Escuro (padrão) / Claro. Chave proposta `vividTextTone: "dark" | "light"`.
- Arquivos: `app/lib/preferences.ts` (tipo, padrão e leitura), `app/hooks/usePreferencePersistence.ts`, `app/contexts/AppContext.tsx` (expor as preferências), `app/routes/app/profile.tsx` (aba Aparência, controles com `PrismToggleGroup`), e a aplicação no documento (classe ou atributo no `html`) para o CSS ler.
- **Banco:** nova migração `supabase/migrations/<data>_vivid_phase_preferences.sql` recriando `update_my_preferences` a partir da versão vigente (`20261112120000_custom_theme_shadow_preferences.sql`) com as duas chaves e validação dos valores. Aplicar em produção só com autorização do proprietário, depois de conferir o SQL.

### D. Galeria, testes e documentação

- `/ui`: `app/components/ui-sections/UzzinaViewOptionsSection.tsx` com as três escolhas.
- Testes existentes a ajustar e rodar por arquivo: `tests/view-options.test.tsx`, `tests/today-preferences.test.tsx`, `tests/preference-persistence.test.ts`, `tests/palette-vars.test.ts`.
- Documentação: `docs/contracts/pages-today-profile-planning.md` (preferências e Cor da fase), este ticket e `docs/audits/CURRENT.md`.

### Fora do escopo

Gaveta, portal, revisão pública e busca global não recebem a cor. Contraste abaixo de 4,5:1 (texto escuro em Fazer, Fazendo e Análise; texto claro em todas) fica como escolha da pessoa, por decisão do proprietário. Nenhum push nem deploy.

### Verificação

`tsc`, lint e Prettier dos arquivos alterados; os quatro testes acima; conferência no navegador com dados fictícios ou só leitura (o `bun run dev` usa o banco real). Aceite visual com o proprietário.

## Implementação (13/11/2026)

Implementado na `main` do checkout, sem commit, sem push e sem aplicar SQL. O plano acima foi seguido; a única escolha aberta (controle do Hoje) está explicada abaixo.

### O que mudou

- **Cor da fase com três modos** (estado de tela, sem banco, padrão Desligada): `phaseColor` virou `"off" | "soft" | "vivid"` (tipo `PhaseColorMode` em `app/lib/CONSTANTS.ts`). No menu Visualizar é um grupo de escolha única (Desligada, Suave, Viva). No Hoje, o botão liga/desliga com ícone de paleta virou um pequeno menu com as mesmas três escolhas; o botão fica em destaque quando há cor ligada e seu nome acessível diz a escolha atual ("Cor da fase: Viva"). Escolhi o menu porque um botão que alterna em ciclo esconde as opções e não deixa claro o que vem a seguir; o menu segue o padrão dos outros menus do app.
- **Visual Viva** (`phase-vivid` em `app/tailwind.css`): valores da bancada. Fundo cheio, anel na fase (−0,06 claro, −0,14 escuro), brilho de cima de 45% no claro e 25% no escuro derivado do mesmo fundo do hover e com a mesma transição (transparente nas paletas planas, pelo `--action-relief: 0` que já existia), hover +0,04 (texto escuro) ou −0,04 (texto claro), sombra de hover tingida pela fase, escuro atenuado só no escuro. Ajustes de leitura fixos: data e secundário a 85%, bolinha como anel, ícones de prioridade e categoria e check da fase na cor do texto. Atrasada continua vencendo; Linha, Bloco e Conteúdo recebem a cor.
- **Duas preferências em Minha Conta → Aparência** (`vividDarkTone` Pura/Atenuada, `vividTextTone` Escuro/Claro), com prévia imediata na página e gravação ao salvar o formulário; aplicadas em `<html>` por `data-vivid-dark` e `data-vivid-text`.
- **Migração** `supabase/migrations/20261113120000_vivid_phase_preferences.sql`: recria `update_my_preferences` a partir da versão de `20261112120000`, com as duas chaves validadas (`pure|dim` e `dark|light`). Não aplicada.

### Arquivos

`app/lib/CONSTANTS.ts`, `app/lib/preferences.ts`, `app/tailwind.css`, `app/routes/app.tsx`, `app/routes/app/profile.tsx`, `app/components/uzzina/UViewOptions.tsx`, `app/components/uzzina/UPhaseIcon.tsx`, `app/components/features/ActionItem.tsx`, `app/components/features/ActionVariants/ActionLineVariant.tsx`, `ActionBlockVariant.tsx`, `app/components/features/home/TodayViewParts.tsx`, `app/components/layout/PartnersBoard.tsx`, `CategoriesBoard.tsx`, `app/components/ui-sections/UzzinaViewOptionsSection.tsx`, a migração acima, `docs/contracts/pages-today-profile-planning.md`, `docs/audits/CURRENT.md` e os testes `view-options`, `today-preferences`, `palette-vars` e `profile-palette-swatches` (este último só escopa o botão "Escuro" ao grupo do tema, que agora divide o nome com "Texto na cor viva").

### Verificação

`bunx tsc --noEmit -p .` limpo; os testes `view-options`, `today-preferences`, `preference-persistence`, `palette-vars` e `profile-palette-swatches` passam por arquivo; lint sem erro novo (três avisos antigos de chave por índice em `profile.tsx`). No navegador (sessão sem login, então só `/ui`): menu Visualizar com Desligada/Suave/Viva e troca de modo; cartões de teste com a classe real nas seis fases conferidos por estilo calculado e imagem em claro, escuro, atenuado, texto claro e paleta plana (brilho de cima transparente). Não foi visto: Hoje, Minha Conta, cartões reais do app, nem a gravação no banco.

### Pendente

Aceite visual do proprietário nas telas reais (Hoje, Sprint, Semana/Mês, página do parceiro; Minha Conta → Aparência); aplicar a migração em produção com autorização do proprietário antes de salvar as preferências (sem ela, o salvar falha com "Unknown preference key"); commit e push.

### Ajustes em Minha Conta pedidos na conferência (13/11/2026)

- **Prévia nas opções:** cada opção de "Cor viva no escuro" e "Texto na cor viva" mostra seis mini cartões (um por fase, com "Aa"). Em "Cor viva no escuro" a prévia fica sempre sobre o fundo escuro, com Pura ou Atenuada, usando o texto escolhido; em "Texto na cor viva" ela mostra texto escuro ou claro sobre a cor da fase, no tema atual. Componente `VividTonePreview` em `app/routes/app/profile.tsx`, com as mesmas fórmulas do `phase-vivid`.
- **Botão Salvar de Minha Conta** (pedido à parte, vale para todas as abas): sem mudanças, fica apagado (ghost, desativado) com "Tudo salvo" e ícone de nuvem com check; com qualquer mudança não salva, fica primário com "Salvar alterações", a mesma bolinha das abas e a nuvem; durante o envio, "Salvando...".

Verificado: `tsc`, testes `profile-palette-swatches` (4), `custom-theme-ds09` (7), `today-preferences` (14), `ai-task-models-preferences` (9). Não visto no navegador: o painel não estava logado.

Revisão no mesmo dia, após o proprietário ver a tela: as opções voltaram a ter só o nome (Pura / Atenuada, Escuro / Claro) e os exemplos foram para baixo delas, como a prévia da sidebar em Funcionamento. Em "Cor viva no escuro", um bloco no modo escuro; em "Texto na cor viva", dois blocos lado a lado, modo claro e modo escuro, como no tema Personalizado. Cada bloco mostra as seis fases com o nome escrito e muda de cor com animação conforme a escolha (componente `VividPhasePreview`). O botão Salvar perdeu a bolinha; as abas mantêm a delas. Testes `profile-palette-swatches`, `custom-theme-ds09` e `today-preferences` e `tsc` passaram.

### Migração aplicada (13/11/2026)

A migração `20261113120000_vivid_phase_preferences.sql` foi **aplicada em produção em 13/11/2026** (projeto `dfepmjcozszswocwvdpq`, `CREATE OR REPLACE` pela ferramenta de SQL, sem registro no histórico de migrations), com autorização do proprietário. Antes, a função vigente foi comparada com `20261112120000` (mesmas chaves, atributos e permissões). Depois: chaves `vividDarkTone` e `vividTextTone` presentes, DS14 preservado, `SECURITY DEFINER`, `search_path` vazio, EXECUTE só para `authenticated`, `service_role` e `postgres` (anon sem acesso). Validação testada com usuário fictício dentro de transação desfeita: valores válidos passam para a checagem de membro; `bright`, `black` e booleano são recusados. Salvar pelo app não foi testado.
