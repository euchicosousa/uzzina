import { useState, useEffect } from "react";
import { PALLETE } from "~/lib/CONSTANTS";

const STORAGE_KEY = "uzzina-accent-color-index";
const DEFAULT_INDEX = 0; // Azul (Padrão)

export function useAccentColor() {
  const [colorIndex, setColorIndexState] = useState<number>(() => {
    // Only access localStorage on the client
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? Number(saved) : DEFAULT_INDEX;
    }
    return DEFAULT_INDEX;
  });

  const selectedPalette = PALLETE[colorIndex] || PALLETE[DEFAULT_INDEX];

  // Apply CSS variables on change
  useEffect(() => {
    const root = document.documentElement;
    const { light, dark } = selectedPalette;

    // Set variables for Light mode (default variables)
    root.style.setProperty("--accent-h", String(light.h));
    root.style.setProperty("--accent-c", String(light.c));
    root.style.setProperty("--accent-l", String(light.l));

    // Set variables for Dark mode
    // We can't target .dark easily from inline styles directly, so we inject a style block
    // or set a unique data attribute to manage it. Let's use CSS custom properties that the `.dark` class reads.
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
