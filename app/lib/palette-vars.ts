import {
  oklchToCss,
  SHARED_COLORS,
  type ModePair,
  type SharedColors,
} from "~/lib/palettes";

type OklchColor = { h: number; c: number; l: number };

type PaletteModeVars = {
  primary: OklchColor;
  /** Explicit text color on the primary (custom theme only; palettes use the delta). */
  primaryFg?: OklchColor | null;
  /** Text on the primary as offsets from the primary (DS36, stage 7). */
  primaryFgDelta?: { l: number; c: number; h: number } | null;
  bg?: OklchColor | null;
  /** Custom text color (custom theme); palettes use `fgLDelta`. */
  fg?: OklchColor | null;
  fgLDelta?: number;
  accent?: OklchColor | null;
  popoverLDelta?: number;
  cardLDelta?: number;
  inputLDelta?: number;
  secondaryLDelta?: number;
  secondaryHoverLDelta?: number;
  borderLDelta?: number;
  actionLDelta?: number;
  actionHoverLDelta?: number;
};

/** Palette field and CSS variable name of each neutral layer (DS35). */
const NEUTRAL_DELTAS = [
  ["fgLDelta", "foreground"],
  ["popoverLDelta", "popover"],
  ["cardLDelta", "card"],
  ["inputLDelta", "input"],
  ["secondaryLDelta", "secondary"],
  ["secondaryHoverLDelta", "secondary-hover"],
  ["borderLDelta", "border"],
  ["actionLDelta", "action"],
  ["actionHoverLDelta", "action-hover"],
] as const;

export type PaletteVars = {
  relief?: boolean;
  light: PaletteModeVars;
  dark: PaletteModeVars;
};

/** Writes the palette as CSS custom properties on `target` (defaults to document root). */
export function applyPaletteVars(
  palette: PaletteVars,
  target?: HTMLElement | null,
) {
  const root = target ?? document.documentElement;
  const { light, dark } = palette;

  // 1. Cor Primária e seu Foreground
  root.style.setProperty("--primary-h", String(light.primary.h));
  root.style.setProperty("--primary-c", String(light.primary.c));
  root.style.setProperty("--primary-l", String(light.primary.l));
  root.style.setProperty("--dark-primary-h", String(dark.primary.h));
  root.style.setProperty("--dark-primary-c", String(dark.primary.c));
  root.style.setProperty("--dark-primary-l", String(dark.primary.l));

  if (light.primaryFg) {
    const fgStr = `oklch(${light.primaryFg.l} ${light.primaryFg.c} ${light.primaryFg.h})`;
    root.style.setProperty("--primary-foreground-override", fgStr);
  } else {
    root.style.removeProperty("--primary-foreground-override");
  }
  if (dark.primaryFg) {
    const fgStr = `oklch(${dark.primaryFg.l} ${dark.primaryFg.c} ${dark.primaryFg.h})`;
    root.style.setProperty("--dark-primary-foreground-override", fgStr);
  } else {
    root.style.removeProperty("--dark-primary-foreground-override");
  }

  // 1b. Texto sobre a principal: deslocamentos da principal (DS36, stage 7)
  setPrimaryFgDelta(root.style, "", light.primaryFgDelta);
  setPrimaryFgDelta(root.style, "dark-", dark.primaryFgDelta);

  // 2. Cor de Fundo e Texto (Light e Dark)
  if (light.bg) {
    const bgStr = `oklch(${light.bg.l} ${light.bg.c} ${light.bg.h})`;
    root.style.setProperty("--background-override", bgStr);
  }
  if (light.fg) {
    const fgStr = `oklch(${light.fg.l} ${light.fg.c} ${light.fg.h})`;
    root.style.setProperty("--foreground-override", fgStr);
  } else {
    root.style.removeProperty("--foreground-override");
  }
  if (dark.bg) {
    const bgStr = `oklch(${dark.bg.l} ${dark.bg.c} ${dark.bg.h})`;
    root.style.setProperty("--dark-background-override", bgStr);
  }
  if (dark.fg) {
    const fgStr = `oklch(${dark.fg.l} ${dark.fg.c} ${dark.fg.h})`;
    root.style.setProperty("--dark-foreground-override", fgStr);
  } else {
    root.style.removeProperty("--dark-foreground-override");
  }

  // 2.1. Accent (the focus ring follows it; defaults to the primary color)
  if (light.accent) {
    const accentStr = `oklch(${light.accent.l} ${light.accent.c} ${light.accent.h})`;
    root.style.setProperty("--accent-override", accentStr);
  } else {
    root.style.removeProperty("--accent-override");
  }
  if (dark.accent) {
    const accentStr = `oklch(${dark.accent.l} ${dark.accent.c} ${dark.accent.h})`;
    root.style.setProperty("--dark-accent-override", accentStr);
  } else {
    root.style.removeProperty("--dark-accent-override");
  }

  // 3. Neutral layers (DS35): L deltas over the page background. Light reads
  // `--<name>-l-delta`, dark reads `--dark-<name>-l-delta`. Modes without a
  // value (custom themes) fall back to the defaults declared in tailwind.css.
  for (const [mode, vars] of [
    ["", light],
    ["dark-", dark],
  ] as const) {
    for (const [key, name] of NEUTRAL_DELTAS) {
      setOrRemove(
        root.style,
        `--${mode}${name}-l-delta`,
        vars[key] === undefined ? undefined : String(vars[key]),
      );
    }
  }

  // 5. Relevo dos itens da Ação (border-t, ring e sombras)
  if (palette.relief === false) {
    // Flat cards: lets tinted rings (phase-surface) fade out like the base ring.
    root.style.setProperty("--action-relief", "0");
    root.style.setProperty("--action-top-border-override", "transparent");
    // Keep Tailwind's box-shadow list valid so state rings remain visible.
    root.style.setProperty("--action-shadow-override", "0 0 #0000");
    root.style.setProperty("--action-hover-shadow-override", "0 0 #0000");
    root.style.removeProperty("--dark-action-top-border-override");
  } else {
    root.style.removeProperty("--action-relief");
    root.style.removeProperty("--action-shadow-override");
    root.style.removeProperty("--action-hover-shadow-override");

    // Borda superior da action: brilho do tema (--shared-top-highlight-alpha).
    root.style.removeProperty("--action-top-border-override");
    root.style.removeProperty("--dark-action-top-border-override");
  }

  // 6. Blocos compartilhados por todas as paletas (DS36)
  applySharedColorVars(root);
}

