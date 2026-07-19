import type React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";
const prismAlertVariants = cva(
  "relative w-full rounded-xl border-2 p-4 text-sm grid grid-cols-[0_1fr] gap-y-0.5 items-start [&>svg]:size-28 [&>svg]:opacity-10 [&>svg]:absolute [&>svg]:-right-4 [&>svg]:text-current animate-pop overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-surface text-surface-foreground border-border",
        error:
          "text-error border-error/50 bg-error-background dark:bg-error-background",
        success:
          "text-success border-success/50 bg-success-background dark:bg-success-background",
        warning:
          "text-warning border-warning/50 bg-warning-background dark:bg-warning-background",
        info: "text-info border-info/50 bg-info-background dark:bg-info-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
export interface PrismAlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof prismAlertVariants> {}
export function PrismAlert({ className, variant, ...props }: PrismAlertProps) {
  return (
    <div
      className={cn(
        prismAlertVariants({
          variant,
        }),
        className,
      )}
      role="alert"
      {...props}
    />
  );
}
export function PrismAlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight text-xl",
        className,
      )}
      {...props}
    />
  );
}
export function PrismAlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "col-start-2 grid justify-items-start gap-1 [&_p]:leading-relaxed opacity-60",
        className,
      )}
      {...props}
    />
  );
}
