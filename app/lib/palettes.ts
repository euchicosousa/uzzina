// Paletas de cores OKLCH do UZZINA
// Cada paleta define primary e ring

export type OklchColor = { h: number; c: number; l: number };

export type PaletteConfig = {
  id: string;
  label: string;
  relief?: boolean;
  light: {
    primary: OklchColor;
    /** Text on the primary: offsets from the primary (DS36, stage 7). */
    primaryFgDelta: { l: number; c: number; h: number };
    bg: OklchColor;
    /** Text color: L added to the page background (chroma 0). */
    fgLDelta: number;
    /** Accent color; the focus ring uses it (DS35). */
    accent: OklchColor;
    /** Neutral layers: L added to the page background (DS35). */
    popoverLDelta: number;
    /** Border of floating surfaces: L added to the popover color (opaque). */
    popoverBorderLDelta: number;
    cardLDelta: number;
    inputLDelta: number;
    secondaryLDelta: number;
    secondaryHoverLDelta: number;
    borderLDelta: number;
    actionLDelta: number;
    actionHoverLDelta: number;
  };
  dark: {
    primary: OklchColor;
    /** Text on the primary: offsets from the primary (DS36, stage 7). */
    primaryFgDelta: { l: number; c: number; h: number };
    bg: OklchColor;
    /** Text color: L added to the page background (chroma 0). */
    fgLDelta: number;
    /** Accent color; the focus ring uses it (DS35). */
    accent: OklchColor;
    /** Neutral layers: L added to the page background (DS35). */
    popoverLDelta: number;
    /** Border of floating surfaces: L added to the popover color (opaque). */
    popoverBorderLDelta: number;
    cardLDelta: number;
    inputLDelta: number;
    secondaryLDelta: number;
    secondaryHoverLDelta: number;
    borderLDelta: number;
    actionLDelta: number;
    actionHoverLDelta: number;
  };
};

/** A value written once for light and once for dark (DS36). */
export type ModePair<T> = { light: T; dark: T };

export type PhaseSlug =
  "idea" | "do" | "doing" | "review" | "done" | "finished";

export type CategorySlug =
  | "ads"
  | "capture"
  | "carousel"
  | "design"
  | "dev"
  | "finance"
  | "meeting"
  | "post"
  | "print"
  | "reels"
  | "sm"
  | "stories"
  | "todo";

/** A state color: the fill (`color`) and the text drawn on the page (`text`). */
export type StateColor = {
  color: ModePair<OklchColor>;
  text: ModePair<OklchColor>;
};

