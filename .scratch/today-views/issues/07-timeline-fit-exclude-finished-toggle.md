# HOJE-07 — Grupo de botões de foco na Linha do tempo (em aberto vs. todas)

**Onde abrir.** Hoje → Visualizar → Linha do tempo; também aparece no bloco Hoje da Home (mesmo componente compartilhado) e na prévia em `/ui` → Componentes Uzzina.

**Status.** approved-and-closed (aprovado pelo proprietário em 23/11/2026 após conferência local; commit local em main, sem push/deploy).

**Bloqueado por.** Nenhum (aprovado e encerrado em 23/11/2026; resta apenas push/deploy quando autorizado).

**Antes.** Na barra de controles da Linha do tempo, existe um único botão **Ajustar às ações** (`ScanIcon`, `size="icon-sm"`, `variant="secondary"`) ao lado do slider de zoom. Ele enquadra sempre da primeira até a última ação visível — incluindo ações já na fase **Concluído (`finished`)**, espremendo o restante do dia quando há concluídas cedo.

**Depois.** Em vez de manter um botão de ajustar + um toggle separado (o que duplicaria comandos), o botão único dá lugar a um **`PrismButtonGroup`** (`size="sm"`, `attached={false}`, preservando `size="icon-sm"` e `variant="secondary"` lado a lado conforme DS18) com **dois botões diretos**, cada um com `aria-label` e `<PrismTooltip>`:

1. **Focar ações em aberto:** enquadra da primeira à última ação visível com `phase !== "finished"` (mantendo ações em **Feito / `done`** dentro do foco das abertas). **Fallback automático:** se todas as ações visíveis dos responsáveis selecionados já estiverem em `phase === "finished"`, o botão funciona como o foco completo e enquadra todas normalmente.
2. **Focar todas as ações:** enquadra da primeira à última ação visível dos responsáveis selecionados, incluindo `finished`.

Nos dois casos, todas as ações concluídas continuam normalmente visíveis na grade (nenhuma ação é ocultada). Os botões apenas ajustam câmera (zoom e centralização horizontal) ao clicar e só ficam desabilitados quando `visibleActions.length === 0 || viewportWidth === 0`.

## Opções de ícones para o grupo (`lucide-react` disponíveis no projeto)

- **Opção A (Recomendada — mesma família de enquadramento):** `FocusIcon` (focar ações em aberto: moldura com alvo no centro) + `ScanIcon` (focar todas as ações: moldura ampla atual).
- **Opção B (Focar vs. abrir intervalo):** `FocusIcon` (focar ações em aberto) + `UnfoldHorizontalIcon` (ou `Maximize2Icon`) para focar todas as ações no eixo horizontal.
- **Opção C (Foco vs. incluindo concluídas):** `FocusIcon` (focar ações em aberto) + `ClockCheckIcon` para indicar o ajuste considerando também as concluídas.

## Plano técnico previsto (somente após aprovação)

1. **`app/utils/timeline.ts`:** extrair helper puro (`selectTimelineFitIntervals` / `getTimelineFitTargets`) recebendo os intervalos com sua fase (`phase`) e `includeFinished: boolean`. Quando `includeFinished` for `false`, filtra por `phase !== PHASES.finished.slug`; se o resultado ficar vazio, retorna todos os intervalos (fallback automático).
2. **`app/components/layout/TimelineBoard.tsx` (`TimelineGrid`):**
   - Atualizar `getFitCamera(width, includeFinished)` e `fitActions(includeFinished)` para consultar o helper puro.
   - Substituir o botão único por `<PrismButtonGroup size="sm" attached={false}>` com os dois `<PrismButton size="icon-sm" variant="secondary">` envolvidos individualmente por `<PrismTooltip>`.
3. **`docs/contracts/pages-today-profile-planning.md`:** atualizar o contrato da Linha do tempo descrevendo o grupo dos dois botões diretos e o fallback quando todas as ações estão concluídas.
4. **`tests/timeline.test.ts` e validação:** adicionar testes unitários do helper puro (somente abertas excluindo `finished`, `done` mantida entre abertas, fallback para todas quando só há `finished`, modo completo com todas), além de Prettier, Biome, `tsc --noEmit` e conferência manual em Hoje e Home.

## Critérios de aceite

- [x] Em Hoje → Linha do tempo e no bloco Hoje da Home, ao lado direito do slider de zoom, existe um `PrismButtonGroup` (`size="sm"`, `attached={false}`) com dois botões `icon-sm` (`secondary`), sem toggle adicional.
- [x] O botão **Focar ações em aberto** enquadra do primeiro início ao último término entre as ações visíveis com `phase !== "finished"` (incluindo `done`), sem esconder as concluídas da grade.
- [x] Se todas as ações visíveis estiverem em `phase === "finished"`, clicar em **Focar ações em aberto** faz fallback automático e enquadra todas as ações visíveis.
- [x] O botão **Focar todas as ações** enquadra todas as ações visíveis dos responsáveis selecionados (abertas + `finished`).
- [x] Os dois botões usam o par de ícones aprovado, exibem `<PrismTooltip>` explicativo e só ficam desabilitados quando não há nenhuma ação visível ou largura medida.
- [x] Comportamento e visual aprovados pelo proprietário em Hoje e Home (temas claro e escuro).

## Modelos sugeridos

- Codex — gpt-6.2-sol. Melhor custo-benefício para uma alteração localizada em grupo de botões Prism, helper puro de cálculo e testes unitários.
- Codex — gpt-6.1-terra. Alternativa leve para ajustar o grupo visual, tooltips e testes focados da Linha do tempo.
- Codex — gpt-6.2-astra. Alternativa caso queira revisão extra das interações com slider, ResizeObserver e estado de câmera.
