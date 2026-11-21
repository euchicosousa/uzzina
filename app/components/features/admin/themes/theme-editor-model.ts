import { CATEGORIES, PHASES } from "~/lib/CONSTANTS";
import {
  PALLETE,
  SHARED_COLORS,
  type CategorySlug,
  type ModePair,
  type PaletteConfig,
  type PhaseSlug,
  type SharedColors,
} from "~/lib/palettes";
import palettesSource from "~/lib/palettes.ts?raw";
import {
  formatOklchString,
  oklchToHex,
  parseOklchString,
  type OklchColor,
} from "~/utils/color";

export type ThemePreviewMode = "light" | "dark" | "split";

export type PriorityKey = "low" | "medium" | "high";

export type DeltaKey =
  | "fgLDelta"
  | "cardLDelta"
  | "popoverLDelta"
  | "inputLDelta"
  | "secondaryLDelta"
  | "secondaryHoverLDelta"
  | "borderLDelta"
  | "actionLDelta"
  | "actionHoverLDelta";

export type PaletteColorKey = "bg" | "primary" | "primaryFg" | "accent";

export const PHASE_ORDER: readonly PhaseSlug[] = [
  "idea",
  "do",
  "doing",
  "review",
  "done",
  "finished",
] as const;

export type { CategorySlug, PhaseSlug } from "~/lib/palettes";

export const CATEGORY_ORDER: readonly CategorySlug[] = [
  "ads",
  "capture",
  "carousel",
  "design",
  "dev",
  "finance",
  "meeting",
  "post",
  "print",
  "reels",
  "sm",
  "stories",
  "todo",
] as const;

export type PhasesColorMap = Record<PhaseSlug, OklchColor>;
export type CategoriesColorMap = Record<CategorySlug, OklchColor>;
export type PrioritiesColorMap = Record<
  "light" | "dark",
  Record<PriorityKey, OklchColor>
>;

export interface ThemeChangeEntry {
  token: string;
  label: string;
  mode: "Claro" | "Escuro" | "Ambos";
  oldValue: string;
  newValue: string;
  file: string;
  keyPath: string;
}

const STORAGE_KEY = "uzzina:admin-theme-editor-draft:v3";

export interface StoredThemeDraft {
  paletteId: string;
  /** Snapshot of the palette in palettes.ts when the draft was saved. */
  base: string;
  /** Snapshot of SHARED_COLORS in palettes.ts when the draft was saved. */
  sharedBase: string;
  palette: PaletteConfig;
  shared: SharedColors;
}

/** Fingerprint of a palette as written in palettes.ts, used to detect a stale draft. */
export function fingerprintPalette(palette: PaletteConfig): string {
  return JSON.stringify(palette);
}

export function clonePaletteConfig(palette: PaletteConfig): PaletteConfig {
  return {
    ...palette,
    light: {
      ...palette.light,
      primary: { ...palette.light.primary },
      bg: { ...palette.light.bg },
      accent: { ...palette.light.accent },
    },
    dark: {
      ...palette.dark,
      primary: { ...palette.dark.primary },
      bg: { ...palette.dark.bg },
      accent: { ...palette.dark.accent },
    },
  };
}

/** Fingerprint of the shared block as written in palettes.ts. */
export function fingerprintShared(): string {
  return JSON.stringify(SHARED_COLORS);
}

/** Deep copy of the shared block (states, phases, categories). */
export function cloneSharedColors(shared: SharedColors): SharedColors {
  return structuredClone(shared);
}

export function getOriginalShared(): SharedColors {
  return cloneSharedColors(SHARED_COLORS);
}

export function getOriginalPhasesMap(): PhasesColorMap {
  return { ...SHARED_COLORS.phases };
}

/**
 * Priorities are read-only (DS36): Baixa = Sucesso, Média = Atenção,
 * Alta = Erro, the same as the --priority-* variables in tailwind.css.
 */
/** Numeric formulas of the shared block, editable per mode (DS36, stage 3). */
export type FormulaKey =
  | "supportL"
  | "supportC"
  | "primaryHoverMix"
  | "ringHaloAlpha"
  | "lateBgAlpha"
  | "actionRingAlpha"
  | "actionShadowAlpha"
  | "actionHoverShadowAlpha"
  | "topHighlightAlpha"
  | "categoryIconFill"
  | "categoryIconStroke"
  | "categoryIconChroma"
  | "shadowMix"
  | "shadowL"
  | "shadowAlpha";

export type StateKey = "error" | "warning" | "success" | "info";
export type StatePart = "color" | "text";

export function getStateColor(
  shared: SharedColors,
  key: StateKey,
  part: StatePart,
  mode: "light" | "dark",
): OklchColor {
  return shared.states[key][part][mode];
}

