# Ajustes da seção Foco (09)

Data: 03/11/2026. Seção `/ui` "Foco" (`app/components/ui-sections/TokensFocusSection.tsx`) revisada pelo proprietário; ajustes aplicados em componentes e réplicas atualizadas. Sem commit.

Status (03/11): **Aprovado** por inteiro. O cartão `ActionItem` foi resolvido por decisão do proprietário (só anel, sem borda de foco). A2–A10 resolvidas ou aprovadas. Regra 03/11: eliminar personalizações; usar itens padrão do sistema.

## Decisões do proprietário (03/11)

### Anel externo

- Aprovado: Button, Input, Textarea, Select, Toggle, Checkbox, Radio, Calendário, Campo de hora, Combobox, alça de reordenar, remover anexo, sucesso, input inválido, campo de cor com erro.
- Aplicado: borda de foco `border-ring/60` (era `border-ring`) em input, textarea, select, combobox, input-group, date-range-picker, color-field, time-field, checkbox, radio, toggle, button, badge.
- Aplicado: thumbs de slider/color-area/color-slider com `data-[focus-visible]:ring-3 ring-ring/30` (eram invisíveis).
- Aplicado: destrutivo (botão/badge) todo em vermelho: `border-destructive/60` + `ring-destructive/30`.
- Aplicado (decisão do proprietário, 03/11): cartão `ActionItem` só com `focus-within:ring-3 focus-within:ring-ring/30`, sem borda de foco; o realce branco `border-t` do topo permanece; sprint/selecionado mantêm `ring-2 ring-primary`.
- Aplicado: editores de texto de `$slug.tsx` com `border-transparent` + `focus-within:border-ring/60` + anel (como textarea).
- Aplicado: link da miniatura (`WorkFileThumbnail`) migrou de inset para anel externo com `border-transparent`.

### Anel por dentro (inset)

- Aplicado: botão Fechar da gaveta saiu da família (agora só `focus-visible:bg-input`).
- Aplicado: regiões roláveis e carrossel perderam o foco (ver "Itens em análise"). Resta somente `conflict-comparison`.

### Foco por fundo

- Aprovado: Menu, Select, Combobox, Command, abas underline, segmento de hora, barra do editor, gatilho form-footer como exibido.
- Aplicado: aba drawer selecionada com foco recebe `bg-input`; botão Fechar da gaveta entrou aqui (`bg-input`); Ajuda e notificações unificadas em `focus-visible:bg-secondary/50`.
- Resolvido (A2): form-footer mantém o anel padrão do ghost icon/default; exemplo agora na família Anel externo.

### Sem anel de propósito

- Aprovado: título inline, comentário, data (sublinhado), botão unstyled.
- Aplicado: accordion com `hover:underline focus-visible:underline`; link do dia da Home (HomeCalendarView/HomeTodayView) com `outline-none hover:underline focus-visible:underline`, sem anel (movido para esta família).

### Seleção (não é foco)

- Aprovado: cor escolhida, cartão selecionado.
- Aplicado: dia alvo do arraste no Planejamento agora `rounded-2xl bg-primary text-primary-foreground squircle` (igual ao dia selecionado do PrismCalendar). Na vitrine está rotulado como "dia alvo do arraste", não "dia selecionado".

### Fallback global

- Aplicado: `:focus-visible { outline-style: solid; outline-width: 3px; outline-offset: 0 }` + `outline-ring/30` (anel único, sem folga branca).

## Arquivos alterados

- Prism: input, textarea, select, combobox, input-group, date-range-picker, color-field, time-field, checkbox, radio, toggle, button, badge, slider, color-area, color-slider, accordion, tabs.
- `app/tailwind.css` (fallback global).
- Features: `HomeCalendarView.tsx`, `HomeTodayView.tsx`, `ActionItem.tsx`, `ActionFormDrawer.tsx`, `WorkFileThumbnail.tsx`, `HelpPage.tsx`, `routes/app/notifications.tsx`, `routes/app/admin/partner/$slug.tsx`, `planning/PlanningCalendarView.tsx`.
- Documentação: `TokensFocusSection.tsx`, `docs/plans/visual-controls-final-status.md` (§3.1), `AGENTS.md` (parágrafo de foco, §5), este ticket e o README.

