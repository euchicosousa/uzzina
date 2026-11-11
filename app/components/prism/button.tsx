import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Button as ButtonPrimitive,
  Link as LinkPrimitive,
  type ButtonProps as ButtonPrimitiveProps,
  type LinkProps as LinkPrimitiveProps,
} from "react-aria-components";
import { cn } from "cnfast";
// Single source of truth for control sizes (also used by Toggle).
const buttonSizeClasses = {
  xs: "h-6 gap-1 px-3 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
  sm: "h-8 gap-1 px-4  has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
  default:
    "h-10 gap-1.5 px-5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
  lg: "h-12 gap-1.5 px-5 text-base has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3  rounded-3xl",
  icon: "size-10",
  "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-4 rounded-2xl",
  "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-4",
  "icon-lg": "size-12 rounded-3xl",
} as const;
const styledButtonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-error-background [&_svg]:pointer-events-none [&_svg:not([class*='opacity-'])]:opacity-60 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-primary border-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "bg-transparent hover:bg-secondary aria-expanded:bg-secondary dark:bg-transparent",
        secondary:
          "bg-secondary text-foreground hover:border-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-foreground",
        ghost:
          "hover:bg-secondary border-transparent aria-expanded:bg-secondary",
        "ghost-error":
          "bg-transparent border-transparent hover:bg-error-background hover:text-error-foreground hover:border-error focus-visible:border-error focus-visible:ring-error-background focus-visible:text-error-foreground focus-visible:bg-error-background dark:hover:bg-error-background dark:focus-visible:bg-error-background",
        error:
          "bg-error-background text-error-foreground hover:bg-error-background border-error focus-visible:border-error focus-visible:ring-error-background dark:bg-error-background dark:hover:bg-error-background",
        success:
          "bg-success-strong border-success-strong text-success-strong-foreground hover:bg-success-strong-hover focus-visible:border-success-strong focus-visible:ring-success-strong/30",
        link: "text-foreground underline-offset-4 hover:underline border-transparent",
        unstyled: "",
      },
      size: buttonSizeClasses,
      // Declared after size so a circle wins over the size radius; the
      // squircle corner shape is applied only when the button is not round.
      isRounded: {
        true: "rounded-full",
        false: "squircle",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      isRounded: false,
    },
  },
);
// Unstyled controls keep React Aria behavior and only receive caller styles.
function buttonVariants(
  options: Parameters<typeof styledButtonVariants>[0] = {},
) {
  if (options?.variant === "unstyled")
    return cn(options.class, options.className);
  return styledButtonVariants(options);
}

function Button({
  className,
  variant = "default",
  size = "default",
  isRounded = false,
  ...props
}: Omit<ButtonPrimitiveProps, "className"> &
  React.RefAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  }) {
  return (
    <ButtonPrimitive
      className={cn(
        buttonVariants({
          variant,
          size,
          isRounded,
          className,
        }),
      )}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      {...props}
    />
  );
}
function LinkButton({
  className,
  variant = "default",
  size = "default",
  isRounded = false,
  ...props
}: Omit<LinkPrimitiveProps, "className"> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  }) {
  return (
    <LinkPrimitive
      className={cn(
        buttonVariants({
          variant,
          size,
          isRounded,
          className,
        }),
      )}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      {...props}
    />
  );
}
export type PrismButtonVariantProps = VariantProps<typeof buttonVariants>;
export { Button, LinkButton, buttonSizeClasses, buttonVariants };
