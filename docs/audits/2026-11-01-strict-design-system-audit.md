# Strict Design System Audit & Canonical Specification — 2026-11-01

**Scope:** Zero-trust, full-codebase investigation of the UZZINA visual system (`app/tailwind.css`, `index.html`, `app/lib/palettes.ts`, `app/lib/palette-vars.ts`, `app/components/prism/`, `app/components/uzzina/`, `app/components/features/`, `app/components/layout/`, `app/components/planning/`, and `app/routes/`).
**Premise:** Every existing token, primitive, and route override is treated as **unvalidated** and evaluated against strict mathematical, perceptual, and structural design-system laws (modular typography, polarity-monotonic OKLCH surface elevation, WCAG 2.2 AA contrast, concentric border-radius geometry, 4px/8px control tiers, and zero rogue HTML primitives).

---

## Executive Diagnosis: Why UZZINA Feels Visually Inconsistent

The investigation across 5 parallel audit streams revealed that the "Frankenstein" visual impression comes from **five structural root causes** in the foundation, not merely isolated page typos:

1. **Inverted & Diluted OKLCH Surface Math (`app/tailwind.css` & `app/lib/palettes.ts`):**
   - In **Dark Mode**, `--dark-popover-l-delta` is `-0.03` (`app/tailwind.css:145`, repeated across all 12 palettes in `app/lib/palettes.ts`), making floating popovers, menus, and dialogs **darker** than the page background instead of lighter.
   - In **Light Mode**, `--input-l-delta` is `-0.05` (`1.16:1`), and every Prism input (`input.tsx:9`, `select.tsx:84`, `textarea.tsx:15`, `date-range-picker.tsx:109`) applies `bg-input/50 border-transparent`, cutting that delta in half to `-0.025` (`1.07:1` on `bg-background` and `1.01:1` on `bg-card` — virtually invisible).
   - In **Light Mode**, `--action-l-delta: +0.02` and `--action-hover-l-delta: +0.04` (`app/tailwind.css:84-89`) clamp at `L = 1.0` on 9 of 12 palettes where `--background` is `0.98–1.0`, making `bg-action` and `hover:bg-action-hover` indistinguishable from pure white.
   - `--warning-hue: 90` at `--luminosity: 0.5` (`app/tailwind.css:93,95`) produces a muddy olive-brown in light mode, which caused feature code to bypass tokens and hardcode `amber-*` in 11 places and `emerald-*` in 8 places.
   - **9 of 24 palette modes fail WCAG AA (`4.5:1`)** on `primary` vs `primary-foreground` (worst: `cyan.light` `2.23:1`, `green.light` `2.52:1`, `orange.dark` `2.63:1`, `light-blue.light` `2.94:1`), and **6 of 12 light palettes fail `3.0:1`** for `primary` / `ring` against `background` (`energy.light` `1.14:1`, `yellow.light` `1.84:1`).

2. **Global Typography Cascade Hazard (`app/tailwind.css:370-394`):**
   - `@layer components` defines `h1`–`h5` with `leading-none` (`line-height: 1.0`) and `tracking-tighter` (`-0.05em`).
   - Whenever a route overrides `<h1 className="text-2xl font-semibold">` or `<h2 className="text-base font-semibold">`, it **silently inherits `leading-none` and `tracking-tighter`**, cramping letters at 14px–24px and clipping Portuguese diacritics (`Ç`, `Ã`, `É`, `Õ`) and descenders (`ç`, `g`, `p`, `j`) whenever headings or `ActionTitleInput` (`ActionTitleInput.tsx:30`) wrap to 2 lines.
   - Page titles (`h1`) use **9 different size/weight combinations** across routes (`18px` to `48px`, `font-normal` to `font-bold`).
   - 41 arbitrary `text-[...]` occurrences (`8px`, `9px`, `10px`, `11px`, `12.8px`) and 3 text inputs (`CommentInput.tsx:71` `text-sm`, `PartnerCelebrationsSelector.tsx:116` `text-xs`, `ActionItemTitleInput.tsx:37` `text-xs`) violate the iOS `<16px` auto-zoom threshold.

3. **Broken Concentric Radii, Missing `.squircle` & Double Borders:**
   - `.squircle` (`corner-shape: superellipse(1.5)`, `app/tailwind.css:542`) is an experimental Blink-only property ignored by Safari/WebKit and Firefox. Because `rounded-2xl` (`18.72px`) is applied even to `xs` (`h-8 = 32px`) buttons (`button.tsx:11,32`), on Safari/Firefox `32px` buttons render as full pills (`18.72px > 16px`).
   - Even inside `app/components/prism/`, `squircle` is **missing** on `SelectTrigger` (`select.tsx:84`), `ComboboxContent`/`Item`/`Chips` (`combobox.tsx:137,172,236`), `InputGroup` (`input-group.tsx:11`), `ColorField` (`color-field.tsx:10`), `DateRangePicker` (`date-range-picker.tsx:109`), `DropdownMenuItem` (`dropdown-menu.tsx:94`), and `ToggleGroup` (`toggle-group.tsx:42`).
   - Floating containers split across 4 radii: `Popover` and `DropdownMenu` use `rounded-3xl` (`22.88px`), `SelectPopover` and `ComboboxContent` use `rounded-2xl` (`18.72px`), `Dialog` uses `24px`, and `AppBar` PartnerFilterPopover uses `rounded-4xl` (`27.04px`).
   - `PartnersCombobox.tsx:99`, `ResponsiblesCombobox.tsx:86`, and `SprintCombobox.tsx:119` pass `border shadow-xl` to `PrismPopover` (which already has `ring-1 shadow-lg`), creating **double borders** (`border` + `ring-1`) and higher shadows (`shadow-xl`) than sibling comboboxes (`PhaseCombobox`, `CategoriesCombobox`).
   - `AppBar.tsx:85` floats at `fixed bottom-4 z-20` with **zero shadow**, while hovered cards (`ActionItem.tsx:157`, `UAdminItemCard.tsx:29`) jump to `hover:shadow-lg`, colliding with Level-2 popover elevation.

