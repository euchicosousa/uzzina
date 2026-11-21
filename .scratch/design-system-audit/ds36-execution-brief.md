# DS36 execution brief (stages 1–7)

Owner: Chico (agency CNVT, app UZZINA). Ticket: `.scratch/design-system-audit/issues/36-total-color-editor.md`. Contract to keep in sync: `docs/contracts/surfaces-and-neutrals.md`. Read `AGENTS.md` (project rules) and `docs/audits/CURRENT.md` first.

## Rules (hard)

- You are the **only writer** in this checkout. **Do not commit, push or run git write commands.** Do not touch other people's uncommitted work: `app/components/uzzina/UAvatarSelector.tsx` and anything not listed in this brief. Run `git status` first and again at the end.
- Code, comments, file names in English. UI text in Brazilian Portuguese. No `any`, no non-null assertions. Components in `app/components/prism/` use React Aria + CVA + `cn` from `~/lib/utils`.
- Format changed files with `npx prettier --write <files>`. Typecheck with `npx tsc --noEmit` after **every stage**; it must be clean before the next stage. Do not run the whole test suite (it takes 10+ minutes): run only the listed tests, one file at a time (`bun test tests/<file>`).
- You cannot log in to the app, so you cannot verify the authenticated screens visually. Do not try to log in. State this in your report.
- **Visual identity must not change.** Every value you move from CSS/constants into data must produce the same final color as today (Ônix and the other 10 palettes, light and dark). Keep the current numbers; round new OKLCH data to L 3 decimals, C 3 decimals, H 1 decimal.
- Work stage by stage in order. Keep a short log under "Progress" at the bottom of this file after each stage (what changed, files, tsc result, tests run). If a stage cannot be done safely, **stop**, leave the code compiling, and write the blocker in the log.

## Vocabulary the owner approved (use these names in the editor)

Tema (per palette): **1. Base** (Fundo, Texto, Principal, Texto sobre a principal, Destaque) · **2. Camadas** (Flutuante, Cartão, Campo, Cinza, Cinza · mouse, Borda) · **3. Cartão de ação** (cor, cor · mouse, Relevo).
Global (same for every palette): **4. Estados** (Erro, Atenção, Sucesso, Informação, Sucesso forte) · **5. Prioridades** · **6. Fases** · **7. Categorias** · **8. Texto** (Texto de apoio, Marca-texto) · **9. Interação** (Principal · mouse, Halo de foco) · **10. Sombras e brilho** (Sombra, Sombra do cartão atrasado, Brilho da borda do cartão).
Editor tabs: **Tema** (1–3) · **Estados** (4, 5) · **Fases e categorias** (6, 7) · **Fórmulas** (8, 9, 10).

Principles: every calculation has its slider in the editor; if a color derives from another, the control is the derivation (ΔL / ΔC / ΔH, mix %, opacity); every transparency/mix has **two values (light and dark)**. Fixed colors live in one shared block, not per palette.

## Stage 1 — Presentation, info popovers, Prism fix

Files: `app/components/prism/accordion.tsx`, `app/components/features/admin/themes/*` (`ThemeColorInspector.tsx`, `ThemeEditorControls.tsx`, `ThemePreviewPane.tsx`, `theme-editor-model.ts`), `app/routes/app/admin/themes.tsx`, gallery `/ui` accordion section if one exists.

