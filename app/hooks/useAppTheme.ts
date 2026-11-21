import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  createContext,
  useContext,
} from "react";
import { PALLETE } from "~/lib/palettes";
import { customThemeToPalette } from "~/lib/custom-theme";
import { applyPaletteVars } from "~/lib/palette-vars";
import { hexToOklch } from "~/utils/color";
import { parseCustomModeExtras, type CustomTheme } from "~/lib/preferences";

const STORAGE_KEY = "uzzina-theme-color-index";
const LEGACY_STORAGE_KEY = "uzzina-accent-color-index";
const BACKGROUND_STORAGE_KEY = "uzzina-background-color";

// Chaves para o tema personalizado
const CUSTOM_LIGHT_PRIMARY_KEY = "uzzina-custom-light-primary";
const CUSTOM_LIGHT_PRIMARY_FG_KEY = "uzzina-custom-light-primary-fg";
const CUSTOM_LIGHT_BG_KEY = "uzzina-custom-light-bg";
const CUSTOM_LIGHT_FG_KEY = "uzzina-custom-light-fg";
const CUSTOM_DARK_PRIMARY_KEY = "uzzina-custom-dark-primary";
const CUSTOM_DARK_PRIMARY_FG_KEY = "uzzina-custom-dark-primary-fg";
const CUSTOM_DARK_BG_KEY = "uzzina-custom-dark-bg";
const CUSTOM_DARK_FG_KEY = "uzzina-custom-dark-fg";
const CUSTOM_RELIEF_KEY = "uzzina-custom-relief";
const CUSTOM_TOP_BORDER_COLOR_KEY = "uzzina-custom-top-border-color";
// Accent and layer deltas of both modes (DS36, stage 8), as one JSON value.
const CUSTOM_EXTRAS_KEY = "uzzina-custom-extras";

/**
 * Custom top border of the action cards (the Personalizado theme option). It
 * is written after applyPaletteVars; relief off keeps the transparent border
 * that palette-vars sets.
 */
function applyCustomTopBorder(theme: CustomTheme | null) {
  if (!theme || theme.relief === false) return;
  const root = document.documentElement;
  if (theme.topBorderColor) {
    root.style.setProperty(
      "--action-top-border-override",
      theme.topBorderColor,
    );
    root.style.setProperty(
      "--dark-action-top-border-override",
      theme.topBorderColor,
    );
  } else {
    root.style.removeProperty("--action-top-border-override");
    root.style.removeProperty("--dark-action-top-border-override");
  }
}

function getStoredIndex(): number {
  if (typeof window === "undefined") return 0;
  const saved =
    localStorage.getItem(STORAGE_KEY) ??
    localStorage.getItem(LEGACY_STORAGE_KEY);
  if (saved === null || saved === "") return 0;
  const n = Number(saved);
  return Number.isNaN(n) ? 0 : n;
}

function getStoredBackground(): string {
  if (typeof window === "undefined") return "#FFFFFF";
  return localStorage.getItem(BACKGROUND_STORAGE_KEY) || "#FFFFFF";
}

