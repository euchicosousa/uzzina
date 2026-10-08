import { afterEach, beforeEach, expect, it } from "bun:test";
import { act, cleanup, renderHook } from "@testing-library/react";
import { Theme, useAppTheme } from "../app/hooks/useAppTheme";

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
