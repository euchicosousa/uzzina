"use client";

import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cnfast";
const alertVariants = cva(
  "group/alert relative w-full rounded-2xl border p-4 text-sm grid grid-cols-[0_1fr] gap-y-0.5 items-start [&>svg]:size-28 [&>svg]:opacity-10 [&>svg]:absolute [&>svg]:-right-4 has-[[data-slot=alert-action]]:[&>svg]:right-auto has-[[data-slot=alert-action]]:[&>svg]:-left-4 [&>svg]:text-current overflow-hidden squircle",
  {
    variants: {
      variant: {
        default: "bg-card text-foreground border-border",
        error: "text-error-foreground border-error bg-error-background",
        success: "text-success border-success bg-success-background",
        warning: "text-warning-foreground border-warning bg-warning-background",
        info: "text-info-foreground border-info bg-info-background",
      },
    },
    compoundVariants: [
      {
        variant: ["error", "success", "warning", "info"],
        className: "[&_[data-slot=alert-description]]:opacity-100",
      },
    ],
    defaultVariants: {
      variant: "default",
    },
  },
);
interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}
function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        alertVariants({
          variant,
        }),
        className,
      )}
      data-slot="alert"
      role="alert"
      {...props}
    />
  );
}
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 text-xl font-medium tracking-tight",
        className,
      )}
      data-slot="alert-title"
      {...props}
    />
  );
}
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm opacity-60 [&_p]:leading-relaxed",
        className,
      )}
      data-slot="alert-description"
      {...props}
    />
  );
}
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("absolute top-2.5 right-3", className)}
      data-slot="alert-action"
      {...props}
    />
  );
}
export {
  Alert as PrismAlert,
  AlertTitle as PrismAlertTitle,
  AlertDescription as PrismAlertDescription,
  AlertAction as PrismAlertAction,
};
