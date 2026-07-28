import { cva, type VariantProps } from "class-variance-authority";
import {
  composeRenderProps,
  Input as InputPrimitive,
} from "react-aria-components";
import { cn } from "cnfast";

const inputVariants = cva(
  "squircle w-full min-w-0 rounded-2xl border border-transparent bg-input/50 transition-[color,box-shadow] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        default: "h-12 px-5 py-1 text-base md:text-sm",
        sm: "h-10 px-4 py-0 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export type PrismInputProps = Omit<
  React.ComponentProps<typeof InputPrimitive>,
  "size"
> &
  VariantProps<typeof inputVariants>;

function PrismInput({
  className,
  size = "default",
  type,
  ...props
}: PrismInputProps) {
  return (
    <InputPrimitive
      className={composeRenderProps(className, (className) =>
        cn(
          inputVariants({
            size,
          }),
          className,
        ),
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}
export { PrismInput, inputVariants };

