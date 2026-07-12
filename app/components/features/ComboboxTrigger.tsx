import type * as React from "react";
import { cn } from "~/lib/utils";
export interface ComboboxTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filter" | "form-inline" | "form-link" | "form-footer";
  size?: "sm" | "lg";
  hasSelection?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}
export function ComboboxTrigger({
  variant = "form-inline",
  size = "lg",
  hasSelection,
  className,
  children,
  ref,
  type = "button",
  ...props
}: ComboboxTriggerProps) {
  return (
    <button
      ref={ref}
      className={cn(
        // Base transition and outline
        "outline-none transition-colors text-sm flex gap-2  items-center",
        // Variant Styles
        variant === "filter" &&
          cn("px-3 rounded-2xl squircle h-10 button-raised"),
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
    </button>
  );
}
