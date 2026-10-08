import "./dom-setup";
import { afterEach, expect, it } from "bun:test";
import { applyPaletteVars } from "~/lib/palette-vars";
import { PALLETE } from "~/lib/palettes";

afterEach(() => {
  document.documentElement.removeAttribute("style");
});

it("writes accent variables and optional overrides on the document root", () => {
  const palette = PALLETE[0];
  applyPaletteVars(palette);
  const root = document.documentElement.style;
  expect(root.getPropertyValue("--accent-l")).toBe(String(palette.light.primary.l));
  expect(root.getPropertyValue("--dark-accent-h")).toBe(String(palette.dark.primary.h));
});

it("removes overrides that the next palette does not define", () => {
  const withFg = {
    light: { primary: { h: 1, c: 0.1, l: 0.5 }, primaryFg: { h: 2, c: 0.2, l: 0.9 } },
    dark: { primary: { h: 3, c: 0.1, l: 0.6 } },
  };
  applyPaletteVars(withFg);
  const root = document.documentElement.style;
  expect(root.getPropertyValue("--primary-foreground-override")).toBe("oklch(0.9 0.2 2)");
  applyPaletteVars({ ...withFg, light: { primary: withFg.light.primary } });
  expect(root.getPropertyValue("--primary-foreground-override")).toBe("");
});