function getStoredCustomTheme(): CustomTheme | null {
  if (typeof window === "undefined") return null;
  const lp = localStorage.getItem(CUSTOM_LIGHT_PRIMARY_KEY);
  const lpfg = localStorage.getItem(CUSTOM_LIGHT_PRIMARY_FG_KEY) || "#FFFFFF";
  const lbg = localStorage.getItem(CUSTOM_LIGHT_BG_KEY);
  const lfg = localStorage.getItem(CUSTOM_LIGHT_FG_KEY);
  const dp = localStorage.getItem(CUSTOM_DARK_PRIMARY_KEY);
  const dpfg = localStorage.getItem(CUSTOM_DARK_PRIMARY_FG_KEY) || "#FFFFFF";
  const dbg = localStorage.getItem(CUSTOM_DARK_BG_KEY);
  const dfg = localStorage.getItem(CUSTOM_DARK_FG_KEY);
  const reliefStr = localStorage.getItem(CUSTOM_RELIEF_KEY);
  const relief = reliefStr === null ? true : reliefStr !== "false";
  const topBorderColor =
    localStorage.getItem(CUSTOM_TOP_BORDER_COLOR_KEY) || undefined;

  let extras: { light?: unknown; dark?: unknown } = {};
  try {
    const raw: unknown = JSON.parse(
      localStorage.getItem(CUSTOM_EXTRAS_KEY) ?? "null",
    );
    if (raw && typeof raw === "object") extras = raw;
  } catch {
    // Unreadable extras: the theme loads with the Ônix layers.
  }
  const modeExtras = (value: unknown) =>
    value && typeof value === "object" ? parseCustomModeExtras(value) : {};

  if (lp && lbg && lfg && dp && dbg && dfg) {
    return {
      light: {
        primaryHex: lp,
        primaryFgHex: lpfg,
        bgHex: lbg,
        fgHex: lfg,
        ...modeExtras(extras.light),
      },
      dark: {
        primaryHex: dp,
        primaryFgHex: dpfg,
        bgHex: dbg,
        fgHex: dfg,
        ...modeExtras(extras.dark),
      },
      relief,
      topBorderColor,
    };
  }
  return null;
}

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

/** What the user chose; "system" follows the operating system. */
export type ThemePreference = `${Theme}` | "system";

const THEME_KEY = "uzzina-theme";
const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

function parseThemePreference(value: string | null): ThemePreference {
  if (value === Theme.LIGHT || value === Theme.DARK) return value;
  return "system";
}

function getStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  return parseThemePreference(localStorage.getItem(THEME_KEY));
}

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(SYSTEM_DARK_QUERY).matches;
}

/**
 * Hook para gerenciar as cores da marca e o modo de tema (Light/Dark) do aplicativo.
 */
