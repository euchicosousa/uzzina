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
  hasSelection = false,
  className,
  children,
  ref,
  type = "button",
  ...props
}: ComboboxTriggerProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        // Base transition and outline
        "outline-none transition-colors",
        
        // Variant Styles
        variant === "filter" && cn(
          "raised grid size-9 place-content-center rounded-xl border-b border-b-transparent squircle hover:text-foreground/50",
          hasSelection && "bg-muted text-foreground"
        ),
        
        variant === "form-inline" && cn(
          "flex items-center gap-1.5",
          size === "sm"
            ? "h-8 text-xs hover:bg-secondary justify-start px-3 rounded-md"
            : "p-6 text-sm hover:bg-secondary focus:bg-secondary/50"
        ),
        
        variant === "form-link" && "cursor-pointer underline-offset-4 hover:underline",
        
        variant === "form-footer" && "hover:bg-secondary focus:bg-secondary/50 flex w-full items-center gap-2 overflow-hidden px-6 py-5.5 text-sm",
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
