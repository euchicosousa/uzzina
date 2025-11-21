import { useId } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SIZE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { getFormattedPartnersName } from "~/lib/helpers";

type UAvatarGroupProps = {
  avatars: UAvatarItem[];
  size?: (typeof SIZE)[keyof typeof SIZE];
  clamp?: number
  title?: string
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

};

export const UAvatarGroup = ({
  avatars,
  size = SIZE.md,
  clamp,
  title
}: UAvatarGroupProps) => {
  const sizeClasses = {
    xs: "-space-x-1",
    sm: "-space-x-1",
    md: "-space-x-2",
    lg: "-space-x-2",
    xl: "-space-x-2",
    // xs: "-space-x-0.5 *:data-[slot=avatar]:ring-3",
    // sm: "-space-x-1 *:data-[slot=avatar]:ring-4",
    // md: "-space-x-2 *:data-[slot=avatar]:ring-5",
    // lg: "-space-x-2 *:data-[slot=avatar]:ring-6",
    // xl: "-space-x-2 *:data-[slot=avatar]:ring-6",
  }[size];

  clamp = clamp || avatars.length;
  return (
    <div className={cn(sizeClasses, "flex")} title={title || avatars.map((avatar) => avatar.fallback).join(", ")}>
      {avatars.slice(0, clamp).map((avatar) => (
        <UAvatar key={`${avatar.id}`} {...avatar} size={size} />
      ))}
      {clamp < avatars.length && (
        <UAvatar
          fallback={`+${avatars.length - clamp}`}
          size={size}
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
}: UAvatarItem) => {
  const fallbackText = (
    size === SIZE.xs
      ? fallback[0]
      : size === SIZE.sm
        ? fallback.substring(0, 2)
        : fallback
  ).toUpperCase();
  const sizeClasses = {
    xs: "size-4 ring-2",
    sm: "size-6 ring-2",
    md: "size-8 ring-3",
    lg: "size-12 ring-4",
    xl: "size-18 ring-6",
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
        className,
        "ring-background border p-0 leading-none font-bold",
      )}
    >
      {image ? (
        <AvatarImage src={image} alt={alt || ""} />
      ) : (
        <AvatarFallback
          className="bg-secondary text-secondary-foreground grid place-content-center text-center"
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
      <div>{text.substring(0, Math.ceil(text.length / 2))}</div>
      <div>{text.substring(Math.ceil(text.length / 2))}</div>
    </div>
  );
}
