import { useState } from "react";
import { cn } from "cnfast";
export interface SelectorOption<T> {
  value: T;
  label: React.ReactNode;
  icon?: React.ComponentType<{
    className?: string;
  }>;
}
interface SegmentedSelectorProps<T> {
  options: SelectorOption<T>[];
  value?: T | T[];
  onChange?: (value: T | T[]) => void;
  className?: string;
  warpperclassName?: string;
  columns?: number;
  columnsClassName?: string;
  vertical?: boolean;
  orientation?: "horizontal" | "vertical";
  hideLabelText?: boolean;
  selectedClassName?: string;
  unselectedClassName?: string;
  type?: "radio" | "checkbox";
  name?: string;
  defaultValue?: T | T[];
}
export function SegmentedSelector<T extends string | number>({
  options,
  value,
  onChange,
  className,
  warpperclassName,
  columns,
  columnsClassName,
  vertical = false,
  orientation = "horizontal",
  hideLabelText = false,
  selectedClassName,
  unselectedClassName,
  type = "radio",
  name,
  defaultValue,
}: SegmentedSelectorProps<T>) {
  // Uncontrolled state management
  const [localValue, setLocalValue] = useState<T | T[] | undefined>(
    defaultValue,
  );
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : localValue;

  // Build grid layout style or select default columns class
  const gridStyle = columns
    ? {
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }
    : undefined;
  const defaultColsClass = columns
    ? undefined
    : columnsClassName || "grid-cols-3";
  const isVerticalLayout = orientation === "vertical";
  const btnSelectedClass =
    selectedClassName || "border-primary bg-primary/10 text-primary";
  const btnUnselectedClass =
    unselectedClassName ||
    "border-border bg-card/40 text-muted-foreground hover:bg-card hover:text-foreground opacity-75";
  const handleSelectChange = (optValue: T) => {
    if (isControlled) {
      onChange?.(optValue);
      return;
    }

    // Uncontrolled updates
    if (type === "checkbox") {
      const currentArray = Array.isArray(localValue) ? (localValue as T[]) : [];
      const newArray = currentArray.includes(optValue)
        ? currentArray.filter((v) => v !== optValue)
        : [...currentArray, optValue];
      setLocalValue(newArray);
      onChange?.(newArray);
    } else {
      setLocalValue(optValue);
      onChange?.(optValue);
    }
  };
  return (
    <div
      className={cn(
        isVerticalLayout ? "flex flex-col gap-3" : "grid gap-3",
        !isVerticalLayout && defaultColsClass,
        warpperclassName,
      )}
      style={isVerticalLayout ? undefined : gridStyle}
    >
      {options.map((opt) => {
        const Icon = opt.icon;

        // Determine if checked
        let isSelected = false;
        if (Array.isArray(activeValue)) {
          isSelected = activeValue.includes(opt.value);
        } else {
          isSelected = activeValue === opt.value;
        }
        return (
          <label
            key={String(opt.value)}
            className="relative flex cursor-pointer select-none items-stretch justify-stretch outline-none"
          >
            <input
              checked={isSelected}
              className="peer sr-only absolute size-0"
              name={name}
              onChange={() => handleSelectChange(opt.value)}
              type={type}
              value={opt.value}
            />
            <div
              className={cn(
                "squircle flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border transition-all duration-200 peer-focus-visible:ring-3 peer-focus-visible:ring-primary/30 peer-focus-visible:border-primary",
                vertical
                  ? "flex-col items-center justify-center gap-2 p-4"
                  : "items-center justify-center gap-2 p-2.5",
                isSelected ? btnSelectedClass : btnUnselectedClass,
                className,
              )}
            >
              {Icon && (
                <Icon className="size-4 shrink-0 transition-transform duration-200" />
              )}

              {!hideLabelText && opt.label && (
                <div className="text-xs font-semibold select-none">
                  {opt.label}
                </div>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
