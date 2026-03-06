import { useState, useEffect } from "react";
import { PALLETE } from "~/lib/CONSTANTS";

const STORAGE_KEY = "uzzina-accent-color-index";
const DEFAULT_INDEX = 0; // Azul (Padrão)

function getStoredIndex(): number {
  if (typeof window === "undefined") return DEFAULT_INDEX;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved !== null ? Number(saved) : DEFAULT_INDEX;
}

export function useAccentColor() {
  const [colorIndex, setColorIndexState] = useState<number>(DEFAULT_INDEX);

  // Lê o localStorage só no cliente, após a hidratação
  useEffect(() => {
    setColorIndexState(getStoredIndex());
  }, []);

  // Sincroniza entre abas: se o usuário mudar a cor em outra aba, reflete aqui
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY && event.newValue !== null) {
        setColorIndexState(Number(event.newValue));
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

  return { colorIndex, selectedPalette, setColorIndex };
}