/** Shared block with one state color changed (fill or text, per mode). */
export function setStateColor(
  shared: SharedColors,
  key: StateKey,
  part: StatePart,
  mode: "light" | "dark",
  color: OklchColor,
): SharedColors {
  const state = shared.states[key];
  return {
    ...shared,
    states: {
      ...shared.states,
      [key]: { ...state, [part]: { ...state[part], [mode]: color } },
    },
  };
}

/** Numeric values of the states and the marker (DS36, stage 6). */
export type SharedNumberKey =
  | "backgroundMix"
  | "markerLDelta"
  | "markerC"
  | "strongL"
  | "strongC"
  | "strongHoverL"
  | "strongHoverC";

export function getSharedNumber(
  shared: SharedColors,
  key: SharedNumberKey,
  mode: "light" | "dark",
): number {
  switch (key) {
    case "backgroundMix":
      return shared.states.backgroundMix[mode];
    case "markerLDelta":
      return shared.markerText.lDelta[mode];
    case "markerC":
      return shared.markerText.c;
    case "strongL":
      return shared.states.successStrong.l;
    case "strongC":
      return shared.states.successStrong.c;
    case "strongHoverL":
      return shared.states.successStrong.hoverL;
    case "strongHoverC":
      return shared.states.successStrong.hoverC;
  }
}

/** Shared block with one numeric value changed (single values ignore `mode`). */
export function setSharedNumber(
  shared: SharedColors,
  key: SharedNumberKey,
  mode: "light" | "dark",
  value: number,
): SharedColors {
  const strong = shared.states.successStrong;
  switch (key) {
    case "backgroundMix":
      return {
        ...shared,
        states: {
          ...shared.states,
          backgroundMix: { ...shared.states.backgroundMix, [mode]: value },
        },
      };
    case "markerLDelta":
      return {
        ...shared,
        markerText: {
          ...shared.markerText,
          lDelta: { ...shared.markerText.lDelta, [mode]: value },
        },
      };
    case "markerC":
      return { ...shared, markerText: { ...shared.markerText, c: value } };
    case "strongL":
      return {
        ...shared,
        states: { ...shared.states, successStrong: { ...strong, l: value } },
      };
    case "strongC":
      return {
        ...shared,
        states: { ...shared.states, successStrong: { ...strong, c: value } },
      };
    case "strongHoverL":
      return {
        ...shared,
        states: {
          ...shared.states,
          successStrong: { ...strong, hoverL: value },
        },
      };
    case "strongHoverC":
      return {
        ...shared,
        states: {
          ...shared.states,
          successStrong: { ...strong, hoverC: value },
        },
      };
  }
}

/** One value of the phase derivations (DS36, stage 5). */
export type PhaseFormulaKey = keyof SharedColors["formulas"]["phase"];

/** Pairs read a value per mode; single values are the same for both modes. */
export function getPhaseFormula(
  shared: SharedColors,
  key: PhaseFormulaKey,
  mode: "light" | "dark",
): number {
  const value = shared.formulas.phase[key];
  return typeof value === "number" ? value : value[mode];
}

export function setPhaseFormula(
  shared: SharedColors,
  key: PhaseFormulaKey,
  mode: "light" | "dark",
  value: number,
): SharedColors {
  const phase = shared.formulas.phase;
  const current = phase[key];
  const next =
    typeof current === "number" ? value : { ...current, [mode]: value };
  return {
    ...shared,
    formulas: {
      ...shared.formulas,
      phase: { ...phase, [key]: next },
    },
  };
}

/** Late card shadow values (light: alpha pair; dark: L, C and alpha pair). */
export type LateKey = "alpha" | "alphaHover" | "l" | "c";

export function getLateValue(
  shared: SharedColors,
  key: LateKey,
  mode: "light" | "dark",
): number {
  const late = shared.lateShadow;
  if (mode === "light") {
    return key === "alphaHover" ? late.light.alphaHover : late.light.alpha;
  }
  switch (key) {
    case "l":
      return late.dark.l;
    case "c":
      return late.dark.c;
    case "alpha":
      return late.dark.alpha;
    case "alphaHover":
      return late.dark.alphaHover;
  }
}

/** Shared block with one late card value changed (light has no L or C). */
export function setLateValue(
  shared: SharedColors,
  key: LateKey,
  mode: "light" | "dark",
  value: number,
): SharedColors {
  const late = shared.lateShadow;
  if (mode === "light") {
    if (key !== "alpha" && key !== "alphaHover") return shared;
    return {
      ...shared,
      lateShadow: { ...late, light: { ...late.light, [key]: value } },
    };
  }
  return {
    ...shared,
    lateShadow: { ...late, dark: { ...late.dark, [key]: value } },
  };
}