## Itens em análise: Aplicado (03/11/2026)

Aprovado pelo proprietário e aplicado:

- Removidos `tabIndex` e anel inset de `KanbanPhasesBoard` (coluna de fase), `profile.tsx` (duas regiões), `CalendarDayCell` (região com `limitHeight`) e do carrossel de `InstagramPreview`.
- Carrossel: removidos também `onKeyDown`/`handleKeyDown` (setas); mantidos `role="region"`, `aria-roledescription`, botões Anterior/Próxima e pontos, todos alcançáveis por Tab.
- Mantido `conflict-comparison` (coluna de campos): sem filhos focáveis e o Safari exige `tabIndex` para rolar por teclado; continua como único exemplo da família inset.
- `/ui` Foco: exemplos "Região rolável" e "Carrossel" removidos; família inset mostra uma réplica do `conflict-comparison`.

## Resolvido: cartão `ActionItem`

Decisão do proprietário (03/11), aplicada em `ActionItem.tsx`: foco apenas com `focus-within:ring-3 focus-within:ring-ring/30`, sem borda de foco; `border-t` branco de realce mantido; sprint/selecionado com `ring-2 ring-primary`. Item fechado.

## Pendências da auditoria

A1 e A8 resolvidas. A2 a A10 resolvidas ou aprovadas pelo proprietário em 03/11:

| ID  | Item                                                       | Situação                                                                       |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| A2  | Gatilho `form-footer`                                      | Resolvido: anel padrão (ghost icon/default)                                    |
| A3  | Busca de parceiros                                         | Resolvido: foco padrão do Prism, sem exceção                                   |
| A4  | Família seleção: `BulkColorDialog` e `ActionColorDropdown` | Resolvido: seletores de cor usam `PrismToggleGroup`; réplica removida do `/ui` |
| A5  | Item Sair no menu                                          | Aprovado                                                                       |
| A6  | Rolagem lateral do calendário e da área de cor em 375px    | Aprovado                                                                       |
| A7  | Foco por fundo dos itens com a lista aberta                | Aprovado                                                                       |
| A8  | Anel por dentro na região rolável e no carrossel           | Resolvida: foco removido; resta só `conflict-comparison`                       |
| A9  | Contraste do anel na alça escura e no remover vermelho     | Aprovado                                                                       |
| A10 | Roteiro de Tab nos dois temas e em 375px                   | Aprovado                                                                       |
| A11 | Campo de hora repetido nas famílias 1 e 3                  | Aceito, nada a corrigir                                                        |

## Conferir no navegador

- Kanban, perfil, célula do dia e carrossel: Tab segue direto para os controles internos, sem parada na região; botões do carrossel alcançáveis.
- Alvo do arraste no Planejamento com `bg-primary` cheio: verificar se esconde o conteúdo do dia.
- Miniatura de anexo: borda transparente de 1px não deve deslocar o layout.
- Editores do admin de parceiro: foco com borda + anel.
- Thumbs de slider/color-area/color-slider sobre cores saturadas: anel visível.
- Fallback global sobre fundo cinza: anel único de 3px legível.

## Atualização 03/11: foco do cartão `ActionItem`

Aplicado em `ActionItem.tsx` (substitui o `focus-within:ring-3` anterior): `focus-within:outline-1 outline-ring/45 ring-4 ring-ring/30` (outline por fora para não cobrir o realce branco `border-t` do topo; `ring-4` porque o outline de 1px cobre o primeiro pixel do anel). Réplica em `/ui` (`TokensFocusSection`, 'Cartão de ação') e listagem de exceções atualizadas. Ajuste visual aguarda conferência do proprietário.