export function useAppTheme(isPublic = false) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    getStoredThemePreference,
  );
  const [systemPrefersDark, setSystemPrefersDark] =
    useState<boolean>(getSystemPrefersDark);
  const isDark =
    themePreference === "system"
      ? systemPrefersDark
      : themePreference === Theme.DARK;
  const theme: Theme = isDark ? Theme.DARK : Theme.LIGHT;
  const [primaryColorIndex, setPrimaryColorIndexState] =
    useState<number>(getStoredIndex);
  const [backgroundColor, setBackgroundColorState] =
    useState<string>("#FFFFFF");
  const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(
    getStoredCustomTheme,
  );

  // Lê o localStorage só no cliente, após a hidratação
  useEffect(() => {
    setThemePreferenceState(getStoredThemePreference());
    setPrimaryColorIndexState(getStoredIndex());
    setBackgroundColorState(getStoredBackground());
    setCustomThemeState(getStoredCustomTheme());
  }, []);

  // Acompanha o modo claro/escuro do sistema operacional em tempo real
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia(SYSTEM_DARK_QUERY);
    const handleChange = (event: { matches: boolean }) =>
      setSystemPrefersDark(event.matches);
    setSystemPrefersDark(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  // Aplica classe no documentElement quando o tema muda
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Sincroniza entre abas e instâncias no mesmo documento
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      const { key, newValue } = event;
      if (key === THEME_KEY) {
        setThemePreferenceState(parseThemePreference(newValue));
      } else if (key === STORAGE_KEY || key === LEGACY_STORAGE_KEY) {
        setPrimaryColorIndexState(
          newValue === null || newValue === "" ? 0 : Number(newValue),
        );
      } else if (key === BACKGROUND_STORAGE_KEY && newValue !== null) {
        setBackgroundColorState(newValue);
      } else if (
        key === CUSTOM_LIGHT_PRIMARY_KEY ||
        key === CUSTOM_LIGHT_PRIMARY_FG_KEY ||
        key === CUSTOM_LIGHT_BG_KEY ||
        key === CUSTOM_LIGHT_FG_KEY ||
        key === CUSTOM_DARK_PRIMARY_KEY ||
        key === CUSTOM_DARK_PRIMARY_FG_KEY ||
        key === CUSTOM_DARK_BG_KEY ||
        key === CUSTOM_DARK_FG_KEY ||
        key === CUSTOM_RELIEF_KEY ||
        key === CUSTOM_TOP_BORDER_COLOR_KEY
      ) {
        setCustomThemeState(getStoredCustomTheme());
      }
    };

    const handleLocalUpdate = () => {
      setThemePreferenceState(getStoredThemePreference());
      setPrimaryColorIndexState(getStoredIndex());
      setBackgroundColorState(getStoredBackground());
      setCustomThemeState(getStoredCustomTheme());
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("uzzina-storage-update", handleLocalUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("uzzina-storage-update", handleLocalUpdate);
    };
  }, []);

  const setTheme = (newTheme: ThemePreference) => {
    localStorage.setItem(THEME_KEY, newTheme);
    setThemePreferenceState(newTheme);
    window.dispatchEvent(new Event("uzzina-storage-update"));
  };

  const previewTheme = (newTheme: Theme) => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
  };

  const selectedPalette = useMemo(() => {
    if (primaryColorIndex === -1 && customTheme) {
      return { label: "Personalizado", ...customThemeToPalette(customTheme) };
    }
    return PALLETE[primaryColorIndex] || PALLETE[0];
  }, [primaryColorIndex, customTheme]);

  // Aplica as variáveis CSS
  useLayoutEffect(() => {
    const root = document.documentElement;

    if (isPublic || selectedPalette) {
      applyPaletteVars(isPublic ? PALLETE[0] : selectedPalette);
    }
    applyCustomTopBorder(
      !isPublic && primaryColorIndex === -1 ? customTheme : null,
    );

    // 3. Override Manual de Background (Caso exista algum uso externo)
    if (!selectedPalette && backgroundColor) {
      root.style.setProperty("--background-override", backgroundColor);
    }
  }, [
    selectedPalette,
    backgroundColor,
    isPublic,
    primaryColorIndex,
    customTheme,
  ]);

  const setPrimaryColorIndex = (index: number) => {
    localStorage.setItem(STORAGE_KEY, String(index));
    localStorage.setItem(LEGACY_STORAGE_KEY, String(index));
    setPrimaryColorIndexState(index);
    window.dispatchEvent(new Event("uzzina-storage-update"));
  };

  const previewColorIndex = (index: number) => {
    if (index === -1 && customTheme) {
      previewCustomTheme(customTheme);
      return;
    }
    const palette = PALLETE[index] || PALLETE[0];
    applyPaletteVars(palette);
  };

  const resetPrimaryColor = () => {
    localStorage.setItem(STORAGE_KEY, "0");
    localStorage.setItem(LEGACY_STORAGE_KEY, "0");
    setPrimaryColorIndexState(0);
    window.dispatchEvent(new Event("uzzina-storage-update"));
  };

  const setBackgroundColor = (color: string) => {
    localStorage.setItem(BACKGROUND_STORAGE_KEY, color);
    setBackgroundColorState(color);
    window.dispatchEvent(new Event("uzzina-storage-update"));
  };

  const setCustomTheme = (theme: CustomTheme) => {
    localStorage.setItem(CUSTOM_LIGHT_PRIMARY_KEY, theme.light.primaryHex);
    localStorage.setItem(CUSTOM_LIGHT_PRIMARY_FG_KEY, theme.light.primaryFgHex);
    localStorage.setItem(CUSTOM_LIGHT_BG_KEY, theme.light.bgHex);
    localStorage.setItem(CUSTOM_LIGHT_FG_KEY, theme.light.fgHex);
    localStorage.setItem(CUSTOM_DARK_PRIMARY_KEY, theme.dark.primaryHex);
    localStorage.setItem(CUSTOM_DARK_PRIMARY_FG_KEY, theme.dark.primaryFgHex);
    localStorage.setItem(CUSTOM_DARK_BG_KEY, theme.dark.bgHex);
    localStorage.setItem(CUSTOM_DARK_FG_KEY, theme.dark.fgHex);

    if (theme.relief !== undefined) {
      localStorage.setItem(CUSTOM_RELIEF_KEY, String(theme.relief));
    } else {
      localStorage.removeItem(CUSTOM_RELIEF_KEY);
    }
    if (theme.topBorderColor) {
      localStorage.setItem(CUSTOM_TOP_BORDER_COLOR_KEY, theme.topBorderColor);
    } else {
      localStorage.removeItem(CUSTOM_TOP_BORDER_COLOR_KEY);
    }

    localStorage.setItem(
      CUSTOM_EXTRAS_KEY,
      JSON.stringify({
        light: {
          accentHex: theme.light.accentHex,
          layers: theme.light.layers,
        },
        dark: { accentHex: theme.dark.accentHex, layers: theme.dark.layers },
      }),
    );

    // Salva pré-convertido em OKLCH para o script inline do root.tsx
    const lp = hexToOklch(theme.light.primaryHex);
    const lpfg = hexToOklch(theme.light.primaryFgHex);
    const lbg = hexToOklch(theme.light.bgHex);
    const lfg = hexToOklch(theme.light.fgHex);
    const dp = hexToOklch(theme.dark.primaryHex);
    const dpfg = hexToOklch(theme.dark.primaryFgHex);
    const dbg = hexToOklch(theme.dark.bgHex);
    const dfg = hexToOklch(theme.dark.fgHex);

    localStorage.setItem(
      "uzzina-custom-light-primary-oklch",
      `${lp.h} ${lp.c} ${lp.l}`,
    );
    localStorage.setItem(
      "uzzina-custom-light-primary-fg-oklch",
      `${lpfg.h} ${lpfg.c} ${lpfg.l}`,
    );
    localStorage.setItem(
      "uzzina-custom-light-bg-oklch",
      `${lbg.h} ${lbg.c} ${lbg.l}`,
    );
    localStorage.setItem(
      "uzzina-custom-light-fg-oklch",
      `${lfg.h} ${lfg.c} ${lfg.l}`,
    );
    localStorage.setItem(
      "uzzina-custom-dark-primary-oklch",
      `${dp.h} ${dp.c} ${dp.l}`,
    );
    localStorage.setItem(
      "uzzina-custom-dark-primary-fg-oklch",
      `${dpfg.h} ${dpfg.c} ${dpfg.l}`,
    );
    localStorage.setItem(
      "uzzina-custom-dark-bg-oklch",
      `${dbg.h} ${dbg.c} ${dbg.l}`,
    );
    localStorage.setItem(
      "uzzina-custom-dark-fg-oklch",
      `${dfg.h} ${dfg.c} ${dfg.l}`,
    );

    setCustomThemeState(theme);
    window.dispatchEvent(new Event("uzzina-storage-update"));
  };

  const previewCustomTheme = (theme: CustomTheme) => {
    applyPaletteVars(customThemeToPalette(theme));
    applyCustomTopBorder(theme);
  };

  return {
    /** Resolved theme currently applied (light or dark). */
    theme,
    /** The user's choice, including "system". */
    themePreference,
    setTheme,
    previewTheme,
    primaryColorIndex,
    selectedPalette,
    setPrimaryColorIndex,
    previewColorIndex,
    resetPrimaryColor,
    backgroundColor,
    setBackgroundColor,
    customTheme,
    setCustomTheme,
    previewCustomTheme,
    // Aliases para manter compatibilidade
    colorIndex: primaryColorIndex,
    setColorIndex: setPrimaryColorIndex,
  };
}

const AppThemeContext = createContext<
  ReturnType<typeof useAppTheme> | undefined
>(undefined);

export function AppThemeProvider({
  children,
  isPublic = false,
}: {
  children: React.ReactNode;
  isPublic?: boolean;
}) {
  const appTheme = useAppTheme(isPublic);
  return React.createElement(
    AppThemeContext.Provider,
    { value: appTheme },
    children,
  );
}

export function useAppThemeContext() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error(
      "useAppThemeContext must be used within an AppThemeProvider",
    );
  }
  return context;
}
