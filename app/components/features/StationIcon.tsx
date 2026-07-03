import { STATIONS, type STATION_TYPE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { Icons } from "~/components/uzzina/UIIcons";

export function StationIcon({
  station,
  size = "sm",
  showText = false,
  className,
}: {
  station: STATION_TYPE | null | undefined;
  size?: "short" | "dot" | "xs" | "sm" | "md";
  showText?: boolean;
  className?: string;
}) {
  const resolved = station ?? STATIONS.flow;

  const sizeClasses = {
    short: "",
    dot: "size-2",
    xs: "size-3",
    sm: "size-4",
    md: "size-5",
  }[size];

  if (size === "short") {
    return (
      <div className="text-[10px] opacity-50 font-bold uppercase tracking-widest">
        {station?.title.substring(0, 2)}
      </div>
    );
  }

  if (size === "dot") {
    return (
      <div
        className={cn("shrink-0 rounded-full", sizeClasses, className)}
        style={{ backgroundColor: resolved.color }}
        title={resolved.title}
      />
    );
  }

  if (showText) {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs", className)}>
        <Icons
          slug={resolved.slug}
          className={cn("shrink-0", sizeClasses)}
          style={{ color: resolved.color }}
        />
        <span className="truncate">{resolved.title}</span>
      </div>
    );
  }

  return (
    <div title={resolved.title} className="shrink-0">
      <Icons
        slug={resolved.slug}
        className={cn(
          "animate-pop transition-colors duration-300",
          sizeClasses,
          className,
        )}
        style={{ color: resolved.color }}
      />
    </div>
  );
}
