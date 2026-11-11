# DS15 — Migração gradual de itens interativos para o fundo neutro compartilhado

**Status.** Os controles da `main` local usam `bg-secondary`, derivado do texto principal a 5% no claro e 10% no escuro. O piloto de menu integra a migração. A conferência de estados compostos e a publicação seguem pendentes.

**Bloqueado por.** [DS13 — Laboratório interativo de testes visuais](13-theme-test-lab.md) (para verificação prévia de cada grupo).

## O que a pessoa vê

Ao navegar no aplicativo usando mouse ou teclado, os itens de menu, seletores de opções, abas e botões mudam suavemente de fundo para indicar onde o usuário está navegando. Antes, alguns componentes usavam cinzas fixos que sumiam ou ficavam invertidos em fundos diferentes. Com a fórmula aprovada, o destaque ganha a tonalidade elegante do tema no modo claro e luz suave no modo escuro, mantendo perfeita legibilidade em qualquer tela.

## Qual componente

A migração é dividida em 4 lotes autônomos para permitir conferência visual sem sobrecarga:

- **Lote 1: Menus e seletores flutuantes**
  - `DropdownMenuItem` e `DropdownMenuSubTrigger` ([`dropdown-menu.tsx`](../../../app/components/prism/dropdown-menu.tsx)) — _já aprovado no piloto_;
  - `SelectItem` ([`select.tsx`](../../../app/components/prism/select.tsx));
  - `ComboboxItem` e chips ([`combobox.tsx`](../../../app/components/prism/combobox.tsx));
  - `CommandItem` ([`command.tsx`](../../../app/components/prism/command.tsx)).

- **Lote 2: Botões e alternâncias**
  - `PrismButton` variantes `ghost` e `outline` ([`button.tsx`](../../../app/components/prism/button.tsx));
  - `PrismToggle` e `PrismToggleGroupItem` ([`toggle.tsx`](../../../app/components/prism/toggle.tsx)).

- **Lote 3: Navegação e abas**
  - `PrismTab` variantes `underline` e `drawer` ([`tabs.tsx`](../../../app/components/prism/tabs.tsx));
  - `PrismAccordion` item aberto/hover ([`accordion.tsx`](../../../app/components/prism/accordion.tsx)).

- **Lote 4: Listas, telas e calendários**
  - Linhas de notificações e grupo Admin do cabeçalho ([`Header.tsx`](../../../app/components/layout/Header.tsx));
  - `NotificationsPage.tsx` e `HelpPage.tsx`;
  - Células e botões de `PrismCalendar` ([`calendar.tsx`](../../../app/components/prism/calendar.tsx)), `ClientCalendar.tsx` e `PlanningCalendarView.tsx`.

## O que foi analisado, o que já mudou e o que será mudado

- **O que foi analisado:** O uso de cores fixas de superfície (`bg-secondary/50`, `bg-input`, `bg-muted`) criava inconsistências visuais em diferentes fundos. A fórmula vigente compartilha o mesmo fundo neutro em claro e escuro.
- **O que já mudou:** Aplicado com sucesso no piloto do `DropdownMenuItem` e estendido para os 4 lotes completos de componentes do design system:
  - _Lote 1:_ `SelectItem`, `ComboboxItem` e `CommandItem`;
  - _Lote 2:_ `PrismButton` (`ghost` e `outline`), `PrismToggle` e `PrismToggleGroupItem` (com distinção de `data-selected` / `aria-pressed`);
  - _Lote 3:_ `PrismTab` (`underline` e `drawer`), `PrismAccordion` (`data-open`);
  - _Lote 4:_ Linhas de notificações do cabeçalho e página, grupo Admin, índice de Ajuda (`HelpPage`), células e gatilho de mês de `PrismCalendar`, `ClientCalendar` e botões de `PlanningCalendarView`.
- **O que será mudado:** Conferência do proprietário no app, especialmente em itens selecionados sob foco.

## Onde está

Código na `main` local, cobrindo `app/components/prism/` (`select.tsx`, `combobox.tsx`, `command.tsx`, `button.tsx`, `toggle.tsx`, `tabs.tsx`, `accordion.tsx`, `calendar.tsx`), `app/components/layout/Header.tsx`, `app/components/features/` (`NotificationsPage.tsx`, `HelpPage.tsx`), `app/components/client/ClientCalendar.tsx` e `app/components/planning/PlanningCalendarView.tsx`. Contrato atualizado em `docs/contracts/prism-details.md`.

## O que o proprietário precisa decidir e o que olhar antes de aprovar

- Inspecionar a navegação em seletores, menus e abas do aplicativo para confirmar a suavidade do destaque tonal no modo claro e da luz suave no modo escuro.
- Conferir se o contraste dos itens selecionados (ex.: item ativo de tab, toggle ou comando) permanece imediatamente distinguível do item sob foco/hover.

## Critérios de conclusão

- [x] Lote 1 migrado e testado (Select, Combobox, Command).
- [x] Lote 2 migrado e testado (Button ghost/outline, Toggle).
- [x] Lote 3 migrado e testado (Tabs, Accordion).
- [x] Lote 4 migrado e testado (Header, Notificações, Ajuda, Calendários).
- [ ] Conferir se o foco permanece distinguível em itens selecionados nos quatro lotes.

## Modelos sugeridos

- **Google — Gemini 3.8 Flash.** Ideal para fazer as substituições sistemáticas nos arquivos de componentes de forma ágil e segura.
- **OpenAI — GPT-6.1 Sol.** Recomendado para revisar a semântica dos estados React Aria (`data-focused`, `data-selected`, `aria-pressed`) em cada lote.
- **Anthropic — Claude Sonnet 5.5.** Alternativa para validar a consistência das transições e acessibilidade dos contrastes. Disponibilidade depende do plano.
