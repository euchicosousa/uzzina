import type { ReactNode } from "react";
import { cn } from "cnfast";

export function UAIAllowanceMeter({
  percentage,
  children,
}: {
  percentage: number;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 transition-colors squircle">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          Franquia do Mês
        </span>
        <span className="text-sm font-bold tracking-tight text-foreground">
          {percentage}%{" "}
          <span className="text-xs font-normal text-muted-foreground">
            utilizado
          </span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            percentage >= 90
              ? "bg-error"
              : percentage >= 75
                ? "bg-warning"
                : "bg-info",
          )}
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
          }}
        />
      </div>

      {children}
    </div>
  );
}