export function getFormulaValue(
  shared: SharedColors,
  key: FormulaKey,
  mode: "light" | "dark",
): number {
  const f = shared.formulas;
  switch (key) {
    case "shadowMix":
      return shared.shadow.mix[mode];
    case "shadowL":
      return shared.shadow.l[mode];
    case "shadowAlpha":
      return shared.shadow.alpha[mode];
    case "supportL":
      return f.support.lDelta[mode];
    case "supportC":
      return f.support.cDelta[mode];
    case "primaryHoverMix":
      return f.primaryHoverMix[mode];
    case "ringHaloAlpha":
      return f.ringHaloAlpha[mode];
    case "lateBgAlpha":
      return f.lateBgAlpha[mode];
    case "actionRingAlpha":
      return f.actionCard.ringAlpha[mode];
    case "actionShadowAlpha":
      return f.actionCard.shadowAlpha[mode];
    case "actionHoverShadowAlpha":
      return f.actionCard.hoverShadowAlpha[mode];
    case "topHighlightAlpha":
      return f.topHighlightAlpha[mode];
    case "categoryIconFill":
      return f.categoryIcon.fillAlpha[mode];
    case "categoryIconStroke":
      return f.categoryIcon.strokeAlpha[mode];
    case "categoryIconChroma":
      return f.categoryIcon.chroma[mode];
  }
}

/** Returns a copy of the shared block with one formula value changed. */
export function setFormulaValue(
  shared: SharedColors,
  key: FormulaKey,
  mode: "light" | "dark",
  value: number,
): SharedColors {
  const f = shared.formulas;
  const pair = (current: ModePair<number>): ModePair<number> => ({
    ...current,
    [mode]: value,
  });
  switch (key) {
    case "shadowMix":
      return {
        ...shared,
        shadow: { ...shared.shadow, mix: pair(shared.shadow.mix) },
      };
    case "shadowL":
      return {
        ...shared,
        shadow: { ...shared.shadow, l: pair(shared.shadow.l) },
      };
    case "shadowAlpha":
      return {
        ...shared,
        shadow: { ...shared.shadow, alpha: pair(shared.shadow.alpha) },
      };
    case "supportL":
      return {
        ...shared,
        formulas: {
          ...f,
          support: { ...f.support, lDelta: pair(f.support.lDelta) },
        },
      };
    case "supportC":
      return {
        ...shared,
        formulas: {
          ...f,
          support: { ...f.support, cDelta: pair(f.support.cDelta) },
        },
      };
    case "primaryHoverMix":
      return {
        ...shared,
        formulas: { ...f, primaryHoverMix: pair(f.primaryHoverMix) },
      };
    case "ringHaloAlpha":
      return {
        ...shared,
        formulas: { ...f, ringHaloAlpha: pair(f.ringHaloAlpha) },
      };
    case "lateBgAlpha":
      return {
        ...shared,
        formulas: { ...f, lateBgAlpha: pair(f.lateBgAlpha) },
      };
    case "actionRingAlpha":
      return {
        ...shared,
        formulas: {
          ...f,
          actionCard: {
            ...f.actionCard,
            ringAlpha: pair(f.actionCard.ringAlpha),
          },
        },
      };
    case "actionShadowAlpha":
      return {
        ...shared,
        formulas: {
          ...f,
          actionCard: {
            ...f.actionCard,
            shadowAlpha: pair(f.actionCard.shadowAlpha),
          },
        },
      };
    case "actionHoverShadowAlpha":
      return {
        ...shared,
        formulas: {
          ...f,
          actionCard: {
            ...f.actionCard,
            hoverShadowAlpha: pair(f.actionCard.hoverShadowAlpha),
          },
        },
      };
    case "topHighlightAlpha":
      return {
        ...shared,
        formulas: { ...f, topHighlightAlpha: pair(f.topHighlightAlpha) },
      };
    case "categoryIconFill":
      return {
        ...shared,
        formulas: {
          ...f,
          categoryIcon: {
            ...f.categoryIcon,
            fillAlpha: pair(f.categoryIcon.fillAlpha),
          },
        },
      };
    case "categoryIconStroke":
      return {
        ...shared,
        formulas: {
          ...f,
          categoryIcon: {
            ...f.categoryIcon,
            strokeAlpha: pair(f.categoryIcon.strokeAlpha),
          },
        },
      };
    case "categoryIconChroma":
      return {
        ...shared,
        formulas: {
          ...f,
          categoryIcon: {
            ...f.categoryIcon,
            chroma: pair(f.categoryIcon.chroma),
          },
        },
      };
  }
}

