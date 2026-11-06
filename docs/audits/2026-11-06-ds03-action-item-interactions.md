# DS03 — Interações dos itens de ação (investigação)

Data: 06/11/2026. Escopo: somente leitura de código; nenhum arquivo do app foi alterado, nenhum servidor foi iniciado. Ticket: [DS03](../../.scratch/design-system-audit/issues/03-action-item-interactions.md).

**Limite da evidência.** Tudo abaixo vem da leitura do código do repositório e das versões instaladas de `@dnd-kit/core` 6.3.1 e `react-aria` 3.50 (`node_modules/react-aria/dist/private/interactions/usePress.mjs`). Nada foi reproduzido no navegador. Cada achado traz o grau de confiança e deve ser confirmado pelo proprietário com o roteiro indicado.

Todos os caminhos abaixo são relativos a `app/components/features/`, salvo indicação.

## 1. Mapa de camadas do item em linha

Um item em linha é composto por três camadas aninhadas, cada uma com sua própria semântica de botão:

| Camada | Arquivo:linha | Papel |
| --- | --- | --- |
| Wrapper dnd-kit (`Draggable` ou `SortableItem`) | `DnD.tsx:47-53` (Draggable), `DnD.tsx:98-104` (Sortable) | Espalha `attributes` (`role="button"`, `tabIndex=0`, `aria-roledescription`, `aria-describedby`) e `listeners` (`onPointerDown`, `onKeyDown`) |
| Cartão (`content`) | `ActionItem.tsx:187-238` | `role="button"`, `tabIndex=0`, `onClick`, `onKeyDown`, `aria-pressed` só em modo seleção, `data-action-id` |
| Título (`ActionItemTitleInput`) | `ActionItemTitleInput.tsx:69-83` | `PrismButton variant="unstyled"` (React Aria `Button`) que vira `<input>` ao editar |

O wrapper só existe quando `isDraggable` (calendário: `CalendarDayCell.tsx:137,155,174`), quando o consumidor embrulha o `ActionItem` (Kanban `KanbanPhasesBoard.tsx:181`, Sprint `HomeSprintView.tsx:124`) ou quando `isSortable` (`ActionItem.tsx:297-298`, ver 4.9).

### 1.1 Quem recebe cada evento

**Abrir a ação com ponteiro.** O `onClick` do cartão (`ActionItem.tsx:197-211`) chama `onClick(action)` (override do consumidor, ex. popover de atrasadas em `routes/app/partner/$slug.tsx`) ou `setPrimaryAction(action)`. Só recebe cliques que chegam ao cartão sem passar pelo botão do título.

**Editar o título com ponteiro.** O clique no botão do título chama `preventDefault`, `stopPropagation` e `setIsEditing(true)` (`ActionItemTitleInput.tsx:76-80`). O `stopPropagation` explícito é redundante: `usePress` do React Aria já interrompe a propagação de `pointerdown`, `mousedown`, `click` e `keydown` do botão (`usePress.mjs:267,371,380,464` e adjacentes). Consequência: o cartão nunca vê esses eventos quando o alvo é o título.

**Teclado.** O cartão é tab stop (`tabIndex=0`, `ActionItem.tsx:237`). Enter/Space focados no cartão: `onKeyDown` (`ActionItem.tsx:212-235`) ignora `input`, `textarea` e `contenteditable`, faz `preventDefault`, e então alterna seleção ou abre a ação. Enter/Space focados no botão do título: `usePress` consome (keydown com `stopPropagation`), dispara `onClick` e entra em edição; o cartão não vê o evento.

**Edição.** Enter confirma e Escape cancela (`ActionItemTitleInput.tsx:53-64`); blur confirma (`:45-51`) chamando `handleAction(update_action)` com `expectedUpdatedAt` (`ActionLineVariant.tsx:45-52`, `ActionBlockVariant.tsx:28-35`). `handleSetIsEditing` (`ActionItem.tsx:121-124`) informa `setEditingId` ao provider de atalhos (`useActionShortcut.tsx:47-49,72`). Em edição o `onClick` do cartão ignora o clique (`ActionItem.tsx:204`), mas o cartão sobe de camada (`z-100`, `:177`).

**Arraste.** `PointerSensor` ativa por `onPointerDown` no wrapper, com `distance` 8 em calendário/Kanban (`hooks/useKanbanDnd.ts`) e 5 no Sprint (`HomeSprintView.tsx:53-57`). O Sprint também registra `KeyboardSensor` (`:58-60`); calendário e Kanban não têm teclado. Depois de ativado, o dnd-kit suprime o `click` seguinte com listener de captura, então soltar não abre a ação.

