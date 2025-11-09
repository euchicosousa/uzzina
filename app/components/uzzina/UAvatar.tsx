import { useId } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SIZE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";

type UAvatarGroupProps = {
  avatars: UAvatarItem[];
  size?: (typeof SIZE)[keyof typeof SIZE];
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
  return (
    <div className={cn(sizeClasses, "flex")}>
      {avatars.map((avatar) => (
        <UAvatar key={`${avatar.id}`} {...avatar} size={size} />
      ))}
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
    xs: "size-4",
    sm: "size-6",
    md: "size-8",
    lg: "size-12",
    xl: "size-18",
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
      : {
          xs: "",
          sm: "",
          md: "text-[10px]",
          lg: "text-[16px]",
          xl: "text-[24px]",
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
        "border-foreground/10 border p-0 leading-none font-bold",
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
