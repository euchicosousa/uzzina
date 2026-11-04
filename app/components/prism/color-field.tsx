import { cva, type VariantProps } from "class-variance-authority";
import {
  ColorField as ColorFieldPrimitive,
  Input as InputPrimitive,
  type ColorFieldProps as ColorFieldPrimitiveProps,
} from "react-aria-components";
import { cn } from "cnfast";

const colorFieldVariants = cva(
  "squircle w-full min-w-0 rounded-2xl text-sm placeholder:text-sm border border-transparent bg-input uppercase font-mono transition-[color,box-shadow] duration-200 outline-none placeholder:text-foreground/50 focus-visible:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        default: "h-10 px-5 py-1",
        sm: "h-8 px-4 py-0",
        lg: "h-12 rounded-3xl px-5 py-0 text-base placeholder:text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface PrismColorFieldProps
  extends
    Omit<ColorFieldPrimitiveProps, "className">,
    VariantProps<typeof colorFieldVariants> {
  className?: string;
  inputClassName?: string;
}

function PrismColorField({
  className,
  inputClassName,
  size = "default",
  ...props
}: PrismColorFieldProps) {
  return (
    <ColorFieldPrimitive
      aria-label={props["aria-label"] ?? "Cor"}
      className={cn("flex w-full flex-col gap-1.5", className)}
      data-slot="color-field"
      {...props}
    >
      <InputPrimitive
        className={cn(
          colorFieldVariants({
            size,
          }),
          inputClassName,
        )}
        data-slot="input"
      />
    </ColorFieldPrimitive>
  );
}
export { PrismColorField, colorFieldVariants };
