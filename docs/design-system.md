# UZZINA Design System — Linear Precision + Swiss Grid Specification

**Status:** SUSPENDED on 2026-11-02 by the owner. Do not apply. The code was reverted to commit `ad0c0ed`; the implemented state is preserved on branch `backup/visual-2026-11-02`. A new visual rule will replace this document. Detailed audit findings and file/line evidence are recorded in [2026-11-01-strict-design-system-audit.md](audits/2026-11-01-strict-design-system-audit.md).

---

## 1. Core Philosophy: Linear Precision on a Swiss Grid

UZZINA combines two complementary visual principles:
1. **Swiss International Grid (Macro Structure):** Pages and sections are divided by exposed `1px` structural hairlines (`border-border`, `.border_before`, `.border_after`, `border-x`, `border-b`) directly on the canvas (`bg-background`), with strong typographic hierarchy and generous breathing room in editorial/configuration views. Form sections and preferences are **never** boxed inside rounded cards (`rounded border bg-card`).
2. **Linear Precision Instrument (Micro Controls & Workbench):** Interactive controls, cards, popovers, and operational boards (Calendars, Kanban, Today, Partner, Action Drawer, Command Palette) use crisp geometric radii (`2px / 4px / 6px / 12px`), hairline `1px` borders instead of drop shadows, restrained font weights (`400–600`, never `700+`), and a single chromatic accent button per view ("functional flashlight").

---

## 2. Geometry & Border Radius Vocabulary (No `.squircle`)

The experimental `.squircle` (`corner-shape: superellipse(1.5)`) utility and oversized `18px–27px` radii (`rounded-2xl` to `rounded-4xl`) are **retired**. The entire system uses **5 geometric radii**:

| Token / Class | Value | Allowed Elements |
| :--- | :--- | :--- |
| **`rounded-xs`** (`--radius-xs`) | **`2px`** | Micro inline indicators, time-field segments, progress bars |
| **`rounded-sm`** (`--radius-sm`) | **`4px`** | `PrismBadge`, status tags, holiday tags, `PrismCheckbox` (`size-4`), `<kbd>` shortcuts |
| **`rounded-md`** (`--radius-md`) | **`6px`** | **All interactive controls & list items:** `PrismButton` (all sizes), `PrismInput`, `PrismSelectTrigger`, `PrismDateRangePicker`, `PrismTextarea`, `PrismTimeField`, `PrismColorField`, `PrismToggle`, `PrismToggleGroup`, `DropdownMenuItem`, `SelectItem`, `ComboboxItem`, `CommandItem`, compact `ActionItem` cards (line/block) |
| **`rounded-xl`** (`--radius-xl`) | **`12px`** | **All floating overlays & large cards (system ceiling):** `PrismDialog`, `PrismPopover`, `PrismDropdownMenu`, `PrismSelectPopover`, `PrismComboboxContent`, `PrismCommand` (`Cmd+K`), `AppBar`, `PrismAlert`, `UAdminItemCard`, `LeadCard`, `ActionItem` (`variant="content"`) |
| **`rounded-full`** | **`9999px`** | Circular avatars (`PrismAvatar`, `UAvatar` with `rounded`), slider thumbs, radio buttons |

- **Concentric Law for Floating Containers:** Every `12px` (`rounded-xl`) floating container (`Popover`, `DropdownMenu`, `SelectPopover`, `ComboboxContent`, `Command`) uses `6px` (`p-1.5`) internal padding around `6px` (`rounded-md`) list items ($R_{\text{outer}} 12\text{px} - P 6\text{px} = R_{\text{inner}} 6\text{px}$).

---

## 3. Surface Progression, Hairline Borders & Elevation (OKLCH Light & Dark)

Elevation is achieved through **4 progressive surface levels** and **`1px` hairline borders** (`border-border`), not heavy drop shadows or white 3D bevels (`border-t-white` is banned).

### 3.1 Four-Level Surface Hierarchy (`Void → Carbon → Obsidian → Slate`)

