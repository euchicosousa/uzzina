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

it("applies shadowColor and topBorderColor and cleans up", () => {
  const magenta = PALLETE.find((p) => p.id === "magenta");
  if (!magenta) throw new Error("Magenta palette is missing");
  expect(magenta.shadowColor).toBe("oklch(0.25 0.15 350)");

  applyPaletteVars(magenta);
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

it("applies light and dark ring overrides without overriding the derived accent, then cleans up", () => {
  const rubi = PALLETE.find((p) => p.id === "red");
  if (!rubi) throw new Error("Red palette is missing");
  applyPaletteVars(rubi);
  const root = document.documentElement.style;
  expect(root.getPropertyValue("--ring-override")).toBe(
    `oklch(${rubi.light.ring.l} ${rubi.light.ring.c} ${rubi.light.ring.h})`,
  );
  expect(root.getPropertyValue("--dark-ring-override")).toBe(
    `oklch(${rubi.dark.ring.l} ${rubi.dark.ring.c} ${rubi.dark.ring.h})`,
  );
  expect(root.getPropertyValue("--accent-override")).toBe("");
  expect(root.getPropertyValue("--dark-accent-override")).toBe("");

  applyPaletteVars({
    light: { primary: { h: 0, c: 0, l: 0 } },
    dark: { primary: { h: 0, c: 0, l: 1 } },
  });
  expect(root.getPropertyValue("--ring-override")).toBe("");
  expect(root.getPropertyValue("--dark-ring-override")).toBe("");
});
