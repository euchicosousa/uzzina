import { useState, useEffect } from "react";
import { PALLETE } from "~/lib/CONSTANTS";

const STORAGE_KEY = "uzzina-accent-color-index";
const FOLLOW_PARTNER_KEY = "uzzina-follow-partner-color";
const DEFAULT_INDEX = 0; // Azul (Padrão)

function getStoredIndex(): number {
  if (typeof window === "undefined") return DEFAULT_INDEX;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved !== null ? Number(saved) : DEFAULT_INDEX;
}

function getStoredFollowPartner(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FOLLOW_PARTNER_KEY) === "true";
}

export function useAccentColor() {
  const [colorIndex, setColorIndexState] = useState<number>(DEFAULT_INDEX);
  const [followPartnerColor, setFollowPartnerColorState] =
    useState<boolean>(false);

  // Lê o localStorage só no cliente, após a hidratação
  useEffect(() => {
    setColorIndexState(getStoredIndex());
    setFollowPartnerColorState(getStoredFollowPartner());
  }, []);

  // Sincroniza entre abas: se o usuário mudar a cor em outra aba, reflete aqui
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY && event.newValue !== null) {
        setColorIndexState(Number(event.newValue));
      }
      if (event.key === FOLLOW_PARTNER_KEY && event.newValue !== null) {
        setFollowPartnerColorState(event.newValue === "true");
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const selectedPalette = PALLETE[colorIndex] || PALLETE[DEFAULT_INDEX];

  // Aplica as variáveis CSS ao mudar a paleta
  useEffect(() => {
    const root = document.documentElement;
    const { light, dark } = selectedPalette;

    root.style.setProperty("--accent-h", String(light.h));
    root.style.setProperty("--accent-c", String(light.c));
    root.style.setProperty("--accent-l", String(light.l));

    root.style.setProperty("--dark-accent-h", String(dark.h));
    root.style.setProperty("--dark-accent-c", String(dark.c));
    root.style.setProperty("--dark-accent-l", String(dark.l));
  }, [selectedPalette]);

  const setColorIndex = (index: number) => {
    localStorage.setItem(STORAGE_KEY, String(index));
    setColorIndexState(index);
  };

  const setFollowPartnerColor = (value: boolean) => {
    localStorage.setItem(FOLLOW_PARTNER_KEY, String(value));
    setFollowPartnerColorState(value);
  };

  /**
   * Aplica as cores do parceiro diretamente nas variáveis CSS --primary e
   * --primary-foreground, sobrescrevendo temporariamente a paleta do usuário.
   */
  const applyPartnerColors = (bg: string, fg: string) => {
    const root = document.documentElement;
    root.style.setProperty("--primary", bg);
    root.style.setProperty("--primary-foreground", fg);
    root.style.setProperty("--ring", bg);
  };

  /**
   * Remove a sobrescrita das cores do parceiro, deixando os knobs oklch
   * assumirem novamente via CSS (calculados a partir de --accent-h/c/l).
   */
  const restoreAccentColors = () => {
    const root = document.documentElement;
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
    root.style.removeProperty("--ring");
  };

  return {
    colorIndex,
    selectedPalette,
    setColorIndex,
    followPartnerColor,
    setFollowPartnerColor,
    applyPartnerColors,
    restoreAccentColors,
  };
}

