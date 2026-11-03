# 04 — Seletor de data da barra de calendário (CalendarToolbar)

Status: Aprovado (proprietário, 03/11/2026). Sem commit.

Implementado em 03/11/2026: `CalendarToolbar.tsx` usa `<PrismCalendar cellSize="sm" captionLayout="dropdown" className="max-w-full" />` e o popover mantém `w-auto max-w-[calc(100vw-16px)] p-[8px]`. A quebra de linha do cabeçalho agora é do `PrismCalendar` (linha de legenda com `min-h-(--cell-size)`; bloco mês/ano `min-w-0 flex-1 flex-wrap`; gatilhos mês/ano `h-auto min-h-(--cell-size)`), sem seletores de estrutura no consumidor. Observação: a célula é 32px fixos (não escala mais com `2em`); a 200% o texto cresce dentro de 32px.

## O que é (e onde aparece na tela)

É o pequeno calendário que abre ao clicar no botão com ícone de calendário (CalendarDaysIcon) ao lado das setas "anterior/próximo". O botão fica dentro de `app/components/features/CalendarToolbar.tsx` e é usado em três telas da equipe (`/app`):

| Tela                 | Rota                                                                                           | Onde fica                                                                                       | Aparência do botão                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Hoje (página)        | `/app/today` (`TodayPageView`)                                                                 | Canto direito do cabeçalho, antes do seletor de visualização (Parceiros/Kanban/Categorias/Feed) | Só o ícone de calendário; setas ‹ › visíveis a partir de `md`                                                      |
| Bloco "Hoje" da Home | `/app` (`HomeTodayView`, via `HomeViewWrapper`)                                                | Opções do cabeçalho do bloco, ao lado do seletor de visualização                                | Só o ícone                                                                                                         |
| Página do parceiro   | `/app/partner/$slug` (`CalendarButtons`, alias do mesmo componente em `features/Calendar.tsx`) | Cabeçalho, ao lado do nome/engrenagem do parceiro                                               | Ícone + texto do mês (`showDate`: "Novembro/26" no desktop, "11/26" no celular); setas pulam 30 dias (`days={30}`) |

O que faz: ao escolher um dia no calendário, chama `setCurrentDay` (navega para aquela data: Hoje/Home trocam o dia exibido; no parceiro muda `?date=` na URL) e fecha o popover. Tem seletores de mês e ano (`captionLayout="dropdown"`). As setas ao lado andam 1 dia (ou 30 no parceiro).

Não confundir com: `ActionDatePicker` (data de uma ação, na gaveta), `BulkDateTimeDialog`, `CelebrationDialog`, filtro de datas de Fluxo (range) e o novo `PrismDateRangePicker`. Todos usam o mesmo `PrismCalendar`, mas só este tem o ajuste de tamanho abaixo.

## Estado atual

`CalendarToolbar.tsx`, linhas ~63-83: `PrismPopover className="w-auto max-w-[calc(100vw-16px)] p-[8px]"` com `PrismCalendar` recebendo uma única string de classes (linha ~69) que sobrescreve o calendário compartilhado:

- `[--cell-size:clamp(32px,2em,40px)]`: tamanho da célula próprio (32px em texto normal, 35px a 125%, 40px a 200%), em vez de `cellSize` do Prism.
- `w-[calc(7*var(--cell-size))] max-w-full`: largura do calendário = 7 células, limitada ao espaço disponível.
- `[&_[data-slot=select-trigger]]:min-h-(--cell-size)`, `:px-1`, `[data-size]:h-auto`: gatilhos de mês/ano com altura natural e menos padding.
- `[&_td>div]:aspect-auto [&_td>div>div]:size-(--cell-size)`: remove o aspect-ratio do dia e fixa o quadrado interno.
- `[&>div>div>div]:h-auto [&>div>div>div>div]:min-w-0 [&>div>div>div>div]:flex-1 [&>div>div>div>div]:flex-wrap`: o cabeçalho (setas + mês + ano) pode quebrar em duas linhas.

Esses seletores dependem da estrutura DOM interna do `PrismCalendar` (frágeis: qualquer mudança no calendário os quebra silenciosamente).

## Por que existe

Ticket 12 do safari-mobile (`.scratch/safari-mobile/issues/12-compact-date-picker-width.md`; relatório `docs/audits/2026-10-30-calendar-picker-width.md`, CURRENT.md): em 320px com texto ampliado (125% e depois 200%) o popover estourava: ex. 320px/200%: clientWidth 256 vs scrollWidth 391, grade 326,67px, última coluna e seta "próximo" para fora. Causa: padding/rem do cabeçalho e dos gatilhos de mês/ano definiam largura intrínseca maior que a disponível, e as células (largura %/aspect-square) acompanhavam. A correção foi local ao `CalendarToolbar` para não mexer no `PrismCalendar` compartilhado (range e calendário de 36px de Celebrações). Aceito pelo proprietário em 31/10 (commit `ceafc6f`). Medidas aceitas: grade 224/245/280px e popover 240/261/296px (100/125/200%), sempre clientWidth = scrollWidth, sem esconder overflow.

