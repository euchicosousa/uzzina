import { cva, type VariantProps } from "class-variance-authority";
import {
  composeRenderProps,
  Input as InputPrimitive,
} from "react-aria-components";
import { cn } from "cnfast";

const inputVariants = cva(
  "squircle w-full min-w-0 rounded-2xl text-sm placeholder:text-sm border border-transparent bg-input transition-[color,box-shadow] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-foreground/40 focus-visible:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:bg-error-background aria-invalid:text-error-foreground aria-invalid:border-error aria-invalid:ring-error-background",
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
