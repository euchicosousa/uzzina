import "./dom-setup";
import { describe, expect, it } from "bun:test";
import {
  createCustomThemeDraft,
  applyCustomThemeOption,
} from "~/lib/custom-theme";
import { getUserPreferences, type CustomTheme } from "~/lib/preferences";
import { applyPaletteVars } from "~/lib/palette-vars";

describe("DS09 - Custom Theme & DS06 properties integration", () => {
  it("defaults relief to true and preserves existing custom theme values", () => {
    const draft = createCustomThemeDraft(null);
    expect(draft.relief).toBe(true);
    expect(draft.topBorderColor).toBeUndefined();
    expect(draft.light.primaryHex).toBe("#2640A0");
  });

  it("createCustomThemeDraft preserves saved relief and topBorderColor (DS36: no shadow)", () => {
    const saved: CustomTheme = {
      light: {
        primaryHex: "#FF0055",
        primaryFgHex: "#FFFFFF",
        bgHex: "#FAFAFA",
        fgHex: "#111111",
      },
      dark: {
        primaryHex: "#FF2277",
        primaryFgHex: "#FFFFFF",
        bgHex: "#121212",
        fgHex: "#EEEEEE",
      },
      relief: false,
      topBorderColor: "#FFFFFF",
    };

    const draft = createCustomThemeDraft(saved);
    expect(draft.relief).toBe(false);
    expect(draft.topBorderColor).toBe("#FFFFFF");
    expect(draft.light.primaryHex).toBe("#FF0055");
  });

  it("applyCustomThemeOption updates relief and finishes without modifying other keys", () => {
    const draft = createCustomThemeDraft(null);
    const updated = applyCustomThemeOption(draft, "relief", false);
    expect(updated.relief).toBe(false);
    expect(updated.light).toEqual(draft.light);

    const withTopBorder = applyCustomThemeOption(
      updated,
      "topBorderColor",
      "#FFFFFF",
    );
    expect(withTopBorder.topBorderColor).toBe("#FFFFFF");
  });

  it("getUserPreferences parses serialized relief and custom colors with safe defaults", () => {
    const legacy = getUserPreferences({
      preferences: {
        customTheme: {
          light: {
            primaryHex: "#123456",
            primaryFgHex: "#ffffff",
            bgHex: "#ffffff",
            fgHex: "#000000",
          },
          dark: {
            primaryHex: "#654321",
            primaryFgHex: "#ffffff",
            bgHex: "#000000",
            fgHex: "#ffffff",
          },
        },
      },
    });

    expect(legacy.customTheme?.relief).toBe(true);
    expect(legacy.customTheme?.shadowColor).toBeUndefined();
    expect(legacy.customTheme?.topBorderColor).toBeUndefined();

    const modern = getUserPreferences({
      preferences: {
        customTheme: {
          light: {
            primaryHex: "#123456",
            primaryFgHex: "#ffffff",
            bgHex: "#ffffff",
            fgHex: "#000000",
          },
          dark: {
            primaryHex: "#654321",
            primaryFgHex: "#ffffff",
            bgHex: "#000000",
            fgHex: "#ffffff",
          },
          relief: false,
          shadowColor: "#050510",
          topBorderColor: "#ffffff",
        },
      },
    });

    expect(modern.customTheme?.relief).toBe(false);
    expect(modern.customTheme?.shadowColor).toBe("#050510");
    expect(modern.customTheme?.topBorderColor).toBe("#ffffff");
  });

  it("applyPaletteVars applies custom relief: false turning action top border and shadow transparent", () => {
    const root = document.documentElement;

    applyPaletteVars({
      relief: false,
      light: {
        primary: { h: 200, c: 0.1, l: 0.5 },
      },
      dark: {
        primary: { h: 200, c: 0.1, l: 0.5 },
      },
    });

    expect(root.style.getPropertyValue("--action-top-border-override")).toBe(
      "transparent",
    );
    expect(root.style.getPropertyValue("--action-shadow-override")).toBe(
      "0 0 #0000",
    );
    expect(root.style.getPropertyValue("--action-hover-shadow-override")).toBe(
      "0 0 #0000",
    );

    // Now restore relief: true with custom shadow and top border
    applyPaletteVars({
      relief: true,
      light: {
        primary: { h: 200, c: 0.1, l: 0.5 },
      },
      dark: {
        primary: { h: 200, c: 0.1, l: 0.5 },
      },
    });

    // The top border of the custom theme is written by useAppTheme (DS36).
    expect(root.style.getPropertyValue("--action-top-border-override")).toBe(
      "",
    );
    // The shadow is the shared formula now: no per-theme shadow override (DS36).
    expect(root.style.getPropertyValue("--action-shadow-color-override")).toBe(
      "",
    );
  });
  it("keeps per-mode shadow color and opacity and ignores invalid opacity", () => {
    const colors = {
      primaryFgHex: "#ffffff",
      bgHex: "#ffffff",
      fgHex: "#000000",
    };
    const parse = (extra: Record<string, unknown>) =>
      getUserPreferences({
        preferences: {
          customTheme: {
            light: { primaryHex: "#123456", ...colors },
            dark: { primaryHex: "#654321", ...colors },
            ...extra,
          },
        },
      }).customTheme;

    const valid = parse({
      shadowColor: "#112233",
      darkShadowColor: "#000011",
      shadowOpacity: 12,
      darkShadowOpacity: 60,
    });
    expect(valid?.darkShadowColor).toBe("#000011");
    expect(valid?.shadowOpacity).toBe(12);
    expect(valid?.darkShadowOpacity).toBe(60);

    const invalid = parse({ shadowOpacity: 0, darkShadowOpacity: "50" });
    expect(invalid?.shadowOpacity).toBeUndefined();
    expect(invalid?.darkShadowOpacity).toBeUndefined();
  });

  it("writes no shadow override with relief off (shadow is shared, DS29)", () => {
    const root = document.documentElement;
    applyPaletteVars({
      relief: false,
      light: {
        primary: { h: 200, c: 0.1, l: 0.5 },
      },
      dark: {
        primary: { h: 200, c: 0.1, l: 0.5 },
      },
    });
    expect(root.style.getPropertyValue("--shadow-color-override")).toBe("");
    expect(root.style.getPropertyValue("--dark-shadow-color-override")).toBe(
      "",
    );
    expect(root.style.getPropertyValue("--shadow-opacity-override")).toBe("");
  });
});
