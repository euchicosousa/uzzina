import type React from "react";
import { Badge } from "../ui/badge";
import { cn } from "~/lib/utils";
import type { SIZE } from "~/lib/CONSTANTS";

type TSize = Extract<keyof typeof SIZE, "sm" | "md" | "lg">;

export const UBadge = ({
  size = "md",
  isDynamic = false,
  isRounded = false,
  prefix,
  suffix,
  value,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Badge>, "children"> & {
  size?: TSize;
  isDynamic?: boolean;
  isRounded?: boolean;

  value: number;
  prefix?: string;
  suffix?: string;
}) => {
  if (value === 0) return null;

  const sizeClasses = isRounded
    ? { sm: "size-4", md: "size-6", lg: "size-8" }[size]
    : { sm: "h-4 min-w-4", md: "h-6 min-w-6 ", lg: "h-8 min-w-8" }[size];
  const textClasses = { sm: "text-[10px]", md: "text-sm", lg: "text-base" }[
    size
  ];

  const paddingClasses = { sm: "px-1", md: "px-2", lg: "px-3" }[size];

  const dynamicClasses = isDynamic
    ? value > 7
      ? "bg-error text-error-foreground"
      : value >= 3
        ? "bg-warning text-warning-foreground"
        : undefined
    : undefined;
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
      {prefix}
      {value.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      })}
      {suffix}
    </Badge>
  );
};