export function derivePriorities(shared: SharedColors): PrioritiesColorMap {
  const pick = (mode: "light" | "dark") => ({
    low: shared.states.success.color[mode],
    medium: shared.states.warning.color[mode],
    high: shared.states.error.color[mode],
  });
  return { light: pick("light"), dark: pick("dark") };
}

export function getPaletteById(paletteId: string): PaletteConfig {
  return PALLETE.find((p) => p.id === paletteId) ?? PALLETE[0];
}

/** Text on the primary: the primary moved by the palette deltas (DS36, stage 7). */
export function getEffectivePrimaryFg(
  palette: PaletteConfig,
  mode: "light" | "dark",
): OklchColor {
  const { primary, primaryFgDelta } = palette[mode];
  return {
    l: Math.max(0, Math.min(1, primary.l + primaryFgDelta.l)),
    c: Math.max(0, primary.c + primaryFgDelta.c),
    h: primary.h + primaryFgDelta.h,
  };
}

export function getEffectiveDelta(
  palette: PaletteConfig,
  mode: "light" | "dark",
  key: DeltaKey,
): number {
  return palette[mode][key];
}

/** Text color of a palette: page background plus its L delta, chroma 0. */
export function getPaletteFg(
  palette: PaletteConfig,
  mode: "light" | "dark",
): OklchColor {
  const bg = palette[mode].bg;
  const delta = getEffectiveDelta(palette, mode, "fgLDelta");
  return { l: Math.max(0, Math.min(1, bg.l + delta)), c: 0, h: bg.h };
}

function oklchEquals(a: OklchColor, b: OklchColor): boolean {
  return (
    Math.abs(a.l - b.l) < 0.0005 &&
    Math.abs(a.c - b.c) < 0.0005 &&
    Math.abs(a.h - b.h) < 0.05
  );
}

const PALETTE_COLOR_META: Record<
  PaletteColorKey,
  { label: string; token: string }
> = {
  bg: { label: "Fundo", token: "--background" },
  primary: { label: "Principal", token: "--primary" },
  primaryFg: {
    label: "Texto sobre a principal",
    token: "--primary-foreground",
  },
  accent: { label: "Destaque e anel de foco", token: "--accent" },
};

const DELTA_META: Record<DeltaKey, { label: string; token: string }> = {
  fgLDelta: { label: "Texto (ajuste de luz)", token: "--foreground-l-delta" },
  cardLDelta: { label: "Card (ajuste de luz)", token: "--card-l-delta" },
  popoverLDelta: {
    label: "Menus e diálogos (ajuste de luz)",
    token: "--popover-l-delta",
  },
  inputLDelta: { label: "Campos (ajuste de luz)", token: "--input-l-delta" },
  secondaryLDelta: {
    label: "Cinza (ajuste de luz)",
    token: "--secondary-l-delta",
  },
  secondaryHoverLDelta: {
    label: "Cinza · hover (ajuste de luz)",
    token: "--secondary-hover-l-delta",
  },
  borderLDelta: { label: "Bordas (ajuste de luz)", token: "--border-l-delta" },
  actionLDelta: {
    label: "Ação (ajuste de luz)",
    token: "--action-l-delta",
  },
  actionHoverLDelta: {
    label: "Ação · hover (ajuste de luz)",
    token: "--action-hover-l-delta",
  },
};

const PRIORITY_LABELS: Record<PriorityKey, string> = {
  low: "Prioridade Baixa",
  medium: "Prioridade Média",
  high: "Prioridade Alta",
};

type SharedDiffTarget = {
  token: string;
  label: string;
  keyPath: string;
  old: OklchColor;
  next: OklchColor;
};