/** Colors shared by every palette (DS36): states, phases and categories. */
export type SharedColors = {
  states: {
    error: StateColor;
    warning: StateColor;
    success: StateColor;
    info: StateColor;
    /** Percent of the state color mixed into the page background (alert fill). */
    backgroundMix: ModePair<number>;
    /** Strong success (white text): fixed lightness and chroma, with hover. */
    successStrong: { l: number; c: number; hoverL: number; hoverC: number };
  };
  /** Shadow of menus, dialogs and cards: one formula (DS29, stage 4). */
  shadow: {
    /** Percent of the primary mixed into the page background. */
    mix: ModePair<number>;
    /** Lightness the mixed color is darkened to. */
    l: ModePair<number>;
    /** Opacity of the largest shadow, percent (the others are proportional). */
    alpha: ModePair<number>;
  };
  /** Shadow of a late card (action late): error color, deeper in dark. */
  lateShadow: {
    light: { alpha: number; alphaHover: number };
    dark: { l: number; c: number; alpha: number; alphaHover: number };
  };
  /** Text of the marker (highlight): L delta from Atenção, and C (DS36, stage 6). */
  markerText: { lDelta: ModePair<number>; c: number };
  /** Formulas of the neutrals and states (DS36, stage 3). */
  formulas: {
    /** Secondary text: L and C deltas from the page background. */
    support: { lDelta: ModePair<number>; cDelta: ModePair<number> };
    /** Primary on hover: percent of the page background mixed into it. */
    primaryHoverMix: ModePair<number>;
    /** Focus halo: percent of the focus ring color. */
    ringHaloAlpha: ModePair<number>;
    /** Halo of the strong success button on focus: percent of the strong success color. */
    successStrongHaloAlpha: ModePair<number>;
    /** Loading skeleton: percent of the text color over the surface. */
    skeletonAlpha: ModePair<number>;
    /** Late action card: opacity (percent) of the Erro background at rest; on hover it is full. */
    lateBgAlpha: ModePair<number>;
    /** Action card: strength (percent of the shadow color) of the ring, the resting shadow and the hover shadow. */
    actionCard: {
      ringAlpha: ModePair<number>;
      shadowAlpha: ModePair<number>;
      hoverShadowAlpha: ModePair<number>;
    };
    /** Top highlight of the action card: percent of white. */
    topHighlightAlpha: ModePair<number>;
    /** Category icon: fill and stroke opacity of the category color, and the chroma kept (0–1). */
    categoryIcon: {
      fillAlpha: ModePair<number>;
      strokeAlpha: ModePair<number>;
      chroma: ModePair<number>;
    };
    /** Phase derivations: soft (suave) and vivid (vivo) cards (DS36, stage 5). */
    phase: {
      /** Soft card: percent of the phase color mixed into the background. */
      mix: ModePair<number>;
      /** Soft card on hover (percent). */
      mixHover: ModePair<number>;
      /** Focus ring alpha of the card (percent). */
      ringAlpha: ModePair<number>;
      /** Text of the soft card: L and C of the phase color. */
      textL: ModePair<number>;
      textC: ModePair<number>;
      /** Hover shadow of the soft card: L and C, and the alpha (percent). */
      shadowL: ModePair<number>;
      shadowC: ModePair<number>;
      shadowAlpha: ModePair<number>;
      /** Diffuse glow under the soft card (dark only): L, C and alpha (percent). */
      diffuseL: number;
      diffuseC: number;
      diffuseAlpha: number;
      /** Ink of the vivid card: L and C; the light-ink variant. */
      inkL: number;
      inkC: number;
      inkLightL: number;
      inkLightC: number;
      /** Vivid card hover: lightness change. */
      hoverDl: number;
      /** Vivid card edge: lightness change (light, dark). */
      edgeDl: ModePair<number>;
      /** Top light of the vivid card, percent of white (light, dark). */
      topLight: ModePair<number>;
      /** Dim fill of the vivid card (dark, "dim" mode): L and C factor. */
      dimL: number;
      dimCFactor: number;
      /** Shadow of the vivid card (hover): L, C and alpha (percent). */
      vividShadowL: number;
      vividShadowC: number;
      vividShadowAlpha: number;
      /** Vivid card hover: chroma lost (hover fill gets lighter and a bit less saturated). */
      hoverCLoss: number;
      /** Opacity of the date on the vivid card (percent). */
      dateOpacity: number;
      /** Diffuse glow (dark only): vertical offset, blur and spread, in px. */
      diffuseY: number;
      diffuseBlur: number;
      diffuseSpread: number;
    };
  };
  phases: Record<PhaseSlug, OklchColor>;
  categories: Record<CategorySlug, OklchColor>;
};

