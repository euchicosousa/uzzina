import { cva, type VariantProps } from "class-variance-authority";
import {
  ToggleButton as TogglePrimitive,
  type ToggleButtonProps,
} from "react-aria-components";
import { cn } from "cnfast";

const toggleVariants = cva(
  "group/toggle inline-flex border border-transparent items-center justify-center gap-1 rounded-2xl squircle text-sm font-medium whitespace-nowrap transition-colors outline-none hover:bg-secondary hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-secondary dark:aria-invalid:ring-destructive/40 data-selected:bg-secondary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "aria-expanded:bg-secondary aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] data-selected:bg-primary data-selected:text-primary-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground",
        outline: "border border-input bg-transparent",
      },
      size: {
        default:
          "h-12 min-w-12 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-8 min-w-8 px-1.5 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 [&_svg:not([class*='size-'])]:size-4",
        sm: "h-10 min-w-10 px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-14 min-w-14 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-6",
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
  return (
    <TogglePrimitive
      className={cn(
        toggleVariants({
          variant,
          size,
        }),
        className,
      )}
      data-slot="toggle"
      {...props}
    />
  );
}
export { Toggle as PrismToggle, toggleVariants };
