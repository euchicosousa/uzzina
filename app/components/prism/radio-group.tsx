import { cva, type VariantProps } from "class-variance-authority";
import {
  RadioGroup as RadioGroupPrimitive,
  Radio as RadioPrimitive,
  type RadioGroupProps,
  type RadioProps,
} from "react-aria-components";
import { cn } from "~/lib/utils";
const radioVariants = cva(
  "group/radio flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  {
    variants: {
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);
const radioDotVariants = cva(
  "relative flex shrink-0 items-center justify-center rounded-full border border-input bg-surface transition-all outline-none group-data-[focus-visible]/radio:border-ring group-data-[focus-visible]/radio:ring-[3px] group-data-[focus-visible]/radio:ring-ring/50 group-data-[invalid]/radio:border-error group-data-[selected]/radio:border-primary group-data-[selected]/radio:bg-primary group-data-[selected]/radio:text-primary-foreground",
  {
    variants: {
      size: {
        default: "size-5",
        sm: "size-4",
        lg: "size-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);
const dotSizeMap = {
  default: "size-2",
  sm: "size-1.5",
  lg: "size-2.5",
};
export interface PrismRadioProps
  extends RadioProps, VariantProps<typeof radioVariants> {
  className?: string;
  dotClassName?: string;
}
export function PrismRadio({
  className,
  dotClassName,
  children,
  size = "default",
  ...props
}: PrismRadioProps) {
  const effectiveSize = size || "default";
  return (
    <RadioPrimitive
      className={cn(
        radioVariants({
          size,
        }),
        className,
      )}
      data-slot="radio"
      {...props}
    >
      {(renderProps) => (
        <>
          <div
            className={cn(
              radioDotVariants({
                size,
              }),
              dotClassName,
            )}
            data-slot="radio-dot"
          >
            {renderProps.isSelected && (
              <span
                className={cn(
                  "rounded-full bg-primary-foreground",
                  dotSizeMap[effectiveSize],
                )}
              />
            )}
          </div>
          {typeof children === "function" ? children(renderProps) : children}
        </>
      )}
    </RadioPrimitive>
  );
}
export function PrismRadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      className={cn("flex flex-col gap-2", className)}
      data-slot="radio-group"
      {...props}
    />
  );
}
export { PrismRadio as PrismRadioGroupItem };
