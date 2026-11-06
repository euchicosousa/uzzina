import { cva, type VariantProps } from "class-variance-authority";
import {
  ToggleButton as TogglePrimitive,
  type ToggleButtonProps,
} from "react-aria-components";
import { Children, isValidElement, type ReactNode } from "react";
import { cn } from "cnfast";
import { buttonSizeClasses } from "~/components/prism/button";

type ToggleSize = NonNullable<VariantProps<typeof toggleVariants>["size"]>;

const ICON_SIZE: Record<ToggleSize, ToggleSize> = {
  xs: "icon-xs",
  sm: "icon-sm",
  default: "icon",
  lg: "icon-lg",
  "icon-xs": "icon-xs",
  "icon-sm": "icon-sm",
  icon: "icon",
  "icon-lg": "icon-lg",
};

// A toggle with no text (only icons) is an icon button: square, like Button icon-*.
function hasTextContent(children: unknown): boolean {
  if (typeof children === "function") return true;
  return Children.toArray(children as ReactNode).some((child) => {
    if (typeof child === "string" || typeof child === "number") return true;
    if (isValidElement<{ children?: unknown }>(child)) {
      return hasTextContent(child.props.children);
    }
    return false;
  });
}

const toggleVariants = cva(
  "group/toggle inline-flex min-w-0 border border-transparent items-center justify-center rounded-2xl squircle text-sm font-medium truncate transition-colors outline-none hover:bg-secondary hover:text-foreground focus-visible:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-secondary dark:aria-invalid:ring-destructive/40 data-selected:bg-secondary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='opacity-'])]:opacity-60 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "aria-expanded:bg-secondary aria-expanded:text-foreground",
        ghost: "aria-expanded:bg-secondary aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:border-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] data-selected:bg-primary data-selected:text-primary-foreground data-selected:hover:border-primary data-selected:hover:bg-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:border-primary aria-pressed:hover:bg-primary",
        outline: "border border-border bg-transparent",
      },
      // Same names and classes as PrismButton (single source of truth).
      size: {
        xs: buttonSizeClasses.xs,
        sm: buttonSizeClasses.sm,
        default: buttonSizeClasses.default,
        lg: buttonSizeClasses.lg,
        "icon-xs": buttonSizeClasses["icon-xs"],
        "icon-sm": buttonSizeClasses["icon-sm"],
        icon: buttonSizeClasses.icon,
        "icon-lg": buttonSizeClasses["icon-lg"],
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: ToggleButtonProps & VariantProps<typeof toggleVariants>) {
  const resolvedSize =
    size && !hasTextContent(props.children) ? ICON_SIZE[size] : size;
  return (
    <TogglePrimitive
      className={cn(
        toggleVariants({
          variant,
          size: resolvedSize,
        }),
        className,
      )}
      data-slot="toggle"
      {...props}
    />
  );
}
export { Toggle as PrismToggle, toggleVariants };
