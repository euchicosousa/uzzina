"use client";

import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cnfast";
const alertVariants = cva(
  "group/alert relative w-full rounded-2xl border-2 p-4 text-sm grid grid-cols-[0_1fr] gap-y-0.5 items-start [&>svg]:size-28 [&>svg]:opacity-10 [&>svg]:absolute [&>svg]:-right-4 [&>svg]:text-current overflow-hidden squircle",
  {
    variants: {
      variant: {
        default: "bg-surface text-foreground border-border",
        error:
          "text-error border-error/50 bg-error-background dark:bg-error-background/10",
        success:
          "text-success border-success/50 bg-success-background dark:bg-success-background/10",
        warning:
          "text-warning border-warning/50 bg-warning-background dark:bg-warning-background/10",
        info: "text-info border-info/50 bg-info-background dark:bg-info-background/10",
      },
    },
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
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight text-xl",
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
        "col-start-2 grid justify-items-start gap-1 [&_p]:leading-relaxed opacity-60 text-sm",
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
