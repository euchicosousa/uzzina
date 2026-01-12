import { useId } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SIZE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { getFormattedPartnersName } from "~/lib/helpers";

type UAvatarGroupProps = {
  avatars: UAvatarItem[];
  size?: (typeof SIZE)[keyof typeof SIZE];
  clampAt?: number;
  isSquircle?: boolean;
  title?: string;
};

type UAvatarItem = {
  id?: string;
  fallback: string;
  image?: string | null;
  alt?: string;
  className?: string;
  size?: (typeof SIZE)[keyof typeof SIZE];
  backgroundColor?: string;
  color?: string;
  isSquircle?: boolean;
  isGroup?: boolean;
};

export const UAvatarGroup = ({
  avatars,
  size = SIZE.md,
  clampAt,
  isSquircle,
  title,
}: UAvatarGroupProps) => {
  const sizeClasses = {
    xs: "-space-x-1",
    sm: "-space-x-1",
    md: "-space-x-2",
    lg: "-space-x-2",
    xl: "-space-x-2",
  }[size];

  clampAt = clampAt || avatars.length;
  return (
    <div
      className={cn(sizeClasses, "flex")}
      title={title || avatars.map((avatar) => avatar.fallback).join(", ")}
    >
      {avatars.slice(0, clampAt).map((avatar) => (
        <UAvatar
          key={`${avatar.id}`}
          {...avatar}
          size={size}
          isSquircle={isSquircle}
          isGroup
        />
      ))}
      {clampAt < avatars.length && (
        <UAvatar
          fallback={`+${avatars.length - clampAt}`}
          size={size}
          isSquircle={isSquircle}
          isGroup
        />
      )}
    </div>
  );
};

export const UAvatar = ({
  id,
  fallback,
  image,
  alt,
  className,
  size = SIZE.md,
  backgroundColor,
  color,
  isSquircle,
  isGroup,
}: UAvatarItem) => {
  const fallbackText = (
    size === SIZE.xs
      ? fallback[0]
      : size === SIZE.sm
        ? fallback.substring(0, 2)
        : fallback
  ).toUpperCase();
  const sizeClasses = {
    xs: `size-4 ${isGroup && "ring-2"}`,
    sm: `size-6 ${isGroup && "ring-2"}`,
    md: `size-8 ${isGroup && "ring-3"}`,
    lg: `size-12 ${isGroup && "ring-4"}`,
    xl: `size-18 ${isGroup && "ring-6"}`,
  }[size];
  const textClasses =
    fallbackText.length <= 2
      ? {
          xs: "text-[10px]",
          sm: "text-[10px]",
          md: "text-[12px]",
          lg: "text-[18px]",
          xl: "text-[28px]",
        }[size]
      : fallbackText.length <= 4
        ? {
            xs: "",
            sm: "",
            md: "text-[9px]",
            lg: "text-[16px]",
            xl: "text-[24px]",
          }[size]
        : {
            xs: "",
            sm: "",
            md: "text-[8px]",
            lg: "text-[15px]",
            xl: "text-[20px]",
          }[size];

  const styles =
    backgroundColor && color ? { backgroundColor, color } : undefined;
  return (
    <Avatar
      id={id}
      className={cn(
        sizeClasses,
        textClasses,
        isSquircle && "squircle",
        "rounded-full",
        className,
        "border p-0 leading-none font-bold",
        isGroup && "ring-background",
      )}
    >
      {image ? (
        <AvatarImage src={image} alt={alt || ""} />
      ) : (
        <AvatarFallback
          className={cn(
            "bg-secondary text-secondary-foreground grid place-content-center text-center",
            isSquircle && "squircle",
          )}
          style={styles}
        >
          {getShortText(fallbackText)}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export function getShortText(text: string) {
  return text.length <= 3 ? (
    text
  ) : (
    <div>
      <div>{text.substring(0, 2)}</div>
      <div>{text.substring(text.length - 2)}</div>
    </div>
  );
}
