// Paletas de cores OKLCH do UZZINA
// Cada paleta define primary e ring

export type OklchColor = { h: number; c: number; l: number };

export type PaletteConfig = {
  id: string;
  label: string;
  relief?: boolean;
  topBorderColor?: string;
  light: {
    primary: OklchColor;
    primaryFg?: OklchColor;
    bg: OklchColor;
    fg: OklchColor;
    ring: OklchColor;
    cardLDelta?: number;
    borderLDelta?: number;
    inputLDelta?: number;
    actionLDelta?: number;
    actionHoverLDelta?: number;
    popoverLDelta?: number;
    /** Tinted shadow color of the elevated surfaces (OKLCH string). */
    shadowColor: string;
    /** Shadow opacity in percent (1–100) for the largest shadow size. */
    shadowOpacity: number;
    topBorderColor?: string;
  };
  dark: {
    primary: OklchColor;
    primaryFg?: OklchColor;
    bg: OklchColor;
    fg: OklchColor;
    ring: OklchColor;
    cardLDelta?: number;
    borderLDelta?: number;
    inputLDelta?: number;
    actionLDelta?: number;
    actionHoverLDelta?: number;
    popoverLDelta?: number;
    /** Tinted shadow color of the elevated surfaces (OKLCH string). */
    shadowColor: string;
    /** Shadow opacity in percent (1–100) for the largest shadow size. */
    shadowOpacity: number;
    topBorderColor?: string;
  };
};