export const PALLETE: PaletteConfig[] = [
  {
    id: "default",
    label: "Ônix",
    relief: true,
    light: {
      primary: {
        h: 0,
        c: 0,
        l: 0,
      },
      primaryFgDelta: { l: 1, c: 0, h: 0 },
      bg: {
        h: 200,
        c: 0.002,
        l: 0.96,
      },
      fgLDelta: -0.96,
      popoverLDelta: 0.02,
      popoverBorderLDelta: -0.049,
      cardLDelta: -0.02,
      inputLDelta: -0.04,
      secondaryLDelta: -0.06,
      secondaryHoverLDelta: -0.08,
      borderLDelta: -0.09,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.1,
      accent: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 0,
        c: 0,
        l: 1,
      },
      primaryFgDelta: { l: -1, c: 0, h: 0 },
      bg: {
        h: 250,
        c: 0.01,
        l: 0.2,
      },
      fgLDelta: 0.8,
      popoverLDelta: -0.03,
      popoverBorderLDelta: 0.083,
      cardLDelta: 0.05,
      inputLDelta: -0.06,
      secondaryLDelta: 0.12,
      secondaryHoverLDelta: 0.15,
      borderLDelta: 0.15,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      accent: {
        h: 0,
        c: 0,
        l: 1,
      },
    },
  },
  {
    id: "carbon",
    label: "Carbono",
    relief: false,
    light: {
      primary: {
        h: 240,
        c: 0.02,
        l: 0.3,
      },
      primaryFgDelta: { l: 0.7, c: -0.02, h: 120 },
      bg: {
        h: 0,
        c: 0,
        l: 1,
      },
      fgLDelta: -1.0,
      popoverLDelta: 0.02,
      popoverBorderLDelta: -0.05,
      cardLDelta: -0.02,
      inputLDelta: -0.04,
      secondaryLDelta: -0.06,
      secondaryHoverLDelta: -0.08,
      borderLDelta: -0.09,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.1,
      accent: {
        h: 240,
        c: 0.02,
        l: 0.3,
      },
    },
    dark: {
      primary: {
        h: 240,
        c: 0.01,
        l: 0.99,
      },
      primaryFgDelta: { l: -0.69, c: 0.01, h: 0 },
      bg: {
        h: 240,
        c: 0.015,
        l: 0.25,
      },
      fgLDelta: 0.75,
      popoverLDelta: -0.03,
      popoverBorderLDelta: 0.078,
      cardLDelta: 0.05,
      inputLDelta: -0.06,
      secondaryLDelta: 0.12,
      secondaryHoverLDelta: 0.15,
      borderLDelta: 0.15,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      accent: {
        h: 240,
        c: 0.01,
        l: 0.99,
      },
    },
  },
  {
    id: "red",
    label: "Rubi",
    light: {
      primary: {
        h: 20,
        c: 0.25,
        l: 0.62,
      },
      primaryFgDelta: { l: 0.38, c: -0.25, h: -20 },
      bg: {
        h: 0,
        c: 0,
        l: 0.98,
      },
      fgLDelta: -0.98,
      popoverLDelta: 0.02,
      popoverBorderLDelta: -0.05,
      cardLDelta: -0.02,
      inputLDelta: -0.04,
      secondaryLDelta: -0.06,
      secondaryHoverLDelta: -0.08,
      borderLDelta: -0.09,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.1,
      accent: {
        h: 20,
        c: 0.25,
        l: 0.62,
      },
    },
    dark: {
      primary: {
        h: 20,
        c: 0.25,
        l: 0.68,
      },
      primaryFgDelta: { l: 0.32, c: -0.25, h: -20 },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fgLDelta: 0.9,
      popoverLDelta: 0.03,
      popoverBorderLDelta: 0.083,
      cardLDelta: 0.05,
      inputLDelta: 0.06,
      secondaryLDelta: 0.2,
      secondaryHoverLDelta: 0.15,
      borderLDelta: 0.15,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      accent: {
        h: 20,
        c: 0.25,
        l: 0.68,
      },
    },
  },
  {
    id: "orange",
    label: "Coral",
    light: {
      primary: {
        h: 25,
        c: 0.18,
        l: 0.65,
      },
      primaryFgDelta: { l: 0.35, c: -0.18, h: -25 },
      bg: {
        h: 130,
        c: 0.01,
        l: 0.95,
      },
      fgLDelta: -0.95,
      popoverLDelta: 0.02,
      popoverBorderLDelta: -0.049,
      cardLDelta: -0.02,
      inputLDelta: -0.04,
      secondaryLDelta: -0.06,
      secondaryHoverLDelta: -0.08,
      borderLDelta: -0.09,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.1,
      accent: {
        h: 25,
        c: 0.18,
        l: 0.65,
      },
    },
    dark: {
      primary: {
        h: 25,
        c: 0.18,
        l: 0.65,
      },
      primaryFgDelta: { l: 0.25, c: -0.16, h: 105 },
      bg: {
        h: 190,
        c: 0.01,
        l: 0.25,
      },
      fgLDelta: 0.7,
      popoverLDelta: -0.03,
      popoverBorderLDelta: 0.073,
      cardLDelta: 0.05,
      inputLDelta: -0.06,
      secondaryLDelta: 0.12,
      secondaryHoverLDelta: 0.15,
      borderLDelta: 0.15,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      accent: {
        h: 25,
        c: 0.18,
        l: 0.65,
      },
    },
  },
  {
    id: "yellow",
    label: "Damasco",
    light: {
      primary: {
        h: 100,
        c: 0.5,
        l: 0.8,
      },
      primaryFgDelta: { l: -0.8, c: -0.5, h: -100 },
      bg: {
        h: 0,
        c: 0,
        l: 0.98,
      },
      fgLDelta: -0.98,
      popoverLDelta: 0.02,
      popoverBorderLDelta: -0.05,
      cardLDelta: -0.02,
      inputLDelta: -0.04,
      secondaryLDelta: -0.06,
      secondaryHoverLDelta: -0.08,
      borderLDelta: -0.09,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.1,
      accent: {
        h: 100,
        c: 0.5,
        l: 0.8,
      },
    },
    dark: {
      primary: {
        h: 100,
        c: 0.4,
        l: 0.8,
      },
      primaryFgDelta: { l: -0.8, c: -0.4, h: -100 },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fgLDelta: 0.859,
      popoverLDelta: -0.03,
      popoverBorderLDelta: 0.089,
      cardLDelta: 0.05,
      inputLDelta: -0.06,
      secondaryLDelta: 0.12,
      secondaryHoverLDelta: 0.15,
      borderLDelta: 0.15,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      accent: {
        h: 100,
        c: 0.4,
        l: 0.8,
      },
    },
  },
  {
    id: "energy",
    label: "Elétrico",
    light: {
      primary: {
        h: 120,
        c: 0.15,
        l: 0.94,
      },
      primaryFgDelta: { l: -0.94, c: -0.15, h: -120 },
      bg: {
        h: 240,
        c: 0.004,
        l: 0.96,
      },
      fgLDelta: -0.96,
      popoverLDelta: 0.02,
      popoverBorderLDelta: -0.049,
      cardLDelta: -0.02,
      inputLDelta: -0.04,
      secondaryLDelta: -0.06,
      secondaryHoverLDelta: -0.08,
      borderLDelta: -0.09,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.1,
      accent: {
        h: 120,
        c: 0.15,
        l: 0.94,
      },
    },
    dark: {
      primary: {
        h: 120,
        c: 0.18,
        l: 0.9,
      },
      primaryFgDelta: { l: -0.9, c: -0.18, h: -120 },
      bg: {
        h: 250,
        c: 0.01,
        l: 0.2,
      },
      fgLDelta: 0.8,
      popoverLDelta: -0.03,
      popoverBorderLDelta: 0.083,
      cardLDelta: 0.05,
      inputLDelta: -0.06,
      secondaryLDelta: 0.12,
      secondaryHoverLDelta: 0.15,
      borderLDelta: 0.15,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      accent: {
        h: 120,
        c: 0.18,
        l: 0.9,
      },
    },
  },
  {
    id: "cyan",
    label: "Turquesa",
    light: {
      primary: {
        h: 200,
        c: 0.12,
        l: 0.7,
      },
      primaryFgDelta: { l: 0.3, c: -0.12, h: 160 },
      bg: {
        h: 260,
        c: 0.005,
        l: 0.98,
      },
      fgLDelta: -0.98,
      popoverLDelta: 0.02,
      popoverBorderLDelta: -0.05,
      cardLDelta: -0.02,
      inputLDelta: -0.04,
      secondaryLDelta: -0.06,
      secondaryHoverLDelta: -0.08,
      borderLDelta: -0.09,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.1,
      accent: {
        h: 200,
        c: 0.12,
        l: 0.7,
      },
    },
    dark: {
      primary: {
        h: 200,
        c: 0.15,
        l: 0.6,
      },
      primaryFgDelta: { l: 0.3, c: -0.13, h: 0 },
      bg: {
        h: 290,
        c: 0.05,
        l: 0.2,
      },
      fgLDelta: 0.8,
      popoverLDelta: -0.03,
      popoverBorderLDelta: 0.083,
      cardLDelta: 0.05,
      inputLDelta: -0.06,
      secondaryLDelta: 0.12,
      secondaryHoverLDelta: 0.15,
      borderLDelta: 0.15,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      accent: {
        h: 200,
        c: 0.15,
        l: 0.6,
      },
    },
  },
  {
    id: "blue",
    label: "Cobalto",
    relief: false,
    light: {
      primary: {
        h: 264,
        c: 0.31,
        l: 0.45,
      },
      primaryFgDelta: { l: 0.55, c: -0.31, h: 96 },
      bg: {
        h: 0,
        c: 0,
        l: 1,
      },
      fgLDelta: -1.0,
      popoverLDelta: 0.02,
      popoverBorderLDelta: -0.05,
      cardLDelta: -0.02,
      inputLDelta: -0.04,
      secondaryLDelta: -0.06,
      secondaryHoverLDelta: -0.08,
      borderLDelta: -0.09,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.1,
      accent: {
        h: 264,
        c: 0.31,
        l: 0.45,
      },
    },
    dark: {
      primary: {
        h: 264,
        c: 0.31,
        l: 0.58,
      },
      primaryFgDelta: { l: 0.42, c: -0.31, h: 96 },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fgLDelta: 0.859,
      popoverLDelta: -0.03,
      popoverBorderLDelta: 0.089,
      cardLDelta: 0.05,
      inputLDelta: -0.06,
      secondaryLDelta: 0.12,
      secondaryHoverLDelta: 0.15,
      borderLDelta: 0.15,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      accent: {
        h: 264,
        c: 0.31,
        l: 0.58,
      },
    },
  },
  {
    id: "purple",
    label: "Violeta",
    light: {
      primary: {
        h: 290,
        c: 0.28,
        l: 0.54,
      },
      primaryFgDelta: { l: 0.46, c: -0.28, h: 70 },
      bg: {
        h: 0,
        c: 0,
        l: 1,
      },
      fgLDelta: -1.0,
      popoverLDelta: 0.02,
      popoverBorderLDelta: -0.05,
      cardLDelta: -0.02,
      inputLDelta: -0.04,
      secondaryLDelta: -0.06,
      secondaryHoverLDelta: -0.08,
      borderLDelta: -0.09,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.1,
      accent: {
        h: 290,
        c: 0.28,
        l: 0.54,
      },
    },
    dark: {
      primary: {
        h: 290,
        c: 0.28,
        l: 0.68,
      },
      primaryFgDelta: { l: 0.32, c: -0.28, h: 70 },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fgLDelta: 0.859,
      popoverLDelta: -0.03,
      popoverBorderLDelta: 0.089,
      cardLDelta: 0.05,
      inputLDelta: 0.07,
      secondaryLDelta: 0.12,
      secondaryHoverLDelta: 0.15,
      borderLDelta: 0.15,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      accent: {
        h: 290,
        c: 0.28,
        l: 0.68,
      },
    },
  },
  {
    id: "magenta",
    label: "Fúcsia",
    light: {
      primary: {
        h: 350,
        c: 0.4,
        l: 0.9,
      },
      primaryFgDelta: { l: -0.9, c: -0.4, h: 10 },
      bg: {
        h: 320,
        c: 0.02,
        l: 0.98,
      },
      fgLDelta: -0.98,
      popoverLDelta: 0.02,
      popoverBorderLDelta: -0.05,
      cardLDelta: -0.02,
      inputLDelta: -0.04,
      secondaryLDelta: -0.06,
      secondaryHoverLDelta: -0.08,
      borderLDelta: -0.09,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.1,
      accent: {
        h: 350,
        c: 0.4,
        l: 0.9,
      },
    },
    dark: {
      primary: {
        h: 350,
        c: 0.4,
        l: 0.8,
      },
      primaryFgDelta: { l: -0.8, c: -0.4, h: 10 },
      bg: {
        h: 340,
        c: 0.1,
        l: 0.3,
      },
      fgLDelta: 0.7,
      popoverLDelta: -0.03,
      popoverBorderLDelta: 0.073,
      cardLDelta: 0.05,
      inputLDelta: -0.06,
      secondaryLDelta: 0.12,
      secondaryHoverLDelta: 0.15,
      borderLDelta: 0.15,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      accent: {
        h: 350,
        c: 0.4,
        l: 0.8,
      },
    },
  },
];

