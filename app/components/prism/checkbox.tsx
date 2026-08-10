import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, MinusIcon } from "lucide-react";
import {
  Checkbox as CheckboxPrimitive,
  CheckboxGroup as CheckboxGroupPrimitive,
  type CheckboxGroupProps,
  type CheckboxProps,
} from "react-aria-components";
import { cn } from "cnfast";
const checkboxVariants = cva(
  "group flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
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
const boxVariants = cva(
  "flex shrink-0 items-center justify-center border border-input bg-card transition-all outline-none group-data-[focus-visible]:border-ring group-data-[focus-visible]:ring-[3px] group-data-[focus-visible]:ring-ring/50 group-data-[invalid]:border-error group-data-[selected]:bg-primary group-data-[selected]:border-primary group-data-[selected]:text-primary-foreground group-data-[indeterminate]:bg-primary group-data-[indeterminate]:border-primary group-data-[indeterminate]:text-primary-foreground",
  {
    variants: {
      size: {
        default: "size-5 rounded-md squircle [&_svg]:size-3.5",
        sm: "size-4 rounded-sm squircle [&_svg]:size-3",
        lg: "size-6 rounded-lg squircle [&_svg]:size-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);
export interface PrismCheckboxProps
  extends CheckboxProps, VariantProps<typeof checkboxVariants> {
  className?: string;
  boxClassName?: string;
}
export function PrismCheckbox({
  className,
  boxClassName,
  children,
  size = "default",
  ...props
}: PrismCheckboxProps) {
  return (
    <CheckboxPrimitive
      className={cn(
        checkboxVariants({
          size,
        }),
        className,
      )}
      data-slot="checkbox"
      {...props}
    >
      {(renderProps) => (
        <>
          <div
            className={cn(
              boxVariants({
                size,
              }),
              boxClassName,
            )}
            data-slot="checkbox-box"
          >
            {renderProps.isIndeterminate ? (
              <MinusIcon className="stroke-3" />
            ) : renderProps.isSelected ? (
              <CheckIcon className="stroke-3" />
            ) : null}
          </div>
          {typeof children === "function" ? children(renderProps) : children}
        </>
      )}
    </CheckboxPrimitive>
  );
}
export function PrismCheckboxGroup({
  className,
  ...props
}: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      className={cn("flex flex-col gap-2", className)}
      data-slot="checkbox-group"
      {...props}
    />
  );
}
