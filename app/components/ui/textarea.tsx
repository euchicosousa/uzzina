import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";
const textareaVariants = cva(
  "flex field-sizing-content min-h-16 w-full squircle text-base transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:ring-destructive/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "rounded-md border border-input bg-transparent px-5 py-3 shadow-xs dark:bg-input/30",
        inset: "bg-input dark:bg-input/30 input-embossed py-4 px-5",
        ghost:
          "bg-transparent border-transparent px-0 py-0 focus-visible:ring-0 focus-visible:border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
interface TextareaProps
  extends
    Omit<React.ComponentProps<"textarea">, "ref">,
    VariantProps<typeof textareaVariants> {}
function Textarea({ className, variant, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        textareaVariants({
          variant,
          className,
        }),
      )}
      data-slot="textarea"
      {...props}
    />
  );
}
export { Textarea, textareaVariants };
export type { TextareaProps };
