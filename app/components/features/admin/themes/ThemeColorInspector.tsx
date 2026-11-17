import { useState } from "react";
import { parseColor } from "react-aria-components";
import {
  ChevronDownIcon,
  LockIcon,
  MoonIcon,
  RotateCcwIcon,
  SunIcon,
} from "lucide-react";
import { cn } from "cnfast";
import {
  PrismBadge,
  PrismButton,
  PrismColorField,
  PrismSlider,
  PrismSliderFill,
  PrismSliderThumb,
  PrismSliderTrack,
} from "~/components/prism";
import { UPreferenceSwitch } from "~/components/uzzina/UPreferenceSwitch";
import { PHASES } from "~/lib/CONSTANTS";
import type { PaletteConfig } from "~/lib/palettes";
import {
  formatOklchString,
  getOklchContrastRatio,
  hexToOklch,
  isOklchInSrgbGamut,
  oklchToHex,
  type OklchColor,
} from "~/utils/color";
import {
  getEffectiveDelta,
  getEffectivePrimaryFg,
  getOriginalPhasesMap,
  getOriginalPrioritiesMap,
  getPaletteById,
  getShadowOklch,
  PHASE_ORDER,
  type DeltaKey,
  type PaletteColorKey,
  type PhaseSlug,
  type PhasesColorMap,
  type PrioritiesColorMap,
  type PriorityKey,
} from "./theme-editor-model";

interface ThemeColorInspectorProps {
  palette: PaletteConfig;
  phases: PhasesColorMap;
  priorities: PrioritiesColorMap;
  onChangePaletteColor: (
    mode: "light" | "dark",
    key: PaletteColorKey,
    color: OklchColor,
  ) => void;
  onChangeDelta: (mode: "light" | "dark", key: DeltaKey, value: number) => void;
  onChangeShadowColor: (mode: "light" | "dark", color: OklchColor) => void;
  onChangeShadowOpacity: (mode: "light" | "dark", value: number) => void;
  onChangeRelief: (relief: boolean) => void;
  onChangePhase: (slug: PhaseSlug, color: OklchColor) => void;
  onChangePriority: (
    mode: "light" | "dark",
    key: PriorityKey,
    color: OklchColor,
  ) => void;
  onHoverTarget: (target: string | null) => void;
}

interface OklchChannelSlidersProps {
  modeLabel?: string;
  color: OklchColor;
  onChange: (next: OklchColor) => void;
  onReset?: () => void;
  isDirty?: boolean;
}