4. **Control Geometry & Horizontal Padding Collisions:**
   - At Tier `default` (`h-12 = 48px`), `PrismInput` uses `px-5` (`20px`, `input.tsx:13`), `PrismDateRangePicker` uses `px-4` (`16px`, `date-range-picker.tsx:109`), and `PrismSelectTrigger` uses `px-3` (`12px`, `select.tsx:76`). Stacked or side-by-side form fields (`planejamento.tsx`, `PlanningSuggestionEditor.tsx`) have visibly misaligned text indents.
   - Toolbars routinely mix `48px` (`default`/`icon`), `40px` (`sm`/`icon-sm`), `32px` (`xs`/`icon-xs`), and `28px` (`h-7`) controls in the same horizontal row (`planejamento.tsx:320-338`, `TodayPageView.tsx:63-69`, `ViewOptions.tsx:117,381`, `partner/$slug.tsx:191-274`, `ClientCalendar.tsx:87-125`, `InstagramContent.tsx:161-175`, `CommentInput.tsx:83-108`).
   - `PrismDialogFooter` (`dialog.tsx:91`) uses `-mx-4 -mb-4` inside a `p-6` (`24px`) dialog (`dialog.tsx:55`), leaving an unintended `8px` gap around the footer border/background, which caused 6 dialogs to override `PrismDialog` with `p-0` and invent custom `px-5 py-4` / `p-10` paddings.

5. **Rogue UI Elements & Violations of the Borderless Form Rule:**
   - Recent and legacy features introduced raw `<button>`, `<label>`, `<select>`, `<input>`, nested `<div role="checkbox"><input type="checkbox">` (`PartnerCelebrationsSelector.tsx:232-251`), nested `<label><PrismCheckbox>` (`BulkDateTimeDialog.tsx:93,135`), a keyboard-inaccessible `<span onClick>` (`PlanningCalendarView.tsx:168`), and a hand-built modal bypassing `PrismDialog` (`PlanningSuggestionEditor.tsx:66-156`).
   - Multiple surfaces violate the `AGENTS.md` rule against boxing form sections and preferences in bordered cards: `UPreferenceSwitch.tsx:22-25` (`rounded-2xl border bg-card/25 p-4`), `CustomThemePanel.tsx:26` (`rounded-xl border bg-zinc-50/50 p-4`), `profile.tsx:661,702` (`rounded-2xl border bg-muted/20 p-4`), `planejamento.tsx:693,781`, `PlanningCalendarView.tsx:61,195`, `PlanningSuggestionsList.tsx:165`.

---

## Pillar 1: Typography & Hierarchy Audit

### 1.1 Font Loading & Dead Utilities
- **`index.html:24-26` & `public/object-sans/object-sans.css:1-42`**: `"PP Object Sans"` is commented out; the app uses system sans-serif (`--font-sans: ui-sans-serif, system-ui, sans-serif...` at `app/tailwind.css:329-332`). Note that `public/object-sans/` only has `300`, `400`, `500`, `700` faces (no `600` face), so system-ui actually renders true `600` (`font-semibold`) much more cleanly.
- **Unregistered `--font-heading` (`app/tailwind.css:127`)**: Declared in `:root` as `--font-heading: var(--font-sans)`, but omitted from `@theme inline` (`app/tailwind.css:276-349`). Consequently, `font-heading` in `app/components/prism/dialog.tsx:206` and `app/components/prism/sheet.tsx:148` is a dead CSS class.

### 1.2 Global Heading Rules vs. Route Reality
- **`app/tailwind.css:370-394`**:
  - `h1`: `text-5xl leading-none font-bold tracking-tighter` (`48px`, `line-height: 1`, `700`, `-0.05em`)
  - `h2`: `text-4xl leading-none font-bold tracking-tighter` (`36px`, `line-height: 1`, `700`, `-0.05em`)
  - `h3`: `text-3xl leading-none font-semibold tracking-tighter` (`30px`, `line-height: 1`, `600`, `-0.05em`)
  - `h4`: `text-2xl leading-none font-semibold tracking-tight` (`24px`, `line-height: 1`, `600`, `-0.025em`)
  - `h5`: `text-xl leading-none font-medium tracking-tight` (`20px`, `line-height: 1`, `500`, `-0.025em`)
- **Diacritic & Descender Clipping Sites (`leading-none`)**:
  - `app/components/features/action-drawer/ActionTitleInput.tsx:30`: Multi-line `<textarea>` at `text-3xl sm:text-5xl leading-none overflow-hidden` clips accented uppercase (`Á`, `Ã`, `É`, `Ç`) against descenders (`ç`, `g`, `p`, `j`) when wrapping.
  - `app/routes/dash/action/$id.tsx:312`: `<h1 className="p-0 leading-none font-semibold">` at `48px` on mobile and desktop for multi-line action titles.
  - `app/components/features/leads/LeadDetail.tsx:45`: `<h2 className="text-3xl font-medium tracking-tight [overflow-wrap:anywhere] md:text-5xl">` inherits `leading-none` on wrapping lead names.
  - `app/components/features/ActionItem.tsx:263`: `<div className="w-full overflow-hidden text-xs leading-none font-medium text-ellipsis whitespace-nowrap">` clips bottom descenders (`ç`, `g`, `p`, `j`, `y`) on single-line action titles (`ActionItemTitleInput.tsx:30` already uses `leading-snug`).
  - `app/components/uzzina/UAvatarSelector.tsx:76`: `truncate text-sm leading-none font-medium` clips descenders.
- **9 Competing Page Title (`h1`) Styles**:
  1. `text-5xl font-semibold` (fixed `48px` on mobile when `compactMobile=false` in `HomeViewWrapper.tsx:36`, and `dash/action/$id.tsx:312`)
  2. `text-3xl lg:text-5xl font-semibold` (`HomeViewWrapper.tsx:35`, `notifications.tsx:86`, `HelpPage.tsx:284`)
  3. `text-3xl font-bold` (`admin/celebrations.tsx:99`)
  4. `text-2xl lg:text-3xl xl:text-4xl font-semibold` (`TodayPageView.tsx:54`)
  5. `text-2xl font-bold` (`profile.tsx:259`, `admin/partners.tsx:53`, `admin/users.tsx:38`, `admin/clients.tsx:27`, `admin/partner/$slug.tsx:352`, `admin/user/$userId.tsx:194`, `admin/client/$userId.tsx:162`)
  6. `text-2xl font-semibold` (`planejamento.tsx:311`, `dash/review.$slug.tsx:152`)
  7. `text-2xl font-medium` (`leads.tsx:243`)
  8. `text-lg font-medium` (`partner/$slug.tsx:222`)
  9. `PrismAlertTitle` (`alert.tsx:49`): `text-xl font-medium` (`20px` inside an inline alert!).