| Level | Linear Equivalent | UZZINA Token | Dark Mode (`L`) | Light Mode (`L`) | Boundary & Shadow Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Level 0 — Void** | `#08090a` | `bg-background` | `L ≈ 0.120–0.145` | `L ≈ 0.985–1.000` | Structural section dividers (`border-b`, `border-x`, `.border_after`). `shadow-none`. |
| **Level 1 — Carbon** | `#0f1011` | `bg-card` / `bg-muted` / `bg-action` | `--card`: `+0.035`<br>`--muted`: `+0.025`<br>`--action`: `+0.035` | `--card`: `+0.015` (`1.00`)<br>`--muted`: `-0.030` (`0.955`)<br>`--action`: `+0.015` (`1.00`) | `1px` hairline (`border border-border` or `ring-1 ring-border`). **Zero drop shadow at rest** (`shadow-none`). Action cards darken/lighten on hover (`--action-hover`: `-0.025` light, `+0.070` dark). |
| **Level 2 — Obsidian** | `#161718` | `bg-popover` | **`--popover`: `+0.065`** *(always lighter than canvas & card!)* | `--popover`: `+0.015` (`1.00`) | Floating overlays only (`Popover`, `DropdownMenu`, `Select`, `Combobox`, `Dialog`, `AppBar`). Single `1px` boundary (`ring-1 ring-border`) + restrained dark shadow (`shadow-lg` on popovers/AppBar, `shadow-xl` on modals). **Never** combine `border` + `ring-1`. |
| **Level 3 — Slate** | `#23252a` | `bg-secondary` / `bg-input` | `--secondary`: `+0.080`<br>`--input`: `+0.045` | `--secondary`: `-0.050`<br>`--input`: `-0.035` | **Inputs (`PrismInput`, `SelectTrigger`, `Textarea`, `DateRangePicker`):** subtle fill (`bg-input/60`) + **visible `1px` hairline border (`border border-border`)**, brightening to `focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25`. `shadow-none`. |

### 3.2 Chromatic Restraint & Semantic Status Tokens
1. **Single Primary Accent per View ("Functional Flashlight"):**
   - `PrismButton variant="default"` (`bg-primary text-primary-foreground`) is reserved strictly for the **single primary CTA of the surface** (e.g., `Salvar Alterações`, `Criar/Atualizar` in the drawer, `Gerar planejamento`, `+ Nova Ação` in `AppBar`).
   - All sibling buttons, toolbar triggers, view switchers, and dialog cancel actions use neutral variants (`outline`, `secondary`, `ghost`).
2. **WCAG AA Palette Guarantee (`≥ 4.5:1`):**
   - Every palette in `app/lib/palettes.ts` and `deriveAccentFg` in `app/utils/color.ts` must guarantee **≥ 4.5:1** contrast between `--primary` and `--primary-foreground` (using dark `#08090a` text on high-luminance accents like `energy`, `yellow`, `green`, `cyan`, `light-blue`, `magenta`, `orange.dark`, `purple.dark`, `red.dark`, and lowering light-mode `red.light`/`orange.light` lightness where white text is used).
   - `--ring` in light mode clamps maximum lightness (`min(l, 0.56)`) so focus rings and `text-primary` links achieve **≥ 3.5:1** against light backgrounds.
3. **Unified Semantic Status Colors (Zero Raw Tailwind Colors):**
   - `--destructive` is aliased to `--color-error` (with `--color-error-foreground`).
   - Status hues are calibrated for perceptual clarity in both modes: `--color-error` (coral red `h = 22`), `--color-warning` (warm amber `h = 75`, replacing olive `h = 90`), `--color-success` (pulse emerald `h = 150`, replacing yellow-green `h = 130`), `--color-info` (signal blue `h = 250`).
   - `--late-foreground` uses `--color-error` (`≥ 4.5:1` in light mode) and `--late-hover` darkens in light mode (`-0.03`).
   - Raw Tailwind palette classes (`amber-*`, `emerald-*`, `rose-*`, `zinc-*`, `gray-*`, `yellow-*`) are **banned** in `app/components/` and `app/routes/`.

---

## 4. Typography Scale & Weight Ceiling (`400–600`)

### 4.1 Core Typographic Laws
1. **Weight Ceiling at `600` (`font-semibold`):**
   - **Ban `font-bold` (`700`)** across all headings, labels, badges, and UI controls (except internal avatar monogram scaling in `UAvatar`). Hierarchy is created by size, color contrast (`text-foreground` vs `text-muted-foreground`), and weights `400` (`font-normal`), `500` (`font-medium`), and `600` (`font-semibold`).
2. **Portuguese Diacritic Safe Line-Heights:**
   - Global `h1`–`h5` in `app/tailwind.css` must **never** use `leading-none` (`1.0`) or `tracking-tighter` (`-0.05em`).
   - Multi-line headings use `leading-tight` (`1.15–1.25`); subheadings and single-line truncated titles (`ActionItem`, `UAvatarSelector`) use `leading-snug` (`1.35–1.375`) so `Ç`, `Ã`, `É` and `ç`, `g`, `p`, `j` are never clipped.