function OklchChannelSliders({
  modeLabel,
  color,
  onChange,
  onReset,
  isDirty,
}: OklchChannelSlidersProps) {
  const hex = oklchToHex(color.h, color.c, color.l);
  const outOfGamut = !isOklchInSrgbGamut(color);

  const lGradient = `linear-gradient(to right, oklch(0 ${color.c} ${color.h}), oklch(0.5 ${color.c} ${color.h}), oklch(1 ${color.c} ${color.h}))`;
  const cGradient = `linear-gradient(to right, oklch(${color.l} 0 ${color.h}), oklch(${color.l} 0.2 ${color.h}), oklch(${color.l} 0.4 ${color.h}))`;
  const hGradient = `linear-gradient(to right, oklch(${color.l} ${Math.max(0.12, color.c)} 0), oklch(${color.l} ${Math.max(0.12, color.c)} 60), oklch(${color.l} ${Math.max(0.12, color.c)} 120), oklch(${color.l} ${Math.max(0.12, color.c)} 180), oklch(${color.l} ${Math.max(0.12, color.c)} 240), oklch(${color.l} ${Math.max(0.12, color.c)} 300), oklch(${color.l} ${Math.max(0.12, color.c)} 360))`;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {modeLabel && (
            <span className="text-xs font-medium text-foreground">
              {modeLabel}
            </span>
          )}
          <span className="font-mono text-xs text-secondary-foreground">
            {formatOklchString(color)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {outOfGamut && (
            <PrismBadge variant="warning">Fora da tela</PrismBadge>
          )}
          {isDirty && onReset && (
            <PrismButton
              aria-label="Restaurar original"
              onPress={onReset}
              size="xs"
              variant="ghost"
            >
              Restaurar
              <RotateCcwIcon />
            </PrismButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_92px] items-center gap-2">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[64px_1fr_44px] items-center gap-2">
            <span className="text-xs text-secondary-foreground">Luz</span>
            <PrismSlider
              aria-label={`Luz ${modeLabel ?? ""}`}
              maxValue={1}
              minValue={0}
              onChange={(v) =>
                onChange({ ...color, l: typeof v === "number" ? v : v[0] })
              }
              step={0.005}
              value={Math.max(0, Math.min(1, color.l))}
            >
              <PrismSliderTrack
                className="h-2.5 border border-foreground/10"
                style={{ background: lGradient }}
              >
                <PrismSliderThumb />
              </PrismSliderTrack>
            </PrismSlider>
            <span className="text-right font-mono text-xs text-secondary-foreground tabular-nums">
              {color.l.toFixed(3)}
            </span>
          </div>

          <div className="grid grid-cols-[64px_1fr_44px] items-center gap-2">
            <span className="text-xs text-secondary-foreground">Saturação</span>
            <PrismSlider
              aria-label={`Saturação ${modeLabel ?? ""}`}
              maxValue={0.4}
              minValue={0}
              onChange={(v) =>
                onChange({ ...color, c: typeof v === "number" ? v : v[0] })
              }
              step={0.002}
              value={Math.max(0, Math.min(0.4, color.c))}
            >
              <PrismSliderTrack
                className="h-2.5 border border-foreground/10"
                style={{ background: cGradient }}
              >
                <PrismSliderThumb />
              </PrismSliderTrack>
            </PrismSlider>
            <span className="text-right font-mono text-xs text-secondary-foreground tabular-nums">
              {color.c.toFixed(3)}
            </span>
          </div>

          <div className="grid grid-cols-[64px_1fr_44px] items-center gap-2">
            <span className="text-xs text-secondary-foreground">Matiz</span>
            <PrismSlider
              aria-label={`Matiz ${modeLabel ?? ""}`}
              maxValue={360}
              minValue={0}
              onChange={(v) =>
                onChange({ ...color, h: typeof v === "number" ? v : v[0] })
              }
              step={1}
              value={Math.max(0, Math.min(360, color.h))}
            >
              <PrismSliderTrack
                className="h-2.5 border border-foreground/10"
                style={{ background: hGradient }}
              >
                <PrismSliderThumb />
              </PrismSliderTrack>
            </PrismSlider>
            <span className="text-right font-mono text-xs text-secondary-foreground tabular-nums">
              {Math.round(color.h)}°
            </span>
          </div>
        </div>

        <PrismColorField
          aria-label={`Hexadecimal ${modeLabel ?? ""}`}
          inputClassName="px-2.5 text-center text-xs"
          onChange={(parsed) => {
            if (!parsed) return;
            const nextHex = parsed.toString("hex").slice(0, 7);
            onChange(hexToOklch(nextHex));
          }}
          size="sm"
          value={parseColor(hex)}
        />
      </div>
    </div>
  );
}

function DualSwatch({
  lightStyle,
  darkStyle,
  label,
  small,
}: {
  lightStyle: React.CSSProperties;
  darkStyle: React.CSSProperties;
  label?: string;
  small?: boolean;
}) {
  const sizeClass = small ? "size-6 rounded-lg" : "size-7 rounded-xl";
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span
        className={cn(
          sizeClass,
          "inline-flex items-center justify-center border border-foreground/15 text-xs font-semibold squircle",
        )}
        style={lightStyle}
      >
        {label}
      </span>
      <span
        className={cn(
          sizeClass,
          "inline-flex items-center justify-center border border-foreground/15 text-xs font-semibold squircle",
        )}
        style={darkStyle}
      >
        {label}
      </span>
    </div>
  );
}

