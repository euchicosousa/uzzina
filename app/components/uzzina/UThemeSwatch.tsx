import { cn } from "cnfast";
import type { PaletteConfig } from "~/lib/palettes";

export interface UThemeSwatchProps {
  palette: PaletteConfig;
  mode: "light" | "dark";
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  className?: string;
}

const CONTAINER_RADIUS_CLASSES: Record<
  NonNullable<UThemeSwatchProps["size"]>,
  string
> = {
  sm: "rounded-lg",
  md: "rounded-[9px]",
  lg: "rounded-[10px]",
};

const SQUARE_SIZE_CLASSES: Record<
  NonNullable<UThemeSwatchProps["size"]>,
  string
> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

/**
 * Dual theme palette swatch (`[ primary | background ]`) styled like a button group.
 */
export function UThemeSwatch({
  palette,
  mode,
  size = "md",
  selected = false,
  className,
}: UThemeSwatchProps) {
  const colors = mode === "dark" ? palette.dark : palette.light;
  const primaryColor = `oklch(${colors.primary.l} ${colors.primary.c} ${colors.primary.h})`;
  const backgroundColor = `oklch(${colors.bg.l} ${colors.bg.c} ${colors.bg.h})`;
  const squareClass = cn("shrink-0", SQUARE_SIZE_CLASSES[size]);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center overflow-hidden border border-border/70 squircle",
        CONTAINER_RADIUS_CLASSES[size],
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-popover",
        className,
      )}
      data-selected={selected ? "" : undefined}
      data-slot="theme-swatch"
    >
      <span
        aria-hidden="true"
        className={squareClass}
        data-palette-swatch="color"
        style={{ backgroundColor: primaryColor }}
      />
      <span
        aria-hidden="true"
        className={cn(squareClass, "border-l border-border/70")}
        data-palette-bg=""
        style={{ backgroundColor }}
      />
    </span>
  );
}
