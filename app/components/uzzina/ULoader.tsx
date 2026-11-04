import type { ComponentPropsWithoutRef } from "react";
import { Loader2 } from "lucide-react";
import type { SIZE } from "~/lib/CONSTANTS";
import { cn } from "cnfast";

export type ULoaderSize = keyof typeof SIZE | "default";

export interface ULoaderProps extends ComponentPropsWithoutRef<"svg"> {
  className?: string;
  size?: ULoaderSize;
  inheritColor?: boolean;
  label?: string;
}

export function ULoader({
  className,
  size = "sm",
  inheritColor = false,
  label,
  role,
  "aria-label": ariaLabelProp,
  "aria-hidden": ariaHiddenProp,
  ...props
}: ULoaderProps) {
  const sizeClasses: Record<ULoaderSize, string> = {
    xs: "size-3",
    sm: "size-4",
    md: "size-5",
    default: "size-5",
    lg: "size-6",
    xl: "size-8",
    "2xl": "size-12",
  };

  const computedAriaLabel = ariaLabelProp ?? label;
  const isLabeled = Boolean(computedAriaLabel);

  return (
    <Loader2
      role={role ?? (isLabeled ? "status" : "presentation")}
      aria-label={computedAriaLabel}
      aria-hidden={ariaHiddenProp ?? (isLabeled ? undefined : true)}
      className={cn(
        "animate-spin",
        inheritColor ? "text-current" : "text-muted-foreground",
        sizeClasses[size] ?? "size-4",
        className,
      )}
      {...props}
    />
  );
}
