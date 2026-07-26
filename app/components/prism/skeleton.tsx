import { cn } from "cnfast";
export interface PrismSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
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
const SKELETON_KEYS = Array.from(
  {
    length: 50,
  },
  (_, i) => `sk-${i}`,
);
export function PrismSkeletonGroup({
  count = 4,
  className,
  delay = 0,
  orientation = "horizontal",
  variant = "line",
  isWrapped = true,
  ...props
}: PrismSkeletonProps & {
  count?: number;
  orientation?: "horizontal" | "vertical";
  variant?: "profile" | "line" | "block";
  isWrapped?: boolean;
}) {
  const skeletons = [...Array(count)].map((_, i) => (
    <div
      key={SKELETON_KEYS[i] || `sk-fallback-${i}`}
      className="flex w-full flex-col gap-2"
    >
      {variant === "profile" && (
        <ProfileSkeleton className={className} delay={delay * i} />
      )}
      {variant === "line" && (
        <PrismSkeleton className={className} delay={delay * i} />
      )}
      {variant === "block" && (
        <PrismSkeleton className={className} delay={delay * i} />
      )}
    </div>
  ));
  return !isWrapped ? (
    skeletons
  ) : (
    <div
      className={cn(
        orientation === "horizontal"
          ? "grid grid-cols-2 gap-8 md:grid-cols-4"
          : "flex flex-col gap-2",
      )}
      {...props}
    >
      {skeletons}
    </div>
  );
}
function ProfileSkeleton({ className, delay, ...props }: PrismSkeletonProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <PrismSkeleton className={cn("size-8 rounded-full")} delay={delay} />
      <PrismSkeleton className={cn("h-4 w-full")} delay={delay} />
    </div>
  );
}