### 1.3 Control & Input Typography Drift (Including iOS `<16px` Auto-Zoom)
- **iOS Auto-Zoom Failures (`<16px` on `<input>` / `<textarea>` below `md`)**:
  - `app/components/features/ActionComments/CommentInput.tsx:71`: passes `text-sm` (`14px`) to `PrismTextarea`, overriding `text-base md:text-sm`.
  - `app/components/features/PartnerCelebrationsSelector.tsx:116`: passes `h-7 text-xs` (`12px`) to `PrismInputGroupInput`.
  - `app/components/features/ActionItemTitleInput.tsx:37`: inherits `text-xs` (`12px`) from `ActionItem.tsx:263` on mobile.
- **Desktop Input Size Drift (`16px` instead of `text-base md:text-sm`)**:
  - `app/components/prism/command.tsx:140` (`PrismCommandInput`): uses `text-base` without `md:text-sm`.
  - `app/components/features/action-drawer/InstagramTab.tsx:307`: `<textarea>` has no font-size class, inheriting `16px` on desktop.
  - `app/components/features/HelpPage.tsx:293`: raw `<input>` uses `text-base` without `md:text-sm`.
- **Menu & Label Size Drift**:
  - `app/components/prism/command.tsx:240` (`PrismCommandItem`): omits `text-sm` (unlike `SelectItem`, `ComboboxItem`, `DropdownMenuItem` which all specify `text-sm`).
  - Auth labels (`login.tsx:81,107`, `dash/login.tsx:89,117`, `forgot-password.tsx:113`, `reset-password.tsx:181,226`) and Admin labels (`admin/partner/$slug.tsx:437-560`, `AdminUserForm.tsx:85-158`) omit `text-sm`, rendering at `16px` instead of `PrismLabel`'s `14px` (`text-sm font-medium`).

### 1.4 Arbitrary Font Sizes (`text-[...]`)
- **41 occurrences across 17 files**:
  - **Illegible `<10px`**: `PhaseStationBadges.tsx:16` (`text-[8px]`), `WorkFileThumbnail.tsx:48` (`text-[8px]`), `PartnerCelebrationsSelector.tsx:265` (`text-[9px]` for "Feriado", while `celebrations.tsx:260` uses `text-[10px]` for the same badge!).
  - **Unnecessary `10px`–`12.8px` drift (should be `text-xs` = `12px`)**: `calendar.tsx:203` (`text-[0.8rem]`), `PartnerCelebrationsSelector.tsx:100,220` (`text-[11px]`), `CustomThemePanel.tsx:67` (`text-[11px]`), `CommentInput.tsx:187` (`text-[10px]`), `CommentItem.tsx:96,130` (`text-[10px]`), `ActionColorDropdown.tsx:105` (`text-[10px]`), `PlanningCalendarView.tsx:102,127,176` (`text-[10px]`), `ClientCalendar.tsx:166` (`text-[10px]`), `profile.tsx:415` (`text-[10px]`).

---

## Pillar 2: Color System, OKLCH Math & Palettes Audit

### 2.1 Base Token Flaws (`app/tailwind.css`)
1. **Dark Mode Fallback (`app/tailwind.css:135`)**: `--background: var(--dark-background-override, oklch(0.4 0.01 285.823))` defaults to `L = 0.40` (mid-gray) instead of `L = 0.145`.
2. **Dark Mode Popover Polarity Inversion (`app/tailwind.css:145` & `app/lib/palettes.ts`)**: `--dark-popover-l-delta: -0.03` makes floating popovers darker (`L = 0.111`) than the canvas (`L = 0.141`) and cards (`L = 0.191`).
3. **Light Mode Card/Muted Collision (`app/tailwind.css:10,39`)**: `--card-l-delta: -0.02` equals `--muted-l-delta: -0.02`, making `bg-card` and `bg-muted` identical (`1.00:1`).
4. **Light & Dark Input Visibility Failure (`app/tailwind.css:55,194` + `bg-input/50`)**: `--input-l-delta: -0.05` diluted by `bg-input/50` yields a `-0.025` lightness shift (`1.07:1` on `bg-background`, `1.01:1` on `bg-card`). In dark mode, `--dark-input-l-delta: 0.05` equals `--dark-card-l-delta: 0.05`, and in `orange.dark` (`palettes.ts:444`), `inputLDelta: -0.05` is negative!
5. **Light Mode Action Card Clamping (`app/tailwind.css:84-89` & `palettes.ts:416`)**: `--action-l-delta: 0.02` and `--action-hover-l-delta: 0.04` clamp at `1.0` when `bg.l ≥ 0.98`. In `orange.light` (`palettes.ts:416`), `actionHoverLDelta: 1` is a typo.
6. **Light Mode Border Weakness (`app/tailwind.css:52`)**: `--border-l-delta: -0.05` yields only `1.16:1` contrast against `--background` (`1.09:1` against `--card`).
7. **Competing Error & Late Tokens (`app/tailwind.css:50,100-108,187,239,268-273`)**:
   - `--destructive` (`L = 0.70` in light mode) has only `2.98:1` contrast against both white background and `text-white` (`ContentReorderDialog.tsx:89`, `WorkFileThumbnail.tsx:55`, `PlanningCalendarView.tsx:152`).
   - `--destructive-foreground` is undefined in `app/tailwind.css`, yet used in `PlanningSuggestionsList.tsx:142`!
   - `--late-foreground` (`oklch(0.6 0.3 16.339)`) on `--late` (`oklch(0.96 0.02 16.339)`) is `3.49:1` in light mode (fails `4.5:1`), and `--late-l-delta: +0.02` makes `--late-hover` lighter (`0.98`) on hover in light mode.
8. **Broken Preload Script (`index.html:46-75`) & Unused Tokens**:
   - `index.html:46-75` sets `--primary-l/c/h`, which do not exist in `app/tailwind.css`.
   - `--surface`, `--chart-1..5`, and `--sidebar-*` (`app/tailwind.css:14,60-82,142,201-227,288,313-325`) have `0` usages across `app/`.

