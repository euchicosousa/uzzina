import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

interface ThemeContextType {
  theme: Theme | null;
  setTheme: (theme: Theme | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  specifiedTheme,
}: {
  children: React.ReactNode;
  specifiedTheme?: Theme | null;
}) {
  const [theme, setThemeState] = useState<Theme | null>(() => {
    if (specifiedTheme) return specifiedTheme;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("uzzina-theme");
      if (saved === "light") return Theme.LIGHT;
      if (saved === "dark") return Theme.DARK;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? Theme.DARK
        : Theme.LIGHT;
    }
    return Theme.LIGHT;
  });

  useEffect(() => {
    if (!theme) return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme | null) => {
    if (newTheme) {
      localStorage.setItem("uzzina-theme", newTheme);
    } else {
      localStorage.removeItem("uzzina-theme");
    }
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return [context.theme, context.setTheme] as const;
}