/** Shared colors (states, phases, categories) that differ from palettes.ts. */
function collectSharedDiffs(draftShared: SharedColors): ThemeChangeEntry[] {
  const original = SHARED_COLORS;
  const changes: ThemeChangeEntry[] = [];
  const pushColor = (t: SharedDiffTarget, mode: ThemeChangeEntry["mode"]) => {
    if (oklchEquals(t.old, t.next)) return;
    changes.push({
      token: t.token,
      label: t.label,
      mode,
      oldValue: `${oklchToHex(t.old.h, t.old.c, t.old.l)} (${formatOklchString(t.old)})`,
      newValue: `${oklchToHex(t.next.h, t.next.c, t.next.l)} (${formatOklchString(t.next)})`,
      file: "app/lib/palettes.ts",
      keyPath: t.keyPath,
    });
  };

  const stateKeys = ["error", "warning", "success", "info"] as const;
  for (const key of stateKeys) {
    const label = STATE_LABELS[key];
    for (const mode of ["light", "dark"] as const) {
      const modeLabel = mode === "light" ? "Claro" : "Escuro";
      pushColor(
        {
          token: `--color-${key}`,
          label: `${label} (cor)`,
          keyPath: `SHARED_COLORS.states.${key}.color.${mode}`,
          old: original.states[key].color[mode],
          next: draftShared.states[key].color[mode],
        },
        modeLabel,
      );
      pushColor(
        {
          token: `--${key}-foreground`,
          label: `${label} (texto)`,
          keyPath: `SHARED_COLORS.states.${key}.text.${mode}`,
          old: original.states[key].text[mode],
          next: draftShared.states[key].text[mode],
        },
        modeLabel,
      );
    }
  }

  for (const slug of PHASE_ORDER) {
    pushColor(
      {
        token: `PHASES.${slug}.color`,
        label: `Fase ${PHASES[slug].title}`,
        keyPath: `SHARED_COLORS.phases.${slug}`,
        old: original.phases[slug],
        next: draftShared.phases[slug],
      },
      "Ambos",
    );
  }

  for (const slug of CATEGORY_ORDER) {
    pushColor(
      {
        token: `CATEGORIES.${slug}.color`,
        label: `Categoria ${CATEGORIES[slug].title}`,
        keyPath: `SHARED_COLORS.categories.${slug}`,
        old: original.categories[slug],
        next: draftShared.categories[slug],
      },
      "Ambos",
    );
  }

  const numericDiffs: Array<{
    token: string;
    label: string;
    keyPath: string;
    format: (value: number) => string;
    pick: (shared: SharedColors) => ModePair<number>;
  }> = [
    {
      token: "--shared-support-l-delta",
      label: "Texto de apoio (ajuste de luz)",
      keyPath: "SHARED_COLORS.formulas.support.lDelta",
      format: (v) => v.toFixed(3),
      pick: (sh) => sh.formulas.support.lDelta,
    },
    {
      token: "--shared-support-c-delta",
      label: "Texto de apoio (ajuste de saturação)",
      keyPath: "SHARED_COLORS.formulas.support.cDelta",
      format: (v) => v.toFixed(3),
      pick: (sh) => sh.formulas.support.cDelta,
    },
    {
      token: "--shared-primary-hover-mix",
      label: "Principal · hover (mistura com o fundo)",
      keyPath: "SHARED_COLORS.formulas.primaryHoverMix",
      format: (v) => `${v}%`,
      pick: (sh) => sh.formulas.primaryHoverMix,
    },
    {
      token: "--shared-category-icon-fill-alpha",
      label: "Ícone da categoria · fundo (opacidade)",
      keyPath: "SHARED_COLORS.formulas.categoryIcon.fillAlpha",
      format: (v) => `${v}%`,
      pick: (sh) => sh.formulas.categoryIcon.fillAlpha,
    },
    {
      token: "--shared-category-icon-stroke-alpha",
      label: "Ícone da categoria · contorno (opacidade)",
      keyPath: "SHARED_COLORS.formulas.categoryIcon.strokeAlpha",
      format: (v) => `${v}%`,
      pick: (sh) => sh.formulas.categoryIcon.strokeAlpha,
    },
    {
      token: "--shared-category-icon-chroma",
      label: "Ícone da categoria · saturação mantida",
      keyPath: "SHARED_COLORS.formulas.categoryIcon.chroma",
      format: (v) => v.toFixed(2),
      pick: (sh) => sh.formulas.categoryIcon.chroma,
    },
    {
      token: "--shared-action-ring-alpha",
      label: "Ação · anel (força)",
      keyPath: "SHARED_COLORS.formulas.actionCard.ringAlpha",
      format: (v) => `${v}%`,
      pick: (sh) => sh.formulas.actionCard.ringAlpha,
    },
    {
      token: "--shared-action-shadow-alpha",
      label: "Ação · sombra em repouso (força)",
      keyPath: "SHARED_COLORS.formulas.actionCard.shadowAlpha",
      format: (v) => `${v}%`,
      pick: (sh) => sh.formulas.actionCard.shadowAlpha,
    },
    {
      token: "--shared-action-hover-shadow-alpha",
      label: "Ação · sombra no hover (força)",
      keyPath: "SHARED_COLORS.formulas.actionCard.hoverShadowAlpha",
      format: (v) => `${v}%`,
      pick: (sh) => sh.formulas.actionCard.hoverShadowAlpha,
    },
    {
      token: "--shared-late-bg-alpha",
      label: "Ação atrasada · fundo (opacidade)",
      keyPath: "SHARED_COLORS.formulas.lateBgAlpha",
      format: (v) => `${v}%`,
      pick: (sh) => sh.formulas.lateBgAlpha,
    },
    {
      token: "--shared-ring-halo-alpha",
      label: "Halo de foco (transparência)",
      keyPath: "SHARED_COLORS.formulas.ringHaloAlpha",
      format: (v) => `${v}%`,
      pick: (sh) => sh.formulas.ringHaloAlpha,
    },
    {
      token: "--shared-background-mix",
      label: "Fundo dos avisos (mistura)",
      keyPath: "SHARED_COLORS.states.backgroundMix",
      format: (v) => `${v}%`,
      pick: (sh) => sh.states.backgroundMix,
    },
    {
      token: "--shared-marker-l-delta",
      label: "Marca-texto (ajuste de luz)",
      keyPath: "SHARED_COLORS.markerText.lDelta",
      format: (v) => v.toFixed(3),
      pick: (sh) => sh.markerText.lDelta,
    },
    {
      token: "--shared-shadow-mix",
      label: "Sombra (mistura com a principal)",
      keyPath: "SHARED_COLORS.shadow.mix",
      format: (v) => `${v}%`,
      pick: (sh) => sh.shadow.mix,
    },
    {
      token: "--shared-shadow-l",
      label: "Sombra (luz)",
      keyPath: "SHARED_COLORS.shadow.l",
      format: (v) => v.toFixed(3),
      pick: (sh) => sh.shadow.l,
    },
    {
      token: "--shared-shadow-alpha",
      label: "Sombra (força)",
      keyPath: "SHARED_COLORS.shadow.alpha",
      format: (v) => `${v}%`,
      pick: (sh) => sh.shadow.alpha,
    },
    {
      token: "--shared-top-highlight-alpha",
      label: "Brilho da borda da ação (opacidade)",
      keyPath: "SHARED_COLORS.formulas.topHighlightAlpha",
      format: (v) => `${v}%`,
      pick: (sh) => sh.formulas.topHighlightAlpha,
    },
  ];
  for (const item of numericDiffs) {
    for (const mode of ["light", "dark"] as const) {
      const from = item.pick(original)[mode];
      const to = item.pick(draftShared)[mode];
      if (Math.abs(from - to) >= 0.0005) {
        changes.push({
          token: item.token,
          label: item.label,
          mode: mode === "light" ? "Claro" : "Escuro",
          oldValue: item.format(from),
          newValue: item.format(to),
          file: "app/lib/palettes.ts",
          keyPath: `${item.keyPath}.${mode}`,
        });
      }
    }
  }

  const singles: Array<{
    token: string;
    label: string;
    keyPath: string;
    from: number;
    to: number;
  }> = [
    {
      token: "--shared-marker-c",
      label: "Marca-texto (saturação)",
      keyPath: "SHARED_COLORS.markerText.c",
      from: original.markerText.c,
      to: draftShared.markerText.c,
    },
    {
      token: "--shared-success-strong-l",
      label: "Sucesso forte (luz)",
      keyPath: "SHARED_COLORS.states.successStrong.l",
      from: original.states.successStrong.l,
      to: draftShared.states.successStrong.l,
    },
    {
      token: "--shared-success-strong-c",
      label: "Sucesso forte (saturação)",
      keyPath: "SHARED_COLORS.states.successStrong.c",
      from: original.states.successStrong.c,
      to: draftShared.states.successStrong.c,
    },
    {
      token: "--shared-success-strong-hover-l",
      label: "Sucesso forte · hover (luz)",
      keyPath: "SHARED_COLORS.states.successStrong.hoverL",
      from: original.states.successStrong.hoverL,
      to: draftShared.states.successStrong.hoverL,
    },
    {
      token: "--shared-success-strong-hover-c",
      label: "Sucesso forte · hover (saturação)",
      keyPath: "SHARED_COLORS.states.successStrong.hoverC",
      from: original.states.successStrong.hoverC,
      to: draftShared.states.successStrong.hoverC,
    },
  ];
  for (const item of singles) {
    if (Math.abs(item.from - item.to) >= 0.0005) {
      changes.push({
        token: item.token,
        label: item.label,
        mode: "Ambos",
        oldValue: item.from.toFixed(3),
        newValue: item.to.toFixed(3),
        file: "app/lib/palettes.ts",
        keyPath: item.keyPath,
      });
    }
  }

  const phaseKeys = Object.keys(original.formulas.phase) as PhaseFormulaKey[];
  for (const key of phaseKeys) {
    for (const mode of ["light", "dark"] as const) {
      const from = getPhaseFormula(original, key, mode);
      const to = getPhaseFormula(draftShared, key, mode);
      if (Math.abs(from - to) >= 0.0005) {
        changes.push({
          token: `--shared-phase-${key}`,
          label: `Fase derivação · ${key}`,
          mode: mode === "light" ? "Claro" : "Escuro",
          oldValue: String(from),
          newValue: String(to),
          file: "app/lib/palettes.ts",
          keyPath: `SHARED_COLORS.formulas.phase.${key}`,
        });
      }
      if (typeof original.formulas.phase[key] === "number") break;
    }
  }

  const lateKeys: Array<{
    token: string;
    label: string;
    mode: "light" | "dark";
    key: LateKey;
    format: (value: number) => string;
  }> = [
    {
      token: "--shared-late-alpha",
      label: "Ação atrasada (força)",
      mode: "light",
      key: "alpha",
      format: (v) => `${v}%`,
    },
    {
      token: "--shared-late-alpha-hover",
      label: "Ação atrasada · hover (força)",
      mode: "light",
      key: "alphaHover",
      format: (v) => `${v}%`,
    },
    {
      token: "--shared-dark-late-l",
      label: "Ação atrasada (luz)",
      mode: "dark",
      key: "l",
      format: (v) => v.toFixed(3),
    },
    {
      token: "--shared-dark-late-c",
      label: "Ação atrasada (saturação)",
      mode: "dark",
      key: "c",
      format: (v) => v.toFixed(3),
    },
    {
      token: "--shared-dark-late-alpha",
      label: "Ação atrasada (força)",
      mode: "dark",
      key: "alpha",
      format: (v) => `${v}%`,
    },
    {
      token: "--shared-dark-late-alpha-hover",
      label: "Ação atrasada · hover (força)",
      mode: "dark",
      key: "alphaHover",
      format: (v) => `${v}%`,
    },
  ];
  for (const item of lateKeys) {
    const from = getLateValue(original, item.key, item.mode);
    const to = getLateValue(draftShared, item.key, item.mode);
    if (Math.abs(from - to) >= 0.0005) {
      changes.push({
        token: item.token,
        label: item.label,
        mode: item.mode === "light" ? "Claro" : "Escuro",
        oldValue: item.format(from),
        newValue: item.format(to),
        file: "app/lib/palettes.ts",
        keyPath: `SHARED_COLORS.lateShadow.${item.mode}.${item.key}`,
      });
    }
  }

  return changes;
}

