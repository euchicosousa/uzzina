type OklchColor = { h: number; c: number; l: number };

type PaletteModeVars = {
  primary: OklchColor;
  primaryFg?: OklchColor | null;
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
  shadowColor?: string;
  /** Shadow opacity in percent for the largest shadow size. */
  shadowOpacity?: number;
  topBorderColor?: string;
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
  shadowColor?: string;
  topBorderColor?: string;
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

  // 4. Sombra das superfícies elevadas: não depende do relevo dos cartões.
  const lightShadowColor = light.shadowColor || palette.shadowColor;
  const darkShadowColor = dark.shadowColor || palette.shadowColor;
  setOrRemove(root.style, "--shadow-color-override", lightShadowColor);
  setOrRemove(root.style, "--dark-shadow-color-override", darkShadowColor);
  setOrRemove(
    root.style,
    "--shadow-opacity-override",
    light.shadowOpacity === undefined ? undefined : `${light.shadowOpacity}%`,
  );
  setOrRemove(
    root.style,
    "--dark-shadow-opacity-override",
    dark.shadowOpacity === undefined ? undefined : `${dark.shadowOpacity}%`,
  );

  // 5. Relevo de ações e cartões (border-t, ring e sombras)
  if (palette.relief === false) {
    // Flat cards: lets tinted rings (phase-surface) fade out like the base ring.
    root.style.setProperty("--action-relief", "0");
    root.style.setProperty("--action-top-border-override", "transparent");
    // Keep Tailwind's box-shadow list valid so state rings remain visible.
    root.style.setProperty("--action-shadow-override", "0 0 #0000");
    root.style.setProperty("--action-hover-shadow-override", "0 0 #0000");
    root.style.removeProperty("--action-shadow-color-override");
    root.style.removeProperty("--dark-action-shadow-color-override");
    root.style.removeProperty("--dark-action-top-border-override");
  } else {
    root.style.removeProperty("--action-relief");
    root.style.removeProperty("--action-shadow-override");
    root.style.removeProperty("--action-hover-shadow-override");

    // Sombra e ring/borda
    if (lightShadowColor) {
      root.style.setProperty(
        "--action-shadow-color-override",
        lightShadowColor,
      );
    } else {
      root.style.removeProperty("--action-shadow-color-override");
    }

    if (darkShadowColor) {
      root.style.setProperty(
        "--dark-action-shadow-color-override",
        darkShadowColor,
      );
    } else {
      root.style.removeProperty("--dark-action-shadow-color-override");
    }

    // Borda superior da action (padrão branco; pode ser customizada)
    const lightTopBorder = light.topBorderColor || palette.topBorderColor;
    if (lightTopBorder) {
      root.style.setProperty("--action-top-border-override", lightTopBorder);
    } else {
      root.style.removeProperty("--action-top-border-override");
    }

    const darkTopBorder = dark.topBorderColor || palette.topBorderColor;
    if (darkTopBorder) {
      root.style.setProperty(
        "--dark-action-top-border-override",
        darkTopBorder,
      );
    } else {
      root.style.removeProperty("--dark-action-top-border-override");
    }
  }
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
