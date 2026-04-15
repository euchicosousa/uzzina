import { useState, useEffect, useMemo } from "react";
import { PALLETE } from "~/lib/CONSTANTS";

const STORAGE_KEY = "uzzina-accent-color-index";
const FOLLOW_PARTNER_KEY = "uzzina-follow-partner-color";
const BACKGROUND_STORAGE_KEY = "uzzina-background-color";

function getStoredIndex(): number {
  if (typeof window === "undefined") return 0;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null || saved === "") return 0;
  const n = Number(saved);
  return isNaN(n) ? 0 : n;
}

function getStoredFollowPartner(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FOLLOW_PARTNER_KEY) === "true";
}

function getStoredBackground(): string {
  if (typeof window === "undefined") return "#FFFFFF";
  return localStorage.getItem(BACKGROUND_STORAGE_KEY) || "#FFFFFF";
}

/**
 * Hook para gerenciar as cores da marca (Tema) do aplicativo.
 * Gerencia a cor primária e a cor de fundo padrão.
 */
export function useAppTheme() {
  const [primaryColorIndex, setPrimaryColorIndexState] = useState<number>(0);
  const [followPartnerColor, setFollowPartnerColorState] =
    useState<boolean>(false);
  const [backgroundColor, setBackgroundColorState] = useState<string>("#FFFFFF");

  // Lê o localStorage só no cliente, após a hidratação
  useEffect(() => {
    setPrimaryColorIndexState(getStoredIndex());
    setFollowPartnerColorState(getStoredFollowPartner());
    setBackgroundColorState(getStoredBackground());
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
      }
    };

    const handleLocalUpdate = () => {
      setPrimaryColorIndexState(getStoredIndex());
      setFollowPartnerColorState(getStoredFollowPartner());
      setBackgroundColorState(getStoredBackground());
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("uzzina-storage-update", handleLocalUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("uzzina-storage-update", handleLocalUpdate);
    };
  }, []);

  const selectedPalette = useMemo(() => 
    PALLETE[primaryColorIndex] || PALLETE[0]
  , [primaryColorIndex]);

  // Aplica as variáveis CSS
  useEffect(() => {
    const root = document.documentElement;

    if (selectedPalette) {
      const { light, dark } = selectedPalette;
      
      // 1. Cor Primária
      root.style.setProperty("--accent-h", String(light.primary.h));
      root.style.setProperty("--accent-c", String(light.primary.c));
      root.style.setProperty("--accent-l", String(light.primary.l));
      root.style.setProperty("--dark-accent-h", String(dark.primary.h));
      root.style.setProperty("--dark-accent-c", String(dark.primary.c));
      root.style.setProperty("--dark-accent-l", String(dark.primary.l));

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
    }

    // 3. Override Manual de Background (Caso exista algum uso externo)
    // Se não houver paleta selecionada (improvável agora), ainda respeitamos o backgroundColor state
    if (!selectedPalette && backgroundColor) {
      root.style.setProperty("--background-override", backgroundColor);
    }
  }, [selectedPalette, backgroundColor]);

  const setPrimaryColorIndex = (index: number) => {
    localStorage.setItem(STORAGE_KEY, String(index));
    setPrimaryColorIndexState(index);
    window.dispatchEvent(new Event("uzzina-storage-update"));
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

  return {
    primaryColorIndex,
    selectedPalette,
    setPrimaryColorIndex,
    resetPrimaryColor,
    followPartnerColor,
    setFollowPartnerColor,
    backgroundColor,
    setBackgroundColor,
    applyPartnerColors,
    restoreThemeColors,
    // Aliases para manter compatibilidade
    colorIndex: primaryColorIndex, 
    setColorIndex: setPrimaryColorIndex,
    restoreAccentColors: restoreThemeColors
  };
}
