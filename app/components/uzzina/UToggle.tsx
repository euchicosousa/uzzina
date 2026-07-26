import type React from "react";
import { cn } from "cnfast";

/**
 * UToggleInput — form-linked radio/checkbox toggle using CSS peer pattern.
 * Renders a visually hidden input + a styled squircle label.
 *
 * @example
 * <UToggleInput id="archived" name="archived" defaultChecked={partner.archived} variant="destructive">
 *   <ArchiveIcon className="size-4" /> Arquivado
 * </UToggleInput>
 */
export function UToggleInput({
  id,
  type = "checkbox",
  variant = "default",
  className,
  onCheckedChange,
  children,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  type?: "checkbox" | "radio";
  variant?: "default" | "destructive";
  children?: React.ReactNode;
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <div>
      <input
        id={id}
        type={type}
        {...inputProps}
        className="peer sr-only absolute size-0"
        onChange={(e) => {
          onCheckedChange?.(e.target.checked);
        }}
      />
      <label
        className={cn(
          "flex items-center gap-2 rounded-2xl border-transparent bg-transparent p-4 font-semibold opacity-50 transition-all squircle peer-checked:opacity-100 hover:opacity-100 focus:opacity-100",
          variant === "destructive"
            ? "peer-checked:bg-destructive/10 peer-checked:text-destructive"
            : "hover:bg-opacity-100 peer-checked:bg-muted",
          className,
        )}
        htmlFor={id}
      >
        {children}
      </label>
    </div>
  );
}