**Seleção em lote.** Em `isSelectionMode`, `onClick` do cartão faz `preventDefault`, `stopPropagation` e `toggleSelection` (`ActionItem.tsx:198-203`); Enter/Space também (`:222-225`). O marcador visual é um `PrismCheckbox` somente leitura, `inert` e `aria-hidden` (`:240-262`); a semântica fica no cartão, via `aria-pressed` (`:236`). Entrada/saída do modo: `AppBar.tsx:110-155`. "Limpar Seleção" em `BulkActionMenu.tsx:505`.

### 1.2 Resumo: quem faz o quê por região do item em linha

| Região | Clique | Enter/Space | Arraste (ponteiro) |
| --- | --- | --- | --- |
| Título (botão) | Edita, mesmo em modo seleção | Edita, mesmo em modo seleção | Não inicia (pointerdown interrompido) |
| Resto do cartão (ícone de fase, ícones à direita, padding) | Abre (ou alterna seleção) | Abre (ou alterna) quando o cartão tem foco | Inicia |
| Wrapper dnd-kit (tab stop próprio) | n/a | Inicia arraste por teclado só no Sprint; sem efeito em calendário/Kanban | n/a |
| Input de edição | Seleciona texto | Confirma | Pode iniciar arraste (ver 3.4) |

## 2. Variantes e consumidores

`VARIANT` = `line`, `block`, `content`, `hair` (`lib/CONSTANTS.ts:230`). `hair` não é tratado em `ActionVariantRenderer` (`ActionItem.tsx` final) nem em `variantClasses`: cai no ramo `default` da linha. Citado só em comentário. `content` cai para `line` quando a categoria não é de rede social (`ActionItem.tsx:134-137`).

| Variante | Layout | Título editável | Padding/gap | Observações |
| --- | --- | --- | --- |
| `line` | Uma linha: ícone de fase (ou alerta), sprint, título, avatares/categoria/prioridade; data aparece no hover sobre os ícones (`ActionLineVariant.tsx:57-94`) | Sim | `rounded-xl px-3 py-1` (`@xs:p-1`) | Layout padrão em Kanban, Partners/Categories boards, calendário, popover de atrasadas |
| `block` | Cartão com título grande (`text-2xl`), linha de metadados e data (`ActionBlockVariant.tsx:23-77`) | Sim | `px-4 py-3` | Home Atrasadas e Sprint (padrão) |
| `content` | Prévia 4:5 de mídia/título sobre cor (`Content.tsx`), faixa de parceiro acima (`ActionItem.tsx:264-278`) | Não (título fixo dentro de `Content`) | Sem padding próprio | Feed do Instagram em Hoje (`TodayViewParts.tsx:137`), calendário quando a visualização é `content` (`CalendarDayCell.tsx:123-141`) |

| Consumidor | Variante | Arrastar | Seleção | Arquivo |
| --- | --- | --- | --- | --- |
| Calendário (parceiro, Home) | opção do usuário, `line` para ações fora do feed | `isDraggable`, PointerSensor distância 8 | Registra via `ActionContainer` por célula | `CalendarDayCell.tsx`, `CalendarWithDnd.tsx` |
| Kanban por fase | `line` | Só desktop (`useIsDesktop`, `KanbanPhasesBoard.tsx:81-119`) | `KanbanColumn` registra | `KanbanPhasesBoard.tsx` |
| Parceiros/Categorias (Hoje) | `line` | Não | `ActionContainer` | `PartnersBoard.tsx:115`, `CategoriesBoard.tsx:98` |
| Atrasadas (Home) | `block` ou escolhida | Não | `ActionContainer` | `HomeLateView.tsx:34` |
| Popover de atrasadas (parceiro) | `line` com `onClick` override | Não | `ActionContainer` | `routes/app/partner/$slug.tsx:214` |
| Sprint | `block` ou escolhida | `SortableItem` externo, Pointer 5 + Keyboard | `useSelectionActions` direto | `HomeSprintView.tsx` |
| Feed (Hoje) | `content` | Não | `ActionContainer` | `TodayViewParts.tsx:137` |

### 2.1 Seleção visual e semântica

Fonte única: `useMultiSelection` (`hooks/useMultiSelection.tsx`). Cada contêiner publica suas ações com `useSelectionActions` (`:195-217`); `toggleSelection` ignora IDs que nenhum contêiner publicou (`:103`); `selectedIds` exposto é filtrado pelos elegíveis (`:65`). Resultado verificado na leitura:

