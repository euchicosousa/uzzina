import { Loader2 } from "lucide-react";
import type { SIZE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";

interface ULoaderProps {
  className?: string;
  size?: keyof typeof SIZE;
}

export function ULoader({ className, size = "sm" }: ULoaderProps) {
  const sizeClasses = {
    xs: "size-3",
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
    xl: "size-8",
    "2xl": "size-12",
  }[size];

  return (
    <Loader2
      className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses,
        className,
      )}
    />
  );
}
