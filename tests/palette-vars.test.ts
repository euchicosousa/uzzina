import "./dom-setup";
import { afterEach, expect, it } from "bun:test";
import { applyPaletteVars } from "~/lib/palette-vars";
import { PALLETE } from "~/lib/palettes";

afterEach(() => {
  document.documentElement.removeAttribute("style");
});

it("writes primary variables and optional overrides on the document root", () => {
  const palette = PALLETE[0];
  applyPaletteVars(palette);
  const root = document.documentElement.style;
  expect(root.getPropertyValue("--primary-l")).toBe(
    String(palette.light.primary.l),
  );
  expect(root.getPropertyValue("--dark-primary-h")).toBe(
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

it("applies transparent borders and zero shadows that compose with rings when relief is false, and cleans up when relief is restored", () => {
  const carbon = PALLETE.find((p) => p.id === "carbon");
  if (!carbon) throw new Error("Carbon palette is missing");
  expect(carbon.relief).toBe(false);

  applyPaletteVars(carbon);
  // The vivid phase card reads this to drop its top highlight (DS17).
  expect(
    document.documentElement.style.getPropertyValue("--action-relief"),
  ).toBe("0");
  const root = document.documentElement.style;
  expect(root.getPropertyValue("--action-top-border-override")).toBe(
    "transparent",
  );
  expect(root.getPropertyValue("--action-shadow-override")).toBe("0 0 #0000");
  expect(root.getPropertyValue("--action-hover-shadow-override")).toBe(
    "0 0 #0000",
  );

  const onix = PALLETE[0];
  expect(onix.relief).toBe(true);
  applyPaletteVars(onix);

  expect(root.getPropertyValue("--action-top-border-override")).toBe("");
  expect(root.getPropertyValue("--action-shadow-override")).toBe("");
  expect(root.getPropertyValue("--action-hover-shadow-override")).toBe("");
});

it("writes the shared shadow and late card formulas, with no per-palette shadow", () => {
  applyPaletteVars(PALLETE[0]);
  const root = document.documentElement.style;
  expect(root.getPropertyValue("--shared-shadow-mix")).toBe("30%");
  expect(root.getPropertyValue("--shared-dark-shadow-mix")).toBe("20%");
  expect(root.getPropertyValue("--shared-shadow-l")).toBe("0.15");
  expect(root.getPropertyValue("--shared-dark-shadow-alpha")).toBe("70%");
  expect(root.getPropertyValue("--shared-late-alpha")).toBe("25%");
  expect(root.getPropertyValue("--shared-dark-late-l")).toBe("0.45");
  expect(root.getPropertyValue("--shared-dark-late-c")).toBe("0.18");
  // Shadow color and strength are no longer written per palette (DS29).
  expect(root.getPropertyValue("--shadow-color-override")).toBe("");
  expect(root.getPropertyValue("--action-shadow-color-override")).toBe("");
  expect(root.getPropertyValue("--shadow-opacity-override")).toBe("");
});

it("writes the accent and text delta of a palette, then cleans up and drops a custom text override", () => {
  const rubi = PALLETE.find((p) => p.id === "red");
  if (!rubi) throw new Error("Red palette is missing");
  const root = document.documentElement.style;

  // A custom theme sets an exact text color; switching to a palette must drop it.
  applyPaletteVars({
    light: { primary: { h: 0, c: 0, l: 0 }, fg: { h: 10, c: 0.01, l: 0.2 } },
    dark: { primary: { h: 0, c: 0, l: 1 }, fg: { h: 10, c: 0.01, l: 0.9 } },
  });
  expect(root.getPropertyValue("--foreground-override")).not.toBe("");

  applyPaletteVars(rubi);
  expect(root.getPropertyValue("--accent-override")).toBe(
    `oklch(${rubi.light.accent.l} ${rubi.light.accent.c} ${rubi.light.accent.h})`,
  );
  expect(root.getPropertyValue("--dark-accent-override")).toBe(
    `oklch(${rubi.dark.accent.l} ${rubi.dark.accent.c} ${rubi.dark.accent.h})`,
  );
  expect(root.getPropertyValue("--foreground-l-delta")).toBe(
    String(rubi.light.fgLDelta),
  );
  expect(root.getPropertyValue("--dark-foreground-l-delta")).toBe(
    String(rubi.dark.fgLDelta),
  );
  expect(root.getPropertyValue("--foreground-override")).toBe("");
  expect(root.getPropertyValue("--dark-foreground-override")).toBe("");

  applyPaletteVars({
    light: { primary: { h: 0, c: 0, l: 0 } },
    dark: { primary: { h: 0, c: 0, l: 1 } },
  });
  expect(root.getPropertyValue("--accent-override")).toBe("");
  expect(root.getPropertyValue("--dark-accent-override")).toBe("");
  expect(root.getPropertyValue("--foreground-l-delta")).toBe("");
});
