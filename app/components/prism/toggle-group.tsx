import type { VariantProps } from "class-variance-authority";
import { createContext, useContext } from "react";
import {
  ToggleButtonGroup as ToggleGroupPrimitive,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
} from "react-aria-components";
import { PrismToggle, type toggleVariants } from "~/components/prism";
import { cn } from "~/lib/utils";
const ToggleGroupContext = createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
});
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: Omit<ToggleButtonGroupProps, "children"> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
    children?: React.ReactNode;
  }) {
  return (
    <ToggleGroupPrimitive
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-(--gap) data-[spacing=0]:data-[variant=outline]:rounded-2xl data-vertical:flex-col data-vertical:items-stretch",
        className,
      )}
      data-size={size}
      data-slot="toggle-group"
      data-spacing={spacing}
      data-variant={variant}
      orientation={orientation}
      style={
        {
          "--gap": `calc(var(--spacing) * ${spacing})`,
        } as React.CSSProperties
      }
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{
          variant,
          size,
          spacing,
          orientation,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}
function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: ToggleButtonProps & VariantProps<typeof toggleVariants>) {
  const context = useContext(ToggleGroupContext);
  const effectiveVariant = context.variant || variant || "default";
  const effectiveSize = context.size || size || "default";

  return (
    <PrismToggle
      className={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 group-data-[spacing=0]/toggle-group:shadow-none focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-2xl group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-2xl group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-2xl group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-2xl data-[state=on]:bg-muted group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        className,
      )}
      data-size={effectiveSize}
      data-slot="toggle-group-item"
      data-spacing={context.spacing}
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
