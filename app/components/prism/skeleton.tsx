import { cn } from "~/lib/utils";

export interface PrismSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
}

export function PrismSkeleton({
  className,
  delay,
  ...props
}: PrismSkeletonProps) {
  const inlineStyles: React.CSSProperties = {
    ...(delay !== undefined
      ? {
          animationDelay: `${delay}ms`,
          animationFillMode: "both",
        }
      : {}),
  };

  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl squircle bg-foreground/5",
        className,
      )}
      style={inlineStyles}
      {...props}
    />
  );
}
