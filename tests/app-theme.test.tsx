import { afterEach, beforeEach, expect, it } from "bun:test";
import { act, cleanup, renderHook } from "@testing-library/react";
import { Theme, useAppTheme } from "../app/hooks/useAppTheme";
import { PALLETE, getPaletteIndexById } from "../app/lib/palettes";
import { getUserPreferences } from "../app/lib/preferences";

// The DOM preload exposes window but not the global localStorage the hook uses.
if (!("localStorage" in globalThis)) {
  Object.assign(globalThis, { localStorage: window.localStorage });
}

// The operating system is the external boundary: control prefers-color-scheme.
let systemDark = false;
let listeners: ((event: { matches: boolean }) => void)[] = [];
function setSystemDark(value: boolean) {
  systemDark = value;
  for (const listener of listeners) listener({ matches: value });
}

beforeEach(() => {
  systemDark = false;
  listeners = [];
  localStorage.clear();
  document.documentElement.className = "";
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      get matches() {
        return query.includes("dark") && systemDark;
      },
      media: query,
      addEventListener: (
        _type: string,
        listener: (event: { matches: boolean }) => void,
      ) => listeners.push(listener),
      removeEventListener: (
        _type: string,
        listener: (event: { matches: boolean }) => void,
      ) => {
        listeners = listeners.filter((item) => item !== listener);
      },
    }),
  });
});
afterEach(cleanup);

const isDark = () => document.documentElement.classList.contains("dark");

it("choosing system follows a dark operating system and is stored as system", () => {
  systemDark = true;
  const { result } = renderHook(() => useAppTheme());
  act(() => result.current.setTheme("system"));
  expect(localStorage.getItem("uzzina-theme")).toBe("system");
  expect(result.current.themePreference).toBe("system");
  expect(result.current.theme).toBe(Theme.DARK);
  expect(isDark()).toBe(true);
});

it("system mode switches live when the operating system changes", () => {
  localStorage.setItem("uzzina-theme", "system");
  const { result } = renderHook(() => useAppTheme());
  expect(isDark()).toBe(false);
  act(() => setSystemDark(true));
  expect(result.current.theme).toBe(Theme.DARK);
  expect(isDark()).toBe(true);
  act(() => setSystemDark(false));
  expect(isDark()).toBe(false);
});

it("an explicit light choice ignores a dark operating system", () => {
  systemDark = true;
  const { result } = renderHook(() => useAppTheme());
  act(() => result.current.setTheme("light"));
  act(() => setSystemDark(true));
  expect(result.current.theme).toBe(Theme.LIGHT);
  expect(isDark()).toBe(false);
});

it("a missing stored theme defaults to the operating system", () => {
  systemDark = true;
  const { result } = renderHook(() => useAppTheme());
  expect(result.current.themePreference).toBe("system");
  expect(isDark()).toBe(true);
});

it("an unknown stored id and the legacy Personalizado index (-1) fall back to the default palette", () => {
  localStorage.setItem("uzzina-theme-color", "nope");
  const unknown = renderHook(() => useAppTheme());
  expect(unknown.result.current.primaryColorId).toBe(PALLETE[0].id);
  expect(unknown.result.current.selectedPalette.id).toBe(PALLETE[0].id);
  unknown.unmount();

  localStorage.clear();
  localStorage.setItem("uzzina-theme-color-index", "-1");
  const legacy = renderHook(() => useAppTheme());
  expect(legacy.result.current.primaryColorId).toBe(PALLETE[0].id);
  expect(
    getUserPreferences({
      preferences: { themeColorIndex: -1, customTheme: { light: {} } },
    }).themeColor,
  ).toBe(PALLETE[0].id);
  expect(
    getUserPreferences({ preferences: { themeColor: "nope" } }).themeColor,
  ).toBe(PALLETE[0].id);
});

it("a legacy index is converted through the old 11-palette order, not the current list", () => {
  // Index 10 was Fúcsia; "green" (index 6) was removed from the middle of PALLETE.
  const legacy = (themeColorIndex: unknown) =>
    getUserPreferences({ preferences: { themeColorIndex } }).themeColor;
  expect(legacy(10)).toBe("magenta");
  expect(legacy(7)).toBe("cyan");
  expect(legacy(2)).toBe("red");
  expect(legacy(6)).toBe(PALLETE[0].id);
  expect(legacy(11)).toBe(PALLETE[0].id);
  expect(legacy("3")).toBe(PALLETE[0].id);

  localStorage.setItem("uzzina-theme-color-index", "10");
  const { result } = renderHook(() => useAppTheme());
  expect(result.current.primaryColorId).toBe("magenta");
  expect(result.current.selectedPalette.id).toBe("magenta");
});

it("a saved id wins over a legacy index and is resolved by id, not by position", () => {
  expect(
    getUserPreferences({
      preferences: { themeColor: "blue", themeColorIndex: 2 },
    }).themeColor,
  ).toBe("blue");

  localStorage.setItem("uzzina-theme-color", "magenta");
  localStorage.setItem("uzzina-theme-color-index", "2");
  const { result } = renderHook(() => useAppTheme());
  expect(result.current.primaryColorId).toBe("magenta");
  // The palette is looked up by id: its position in PALLETE does not matter.
  expect(result.current.selectedPalette).toBe(
    PALLETE[getPaletteIndexById("magenta")],
  );
});

it("choosing a palette stores the id and drops the legacy index keys", () => {
  localStorage.setItem("uzzina-theme-color-index", "2");
  const { result } = renderHook(() => useAppTheme());
  act(() => result.current.setPrimaryColorId("blue"));
  expect(result.current.primaryColorId).toBe("blue");
  expect(localStorage.getItem("uzzina-theme-color")).toBe("blue");
  expect(localStorage.getItem("uzzina-theme-color-index")).toBeNull();
  expect(localStorage.getItem("uzzina-accent-color-index")).toBeNull();
});
