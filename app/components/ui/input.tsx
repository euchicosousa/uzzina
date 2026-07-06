import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const inputVariants = cva(
  "transition-color h-9 w-full min-w-0 text-base outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "rounded-md border border-input bg-input px-3 py-1 dark:bg-input/30",
        inset: "bg-input dark:bg-input/30 input-embossed px-4",
        ghost: "bg-transparent border-transparent px-0 focus-visible:ring-0 focus-visible:border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface InputProps
  extends Omit<React.ComponentProps<"input">, "ref">,
    VariantProps<typeof inputVariants> {}

function Input({ className, type, variant, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
export type { InputProps };
