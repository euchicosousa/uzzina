import {
  TextField as RATextField,
  Input as RAInput,
  Label as RALabel,
  type TextFieldProps as RATextFieldProps,
} from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const prismInputVariants = cva(
  "transition-all h-9 w-full min-w-0 text-base outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "rounded-md border border-input bg-input px-3 py-1 dark:bg-input/30",
        inset: "bg-input dark:bg-input/30 input-embossed px-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface PrismInputProps
  extends Omit<RATextFieldProps, "children">,
    VariantProps<typeof prismInputVariants> {
  label?: string;
  placeholder?: string;
  type?: string;
  inputClassName?: string;
  name?: string;
  required?: boolean;
}

export function PrismInput({
  label,
  placeholder,
  type = "text",
  variant,
  className,
  inputClassName,
  name,
  required,
  ...props
}: PrismInputProps) {
  return (
    <RATextField
      className={cn("flex flex-col gap-1.5 w-full", className)}
      name={name}
      isRequired={required}
      {...props}
    >
      {label && (
        <RALabel className="block w-full font-medium text-foreground cursor-pointer">
          {label}
        </RALabel>
      )}
      <RAInput
        type={type}
        placeholder={placeholder}
        className={cn(
          prismInputVariants({
            variant,
            className: inputClassName,
          })
        )}
      />
    </RATextField>
  );
}
