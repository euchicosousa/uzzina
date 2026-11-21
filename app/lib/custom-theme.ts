import {
  deriveDarkBg,
  deriveDarkFg,
  deriveDarkPrimary,
  derivePrimaryFg,
} from "~/utils/color";
import { PALLETE, type PaletteConfig } from "./palettes";
import type { PaletteVars } from "./palette-vars";
import {
  type CustomLayerKey,
  type CustomTheme,
  type CustomThemeColors,
  type CustomThemeLayers,
} from "./preferences";
import { hexToOklch } from "~/utils/color";

export type ThemeMode = "light" | "dark";
export type ThemeColorKey = "primaryHex" | "primaryFgHex" | "bgHex" | "fgHex";
export type CustomThemeOptionKey = "relief" | "topBorderColor";

const DEFAULT_CUSTOM_THEME: CustomTheme = {
  light: {
    primaryHex: "#2640A0",
    primaryFgHex: "#FFFFFF",
    bgHex: "#FFFFFF",
    fgHex: "#000000",
  },
  dark: {
    primaryHex: "#3558DE",
    primaryFgHex: "#FFFFFF",
    bgHex: "#141414",
    fgHex: "#FFFFFF",
  },
  relief: true,
};

/** The Ônix palette (index 0): source of the layer deltas of a new theme. */
const BASE_PALETTE = PALLETE[0];

function layersOf(mode: PaletteConfig["light"]): CustomThemeLayers {
  return {
    popoverLDelta: mode.popoverLDelta,
    cardLDelta: mode.cardLDelta,
    inputLDelta: mode.inputLDelta,
    secondaryLDelta: mode.secondaryLDelta,
    secondaryHoverLDelta: mode.secondaryHoverLDelta,
    borderLDelta: mode.borderLDelta,
    actionLDelta: mode.actionLDelta,
    actionHoverLDelta: mode.actionHoverLDelta,
  };
}

/**
 * The single place where a custom theme gets its missing layer deltas: themes
 * saved before DS36 stage 8 have none, so they read Ônix's (the values they
 * always rendered with).
 */
export function resolveCustomLayers(
  mode: ThemeMode,
  layers: CustomThemeLayers | undefined,
): CustomThemeLayers {
  return layers ?? layersOf(BASE_PALETTE[mode]);
}

/**
 * Builds the complete palette-like object `applyPaletteVars` expects. Every
 * field a palette carries is present, so nothing falls back in CSS.
 */
export function customThemeToPalette(theme: CustomTheme): PaletteVars {
  const build = (mode: ThemeMode) => {
    const colors = theme[mode];
    const base = BASE_PALETTE[mode];
    return {
      ...resolveCustomLayers(mode, colors.layers),
      fgLDelta: base.fgLDelta,
      primaryFgDelta: base.primaryFgDelta,
      primary: hexToOklch(colors.primaryHex),
      primaryFg: hexToOklch(colors.primaryFgHex),
      bg: hexToOklch(colors.bgHex),
      fg: hexToOklch(colors.fgHex),
      // No accent stored: the ring follows the primary color.
      accent: hexToOklch(colors.accentHex ?? colors.primaryHex),
    };
  };
  return { relief: theme.relief, light: build("light"), dark: build("dark") };
}

/** Removes what the database function before DS36 stage 8 rejects. */
export function toLegacyCustomTheme(theme: CustomTheme): CustomTheme {
  const strip = ({
    primaryHex,
    primaryFgHex,
    bgHex,
    fgHex,
  }: CustomThemeColors): CustomThemeColors => ({
    primaryHex,
    primaryFgHex,
    bgHex,
    fgHex,
  });
  return { ...theme, light: strip(theme.light), dark: strip(theme.dark) };
}

