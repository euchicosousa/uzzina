import { useState, useEffect, useMemo, useCallback } from "react";
import { PALLETE } from "~/lib/CONSTANTS";
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

/**
 * Hook para gerenciar as cores da marca (Tema) do aplicativo.
 * Gerencia a cor primária e a cor de fundo padrão.
 */
export function useAppTheme() {
  const [primaryColorIndex, setPrimaryColorIndexState] = useState<number>(0);
  const [followPartnerColor, setFollowPartnerColorState] =
    useState<boolean>(false);
  const [backgroundColor, setBackgroundColorState] = useState<string>("#FFFFFF");
  const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(null);

  // Lê o localStorage só no cliente, após a hidratação
  useEffect(() => {
    setPrimaryColorIndexState(getStoredIndex());
    setFollowPartnerColorState(getStoredFollowPartner());
    setBackgroundColorState(getStoredBackground());
    setCustomThemeState(getStoredCustomTheme());
  }, []);

  // Sincroniza entre abas e instâncias no mesmo documento
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      const { key, newValue } = event;
      if (key === STORAGE_KEY) {
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

  const applyPaletteVars = useCallback((palette: {
    light: {
      primary: { h: number; c: number; l: number };
      primaryFg?: { h: number; c: number; l: number } | null;
      bg?: { h: number; c: number; l: number } | null;
      fg?: { h: number; c: number; l: number } | null;
    };
    dark: {
      primary: { h: number; c: number; l: number };
      primaryFg?: { h: number; c: number; l: number } | null;
      bg?: { h: number; c: number; l: number } | null;
      fg?: { h: number; c: number; l: number } | null;
    };
  }) => {
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
  }, []);

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
  }, [selectedPalette, backgroundColor, applyPaletteVars]);

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

    localStorage.setItem("uzzina-custom-light-primary-oklch", `${lp.h} ${lp.c} ${lp.l}`);
    localStorage.setItem("uzzina-custom-light-primary-fg-oklch", `${lpfg.h} ${lpfg.c} ${lpfg.l}`);
    localStorage.setItem("uzzina-custom-light-bg-oklch", `${lbg.h} ${lbg.c} ${lbg.l}`);
    localStorage.setItem("uzzina-custom-light-fg-oklch", `${lfg.h} ${lfg.c} ${lfg.l}`);
    localStorage.setItem("uzzina-custom-dark-primary-oklch", `${dp.h} ${dp.c} ${dp.l}`);
    localStorage.setItem("uzzina-custom-dark-primary-fg-oklch", `${dpfg.h} ${dpfg.c} ${dpfg.l}`);
    localStorage.setItem("uzzina-custom-dark-bg-oklch", `${dbg.h} ${dbg.c} ${dbg.l}`);
    localStorage.setItem("uzzina-custom-dark-fg-oklch", `${dfg.h} ${dfg.c} ${dfg.l}`);

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
    restoreAccentColors: restoreThemeColors
  };
}