- Seleção "de outro ponto da tela" (Cmd/Ctrl+A em `:129-151`, `selectAll`, menu em lote) atualiza todos os itens porque cada `ActionItem` lê `selectedIds` do contexto (`ActionItem.tsx:113-114`). Não há estado local de seleção por item. OK.
- "Limpar Seleção" (`BulkActionMenu.tsx:505`) esvazia os IDs e mantém o modo; o X da AppBar sai do modo e esvazia (`useMultiSelection.tsx:93-99`). Mudança de rota (`locationKey`), `popstate` e troca de visualização (`useSelectionContext`: parceiro, Hoje, Home calendário) limpam. OK.
- Semântica: o cartão usa `role="button"` + `aria-pressed` (padrão de botão de alternância). Não há `aria-selected`/`aria-checked`, nem `role="checkbox"`, nem anúncio do conjunto ("3 selecionadas"). O checkbox visual é `aria-hidden`/`inert`. É coerente, porém um leitor de tela só ouve "botão, pressionado" sem a noção de lista selecionável. Fora do modo seleção, `aria-pressed` é `undefined` (OK).
- Visual: seleção = `ring-2 ring-primary` (`ActionItem.tsx:194`), idêntico ao realce de sprint (`:173`, `showSprint`). No Sprint `showSprint=false` (`HomeSprintView.tsx:76-82`), mas em calendário/Kanban com sprint do usuário o anel de selecionado e de sprint são iguais; só o checkbox diferencia.
- O DragOverlay renderiza outro `ActionItem` e herda o estado de seleção do contexto (checkbox e `pl-8`); coerente.

## 3. Conflitos e bugs prováveis

Confiança: **A** = decorre diretamente do código lido; **M** = depende de comportamento de biblioteca já lido, a confirmar no navegador; **B** = depende de layout/CSS, precisa de verificação visual.

### 3.1 Em modo seleção, clicar no título edita em vez de selecionar (A)

`ActionItemTitleInput` não conhece `isSelectionMode`. O botão do título consome o clique (`ActionItemTitleInput.tsx:76-80`) e entra em edição; o `toggleSelection` do cartão (`ActionItem.tsx:198-203`) não é chamado. Em `line` e `block` o título ocupa a maior parte da área (ver 3.3).

Reprodução: AppBar → "Ativar seleção de ações" → clicar (ou Tab + Enter) no texto do título de um item em linha. Esperado: marcar/desmarcar. Atual: o título vira campo de edição e a seleção não muda. Clicar no ícone de fase ou no padding marca normalmente. O botão do título deveria ficar `isDisabled`/fora do foco enquanto `isSelectionMode`.

### 3.2 Teclado no Sprint: Enter/Space dentro do input de título iniciam arraste por teclado (A)

O `KeyboardSensor` do Sprint (`HomeSprintView.tsx:58-60`) usa as teclas padrão Space/Enter para iniciar e o wrapper (`SortableItem`) recebe `onKeyDown` por bolha. O ativador do dnd-kit só rejeita eventos de outro elemento se `activatorNode` estiver definido (`core.esm.js:1357-1361`); aqui `setActivatorNodeRef` nunca é usado, então qualquer keydown que chegue ao wrapper e não esteja com `defaultPrevented` ativa (`core.esm.js:3178-3181`). O `input` não faz `preventDefault` em caracteres nem em Enter (`ActionItemTitleInput.tsx:53-64`), e o `onKeyDown` do cartão retorna cedo para inputs (`ActionItem.tsx:213-219`).

Reprodução (Sprint): clicar no título para editar, digitar um espaço, ou apertar Enter para confirmar. Esperado: espaço digitado; Enter confirma. Atual (inferido): o dnd-kit chama `preventDefault` e inicia arraste por teclado; o espaço não entra no texto e a edição é interrompida. Enter/Space no cartão (fora do input) não dispara porque o cartão faz `preventDefault` antes da bolha. O mesmo vale para Space digitado no input em qualquer contêiner que passe a ter `KeyboardSensor`.

### 3.3 O título consome o ponteiro e deixa de ser alça de arraste; área de edição varia com a largura (M/B)

`usePress` interrompe `pointerdown` do botão (`usePress.mjs:371`), então o `onPointerDown` do wrapper nunca roda quando o toque começa no título. O título é `w-full` por padrão e só vira `@md:w-auto` quando o próprio cartão (`@container`, `ActionItem.tsx:187`) tem pelo menos 28rem (`ActionItemTitleInput.tsx:33`). Em células de calendário e colunas de Kanban (estreitas) o título ocupa toda a largura entre o ícone de fase e os ícones à direita: nessas larguras só é possível arrastar ou abrir pelo ícone de fase, ícones à direita e padding (`px-3 py-1`, `@xs:p-1`).

