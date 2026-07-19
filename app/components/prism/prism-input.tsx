import {
  TextField as RATextField,
  Input as RAInput,
  Label as RALabel,
  Group as RAGroup,
  type TextFieldProps as RATextFieldProps,
} from "react-aria-components";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";
const prismInputVariants = cva(
  "transition-all h-9 w-full min-w-0 text-base outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-transparent",
);
const groupVariants = cva(
  "flex items-center w-full transition-all focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 data-[invalid]:border-destructive data-[invalid]:ring-destructive/20 dark:data-[invalid]:ring-destructive/40 border rounded-xl squircle bg-input h-12 dark:bg-input/30",
);
export interface PrismInputProps extends Omit<RATextFieldProps, "children"> {
  label?: string;
  labelAction?: React.ReactNode;
  placeholder?: string;
  type?: string;
  inputClassName?: string;
  name?: string;
  required?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}
export function PrismInput({
  label,
  labelAction,
  placeholder,
  type = "text",
  className,
  inputClassName,
  name,
  required,
  prefix,
  suffix,
  ...props
}: PrismInputProps) {
  return (
    <RATextField
      className={cn("flex flex-col gap-1.5 w-full", className)}
      isRequired={required}
      name={name}
      {...props}
    >
      {label && (
        <div className="flex items-center justify-between w-full">
          <RALabel className="block font-medium text-foreground cursor-pointer">
            {label}
          </RALabel>
          {labelAction && <div className="shrink-0">{labelAction}</div>}
        </div>
      )}
      <RAGroup
        className={cn(
          groupVariants(),
          !prefix && "pl-5",
          !suffix && "pr-5",
          "[&_svg]:text-foreground/40",
        )}
      >
        {prefix && <div className="flex items-center shrink-0">{prefix}</div>}
        <RAInput
          className={cn(
            prismInputVariants({
              className: inputClassName,
            }),
          )}
          placeholder={placeholder}
          type={type}
        />
        {suffix && <div className="flex items-center shrink-0">{suffix}</div>}
      </RAGroup>
    </RATextField>
  );
}