3. **iOS 16px Input Law:**
   - Every text `<input>` and `<textarea>` uses `text-base md:text-sm` (`16px` on mobile to prevent iOS Safari auto-zoom, `14px` on desktop).
4. **Minimum Size Floor:**
   - `12px` (`text-xs`) is the standard floor for captions, badges, timestamps, and overlines.
   - `10px` (`text-[10px]`) is the absolute hard floor reserved only for compact counter pills and media overlay badges (`8px`, `9px`, `11px`, `0.8rem` are banned).

### 4.2 Canonical Role-to-Type Table

| Role | Classes | Size (Mobile → Desktop) | Weight | Line-Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Heading** (`Home` block titles, `ActionTitleInput` normal) | `text-3xl lg:text-5xl font-medium leading-tight tracking-[-0.022em]` | `30px → 48px` | `500` | `1.15–1.25` | `-0.022em` |
| **Page Heading (`h1`)** (`Today`, `Planejamento`, `Profile`, `Leads`, `Admin`, `Notifications`, `Help`, `Dash`) | `text-xl lg:text-2xl font-semibold leading-tight tracking-[-0.015em]` | `20px → 24px` | `600` | `1.25` | `-0.015em` |
| **Section / Dialog Title (`h2`, `PrismDialogTitle`)** | `text-base lg:text-lg font-medium leading-snug tracking-[-0.012em]` | `16px → 18px` | `500` | `1.35` | `-0.012em` |
| **Subsection / Popover / Alert Title (`h3`–`h5`, `PopoverTitle`, `AlertTitle`, Kanban header)** | `text-sm font-medium leading-snug tracking-[-0.01em]` | `14px` | `500` | `1.35` | `-0.01em` |
| **Overline / Section Eyebrow** | `text-xs font-medium leading-normal tracking-wider uppercase text-muted-foreground` | `12px` | `500` | `1.5` | `+0.05em` |
| **Form Field Label (`PrismLabel`)** | `text-xs font-medium leading-snug text-muted-foreground` or `text-sm font-medium text-foreground` | `13px–14px` | `500` | `1.35` | `0` |
| **Form Text Input / Textarea** | `text-base md:text-sm font-normal leading-normal` | `16px → 14px` | `400` | `1.5` | `0` |
| **UI Button / Trigger / Menu / Command Item** | `text-sm font-medium tracking-[-0.01em]` (buttons) / `text-sm font-normal` (menu/command items) | `14px` (`12px` on `xs`) | `500` / `400` | `1.4` | `-0.01em` / `0` |
| **Body Copy** | `text-sm font-normal leading-relaxed` | `14px` | `400` | `1.6` | `0` |
| **Action Card Title / Caption / Timestamp** | `text-xs font-normal` or `font-medium leading-snug` | `12px` | `400` / `500` | `1.35` | `0` |
| **Monospace Technical Metadata** (Action ID, HEX, `<kbd>`) | `font-mono text-xs font-normal tracking-[-0.01em]` | `12px` | `400` | `1.4` | `-0.01em` |

---

## 5. Two-Zone Spatial Architecture & Control Tiers

### 5.0 Unified Spacing Scale (overrides the zone values below)

Owner feedback (02/11/2026): mixing `4px` card stacks with `48px` section padding on the same screen read as crowded groups floating apart. Spacing is chosen by **relationship**, not by zone, and each level is at most 2× the previous one:

| Relationship | Value |
| :--- | :--- |
| Icon ↔ text inside a control | `4px` (`gap-1`) |
| Controls in one group; cards in one list/column (`ActionContainer`, Kanban) | `6–8px` (`gap-1.5` / `gap-2`) |
| Groups inside a section; card/block padding | `16px` (`gap-4`, `p-4`) |
| Between sections (Home blocks, admin lists, profile sections) | `32px` (`gap-8`, `pb-8`, title `py-6 lg:py-8`) |
| Page top only, once | `48px` max |

**Horizontal axis tokens** (`app/tailwind.css`): `--rail` (`8px` → `32px` at `lg`) positions the side lines and the Header logo (`mx-rail`); `--gutter` (`16px` → `32px` at `lg`) is the content inset (`px-gutter`). Every full-width page, toolbar and Home/Today block uses these tokens; no extra `xl:px-16` jumps and no `p-2` toolbars that break the axis. Mobile-compact Home/Today keep `px-3` below `lg`.

### 5.1 The Two Spatial Density Zones

