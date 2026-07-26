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
  ...props
}: ComboboxTriggerProps) {
  return (
    <ButtonPrimitive
      className={cn(
        // Base transition and outline
        "outline-none transition-colors text-sm flex gap-2 items-center cursor-pointer",
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
              ? "h-8 text-xs hover:bg-secondary justify-start px-3 rounded-md"
              : "p-6 hover:bg-secondary focus:bg-secondary/50",
          ),
        variant === "form-link" &&
          "cursor-pointer underline-offset-4 hover:underline",
        variant === "form-footer" &&
          "hover:bg-secondary focus:bg-secondary/50 flex w-full items-center gap-2 overflow-hidden px-6 py-5.5 text-sm",
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
}
