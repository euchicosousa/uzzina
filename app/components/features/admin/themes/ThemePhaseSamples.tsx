import { MoonIcon, SunIcon } from "lucide-react";
import type { OklchColor } from "~/utils/color";
import { formatOklchString } from "~/utils/color";
import type { PaletteConfig, SharedColors } from "~/lib/palettes";
import { getPhaseFormula } from "./theme-editor-model";

/**
 * Live samples of the phase derivations. Each sample uses the same formulas as
 * `phase-surface` and `phase-vivid` in tailwind.css, with the values being
 * edited, so a slider shows its effect right in the item.
 */
export type PhaseSampleKind =
  | "soft"
  | "softText"
  | "softRing"
  | "softShadow"
  | "vivid"
  | "vividText"
  | "vividShadow"
  | "vividDim";

export const PHASE_SAMPLE_KIND: Record<string, PhaseSampleKind> = {
  phaseSoft: "soft",
  phaseSoftText: "softText",
  phaseSoftRing: "softRing",
  phaseSoftShadow: "softShadow",
  phaseVivid: "vivid",
  phaseVividText: "vividText",
  phaseVividShadow: "vividShadow",
  phaseVividDim: "vividDim",
};

interface SampleCard {
  caption: string;
  style: React.CSSProperties;
  /** Show "Aa" in the text color instead of the caption only. */
  text?: boolean;
}

function cards(
  kind: PhaseSampleKind,
  mode: "light" | "dark",
  shared: SharedColors,
  palette: PaletteConfig,
  phase: OklchColor,
): SampleCard[] {
  const f = (key: Parameters<typeof getPhaseFormula>[1]) =>
    getPhaseFormula(shared, key, mode);
  const color = formatOklchString(phase);
  const bg = formatOklchString(palette[mode].bg);
  const fill = (mix: number) => `color-mix(in oklab, ${color} ${mix}%, ${bg})`;
  const softText = `oklch(from ${color} ${f("textL")} ${f("textC")} h)`;
  const ink = `oklch(from ${color} ${f("inkL")} ${f("inkC")} h)`;
  const shadowColor = `oklch(from ${color} ${f("shadowL")} ${f("shadowC")} h)`;
  const shadow = `color-mix(in srgb, ${shadowColor} ${f("shadowAlpha")}%, transparent)`;
  const diffuse =
    mode === "dark"
      ? `, 0 14px 30px -4px color-mix(in srgb, oklch(from ${color} ${f("diffuseL")} ${f("diffuseC")} h) ${f("diffuseAlpha")}%, transparent)`
      : "";
  const vividFill = color;
  const vividEdge = `oklch(from ${vividFill} calc(l - ${f("edgeDl")}) c h)`;
  const vividHover = `oklch(from ${vividFill} calc(l + ${f("hoverDl")}) max(0, calc(c - 0.01)) h)`;

  switch (kind) {
    case "soft":
      return [
        {
          caption: "Repouso",
          style: { backgroundColor: fill(f("mix")), color: softText },
          text: true,
        },
        {
          caption: "Hover",
          style: { backgroundColor: fill(f("mixHover")), color: softText },
          text: true,
        },
      ];
    case "softText":
      return [
        {
          caption: "Texto",
          style: { backgroundColor: fill(f("mix")), color: softText },
          text: true,
        },
      ];
    case "softRing":
      return [
        {
          caption: "Anel",
          style: {
            backgroundColor: fill(f("mix")),
            color: softText,
            border: `2px solid color-mix(in srgb, ${color} ${f("ringAlpha")}%, transparent)`,
          },
          text: true,
        },
      ];
    case "softShadow":
      return [
        {
          caption: "Sombra no hover",
          style: {
            backgroundColor: fill(f("mixHover")),
            color: softText,
            boxShadow: `0 10px 15px -3px ${shadow}, 0 4px 6px -4px ${shadow}${diffuse}`,
          },
          text: true,
        },
      ];
    case "vivid":
      return [
        {
          caption: "Repouso",
          style: {
            backgroundColor: vividFill,
            color: ink,
            border: `1px solid ${vividEdge}`,
          },
          text: true,
        },
        {
          caption: "Hover",
          style: {
            backgroundColor: vividHover,
            color: ink,
            border: `1px solid ${vividEdge}`,
          },
          text: true,
        },
      ];
    case "vividText": {
      const inkLight = `oklch(from ${color} ${f("inkLightL")} ${f("inkLightC")} h)`;
      return [
        {
          caption: "Texto escuro",
          style: { backgroundColor: vividFill, color: ink },
          text: true,
        },
        {
          caption: "Texto claro",
          style: { backgroundColor: vividFill, color: inkLight },
          text: true,
        },
      ];
    }
    case "vividDim": {
      // Only the dark mode has an attenuated fill; light keeps the pure one.
      if (mode === "light") {
        return [
          {
            caption: "Pura (sem efeito no claro)",
            style: { backgroundColor: vividFill, color: ink },
            text: true,
          },
        ];
      }
      const dim = `oklch(from ${color} ${f("dimL")} calc(c * ${f("dimCFactor")}) h)`;
      return [
        {
          caption: "Pura",
          style: { backgroundColor: vividFill, color: ink },
          text: true,
        },
        {
          caption: "Atenuada",
          style: { backgroundColor: dim, color: ink },
          text: true,
        },
      ];
    }
    case "vividShadow": {
      const vs = `color-mix(in srgb, oklch(from ${color} ${f("vividShadowL")} ${f("vividShadowC")} h) 40%, transparent)`;
      return [
        {
          caption: "Sombra no hover",
          style: {
            backgroundColor: vividHover,
            color: ink,
            boxShadow: `0 10px 15px -3px ${vs}, 0 4px 6px -4px ${vs}`,
          },
          text: true,
        },
      ];
    }
  }
}

/** Header sample: the first card of each mode, as a small "Aa" square. */
export function phaseSampleStyles(
  kind: PhaseSampleKind,
  shared: SharedColors,
  palette: PaletteConfig,
  phase: OklchColor,
): { light: React.CSSProperties; dark: React.CSSProperties } {
  const pick = (mode: "light" | "dark") => {
    const list = cards(kind, mode, shared, palette, phase);
    const card = list[list.length - 1];
    return card.style;
  };
  return { light: pick("light"), dark: pick("dark") };
}

/** Open-panel sample: the cards of each mode over that mode's page background. */
export function PhaseSampleTiles({
  kind,
  shared,
  palette,
  phase,
  phaseTitle,
}: {
  kind: PhaseSampleKind;
  shared: SharedColors;
  palette: PaletteConfig;
  phase: OklchColor;
  phaseTitle: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(["light", "dark"] as const).map((mode) => (
        <div
          className="flex flex-col gap-3 rounded-2xl border p-3 squircle"
          key={mode}
          style={{ backgroundColor: formatOklchString(palette[mode].bg) }}
        >
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{
              color: `oklch(from ${formatOklchString(palette[mode].bg)} calc(l + ${shared.formulas.support.lDelta[mode]}) c h)`,
            }}
          >
            {mode === "light" ? (
              <SunIcon className="size-3.5" />
            ) : (
              <MoonIcon className="size-3.5" />
            )}
            {mode === "light" ? "Claro" : "Escuro"}
          </div>
          {cards(kind, mode, shared, palette, phase).map((card) => (
            <div
              className="flex flex-col gap-0.5 rounded-xl px-3 py-2.5 squircle"
              key={card.caption}
              style={card.style}
            >
              <span className="text-base font-medium">{phaseTitle}</span>
              <span className="text-xs opacity-80">{card.caption}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