1. **Prism accordion bug:** `AccordionItem` uses `data-open:bg-secondary` but React Aria 1.19 sets `data-expanded` (never `data-open`). Change to `data-expanded:bg-secondary`. Remove the dead `data-open:animate-accordion-down data-closed:animate-accordion-up` classes from `AccordionContent` (those keyframes do not exist; the height transition stays).
2. **Info button next to every item name**, e.g. `Fundo (i)`: a `PrismButton variant="ghost" size="icon-xs"` with `InfoIcon` and `aria-label="Como esta cor é calculada"`. It opens a `PrismPopover` (see `app/components/prism/popover.tsx`). **A button cannot be nested inside the accordion trigger button.** Extend Prism `AccordionTrigger` with an optional `info` prop: when given, render the visible row content (name + info button + hint + swatches) as normal markup and make the actual trigger `Button` a transparent `absolute inset-0` overlay (stretched-trigger pattern, `aria-label` = item name); content is `pointer-events-none` except the info button (`pointer-events-auto relative z-10`). Without `info`, behavior stays exactly as today. Mention the new prop in the gallery accordion example if one exists.
3. Popover content (create `theme-editor-rules.ts` next to the model): per item id an entry `{ title, rule, code, calc? }`:
   - `rule`: plain Portuguese, no jargon, says what the color is for and how it is derived today. Use `text-base`.
   - `code`: the real rule as written in `app/tailwind.css` today (copy the exact expression), in a `<pre>` with `font-mono text-xs`.
   - `calc?: (palette, mode) => string`: live arithmetic with the open palette's numbers, e.g. `Fundo 0,96 − 0,512 = 0,448` (use Portuguese decimal comma in the text).
   - Cover every item of blocks 1–10 even if its rule is still the old one; later stages update the entries.
4. **Layout and text:** inspector shows the four tabs (use the Prism tabs component) so each tab renders only its blocks. Block titles are `<h5>` (no size classes). Replace `text-sm` with `text-base` in the inspector and controls (names, values, explanations, group headers); `text-xs` stays only for short hints and swatch labels. More breathing room: `gap-12` between blocks, trigger padding `p-5`, swatches `size-10`, `gap-8` between Claro and Escuro groups in an open panel. Keep accordions `bg-card` with `hover:bg-secondary` on the item.
5. Preview pane (`ThemePreviewPane.tsx`): separate the examples with fixed captions ("Cartão", "Menu", "Cinza", "Campos", "Avisos") and a grid with clear spacing; do not mix them in one scene.
6. Update the editor's generated markdown/diff text only if it still mentions removed things.

## Stage 2 — Shared block in `palettes.ts`, OKLCH phases and categories

1. In `app/lib/palettes.ts` export `type ModePair<T> = { light: T; dark: T }` and `export const SHARED_COLORS` (typed), placed **after** `PALLETE`:
   - `states`: for `error | warning | success | info` → `{ color: ModePair<OklchColor>, text: ModePair<OklchColor> }`, plus `backgroundMix: ModePair<number>` (10 / 30) and `successStrong: { l: 0.53, c: 0.105, hoverL: 0.4, hoverC: 0.09 }`. Take the numbers from the semantic block in `app/tailwind.css` (light block and `.dark` block, `--color-error`, `--error-foreground`, `--color-success-foreground`, `--info-foreground`, ...).
   - `phases`: `Record<PhaseSlug, OklchColor>` converted from the hex in `CONSTANTS.ts` (use `hexToOklch` from `app/utils/color.ts` in a throwaway script; put only the resulting numbers in the file).
   - `categories`: same for the 13 categories.
2. `app/lib/CONSTANTS.ts`: `PHASES[slug].color` and `CATEGORIES[slug].color` become `oklch(L C H)` CSS strings built from `SHARED_COLORS` (small helper, no browser-only code; the server does not import these files today but must be able to). Keep every other field.
3. Fix the four places that assumed hex (all found by a survey): `app/components/uzzina/UIcons.tsx` (it uses the `color` library, which throws on `oklch()`; rebuild the desaturate/alpha with CSS: `oklch(from ${c} l calc(c * 0.7) h / ${alpha})` or equivalent that keeps the same look), `app/routes/dash/review.$slug.tsx:215` and `app/routes/dash/action/$id.tsx:376` (`${color}20`/`${color}22` → `color-mix(in oklab, ${color} 12%, transparent)` / `13%`), and `theme-editor-model.ts` (stop using `hexToOklch(PHASES[...].color)`; read `SHARED_COLORS` directly; change the `file`/`keyPath` metadata of generated changes to `app/lib/palettes.ts` · `SHARED_COLORS...`). Grep once more for `.color` uses of PHASES/CATEGORIES that do string tricks.
4. Editor model: the draft now also carries the shared block (`states`, `phases`, `categories`, and later the formulas). `computeThemeChanges` and `buildPalettesSource` must include it; the generated `palettes.ts` must contain **both** `PALLETE` and `SHARED_COLORS` (cut the original file text at `export const PALLETE`, rebuild both literals). Keep the round trip lossless: prove it with a throwaway script that regenerates the file and diffs it against the current one after Prettier.
5. Remove `ORIGINAL_PRIORITIES` (invented values). Priorities are **read-only** in the editor: "Baixa = Sucesso, Média = Atenção, Alta = Erro" with swatches taken from the states. Bump the draft storage key to `...:v3` and keep the fingerprint check.
6. Phases/categories editor items become L-C-H groups bound to `SHARED_COLORS`.