function formatDelta(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}`;
}

function computeModeCardColor(
  palette: PaletteConfig,
  mode: "light" | "dark",
  deltaKey: DeltaKey,
): string {
  const bg = palette[mode].bg;
  const delta = getEffectiveDelta(palette, mode, deltaKey);
  return formatOklchString({
    l: Math.max(0, Math.min(1, bg.l + delta)),
    c: bg.c,
    h: bg.h,
  });
}

export function ThemeColorInspector({
  palette,
  phases,
  priorities,
  onChangePaletteColor,
  onChangeDelta,
  onChangeShadowColor,
  onChangeShadowOpacity,
  onChangeRelief,
  onChangePhase,
  onChangePriority,
  onHoverTarget,
}: ThemeColorInspectorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const originalPalette = getPaletteById(palette.id);
  const originalPhases = getOriginalPhasesMap();
  const originalPriorities = getOriginalPrioritiesMap();

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const fgContrastLight = getOklchContrastRatio(
    palette.light.fg,
    palette.light.bg,
  );
  const fgContrastDark = getOklchContrastRatio(
    palette.dark.fg,
    palette.dark.bg,
  );
  const pFgLight = getEffectivePrimaryFg(palette, "light");
  const pFgDark = getEffectivePrimaryFg(palette, "dark");
  const primaryContrastLight = getOklchContrastRatio(
    pFgLight,
    palette.light.primary,
  );
  const primaryContrastDark = getOklchContrastRatio(
    pFgDark,
    palette.dark.primary,
  );

  const renderDualColorRow = (opts: {
    id: string;
    label: string;
    hint: string;
    targetId: string;
    lightColor: OklchColor;
    darkColor: OklchColor;
    origLight: OklchColor;
    origDark: OklchColor;
    onLightChange: (c: OklchColor) => void;
    onDarkChange: (c: OklchColor) => void;
    swatchLabel?: string;
    lightSwatchStyle?: React.CSSProperties;
    darkSwatchStyle?: React.CSSProperties;
  }) => {
    const isOpen = expandedId === opts.id;
    return (
      <div key={opts.id} className="mt-2">
        <button
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left transition-colors squircle hover:bg-secondary",
            isOpen && "bg-secondary",
          )}
          onClick={() => toggleExpand(opts.id)}
          onMouseEnter={() => onHoverTarget(opts.targetId)}
          onMouseLeave={() => onHoverTarget(null)}
          type="button"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <span className="truncate">{opts.label}</span>
              <ChevronDownIcon
                className={cn(
                  "size-3.5 shrink-0 opacity-60 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </div>
            <div className="truncate text-xs text-secondary-foreground">
              {opts.hint}
            </div>
          </div>

          <DualSwatch
            darkStyle={
              opts.darkSwatchStyle ?? {
                backgroundColor: formatOklchString(opts.darkColor),
              }
            }
            label={opts.swatchLabel}
            lightStyle={
              opts.lightSwatchStyle ?? {
                backgroundColor: formatOklchString(opts.lightColor),
              }
            }
          />
        </button>

        {isOpen && (
          <div className="mt-2 ml-2 flex flex-col gap-4 border-l border-border py-2 pl-3">
            <OklchChannelSliders
              color={opts.lightColor}
              isDirty={
                formatOklchString(opts.lightColor) !==
                formatOklchString(opts.origLight)
              }
              modeLabel="Claro"
              onChange={opts.onLightChange}
              onReset={() => opts.onLightChange({ ...opts.origLight })}
            />
            <OklchChannelSliders
              color={opts.darkColor}
              isDirty={
                formatOklchString(opts.darkColor) !==
                formatOklchString(opts.origDark)
              }
              modeLabel="Escuro"
              onChange={opts.onDarkChange}
              onReset={() => opts.onDarkChange({ ...opts.origDark })}
            />
          </div>
        )}
      </div>
    );
  };

  const renderDeltaRow = (opts: {
    id: string;
    label: string;
    deltaKey: DeltaKey;
    targetId: string;
  }) => {
    const isOpen = expandedId === opts.id;
    const lightVal = getEffectiveDelta(palette, "light", opts.deltaKey);
    const darkVal = getEffectiveDelta(palette, "dark", opts.deltaKey);
    const origLightVal = getEffectiveDelta(
      originalPalette,
      "light",
      opts.deltaKey,
    );
    const origDarkVal = getEffectiveDelta(
      originalPalette,
      "dark",
      opts.deltaKey,
    );

    const lightMax = Math.max(0.35, lightVal, origLightVal);
    const darkMax = Math.max(0.35, darkVal, origDarkVal);

    return (
      <div key={opts.id}>
        <button
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left transition-colors squircle hover:bg-secondary",
            isOpen && "bg-secondary",
          )}
          onClick={() => toggleExpand(opts.id)}
          onMouseEnter={() => onHoverTarget(opts.targetId)}
          onMouseLeave={() => onHoverTarget(null)}
          type="button"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <span className="truncate">{opts.label}</span>
            </div>
            <div className="truncate text-xs text-secondary-foreground">
              Fundo com ajuste de luz
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="flex flex-col items-center gap-0.5">
              <span
                className="size-6 border border-foreground/15 squircle"
                style={{
                  backgroundColor: computeModeCardColor(
                    palette,
                    "light",
                    opts.deltaKey,
                  ),
                }}
              />
              <span className="font-mono text-xs text-secondary-foreground tabular-nums">
                {formatDelta(lightVal)}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span
                className="size-6 border border-foreground/15 squircle"
                style={{
                  backgroundColor: computeModeCardColor(
                    palette,
                    "dark",
                    opts.deltaKey,
                  ),
                }}
              />
              <span className="font-mono text-xs text-secondary-foreground tabular-nums">
                {formatDelta(darkVal)}
              </span>
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="mt-1 mb-2 ml-2 flex flex-col gap-3 border-l border-border py-2 pl-3">
            <p className="text-xs text-secondary-foreground">
              Quanto a luz do fundo sobe (+) ou desce (−). A cor e a saturação
              vêm do Fundo.
            </p>

            {(
              [
                {
                  mode: "light" as const,
                  label: "Claro",
                  val: lightVal,
                  orig: origLightVal,
                  max: lightMax,
                },
                {
                  mode: "dark" as const,
                  label: "Escuro",
                  val: darkVal,
                  orig: origDarkVal,
                  max: darkMax,
                },
              ] as const
            ).map((item) => (
              <div key={item.mode} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-secondary-foreground tabular-nums">
                      {formatDelta(item.val)}
                    </span>
                    {Math.abs(item.val - item.orig) >= 0.0005 && (
                      <PrismButton
                        onPress={() =>
                          onChangeDelta(item.mode, opts.deltaKey, item.orig)
                        }
                        size="xs"
                        variant="ghost"
                      >
                        Restaurar
                        <RotateCcwIcon />
                      </PrismButton>
                    )}
                  </div>
                </div>
                <PrismSlider
                  aria-label={`${opts.label} ${item.label}`}
                  maxValue={item.max}
                  minValue={-0.35}
                  onChange={(v) =>
                    onChangeDelta(
                      item.mode,
                      opts.deltaKey,
                      typeof v === "number" ? v : v[0],
                    )
                  }
                  step={0.005}
                  value={item.val}
                >
                  <PrismSliderTrack>
                    <PrismSliderFill />
                    <PrismSliderThumb />
                  </PrismSliderTrack>
                </PrismSlider>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLockedRuleRow = (opts: {
    id: string;
    label: string;
    hint: string;
    targetId: string;
    lightBadge: string;
    darkBadge: string;
    lightColor: string;
    darkColor: string;
  }) => (
    <div
      key={opts.id}
      className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 squircle"
      onMouseEnter={() => onHoverTarget(opts.targetId)}
      onMouseLeave={() => onHoverTarget(null)}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <span className="truncate">{opts.label}</span>
          <LockIcon className="size-3 shrink-0 opacity-60" />
        </div>
        <div className="truncate text-xs text-secondary-foreground">
          {opts.hint}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="size-6 border border-foreground/15 squircle"
            style={{ backgroundColor: opts.lightColor }}
          />
          <span className="font-mono text-xs text-secondary-foreground tabular-nums">
            {opts.lightBadge}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="size-6 border border-foreground/15 squircle"
            style={{ backgroundColor: opts.darkColor }}
          />
          <span className="font-mono text-xs text-secondary-foreground tabular-nums">
            {opts.darkBadge}
          </span>
        </div>
      </div>
    </div>
  );

  const shadowLight = getShadowOklch(palette, "light");
  const shadowDark = getShadowOklch(palette, "dark");
  const origShadowLight = getShadowOklch(originalPalette, "light");
  const origShadowDark = getShadowOklch(originalPalette, "dark");

  return (
    <div className="flex flex-col divide-y divide-border pb-8">
      {/* 1. Base */}
      <section className="flex flex-col gap-1 pb-6">
        <div className="flex items-center justify-between px-2 pb-1">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Base</h2>
            <p className="text-xs text-secondary-foreground">
              Só da paleta {palette.label}
            </p>
          </div>
          <div className="flex items-center gap-4 pr-1 text-secondary-foreground">
            <SunIcon className="size-3.5" />
            <MoonIcon className="size-3.5" />
          </div>
        </div>

        {renderDualColorRow({
          id: "bg",
          label: "Fundo",
          hint: "Fundo da página",
          targetId: "bg",
          lightColor: palette.light.bg,
          darkColor: palette.dark.bg,
          origLight: originalPalette.light.bg,
          origDark: originalPalette.dark.bg,
          onLightChange: (c) => onChangePaletteColor("light", "bg", c),
          onDarkChange: (c) => onChangePaletteColor("dark", "bg", c),
        })}

        <div className="ml-3 flex flex-col gap-1 border-l border-border pl-2">
          {renderDeltaRow({
            id: "card",
            label: "Cartão",
            deltaKey: "cardLDelta",
            targetId: "card",
          })}
          {renderDeltaRow({
            id: "popover",
            label: "Menus e diálogos",
            deltaKey: "popoverLDelta",
            targetId: "popover",
          })}
          {renderDeltaRow({
            id: "input",
            label: "Campos",
            deltaKey: "inputLDelta",
            targetId: "input",
          })}
          {renderDeltaRow({
            id: "border",
            label: "Bordas",
            deltaKey: "borderLDelta",
            targetId: "border",
          })}
          {renderDeltaRow({
            id: "action",
            label: "Cartão de ação",
            deltaKey: "actionLDelta",
            targetId: "action",
          })}
          {renderDeltaRow({
            id: "actionHover",
            label: "Cartão de ação · mouse",
            deltaKey: "actionHoverLDelta",
            targetId: "actionHover",
          })}
        </div>

        {renderDualColorRow({
          id: "fg",
          label: "Texto",
          hint: `Contraste ${fgContrastLight.toFixed(1)} · ${fgContrastDark.toFixed(1)}`,
          targetId: "fg",
          lightColor: palette.light.fg,
          darkColor: palette.dark.fg,
          origLight: originalPalette.light.fg,
          origDark: originalPalette.dark.fg,
          onLightChange: (c) => onChangePaletteColor("light", "fg", c),
          onDarkChange: (c) => onChangePaletteColor("dark", "fg", c),
          swatchLabel: "Aa",
          lightSwatchStyle: {
            backgroundColor: formatOklchString(palette.light.bg),
            color: formatOklchString(palette.light.fg),
          },
          darkSwatchStyle: {
            backgroundColor: formatOklchString(palette.dark.bg),
            color: formatOklchString(palette.dark.fg),
          },
        })}

        <div className="ml-3 flex flex-col gap-1 border-l border-border pl-2">
          {renderLockedRuleRow({
            id: "secondary",
            label: "Fundo neutro",
            hint: "Texto em transparência (hover, botão secundário)",
            targetId: "secondary",
            lightBadge: "5%",
            darkBadge: "10%",
            lightColor: `color-mix(in srgb, ${formatOklchString(palette.light.fg)} 5%, ${formatOklchString(palette.light.bg)})`,
            darkColor: `color-mix(in oklch, ${formatOklchString(palette.dark.fg)} 10%, ${formatOklchString(palette.dark.bg)})`,
          })}
          {renderLockedRuleRow({
            id: "secondaryFg",
            label: "Texto secundário",
            hint: "Texto a 65%",
            targetId: "secondaryFg",
            lightBadge: "65%",
            darkBadge: "65%",
            lightColor: `color-mix(in srgb, ${formatOklchString(palette.light.fg)} 65%, ${formatOklchString(palette.light.bg)})`,
            darkColor: `color-mix(in srgb, ${formatOklchString(palette.dark.fg)} 65%, ${formatOklchString(palette.dark.bg)})`,
          })}
        </div>

        {renderDualColorRow({
          id: "primary",
          label: "Principal",
          hint: "Botão principal, seleção",
          targetId: "primary",
          lightColor: palette.light.primary,
          darkColor: palette.dark.primary,
          origLight: originalPalette.light.primary,
          origDark: originalPalette.dark.primary,
          onLightChange: (c) => onChangePaletteColor("light", "primary", c),
          onDarkChange: (c) => onChangePaletteColor("dark", "primary", c),
        })}

        <div className="ml-3 flex flex-col gap-1 border-l border-border pl-2">
          {renderLockedRuleRow({
            id: "primaryHover",
            label: "Principal · mouse",
            hint: "Principal com 20% do fundo",
            targetId: "primaryHover",
            lightBadge: "20%",
            darkBadge: "20%",
            lightColor: `color-mix(in oklab, ${formatOklchString(palette.light.primary)}, ${formatOklchString(palette.light.bg)} 20%)`,
            darkColor: `color-mix(in oklab, ${formatOklchString(palette.dark.primary)}, ${formatOklchString(palette.dark.bg)} 20%)`,
          })}
        </div>

        {renderDualColorRow({
          id: "primaryFg",
          label: "Texto sobre a principal",
          hint: `Contraste ${primaryContrastLight.toFixed(1)} · ${primaryContrastDark.toFixed(1)}`,
          targetId: "primaryFg",
          lightColor: pFgLight,
          darkColor: pFgDark,
          origLight: getEffectivePrimaryFg(originalPalette, "light"),
          origDark: getEffectivePrimaryFg(originalPalette, "dark"),
          onLightChange: (c) => onChangePaletteColor("light", "primaryFg", c),
          onDarkChange: (c) => onChangePaletteColor("dark", "primaryFg", c),
          swatchLabel: "Aa",
          lightSwatchStyle: {
            backgroundColor: formatOklchString(palette.light.primary),
            color: formatOklchString(pFgLight),
          },
          darkSwatchStyle: {
            backgroundColor: formatOklchString(palette.dark.primary),
            color: formatOklchString(pFgDark),
          },
        })}

        {renderDualColorRow({
          id: "ring",
          label: "Anel de foco",
          hint: "Contorno de teclado",
          targetId: "ring",
          lightColor: palette.light.ring,
          darkColor: palette.dark.ring,
          origLight: originalPalette.light.ring,
          origDark: originalPalette.dark.ring,
          onLightChange: (c) => onChangePaletteColor("light", "ring", c),
          onDarkChange: (c) => onChangePaletteColor("dark", "ring", c),
        })}

        <div className="ml-3 flex flex-col gap-1 border-l border-border pl-2">
          {renderLockedRuleRow({
            id: "ringHalo",
            label: "Halo de foco",
            hint: "Anel a 30%",
            targetId: "ringHalo",
            lightBadge: "30%",
            darkBadge: "30%",
            lightColor: `color-mix(in oklab, ${formatOklchString(palette.light.ring)} 30%, ${formatOklchString(palette.light.bg)})`,
            darkColor: `color-mix(in oklab, ${formatOklchString(palette.dark.ring)} 30%, ${formatOklchString(palette.dark.bg)})`,
          })}
        </div>
      </section>

      {/* 2. Sombra e relevo */}
      <section className="flex flex-col gap-2 py-6">
        <div className="px-2">
          <h2 className="text-sm font-semibold text-foreground">
            Sombra e relevo
          </h2>
          <p className="text-xs text-secondary-foreground">
            Só da paleta {palette.label}
          </p>
        </div>

        {renderDualColorRow({
          id: "shadow",
          label: "Cor da sombra",
          hint: "Menus, diálogos e cartões",
          targetId: "shadow",
          lightColor: shadowLight,
          darkColor: shadowDark,
          origLight: origShadowLight,
          origDark: origShadowDark,
          onLightChange: (c) => onChangeShadowColor("light", c),
          onDarkChange: (c) => onChangeShadowColor("dark", c),
        })}

        <div className="ml-3 flex flex-col gap-2 border-l border-border pl-3">
          <div
            className="flex flex-col gap-2 py-1"
            onMouseEnter={() => onHoverTarget("shadowOpacity")}
            onMouseLeave={() => onHoverTarget(null)}
          >
            <div className="flex items-center justify-between text-sm text-foreground">
              <span>Força da sombra</span>
              <span className="font-mono text-xs text-secondary-foreground tabular-nums">
                {palette.light.shadowOpacity}% · {palette.dark.shadowOpacity}%
              </span>
            </div>
            {(["light", "dark"] as const).map((m) => (
              <div
                key={m}
                className="grid grid-cols-[54px_1fr_36px] items-center gap-2"
              >
                <span className="text-xs text-secondary-foreground">
                  {m === "light" ? "Claro" : "Escuro"}
                </span>
                <PrismSlider
                  aria-label={`Força da sombra ${m === "light" ? "Claro" : "Escuro"}`}
                  maxValue={100}
                  minValue={1}
                  onChange={(v) =>
                    onChangeShadowOpacity(m, typeof v === "number" ? v : v[0])
                  }
                  step={1}
                  value={palette[m].shadowOpacity}
                >
                  <PrismSliderTrack>
                    <PrismSliderFill />
                    <PrismSliderThumb />
                  </PrismSliderTrack>
                </PrismSlider>
                <span className="text-right font-mono text-xs text-secondary-foreground tabular-nums">
                  {palette[m].shadowOpacity}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="px-2 pt-2"
          onMouseEnter={() => onHoverTarget("relief")}
          onMouseLeave={() => onHoverTarget(null)}
        >
          <UPreferenceSwitch
            checked={palette.relief !== false}
            description="Sombra e brilho no topo"
            id="theme-editor-relief"
            label="Relevo dos cartões"
            onCheckedChange={onChangeRelief}
          />
        </div>
      </section>

      {/* 3. Fases */}
      <section className="flex flex-col gap-1 py-6">
        <div className="px-2 pb-1">
          <h2 className="text-sm font-semibold text-foreground">Fases</h2>
          <p className="text-xs text-secondary-foreground">
            Valem para todas as paletas · Suave: 7% claro / 14% escuro. Viva:
            cor cheia.
          </p>
        </div>

        {PHASE_ORDER.map((slug) => {
          const id = `ph-${slug}`;
          const isOpen = expandedId === id;
          const color = phases[slug];
          const orig = originalPhases[slug];
          const hex = oklchToHex(color.h, color.c, color.l);

          return (
            <div key={slug} className="mt-2">
              <button
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left transition-colors squircle hover:bg-secondary",
                  isOpen && "bg-secondary",
                )}
                onClick={() => toggleExpand(id)}
                onMouseEnter={() => onHoverTarget(id)}
                onMouseLeave={() => onHoverTarget(null)}
                type="button"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <span>{PHASES[slug].title}</span>
                    <ChevronDownIcon
                      className={cn(
                        "size-3.5 opacity-60 transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </div>
                  <div className="font-mono text-xs text-secondary-foreground">
                    {hex}
                  </div>
                </div>

                <span
                  className="size-7 shrink-0 rounded-xl border border-foreground/15 squircle"
                  style={{ backgroundColor: hex }}
                />
              </button>

              {isOpen && (
                <div className="mt-2 ml-2 border-l border-border py-2 pl-3">
                  <OklchChannelSliders
                    color={color}
                    isDirty={
                      formatOklchString(color) !== formatOklchString(orig)
                    }
                    onChange={(c) => onChangePhase(slug, c)}
                    onReset={() => onChangePhase(slug, { ...orig })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* 4. Avisos */}
      <section className="flex flex-col gap-1 py-6">
        <div className="px-2 pb-1">
          <h2 className="text-sm font-semibold text-foreground">Avisos</h2>
          <p className="text-xs text-secondary-foreground">
            Valem para todas as paletas · Hoje são fórmulas fixas no código.
          </p>
        </div>

        {[
          {
            id: "error",
            label: "Erro",
            lightBg: "oklch(0.95 0.04 16)",
            lightFg: "oklch(0.6 0.22 16)",
            darkBg: "oklch(0.32 0.05 16)",
            darkFg: "oklch(0.86 0.2 16)",
          },
          {
            id: "warning",
            label: "Atenção",
            lightBg: "oklch(0.96 0.03 70)",
            lightFg: "oklch(0.5 0.2 70)",
            darkBg: "oklch(0.32 0.04 90)",
            darkFg: "oklch(1 0.2 90)",
          },
          {
            id: "success",
            label: "Sucesso",
            lightBg: "oklch(0.95 0.03 163)",
            lightFg: "oklch(0.42 0.14 163)",
            darkBg: "oklch(0.3 0.05 163)",
            darkFg: "oklch(0.65 0.16 163)",
          },
          {
            id: "info",
            label: "Informação",
            lightBg: "oklch(0.95 0.03 250)",
            lightFg: "oklch(0.5 0.2 250)",
            darkBg: "oklch(0.3 0.05 250)",
            darkFg: "oklch(0.84 0.2 250)",
          },
        ].map((item) => (
          <div
            key={item.id}
            className="mt-2 flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 squircle"
            onMouseEnter={() => onHoverTarget(item.id)}
            onMouseLeave={() => onHoverTarget(null)}
          >
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <span>{item.label}</span>
                <LockIcon className="size-3 opacity-60" />
              </div>
              <div className="text-xs text-secondary-foreground">
                Fundo e texto do aviso
              </div>
            </div>
            <DualSwatch
              darkStyle={{ backgroundColor: item.darkBg, color: item.darkFg }}
              label="Aa"
              lightStyle={{
                backgroundColor: item.lightBg,
                color: item.lightFg,
              }}
            />
          </div>
        ))}
      </section>

      {/* 5. Prioridades */}
      <section className="flex flex-col gap-1 pt-6">
        <div className="px-2 pb-1">
          <h2 className="text-sm font-semibold text-foreground">Prioridades</h2>
          <p className="text-xs text-secondary-foreground">
            Valem para todas as paletas · Quadro de Hoje
          </p>
        </div>

        {(
          [
            { key: "low" as const, label: "Baixa" },
            { key: "medium" as const, label: "Média" },
            { key: "high" as const, label: "Alta" },
          ] as const
        ).map((item) =>
          renderDualColorRow({
            id: `prio-${item.key}`,
            label: item.label,
            hint: "Quadro de Hoje",
            targetId: `prio-${item.key}`,
            lightColor: priorities.light[item.key],
            darkColor: priorities.dark[item.key],
            origLight: originalPriorities.light[item.key],
            origDark: originalPriorities.dark[item.key],
            onLightChange: (c) => onChangePriority("light", item.key, c),
            onDarkChange: (c) => onChangePriority("dark", item.key, c),
          }),
        )}
      </section>
    </div>
  );
}