/** Id of the fallback palette (Ônix). */
export const DEFAULT_PALETTE_ID = PALLETE[0].id;

/** Position of a palette in PALLETE, or -1 when the id does not exist. */
export function getPaletteIndexById(id: unknown): number {
  return typeof id === "string" ? PALLETE.findIndex((p) => p.id === id) : -1;
}

/** Palette with the given id, or undefined when it does not exist. */
export function getPaletteById(id: unknown): PaletteConfig | undefined {
  const index = getPaletteIndexById(id);
  return index === -1 ? undefined : PALLETE[index];
}

/**
 * Colors shared by every palette (DS36). Values are the ones the app used
 * before the block existed: states from tailwind.css, phases and categories
 * converted from the hex codes of CONSTANTS.ts (L 3 decimals, C 3, H 1; the
 * five colors whose hex does not come back exact keep more decimals).
 */
export const SHARED_COLORS: SharedColors = {
  states: {
    error: {
      color: {
        light: { h: 16, c: 0.16, l: 0.65 },
        dark: { h: 16, c: 0.14, l: 0.72 },
      },
      text: {
        light: { h: 16, c: 0.205, l: 0.52 },
        dark: { h: 16, c: 0.16, l: 0.72 },
      },
    },
    warning: {
      color: {
        light: { h: 80, c: 0.12, l: 0.82 },
        dark: { h: 80, c: 0.12, l: 0.84 },
      },
      text: {
        light: { h: 80, c: 0.1, l: 0.51 },
        dark: { h: 80, c: 0.14, l: 0.84 },
      },
    },
    success: {
      color: {
        light: { h: 163, c: 0.11, l: 0.65 },
        dark: { h: 163, c: 0.1, l: 0.75 },
      },
      text: {
        light: { h: 163, c: 0.1, l: 0.495 },
        dark: { h: 163, c: 0.15, l: 0.75 },
      },
    },
    info: {
      color: {
        light: { h: 250, c: 0.12, l: 0.65 },
        dark: { h: 250, c: 0.12, l: 0.75 },
      },
      text: {
        light: { h: 250, c: 0.14, l: 0.505 },
        dark: { h: 250, c: 0.12, l: 0.75 },
      },
    },
    backgroundMix: { light: 10, dark: 30 },
    successStrong: { l: 0.53, c: 0.105, hoverL: 0.4, hoverC: 0.09 },
  },
  shadow: {
    mix: { light: 30, dark: 20 },
    l: { light: 0.15, dark: 0.15 },
    alpha: { light: 10, dark: 70 },
  },
  lateShadow: {
    light: { alpha: 25, alphaHover: 30 },
    dark: { l: 0.45, c: 0.18, alpha: 50, alphaHover: 60 },
  },
  markerText: { lDelta: { light: -0.57, dark: -0.59 }, c: 0.03 },
  formulas: {
    support: {
      lDelta: { light: -0.512, dark: 0.549 },
      cDelta: { light: -0.001, dark: -0.007 },
    },
    primaryHoverMix: { light: 20, dark: 20 },
    ringHaloAlpha: { light: 30, dark: 30 },
    successStrongHaloAlpha: { light: 30, dark: 30 },
    skeletonAlpha: { light: 5, dark: 5 },
    lateBgAlpha: { light: 70, dark: 70 },
    actionCard: {
      ringAlpha: { light: 5, dark: 20 },
      shadowAlpha: { light: 14, dark: 35 },
      hoverShadowAlpha: { light: 18, dark: 50 },
    },
    topHighlightAlpha: { light: 100, dark: 10 },
    categoryIcon: {
      fillAlpha: { light: 10, dark: 25 },
      strokeAlpha: { light: 70, dark: 70 },
      chroma: { light: 0.7, dark: 0.7 },
    },
    phase: {
      mix: { light: 15, dark: 40 },
      mixHover: { light: 30, dark: 70 },
      ringAlpha: { light: 30, dark: 55 },
      textL: { light: 0.35, dark: 0.92 },
      textC: { light: 0.07, dark: 0.06 },
      shadowL: { light: 0.6, dark: 0.33 },
      shadowC: { light: 0.15, dark: 0.1 },
      shadowAlpha: { light: 25, dark: 20 },
      diffuseL: 0.2,
      diffuseC: 0.15,
      diffuseAlpha: 63,
      inkL: 0.35,
      inkC: 0.07,
      inkLightL: 0.98,
      inkLightC: 0.025,
      hoverDl: 0.1,
      edgeDl: { light: 0.06, dark: 0.14 },
      topLight: { light: 45, dark: 25 },
      dimL: 0.72,
      dimCFactor: 0.8,
      vividShadowL: 0.55,
      vividShadowC: 0.16,
      vividShadowAlpha: 40,
      hoverCLoss: 0.01,
      dateOpacity: 85,
      diffuseY: 14,
      diffuseBlur: 30,
      diffuseSpread: -4,
    },
  },
  phases: {
    idea: { h: 84.43, c: 0.1644, l: 0.8369 },
    do: { h: 47.6, c: 0.1867, l: 0.7049 },
    doing: { h: 354.3, c: 0.212, l: 0.656 },
    review: { h: 303.9, c: 0.233, l: 0.627 },
    done: { h: 232.7, c: 0.139, l: 0.754 },
    finished: { h: 151.7, c: 0.182, l: 0.8 },
  },
  categories: {
    ads: { h: 248.8, c: 0.184, l: 0.669 },
    capture: { h: 168.29, c: 0.1793, l: 0.8883 },
    carousel: { h: 7.1, c: 0.257, l: 0.641 },
    design: { h: 2.47, c: 0.2603, l: 0.6453 },
    dev: { h: 128.6, c: 0.241, l: 0.914 },
    finance: { h: 147.4, c: 0.167, l: 0.699 },
    meeting: { h: 266.4, c: 0.175, l: 0.509 },
    post: { h: 34.5, c: 0.233, l: 0.656 },
    print: { h: 338.7, c: 0.222, l: 0.595 },
    reels: { h: 307, c: 0.299, l: 0.581 },
    sm: { h: 27.9, c: 0.257, l: 0.629 },
    stories: { h: 121.71, c: 0.1748, l: 0.7934 },
    todo: { h: 254.1, c: 0.202, l: 0.632 },
  },
};

/** CSS `oklch(L C H)` string of a color. */
export function oklchToCss(color: OklchColor): string {
  return `oklch(${color.l} ${color.c} ${color.h})`;
}
