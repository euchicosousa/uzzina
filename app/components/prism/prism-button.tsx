import * as React from "react";
import {
  Button as RAButton,
  type ButtonProps as RAButtonProps,
  type ButtonRenderProps,
} from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";
const prismButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl squircle text-sm font-medium transition-all outline-none " +
    "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring " +
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50 shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground data-[hovered]:bg-primary/90 data-[pressed]:scale-[0.97]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground data-[hovered]:bg-accent/50 data-[pressed]:bg-accent/70 data-[pressed]:scale-[0.97]",
        unstyled:
          "bg-transparent text-inherit p-0 rounded-none squircle-none data-[pressed]:scale-100",
      },
      size: {
        default: "h-12 px-5",
        icon: "size-12 rounded-xl squircle",
        "icon-sm": "size-9 rounded-lg squircle",
        unstyled: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
export interface PrismButtonProps
  extends
    Omit<RAButtonProps, "className">,
    Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      keyof RAButtonProps | "className"
    >,
    VariantProps<typeof prismButtonVariants> {
  className?: string | ((values: ButtonRenderProps) => string);
  children?: React.ReactNode;
}
export const PrismButton = React.forwardRef<
  HTMLButtonElement,
  PrismButtonProps
>(({ className, variant, size, ...props }, ref) => {
  return (
    <RAButton
      ref={ref}
      className={(renderProps) =>
        cn(
          prismButtonVariants({
            variant,
            size,
            className:
              typeof className === "function"
                ? className(renderProps)
                : className,
          }),
        )
      }
      {...props}
    />
  );
});
PrismButton.displayName = "PrismButton";