## Stage 3 — Texto de apoio, Principal · mouse, Halo de foco, Brilho, first-paint

All values go in `SHARED_COLORS.formulas` (add the type). Write CSS variables from `palette-vars.ts` through a new `applySharedColorVars(root)` that `applyPaletteVars` also calls (so scoped previews get it). Name variables `--shared-<token>` (light) and `--shared-dark-<token>`.

1. **Texto de apoio** (`--secondary-foreground` in `tailwind.css`, lines ~45 and ~180): it derives from the **background**. Today: light `oklch(from var(--background) calc(l - 0.512) max(0, calc(c - 0.001)) h)`, dark `calc(l + 0.549)` and `max(0, calc(c - 0.007))`. Data: `support: { lDelta: {light: -0.512, dark: 0.549}, cDelta: {light: -0.001, dark: -0.007} }`; CSS reads the variables.
2. **Principal · mouse:** today `color-mix(in oklab, var(--primary), var(--background) 20%)` is repeated as arbitrary classes in `app/components/prism/button.tsx` (and maybe elsewhere: grep `var(--background)_20%`). Define `--primary-hover` once in `tailwind.css` from `--shared-primary-hover-mix` (`{light: 20, dark: 20}`), expose `--color-primary-hover`, and replace the arbitrary classes with `hover:bg-primary-hover` / `hover:border-primary-hover` (and the `data-selected:` variants).
3. **Halo de foco:** there are 37 `ring-ring/30` (including `focus-visible:`, `focus-within:`, `has-[...]` forms); all are 30%. Define `--color-ring-halo: color-mix(in srgb, var(--ring) var(--ring-halo-alpha), transparent)` with `ringHalo: {light: 30, dark: 30}` and replace every `ring-ring/30` by `ring-ring-halo`. The 4 solid `ring-ring` stay.
4. **Brilho da borda do cartão:** `--action-top-border` is white (`#ffffff`; `palette-vars` may override with `topBorderColor`, which no palette uses). Make it `color-mix(in srgb, white var(--top-highlight-alpha), transparent)` with `topHighlight: {light: 100, dark: 100}`; remove `topBorderColor` from the types and `palette-vars.ts`.
5. **Remove the `var(--x, default)` fallbacks** of the neutral deltas in `tailwind.css` (no default delta). Because the Personalizado theme does not store them yet (stage 8 is **not** part of this job), fill the missing deltas from `PALLETE[0]` (Ônix) at apply time in `useAppTheme.ts` where the custom palette is built (clear comment: temporary until stage 8).
6. **First paint:** `index.html` keeps only `--background-override`, `--dark-background-override`, `--foreground-override` and `--dark-foreground-override` (Ônix values: bg `oklch(0.96 0.002 200)` / `oklch(0.2 0.01 250)`, text black / white) and drops the primary preloads. Find the app entry (where React is rendered) and call `applyPaletteVars(PALLETE[0])` synchronously **before** the first render so every layer exists at first paint; check `useAppTheme.ts` still re-applies the user's palette. `applyPaletteVars` already removes `--foreground-override` when the palette has none: keep that.
7. Editor: items of block 8/9/10 in the Fórmulas tab with sliders for each variable (two values each). Update `theme-editor-rules.ts` for them.

