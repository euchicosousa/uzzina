import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  createContext,
  useContext,
} from "react";
import { DEFAULT_PALETTE_ID, PALLETE, getPaletteById } from "~/lib/palettes";
import { applyPaletteVars } from "~/lib/palette-vars";
import { resolvePaletteId } from "~/lib/preferences";

/** Palette id chosen by the user. */
const STORAGE_KEY = "uzzina-theme-color";
/** Legacy keys that stored the palette position; read only, never written. */
const LEGACY_INDEX_KEY = "uzzina-theme-color-index";
const LEGACY_ACCENT_INDEX_KEY = "uzzina-accent-color-index";
const BACKGROUND_STORAGE_KEY = "uzzina-background-color";

function parseLegacyIndex(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function getStoredColorId(): string {
  if (typeof window === "undefined") return DEFAULT_PALETTE_ID;
  const savedId = localStorage.getItem(STORAGE_KEY);
  if (savedId !== null && savedId !== "") return resolvePaletteId(savedId);
  // No id stored yet: convert the legacy position through the old palette order.
  return resolvePaletteId(
    undefined,
    parseLegacyIndex(
      localStorage.getItem(LEGACY_INDEX_KEY) ??
        localStorage.getItem(LEGACY_ACCENT_INDEX_KEY),
    ),
  );
}

function getStoredBackground(): string {
  if (typeof window === "undefined") return "#FFFFFF";
  return localStorage.getItem(BACKGROUND_STORAGE_KEY) || "#FFFFFF";
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
  const [primaryColorId, setPrimaryColorIdState] =
    useState<string>(getStoredColorId);
  const [backgroundColor, setBackgroundColorState] =
    useState<string>("#FFFFFF");

  // Lê o localStorage só no cliente, após a hidratação
  useEffect(() => {
    setThemePreferenceState(getStoredThemePreference());
    setPrimaryColorIdState(getStoredColorId());
    setBackgroundColorState(getStoredBackground());
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
      } else if (
        key === STORAGE_KEY ||
        key === LEGACY_INDEX_KEY ||
        key === LEGACY_ACCENT_INDEX_KEY
      ) {
        setPrimaryColorIdState(getStoredColorId());
      } else if (key === BACKGROUND_STORAGE_KEY && newValue !== null) {
        setBackgroundColorState(newValue);
      }
    };

    const handleLocalUpdate = () => {
      setThemePreferenceState(getStoredThemePreference());
      setPrimaryColorIdState(getStoredColorId());
      setBackgroundColorState(getStoredBackground());
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

  const selectedPalette = useMemo(
    () => getPaletteById(primaryColorId) ?? PALLETE[0],
    [primaryColorId],
  );

  // Aplica as variáveis CSS
  useLayoutEffect(() => {
    const root = document.documentElement;

    if (isPublic || selectedPalette) {
      applyPaletteVars(isPublic ? PALLETE[0] : selectedPalette);
    }

    // 3. Override Manual de Background (Caso exista algum uso externo)
    if (!selectedPalette && backgroundColor) {
      root.style.setProperty("--background-override", backgroundColor);
    }
  }, [selectedPalette, backgroundColor, isPublic]);

  const setPrimaryColorId = (id: string) => {
    const resolvedId = resolvePaletteId(id);
    localStorage.setItem(STORAGE_KEY, resolvedId);
    localStorage.removeItem(LEGACY_INDEX_KEY);
    localStorage.removeItem(LEGACY_ACCENT_INDEX_KEY);
    setPrimaryColorIdState(resolvedId);
    window.dispatchEvent(new Event("uzzina-storage-update"));
  };

  const previewColorId = (id: string) => {
    applyPaletteVars(getPaletteById(id) ?? PALLETE[0]);
  };

  const resetPrimaryColor = () => setPrimaryColorId(DEFAULT_PALETTE_ID);

  const setBackgroundColor = (color: string) => {
    localStorage.setItem(BACKGROUND_STORAGE_KEY, color);
    setBackgroundColorState(color);
    window.dispatchEvent(new Event("uzzina-storage-update"));
  };

  return {
    /** Resolved theme currently applied (light or dark). */
    theme,
    /** The user's choice, including "system". */
    themePreference,
    setTheme,
    previewTheme,
    primaryColorId,
    selectedPalette,
    setPrimaryColorId,
    previewColorId,
    resetPrimaryColor,
    backgroundColor,
    setBackgroundColor,
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
