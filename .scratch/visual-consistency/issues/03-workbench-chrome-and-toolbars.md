# 03: Barras operacionais e navegação na Zona Workbench (Header, AppBar, Busca e ViewOptions)

**What to build:** os componentes globais de navegação e filtragem (`Header`, `AppBar`, `GlobalSearchCommand`, `ViewOptions`, `CalendarToolbar`, `ComboboxTrigger`, `PartnersCombobox`, `ResponsiblesCombobox`, `SprintCombobox`, `PhaseCombobox`, `CategoriesCombobox`) operam com a precisão compacta da Zona 2 (Workbench Linear), sem bordas duplas em popovers, sem controles sem foco visível e sem mistura de alturas na mesma barra horizontal.

**Blocked by:** #02 (Alinhamento geométrico dos primitivos Prism e vitrine oficial em `/ui`).

**Status:** completed

- [x] No `Header` (`app/components/layout/Header.tsx`), o gatilho do menu de perfil (avatar) e o sino de notificações exibem anel de foco visível por teclado, o popover de notificações usa `rounded-xl` (`12px`), itens com foco visível, tipografia sem `font-bold` (`700`) nem `tracking-tight` no corpo da notificação, e o botão "Marcar todas como lidas" usa `PrismButton` em vez de `<button>` manual.
- [x] Na `AppBar` (`app/components/layout/AppBar.tsx`), o container flutuante recebe sombra de elevação (`shadow-lg`) e borda hairline única (`ring-1 ring-border`), preserva sua geometria e o contrato de altura (`--app-bar-space: 98px`), remove a classe morta `className="sm"`, e alinha o popover de filtro de parceiros ao raio `rounded-xl` (`12px`).
- [x] Na busca global (`GlobalSearchCommand.tsx`), os itens e o campo de busca seguem a tipografia (`text-base md:text-sm` no input, `text-sm` nos comandos) e os contratos existentes do `AGENTS.md` (filtro de parceiros com `allowAll`, `ring-0` e foco por fundo preservados).
- [x] Os seletores `PartnersCombobox`, `ResponsiblesCombobox` e `SprintCombobox` deixam de passar `border shadow-xl` sobre o `PrismPopover`, eliminando a borda dupla (`border` + `ring-1`) e unificando a elevação em `shadow-lg` e `rounded-xl` (`12px`) com itens internos em `rounded-md` (`6px`), igual a `PhaseCombobox` e `CategoriesCombobox`.
- [x] Em `ViewOptionsComponent` (`app/components/features/ViewOptions.tsx`) e `CalendarToolbar` (`app/components/features/CalendarToolbar.tsx`), todos os gatilhos de menu (`VisualizeMenu`, `SortMenu`, `DisplayMenu`), filtros (`CategoriesCombobox`, `PhaseCombobox`, `ResponsiblesCombobox`) e botões adjacentes na mesma linha horizontal são nivelados no mesmo tier de altura, eliminando o degrau entre botões de `32px`, `40px` e `48px` (e corrigindo o padding exagerado `p-6` da variante `form-inline lg` em `ComboboxTrigger.tsx`).
