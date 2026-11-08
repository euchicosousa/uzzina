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
  expect(root.getPropertyValue("--accent-l")).toBe(
    String(palette.light.primary.l),
  );
  expect(root.getPropertyValue("--dark-accent-h")).toBe(
    String(palette.dark.primary.h),
  );
});

it("removes overrides that the next palette does not define", () => {
  const withFg = {
    light: {
      primary: { h: 1, c: 0.1, l: 0.5 },
      primaryFg: { h: 2, c: 0.2, l: 0.9 },
    },
    dark: { primary: { h: 3, c: 0.1, l: 0.6 } },
  };
  applyPaletteVars(withFg);
  const root = document.documentElement.style;
  expect(root.getPropertyValue("--primary-foreground-override")).toBe(
    "oklch(0.9 0.2 2)",
  );
  applyPaletteVars({ ...withFg, light: { primary: withFg.light.primary } });
  expect(root.getPropertyValue("--primary-foreground-override")).toBe("");
});

it("applies transparent borders and none shadows when relief is false, and cleans up when relief is restored", () => {
  const carbon = PALLETE.find((p) => p.id === "carbon");
  expect(carbon).toBeDefined();
  expect(carbon?.relief).toBe(false);

  applyPaletteVars(carbon!);
  const root = document.documentElement.style;
  expect(root.getPropertyValue("--action-top-border-override")).toBe(
    "transparent",
  );
  expect(root.getPropertyValue("--late-top-border-override")).toBe(
    "transparent",
  );
  expect(root.getPropertyValue("--action-shadow-override")).toBe("none");
  expect(root.getPropertyValue("--action-hover-shadow-override")).toBe("none");

  const onix = PALLETE[0];
  expect(onix.relief).toBe(true);
  applyPaletteVars(onix);

  expect(root.getPropertyValue("--action-top-border-override")).toBe("");
  expect(root.getPropertyValue("--late-top-border-override")).toBe("");
  expect(root.getPropertyValue("--action-shadow-override")).toBe("");
  expect(root.getPropertyValue("--action-hover-shadow-override")).toBe("");
});

it("applies shadowColor and topBorderColor and cleans up", () => {
  const magenta = PALLETE.find((p) => p.id === "magenta");
  expect(magenta).toBeDefined();
  expect(magenta?.shadowColor).toBe("oklch(0.25 0.15 350)");

  applyPaletteVars(magenta!);
  const root = document.documentElement.style;
  expect(root.getPropertyValue("--action-shadow-color-override")).toBe(
    "oklch(0.25 0.15 350)",
  );
  expect(root.getPropertyValue("--dark-action-shadow-color-override")).toBe(
    "oklch(0.25 0.15 350)",
  );
  // A borda superior da action em magenta permanece no padrão branco (sem override)
  expect(root.getPropertyValue("--action-top-border-override")).toBe("");

  const withCustomBorder = {
    ...PALLETE[0],
    topBorderColor: "#ff0000",
  };
  applyPaletteVars(withCustomBorder);
  expect(root.getPropertyValue("--action-top-border-override")).toBe("#ff0000");

  const onix = PALLETE[0];
  applyPaletteVars(onix);

  expect(root.getPropertyValue("--action-shadow-color-override")).toBe("");
  expect(root.getPropertyValue("--dark-action-shadow-color-override")).toBe("");
  expect(root.getPropertyValue("--action-top-border-override")).toBe("");
});