### 2.2 Palette Contrast Failures (`app/lib/palettes.ts` & `app/utils/color.ts`)
- **9 Palette Modes Fail `primary` / `primary-foreground` (`< 4.5:1`)**:
  - Light: `cyan.light` (`2.23:1`), `green.light` (`2.52:1`), `light-blue.light` (`2.94:1`), `orange.light` (`3.52:1`), `red.light` (`4.12:1`).
  - Dark: `orange.dark` (`2.63:1`), `red.dark` (`3.61:1`), `purple.dark` (`3.68:1`), `navy.dark` (`3.93:1`).
- **6 Light Palettes Fail `primary` / `ring` vs `background` (`< 3.0:1`)**:
  - `energy.light` (`1.14:1`), `yellow.light` (`1.84:1`), `cyan.light` (`1.99:1`), `green.light` (`2.38:1`), `light-blue.light` (`2.78:1`), `magenta.light` (`2.94:1`).
- **`deriveAccentFg` (`app/utils/color.ts:154-157`)**: Uses `oklch.l > 0.62` instead of WCAG relative luminance (`Y > 0.179`), causing mid-lightness primaries (`L = 0.58–0.62`) to pick `#FFFFFF` and fail `4.5:1`.

### 2.3 Hardcoded Non-Token Colors Across Components & Routes
- **`amber-*` (11 sites)**: `app/tailwind.css:520`, `PartnerCelebrationsSelector.tsx:265`, `admin/celebrations.tsx:260`, `CalendarDayCell.tsx:196,203`, `ActionFormFooter.tsx:125`, `PlanningCalendarView.tsx:176`, `profile.tsx:682`, `conflict-comparison.tsx:188`, `ToggleSection.tsx:43`.
- **`emerald-*` (8 sites)**: `PlanningCalendarView.tsx:119,135`, `PlanningSuggestionsList.tsx:64,131,167,274`, `planejamento.tsx:732,733`.
- **`rose-*` / `zinc-*` / `gray-*` / `yellow-*`**: `profile.tsx:86,680`, `CustomThemePanel.tsx:26`, `Footer.tsx:2`, `dash/review.$slug.tsx:255`.
- **`text-white` over dynamic/destructive fills**: `admin/partner/$slug.tsx:689` (`<ULoader className="size-4 text-white" />` inside `PrismButton` — invisible when `primaryFg` is black!), `ContentReorderDialog.tsx:89`, `WorkFileThumbnail.tsx:55`, `PlanningCalendarView.tsx:152`.
- **`border-black/5` & `border-black/10` (invisible in dark mode)**: `BulkColorDialog.tsx:109`, `PartnerColorPicker.tsx:73`, `ActionColorDropdown.tsx:93,131`, `profile.tsx:99-102`.

---

## Pillar 3: Borders, Shadows, Radii, Squircles & Elevation Audit

### 3.1 Radius & `.squircle` Inconsistencies
- **Missing `squircle` in `app/components/prism/`**: `select.tsx:84` (`SelectTrigger`), `combobox.tsx:137,172,236` (`ComboboxContent`, `Item`, `Chips`), `input-group.tsx:11` (`InputGroup`), `color-field.tsx:10` (`ColorField`), `date-range-picker.tsx:109` (`DateRangePicker`), `dropdown-menu.tsx:94,163` (`DropdownMenuItem`, `SubTrigger`), `toggle-group.tsx:42,79` (`ToggleGroup`), `accordion.tsx:22`.
- **Floating Container Radius Split**:
  - `rounded-4xl` (`27.04px`): `AppBar.tsx:228` (`PartnerFilterPopover`)
  - `rounded-3xl` (`22.88px`): `PrismPopover` (`popover.tsx:67`), `PrismMenuContent` (`dropdown-menu.tsx:46`), `PrismCommand` (`command.tsx:52`)
  - `rounded-[min(var(--radius-4xl),24px)]` (`24px`): `PrismDialog` (`dialog.tsx:114`)
  - `rounded-2xl` (`18.72px`): `PrismSelectPopover` (`select.tsx:139`), `PrismComboboxContent` (`combobox.tsx:137`), `Header.tsx:441` (Notifications popover)
  - `rounded-xl` (`14.4px`): `PlanningSuggestionEditor.tsx:69`
- **Inner List Item Radius Split**:
  - `CommandItem` (`command.tsx:240`): `rounded-2xl` (`18.72px` — larger than its concentric allowance inside a `22.88px` `p-2` container, which is why 6 consumers manually override it to `rounded-xl`!).
  - `SelectItem` (`select.tsx:207`) & `ComboboxItem` (`combobox.tsx:172`): `rounded-xl` (`14.4px`).
  - `DropdownMenuItem` (`dropdown-menu.tsx:94`): `rounded-lg` (`10.4px`).
- **Button vs ButtonGroup Clash**: `PrismButton` (`button.tsx:11`) is `rounded-2xl`, while `PrismButtonGroup` (`button-group.tsx:10,12,61`) forces `rounded-xl!`. And on `size="xs"` / `size="icon-xs"` (`32px`), `rounded-2xl` (`18.72px`) exceeds `50%` of height on non-Chromium browsers.

### 3.2 Double Borders, Card Boxing Violations & Focus Rings
- **Double Borders (`border` + `ring-1`)**: `PartnersCombobox.tsx:99`, `ResponsiblesCombobox.tsx:86`, `SprintCombobox.tsx:119`, `UAdminItemCard.tsx:29-31`.
- **Form/Config Card Boxing Violations (`AGENTS.md` rule)**:
  - `app/components/uzzina/UPreferenceSwitch.tsx:22-25` (`rounded-2xl border p-4 bg-card/25`)
  - `app/components/features/profile/CustomThemePanel.tsx:26` (`rounded-xl border bg-zinc-50/50 p-4`)
  - `app/routes/app/profile.tsx:661,702` (`rounded-2xl border bg-muted/20 p-4`)
  - `app/routes/app/planejamento.tsx:693,781` (`rounded-lg border bg-card p-3`)
  - `app/components/planning/PlanningCalendarView.tsx:61,195` (`rounded-xl border bg-card`)
  - `app/components/planning/PlanningSuggestionsList.tsx:155,165-171` (`rounded-xl border bg-card p-5 shadow-xs`)
  - `app/components/features/action-drawer/conflict-comparison.tsx:188,200,263,281`
