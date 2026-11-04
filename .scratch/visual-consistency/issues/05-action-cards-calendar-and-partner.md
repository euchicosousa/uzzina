# 05: Cartões de Ação, Grades de Calendário e Página do Parceiro (Zona Workbench)

**What to build:** os cartões de ação (`ActionItem`), os indicadores de fases (`PhaseStationBadges`), as células de calendário (`CalendarDayCell`) e a página operacional do parceiro (`/app/partner/$slug`) seguem a estética Linear de bordas hairline (`1px`), cantos de `6px`/`12px`, tipografia sem corte de letras descendentes (`ç`, `g`, `p`) e barra superior com controles nivelados.

**Blocked by:** #02 (Alinhamento geométrico dos primitivos Prism e vitrine oficial em `/ui`), #03 (Barras operacionais e navegação na Zona Workbench).

**Status:** completed

- [x] Em `ActionItem.tsx`, os cartões compactos (linha/bloco) usam `rounded-md` (`6px`) e a variante `content` usa `rounded-xl` (`12px`), substituindo o bisel branco 3D (`border-t-white`) e sombras pesadas por borda hairline limpa (`ring-1 ring-border` / `border-border`) e progressão de superfície (`bg-action hover:bg-action-hover`), mantendo o estado de atraso (`bg-late text-late-foreground` com contraste AA) e os contratos de seleção, clique e drag-and-drop.
- [x] O título do cartão em `ActionItem.tsx` usa `leading-snug` (alinhado ao `ActionItemTitleInput.tsx`), eliminando o corte inferior da cedilha (`ç`) e das letras `g`, `j`, `p`, `q`, `y` causado por `leading-none` + `overflow-hidden`, e preservando a geometria exata de 1 linha durante a edição inline no celular e no desktop.
- [x] Em `PhaseStationBadges.tsx`, o tamanho de fonte ilegível `text-[8px]` é atualizado para o piso mínimo permitido de micro-badge (`text-[10px] font-medium leading-none`) com canto `rounded-sm` (`4px`).
- [x] Em `CalendarDayCell.tsx`, o botão `+ Criar ação` usa `PrismButton` com foco visível, e os indicadores/textos de feriado substituem as classes hardcoded `bg-amber-500` / `text-amber-600 dark:text-amber-400` pelos tokens semânticos `bg-warning` e `text-warning`.
- [x] Em `/app/partner/$slug.tsx`, todos os controles do cabeçalho operacional (seletor/indicador de atrasadas com anel de foco visível, botão de Planejamento, link de configurações do parceiro como `LinkButton` de ícone, `CalendarButtons`, campo de busca e `ViewOptionsComponent` + toggle do Feed) ficam nivelados na mesma altura dentro de cada grupo, preservando a distribuição flexível em `2xl` e as rolagens independentes do calendário e do feed com `AppBarSpacer`.