/**
 * Writes the shared formulas (states, support text, hover, halo, highlight) as
 * CSS variables: `--shared-<token>` for light and `--shared-dark-<token>` for
 * dark. tailwind.css only reads them. Called by applyPaletteVars and, with the
 * draft, by the theme editor preview.
 */
export function applySharedColorVars(
  target: HTMLElement | null,
  shared: SharedColors = SHARED_COLORS,
) {
  const root = target ?? document.documentElement;
  const { formulas } = shared;
  const pct = (value: number) => `${value}%`;
  setModePair(root.style, "support-l-delta", formulas.support.lDelta, String);
  setModePair(root.style, "support-c-delta", formulas.support.cDelta, String);
  setModePair(root.style, "primary-hover-mix", formulas.primaryHoverMix, pct);
  setModePair(root.style, "ring-halo-alpha", formulas.ringHaloAlpha, pct);
  setModePair(root.style, "late-bg-alpha", formulas.lateBgAlpha, pct);
  setModePair(
    root.style,
    "action-ring-alpha",
    formulas.actionCard.ringAlpha,
    pct,
  );
  setModePair(
    root.style,
    "action-shadow-alpha",
    formulas.actionCard.shadowAlpha,
    pct,
  );
  setModePair(
    root.style,
    "action-hover-shadow-alpha",
    formulas.actionCard.hoverShadowAlpha,
    pct,
  );
  setModePair(
    root.style,
    "category-icon-fill-alpha",
    formulas.categoryIcon.fillAlpha,
    pct,
  );
  setModePair(
    root.style,
    "category-icon-stroke-alpha",
    formulas.categoryIcon.strokeAlpha,
    pct,
  );
  setModePair(
    root.style,
    "category-icon-chroma",
    formulas.categoryIcon.chroma,
    String,
  );
  setModePair(
    root.style,
    "top-highlight-alpha",
    formulas.topHighlightAlpha,
    pct,
  );

  const { shadow, lateShadow } = shared;
  setModePair(root.style, "shadow-mix", shadow.mix, pct);
  setModePair(root.style, "shadow-l", shadow.l, String);
  setModePair(root.style, "shadow-alpha", shadow.alpha, pct);
  // Late card: the light values are shared, the dark ones also set the color.
  // States (DS36, stage 6): one full color per mode, and their text colors.
  for (const key of ["error", "warning", "success", "info"] as const) {
    const state = shared.states[key];
    root.style.setProperty(
      `--shared-${key}-color`,
      oklchToCss(state.color.light),
    );
    root.style.setProperty(
      `--shared-dark-${key}-color`,
      oklchToCss(state.color.dark),
    );
    root.style.setProperty(
      `--shared-${key}-text`,
      oklchToCss(state.text.light),
    );
    root.style.setProperty(
      `--shared-dark-${key}-text`,
      oklchToCss(state.text.dark),
    );
  }
  setModePair(root.style, "background-mix", shared.states.backgroundMix, pct);
  const strong = shared.states.successStrong;
  root.style.setProperty("--shared-success-strong-l", String(strong.l));
  root.style.setProperty("--shared-success-strong-c", String(strong.c));
  root.style.setProperty(
    "--shared-success-strong-hover-l",
    String(strong.hoverL),
  );
  root.style.setProperty(
    "--shared-success-strong-hover-c",
    String(strong.hoverC),
  );
  setModePair(root.style, "marker-l-delta", shared.markerText.lDelta, String);
  root.style.setProperty("--shared-marker-c", String(shared.markerText.c));

  const phase = formulas.phase;
  setModePair(root.style, "phase-mix", phase.mix, pct);
  setModePair(root.style, "phase-mix-hover", phase.mixHover, pct);
  setModePair(root.style, "phase-ring-alpha", phase.ringAlpha, pct);
  setModePair(root.style, "phase-text-l", phase.textL, String);
  setModePair(root.style, "phase-text-c", phase.textC, String);
  setModePair(root.style, "phase-shadow-l", phase.shadowL, String);
  setModePair(root.style, "phase-shadow-c", phase.shadowC, String);
  setModePair(root.style, "phase-shadow-alpha", phase.shadowAlpha, pct);
  setModePair(root.style, "phase-edge-dl", phase.edgeDl, String);
  setModePair(root.style, "phase-top-light", phase.topLight, pct);
  // Values that have one setting for both modes.
  root.style.setProperty("--shared-phase-diffuse-l", String(phase.diffuseL));
  root.style.setProperty("--shared-phase-diffuse-c", String(phase.diffuseC));
  root.style.setProperty(
    "--shared-phase-diffuse-alpha",
    pct(phase.diffuseAlpha),
  );
  root.style.setProperty("--shared-phase-ink-l", String(phase.inkL));
  root.style.setProperty("--shared-phase-ink-c", String(phase.inkC));
  root.style.setProperty("--shared-phase-ink-light-l", String(phase.inkLightL));
  root.style.setProperty("--shared-phase-ink-light-c", String(phase.inkLightC));
  root.style.setProperty("--shared-phase-hover-dl", String(phase.hoverDl));
  root.style.setProperty("--shared-phase-dim-l", String(phase.dimL));
  root.style.setProperty(
    "--shared-phase-dim-c-factor",
    String(phase.dimCFactor),
  );
  root.style.setProperty(
    "--shared-phase-vivid-shadow-l",
    String(phase.vividShadowL),
  );
  root.style.setProperty(
    "--shared-phase-vivid-shadow-c",
    String(phase.vividShadowC),
  );
  root.style.setProperty(
    "--shared-phase-vivid-shadow-alpha",
    pct(phase.vividShadowAlpha),
  );
  root.style.setProperty(
    "--shared-phase-hover-c-loss",
    String(phase.hoverCLoss),
  );
  root.style.setProperty("--shared-phase-date-opacity", pct(phase.dateOpacity));
  root.style.setProperty("--shared-phase-diffuse-y", `${phase.diffuseY}px`);
  root.style.setProperty(
    "--shared-phase-diffuse-blur",
    `${phase.diffuseBlur}px`,
  );
  root.style.setProperty(
    "--shared-phase-diffuse-spread",
    `${phase.diffuseSpread}px`,
  );

  root.style.setProperty("--shared-late-alpha", pct(lateShadow.light.alpha));
  root.style.setProperty(
    "--shared-late-alpha-hover",
    pct(lateShadow.light.alphaHover),
  );
  root.style.setProperty("--shared-dark-late-l", String(lateShadow.dark.l));
  root.style.setProperty("--shared-dark-late-c", String(lateShadow.dark.c));
  root.style.setProperty(
    "--shared-dark-late-alpha",
    pct(lateShadow.dark.alpha),
  );
  root.style.setProperty(
    "--shared-dark-late-alpha-hover",
    pct(lateShadow.dark.alphaHover),
  );
}

function setModePair<T>(
  style: CSSStyleDeclaration,
  token: string,
  pair: ModePair<T>,
  format: (value: T) => string,
) {
  style.setProperty(`--shared-${token}`, format(pair.light));
  style.setProperty(`--shared-dark-${token}`, format(pair.dark));
}

function setPrimaryFgDelta(
  style: CSSStyleDeclaration,
  prefix: string,
  delta: { l: number; c: number; h: number } | null | undefined,
) {
  setOrRemove(
    style,
    `--${prefix}primary-fg-l-delta`,
    delta ? String(delta.l) : undefined,
  );
  setOrRemove(
    style,
    `--${prefix}primary-fg-c-delta`,
    delta ? String(delta.c) : undefined,
  );
  setOrRemove(
    style,
    `--${prefix}primary-fg-h-delta`,
    delta ? String(delta.h) : undefined,
  );
}

function setOrRemove(
  root: CSSStyleDeclaration,
  name: string,
  value: string | undefined,
) {
  if (value) {
    root.setProperty(name, value);
  } else {
    root.removeProperty(name);
  }
}