- **Shadow Hierarchy Collisions**:
  - `AppBar.tsx:85` (`fixed bottom-4 z-20`) has **no shadow** (`shadow-none`).
  - `PartnersCombobox`, `ResponsiblesCombobox`, `SprintCombobox` use `shadow-xl`, while `PhaseCombobox`, `CategoriesCombobox`, `PrismPopover`, `PrismSelectPopover`, `PrismMenuContent` use `shadow-lg`.
  - Hovered cards (`ActionItem.tsx:157`, `UAdminItemCard.tsx:29`) use `hover:shadow-lg`, colliding with open popovers (`shadow-lg`).
  - Form inputs in `admin/partner/$slug.tsx:499,535` and `CustomThemePanel.tsx:45` add `shadow-sm`, while all Prism inputs are flat (`shadow-none`).

---

## Pillar 4: Control Geometry, Spacing & Layout Rhythm Audit

### 4.1 Control Padding, Icon & Height Mismatches
1. **Tier `default` (`h-12 = 48px`) Horizontal Padding Split**:
   - `PrismInput` (`input.tsx:13`) & `PrismColorField` (`color-field.tsx:14`): `px-5` (`20px`)
   - `PrismDateRangePicker` (`date-range-picker.tsx:109`): `px-4` (`16px`)
   - `PrismSelectTrigger` (`select.tsx:84`): `px-3` (`12px`)
2. **`PrismComboboxInput` Size Prop Bug (`combobox.tsx:100-101`)**:
   - Passes `size` to `InputGroupInput` instead of `InputGroup`, so `<PrismComboboxInput size="sm">` keeps an `h-12` (`48px`) outer box around an `h-10` (`40px`) input!
3. **`PrismButton` vs `PrismToggle` Size Divergence**:
   - At `sm` (`h-10 = 40px`): `PrismButton` (`button.tsx:33`) uses `px-4` and `size-5` (`20px`) icons; `PrismToggle` (`toggle.tsx:22`) uses `px-2` and `size-4` (`16px`) icons.
   - At `lg` (`h-14 = 56px`): `PrismButton` (`button.tsx:34`) uses `size-5` (`20px`) icons; `PrismToggle` (`toggle.tsx:23`) uses `size-6` (`24px`) icons.
4. **`PrismAvatar` vs `UAvatar` Size Divergence**:
   - `PrismAvatar` `lg` (`prism/avatar.tsx:13`) is `size-10` (`40px`), while `UAvatar` `lg` (`uzzina/UAvatar.tsx:86`) is `size-12` (`48px`).
5. **Same-Row Control Height Collisions (10 Toolbars)**:
   - `planejamento.tsx:320-338`: `h-10` (`size="sm"`) button next to `h-12` (`default`) button.
   - `HomeTodayView.tsx:62-68` & `TodayPageView.tsx:63-69`: `48px` `CalendarToolbar` (containing an `h-8` `32px` "Hoje" button at `CalendarToolbar.tsx:81`) next to `40px` `TodayViewToggle`.
   - `ViewOptions.tsx:117,381`: `32px` (`size="xs"`) `ViewMenuTrigger` buttons next to `40px` (`size="sm"`) `ComboboxTrigger variant="filter"` and `40px` `PrismToggleGroup`/`PrismButton` in `HomeCalendarView.tsx:68-90`, `HomeSprintView.tsx:86-97`, and `partner/$slug.tsx:278-295`.
   - `partner/$slug.tsx:191-274`: mixes `32px` (`CalendarButtons`), `40px` (`Planejamento` button, search `InputGroup`), and `20px` (raw `SettingsIcon` link).
   - `ClientCalendar.tsx:87-125`: `48px` (`size="icon"`) Prev/Next buttons next to `40px` (`size="sm"`) Week/Month `PrismToggleGroup`.
   - `InstagramContent.tsx:161-175`: `40px` (`size="sm"`) "Adicionar" button next to `32px` (`size="xs"`) "Gerenciar" button.
   - `CommentInput.tsx:83-108`: `28px` (`h-7`) Audience button next to `32px` (`h-8`) Mention/Cancel/Send buttons.
   - `PartnerCelebrationsSelector.tsx:108-117`: `40px` (`size="sm"`) `InputGroup` wrapping a `28px` (`h-7`) `InputGroupInput`.

### 4.2 Page Gutters, Form Gaps & Dialog Paddings
- **Mobile Page Gutter Chaos**:
  - `px-3` (`12px`): `/app/today`, `/app/profile`, `HomeTodayView`
  - `px-4` (`16px`): `Header`, `/app/notifications`, `/app/leads`
  - `mx-2 border-x` (`8px` + `16px`): `/app/planejamento` (`planejamento.tsx:307`)
  - `px-6` (`24px`): `HomeViewWrapper` (default sections), `/app/help`, `/dash/review/$slug`
  - `p-8` (`32px` fixed on mobile!): all 7 `/app/admin/*` routes (`partners.tsx:51`, `users.tsx:36`, `clients.tsx:25`, `partner/$slug.tsx:350`, `user/$userId.tsx:192`, `client/$userId.tsx:159`, `celebrations.tsx:97,215`), causing severe horizontal squeezing on phones (`users.tsx` and `partners.tsx` also use `grid-cols-2` on mobile!).
- **Hardcoded Header Offsets**:
  - `.page-height` (`app/tailwind.css:407`) uses `h-[calc(100vh-68px)]` while `Header.tsx:383` is `h-16` (`64px`); `celebrations.tsx:95` uses `md:h-[calc(100vh-68px)]`; `ui.tsx:135,137` uses `65px` and `78px`.
- **Label-to-Input Gap Drift**:
  - `6px` (`mb-1.5` / `gap-1.5`): Auth forms, `CelebrationDialog`, `PlanningSuggestionEditor`, `BatchAssignmentDialogs`, `CustomThemePanel`, `PrismColorField`
  - `8px` (`gap-2`): `/app/profile`, `/app/admin/client/$userId`, `/app/planejamento` (`Field` helper)
  - `10px` (`gap-2.5`): `/app/planejamento` (`L352,428,456`)
  - `16px` (`gap-4` / `space-y-4`): `/app/admin/partner/$slug`, `AdminUserForm`
