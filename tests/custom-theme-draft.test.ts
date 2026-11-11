import { describe, expect, test } from "bun:test";
import {
  applyCustomThemeChange,
  createCustomThemeDraft,
  isCompleteCustomTheme,
} from "~/lib/custom-theme";
import {
  deriveDarkBg,
  deriveDarkFg,
  deriveDarkPrimary,
  derivePrimaryFg,
} from "~/utils/color";

const base = createCustomThemeDraft(null);

describe("createCustomThemeDraft", () => {
  test("falls back to the documented defaults", () => {
    expect(base.light).toEqual({
      primaryHex: "#2640A0",
      primaryFgHex: "#FFFFFF",
      bgHex: "#FFFFFF",
      fgHex: "#000000",
    });
    expect(base.dark).toEqual({
      primaryHex: "#3558DE",
      primaryFgHex: "#FFFFFF",
      bgHex: "#141414",
      fgHex: "#FFFFFF",
    });
  });
  test("keeps saved values", () => {
    const saved = {
      light: { ...base.light, bgHex: "#EEEEEE" },
      dark: base.dark,
    };
    expect(createCustomThemeDraft(saved).light.bgHex).toBe("#EEEEEE");
  });
});

describe("applyCustomThemeChange", () => {
  test("light primary derives the dark primary and both foregrounds", () => {
    const next = applyCustomThemeChange(base, "light", "primaryHex", "#112233");
    const darkPrimary = deriveDarkPrimary("#112233");
    expect(next.light.primaryHex).toBe("#112233");
    expect(next.light.primaryFgHex).toBe(derivePrimaryFg("#112233"));
    expect(next.dark.primaryHex).toBe(darkPrimary);
    expect(next.dark.primaryFgHex).toBe(derivePrimaryFg(darkPrimary));
    expect(next.light.bgHex).toBe(base.light.bgHex);
  });
  test("light background and text derive their dark counterparts", () => {
    expect(
      applyCustomThemeChange(base, "light", "bgHex", "#F0F0F0").dark.bgHex,
    ).toBe(deriveDarkBg("#F0F0F0"));
    expect(
      applyCustomThemeChange(base, "light", "fgHex", "#101010").dark.fgHex,
    ).toBe(deriveDarkFg("#101010"));
  });
  test("dark primary only derives the dark primary foreground", () => {
    const next = applyCustomThemeChange(base, "dark", "primaryHex", "#445566");
    expect(next.dark.primaryFgHex).toBe(derivePrimaryFg("#445566"));
    expect(next.light).toEqual(base.light);
  });
  test("remaining fields change only themselves", () => {
    expect(
      applyCustomThemeChange(base, "light", "primaryFgHex", "#010101"),
    ).toEqual({
      ...base,
      light: { ...base.light, primaryFgHex: "#010101" },
    });
    expect(applyCustomThemeChange(base, "dark", "bgHex", "#202020")).toEqual({
      ...base,
      dark: { ...base.dark, bgHex: "#202020" },
    });
  });
  test("does not mutate its input", () => {
    const snapshot = JSON.stringify(base);
    applyCustomThemeChange(base, "light", "primaryHex", "#123456");
    expect(JSON.stringify(base)).toBe(snapshot);
  });
});

describe("isCompleteCustomTheme", () => {
  test("rejects empty colors", () => {
    expect(isCompleteCustomTheme(base)).toBe(true);
    expect(
      isCompleteCustomTheme({ ...base, dark: { ...base.dark, fgHex: "" } }),
    ).toBe(false);
  });
});
