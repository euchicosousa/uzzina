import type { VariantProps } from "class-variance-authority";
import { createContext, useContext } from "react";
import {
  ToggleButtonGroup as ToggleGroupPrimitive,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
} from "react-aria-components";
import { PrismToggle, type toggleVariants } from "~/components/prism";
import { cn } from "cnfast";

type ToggleVariant = NonNullable<
  VariantProps<typeof toggleVariants>["variant"]
>;

interface ToggleGroupContextValue extends VariantProps<typeof toggleVariants> {
  fullWidth?: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  size: undefined,
  variant: undefined,
  fullWidth: false,
});

// Attached groups: square inner corners, group radius only at the ends. The
// 1px pull only applies to outline, whose opaque borders merge into one line;
// other variants sit side by side so translucent fills never overlap (DS18).
const ATTACHED_CLASSES = {
  horizontal:
    "*:relative *:hover:z-10 *:data-selected:z-10 *:focus-visible:z-20 [&>*]:rounded-none! [&>*:first-child]:rounded-l-(--group-radius)! [&>*:last-child]:rounded-r-(--group-radius)! [&>[data-variant=outline]:not(:first-child)]:-ml-px",
  vertical:
    "*:relative *:hover:z-10 *:data-selected:z-10 *:focus-visible:z-20 [&>*]:rounded-none! [&>*:first-child]:rounded-t-(--group-radius)! [&>*:last-child]:rounded-b-(--group-radius)! [&>[data-variant=outline]:not(:first-child)]:-mt-px",
} as const;

// Ghost toggles are never attached: they read as separate options.
const SEPARATED_ONLY: readonly ToggleVariant[] = ["default", "ghost"];

export interface ToggleGroupProps
  extends
    Omit<ToggleButtonGroupProps, "children">,
    VariantProps<typeof toggleVariants> {
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
  /** Outline and secondary only; ghost groups are always separated by 4px. */
  attached?: boolean;
  children?: React.ReactNode;
}

function ToggleGroup({
  className,
  variant,
  size,
  orientation = "horizontal",
  attached = true,
  children,
  fullWidth = false,
  ...props
}: ToggleGroupProps) {
  const effectiveVariant = variant ?? "default";
  const isAttached = attached && !SEPARATED_ONLY.includes(effectiveVariant);
  const isLarge = size === "lg" || size === "icon-lg";

  return (
    <ToggleGroupPrimitive
      className={cn(
        "group/toggle-group flex max-w-full",
        isLarge
          ? "[--group-radius:var(--radius-3xl)]"
          : "[--group-radius:var(--radius-2xl)]",
        fullWidth && "w-full",
        orientation === "vertical"
          ? "flex-col items-stretch"
          : "flex-row items-center",
        isAttached ? ATTACHED_CLASSES[orientation] : "gap-1",
        className,
      )}
      data-attached={isAttached ? "true" : undefined}
      data-orientation={orientation}
      data-size={size}
      data-slot="toggle-group"
      data-variant={effectiveVariant}
      orientation={orientation}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, fullWidth }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

export type ToggleGroupItemProps = ToggleButtonProps &
  VariantProps<typeof toggleVariants>;

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: ToggleGroupItemProps) {
  const context = useContext(ToggleGroupContext);
  const effectiveVariant = variant ?? context.variant ?? "default";
  const effectiveSize = size ?? context.size ?? "default";
  const isFullWidth = context.fullWidth ?? false;

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
        className,
      )}
      data-full-width={isFullWidth ? "true" : undefined}
      data-size={effectiveSize}
      data-slot="toggle-group-item"
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