- **Dialog Padding Fragmentation**:
  - `PrismDialog` (`dialog.tsx:169,189`) uses `px-5 py-4`, `CelebrationDialog` and `BatchAssignmentDialogs` use `p-5`, `BulkConfirmDialogs` uses `p-6`, `ConflictComparison` uses `px-6 py-4`, and `ContentReorderDialog.tsx:255,263,307` uses `p-10` (`40px`!).

---

## Pillar 5: Prism Primitives & Rogue UI Audit

### 5.1 Bugs & Dead Code Inside `app/components/prism/`
1. **`color-area.tsx:38`**: Typo `data-ddragging:scale-125` (double `d` — never activates).
2. **`calendar.tsx:175`**: Stray partial class `tra`; `calendar.tsx:81,111`: dead selector `in-data-[slot=card-content]:bg-transparent`.
3. **`sheet.tsx:83`**: Invalid class `gap-inherit` (should be `gap-[inherit]` as in `dialog.tsx:120`).
4. **`dropdown-menu.tsx:90-124,163`**: `DropdownMenuItem` accepts `variant="destructive"` and sets `data-variant`, but `dropdownMenuItemVariants` defines zero styles for `destructive`.
5. **`toggle-group.tsx:79`**: Radix leftover `data-[state=on]:bg-muted` (React Aria uses `data-selected`).
6. **`combobox.tsx:172`**: Radix/cmdk leftover `data-highlighted:bg-secondary/50` (React Aria uses `data-focused` / `data-hovered`).
7. **`command.tsx:185,192,216-253`**: Uses `**:[[cmdk-group-heading]]:` and `data-[checked=true]:` leftovers.
8. **`dialog.tsx:24,31`**: `DialogClose` defaults `size = "default"` then evaluates `size || "sm"` (unreachable `"sm"`).
9. **`select.tsx:84` & `date-range-picker.tsx:109`**: Missing hover state on triggers.
10. **`prism/index.ts`**: Missing exports for `LinkButton`, `PrismInputGroupTextarea`, `badgeVariants`, `buttonGroupVariants`, `colorFieldVariants`, `inputVariants`, `timeFieldVariants`. 29 of 31 files import `cn` from `"cnfast"` instead of `"~/lib/utils"`.

### 5.2 Rogue Elements & Accessibility Defects Outside `app/components/prism/`
1. **Hand-Built Modal (`PlanningSuggestionEditor.tsx:66-156`)**: Raw `<div role="dialog">` without `PrismDialog` focus trap, Escape handling, or `useVisibleViewport`.
2. **Nested Interactive Controls**:
   - `PartnerCelebrationsSelector.tsx:232-270`: `<div role="checkbox" tabIndex={0}>` wrapping native `<input type="checkbox">` (plus invalid Tailwind class `py-0.2` at `:171,265`).
   - `BulkDateTimeDialog.tsx:93,135`: Native `<label>` wrapping `<PrismCheckbox>` (produces nested `<label><label>`).
   - `ActionItem.tsx:231`: `<div role="button" tabIndex={0}>` wrapping title-edit `<button>` and drag handle `<button>`.
3. **Keyboard-Inaccessible Click Handler (`PlanningCalendarView.tsx:168-173`)**: `<span onClick={...}>` with no role or `tabIndex`.
4. **Focus-Invisible Controls**:
   - `Header.tsx:574` (user avatar menu) and `partner/$slug.tsx:197` (late count trigger) use `PrismButton variant="unstyled"` (`focus-visible:ring-0`).
   - `UToggle.tsx:42` puts `focus:opacity-100` on `<label>` while `<input>` is `sr-only` (and uses invalid Tailwind v4 `hover:bg-opacity-100` at `:45`).
   - `Header.tsx:468` & `notifications.tsx:148` notification items lack `focus-visible` styling.
5. **Inverted Password Eye Icon (`AdminUserForm.tsx:170-181`, `dash/login.tsx` vs `login.tsx`, `admin/client/$userId.tsx`)**: Raw absolute `<button>` in `AdminUserForm.tsx` instead of `PrismInputGroupButton`.

---

## The Strict UZZINA Design System Specification (Target Standard)

Once approved by the owner, the following **non-negotiable laws** govern every file in the repository:

### Law 1 — Typography Scale (Zero Arbitrary Sizes, Zero `leading-none` Clipping)
- **Global `@layer components` (`app/tailwind.css:370-394`)**:
  - Replace `leading-none` with `leading-tight` (`1.25`) on `h1`–`h3` and `leading-snug` (`1.375`) on `h4`–`h5`.
  - Replace `tracking-tighter` (`-0.05em`) with `tracking-tight` (`-0.025em`) on `h1`–`h3` and `tracking-normal` on `h4`–`h5`.
  - Register `--font-heading: var(--font-sans)` inside `@theme inline`.
- **Strict Role Mapping**:
  - **Display Title** (`Home` sections, `Notifications`, `Help`, `ActionTitleInput` normal): `text-3xl lg:text-5xl font-semibold leading-tight tracking-tight` (`30px` → `48px`).
  - **Page Title (`h1`)** (`Today`, `Planejamento`, `Profile`, `Leads`, all `Admin` pages, `Dash` pages): `text-2xl lg:text-3xl font-semibold leading-tight tracking-tight` (`24px` → `30px`).
  - **Section / Dialog Title (`h2`, `PrismDialogTitle`)**: `text-lg lg:text-xl font-semibold leading-snug tracking-tight` (`18px` → `20px`).
  - **Subsection / Popover / Alert Title (`h3`–`h5`, `PrismPopoverTitle`, `PrismAlertTitle`, Kanban column header)**: `text-sm` or `text-base font-semibold leading-snug tracking-normal` (`14px`–`16px`).
  - **Overline / Eyebrow**: `text-xs font-semibold leading-normal tracking-wider uppercase text-muted-foreground` (`12px`, `+0.05em`).
  - **Form Label (`PrismLabel`)**: `text-sm font-medium leading-snug text-foreground` (`14px`).
  - **Form Text Input / Textarea**: `text-base md:text-sm font-normal leading-normal` (`16px` mobile / `14px` desktop — zero iOS auto-zoom).
  - **UI Control / Menu / Command Item**: `text-sm font-medium` (buttons/tabs) or `text-sm font-normal` (list/command items).
  - **Caption / Helper / Timestamp / Action Card Title**: `text-xs leading-snug` (`12px` — never `leading-none` with `overflow-hidden`).
  - **Micro-Badge Floor**: `text-[10px] font-semibold leading-none tracking-wide uppercase` reserved strictly for compact count pills / media overlays. Ban `text-[8px]`, `text-[9px]`, `text-[11px]`, `text-[0.8rem]`.