Reprodução (calendário mensal, desktop): pressionar e arrastar sobre o texto do título. Esperado: mover a ação. Atual (inferido): nada acontece (ou entra em edição ao soltar), enquanto arrastar por um ícone move. Além disso, o clique na maior parte da linha edita em vez de abrir a ação em estreito, e abre em largo (`@md`), sem indicação clara (apenas `cursor-text`). Em linhas largas, a região de `dateTimeDisplay` absoluta (`ActionLineVariant.tsx:87-93`, `opacity-0` mas capturando ponteiro) fica sobre a ponta do título e abre/arrasta ali (B).

### 3.4 Arrastar para selecionar texto dentro do input inicia arraste do cartão (M)

Em edição o wrapper continua com `listeners`. O `input` não interrompe `pointerdown`; um gesto de seleção de texto com mais de 8 px (5 no Sprint) ativa o `PointerSensor`. Reprodução: editar o título e arrastar o mouse para selecionar parte do texto; o cartão pode começar a ser arrastado. Em modo edição o item deveria desativar o arraste (`useDraggable({ disabled })`).

### 3.5 `touch-action: none` em todo item arrastável, inclusive onde não há arraste (M)

`Draggable` aplica `touchAction: "none"` no wrapper (`DnD.tsx:40-43,51`). No Kanban mobile (`useIsDesktop` falso, `KanbanPhasesBoard.tsx:81,120-129`) não existe `DndContext`, mas `Draggable` continua sendo renderizado (`KanbanPhasesBoard.tsx:181`): os itens ficam sem arraste e com rolagem por toque bloqueada quando o dedo começa sobre um item. No desktop com tela de toque (calendário), a ausência de `delay` no `PointerSensor` (apenas `distance`) faz scroll e arraste competirem. Verificar em dispositivo.

### 3.6 Três tab stops e botões aninhados por item (A)

Wrapper (`role="button"`, `tabIndex=0`, vindo de `attributes`) → cartão (`role="button"`, `tabIndex=0`) → botão do título. Em calendário e Kanban o wrapper não tem teclado funcional (sem `KeyboardSensor`), mas anuncia `aria-roledescription="draggable"` e aceita foco: uma parada de Tab sem efeito por item. Todos os `role="button"` aninhados são tratados como filhos apresentacionais por leitores de tela, então o botão do título dentro do cartão não é exposto de forma confiável (violação de interativo aninhado). No Sprint, Enter/Space focados no wrapper iniciam arraste, enquanto no cartão abrem a ação: duas paradas adjacentes com comportamentos diferentes para a mesma tecla.

### 3.7 `isDragging` e `data-dragging` em dois caminhos diferentes (A)

`Draggable`/`SortableItem` passam `isDragging` como prop se o filho é componente e `data-dragging` se é elemento DOM (`DnD.tsx:44-45,54-56,94-95,105-107`). Quando o `ActionItem` se embrulha sozinho (`isDraggable`), o filho é o `div` `content`: recebe `data-dragging`, e a classe `isDragging && "cursor-grabbing"` (`ActionItem.tsx:189`) nunca é ativada. No Kanban/Sprint o filho é o `ActionItem` e recebe a prop. Além disso, `ActionLineVariant`/`ActionBlockVariant` não repassam `isDragging` a `ActionItemTitleInput`, então a prop `isDragging` do input (`:6,73`) é código morto. `Draggable` mantém o original visível durante o arraste (a linha de opacidade está comentada, `DnD.tsx:52`), enquanto `SortableItem` aplica `opacity-20` (`:103`).

### 3.8 Seleção + arraste coexistem (A)

Em modo seleção os `listeners` continuam ativos; arrastar um item selecionado move apenas aquele item (o DragOverlay mostra um cartão com checkbox). Não há contrato documentado; decidir se o arraste deve ficar desligado em modo seleção.

### 3.9 Código sem uso e custos menores (A)

