import {
  ColorField as ColorFieldPrimitive,
  Input as InputPrimitive,
  type ColorFieldProps as ColorFieldPrimitiveProps,
} from "react-aria-components";
import { cn } from "~/lib/utils";

export interface PrismColorFieldProps
  extends Omit<ColorFieldPrimitiveProps, "className"> {
  className?: string;
  inputClassName?: string;
}

function PrismColorField({
  className,
  inputClassName,
  ...props
}: PrismColorFieldProps) {
  return (
    <ColorFieldPrimitive
      aria-label={props["aria-label"] ?? "Cor"}
      className={cn("flex flex-col gap-1.5 w-full", className)}
      data-slot="color-field"
      {...props}
    >
      <InputPrimitive
        className={cn(
          "squircle h-12 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-5 py-1 text-base uppercase font-mono transition-[color,box-shadow] duration-200 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          inputClassName,
        )}
        data-slot="input"
      />
    </ColorFieldPrimitive>
  );
}

export { PrismColorField };
