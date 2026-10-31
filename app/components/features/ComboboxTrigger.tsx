import {
  Button as ButtonPrimitive,
  type ButtonProps,
} from "react-aria-components";
import { cn } from "cnfast";
import { buttonVariants } from "../prism/button";
export interface ComboboxTriggerProps extends Omit<ButtonProps, "className"> {
  variant?: "filter" | "form-inline" | "form-link" | "form-footer";
  size?: "sm" | "lg";
  hasSelection?: boolean;
  className?: string;
  tabIndex?: number;
  title?: string;
  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}
export function ComboboxTrigger({
  variant = "form-inline",
  size = "lg",
  hasSelection,
  className,
  children,
  type = "button",
  disabled,
  isDisabled,
  ...props
}: ComboboxTriggerProps) {
  return (
    <ButtonPrimitive
      className={cn(
        // Base transition and outline
        "flex cursor-pointer items-center gap-2 text-sm transition-colors outline-none",
        variant !== "form-link" && "data-[focus-visible]:bg-input",
        // Variant Styles
        variant === "filter" &&
          cn(
            buttonVariants({
              variant: "ghost",
              size: "sm",
            }),
          ),
        variant === "form-inline" &&
          cn(
            "flex items-center gap-1.5",
            size === "sm"
              ? "h-8 justify-start rounded-md px-3 text-xs hover:bg-secondary"
              : "p-6 hover:bg-secondary focus:bg-secondary/50",
          ),
        variant === "form-link" &&
          "cursor-pointer rounded-md underline-offset-4 hover:underline data-[focus-visible]:underline",
        variant === "form-footer" &&
          cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "w-auto min-w-12 gap-2 overflow-hidden px-2",
          ),
        className,
      )}
      type={type}
      isDisabled={disabled || isDisabled}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
}