- `ActionContainer.isSortable` e o ramo `SortableItem` de `ActionItem` (`ActionItem.tsx:297-298`) não são usados por nenhum consumidor (o Sprint embrulha por fora).
- `VARIANT.hair` sem renderização própria.
- `useMultiSelection.tsx:65` recria `effectiveIds` a cada render do provider, invalidando o `useMemo` do contexto e re-renderizando todos os `ActionItem`.
- Cada célula de calendário registra seu `ActionContainer` e dispara `setViews` com cópia do mapa (`useMultiSelection.tsx:40-50`); com um mês inteiro isso são dezenas de atualizações na montagem (impacto não medido).
- Sem tecla para sair do modo seleção (Escape não é tratado em `useMultiSelection.tsx`).
- Atalhos globais (`useActionShortcut.tsx:62-70`) usam `[data-action-id]:hover, :focus-within` e ignoram só inputs; em modo seleção, letras de fase continuam alterando a ação sob o cursor.

## 4. Simplificações propostas (preservando contratos)

Contratos a preservar: clique/Enter/Space no cartão abre a ação; clique no título edita (em qualquer variante com título editável); Enter confirma, Escape cancela, blur confirma; atalhos globais por `data-action-id`; seleção única no contexto; arraste por ponteiro com distância mínima.

1. **Uma única superfície interativa por item.** Remover `role="button"`/`tabIndex` do cartão ou do wrapper dnd-kit (por exemplo `setActivatorNodeRef` + alça dedicada, ou `attributes` sem `role`/`tabIndex` quando não há `KeyboardSensor`). Elimina 3.6 e a ambiguidade de teclas.
2. **Título consciente do modo.** Passar `isDisabled` ao botão do título em `isSelectionMode` (3.1) e `excludeFromTabOrder` quando não for o alvo desejado; ou devolver o clique ao cartão com `continuePropagation`. Preferir a primeira por ser local.
3. **Arraste ciente da edição.** `useDraggable({ disabled: isEditing })` (3.4) e `activatorNode` definido para o Sprint (3.2); alternativa de menor risco: `onKeyDown` do input com `stopPropagation` para Space/Enter.
4. **Alça de arraste inequívoca na linha.** Decidir um comportamento por largura: se o título preenche a linha, oferecer uma alça visível/área reservada (ou `onPressStart` com `continuePropagation` para repassar o `pointerdown` do título ao dnd-kit, mantendo o clique como edição quando não houve movimento).
5. **Unificar `isDragging`.** Sempre passar por prop ou sempre por `data-dragging`, e remover a prop morta do input; decidir a opacidade do original em `Draggable`.
6. **Condicionar `touch-action`.** Só aplicar `touchAction: none` quando houver `DndContext` ativo, ou usar `delay` para toque.
7. **Semântica de seleção.** Avaliar `role="checkbox"` + `aria-checked` (ou lista com `aria-multiselectable`) e um anúncio do total; diferenciar visualmente o anel de seleção do anel de sprint.
8. **Limpeza.** Remover `isSortable` não usado, `VARIANT.hair` ou implementá-lo, memoizar `effectiveIds`.

## 5. Tickets de correção sugeridos (não implementados)

| Código | Assunto | Itens | Prioridade |
| --- | --- | --- | --- |
| DS03-A | Título em modo seleção seleciona em vez de editar | 3.1 | Alta (comportamento visível) |
| DS03-B | Sprint: Space/Enter no input iniciam arraste por teclado; arraste desligado durante edição | 3.2, 3.4 | Alta (impede digitar espaço) |
| DS03-C | Alça de arraste e área de edição do título por largura | 3.3, proposta 4 | Média (decisão de design do proprietário) |
| DS03-D | Semântica e tab stops: wrapper dnd-kit, botões aninhados, `aria` de seleção | 3.6, proposta 1 e 7 | Média |
| DS03-E | Toque: `touch-action` e Kanban mobile | 3.5 | Média (depende de teste em dispositivo) |
| DS03-F | Unificar `isDragging`/`data-dragging`, remover código morto e custo do contexto de seleção | 3.7, 3.9 | Baixa |

Cada ticket precisa da seção `## Modelos sugeridos` (AGENTS.md) ao ser criado.

## 6. Roteiro curto de validação para o proprietário

1. Modo seleção (ícone de check na AppBar): clicar no texto do título de um item em linha. Selecionou ou abriu edição? (3.1)
2. Calendário mensal: arrastar pelo texto do título e depois pelo ícone de fase. Só o ícone move? (3.3)
3. Sprint: clicar no título, digitar um espaço, apertar Enter. O espaço entra? O cartão começa a arrastar? (3.2)
4. Editar um título e arrastar o mouse para selecionar texto. O cartão se move? (3.4)
5. Tab em uma linha do calendário: quantas paradas até o próximo item? (3.6)
6. Celular/tablet: rolar a lista do Kanban e do calendário com o dedo sobre os itens. (3.5)
