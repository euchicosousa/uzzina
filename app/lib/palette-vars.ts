type OklchColor = { h: number; c: number; l: number };

type PaletteModeVars = {
  primary: OklchColor;
  primaryFg?: OklchColor | null;
  bg?: OklchColor | null;
  fg?: OklchColor | null;
  borderLDelta?: number;
  inputLDelta?: number;
  actionLDelta?: number;
  actionHoverLDelta?: number;
  popoverLDelta?: number;
  secondaryLDelta?: number;
  mutedLDelta?: number;
  cardLDelta?: number;
  mutedForegroundLDelta?: number;
};

export type PaletteVars = { light: PaletteModeVars; dark: PaletteModeVars };

/** Writes the palette as CSS custom properties on the document root. */
export function applyPaletteVars(palette: PaletteVars) {
  const root = document.documentElement;
  const { light, dark } = palette;

  // 1. Cor Primária e seu Foreground
  root.style.setProperty("--accent-h", String(light.primary.h));
  root.style.setProperty("--accent-c", String(light.primary.c));
  root.style.setProperty("--accent-l", String(light.primary.l));
  root.style.setProperty("--dark-accent-h", String(dark.primary.h));
  root.style.setProperty("--dark-accent-c", String(dark.primary.c));
  root.style.setProperty("--dark-accent-l", String(dark.primary.l));

  if (light.primaryFg) {
    const fgStr = `oklch(${light.primaryFg.l} ${light.primaryFg.c} ${light.primaryFg.h})`;
    root.style.setProperty("--primary-foreground-override", fgStr);
    root.style.setProperty("--sidebar-primary-foreground-override", fgStr);
  } else {
    root.style.removeProperty("--primary-foreground-override");
    root.style.removeProperty("--sidebar-primary-foreground-override");
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
  }
  if (dark.bg) {
    const bgStr = `oklch(${dark.bg.l} ${dark.bg.c} ${dark.bg.h})`;
    root.style.setProperty("--dark-background-override", bgStr);
  }
  if (dark.fg) {
    const fgStr = `oklch(${dark.fg.l} ${dark.fg.c} ${dark.fg.h})`;
    root.style.setProperty("--dark-foreground-override", fgStr);
  }

  // 3. Deltas de border, input, action, action-hover, popover, secondary, muted, card (Light e Dark)
  if (light.borderLDelta !== undefined) {
    root.style.setProperty("--border-l-delta", String(light.borderLDelta));
  } else {
    root.style.removeProperty("--border-l-delta");
  }
  if (light.inputLDelta !== undefined) {
    root.style.setProperty("--input-l-delta", String(light.inputLDelta));
  } else {
    root.style.removeProperty("--input-l-delta");
  }
  if (light.actionLDelta !== undefined) {
    root.style.setProperty("--action-l-delta", String(light.actionLDelta));
  } else {
    root.style.removeProperty("--action-l-delta");
  }
  if (light.actionHoverLDelta !== undefined) {
    root.style.setProperty(
      "--action-hover-l-delta",
      String(light.actionHoverLDelta),
    );
  } else {
    root.style.removeProperty("--action-hover-l-delta");
  }
  if (light.popoverLDelta !== undefined) {
    root.style.setProperty("--popover-l-delta", String(light.popoverLDelta));
  } else {
    root.style.removeProperty("--popover-l-delta");
  }
  if (light.secondaryLDelta !== undefined) {
    root.style.setProperty(
      "--secondary-l-delta",
      String(light.secondaryLDelta),
    );
  } else {
    root.style.removeProperty("--secondary-l-delta");
  }
  if (light.mutedLDelta !== undefined) {
    root.style.setProperty("--muted-l-delta", String(light.mutedLDelta));
  } else {
    root.style.removeProperty("--muted-l-delta");
  }
  if (light.cardLDelta !== undefined) {
    root.style.setProperty("--card-l-delta", String(light.cardLDelta));
  } else {
    root.style.removeProperty("--card-l-delta");
  }
  if (light.mutedForegroundLDelta !== undefined) {
    root.style.setProperty(
      "--muted-foreground-l-delta",
      String(light.mutedForegroundLDelta),
    );
  } else {
    root.style.removeProperty("--muted-foreground-l-delta");
  }

  if (dark.borderLDelta !== undefined) {
    root.style.setProperty("--dark-border-l-delta", String(dark.borderLDelta));
  } else {
    root.style.removeProperty("--dark-border-l-delta");
  }
  if (dark.inputLDelta !== undefined) {
    root.style.setProperty("--dark-input-l-delta", String(dark.inputLDelta));
  } else {
    root.style.removeProperty("--dark-input-l-delta");
  }
  if (dark.actionLDelta !== undefined) {
    root.style.setProperty("--dark-action-l-delta", String(dark.actionLDelta));
  } else {
    root.style.removeProperty("--dark-action-l-delta");
  }
  if (dark.actionHoverLDelta !== undefined) {
    root.style.setProperty(
      "--dark-action-hover-l-delta",
      String(dark.actionHoverLDelta),
    );
  } else {
    root.style.removeProperty("--dark-action-hover-l-delta");
  }
  if (dark.popoverLDelta !== undefined) {
    root.style.setProperty(
      "--dark-popover-l-delta",
      String(dark.popoverLDelta),
    );
  } else {
    root.style.removeProperty("--dark-popover-l-delta");
  }
  if (dark.secondaryLDelta !== undefined) {
    root.style.setProperty(
      "--dark-secondary-l-delta",
      String(dark.secondaryLDelta),
    );
  } else {
    root.style.removeProperty("--dark-secondary-l-delta");
  }
  if (dark.mutedLDelta !== undefined) {
    root.style.setProperty("--dark-muted-l-delta", String(dark.mutedLDelta));
  } else {
    root.style.removeProperty("--dark-muted-l-delta");
  }
  if (dark.cardLDelta !== undefined) {
    root.style.setProperty("--dark-card-l-delta", String(dark.cardLDelta));
  } else {
    root.style.removeProperty("--dark-card-l-delta");
  }
  if (dark.mutedForegroundLDelta !== undefined) {
    root.style.setProperty(
      "--dark-muted-foreground-l-delta",
      String(dark.mutedForegroundLDelta),
    );
  } else {
    root.style.removeProperty("--dark-muted-foreground-l-delta");
  }
}
