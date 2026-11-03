# App-wide style analysis and simplification — 2026-10-31 (rounds 1–3)

Round 2 (2026-11-01) results are in [round 2](#round-2--runtime-matrix-with-controlled-data-2026-11-01); they confirm or correct the round-1 rows below. Conformance to Prism and WCAG 2.2 AA is in [round 3](#round-3--conformance-to-the-design-standards-2026-11-01).

Owner asked to start [ticket00](../../.scratch/visual-consistency/issues/00-app-style-analysis-and-simplification.md) (see also the canonical Linear + Swiss specification in [design-system.md](../design-system.md) and tickets `01`–`10` in [.scratch/visual-consistency/README.md](../../.scratch/visual-consistency/README.md)). Round 1 = static inventory of the whole codebase (four parallel read-only subagents: buttons/triggers, choice/navigation/overlays/badges, spacing/layout/headings, fields/toolbars/typography), coordinator spot-checks of the claims used below, and runtime sampling limited to public, data-free pages (`/ui`, `/login`, `/forgot-password`) on the owner's server5176 (GET only). No code changed. Authenticated screens (`/app`, `/dash`) were **not** sampled at runtime in this round: they run on production data; their findings here are static source findings unless marked otherwise.

Evidence labels: **R** = reproduced at runtime this round; **S** = static source, verified by the coordinator; **s** = static source reported by a subagent, not individually re-checked; **O** = owner report. Paths are under `app/`.

## Coverage

| Surface                                     | Static | Runtime this round                     | Note                                             |
| ------------------------------------------- | ------ | -------------------------------------- | ------------------------------------------------ |
| Login / forgot / reset / portal login       | yes    | `/login`, `/forgot-password` at375px   | reset/portal login not rendered                  |
| Header, AppBar, search                      | yes    | no                                     |                                                  |
| Home, Today, partner calendar/feed          | yes    | no                                     | prior14 measurements reused for Today/Home-Today |
| Action drawer (3 tabs, 1–2 actions), footer | yes    | no                                     | prior16/15/17 reports reused                     |
| Profile, notifications, leads, help, admin  | yes    | no                                     |                                                  |
| Portal `/dash`, review                      | yes    | no                                     |                                                  |
| `/ui` gallery                               | yes    | 1440px light, Prism components section |                                                  |

Dark mode, landscape, hovered/pressed/disabled/loading states and physical Safari were not sampled this round.

## Corrections to subagent claims

Kept out of the findings after verification: "multi-select Phase/Category filters fall back to `form-inline` p-6" — false, both pass `filter` in multi mode (`CategoriesCombobox.tsx:96`, `PhaseCombobox.tsx:46`). "Forgot-password clipped at375px" — false at runtime (card28–348px, field60–316px).

## Ranked findings

### A. Functional (clipping, focus, misuse)

| #   | Finding                                                                                                                                                                                                                                                                 | Evidence       | Impact                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------- |
| A1  | `/login` grid is fixed `grid-cols-[2rem_28rem_2rem]` with no mobile step (`routes/login.tsx:58`). At375px the card spans −36…412px; fields −4…380px; "E-mail" first letter and "Fazer Login" button are cut. Forgot/reset already use `[2rem_20rem_2rem] md:[…30rem…]`. | R              | Visible clipping on every phone below ~512px                                                                    |
| A2  | Rich-text toolbar buttons show focus only as `bg-input` background, no ring (`RichTextEditor.tsx:66`). Same for `ComboboxTrigger` (`ComboboxTrigger.tsx:33`).                                                                                                           | S              | Weak keyboard focus indicator vs Prism `ring-3` (needs runtime contrast check before calling it a WCAG failure) |
| A3  | `UToggleInput` (`uzzina/UToggle.tsx:42`): input `sr-only`, label shows focus via `focus:opacity-100` on a label that never receives focus.                                                                                                                              | S              | No visible focus on admin "archived" toggle                                                                     |
| A4  | Icon-only trash uses `size="xs"` instead of `icon-xs` (`media/ContentReorderDialog.tsx:322`).                                                                                                                                                                           | S              | Wrong frame (padded text button)                                                                                |
| A5  | `className="sm"` stray string on an AppBar trigger (`layout/AppBar.tsx:197`).                                                                                                                                                                                           | S              | No effect; dead intent                                                                                          |
| A6  | Admin user/partner grids `grid-cols-2` at base inside `p-8` (`admin/users.tsx:53,64`, `admin/partners.tsx:68,92`): ≈49px left for names at375px.                                                                                                                        | S (arithmetic) | Likely truncated names on phone; runtime check pending                                                          |
| A7  | `LeadDetail.tsx:85` nests a PrismButton inside `<a>`.                                                                                                                                                                                                                   | s              | Interactive-in-interactive                                                                                      |
| A8  | Password visibility toggle built four ways with inverted eye icons (login/`client/$userId` vs `AdminUserForm`/`dash/login`).                                                                                                                                            | s              | Same control means opposite things                                                                              |

### B. Accidental duplicates (appearance/maintenance)

| #   | Role                              | Current spread                                                                                                                                                                          | Existing pattern to reuse                                       |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| B1  | Small command/submit              | `h-8 px-3 text-xs` and `h-7 rounded-lg` hand-built (`routes/app/index.tsx:138`, `ActionComments/CommentInput.tsx:83,191,200`)                                                           | PrismButton `xs`                                                |
| B2  | Retry "Tentar novamente"          | 6 sites in sm, default and ghost-xs                                                                                                                                                     | one size (sm)                                                   |
| B3  | Dialog cancel/confirm             | cancel ghost or outline; buttons xs, sm or default; `ContentReorderDialog` hand footer                                                                                                  | PrismDialogFooter + ghost cancel + one size                     |
| B4  | Muted text link                   | 4 identical raw `text-xs underline text-muted-foreground` buttons + 5 `font-semibold underline` variants                                                                                | one named `link` style (needs owner decision: muted vs primary) |
| B5  | Link styled as button             | 7 `Link + buttonVariants()` sites; `LinkButton` exported, 0 consumers, not in index                                                                                                     | adopt or delete `LinkButton`                                    |
| B6  | Editor toolbar button             | `size-8 rounded-lg`, active `bg-primary/10` (RichTextEditor)                                                                                                                            | PrismToggle `xs` (h-8, ring focus, pressed state)               |
| B7  | Field labels                      | 7 class combos (text-sm PrismLabel vs text-base raw labels on auth/admin); same fields in Profile and `AdminUserForm` differ                                                            | PrismLabel                                                      |
| B8  | Auth fields                       | same Label+InputGroup override block pasted 5×; portal login uses `px-4` vs `px-3`                                                                                                      | one local auth field component                                  |
| B9  | Input shell                       | radius/bg/focus/invalid string copied in input, textarea, time-field, color-field, input-group; two focus rings (`/30` vs `/50`), two error tokens (`destructive` vs `error`, same hue) | one shared base constant inside Prism                           |
| B10 | Hex/color inputs                  | `PartnerColorPicker.tsx:142` (`h-8`, manual invalid), `ColorListEditor.tsx:244`                                                                                                         | PrismColorField                                                 |
| B11 | Menu/list items                   | four item styles (radius lg/xl/2xl, check icon/position, h-8 vs min-h-7) across select/combobox/command/menu                                                                            | align to Command item                                           |
| B12 | Popover shell                     | Partners/Responsibles/Sprint restate `rounded-3xl border shadow-xl squircle`; popover radius 2xl/3xl/4xl                                                                                | PrismPopover base                                               |
| B13 | Status badge                      | `LeadDetail.tsx:61,68` rebuild success/warning; hand badges in `leads.tsx:246`, `dash/review.$slug.tsx:210`                                                                             | PrismBadge variants                                             |
| B14 | Swatch / avatar grid toggle items | copied between Bulk dialogs and `ActionColorDropdown` with drift                                                                                                                        | one shared item class                                           |
| B15 | No-op classes                     | `rounded-2xl squircle` repeated on PrismButton (5 sites), `data-[state=on]` in `toggle-group.tsx:79` (React Aria never sets it), `PrismDialogClose` `size                               |                                                                 | "sm"` fallback unreachable | remove |
| B16 | Raw select                        | `HelpPage.tsx:291`                                                                                                                                                                      | PrismSelect (only if mobile native picker is not intended)      |

### C. Spacing and typography

| #   | Finding                                                                                                                                                            | Evidence                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| C1  | Home default sections: `mx-4`+border+`px-8` = 49px/side on mobile; Today/Home-Today/Header use 21px/side (accepted in14). Home left edges don't line up on mobile. | S (`HomeViewWrapper.tsx:20,28`) |
| C2  | Admin, `/ui`, auth use fixed `p-8`/`px-8` with no mobile step; other pages step `px-3/4 → lg:px-8`.                                                                | s                               |
| C3  | Nine page-title combinations (2xl–5xl, bold/semibold/medium); Home mobile5xl vs Today2xl.                                                                          | s                               |
| C4  | Header offset hard-coded as 64/66/68px (`top-16`, comment, `.page-height`, `celebrations.tsx:79`).                                                                 | s                               |
| C5  | Today columns: Kanban base `<h4>` (2xl) vs Partners/Categories `text-sm font-medium`.                                                                              | s                               |
| C6  | No card primitive; four frame recipes, one with hardcoded `zinc` colors (`CustomThemePanel.tsx`).                                                                  | s                               |
| C7  | Uppercase "eyebrow" label in 4 variants with `text-[10px]/[11px]`; 16 distinct arbitrary text sizes (many justified in `UAvatar`).                                 | s                               |
| C8  | Radius drift on controls: 2xl (Button/Toggle), xl (ButtonGroup), lg (RTE, comments), md (ComboboxTrigger sm/link), 4px (raw), full (Header avatar/bell).           | s                               |

### D. Justified exceptions (keep)

Inline title inputs inheriting text (`ActionItemTitleInput`, drawer headline textarea); borderless Instagram writing surface; 48px app chrome (AppBar, CalendarToolbar, footer16); media overlay chips/buttons over images; avatar size scale; WhatsApp brand color; action drawer as non-modal custom panel; tabs vs value toggles split already fixed by15 (no value choice is rendered as tabs).

## Proposed role → component mapping (proposal)

| Role                 | Component                                                                  | Allowed                               | Retire                                             |
| -------------------- | -------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------- |
| Primary save/submit  | PrismButton `default`                                                      | default (forms, drawer), sm (dialogs) | redundant radius overrides                         |
| Secondary command    | PrismButton `ghost`/`secondary`                                            | sm, xs                                | hand-built h-7/h-8                                 |
| Destructive          | PrismButton `destructive`                                                  | sm, icon-xs                           | raw `bg-destructive` buttons except media overlays |
| Navigation as button | `LinkButton` (or `Link`+`buttonVariants`, pick one)                        | same sizes                            | the other form                                     |
| Text link            | `link` variant (+ muted option if owner wants)                             | —                                     | raw underline buttons                              |
| Icon-only            | PrismButton `icon`(48 chrome) / `icon-sm`(40 fields) / `icon-xs`(32 dense) | three sizes                           | 24/28px raw, `xs` misuse                           |
| Value choice / mode  | PrismToggleGroup                                                           | sm, xs                                | UToggleInput                                       |
| Panel navigation     | PrismTabs                                                                  | —                                     | —                                                  |
| Selector trigger     | ComboboxTrigger `filter` / `form-footer` / `form-inline` / `form-link`     | keep 4, add focus ring                | —                                                  |
| Editor toolbar       | PrismToggle `xs` + PrismSeparator                                          | —                                     | local `toolbarButtonClass`                         |
| Field                | PrismLabel + PrismInput/InputGroup/ColorField                              | default, sm                           | raw labels, hex PrismInput                         |
| Status/count         | PrismBadge                                                                 | default + status variants             | hand spans                                         |

## Responsive spacing policy (proposal)

- Page gutter: total ≈20px/side below `lg` (as accepted in14), 32px at `lg`, 64px at `xl` for wide reading pages. Apply only where the page owns its gutter; do not add a gutter inside a framed wrapper that already has one.
- Section gap: 16px mobile / 24–48px desktop; title padding is not a gutter.
- Field stack: label→field 8px (`gap-2`), field→field 16px.
- Toolbar: `gap-1` dense (editor), `gap-2` chrome.
- Controls: 48px chrome/footer, 40px fields-inline, 32px dense editor only; keep ≥44px touch where touch is primary (tabs already `min-h-11`).
- One header-offset token beside `--app-bar-space` replacing 64/66/68 literals.

## Before/after examples (proposals, text only this round)

| Case                                        | Before                                  | After                                                               |
| ------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| Login at375px                               | card448px, fields cut4px each side      | reuse forgot-password grid `[2rem_20rem_2rem] md:[2rem_28rem_2rem]` |
| Comment send/cancel                         | `h-8 rounded-lg px-3 text-xs` + icon3.5 | PrismButton `xs` (h-8, 2xl radius, icon4)                           |
| Editor bold button focused                  | grey background only                    | PrismToggle `xs`: ring + pressed state                              |
| Home section on phone                       | 49px/side gutter, 5xl title             | 21px/side as HomeToday compact, title scale per C3 decision         |
| Footer / profile tabs / Today mobile header | already consolidated by16 /15 /14       | no change                                                           |

Visual before/after mockups: see round 2.

## Unresolved decisions for the owner

1. Text link color: primary (`link` variant) or muted gray?
2. Header avatar/bell: keep circular or follow squircle?
3. Page-title scale: one size per level (e.g. page 3xl→5xl, section 2xl) — accept to apply to Home/Admin/Leads/Profile?
4. Calendar↔feed switch uses tabs (portal), single icon toggle (partner) and a 4-way group (Today): keep per-context or unify?
5. Home default sections: adopt the compact mobile gutter used by HomeToday?
6. Raw `<select>` in Help: keep native picker on mobile or use PrismSelect?

## Finite implementation sequence (proposals, not authorized)

| #   | Ticket                                      | Consumers                                                                 | Depends                | Risk / effort   | Acceptance                                                           |
| --- | ------------------------------------------- | ------------------------------------------------------------------------- | ---------------------- | --------------- | -------------------------------------------------------------------- |
| S1  | Login mobile grid (A1)                      | `routes/login.tsx`                                                        | —                      | low / tiny      | no horizontal clipping 320–430px, desktop unchanged                  |
| S2  | Focus indicators (A2/A3)                    | RichTextEditor toolbars, ComboboxTrigger, UToggleInput                    | —                      | low–med / small | visible focus in light/dark, toolbar keyboard contracts preserved    |
| S3  | Dead/misused classes (A4, A5, B15)          | 4 files + Prism dialog/toggle-group                                       | —                      | low / tiny      | no visual change except A4 frame                                     |
| S4  | Small buttons and dialogs (B1–B3)           | comments, Home retry, bulk/conflict/celebration/reorder dialogs           | decision on sizes      | low / small     | dialogs share footer/cancel/size                                     |
| S5  | Links (B4, B5, A7)                          | ~16 sites, LinkButton                                                     | decision 1             | low / small     | one link style, no nested interactive                                |
| S6  | Fields and labels (A8, B7–B10)              | auth pages, AdminUserForm, admin partner, color inputs, Prism input shell | —                      | med / medium    | same field looks equal everywhere; one eye-icon meaning              |
| S7  | Editor toolbar on PrismToggle (B6)          | RichTextEditor                                                            | S2, ticket17 contracts | med / small     | compact/main/bubble keep keyboard shortcuts                          |
| S8  | Menus, popovers, badges, swatches (B11–B14) | select/combobox/command/menu, 3 comboboxes, leads/review, bulk dialogs    | —                      | low / small–med | one item style; status uses badge variants                           |
| S9  | Page spacing and title scale (C1–C5)        | Home, admin, leads, profile, help, notifications, `/ui`                   | decisions 3, 5         | med / medium    | measured gutters per policy; Today/Profile accepted values preserved |
| S10 | Card/eyebrow/radius tokens (C6–C8)          | CustomThemePanel, UAdminItemCard, eyebrows                                | S9                     | low / small     | no hardcoded zinc; one eyebrow class                                 |

Classification: reuse now — S1, S3, A4; consolidate with named migration — S4–S8, S10; justified exceptions — section D; needs owner decision — items 1–6. Nothing is marked deprecated until its consumers are migrated. Existing tickets keep their scope: Safari12/13/14/15/16/17/18, today-focus and media-controls.

## Review checklist for new UI

1. Is there a Prism variant/size for this role? Use it without restating its classes.
2. Icon-only: `icon`, `icon-sm` or `icon-xs`, with `aria-label`.
3. Focus visible via the Prism ring, not background only.
4. Gutter: does a parent already provide one?
5. Title uses the agreed level; no new arbitrary `text-[..]`.
6. A local exception names its reason in the PR/report.

`/ui` examples for accepted patterns are added when each sequence step lands.

## Verification and limits

Documentation only. Runtime: GET `/ui`, `/login`, `/forgot-password` on5176 in the built-in browser at1440px and375px, no login, no data. Spot-checked in source: A2–A5, B5, B6, B15, C1, A6 grid classes, and the two corrected claims. Other `s` rows rely on subagent reports with file:line. No tests/build (no code change), no SQL/database/provider, no server restart, commit, push or deploy. Untracked `tests/field-accessible-names.test.tsx` preserved untouched. During this round, external uncommitted edits appeared in `CommentInput`, `RichTextEditor`, drawer tabs, `admin/celebrations` and `admin/partner/$slug` (apparently field-label work); they were preserved, and file:line references above reflect `HEAD` and may shift once that work lands.

## Round 2 — runtime matrix with controlled data (2026-11-01)

Owner asked for round 2. Two parallel subagents drove the real app (routes, CSS, Object Sans) in headless Chromium against an **isolated Vite server on 5193** with its own optimizer cache (scratchpad wrapper config). Clock 2026-10-30T12:00Z, pt-BR, America/Fortaleza. Fake JWT session via `setSession`; every Supabase, `/api/*` and other external request fulfilled from fixtures or aborted, websockets closed; 0 non-GET requests reached anything, 0 page errors. Fixtures: 3 partners, 8 actions in 5 phases/7 categories, comments, notifications, people/partners with long Portuguese names, portal client with 2 partners. The server served the working tree, which already contained another session's uncommitted edits (field labels, strategies); measurements reflect that tree, not `HEAD`. Scripts, `results.json` and ~240 screenshots stay outside Git in the session scratchpad. Coordinator reviewed the key screenshots (portal header, drawer tabs, editor ring mockup).

### Coverage

| Group                                                                                                                           | Sizes × themes                                                     |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Home, Today, global search + drawer (3 tabs, footer)                                                                            | 375, 390, 844×390, 1440 × light/dark                               |
| Partner calendar/feed, notifications                                                                                            | 390, 1440 × light/dark                                             |
| Login, forgot, reset, `/dash/login`                                                                                             | 320, 375, 390, 844×390, 1440 light + 390 dark; WebKit `/login` 375 |
| Profile, leads + detail, help, admin (users, partners, clients, user, new user, client, partner, celebrations), `/dash`, review | 375, 1440 × light/dark; landscape for profile, `/dash`, review     |

Not sampled: physical Safari/touch, 320/430 on non-auth pages, dark landscape on non-team pages, loading/error beyond forced retry, `/dash/action/*`, review with comments, populated leads/celebrations/admin lists (mostly empty fixtures), partner feed at1440.

### Round-1 claims at runtime

| Claim                    | Result                | Numbers                                                                                                                                                                                                                   |
| ------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1 login clipping        | Confirmed             | Grid `32/448/32` at every width. Fields −32…352 at320, −4…380 at375 (WebKit same), card still cut at390 (−29…419). Root hides overflow, so content is cut silently. Reset/forgot/`/dash/login` (`32/320/32`) not clipped. |
| A2 editor toolbar focus  | Confirmed             | Focus = background only, 1.23:1 (light) / 1.19:1 (dark) vs unfocused; hover uses the same token.                                                                                                                          |
| A2 ComboboxTrigger focus | **Corrected**         | `filter` and `form-footer` compose `buttonVariants` and do show the Prism ring. Only `form-inline` (lg/sm) and `form-link` lack a ring (1.16:1 background change / underline).                                            |
| A3 UToggleInput focus    | Confirmed             | `:focus-visible` true on input; label computed styles identical before/after, light and dark.                                                                                                                             |
| A6 admin grid at375      | Confirmed, worse      | Name box 50px; a short name next to the Admin badge collapses to **0px** (name invisible). Clients (1 column) fine.                                                                                                       |
| A8 eye icons             | Confirmed             | Hidden state shows eye-off on login/reset/admin client, eye on `/dash/login` and AdminUserForm. Aria-labels consistent.                                                                                                   |
| B1 comment buttons       | Confirmed             | Enviar/Salvar/Cancelar 32px, radius 10.4px vs Prism `xs` 18.72px in the same row; "Nota interna" overridden to 28px.                                                                                                      |
| B2 retry                 | Confirmed             | `/app` ghost 32px/12px text; notifications/leads default `sm` 40px/14px.                                                                                                                                                  |
| B7 labels                | Confirmed             | 16px (auth, AdminUserForm, admin partner) vs 14px (profile, admin client, `/dash/login`, Celebration); gaps 2/6/8/16px.                                                                                                   |
| B13 lead badge           | Confirmed, functional | Light mode contrast 4.09:1 ("Concluído") and 4.35:1 on 12px text, below 4.5:1; PrismBadge variants measure 5.00/5.36.                                                                                                     |
| C1 Home gutters          | Confirmed             | 375/390: logo 9px, Home-Today h1 21px, Home sections h1 49px; frames 8 vs 16px so border lines step. Desktop aligned (97px).                                                                                              |
| C2 gutters               | Confirmed             | 375: admin lists 32, forms 28–32, help/leads 16, lead detail 8, profile 12, review 24, `/dash` 16.                                                                                                                        |
| C3 titles                | Confirmed             | 8 combinations across 10 routes (24–48px, weights 500/600/700); partner page and auth pages have no h1.                                                                                                                   |
| C5 column titles         | Confirmed             | Kanban 24px/600 vs Partners/Categories 14px/500.                                                                                                                                                                          |

Horizontal overflow (document and `[data-app-scroller]`) was 0 everywhere except `/dash`. Calendars/Kanban scroll internally by design.

### New findings

| #   | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                             | Evidence       | Impact                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------- |
| N1  | Portal `/dash` header never wraps: greeting, partner select (fixed `w-45`) and Sair in one `justify-between` row (`routes/dash.tsx:210`). With 2 partners the page is +256px wide at375 (long name), +93px at375 and +148px at320 with a short name; select and Sair off screen, calendar columns stretched to ≈213px. Landscape/1440 fine. The previous portal suite measured only 390/1440 with "Parceiro 1" names, which explains why it passed. | R              | Client portal partly unusable on small phones with several partners |
| N2  | Drawer tab "OBSERVAÇÕES" truncated to "OBSERVAÇ…" at375/390 (tabs 111–116px).                                                                                                                                                                                                                                                                                                                                                                       | R              | Label unreadable                                                    |
| N3  | Filled primary save button: border equals fill, so focus shows only the 30% ring (2.10:1 light).                                                                                                                                                                                                                                                                                                                                                    | R              | Weaker focus on the main action                                     |
| N4  | `/dash/login` label→field gap 2px vs 6–16px elsewhere.                                                                                                                                                                                                                                                                                                                                                                                              | R              | Cramped form                                                        |
| N5  | Admin partner/client chips cut long names at116px (first name and surname cut separately).                                                                                                                                                                                                                                                                                                                                                          | R              | Names unreadable                                                    |
| N6  | Partner page at1440 has no page gutter (toolbar ≈8–12px from edge vs logo 33px).                                                                                                                                                                                                                                                                                                                                                                    | R (screenshot) | Misalignment with Header                                            |
| —   | Observations, not defects: landscape Essencial description starts below the fold (documented short-panel behaviour); Escape from editor toolbar closes the drawer when clean; admin "archived" toggle label reads "Visível" — owner to confirm intent.                                                                                                                                                                                              | R              | —                                                                   |

### Mockups

Bounded before/after pairs, styles applied only inside the test page with inline px equivalents (no source change). Collected in a self-contained comparison sheet outside Git. Results: login grid `32/320/32` removes clipping (fields 60…316 at375); editor ring matches Prism ring (2.11:1 light, 2.67:1 dark + 1px border); comment buttons as Prism `xs` take the same space; Home sections with compact gutter align with Home-Today (h1 49→21px; the calendar body keeps its own padding and would need the same step); Kanban column titles at 14px keep hierarchy through the colored phase bar; admin users in one column with 16px padding give names 245px; auth labels at PrismLabel size match Profile; title scale 30/48px semibold matches Help/Notifications.

### Updated sequence

Ordered by impact; each still needs owner authorization.

| #      | Ticket                                                                                                     | Change from round 1                        |
| ------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| S0     | Portal header wraps on phones (N1)                                                                         | **new, highest impact** — clients use it   |
| S1     | Login grid (A1)                                                                                            | unchanged; confirmed                       |
| S1b    | Admin grids one column below `sm` + chip truncation (A6, N5)                                               | promoted from static to confirmed          |
| S2     | Focus: editor toolbar, `form-inline`/`form-link` triggers, UToggleInput, filled button border (A2, A3, N3) | ComboboxTrigger scope narrowed             |
| S2b    | Lead badge contrast via PrismBadge variants (B13)                                                          | promoted to functional                     |
| S2c    | Drawer tab labels at375/390 (N2)                                                                           | new; coordinate with ticket15 tab contract |
| S3–S10 | as listed above                                                                                            | unchanged; N4 joins S6, N6 joins S9        |

### Round 2 limits

Controlled fake data only: no real database, permissions or provider behaviour; avatars are initials. Chromium headless only for the team app; WebKit only for `/login` at375; no physical Safari/touch. Contrast numbers are canvas-composited WCAG 2.x indicators, not a certification. No repository code, tests, SQL, owner server5176, commit, push or deploy touched; the isolated server5193 was stopped after the round.

## Round 3 — conformance to the design standards (2026-11-01)

Owner asked for the complete analysis, conformance to the design standards in use, and a site explaining everything for approval; no fixes. Standards measured: **Prism** (the app's own design system, AGENTS.md §2/§5), **WCAG 2.2 AA** (accessibility baseline) and the **WAI-ARIA APG** patterns that React Aria implements. Three parallel subagents: Prism static conformance (235 files), WCAG static review plus OKLCH contrast for every palette × mode, and a runtime sweep (axe-core 4.10.2, target size, reflow 320, text spacing, focus walks, 200% zoom, populated fixtures) on an isolated Vite5193 with the round-2 harness (0 non-GET requests left the page; 242 answered by fixtures; server stopped). Coordinator re-checked: celebrations icon submit without name (`routes/app/admin/celebrations.tsx:119`), header avatar `variant="unstyled"` (`layout/Header.tsx:548`), late-count trigger (`routes/app/partner/$slug.tsx:197`), `late` token use on action cards (`ActionItem.tsx:165`), unsuffixed icons (`RichTextEditor.tsx:17`), `cn` re-export (`lib/utils.ts`), amber unarchive (`ActionFormFooter.tsx:125`), admin users screenshot at375.

### Conformance scorecard

| Standard / rule                         | Result                                                                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prism P1 primitives in `prism/` + index | 31/31 exported, RAC + CVA; `cn` imported from `cnfast` in 77 files instead of `~/lib/utils` (same function)                                              |
| Prism P2 reuse primitives               | ~85% of business files; 32 raw `<button>`, 20 raw `<label>`, 1 `<select>`, 2 `<textarea>` (inline title/caption justified)                               |
| Prism P3 semantic color tokens          | 82% of files clean; ~10 real drifts (amber/zinc/gray, rgba inline); `destructive` (25 uses) duplicates `error` (20)                                      |
| Prism P4 React Aria data states         | Mostly not followed: 274 pseudo-class (`hover:`/`focus-visible:`) vs 50 data-attribute uses; `PrismTabs` is the only fully conforming reference          |
| Prism P5 `Icon` suffix                  | 295/319 (92%); 20 of 24 misses in `RichTextEditor.tsx:17`                                                                                                |
| Prism P6 buttons default size + ring    | PrismButton conforms; 23/32 raw buttons have no focus class; `unstyled` variant removes the ring (`focus-visible:ring-0`)                                |
| Prism P7 `/ui` gallery                  | 15/21 Prism families, 4/9 Uzzina components; missing Select, Calendar, Accordion, Avatar, Skeleton, Label, Sheet (0 consumers), UAdminItemCard, ULoader… |
| AGENTS TS rules                         | 100%: 0 `any`, 0 non-null assertions                                                                                                                     |
| Arbitrary values                        | 129 value-arbitrary in 58 files; ~44 drift (`text-[8–11px]` ×25); invalid class `animation-duration-[3000ms]` (`routes/index.tsx:39`)                    |
| Tokens                                  | `chart-*`, `sidebar-*`, `surface*` defined, never used                                                                                                   |
| WCAG automated (axe)                    | 43/100 runs clean (25 screens × 375/1440 × light/dark); 8 rules violated                                                                                 |
| WCAG token contrast                     | 606 pairs × 12 palettes × 2 modes: 134 fail (all text/background core pairs pass)                                                                        |

### WCAG 2.2 AA by criterion

| SC                        | Status               | Evidence                                                                                                                                                                                                                                                                         |
| ------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.1 / 4.1.2 names       | Fails                | axe `button-name` (critical) 8 nodes: celebrations icon submit, partner-calendar button; `link-name` empty partner link / print link; `aria-command-name` sortable handles (admin partner); color input no name                                                                  |
| 1.3.1                     | Partial              | `aria-label` on role-less calendar day `div` (`aria-prohibited-attr`, 30 nodes at1440)                                                                                                                                                                                           |
| 1.3.5 input purpose       | Fails                | `/login`, reset, profile name fields have no `autoComplete` (only `/dash/login` sets it)                                                                                                                                                                                         |
| 1.4.3 contrast            | Fails                | primary-foreground/primary fails in 9 palette modes (green/cyan/light-blue light 2.5–2.7; orange dark 2.63); `late` text 3.96 in every light mode; portal/review category chips 2.66–2.78; muted 12px 3.90; out-of-month day 1.81; lead badge 4.09 (B13); "Nenhum conteúdo" 2.06 |
| 1.4.10 reflow             | Fails                | `/dash` and `/dash/action` +425px at320 (N1); admin user form 38px and partner 10px inside scroller; AppBar 346px wide clips 4px each side at320                                                                                                                                 |
| 1.4.11 non-text contrast  | Fails                | border/bg 1.16–2.25 and input/bg 1.08–1.20 in all modes (field boundaries); ring/50 <3:1 in 20/24 modes; energy/magenta/yellow light primary ≈ background (1.16–1.75)                                                                                                            |
| 1.4.12 text spacing       | Partial              | `h-5` badges clip 2px vertically (count, lead need, Admin)                                                                                                                                                                                                                       |
| 2.1.1 / 2.5.7 dragging    | Partial              | Kanban/calendar DnD pointer-only; equivalent path via drawer date/phase fields; sprint and media reorder have keyboard                                                                                                                                                           |
| 2.4.1 bypass blocks       | Fails                | no skip link; landmarks not verified                                                                                                                                                                                                                                             |
| 2.4.7 focus visible       | Fails                | header avatar menu (pixel-identical on focus, 3/3 retests); same `unstyled` pattern on late-count trigger; accordion trigger; UToggle (A3); editor toolbar weak (A2)                                                                                                             |
| 2.4.11 focus not obscured | Conforms             | 261 stops: 0 entirely hidden, 7 partly under AppBar (partial hiding is only AAA 2.4.12)                                                                                                                                                                                          |
| 2.5.8 target size         | Partial              | 22 of 25 screens pass at375; fails: card title-edit button 86×22, drawer partner/date 19–20px, chip remove 18px, admin color input                                                                                                                                               |
| 3.1.1 language            | Conforms             | `lang="pt-br"`                                                                                                                                                                                                                                                                   |
| 3.3.1–3.3.3 errors        | Partial              | `role=alert` errors present; suggestions not systematic                                                                                                                                                                                                                          |
| 4.1.3 status messages     | Conforms (indicator) | Sonner aria-live, `role=status` regions                                                                                                                                                                                                                                          |
| APG nested controls       | Fails                | `nested-interactive` serious, 34 nodes per Home/drawer run: action card `role=button` contains title button and dnd handle (`ActionItem.tsx:231`)                                                                                                                                |
| Zoom 200%                 | Conforms             | 720×450 emulation: Home, Today, profile, calendar, admin, 3 drawer tabs all reachable                                                                                                                                                                                            |

### New findings (round 3)

| #   | Finding                                                                                                                                                                                                 | Evidence |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| W1  | Action cards nest interactive controls inside `role=button`                                                                                                                                             | R axe    |
| W2  | Unnamed controls: celebrations add, partner calendar button/link, print link, sortable handles, color input                                                                                             | R + S    |
| W3  | Focus invisible on `unstyled` buttons (header avatar, late count) and accordion trigger                                                                                                                 | R + S    |
| W4  | Palette contrast: 9 primary-foreground failures, `late` 3.96 light, ring/50 and borders under 3:1                                                                                                       | computed |
| W5  | Dynamic category/phase chips on portal/review below 3:1                                                                                                                                                 | R axe    |
| W6  | Missing `autoComplete` on login/reset/profile                                                                                                                                                           | S        |
| W7  | No skip link                                                                                                                                                                                            | S        |
| W8  | Admin user/partner forms overflow at320; AppBar wider than 320 viewport                                                                                                                                 | R        |
| W9  | Badge `h-5` clips under text spacing; small targets in cards/drawer                                                                                                                                     | R        |
| W10 | Help scroll region not focusable (axe `scrollable-region-focusable`); calendar day `aria-label` without role                                                                                            | R axe    |
| W11 | Prism hygiene: data states, Icon suffix, `cn` path, `destructive`/`error`, unused tokens, `/ui` gaps, invalid class                                                                                     | S        |
| —   | A7 (nested button in lead contact) was fixed meanwhile by another session in `3b4d2a4`; populated fixtures confirm A6/N5 (users show "Luiz …", "Carl…"; partners "Café…") and N1 also on `/dash/action` | R        |

### Updated sequence additions (not authorized)

S2d names/ARIA (W2, W10, W6), S2e focus on `unstyled`/accordion (W3, joins S2), S2f palette contrast (W4/W5, needs owner decision on palette lightness), S2g nested action card (W1, medium risk: card click/drag contracts), S2h targets/badges/AppBar width (W8, W9), S2i skip link (W7), S11 Prism hygiene (W11). Owner decisions added: 7 field-boundary contrast (raise borders or accept), 8 palettes failing primary-foreground, 9 skip link, 10 drag-and-drop keyboard path via drawer accepted?, 11 retire `destructive` in favour of `error`.

### Round 3 limits

Automated indicators, not certification. Chromium only for the sweep; dark mode covered by axe and contrast math only; no screen reader, real zoom UI, physical Safari or touch. axe left 959 contrast "incomplete" nodes unreviewed. Palette contrast is computed from tokens (gamut mapping by chroma reduction), not user custom themes or partner colors. Tab walks covered five pages. Working tree contained another session's uncommitted edits (drawer, strategies); line numbers may shift. Scripts, results and shots stay in the session scratchpad.
