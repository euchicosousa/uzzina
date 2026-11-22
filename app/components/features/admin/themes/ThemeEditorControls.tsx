import { useEffect, useRef, useState } from "react";
import { parseColor } from "react-aria-components";
import {
  EyeIcon,
  InfoIcon,
  LockIcon,
  MoonIcon,
  RotateCcwIcon,
  SunIcon,
} from "lucide-react";
import {
  PrismBadge,
  PrismButton,
  PrismColorField,
  PrismPopover,
  PrismPopoverTitle,
  PrismPopoverTrigger,
  PrismSlider,
  PrismSliderFill,
  PrismSliderThumb,
  PrismSliderTrack,
} from "~/components/prism";
import type { PaletteConfig, SharedColors } from "~/lib/palettes";
import {
  formatOklchString,
  hexToOklch,
  isOklchInSrgbGamut,
  oklchToHex,
  type OklchColor,
} from "~/utils/color";
import { getThemeRule } from "./theme-editor-rules";

/*
 * Building blocks of the theme editor panel. Every item of the inspector is
 * made from these, so shapes and spacing stay the same everywhere:
 *
 *   row header  = title + hint on the left, one SwatchPair on the right
 *   open panel  = ModeGroups separated by gap-6
 *   ModeGroup   = header (mode, actions) + ChannelRows separated by gap-3
 *   ChannelRow  = name | slider | value (same three columns everywhere)
 */

const SWATCH =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-foreground/15 text-xs font-semibold squircle";