const STATE_LABELS: Record<"error" | "warning" | "success" | "info", string> = {
  error: "Erro",
  warning: "Atenção",
  success: "Sucesso",
  info: "Informação",
};

export function computeThemeChanges(
  paletteId: string,
  draftPalette: PaletteConfig,
  draftShared: SharedColors,
): ThemeChangeEntry[] {
  const original = getPaletteById(paletteId);
  const changes: ThemeChangeEntry[] = [];

  if ((draftPalette.relief !== false) !== (original.relief !== false)) {
    changes.push({
      token: "relief",
      label: "Relevo das ações",
      mode: "Ambos",
      oldValue: String(original.relief !== false),
      newValue: String(draftPalette.relief !== false),
      file: "app/lib/palettes.ts",
      keyPath: `PALLETE.${original.id}.relief`,
    });
  }

  for (const mode of ["light", "dark"] as const) {
    const modeLabel = mode === "light" ? "Claro" : "Escuro";

    for (const key of ["bg", "primary", "primaryFg", "accent"] as const) {
      const oldColor =
        key === "primaryFg"
          ? getEffectivePrimaryFg(original, mode)
          : original[mode][key];
      const newColor =
        key === "primaryFg"
          ? getEffectivePrimaryFg(draftPalette, mode)
          : draftPalette[mode][key];

      if (!oklchEquals(oldColor, newColor)) {
        changes.push({
          token: PALETTE_COLOR_META[key].token,
          label: PALETTE_COLOR_META[key].label,
          mode: modeLabel,
          oldValue: formatOklchString(oldColor),
          newValue: formatOklchString(newColor),
          file: "app/lib/palettes.ts",
          keyPath: `PALLETE.${original.id}.${mode}.${key}`,
        });
      }
    }

    for (const deltaKey of Object.keys(DELTA_META) as DeltaKey[]) {
      const oldDelta = getEffectiveDelta(original, mode, deltaKey);
      const newDelta = getEffectiveDelta(draftPalette, mode, deltaKey);
      if (Math.abs(oldDelta - newDelta) >= 0.0005) {
        changes.push({
          token: DELTA_META[deltaKey].token,
          label: DELTA_META[deltaKey].label,
          mode: modeLabel,
          oldValue: oldDelta.toFixed(3),
          newValue: newDelta.toFixed(3),
          file: "app/lib/palettes.ts",
          keyPath: `PALLETE.${original.id}.${mode}.${deltaKey}`,
        });
      }
    }
  }

  changes.push(...collectSharedDiffs(draftShared));

  return changes;
}

