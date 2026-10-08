import {
  deriveAccentFg,
  deriveDarkAccent,
  deriveDarkBg,
  deriveDarkFg,
} from "~/utils/color";
import type { CustomTheme, CustomThemeColors } from "./preferences";

export type ThemeMode = "light" | "dark";
export type ThemeColorKey = keyof CustomThemeColors;

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
};

/** Starts the profile editor from the saved custom theme or the defaults. */
export function createCustomThemeDraft(saved: CustomTheme | null): CustomTheme {
  return {
    light: {
      primaryHex: saved?.light.primaryHex || DEFAULT_CUSTOM_THEME.light.primaryHex,
      primaryFgHex: saved?.light.primaryFgHex || DEFAULT_CUSTOM_THEME.light.primaryFgHex,
      bgHex: saved?.light.bgHex || DEFAULT_CUSTOM_THEME.light.bgHex,
      fgHex: saved?.light.fgHex || DEFAULT_CUSTOM_THEME.light.fgHex,
    },
    dark: {
      primaryHex: saved?.dark.primaryHex || DEFAULT_CUSTOM_THEME.dark.primaryHex,
      primaryFgHex: saved?.dark.primaryFgHex || DEFAULT_CUSTOM_THEME.dark.primaryFgHex,
      bgHex: saved?.dark.bgHex || DEFAULT_CUSTOM_THEME.dark.bgHex,
      fgHex: saved?.dark.fgHex || DEFAULT_CUSTOM_THEME.dark.fgHex,
    },
  };
}

/**
 * Applies one color edit. Light-mode accent, background and text also derive
 * their dark-mode counterparts; the dark accent derives its own foreground.
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
      light.primaryFgHex = deriveAccentFg(value);
      dark.primaryHex = deriveDarkAccent(value);
      dark.primaryFgHex = deriveAccentFg(dark.primaryHex);
    } else if (key === "bgHex") {
      dark.bgHex = deriveDarkBg(value);
    } else if (key === "fgHex") {
      dark.fgHex = deriveDarkFg(value);
    }
  } else {
    dark[key] = value;
    if (key === "primaryHex") {
      dark.primaryFgHex = deriveAccentFg(value);
    }
  }
  return { light, dark };
}

export function isCompleteCustomTheme(theme: CustomTheme): boolean {
  return [...Object.values(theme.light), ...Object.values(theme.dark)].every(
    Boolean,
  );
}