/** Starts the profile editor from the saved custom theme or the defaults. */
export function createCustomThemeDraft(saved: CustomTheme | null): CustomTheme {
  return {
    light: {
      primaryHex:
        saved?.light.primaryHex || DEFAULT_CUSTOM_THEME.light.primaryHex,
      primaryFgHex:
        saved?.light.primaryFgHex || DEFAULT_CUSTOM_THEME.light.primaryFgHex,
      bgHex: saved?.light.bgHex || DEFAULT_CUSTOM_THEME.light.bgHex,
      fgHex: saved?.light.fgHex || DEFAULT_CUSTOM_THEME.light.fgHex,
      accentHex: saved?.light.accentHex,
      layers: { ...resolveCustomLayers("light", saved?.light.layers) },
    },
    dark: {
      primaryHex:
        saved?.dark.primaryHex || DEFAULT_CUSTOM_THEME.dark.primaryHex,
      primaryFgHex:
        saved?.dark.primaryFgHex || DEFAULT_CUSTOM_THEME.dark.primaryFgHex,
      bgHex: saved?.dark.bgHex || DEFAULT_CUSTOM_THEME.dark.bgHex,
      fgHex: saved?.dark.fgHex || DEFAULT_CUSTOM_THEME.dark.fgHex,
      accentHex: saved?.dark.accentHex,
      layers: { ...resolveCustomLayers("dark", saved?.dark.layers) },
    },
    relief: saved?.relief ?? DEFAULT_CUSTOM_THEME.relief ?? true,
    topBorderColor: saved?.topBorderColor,
  };
}

/**
 * Applies one color edit. Light-mode primary, background and text also derive
 * their dark-mode counterparts; the dark primary derives its own foreground.
 */
export function applyCustomThemeChange(
  draft: CustomTheme,
  mode: ThemeMode,
  key: ThemeColorKey,
  value: string,
): CustomTheme {
  const light = { ...draft.light };
  const dark = { ...draft.dark };
  if (mode === "light") {
    light[key] = value;
    if (key === "primaryHex") {
      light.primaryFgHex = derivePrimaryFg(value);
      dark.primaryHex = deriveDarkPrimary(value);
      dark.primaryFgHex = derivePrimaryFg(dark.primaryHex);
    } else if (key === "bgHex") {
      dark.bgHex = deriveDarkBg(value);
    } else if (key === "fgHex") {
      dark.fgHex = deriveDarkFg(value);
    }
  } else {
    dark[key] = value;
    if (key === "primaryHex") {
      dark.primaryFgHex = derivePrimaryFg(value);
    }
  }
  return { ...draft, light, dark };
}

/** Sets or clears (undefined) the accent of one mode. */
export function applyCustomThemeAccent(
  draft: CustomTheme,
  mode: ThemeMode,
  value: string | undefined,
): CustomTheme {
  return { ...draft, [mode]: { ...draft[mode], accentHex: value } };
}

/** Sets one neutral layer delta of one mode. */
export function applyCustomThemeLayer(
  draft: CustomTheme,
  mode: ThemeMode,
  key: CustomLayerKey,
  value: number,
): CustomTheme {
  const layers = resolveCustomLayers(mode, draft[mode].layers);
  return {
    ...draft,
    [mode]: { ...draft[mode], layers: { ...layers, [key]: value } },
  };
}

/** Puts the layers of one mode back to the Ônix values. */
export function resetCustomThemeLayers(
  draft: CustomTheme,
  mode: ThemeMode,
): CustomTheme {
  return {
    ...draft,
    [mode]: { ...draft[mode], layers: layersOf(BASE_PALETTE[mode]) },
  };
}

export function applyCustomThemeOption<K extends CustomThemeOptionKey>(
  draft: CustomTheme,
  key: K,
  value: CustomTheme[K],
): CustomTheme {
  return {
    ...draft,
    [key]: value,
  };
}

export function isCompleteCustomTheme(theme: CustomTheme): boolean {
  return [theme.light, theme.dark].every((mode) =>
    [mode.primaryHex, mode.primaryFgHex, mode.bgHex, mode.fgHex].every(Boolean),
  );
}
