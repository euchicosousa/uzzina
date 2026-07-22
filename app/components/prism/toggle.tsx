import { cva, type VariantProps } from "class-variance-authority";
import {
  ToggleButton as TogglePrimitive,
  type ToggleButtonProps,
} from "react-aria-components";
import { cn } from "~/lib/utils";
const toggleVariants = cva(
  "group/toggle inline-flex border border-transparent items-center justify-center gap-1 rounded-2xl squircle text-sm font-medium whitespace-nowrap transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted dark:aria-invalid:ring-destructive/40 data-selected:bg-muted [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "hover:bg-secondary hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        outline: "border border-input bg-transparent hover:bg-muted",
        destructive:
          "bg-destructive/10 hover:text-destructive aria-pressed:bg-destructive/20 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
      },
      size: {
        default:
          "h-12 min-w-12 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-10 min-w-10 px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-14 min-w-14 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
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
          className,
        }),
      )}
      data-slot="toggle"
      {...props}
    />
  );
}
export { Toggle as PrismToggle, toggleVariants };
