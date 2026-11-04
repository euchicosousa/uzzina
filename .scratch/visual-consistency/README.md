# Design System (Linear + Suíço) — Tickets Locais

> **Suspenso em 02/11/2026 pelo proprietário.** Não executar. O código foi revertido ao commit `ad0c0ed`; o estado implementado está no branch `backup/visual-2026-11-02`. Uma nova regra visual substituirá esta série.

Especificação canônica: **[docs/design-system.md](../../docs/design-system.md)**
Regra automática de agente: **[.agents/rules/design-system.md](../../.agents/rules/design-system.md)**
Relatório completo da auditoria: **[docs/audits/2026-11-01-strict-design-system-audit.md](../../docs/audits/2026-11-01-strict-design-system-audit.md)**

---

## Grafo de Execução e Fronteira (`to-tickets`)

```text
[01: Fundação CSS, OKLCH, Paletas e Tipografia]
                       │
                       ▼
   [02: Primitivos Prism e Vitrine /ui]
                       │
       ┌───────┬───────┼───────┬───────┬───────┐
       ▼       ▼       ▼       ▼       ▼       ▼
     [03]    [06]    [07]    [08]    [09]    [10]
       │
   ┌───┴───┐
   ▼       ▼
  [04]    [05]
```

- **Passo 1 (Serial):** Executar **#01** → depois **#02**.
- **Passo 2 (Paralelismo para subagentes `flash`):** Assim que **#02** terminar, **#03, #06, #07, #08, #09 e #10** ficam desbloqueados na fronteira (tocam conjuntos disjuntos de rotas/features).
- **Passo 3:** Assim que **#03** terminar, **#04** e **#05** ficam desbloqueados.

---

## Lista de Tickets

| Ticket                                                                                                                                     | Entrega                                                                                                                                                                                                                                                       | Blocked by | Status            |
| :----------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------- | :---------------- |
| [00 — Auditoria e definição do sistema visual](issues/00-app-style-analysis-and-simplification.md)                                         | Diagnóstico completo + especificação Linear + Suíço em `docs/design-system.md`                                                                                                                                                                                | —          | `completed`       |
| [01 — Fundação de tokens CSS, superfícies OKLCH, paletas e tipografia global](issues/01-foundation-tokens-and-palettes.md)                 | Raios `2/4/6/12px` sem `.squircle`, superfícies OKLCH `Void→Carbon→Obsidian→Slate`, 12 paletas AA, status tokens e `h1`–`h5` sem corte de acentos ou `font-bold`                                                                                              | None       | `completed`       |
| [02 — Alinhamento geométrico dos primitivos Prism e vitrine `/ui`](issues/02-prism-primitives-and-ui-gallery.md)                           | Primitivos `app/components/prism/*` com raios concêntricos, borda `1px` nos inputs, padding horizontal uniforme `px-3.5`, correção do `PrismDialogFooter`/`Combobox` e atualização da `/ui`                                                                   | #01        | `completed`       |
| [03 — Barras operacionais e navegação na Zona Workbench](issues/03-workbench-chrome-and-toolbars.md)                                       | `Header`, `AppBar` (`shadow-lg`), `GlobalSearchCommand`, `ViewOptions`, `CalendarToolbar` e comboboxes sem borda dupla e com alturas niveladas                                                                                                                | #02        | `completed`       |
| [04 — Home Editorial (Zona Suíça) vs. Página Hoje (Zona Workbench)](issues/04-home-swiss-grid-and-today-workbench.md)                      | `Home` com respiro Suíço e divisórias `1px`, `TodayPageView` com barra nivelada e cabeçalhos de coluna do Kanban alinhados a Parceiros/Categorias                                                                                                             | #02, #03   | `completed`       |
| [05 — Cartões de Ação, Grades de Calendário e Página do Parceiro](issues/05-action-cards-calendar-and-partner.md)                          | `ActionItem` Linear (`rounded-md`/`xl`, sem bisel 3D, sem cortar `ç`/`g`/`p`), `PhaseStationBadges` (`≥10px`), `CalendarDayCell` sem `amber` hardcoded e barra de `/app/partner/$slug` nivelada                                                               | #02, #03   | `completed`       |
| [06 — Gaveta de Ação, Editor de Texto, Comentários e Mídia](issues/06-action-drawer-editor-comments-and-media.md)                          | `ActionTitleInput` multi-linha sem cortar acentos, aba "Observações" sem truncar em 375px, `RichTextEditor`, `CommentInput` (`16px` mobile + botões `32px` nivelados), `InstagramContent`/`ContentReorderDialog` e diálogos `Bulk*`                           | #02        | `completed`       |
| [07 — Minha Conta e Preferências desencaixotadas (Zona Suíça)](issues/07-profile-and-unboxed-preferences.md)                               | `/app/profile`, `UPreferenceSwitch` e `CustomThemePanel` sem caixas/cartões com borda proibidos e sem cores `zinc`/`rose`/`amber` hardcoded                                                                                                                   | #02        | `completed`       |
| [08 — Mesa de Planejamento unificada ao Design System](issues/08-social-planning-workspace.md)                                             | `/app/planejamento` e `app/components/planning/*` com campos alinhados, `PrismToggleGroup`, `PrismDialog` em `PlanningSuggestionEditor`, botão acessível e zero cores `emerald`/`amber` hardcoded                                                             | #02        | `completed`       |
| [09 — Administração e Datas Comemorativas com respiro Suíço e responsividade](issues/09-admin-and-celebrations-breathing-layout.md)        | 7 rotas `/app/admin/*` com grade `1` coluna no mobile, padding responsivo Arejado, ritmo `gap-6`/`gap-2` com `PrismLabel`, `UAdminItemCard` Linear, fim do `UToggleInput` e `PartnerCelebrationsSelector` com `PrismCheckbox`/`PrismToggleGroup`/`PrismBadge` | #02        | `completed`       |
| [10 — Portal do Cliente, Revisão Pública, Leads, Notificações, Ajuda e Auth](issues/10-portal-review-leads-notifications-help-and-auth.md) | Auth (`PrismLabel`, olho da senha unificado), `/dash` e revisão pública (barra nivelada, títulos multi-linha sem encavalar), `/app/leads` (`PrismBadge` AA), `/app/notifications` e `/app/help`                                                               | #02        | `completed`       |