### Law 2 — OKLCH Surface Polarity & WCAG AA Palette Contract
- **Monotonic Surface Lightness (`app/tailwind.css`, zero per-palette `*LDelta` overrides in `palettes.ts`)**:
  - **Light Mode** (`--background`: `L ≈ 0.985`, `--foreground`: `L = 0.145`):
    - `--card` / `--popover` / `--action`: `+0.015` (`L = 1.000`, crisp elevated white; `--action-hover`: `-0.025` → `L = 0.960` so hover darkens perceptibly instead of clamping at `1.0`).
    - `--muted`: `-0.035` (`L = 0.950`, distinct from `--card`!).
    - `--secondary`: `-0.055` (`L = 0.930`).
    - `--input`: `-0.065` (`L = 0.920`, with `bg-input` or `bg-input/80` + subtle `border-border/60` so fields have clear boundaries).
    - `--border`: `-0.12` (`L = 0.865`, `~1.4:1` crisp hairline).
  - **Dark Mode** (`--background`: `L ≈ 0.145`, `--foreground`: `L = 0.965`):
    - `--muted`: `+0.035` (`L = 0.180`)
    - `--card`: `+0.050` (`L = 0.195`)
    - `--action` / `--action-hover`: `+0.055` (`0.200`) / `+0.095` (`0.240`)
    - `--popover`: **`+0.075` (`L = 0.220`)** — fixes the `-0.03` inverted dark popover bug!
    - `--secondary`: `+0.085` (`L = 0.230`)
    - `--input`: `+0.095` (`L = 0.240`)
    - `--border`: `+0.14` (`L = 0.285`)
- **Palette & Status Contrast**:
  - Calibrate the 9 failing palette modes in `app/lib/palettes.ts` (`cyan.light`, `green.light`, `light-blue.light`, `orange.light`, `red.light`, `orange.dark`, `red.dark`, `purple.dark`, `navy.dark`) and `deriveAccentFg` (`app/utils/color.ts:154`) so every `primary` / `primary-foreground` pair achieves **≥ 4.5:1**.
  - Clamp `--ring` lightness in light mode (`min(l, 0.58)`) so high-luminance palettes (`energy`, `yellow`, `magenta`, `cyan`, `green`) always have a visible focus ring (`≥ 3.5:1`).
  - Unify `--destructive` with `--color-error`, add `--color-*-foreground` tokens, calibrate `--color-warning` (`h = 75` warm amber) and `--color-success` (`h = 150` emerald), fix `--late-foreground` (`≥ 4.5:1`) and `--late-l-delta` (`-0.03` in light mode), and replace all hardcoded `amber-*`, `emerald-*`, `rose-*`, `zinc-*`, `gray-*` classes with semantic tokens.