## Proposta

Contexto: o `PrismCalendar` está sendo alterado para colunas fluidas (largura mínima = `--cell-size`, `1fr`) com `cellSize` sm/default/lg = 32/40/48px.

1. Depois que o novo `PrismCalendar` estiver estável, remover da linha ~69 todos os overrides (`--cell-size`, `w-[calc(7*...)]`, seletores `[&_...]` e `[&>div>...]`).
2. Usar o padrão: `<PrismCalendar cellSize="sm" captionLayout="dropdown" className="max-w-full" .../>` (32px). Avaliar `default` (40px) só se couber: 7×40 = 280px + 16px de padding já passa dos 296px do popover a 320px e exige `max-w-full` + colunas fluidas encolhendo. Recomendação inicial: `sm`.
3. Manter no popover `w-auto max-w-[calc(100vw-16px)] p-[8px]` (limite de viewport); se o novo calendário já resolver o cabeçalho, avaliar remover só o que for redundante.
4. Cabeçalho (setas + mês + ano) precisa continuar podendo quebrar linha com texto grande; se o `PrismCalendar` novo não fizer isso nativamente, tratar no próprio `PrismCalendar` (e não com seletores de estrutura no consumidor).
5. Células escalarem com a fonte (hoje `2em`) é uma garantia a preservar ou substituir por `min-w` + `1fr`: números maiores a 200% devem caber no quadrado.

## Preservar (obrigatório)

- Sem overflow horizontal em 320px com texto 200% (clientWidth = scrollWidth), sem `overflow:hidden` mascarando.
- Sete colunas e setas/mês/ano alcançáveis; ordem de foco anterior → mês → ano → próximo; Escape devolve o foco ao botão; seleção por teclado (setas + Enter).
- Fonte ampliada preservada (não reduzir o texto), rolagem vertical em altura curta.
- Calendário de Celebrações (36px), range e demais consumidores sem regressão.

## Riscos

- Mudar `PrismCalendar` e este consumidor ao mesmo tempo mascara a causa de eventual regressão: validar `CalendarToolbar` isoladamente depois do Prism estar fechado.
- Células fluidas (`1fr`) em popover `w-auto` podem gerar largura circular (popover depende do conteúdo, conteúdo do popover); pode ser necessário largura mínima explícita (ex.: `min-w-[calc(7*var(--cell-size))]`).
- `sm` (32px) abaixo do alvo de toque ideal; já era 32px em texto normal e foi aceito, mas é decisão visual.
- A verificação existente (`scripts/check-calendar-width-browser.cjs`, fixture `tests/fixtures/calendar-width-browser.tsx`) cobre o comportamento antigo; confirmar se ainda reflete o componente real antes de confiar nela. Pelas preferências do proprietário, não criar testes novos por rotina.

## Critérios de aceite

- `CalendarToolbar.tsx` sem a string de overrides do `PrismCalendar` (apenas `cellSize`/`max-w-full` ou equivalente padrão).
- A 320px com texto 200%, popover sem rolagem horizontal; sete colunas e setas visíveis.
- Em 375/390/430 e desktop, calendário legível e centralizado sob o botão.
- Hoje, Home e página do parceiro continuam funcionando (selecionar dia, mês/ano, Escape, foco).
- Nenhum outro consumidor do `PrismCalendar` alterado de aparência pela remoção.

## Roteiro de validação (proprietário)

1. `/app/today`: clicar no ícone de calendário; escolher um dia, depois reabrir e trocar mês e ano pelos seletores. O dia exibido muda e o popover fecha.
2. `/app` (Home, bloco Hoje): mesmo teste.
3. `/app/partner/<slug>`: botão com "mês/ano"; escolher uma data e ver `?date=` mudar; setas pulam 30 dias.
4. Redimensionar a janela para 320px (ou DevTools, iPhone SE) e aumentar o texto (zoom de texto 125% e 200%): abrir o seletor em Hoje e no parceiro; conferir que as 7 colunas, o mês/ano e a seta de próximo aparecem por inteiro, sem barra horizontal.
5. Teclado: Tab pelo cabeçalho (anterior, mês, ano, próximo), setas nos dias, Enter seleciona, Escape fecha e devolve o foco ao botão.
6. Conferir de relance que `ActionDatePicker` (gaveta) e Celebrações não mudaram.
