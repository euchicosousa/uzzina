import { type CSSProperties } from "react";
import { SIZE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type UAvatarGroupProps = {
  avatars: UAvatarItem[];
  size?: (typeof SIZE)[keyof typeof SIZE];
  clampAt?: number;
  isSquircle?: boolean;
  title?: string;
  ringColor?: string;
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
  ringColor?: string;
};

export function UAvatarGroup({
  avatars,
  size = SIZE.md,
  clampAt,
  isSquircle,
  title,
  ringColor,
}: UAvatarGroupProps) {
  const sizeClasses =
    {
      xs: "-space-x-0.5",
      sm: "-space-x-0.5",
      md: "-space-x-1",
      lg: "-space-x-2",
      xl: "-space-x-2",
      xxl: "-space-x-2",
    }[size as keyof typeof SIZE] || "-space-x-2";

  const effectiveClampAt = clampAt || avatars.length;

  return (
    <div
      className={cn(sizeClasses, "flex")}
      title={title || avatars.map((avatar) => avatar.fallback).join(", ")}
    >
      {avatars.slice(0, effectiveClampAt).map((avatar) => (
        <UAvatar
          key={`${avatar.id || avatar.fallback}`}
          {...avatar}
          size={size}
          isSquircle={isSquircle}
          isGroup
          ringColor={ringColor || avatar.ringColor}
        />
      ))}
      {effectiveClampAt < avatars.length && (
        <UAvatar
          fallback={`+${avatars.length - effectiveClampAt}`}
          size={size}
          isSquircle={isSquircle}
          isGroup
          ringColor={ringColor}
        />
      )}
    </div>
  );
}

export function UAvatar({
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
  ringColor,
}: UAvatarItem) {
  const fallbackText = (
    size === SIZE.xs
      ? fallback[0]
      : size === SIZE.sm
        ? fallback.substring(0, 2)
        : fallback
  ).toUpperCase();

  const sizeClasses =
    {
      xs: `size-4 ${isGroup && "ring-3"}`,
      sm: `size-6 ${isGroup && "ring-3"}`,
      md: `size-8 ${isGroup && "ring-4"}`,
      lg: `size-12 ${isGroup && "ring-6"}`,
      xl: `size-18 ${isGroup && "ring-8"}`,
      xxl: `size-24 ${isGroup && "ring-8"}`,
    }[size as keyof typeof SIZE] || `size-8 ${isGroup && "ring-4"}`;

  const textClasses =
    fallbackText.length <= 2
      ? {
          xs: "text-[10px]",
          sm: "text-[10px]",
          md: "text-[12px]",
          lg: "text-[18px]",
          xl: "text-[28px]",
          xxl: "text-[38px]",
        }[size as keyof typeof SIZE]
      : fallbackText.length <= 4
        ? {
            xs: "",
            sm: "",
            md: "text-[9px] tracking-[1px]",
            lg: "text-[16px] tracking-[2px]",
            xl: "text-[24px] tracking-[2px]",
            xxl: "text-[34px] tracking-[2px]",
          }[size as keyof typeof SIZE]
        : {
            xs: "",
            sm: "",
            md: "text-[8px] tracking-[1px]",
            lg: "text-[15px] tracking-[2px]",
            xl: "text-[20px] tracking-[2px]",
            xxl: "text-[30px] tracking-[2px]",
          }[size as keyof typeof SIZE];

  const styles =
    backgroundColor && color ? { backgroundColor, color } : undefined;

  const avatarStyles: CSSProperties = {};
  if (ringColor) {
    // @ts-ignore - custom property for Tailwind ring
    avatarStyles["--tw-ring-color"] = ringColor;
  }

  return (
    <Avatar
      id={id}
      style={avatarStyles}
      className={cn(
        sizeClasses,
        textClasses,
        isSquircle && "squircle",
        "rounded-full",
        "p-0 leading-none font-bold",
        isGroup ? "ring-background" : "border",
        className,
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
}

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
