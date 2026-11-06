# DS03 — Investigar as interações dos itens de ação

**Vínculo** — Subticket do [DS01](01-audit-visual-deviations.md).

**Bloqueios** — Nenhum.

**Status** — investigação entregue; correções propostas para decisão do proprietário

## Modelos sugeridos

Disponibilidade conforme conta e ferramenta.

- **OpenAI** — GPT-6.1 Sol, para rastrear eventos e estados entre seleção, edição e arraste.
- **Anthropic** — Claude Haiku 5.5, para inventariar variantes e conferir os percursos de teclado.
- **Google** — Gemini 3.8 Flash, para comparar interações e evidências por variante.

## Entrega

- [ ] Começar pelo item em linha. Mapear abertura da ação, arraste, edição do título com o PrismButton unstyled e seleção em lote. Identificar quem recebe clique, foco, Enter e Espaço e onde eventos são interrompidos.
- [ ] Percorrer as demais variantes e seus consumidores, documentando diferenças de layout e interações. Conferir seleção visual e semântica em todas, inclusive seleção por outro ponto da tela e limpeza em lote.
- [ ] Verificar com ponteiro e teclado que editar, arrastar e selecionar atuam nos alvos esperados. Propor simplificações que preservem os contratos observados e encaminhar correções separadamente.

## Execução — 06/11/2026

Relatório: [2026-11-06-ds03-action-item-interactions](../../../docs/audits/2026-11-06-ds03-action-item-interactions.md). Investigação por leitura de código, sem alterar o app nem reproduzir no navegador.

- Em modo seleção, o clique no título edita em vez de selecionar (o botão do título consome o evento).
- No Sprint, Space/Enter dentro do input de título podem iniciar arraste por teclado; o título (botão React Aria) também não funciona como alça de arraste e há três tab stops aninhados por item.
- Propostas de tickets DS03-A a DS03-F (seleção, arraste vs edição, alça/largura, semântica, toque, limpeza), a decidir pelo proprietário.

## Correção DS03-A/B — 06/11/2026

**O que mudou** (somente `app/components/features/ActionItemTitleInput.tsx`):

- DS03-A: o título lê `isSelectionMode` de `useMultiSelection`. Em modo seleção o clique não edita nem interrompe a propagação, então chega ao `onClick` do cartão, que alterna a seleção; o botão do título sai do Tab (`excludeFromTabOrder`), e Enter/Espaço passam pelo `onKeyDown` do cartão.
- DS03-B: o input de edição interrompe `pointerdown` e `keydown` na propagação, de modo que os ativadores do dnd-kit no wrapper (`useSortable` listeners, `KeyboardSensor` Space/Enter e `PointerSensor`) não iniciam arraste ao digitar ou selecionar texto. Enter/Escape continuam confirmando/cancelando.

**Verificação:** `prettier --write` e `tsc --noEmit` sem erros. Não há teste existente para `ActionItem`; nenhum foi criado. Comportamento visual e de arraste não verificado em navegador.

**Roteiro de validação (proprietário):**

1. Ative a seleção de ações no AppBar, clique no texto do título de um item (linha e bloco): ele deve marcar/desmarcar, sem virar campo de edição. Tab deve parar no cartão e Enter/Espaço alternar.
2. Desative a seleção e, na Sprint, clique no título para editar, digite espaços e aperte Enter: o espaço entra no texto e Enter confirma, sem iniciar arraste.
3. Ainda na Sprint, edite um título e arraste o mouse sobre o texto para selecioná-lo: o cartão não deve se mover.

## Limpeza DS03-F — 06/11/2026

Escopo: apenas itens de baixo risco de 3.9 (código morto e custo do contexto). Sem mudança visual ou de comportamento.

**Removido**