## Stage 4 — Sombras (DS29 rule) and late-card shadow

Rule (ticket `issues/29-single-shadow-formula.md`): shadow color = background mixed with primary, darkened.
```css
--shadow-color: oklch(from color-mix(in oklab, var(--background), var(--primary) var(--shadow-mix)) var(--shadow-l) c h);
```
Data `SHARED_COLORS.shadow`: `mix {light: 30, dark: 20}`, `l {light: 0.15, dark: 0.15}`, `alpha {light: 10, dark: 70}`. Replace `--shadow-tint`, `--shadow-alpha`, `--action-shadow-color` and their overrides; remove `shadowColor` and `shadowOpacity` from `PaletteConfig`, all 11 palettes, `palette-vars.ts`, the editor (Sombra items move to the shared Fórmulas tab) and tests (`tests/palette-vars.test.ts`, `tests/custom-theme-ds09.test.ts`: update expectations). The Personalizado theme stops offering/storing shadow color and strength (ignore old stored values harmlessly; adjust its UI in Minha Conta and `app/lib/custom-theme.ts`). Keep "Relevo" (`relief`) as is.
Late-card shadow (`late-surface` in `tailwind.css`): data `lateShadow` with light `{alpha: 25, alphaHover: 30}` from `--error-foreground`, dark `{l: 0.45, c: 0.18, alpha: 50, alphaHover: 60}` from `--color-error`; CSS reads them.

## Stage 5 — Phase derivations

In `tailwind.css` (`@utility phase-surface` and `@utility phase-vivid`) replace the literals by variables from `SHARED_COLORS.formulas.phase` (two values each): soft mix 15/40, hover mix 30/70, ring alpha 30/55, text L,C `0.35,0.07` / `0.92,0.06`, shadow L,C `0.6,0.15` / `0.33,0.10`, shadow alpha 25/20, diffuse (dark only) `0.2,0.15` at 63%, vivid ink `0.35,0.07` (light-ink variant `0.98,0.025`), hover ΔL 0.1, edge ΔL 0.06/0.14, top light 45/25, dim fill L 0.72 and C×0.8, vivid shadow `0.55,0.16`. Editor: Fases tab shows each derivation with its slider.

## Stage 6 — States, success strong, marker