export function buildThemeChangesMarkdown(
  palette: PaletteConfig,
  changes: ThemeChangeEntry[],
): string {
  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# Instruções de atualização de cores — UZZINA (${palette.label})`,
    "",
    `- **Repositório / App:** UZZINA`,
    `- **Data:** ${today}`,
    `- **Paleta:** ${palette.label} (\`${palette.id}\`)`,
    `- **Total de alterações:** ${changes.length}`,
    "",
    "> **Regra:** Aplique somente estas mudanças; não altere fórmulas nem outros valores.",
    "",
    "## Tabela de alterações",
    "",
    "| Item | Token | Modo | Valor antigo | Valor novo | Arquivo | Chave exata |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const c of changes) {
    lines.push(
      `| ${c.label} | \`${c.token}\` | ${c.mode} | \`${c.oldValue}\` | \`${c.newValue}\` | \`${c.file}\` | \`${c.keyPath}\` |`,
    );
  }

  lines.push(
    "",
    "## Dados estruturados (JSON)",
    "",
    "```json",
    JSON.stringify(
      {
        app: "UZZINA",
        date: today,
        paletteId: palette.id,
        paletteLabel: palette.label,
        changes,
      },
      null,
      2,
    ),
    "```",
    "",
    "## Passos de aplicação e verificação",
    "",
    "1. Edite apenas as chaves listadas na tabela acima nos arquivos indicados (`app/lib/palettes.ts`, `app/lib/CONSTANTS.ts` e/ou `app/tailwind.css`). Não altere fórmulas de cálculo nem outros valores.",
    "2. Rode `bun run typecheck` para validar tipos.",
    "3. Formate os arquivos alterados com Prettier (`./node_modules/.bin/prettier --write <arquivos>`).",
    "4. Confira visualmente no app em `/ui` → **Tokens de Design → Cores Semânticas** e em `/app/admin/themes` nos modos **Claro** e **Escuro**.",
    "5. Aguarde o aceite visual do proprietário antes de realizar commit ou push.",
    "",
  );

  return lines.join("\n");
}

