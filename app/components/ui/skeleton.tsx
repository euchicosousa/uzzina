import { cn } from "~/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
}

export function Skeleton({ className, delay, ...props }: SkeletonProps) {
  const inlineStyles: React.CSSProperties = {
    ...(delay !== undefined
      ? { animationDelay: `${delay}ms`, animationFillMode: "both" }
      : {}),
  };

  return (
    <div
      className={cn("h-6 animate-pulse rounded-md bg-foreground/5", className)}
      style={inlineStyles}
      {...props}
    />
  );
}

export function SkeletonGroup({
  count = 4,
  className,
  delay = 0,
  orientation = "horizontal",
  hasProfile,
  hasLine = true,
  hasBlock,
  isWrapped = true,
  ...props
}: SkeletonProps & {
  count?: number;
  orientation?: "horizontal" | "vertical";
  hasProfile?: boolean;
  hasLine?: boolean;
  hasBlock?: boolean;
  isWrapped?: boolean;
}) {
  const skeletons = [...Array(count)].map((_, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: static list of skeletons
    <div className="flex w-full flex-col gap-2" key={i}>
      {hasProfile && (
        <ProfileSkeleton className={className} delay={delay * i} />
      )}
      {hasLine && <Skeleton className={className} delay={delay * i} />}
      {hasBlock && <Skeleton className={className} delay={delay * i} />}
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

export function ProfileSkeleton({ className, delay, ...props }: SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Skeleton className={cn("size-8 rounded-full")} delay={delay} />
      <Skeleton className={cn("h-4 w-full")} delay={delay} />
    </div>
  );
}