export function formatDelta(value: number): string {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}`;
}

/** Light swatch, then dark swatch. Always the same size and width. */
export function SwatchPair({
  light,
  dark,
  label,
}: {
  light: React.CSSProperties;
  /** Omit for a color that is the same in both modes (one swatch). */
  dark?: React.CSSProperties;
  label?: string;
}) {
  return (
    <span className="flex w-[5.5rem] shrink-0 items-center justify-end gap-2">
      <span className={SWATCH} style={light}>
        {label}
      </span>
      {dark && (
        <span className={SWATCH} style={dark}>
          {label}
        </span>
      )}
    </span>
  );
}

/** Content of an accordion trigger and of a locked row. */
export function RowHeader({
  label,
  hint,
  locked,
  info,
  swatches,
}: {
  label: string;
  hint?: string;
  locked?: boolean;
  /** Info button placed next to the name (it must be clickable). */
  info?: React.ReactNode;
  swatches: React.ReactNode;
}) {
  return (
    <span className="flex min-w-0 items-center justify-between gap-4">
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-base font-medium text-foreground">
          <span className="truncate">{label}</span>
          {locked && <LockIcon className="size-3 shrink-0 opacity-60" />}
          {info}
        </span>
        {hint && (
          <span className="truncate text-xs font-normal text-secondary-foreground">
            {hint}
          </span>
        )}
      </span>
      {swatches}
    </span>
  );
}

/** Row of the box that holds read-only rules (same padding as a trigger). */
export function LockedRow({ children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className="p-5 not-last:border-b" {...props}>
      {children}
    </div>
  );
}

/** Mode title (Claro / Escuro) with its actions on the right. */
function GroupHeader({
  title,
  mode,
  children,
}: {
  title: string;
  mode?: "light" | "dark";
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-base font-medium text-foreground">
        {mode === "light" && <SunIcon className="size-4 opacity-60" />}
        {mode === "dark" && <MoonIcon className="size-4 opacity-60" />}
        <span className="whitespace-nowrap">{title}</span>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

/**
 * Eye + reset, shown only when the value differs from the original. They sit
 * before the field so the field never moves. Holding the eye shows the original
 * value (in the preview too) and releasing it brings the edit back.
 */
function UndoButtons<T>({
  current,
  original,
  dirty,
  onChange,
}: {
  current: T;
  original: T;
  dirty: boolean;
  onChange: (value: T) => void;
}) {
  const [peeking, setPeeking] = useState(false);
  const saved = useRef<{ value: T } | null>(null);
  const latest = useRef(onChange);
  latest.current = onChange;

  const release = () => {
    const stash = saved.current;
    saved.current = null;
    setPeeking(false);
    if (stash) latest.current(stash.value);
  };

  // Never leave the original on screen if the controls disappear mid-hold.
  useEffect(
    () => () => {
      const stash = saved.current;
      saved.current = null;
      if (stash) latest.current(stash.value);
    },
    [],
  );

  if (!dirty && !peeking) return null;

  return (
    <>
      <PrismButton
        aria-label="Ver o original (segure)"
        onPressEnd={release}
        onPressStart={() => {
          saved.current = { value: current };
          setPeeking(true);
          onChange(original);
        }}
        size="icon-xs"
        variant="ghost"
      >
        <EyeIcon />
      </PrismButton>
      <PrismButton
        aria-label="Restaurar original"
        isDisabled={peeking}
        onPress={() => onChange(original)}
        size="icon-xs"
        variant="ghost"
      >
        <RotateCcwIcon />
      </PrismButton>
    </>
  );
}

/** Name | slider | value. */
function ChannelRow({
  name,
  value,
  display,
  min,
  max,
  step,
  gradient,
  filled,
  onChange,
}: {
  name: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  gradient?: string;
  filled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-[9rem_minmax(0,1fr)_4rem] items-center gap-3">
      <span className="text-base text-secondary-foreground">{name}</span>
      <PrismSlider
        aria-label={name}
        maxValue={max}
        minValue={min}
        onChange={(v) => onChange(typeof v === "number" ? v : v[0])}
        step={step}
        value={Math.max(min, Math.min(max, value))}
      >
        <PrismSliderTrack
          className={gradient ? "border" : undefined}
          style={gradient ? { background: gradient } : undefined}
        >
          {filled && <PrismSliderFill />}
          <PrismSliderThumb />
        </PrismSliderTrack>
      </PrismSlider>
      <span className="text-right font-mono text-base text-secondary-foreground tabular-nums">
        {display}
      </span>
    </div>
  );
}

/** One color in one mode: light, chroma and hue plus the hex field. */
export function ColorGroup({
  title,
  mode,
  color,
  original,
  onChange,
}: {
  title: string;
  mode?: "light" | "dark";
  color: OklchColor;
  original: OklchColor;
  onChange: (next: OklchColor) => void;
}) {
  const hex = oklchToHex(color.h, color.c, color.l);
  const dirty = formatOklchString(color) !== formatOklchString(original);
  const chroma = Math.max(0.12, color.c);
  const hue = [0, 60, 120, 180, 240, 300, 360]
    .map((h) => `oklch(${color.l} ${chroma} ${h})`)
    .join(", ");

  return (
    <div className="flex flex-col gap-3">
      <GroupHeader mode={mode} title={title}>
        {!isOklchInSrgbGamut(color) && (
          <PrismBadge variant="warning">Fora da tela</PrismBadge>
        )}
        <UndoButtons
          current={color}
          dirty={dirty}
          onChange={(c) => onChange({ ...c })}
          original={original}
        />
        <div className="w-24">
          <PrismColorField
            aria-label={`Hexadecimal ${title}`}
            inputClassName="px-2.5 text-center text-xs"
            onChange={(parsed) => {
              if (!parsed) return;
              onChange(hexToOklch(parsed.toString("hex").slice(0, 7)));
            }}
            size="sm"
            value={parseColor(hex)}
          />
        </div>
      </GroupHeader>

      <ChannelRow
        display={color.l.toFixed(3)}
        gradient={`linear-gradient(to right, oklch(0 ${color.c} ${color.h}), oklch(1 ${color.c} ${color.h}))`}
        max={1}
        min={0}
        name="Luz"
        onChange={(l) => onChange({ ...color, l })}
        step={0.005}
        value={color.l}
      />
      <ChannelRow
        display={color.c.toFixed(3)}
        gradient={`linear-gradient(to right, oklch(${color.l} 0 ${color.h}), oklch(${color.l} 0.4 ${color.h}))`}
        max={0.4}
        min={0}
        name="Saturação"
        onChange={(c) => onChange({ ...color, c })}
        step={0.002}
        value={color.c}
      />
      <ChannelRow
        display={`${Math.round(color.h)}°`}
        gradient={`linear-gradient(to right, ${hue})`}
        max={360}
        min={0}
        name="Matiz"
        onChange={(h) => onChange({ ...color, h })}
        step={1}
        value={color.h}
      />
    </div>
  );
}

/** A number in one mode: same group shape as a color, with one row. */
export function ValueGroup({
  title,
  mode,
  name,
  value,
  original,
  min,
  max,
  step,
  format,
  filled = true,
  onChange,
}: {
  title: string;
  mode?: "light" | "dark";
  name: string;
  value: number;
  original: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  filled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <GroupHeader mode={mode} title={title}>
        <UndoButtons
          current={value}
          dirty={Math.abs(value - original) >= 0.0005}
          onChange={onChange}
          original={original}
        />
      </GroupHeader>
      <ChannelRow
        display={format(value)}
        filled={filled}
        max={max}
        min={min}
        name={name}
        onChange={onChange}
        step={step}
        value={value}
      />
    </div>
  );
}

export interface ValueRowSpec {
  name: string;
  value: number;
  original: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  filled?: boolean;
  onChange: (value: number) => void;
}

/**
 * One mode (or "both modes") with several numbers. Every row names what it
 * changes ("Luz do texto", "Opacidade do anel"), and the eye / reset buttons
 * act on the whole group.
 */
export function ValueSetGroup({
  title,
  mode,
  rows,
}: {
  title: string;
  mode?: "light" | "dark";
  rows: ValueRowSpec[];
}) {
  const dirty = rows.some((r) => Math.abs(r.value - r.original) >= 0.0005);
  return (
    <div className="flex flex-col gap-3">
      <GroupHeader mode={mode} title={title}>
        <UndoButtons<number[]>
          current={rows.map((r) => r.value)}
          dirty={dirty}
          onChange={(values) => rows.forEach((r, i) => r.onChange(values[i]))}
          original={rows.map((r) => r.original)}
        />
      </GroupHeader>
      {rows.map((r) => (
        <ChannelRow
          display={r.format(r.value)}
          filled={r.filled ?? true}
          key={r.name}
          max={r.max}
          min={r.min}
          name={r.name}
          onChange={r.onChange}
          step={r.step}
          value={r.value}
        />
      ))}
    </div>
  );
}

/** Info button of an editor item: explains the rule and shows live numbers. */
export function RuleInfo({
  id,
  palette,
  shared,
}: {
  id: string;
  palette: PaletteConfig;
  shared: SharedColors;
}) {
  const entry = getThemeRule(id);
  if (!entry) return null;

  return (
    <PrismPopoverTrigger>
      <PrismButton
        aria-label="Como esta cor é calculada"
        className="pointer-events-auto relative z-10 shrink-0"
        size="icon-xs"
        variant="ghost"
      >
        <InfoIcon />
      </PrismButton>
      <PrismPopover className="gap-3" placement="bottom start" size="lg">
        <PrismPopoverTitle>{entry.title}</PrismPopoverTitle>
        <p className="text-base text-secondary-foreground">{entry.rule}</p>
        <pre className="overflow-x-auto rounded-xl bg-secondary p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap squircle">
          {entry.code}
        </pre>
        {entry.calc && (
          <div className="flex flex-col gap-1 text-base tabular-nums">
            <p>Claro: {entry.calc(palette, "light", shared)}</p>
            <p>Escuro: {entry.calc(palette, "dark", shared)}</p>
          </div>
        )}
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