| Zone | Target Surfaces | Gutter & Section Rhythm | Rules |
| :--- | :--- | :--- | :--- |
| **Zone 1 — Editorial & Configuration (Swiss Breathing Mode)** | `Home` (`/app` block wrappers), `Minha Conta / Preferências` (`/app/profile`), `Planejamento — Left Config Column`, `Admin` lists & forms (`/app/admin/*`), `Leads — Detail`, `Notifications`, `Help`, `Public Review`, `Login/Auth` | • Page gutter: `px-4 py-6 lg:px-8 lg:py-10`<br>• Section gap: `gap-8 lg:gap-12` (`32px–48px`)<br>• Form field stack: `gap-6` (`24px`) between fields, `gap-2` (`8px`) label-to-input | Generous whitespace, exposed `1px` full-bleed or column hairlines (`border-b`, `border-x`), **zero** boxed sub-cards (`rounded border bg-card`) around form groups or preferences. |
| **Zone 2 — Operational Workbench (Linear Compact Mode)** | `Header` (`64px`), `AppBar`, `Today` (`/app/today`), `Partner` (`/app/partner/$slug`), `CalendarGrid`, `KanbanPhasesBoard`, `ActionDrawerPanel`, `GlobalSearchCommand` (`Cmd+K`), `ViewOptions`, `Planning — Right Review/Calendar Column` | • Toolbar padding: `px-3 py-2 lg:px-6 lg:py-2.5`<br>• Control gap: `gap-1.5` (`6px`) or `gap-2` (`8px`)<br>• Card padding: `p-2.5` (`10px`) or `p-3` (`12px`) | High-signal density, compact headers, zero wasted vertical chrome, uniform control heights across every horizontal bar. |

### 5.2 Four Control Geometry Tiers (No Mixed Heights in the Same Row)

| Tier | Size Prop | Height | Horizontal Padding | Icon Size | Font Size | Radius | Primary Use |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **T1** | `lg` / `icon-lg` | **`h-11` (`44px`)** or **`h-12` (`48px`)** | `px-4` (`16px`) | `size-5` (`20px`) | `text-sm` | `rounded-md` (`6px`) | `AppBar` chrome, `ActionFormFooter` (`form-footer` contract `48px`), primary Auth submit |
| **T2** | `default` / `icon` | **`h-10` (`40px`)** | **`px-3.5` (`14px`)** *(uniform across `Input`, `SelectTrigger`, `DateRangePicker`, `ColorField`, `Button`!)* | `size-4` (`16px`) | `text-sm` (`text-base md:text-sm` inputs) | `rounded-md` (`6px`) | Standard form inputs, selects, date pickers, and primary page/form buttons |
| **T3** | `sm` / `icon-sm` | **`h-8` (`32px`)** or **`h-9` (`36px`)** | `px-3` (`12px`) | `size-4` (`16px`) | `text-xs` / `text-sm` | `rounded-md` (`6px`) | Workbench toolbars (`ViewOptions`, `CalendarToolbar`, `Today`, `Partner`, `ClientCalendar`), dialog footer buttons, segmented `PrismToggleGroup` |
| **T4** | `xs` / `icon-xs` | **`h-7` (`28px`)** or **`h-8` (`32px`)** | `px-2.5` (`10px`) | `size-3.5` (`14px`) | `text-xs` | `rounded-md` (`6px`) | Dense inner toolbars (`RichTextEditor`, `CommentInput`), card inline actions |

> **Contract Note (`AGENTS.md`):** `ComboboxTrigger variant="form-footer"` and `ActionFormFooter` buttons preserve their explicit `48px` (`size-12` / `h-12`) contract from `AGENTS.md`, and `AppBar` preserves its `66px` total height (`--app-bar-space: 98px`).

---

## 6. Component Usage Rulebook (Zero Rogue UI)

1. **No Raw HTML Controls:** Never create raw `<button>`, `<input>`, `<select>`, `<textarea>`, or `<label>` in routes or features (except `<input type="hidden">` and the 3 documented typography-inheriting title/caption editors). Always use `~/components/prism`.
2. **Single Choice / Filter Pills:** Always use `PrismToggleGroup` + `PrismToggleGroupItem` (never raw `<button>` loops).
3. **Checkboxes & Switches:** Always use `PrismCheckbox` or `PrismToggle` / borderless `UPreferenceSwitch`. Never wrap `PrismCheckbox` in a native `<label>`, and never nest `<input type="checkbox">` inside `<div role="checkbox">`.
4. **Badges:** Always use `PrismBadge` (`rounded-sm` = `4px`) with semantic variants (`default`, `secondary`, `success`, `warning`, `error`, `info`, `outline`).
5. **Dialogs:** Always use `PrismDialog` (`PrismDialogHeader`, body, `PrismDialogFooter` with `variant="ghost"` cancel button).

