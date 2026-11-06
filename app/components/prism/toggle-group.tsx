import type { VariantProps } from "class-variance-authority";
import { createContext, useContext } from "react";
import {
  ToggleButtonGroup as ToggleGroupPrimitive,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
} from "react-aria-components";
import { PrismToggle, type toggleVariants } from "~/components/prism";
import { cn } from "cnfast";

interface ToggleGroupContextValue extends VariantProps<typeof toggleVariants> {
  spacing?: number;
  orientation?: "horizontal" | "vertical";
  attached?: boolean;
  fullWidth?: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  size: undefined,
  variant: undefined,
  spacing: 2,
  orientation: "horizontal",
  attached: false,
  fullWidth: false,
});

export interface ToggleGroupProps
  extends
    Omit<ToggleButtonGroupProps, "children">,
    VariantProps<typeof toggleVariants> {
  spacing?: number;
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
  attached?: boolean;
  children?: React.ReactNode;
}

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  attached = false,
  children,
  fullWidth = false,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive
      className={cn(
        "group/toggle-group flex max-w-full",
        fullWidth && "w-full",
        orientation === "vertical"
          ? "flex-col items-stretch data-vertical:flex-col data-vertical:items-stretch"
          : "flex-row items-center",
        attached ? "gap-0" : "gap-(--gap)",
        className,
      )}
      data-attached={attached ? "true" : undefined}
      data-orientation={orientation}
      data-size={size}
      data-slot="toggle-group"
      data-spacing={attached ? 0 : spacing}
      data-variant={variant}
      orientation={orientation}
      style={
        attached
          ? undefined
          : ({
              "--gap": `calc(var(--spacing) * ${spacing})`,
            } as React.CSSProperties)
      }
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{
          variant,
          size,
          spacing: attached ? 0 : spacing,
          orientation,
          attached,
          fullWidth,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

export interface ToggleGroupItemProps
  extends ToggleButtonProps, VariantProps<typeof toggleVariants> {
  attached?: boolean;
  fullWidth?: boolean;
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  attached,
  fullWidth,
  ...props
}: ToggleGroupItemProps) {
  const context = useContext(ToggleGroupContext);
  const effectiveVariant = variant ?? context.variant ?? "default";
  const effectiveSize = size ?? context.size ?? "default";
  const isAttached = attached ?? context.attached ?? false;
  const isFullWidth = fullWidth ?? context.fullWidth ?? false;
  const isVertical = context.orientation === "vertical";

  const isSm =
    effectiveSize === "sm" ||
    effectiveSize === "xs" ||
    effectiveSize === "icon-xs" ||
    effectiveSize === "icon-sm";
  const isLg = effectiveSize === "lg" || effectiveSize === "icon-lg";

  const attachedClasses = isAttached
    ? cn(
        "relative hover:z-10 data-[selected=true]:z-10 data-selected:z-10 focus-visible:z-20 rounded-none",
        isVertical
          ? "[&:not(:first-child)]:-mt-px"
          : "[&:not(:first-child)]:-ml-px",
        isVertical
          ? isSm
            ? "first:rounded-t-2xl first:rounded-b-none first:squircle last:rounded-b-2xl last:rounded-t-none last:squircle only:rounded-2xl only:squircle"
            : isLg
              ? "first:rounded-t-3xl first:rounded-b-none first:squircle last:rounded-b-3xl last:rounded-t-none last:squircle only:rounded-3xl only:squircle"
              : "first:rounded-t-2xl first:rounded-b-none first:squircle last:rounded-b-2xl last:rounded-t-none last:squircle only:rounded-2xl only:squircle"
          : isSm
            ? "first:rounded-l-2xl first:rounded-r-none first:squircle last:rounded-r-2xl last:rounded-l-none last:squircle only:rounded-2xl only:squircle"
            : isLg
              ? "first:rounded-l-3xl first:rounded-r-none first:squircle last:rounded-r-3xl last:rounded-l-none last:squircle only:rounded-3xl only:squircle"
              : "first:rounded-l-2xl first:rounded-r-none first:squircle last:rounded-r-2xl last:rounded-l-none last:squircle only:rounded-2xl only:squircle",
      )
    : "";

  const hasCustomFlex =
    typeof className === "string" &&
    (className.includes("flex-1") ||
      className.includes("shrink") ||
      className.includes("grow"));

  return (
    <PrismToggle
      className={cn(
        !hasCustomFlex && (isFullWidth ? "flex-1" : "shrink-0"),
        isFullWidth && "w-full",
        "min-w-0",
        attachedClasses,
        className,
      )}
      data-attached={isAttached ? "true" : undefined}
      data-full-width={isFullWidth ? "true" : undefined}
      data-size={effectiveSize}
      data-slot="toggle-group-item"
      data-spacing={isAttached ? 0 : context.spacing}
      data-variant={effectiveVariant}
      size={effectiveSize}
      variant={effectiveVariant}
      {...props}
    >
      {children}
    </PrismToggle>
  );
}

export {
  ToggleGroup as PrismToggleGroup,
  ToggleGroupItem as PrismToggleGroupItem,
};
