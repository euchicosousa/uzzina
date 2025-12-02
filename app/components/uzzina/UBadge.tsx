import type React from "react";
import { Badge } from "../ui/badge";
import { cn } from "~/lib/utils";
import type { SIZE } from "~/lib/CONSTANTS";

export type TSize = Extract<keyof typeof SIZE, "sm" | "md" | "lg">;

export const UBadge = ({
  size = "md",
  isDynamic = false,
  isRounded = false,
  prefix,
  suffix,
  text,
  value = 0,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Badge>, "children"> & {
  size?: TSize;
  isDynamic?: boolean;
  isRounded?: boolean;
  text?: string;
  value?: number;
  prefix?: string;
  suffix?: string;
}) => {
  if (!text && !value) return null;

  const sizeClasses = isRounded
    ? { sm: "size-4", md: "size-5", lg: "size-7" }[size]
    : { sm: "h-4 min-w-4", md: "h-5 min-w-5 ", lg: "h-7 min-w-7" }[size];
  const textClasses = { sm: "text-[10px]", md: "text-xs", lg: "text-base" }[
    size
  ];

  const paddingClasses = { sm: "px-1.5", md: "px-2", lg: "px-3" }[size];

  const dynamicClasses = isDynamic
    ? value > 7
      ? "bg-destructive text-white border-destructive"
      : value >= 3
        ? "bg-yellow-500 text-black border-yellow-500"
        : "bg-secondary text-secondary-foreground border-secondary"
    : "bg-secondary text-secondary-foreground border-secondary";

  return (
    <Badge
      className={cn(
        "rounded-full",
        sizeClasses,
        paddingClasses,
        dynamicClasses,
        textClasses,
        className,
      )}
      {...props}
    >
      {text
        ? text
        : `${prefix || ""}${value.toLocaleString("pt-BR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
          })}${suffix || ""}`}
    </Badge>
  );
};
