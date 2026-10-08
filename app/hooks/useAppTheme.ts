import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react";
import { PALLETE } from "~/lib/palettes";
import { applyPaletteVars } from "~/lib/palette-vars";
import { hexToOklch } from "~/utils/color";
import type { CustomTheme } from "~/lib/preferences";

const STORAGE_KEY = "uzzina-accent-color-index";
const FOLLOW_PARTNER_KEY = "uzzina-follow-partner-color";
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

function getStoredIndex(): number {
  if (typeof window === "undefined") return 0;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null || saved === "") return 0;
  const n = Number(saved);
  return Number.isNaN(n) ? 0 : n;
}

function getStoredFollowPartner(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FOLLOW_PARTNER_KEY) === "true";
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

  if (lp && lbg && lfg && dp && dbg && dfg) {
    return {
      light: { primaryHex: lp, primaryFgHex: lpfg, bgHex: lbg, fgHex: lfg },
      dark: { primaryHex: dp, primaryFgHex: dpfg, bgHex: dbg, fgHex: dfg },
    };
  }
  return null;
}

const applyPartnerColors = (bg: string, fg: string) => {
  const root = document.documentElement;
  root.style.setProperty("--primary", bg);
  root.style.setProperty("--primary-foreground", fg);
  root.style.setProperty("--ring", bg);
};

const restoreThemeColors = () => {
  const root = document.documentElement;
  root.style.removeProperty("--primary");
  root.style.removeProperty("--primary-foreground");
  root.style.removeProperty("--ring");
};

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
export function useAppTheme() {
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
  const [primaryColorIndex, setPrimaryColorIndexState] = useState<number>(0);
  const [followPartnerColor, setFollowPartnerColorState] =
    useState<boolean>(false);
  const [backgroundColor, setBackgroundColorState] =
    useState<string>("#FFFFFF");
  const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(null);

  // Lê o localStorage só no cliente, após a hidratação
  useEffect(() => {
    setThemePreferenceState(getStoredThemePreference());
    setPrimaryColorIndexState(getStoredIndex());
    setFollowPartnerColorState(getStoredFollowPartner());
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
      } else if (key === STORAGE_KEY) {
        setPrimaryColorIndexState(
          newValue === null || newValue === "" ? 0 : Number(newValue),
        );
      } else if (key === FOLLOW_PARTNER_KEY && newValue !== null) {
        setFollowPartnerColorState(newValue === "true");
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
        key === CUSTOM_DARK_FG_KEY
      ) {
        setCustomThemeState(getStoredCustomTheme());
      }
    };

    const handleLocalUpdate = () => {
      setThemePreferenceState(getStoredThemePreference());
      setPrimaryColorIndexState(getStoredIndex());
      setFollowPartnerColorState(getStoredFollowPartner());
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
      const lightP = hexToOklch(customTheme.light.primaryHex);
      const lightPfg = hexToOklch(customTheme.light.primaryFgHex);
      const lightBg = hexToOklch(customTheme.light.bgHex);
      const lightFg = hexToOklch(customTheme.light.fgHex);
      const darkP = hexToOklch(customTheme.dark.primaryHex);
      const darkPfg = hexToOklch(customTheme.dark.primaryFgHex);
      const darkBg = hexToOklch(customTheme.dark.bgHex);
      const darkFg = hexToOklch(customTheme.dark.fgHex);

      return {
        label: "Personalizado",
        light: {
          primary: lightP,
          primaryFg: lightPfg,
          bg: lightBg,
          fg: lightFg,
        },
        dark: {
          primary: darkP,
          primaryFg: darkPfg,
          bg: darkBg,
          fg: darkFg,
        },
      };
    }
    return PALLETE[primaryColorIndex] || PALLETE[0];
  }, [primaryColorIndex, customTheme]);

  // Aplica as variáveis CSS
  useEffect(() => {
    const root = document.documentElement;

    if (selectedPalette) {
      applyPaletteVars(selectedPalette);
    }

    // 3. Override Manual de Background (Caso exista algum uso externo)
    if (!selectedPalette && backgroundColor) {
      root.style.setProperty("--background-override", backgroundColor);
    }
  }, [selectedPalette, backgroundColor]);

  const setPrimaryColorIndex = (index: number) => {
    localStorage.setItem(STORAGE_KEY, String(index));
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
    setPrimaryColorIndexState(0);
    window.dispatchEvent(new Event("uzzina-storage-update"));
  };

  const setFollowPartnerColor = (value: boolean) => {
    localStorage.setItem(FOLLOW_PARTNER_KEY, String(value));
    setFollowPartnerColorState(value);
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
    const lightP = hexToOklch(theme.light.primaryHex);
    const lightPfg = hexToOklch(theme.light.primaryFgHex);
    const lightBg = hexToOklch(theme.light.bgHex);
    const lightFg = hexToOklch(theme.light.fgHex);
    const darkP = hexToOklch(theme.dark.primaryHex);
    const darkPfg = hexToOklch(theme.dark.primaryFgHex);
    const darkBg = hexToOklch(theme.dark.bgHex);
    const darkFg = hexToOklch(theme.dark.fgHex);

    applyPaletteVars({
      light: { primary: lightP, primaryFg: lightPfg, bg: lightBg, fg: lightFg },
      dark: { primary: darkP, primaryFg: darkPfg, bg: darkBg, fg: darkFg },
    });
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
    followPartnerColor,
    setFollowPartnerColor,
    backgroundColor,
    setBackgroundColor,
    applyPartnerColors,
    restoreThemeColors,
    customTheme,
    setCustomTheme,
    previewCustomTheme,
    // Aliases para manter compatibilidade
    colorIndex: primaryColorIndex,
    setColorIndex: setPrimaryColorIndex,
    restoreAccentColors: restoreThemeColors,
  };
}

const AppThemeContext = createContext<
  ReturnType<typeof useAppTheme> | undefined
>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const appTheme = useAppTheme();
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