### Law 3 — 4-Tier Elevation, Border, Shadow & Concentric Radius System
- **Level 0 (Page Canvas & Form Sections)**: `bg-background`, structural hairlines (`border-b`, `border-t`, `border-l`), `shadow-none`, **zero** card boxes (`rounded border bg-card`) around form/preference sections (`UPreferenceSwitch`, `CustomThemePanel`, `profile.tsx` AI usage, `planejamento.tsx`).
- **Level 1A (Form Controls & Buttons)**: `rounded-2xl squircle` (`rounded-xl squircle` for `xs` / `icon-xs` `h-8` so `32px` controls do not turn into pills on Safari/Firefox), `shadow-none`.
- **Level 1B (Interactive Entity Cards — `ActionItem`, `UAdminItemCard`, `LeadCard`)**: `bg-action` / `bg-card`, single boundary (`ring-1 ring-foreground/5 dark:ring-foreground/10`), resting `shadow-xs`, hover `hover:shadow-md` (staying below Level 2's `shadow-lg`).
- **Level 2 (Floating Popovers, Menus, Select, Combobox & AppBar)**: `bg-popover`, `rounded-3xl squircle` (`p-2`), single boundary (`ring-1 ring-foreground/8 dark:ring-foreground/12`, removing duplicate `border` from `PartnersCombobox`/`ResponsiblesCombobox`/`SprintCombobox`), `shadow-lg` (including `AppBar`!), inner list items `rounded-xl squircle` (`DropdownMenuItem`, `SelectItem`, `ComboboxItem`, `CommandItem`).
- **Level 3 (Modals & Command Palette)**: `bg-popover`, `rounded-3xl squircle`, `ring-1 ring-foreground/10`, `shadow-xl`, backdrop `bg-black/30 supports-backdrop-filter:backdrop-blur-sm`.
- **Focus Ring Contract**: Standard controls use `outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30` (plus a visible ring on `Header` avatar and late-count buttons); frameless toolbar/combobox triggers keep their documented `AGENTS.md` focus rules.

### Law 4 — 4px/8px Control Geometry Tiers & Layout Rhythm
- **T1 (`lg` = `56px` / `h-14`)**: `px-6`, `gap-2`, icon `size-6` (`24px`), `text-base`.
- **T2 (`default` = `48px` / `h-12`)**: **`px-4` (`16px`) uniform across `PrismInput`, `PrismSelectTrigger`, `PrismDateRangePicker`, `PrismColorField`, and `PrismButton`**, `gap-2`, icon `size-5` (`20px`), `text-sm` (`text-base md:text-sm` on text inputs). Used for primary form fields, `AppBar`, and `ActionFormFooter`.
- **T3 (`sm` = `40px` / `h-10`)**: `px-3.5` (`14px`), `gap-1.5`, icon `size-4` (`16px`), `text-sm`. Used for page header actions, view/filter toolbars (`ViewOptionsComponent`, `Today` toolbar, `Partner` toolbar, `ClientCalendar` toolbar), and dialog footer buttons.
- **T4 (`xs` = `32px` / `h-8`)**: `px-2.5` (`10px`), `gap-1`, icon `size-4` (`16px`), `text-xs`, `rounded-xl squircle`. Used for dense editor toolbars (`RichTextEditor`, `CommentInput`) and inline row actions.
- **No Mixed-Tier Toolbars**: Controls in the same horizontal toolbar row must share the same height tier.
- **Responsive Page Gutters & Form Rhythm**:
  - Standard page gutter: `px-4 lg:px-8` (fixing the unresponsive `p-8` and mobile `grid-cols-2` on all `/app/admin/*` routes, while preserving the explicitly accepted `Today` and `Profile` layouts).
  - Standard form field stack: label-to-input `gap-2` (`8px`), field-to-field `gap-4` (`16px`) or `gap-6` (`24px`), section-to-section `gap-8` (`32px`).
  - Standard `PrismDialog` layout: `PrismDialogHeader` (`px-6 pt-6 pb-4`), body (`px-6 py-4`), `PrismDialogFooter` (`px-6 py-4 border-t bg-muted/30` without the broken `-mx-4 -mb-4` offset).

### Law 5 — Zero Rogue Primitives
- Fix all internal Prism bugs (`color-area.tsx` `data-dragging`, `calendar.tsx`, `sheet.tsx`, `dropdown-menu.tsx` `destructive`, `toggle-group.tsx`, `combobox.tsx` `size` prop & `data-focused`, `command.tsx`, `dialog.tsx`, `prism/index.ts` exports, `~/lib/utils` `cn` imports).
- Replace all rogue controls (`PlanningSuggestionEditor` → `PrismDialog`; `PartnerCelebrationsSelector` nested checkbox & pills → `PrismCheckbox` & `PrismToggleGroup`; `planejamento.tsx` & `PlanningSuggestionsList.tsx` segmented/filter buttons → `PrismToggleGroup`; raw `<label>` → `PrismLabel`; `AdminUserForm` eye button → `PrismInputGroupButton`; `UToggle` → `PrismToggle`; `<span onClick>` in `PlanningCalendarView` → button; `LeadDetail` & holiday badges → `PrismBadge`).

---

## Proposed Execution Sequence (Modular, Verifiable Batches)

| Batch | Scope | Files Touched | Risk |
| :--- | :--- | :--- | :--- |
| **Phase 1 — Token & CSS Foundation** | Fix OKLCH surface deltas (light & dark), status hues (`warning` amber, `success` emerald, `error`/`destructive` unified, `late` contrast), palette contrast (`palettes.ts` + `deriveAccentFg`), preload script (`index.html`), and global `h1`–`h5` line-height/tracking (`app/tailwind.css`). | `app/tailwind.css`, `app/lib/palettes.ts`, `app/utils/color.ts`, `index.html` | Low (pure CSS/token math; immediately fixes dark popovers, input visibility, and palette contrast) |
| **Phase 2 — Prism Primitives Hardening** | Unify radii & `.squircle` (Level 1 `rounded-2xl`, `xs` `rounded-xl`, Level 2/3 `rounded-3xl`, items `rounded-xl`), align `h-12` horizontal padding (`px-4` across Input/Select/DateRange), fix `PrismDialogFooter` padding bug, fix `Combobox` `size` bug, clean up dead Radix/cmdk selectors & typos (`color-area`, `calendar`, `sheet`, `dropdown-menu`, `toggle-group`), and export missing symbols in `prism/index.ts`. | `app/components/prism/*` | Low–Medium (centralized in `prism/`; benefits all consumers at once) |
| **Phase 3 — Unbox Form Surfaces & Replace Hardcoded Colors** | Remove card boxes from `UPreferenceSwitch`, `CustomThemePanel`, `profile.tsx` (AI usage), `planejamento.tsx`, `PlanningSuggestionsList`, `PlanningCalendarView`, `conflict-comparison`; replace all raw `amber-*`, `emerald-*`, `rose-*`, `zinc-*`, `gray-*`, `text-white`, `border-black/5` with semantic tokens and `PrismBadge` variants. | `UPreferenceSwitch.tsx`, `CustomThemePanel.tsx`, `profile.tsx`, `planejamento.tsx`, `Planning*`, `celebrations.tsx`, `PartnerCelebrationsSelector.tsx`, `CalendarDayCell.tsx`, `ActionFormFooter.tsx`, `LeadDetail.tsx` | Low |
| **Phase 4 — Eliminate Rogue UI & Fix Combobox Double Borders** | Convert `PlanningSuggestionEditor` to `PrismDialog`; replace raw buttons/pills/checkboxes/labels/selects in `Planning*`, `PartnerCelebrationsSelector`, `Admin*`, `CommentInput`, `Header`, `BulkDateTimeDialog`, `UToggle`; remove `border shadow-xl` overrides from `PartnersCombobox`, `ResponsiblesCombobox`, `SprintCombobox`; add `shadow-lg` to `AppBar` and visible focus rings to `Header` avatar / late-count buttons. | `Planning*`, `PartnerCelebrationsSelector.tsx`, `AdminUserForm.tsx`, `admin/partner/$slug.tsx`, `PartnersCombobox.tsx`, `ResponsiblesCombobox.tsx`, `SprintCombobox.tsx`, `AppBar.tsx`, `Header.tsx`, `CommentInput.tsx`, `BulkDateTimeDialog.tsx` | Medium |
| **Phase 5 — Typography, Toolbar Tiers & Responsive Admin Grids** | Apply the strict heading scale across routes, fix iOS `<16px` input overrides (`CommentInput`, `PartnerCelebrationsSelector`), eliminate `<10px` arbitrary sizes, align mixed-height toolbars (`planejamento`, `ViewOptions`, `Today`, `Partner`, `ClientCalendar`, `InstagramContent`), and make `/app/admin/*` grids & paddings responsive (`px-4 py-4 lg:p-8`, `grid-cols-1 sm:grid-cols-2`). | `app/routes/app/admin/*`, `ViewOptions.tsx`, `TodayViewParts.tsx`, `CalendarToolbar.tsx`, `ClientCalendar.tsx`, `InstagramContent.tsx`, `ActionItem.tsx`, `ActionTitleInput.tsx` | Medium |