Semantic block in `tailwind.css` (light and `.dark`) reads `SHARED_COLORS.states` through variables (no literal values left): `--color-<state>`, `--<state>-foreground`/`--color-success-foreground`, background `color-mix(in oklab, var(--color-<state>) <backgroundMix>, var(--background))`, success strong from `successStrong`. Marker (`.tiptap.ProseMirror mark`, text `oklch(0.25 0.03 80)`): derive from `--color-warning` with `markerText: { lDelta, c }` data (compute lDelta so the result equals today's color in light and dark). Editor: Estados tab shows color and text L-C-H per state, the mix slider, success strong sliders.

## Stage 7 — Texto sobre a principal derived from the principal

Replace `primaryFg?` by required `primaryFgDelta: { l: number; c: number; h: number }` per mode in `PaletteConfig` (so all palettes stay complete). Compute each delta from today's values (`primaryFg − primary`; hue wrapped to ±180; C delta may be as low as −0.5) and prove with a throwaway script that the resulting color equals today's within 0.005 L / 0.005 C. CSS: `--primary-foreground: var(--primary-foreground-override, oklch(from var(--primary) calc(l + var(--primary-fg-l-delta)) max(0, calc(c + var(--primary-fg-c-delta))) calc(h + var(--primary-fg-h-delta))))` and the dark equivalent. `palette-vars.ts` writes the three deltas. The custom theme keeps its own explicit `--primary-foreground-override` (unchanged). Editor sliders: ΔL −1…+1, ΔC −0.5…+0.05, ΔH −180…+180, with the contrast ratio hint kept.

## Not in this job

Stage 8 (Personalizado storing all of block 1–3). Do not change `people.preferences` format. No database changes. No commit.

## Docs and checks at the end

- Update `docs/contracts/surfaces-and-neutrals.md` (shared block, new variables, where each value lives, the rule of text de apoio from the background, halo, mouse), the DS36 entry in `docs/audits/CURRENT.md`, and `.scratch/design-system-audit/issues/36-total-color-editor.md` (what was implemented, what was not verified visually).
- `npx tsc --noEmit` clean; Prettier on all changed files; run: `tests/palette-vars.test.ts`, `tests/custom-theme-ds09.test.ts`, `tests/profile-palette-swatches.test.tsx`, `tests/prism-button-unstyled.test.tsx`, `tests/global-search-partners.test.tsx`, plus any test that references things you removed (grep `shadowColor`, `primaryFg`, `topBorderColor`).
- Final report: per stage, files changed, anything skipped, every value you could not keep identical, and a list for the owner of what to look at on screen.

## Progress

(append here)

### Stage 1 (done, agent run 21/11/2026)
- Files: `app/components/prism/accordion.tsx` (data-expanded fix, dead classes removed, `info` flag: trigger becomes overlay, info button sits next to the name), `app/components/features/admin/themes/theme-editor-rules.ts` (new: rule, code, live calc for every item of blocks 1-10), `ThemeEditorControls.tsx` (RuleInfo popover, RowHeader info slot, text-base, size-10 swatches, p-5 locked rows), `ThemeColorInspector.tsx` (Tema / Estados / Fases e categorias / Fórmulas tabs, h5 blocks numbered 1-10, names from the approved vocabulary, gap-8 inside panels), `ThemePreviewPane.tsx` (Cartão, Menu, Cinza, Campos as separate captioned examples; Avisos caption), `app/components/ui-sections/AccordionSection.tsx` (info toggle in gallery).
- Not done in stage 1: categories (block 7, stage 2); `Sucesso forte`, `Texto de apoio`, `Marca-texto` appear only in the rules file. Alert swatches (Erro, Atenção, Sucesso, Informação) are still hard-coded values in ThemeColorInspector and do not match tailwind.css today (stage 6 replaces them).
- Checks: `npx tsc --noEmit` clean after each change. Visual check not possible here (editor needs login).


### Stage 2 (done, agent run 21/11/2026)
- Files: `app/lib/palettes.ts` (types `ModePair`, `PhaseSlug`, `CategorySlug`, `StateColor`, `SharedColors`; `SHARED_COLORS` after `PALLETE` with states, phases, categories; `oklchToCss`), `app/lib/CONSTANTS.ts` (PHASES/CATEGORIES color = `oklchToCss(SHARED_COLORS...)`, relative import), `app/components/uzzina/UIcons.tsx` (no `color` library; CSS `oklch(from ...)` tint), `app/routes/dash/review.$slug.tsx` and `app/routes/dash/action/$id.tsx` (`color-mix` instead of hex alpha), `theme-editor-model.ts` (ORIGINAL_PRIORITIES removed, priorities derived from states, shared diffs in `computeThemeChanges`, `buildPalettesSource(palette, shared)` rebuilds PALLETE and SHARED_COLORS, storage key v3 with `sharedBase`), `theme-editor-rules.ts` (category rules), `ThemeColorInspector.tsx` (shared prop, categories block 7, priorities read-only rows), `app/routes/app/admin/themes.tsx` (single `draftShared`).
- Values that are not byte-identical: phases/categories hex -> oklch. Five colors (phase idea, phase do, cat capture, cat design, cat stories) do not come back to the same hex with the 3/3/1 rounding; they keep 4 decimals (L/C) and 2 decimals (H). The other colors use 3/3/1. Verified with `oklchToHex` against the original hex. `UIcons` tint now uses chroma x 0.7 in OKLCH (the old one desaturated in HSL): same intent, not the same pixels. Hex alpha suffixes became `color-mix` at 12.55% and 13.33% (exact 32/255 and 34/255), not the 12%/13% in the brief.
- Round-trip proof: regenerated palettes.ts from the current data: PALLETE and SHARED_COLORS deep-equal the current values. Text differs only in formatting (`-1.0` becomes `-1`; objects are one per line). Throwaway scripts in the session scratchpad.
- Checks: tsc clean. Not done: the Ônix values of the editor are not compared visually (login needed).

### Stage 3 (done, agent run 21/11/2026)
- Files: `app/lib/palettes.ts` (formulas block; `topBorderColor` removed from PaletteConfig), `app/lib/palette-vars.ts` (`applySharedColorVars`, top border no longer read from palette), `app/tailwind.css` (`--secondary-foreground` from `--shared-support-*`; `--primary-hover`; `--ring-halo`; `--action-top-border` from `--shared-top-highlight-alpha`; all 18 `-l-delta` defaults removed; `@theme` adds `primary-hover` and `ring-halo`), `app/components/prism/button.tsx`, `ThemePreviewPane.tsx`, and the 37 `ring-ring/30` files (now `ring-ring-halo`), `app/hooks/useAppTheme.ts` (custom deltas from Ônix; custom top border applied there), `app/main.tsx` (`applyPaletteVars(PALLETE[0])` before render), `index.html` (4 override vars only), `theme-editor-model.ts` (formula get/set and diffs), `theme-editor-rules.ts`, `ThemeColorInspector.tsx` (8 Texto, 9 Interação with sliders, topHighlight in 10), `ThemePreviewPane.tsx` (`shared` prop), `app/routes/app/admin/themes.tsx`, tests `tests/palette-vars.test.ts` and `tests/custom-theme-ds09.test.tsx` (top-border expectations moved to useAppTheme).
- Values that could not stay identical: `topHighlightAlpha` dark is 10 (the brief said 100): the dark card border today is rgba(255,255,255,0.1); 100 would have changed it. Halo uses `in srgb` as the brief says (Tailwind used oklab; same result with transparent).
- Custom theme `topBorderColor` (user option) kept working: applied in useAppTheme, not in palette-vars; `people.preferences` format untouched.
- Checks: tsc clean; `@tailwindcss/cli` compiles tailwind.css (ring-ring-halo and primary-hover generated). Tests run: `tests/palette-vars.test.ts` 7 pass, `tests/custom-theme-ds09.test.tsx` 7 pass.
- Not verified in the browser: first paint, the authenticated editor, the preview. The first paint depends on main.tsx running before the first paint of the public pages.

### Stage 4 (done, agent run 21/11/2026)
- Files: `app/lib/palettes.ts` (`shadowColor`/`shadowOpacity` removed from the type and from all 11 palettes; `SHARED_COLORS.shadow` and `lateShadow` added), `app/lib/palette-vars.ts` (shadow overrides removed; `applySharedColorVars` writes `--shared-shadow-*` and `--shared-*late-*`), `app/tailwind.css` (`--shadow-color` formula from DS29 in :root and .dark; `--shadow-tint`, `--action-shadow-color` and their overrides gone; `late-surface` reads the shared values), `app/hooks/useAppTheme.ts` (no shadow fields or storage keys), `app/components/features/profile/CustomThemePanel.tsx` (shadow section removed), `app/lib/custom-theme.ts` (shadow keys removed from options and draft), `app/components/ui-sections/TokensColorsSection.tsx` (two notes), editor model/inspector/rules/route (shadow formula items and the late card item in block 10), tests `tests/palette-vars.test.ts` and `tests/custom-theme-ds09.test.tsx` (preference-parsing tests unchanged).
- Deliberate visual change (DS29, decided by the owner 17/11): the shadow color of EVERY palette changes to the single formula, and the per-palette shadow strength (Ônix dark 50%) becomes the shared value (dark 70%). This is the owner's decision, not the identity rule. Not verifiable here (login).
- `people.preferences` format unchanged: old shadow values are still parsed and ignored.
- Checks: tsc clean; tests `palette-vars` 5 pass, `custom-theme-ds09` 7 pass; CSS compiles.

### Stage 5 (done, agent run 21/11/2026)
- Files: `app/lib/palettes.ts` (`formulas.phase` with 22 values: pairs for light/dark and single values), `app/lib/palette-vars.ts` (`--shared-phase-*` writers), `app/tailwind.css` (`phase-surface` and `phase-vivid` read the variables; the literals are gone), `theme-editor-model.ts` (`getPhaseFormula`/`setPhaseFormula`, diffs), `ThemeColorInspector.tsx` (block "6. Fases · derivações" with five items and sliders), `app/routes/app/admin/themes.tsx` (handler), `theme-editor-rules.ts` (five items).
- Not moved (not in the brief list, kept as numbers in CSS): the vivid hover shadow alpha 40%, the `calc(c - 0.01)` hover chroma, the vivid hover `0 14px 30px` shadow geometry, the `0.85` date opacity and the `40%` of vivid shadow. Report them as pending for the owner.
- Checks: tsc clean; `@tailwindcss/cli` compiles tailwind.css.

### Stage 6 (done, agent run 21/11/2026)
- Files: `app/lib/palettes.ts` (`markerText`), `app/lib/palette-vars.ts` (`--shared-<state>-color/-text`, background mix, success strong, marker), `app/tailwind.css` (semantic block and marker read the variables; literals gone; `--marker-text` added), `theme-editor-model.ts` (state, numeric and marker accessors; diffs), `ThemeColorInspector.tsx` (Estados tab with editable state items, read-only priorities, "Sucesso forte", "Fundo dos avisos", "Marca-texto" in 8. Texto), `app/routes/app/admin/themes.tsx` (handlers), `theme-editor-rules.ts`.
- Marker: lDelta light -0.57 and dark -0.59 (so L = 0.25 as today); C 0.03; hue from Atenção (80, same as today).
- Checks: tsc clean; tailwind compiles.

### Stage 7 (done, agent run 21/11/2026)
- Files: `app/lib/palettes.ts` (`primaryFg` replaced by required `primaryFgDelta` in all 22 mode entries; values from the throwaway script: all 22 were explicit), `app/lib/palette-vars.ts` (writes `--primary-fg-{l,c,h}-delta` and `--dark-…`; the explicit override stays for the custom theme), `app/tailwind.css` (`--primary-foreground` in :root and .dark from the deltas; dead `--primary-fg-l` and `--dark-primary-fg-l` removed), `app/hooks/useAppTheme.ts` (custom theme gets the Ônix delta as fallback), `theme-editor-model.ts` (`getEffectivePrimaryFg` from the deltas), `ThemeColorInspector.tsx` (ΔL −1…+1, ΔC −0.5…+0.05, ΔH −180…+180 sliders; contrast hint kept), `app/routes/app/admin/themes.tsx`, `theme-editor-rules.ts`.
- Proof: script `ds36-pfg.ts` (session scratchpad): derived L and C equal today's within 0.0001 for 22 of 22; hue error 0.
- Checks: tsc clean; tests `palette-vars` 5, `custom-theme-ds09` 7, `profile-palette-swatches` 4, `prism-button-unstyled` 2, `global-search-partners` 55 (all passed). Prettier on all changed files. Tailwind compiles.

## Closing (21/11/2026)
- Etapas 1 a 7 feitas no checkout local, sem commit, push ou publicação. Etapa 8 não foi executada (fora do job).
- Desvios: brilho do cartão no escuro 10% (não 100%); cinco cores com 4 casas (phase idea, do; cat capture, design, stories); UIcons usa `oklch(from …)` em vez de `color`; alfas de hex viraram `color-mix` 12,55% e 13,33%; sombra muda nas 11 paletas por decisão do DS29; números do vivo (40%, 0,01, 14px 30px, 0,85) ficaram no CSS.
- Não verificado no navegador (login não feito): telas autenticadas, o editor, o primeiro pintar das páginas públicas, o halo srgb.