/** Serializes a value as TypeScript object-literal source (unquoted keys). */
function toTsLiteral(value: unknown, indent: number): string {
  const pad = "  ".repeat(indent);
  const inner = "  ".repeat(indent + 1);
  if (Array.isArray(value)) {
    return `[\n${value.map((v) => `${inner}${toTsLiteral(v, indent + 1)},`).join("\n")}\n${pad}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    return `{\n${entries.map(([k, v]) => `${inner}${k}: ${toTsLiteral(v, indent + 1)},`).join("\n")}\n${pad}}`;
  }
  return JSON.stringify(value);
}

/**
 * Complete `app/lib/palettes.ts`: the file as it is today, with the PALLETE
 * array and the SHARED_COLORS literal rebuilt from the draft. The header (types
 * and helpers before PALLETE), the comments and the tail stay as they are. Run
 * Prettier on the result.
 */
export function buildPalettesSource(
  draftPalette: PaletteConfig,
  draftShared: SharedColors,
): string {
  const start = palettesSource.indexOf("export const PALLETE");
  const sharedDoc = palettesSource.indexOf(
    "/**\n * Colors shared by every palette",
  );
  const sharedStart = palettesSource.indexOf("export const SHARED_COLORS");
  if (start === -1 || sharedDoc === -1 || sharedStart === -1) {
    return palettesSource;
  }
  const sharedEndMarker = "\n};\n";
  const sharedEnd =
    palettesSource.indexOf(sharedEndMarker, sharedStart) +
    sharedEndMarker.length;
  const head = palettesSource.slice(0, start);
  const docBlock = palettesSource.slice(sharedDoc, sharedStart);
  const tail = palettesSource.slice(sharedEnd);
  const palettes = PALLETE.map((p) =>
    p.id === draftPalette.id ? draftPalette : p,
  );
  return `${head}export const PALLETE: PaletteConfig[] = ${toTsLiteral(palettes, 0)};\n\n${docBlock}export const SHARED_COLORS: SharedColors = ${toTsLiteral(draftShared, 0)};\n${tail}`;
}

export function loadDraftFromStorage(): StoredThemeDraft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredThemeDraft;
    if (!parsed || typeof parsed.paletteId !== "string" || !parsed.palette) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraftToStorage(draft: StoredThemeDraft): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage quota or privacy-mode errors.
  }
}

export function clearDraftFromStorage(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
