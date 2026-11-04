# 04: Home Editorial (Zona Suíça Arejada) vs. Página Hoje (Zona Workbench)

**What to build:** a página inicial `/app` (`Home`) consolida o layout Suíço arejado (`Zona 1`) com divisórias arquiteturais de `1px`, margens alinhadas e respiro generoso entre os blocos (`Sprint`, `Hoje`, `Calendário` e `Parceiros`), enquanto a página dedicada `/app/today` (`TodayPageView`) opera no modo Workbench compacto (`Zona 2`) com controles nivelados e cabeçalhos de coluna consistentes.

**Blocked by:** #02 (Alinhamento geométrico dos primitivos Prism e vitrine oficial em `/ui`), #03 (Barras operacionais e navegação na Zona Workbench).

**Status:** completed

- [x] Em `HomeViewWrapper.tsx` e nas seções da `Home` (`HomeSprintView`, `HomeTodayView`, `HomeCalendarView`, `HomePartnersView`), os títulos de seção seguem a escala Display Suíça (`text-3xl lg:text-5xl font-medium leading-tight tracking-[-0.022em]`) sem `font-bold` (`700`) e sem `leading-none`, com recuo lateral alinhado no celular e no desktop e respiro vertical amplo entre blocos separado pelas linhas estruturais de `1px` (`.border_before`, `border-x`).
- [x] O botão "Tentar novamente" no estado de erro de `/app/index.tsx` e o subtítulo do Feed em `TodayViewParts.tsx` usam `PrismButton` e a escala tipográfica canônica.
- [x] Na página dedicada `/app/today` (`TodayPageView.tsx`) e no bloco `HomeTodayView.tsx`, a barra de controles superior (`CalendarToolbar` + `TodayViewToggle`) tem todos os seus controles nivelados na mesma altura, preservando integralmente o contrato de altura útil (`useFillScrollViewport`), o título completo com ellipsis e o `AppBarSpacer`.
- [x] Os cabeçalhos de coluna em `KanbanPhasesBoard.tsx` (`<h4>` antes em `24px`), `PartnersBoard.tsx` e `CategoriesBoard.tsx` são unificados na mesma hierarquia tipográfica de subseção (`text-sm font-medium leading-snug`), mantendo a barra colorida de fase e os contadores `PrismBadge` (`rounded-sm`).
- [x] O `Footer.tsx` da Home substitui `text-gray-500` pelo token semântico `text-muted-foreground`.