- `isSortable` em `ActionContainer` e `ActionItem` (prop, tipo, desestruturação e ramo `SortableItem`). Nenhum consumidor passava a prop; `ActionContainer` agora chama `sortActions` sempre, que é o caminho que já executava. `SortableItem` continua em `DnD.tsx`, usado por `HomeSprintView`.
- `VARIANT.hair` em `app/lib/CONSTANTS.ts`. Não havia consumidor de `VARIANT.hair` no app; a menção no comentário do `ActionItem` foi corrigida.
- Ramo `"hair"` em `tests/fixtures/action-title-height-browser.tsx` e `"hair"` na lista de variantes de `scripts/check-action-title-height-browser.cjs`. Como `hair` não tinha renderização própria, esses casos eram duplicatas de `line`.

**Memoizado**

- `effectiveIds` em `app/hooks/useMultiSelection.tsx` agora usa `useMemo` sobre `[selectedIds, eligibleIds]`. O valor do contexto manteve a mesma API e deixa de ser recriado a cada render do provider.

**Verificação**

- Prettier nos arquivos alterados; `npx tsc --noEmit` sem erros; `bun test tests/multi-selection.test.tsx` com 5 PASS.
- Não executado: `check-action-title-height-browser` (exige navegador/servidor, não iniciado).

**Mantido para decisão do proprietário (não alterado)**

- Diferença visual entre anel de seleção e anel de sprint.
- Semântica de arraste em modo seleção (3.8) e `touch-action` condicional (3.5).
- Unificação de `isDragging`/`data-dragging` e opacidade do original em `Draggable` (3.7). A prop `isDragging` morta de `ActionItemTitleInput` permanece, pois o arquivo não foi tocado.
- Atalhos globais de fase em modo seleção (`useActionShortcut.tsx`), tecla Escape para sair do modo seleção e custo de `setViews` por célula de calendário (3.9, impacto não medido).

## Correção DS03-D — 06/11/2026

`Draggable` (`app/components/features/DnD.tsx`), usado só no calendário e no Kanban, que têm apenas PointerSensor, deixou de repassar `tabIndex`, `role`, `aria-roledescription` e `aria-describedby` do dnd-kit. Com isso, cada item tem 2 paradas de Tab (cartão e título) em vez de 3, e acabou o `role="button"` aninhado. A Sprint (`SortableItem`, com KeyboardSensor) não mudou: o arraste por teclado precisa do wrapper focável. Testes: 45 pass e 0 fail em drag, seleção, calendários, foco de Hoje e nomes de controle.

Roteiro: aperte Tab no calendário do parceiro e no Kanban de Hoje (sem parada antes do cartão); arraste com o mouse; na Sprint, use Tab, Espaço, setas e Espaço para reordenar.

## Conferência no app real — 06/11/2026

Com login do proprietário em `127.0.0.1:5176`, só lendo, sem salvar nada:
- **DS03-A corrigido de novo:** a primeira correção não selecionava, porque o `usePress` do `PrismButton` também engolia o clique, e o cartão, que alterna a seleção, nunca o recebia. Os testes passavam porque o jsdom não reproduz isso. Agora, no modo seleção, o título é um `<span>` simples. Conferido: clicar no título seleciona a ação ("1 Selecionada"), sem editar nem abrir a gaveta.
- **Tab da gaveta:** Título → Descrição → Parceiros → Fase → Categoria → Atualizar → Essencial → Observações, numa ação de Design, sem Cor nem Instagram. Correto.
- **DS04:** o menu do perfil abre com `overlay-pop-in` de 0,2 s e fecha com `overlay-pop-out` de 0,15 s, e a busca tem fundo `overlay-fade-in`. Nova Hora abre de 7 para 72 px em 0,2 s.
- **Busca:** itens de 32 px. **AppBar:** "+" antes de "Ação".
- **Limite da automação:** o painel gera cliques "virtuais", que o checkbox do React Aria ignora no rótulo, então "Mudar Hora" só pôde ser marcado pelo teclado. Um teste com clique real (`userEvent`) marca a caixa normalmente. Não é defeito do app.