export const PALLETE: PaletteConfig[] = [
  {
    id: "default",
    label: "Ônix",
    relief: true,
    light: {
      shadowColor: "oklch(0.25 0.01 200)",
      shadowOpacity: 10,
      primary: {
        h: 0,
        c: 0,
        l: 0,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 200,
        c: 0.002,
        l: 0.96,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
      cardLDelta: -0.02,
      borderLDelta: -0.07,
      inputLDelta: -0.04,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.1,
      popoverLDelta: 0.02,
      ring: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      shadowColor: "oklch(0.1 0.01 200)",
      shadowOpacity: 50,
      primary: {
        h: 0,
        c: 0,
        l: 1,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 250,
        c: 0.01,
        l: 0.2,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
      cardLDelta: 0.05,
      borderLDelta: 0.1,
      inputLDelta: 0.02,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      popoverLDelta: -0.03,
      ring: {
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
      shadowColor: "oklch(0.25 0 0)",
      shadowOpacity: 10,
      primary: {
        h: 240,
        c: 0.02,
        l: 0.3,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 0,
        c: 0,
        l: 1,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
      cardLDelta: -0.04,
      borderLDelta: -0.04,
      inputLDelta: -0.02,
      actionLDelta: -0.02,
      actionHoverLDelta: -0.005,
      popoverLDelta: 0.1,
      ring: {
        h: 240,
        c: 0.02,
        l: 0.3,
      },
    },
    dark: {
      shadowColor: "oklch(0.1 0 0)",
      shadowOpacity: 40,
      primary: {
        h: 240,
        c: 0.01,
        l: 0.99,
      },
      primaryFg: {
        h: 240,
        c: 0.02,
        l: 0.3,
      },
      bg: {
        h: 240,
        c: 0.015,
        l: 0.25,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
      cardLDelta: 0.05,
      borderLDelta: 0.1,
      inputLDelta: 0.04,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      popoverLDelta: -0.03,
      ring: {
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
      shadowColor: "oklch(0.25 0.04 20)",
      shadowOpacity: 10,
      primary: {
        h: 20,
        c: 0.25,
        l: 0.62,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 0,
        c: 0,
        l: 0.98,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
      cardLDelta: -0.02,
      borderLDelta: -0.05,
      inputLDelta: -0.02,
      actionLDelta: 0.04,
      actionHoverLDelta: 0.06,
      popoverLDelta: 0.06,
      ring: {
        h: 20,
        c: 0.25,
        l: 0.62,
      },
    },
    dark: {
      shadowColor: "oklch(0.03 0 0)",
      shadowOpacity: 70,
      primary: {
        h: 20,
        c: 0.25,
        l: 0.68,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
      cardLDelta: 0.05,
      borderLDelta: 0.2,
      inputLDelta: 0.02,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      popoverLDelta: -0.03,
      ring: {
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
      shadowColor: "oklch(0.25 0.05 140)",
      shadowOpacity: 10,
      primary: {
        h: 25,
        c: 0.18,
        l: 0.65,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 130,
        c: 0.01,
        l: 0.95,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
      cardLDelta: -0.02,
      borderLDelta: -0.05,
      inputLDelta: -0.02,
      actionLDelta: 0.02,
      actionHoverLDelta: 1,
      popoverLDelta: 0.03,
      ring: {
        h: 25,
        c: 0.18,
        l: 0.65,
      },
    },
    dark: {
      shadowColor: "oklch(0.1 0.03 140)",
      shadowOpacity: 25,
      primary: {
        h: 25,
        c: 0.18,
        l: 0.65,
      },
      primaryFg: {
        h: 130,
        c: 0.02,
        l: 0.9,
      },
      bg: {
        h: 190,
        c: 0.01,
        l: 0.25,
      },
      fg: {
        h: 130,
        c: 0.01,
        l: 0.95,
      },
      cardLDelta: 0.05,
      borderLDelta: 0.1,
      inputLDelta: -0.02,
      actionLDelta: 0.07,
      actionHoverLDelta: 0.2,
      popoverLDelta: -0.03,
      ring: {
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
      shadowColor: "oklch(0.25 0.04 100)",
      shadowOpacity: 10,
      primary: {
        h: 100,
        c: 0.5,
        l: 0.8,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 0,
        c: 0,
        l: 0.98,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
      cardLDelta: -0.02,
      borderLDelta: -0.05,
      inputLDelta: -0.02,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.04,
      popoverLDelta: 0,
      ring: {
        h: 100,
        c: 0.5,
        l: 0.8,
      },
    },
    dark: {
      shadowColor: "oklch(0.03 0 100)",
      shadowOpacity: 70,
      primary: {
        h: 100,
        c: 0.4,
        l: 0.8,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
      cardLDelta: 0.05,
      borderLDelta: 0.2,
      inputLDelta: 0.02,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      popoverLDelta: -0.03,
      ring: {
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
      shadowColor: "oklch(0.25 0.04 120)",
      shadowOpacity: 10,
      primary: {
        h: 120,
        c: 0.15,
        l: 0.94,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 240,
        c: 0.004,
        l: 0.96,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
      cardLDelta: -0.03,
      borderLDelta: -0.05,
      inputLDelta: -0.02,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.04,
      popoverLDelta: 0,
      ring: {
        h: 120,
        c: 0.15,
        l: 0.94,
      },
    },
    dark: {
      shadowColor: "oklch(0.1 0.03 120)",
      shadowOpacity: 60,
      primary: {
        h: 120,
        c: 0.18,
        l: 0.9,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 250,
        c: 0.01,
        l: 0.2,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
      cardLDelta: 0.05,
      borderLDelta: 0.2,
      inputLDelta: 0.02,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      popoverLDelta: -0.03,
      ring: {
        h: 120,
        c: 0.18,
        l: 0.9,
      },
    },
  },
  {
    id: "green",
    label: "Folha",
    light: {
      shadowColor: "oklch(0.25 0.04 130)",
      shadowOpacity: 10,
      primary: {
        h: 130,
        c: 0.2,
        l: 0.7,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 0,
        c: 0,
        l: 0.98,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
      cardLDelta: -0.02,
      borderLDelta: -0.05,
      inputLDelta: -0.02,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.04,
      popoverLDelta: 0,
      ring: {
        h: 130,
        c: 0.2,
        l: 0.7,
      },
    },
    dark: {
      shadowColor: "oklch(0.1 0.03 130)",
      shadowOpacity: 50,
      primary: {
        h: 130,
        c: 0.2,
        l: 0.65,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
      cardLDelta: 0.05,
      borderLDelta: 0.2,
      inputLDelta: 0.02,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      popoverLDelta: -0.03,
      ring: {
        h: 130,
        c: 0.2,
        l: 0.65,
      },
    },
  },
  {
    id: "cyan",
    label: "Turquesa",
    light: {
      shadowColor: "oklch(0.25 0.04 200)",
      shadowOpacity: 10,
      primary: {
        h: 200,
        c: 0.2,
        l: 0.7,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 0,
        c: 0,
        l: 0.96,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
      cardLDelta: -0.02,
      borderLDelta: -0.05,
      inputLDelta: -0.02,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.04,
      popoverLDelta: 0,
      ring: {
        h: 200,
        c: 0.2,
        l: 0.7,
      },
    },
    dark: {
      shadowColor: "oklch(0.1 0.03 200)",
      shadowOpacity: 50,
      primary: {
        h: 200,
        c: 0.2,
        l: 0.65,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
      cardLDelta: 0.05,
      borderLDelta: 0.2,
      inputLDelta: 0.02,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      popoverLDelta: -0.03,
      ring: {
        h: 200,
        c: 0.2,
        l: 0.65,
      },
    },
  },
  {
    id: "blue",
    label: "Cobalto",
    relief: false,
    light: {
      shadowColor: "oklch(0.25 0.04 264)",
      shadowOpacity: 10,
      primary: {
        h: 264,
        c: 0.31,
        l: 0.45,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 0,
        c: 0,
        l: 1,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
      cardLDelta: -0.02,
      borderLDelta: -0.05,
      inputLDelta: -0.02,
      actionLDelta: -0.03,
      actionHoverLDelta: -0.015,
      popoverLDelta: 0.1,
      ring: {
        h: 264,
        c: 0.31,
        l: 0.45,
      },
    },
    dark: {
      shadowColor: "oklch(0.1 0.03 264)",
      shadowOpacity: 50,
      primary: {
        h: 264,
        c: 0.31,
        l: 0.58,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
      cardLDelta: 0.05,
      borderLDelta: 0.2,
      inputLDelta: 0.02,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      popoverLDelta: -0.03,
      ring: {
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
      shadowColor: "oklch(0.25 0.04 290)",
      shadowOpacity: 10,
      primary: {
        h: 290,
        c: 0.28,
        l: 0.54,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 0,
        c: 0,
        l: 1,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
      cardLDelta: -0.02,
      borderLDelta: -0.1,
      inputLDelta: -0.02,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.04,
      popoverLDelta: 0,
      ring: {
        h: 290,
        c: 0.28,
        l: 0.54,
      },
    },
    dark: {
      shadowColor: "oklch(0.1 0.03 290)",
      shadowOpacity: 50,
      primary: {
        h: 290,
        c: 0.28,
        l: 0.68,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
      cardLDelta: 0.05,
      borderLDelta: 0.2,
      inputLDelta: 0.02,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      popoverLDelta: -0.03,
      ring: {
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
      shadowColor: "oklch(0.25 0.15 350)",
      shadowOpacity: 10,
      primary: {
        h: 350,
        c: 0.4,
        l: 0.9,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 320,
        c: 0.02,
        l: 0.98,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
      cardLDelta: -0.02,
      borderLDelta: -0.05,
      inputLDelta: -0.02,
      actionLDelta: 0.02,
      actionHoverLDelta: 0.04,
      popoverLDelta: 0,
      ring: {
        h: 350,
        c: 0.4,
        l: 0.9,
      },
    },
    dark: {
      shadowColor: "oklch(0.1 0.1 340)",
      shadowOpacity: 25,
      primary: {
        h: 350,
        c: 0.4,
        l: 0.8,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 340,
        c: 0.1,
        l: 0.3,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
      cardLDelta: 0.05,
      borderLDelta: 0.2,
      inputLDelta: 0.02,
      actionLDelta: 0.1,
      actionHoverLDelta: 0.2,
      popoverLDelta: -0.03,
      ring: {
        h: 350,
        c: 0.4,
        l: 0.8,
      },
    },
  },
];
