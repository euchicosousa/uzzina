import { useState, useEffect } from "react";
import { PALLETE } from "~/lib/CONSTANTS";

const STORAGE_KEY = "uzzina-accent-color-index";
const FOLLOW_PARTNER_KEY = "uzzina-follow-partner-color";

function getStoredIndex(): number | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null || saved === "") return null;
  const n = Number(saved);
  return isNaN(n) ? null : n;
}

function getStoredFollowPartner(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FOLLOW_PARTNER_KEY) === "true";
}

export function useAccentColor() {
  const [colorIndex, setColorIndexState] = useState<number | null>(null);
  const [followPartnerColor, setFollowPartnerColorState] =
    useState<boolean>(false);

  // Lê o localStorage só no cliente, após a hidratação
  useEffect(() => {
    setColorIndexState(getStoredIndex());
    setFollowPartnerColorState(getStoredFollowPartner());
  }, []);

  // Sincroniza entre abas
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        const val = event.newValue;
        setColorIndexState(
          val === null || val === "" ? null : Number(val),
        );
      }
      if (event.key === FOLLOW_PARTNER_KEY && event.newValue !== null) {
        setFollowPartnerColorState(event.newValue === "true");
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const selectedPalette =
    colorIndex !== null ? PALLETE[colorIndex] : undefined;

  // Aplica ou remove as variáveis CSS de acento
  useEffect(() => {
    const root = document.documentElement;

    if (selectedPalette) {
      const { light, dark } = selectedPalette;
      root.style.setProperty("--accent-h", String(light.h));
      root.style.setProperty("--accent-c", String(light.c));
      root.style.setProperty("--accent-l", String(light.l));
      root.style.setProperty("--dark-accent-h", String(dark.h));
      root.style.setProperty("--dark-accent-c", String(dark.c));
      root.style.setProperty("--dark-accent-l", String(dark.l));
    } else {
      // Sem cor selecionada: remove overrides para o CSS base assumir
      root.style.removeProperty("--accent-h");
      root.style.removeProperty("--accent-c");
      root.style.removeProperty("--accent-l");
      root.style.removeProperty("--dark-accent-h");
      root.style.removeProperty("--dark-accent-c");
      root.style.removeProperty("--dark-accent-l");
    }
  }, [selectedPalette]);

  /**
   * Seleciona uma cor; se já estiver selecionada, desmarca (volta ao CSS base).
   */
  const setColorIndex = (index: number) => {
    const next = colorIndex === index ? null : index;
    localStorage.setItem(STORAGE_KEY, next !== null ? String(next) : "");
    setColorIndexState(next);
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
   * Remove a sobrescrita das cores do parceiro, deixando o CSS base assumir.
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
