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
