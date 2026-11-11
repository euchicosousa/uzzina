type OklchColor = { h: number; c: number; l: number };

type PaletteModeVars = {
  primary: OklchColor;
  primaryFg?: OklchColor | null;
  bg?: OklchColor | null;
  fg?: OklchColor | null;
  ring?: OklchColor | null;
  borderLDelta?: number;
  inputLDelta?: number;
  actionLDelta?: number;
  actionHoverLDelta?: number;
  popoverLDelta?: number;
  cardLDelta?: number;
  shadowColor?: string;
  topBorderColor?: string;
};

export type PaletteVars = {
  relief?: boolean;
  shadowColor?: string;
  topBorderColor?: string;
  light: PaletteModeVars;
  dark: PaletteModeVars;
};

/** Writes the palette as CSS custom properties on the document root. */
export function applyPaletteVars(palette: PaletteVars) {
  const root = document.documentElement;
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
  }
  if (dark.bg) {
    const bgStr = `oklch(${dark.bg.l} ${dark.bg.c} ${dark.bg.h})`;
    root.style.setProperty("--dark-background-override", bgStr);
  }
  if (dark.fg) {
    const fgStr = `oklch(${dark.fg.l} ${dark.fg.c} ${dark.fg.h})`;
    root.style.setProperty("--dark-foreground-override", fgStr);
  }

  // 2.1. Ring (anel de foco customizável por paleta)
  if (light.ring) {
    const ringStr = `oklch(${light.ring.l} ${light.ring.c} ${light.ring.h})`;
    root.style.setProperty("--ring-override", ringStr);
  } else {
    root.style.removeProperty("--ring-override");
  }
  if (dark.ring) {
    const ringStr = `oklch(${dark.ring.l} ${dark.ring.c} ${dark.ring.h})`;
    root.style.setProperty("--dark-ring-override", ringStr);
  } else {
    root.style.removeProperty("--dark-ring-override");
  }

  // 2.2. Accent (cor de destaque do palette: 15% mais escuro no Light, 10% mais clara no Dark)

  // 3. Deltas de border, input, action, action-hover, popover, card (Light e Dark)
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
  if (light.cardLDelta !== undefined) {
    root.style.setProperty("--card-l-delta", String(light.cardLDelta));
  } else {
    root.style.removeProperty("--card-l-delta");
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
  if (dark.cardLDelta !== undefined) {
    root.style.setProperty("--dark-card-l-delta", String(dark.cardLDelta));
  } else {
    root.style.removeProperty("--dark-card-l-delta");
  }

  // 4. Relevo de ações e cartões (border-t, ring e sombras)
  if (palette.relief === false) {
    root.style.setProperty("--action-top-border-override", "transparent");
    // Keep Tailwind's box-shadow list valid so state rings remain visible.
    root.style.setProperty("--action-shadow-override", "0 0 #0000");
    root.style.setProperty("--action-hover-shadow-override", "0 0 #0000");
    root.style.removeProperty("--action-shadow-color-override");
    root.style.removeProperty("--dark-action-shadow-color-override");
    root.style.removeProperty("--dark-action-top-border-override");
  } else {
    root.style.removeProperty("--action-shadow-override");
    root.style.removeProperty("--action-hover-shadow-override");

    // Sombra e ring/borda
    const lightShadowColor = light.shadowColor || palette.shadowColor;
    if (lightShadowColor) {
      root.style.setProperty(
        "--action-shadow-color-override",
        lightShadowColor,
      );
    } else {
      root.style.removeProperty("--action-shadow-color-override");
    }

    const darkShadowColor = dark.shadowColor || palette.shadowColor;
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
