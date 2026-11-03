import type * as React from "react";
import { cn } from "cnfast";

export interface PrismKbdProps extends React.ComponentProps<"kbd"> {}

export function PrismKbd({ className, ...props }: PrismKbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full bg-secondary px-1.5 font-mono text-xs font-medium whitespace-nowrap text-muted-foreground select-none",
        className,
      )}
      data-slot="kbd"
      {...props}
    />
  );
}
