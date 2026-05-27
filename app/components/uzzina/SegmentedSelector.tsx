import React from "react";
import { cn } from "~/lib/utils";

export interface SelectorOption<T> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SegmentedSelectorProps<T> {
  options: SelectorOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  columns?: number;
  columnsClassName?: string;
  vertical?: boolean;
  orientation?: "horizontal" | "vertical";
  hideLabelText?: boolean;
}

export function SegmentedSelector<T extends string | number>({
  options,
  value,
  onChange,
  className,
  columns,
  columnsClassName,
  vertical = false,
  orientation = "horizontal",
  hideLabelText = false,
}: SegmentedSelectorProps<T>) {
  // If columns is provided, build style object. Else fallback to columnsClassName or grid-cols-3
  const gridStyle = columns
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : undefined;

  const defaultColsClass = columns ? undefined : (columnsClassName || "grid-cols-3");

  const isVerticalLayout = orientation === "vertical";

  return (
    <div
      className={cn(
        isVerticalLayout ? "flex flex-col gap-3" : "grid gap-3",
        !isVerticalLayout && defaultColsClass,
        className
      )}
      style={isVerticalLayout ? undefined : gridStyle}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = value === opt.value;

        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={cn(
              "squircle flex cursor-pointer rounded-2xl border transition-all duration-200 hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20",
              vertical
                ? "flex-col items-center justify-center gap-2 p-4"
                : "items-center justify-center gap-2 p-2.5",
              isSelected
                ? "border-primary bg-primary/5 text-primary scale-[1.02] shadow-sm"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon className="size-4 shrink-0 transition-transform duration-200" />}

            {!hideLabelText && opt.label && (
              <span className="text-xs font-semibold select-none">{opt.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
