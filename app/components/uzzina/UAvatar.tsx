import { useId } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SIZES } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";

type UAvatarGroupProps = {
  avatars: UAvatarItem[];
};

type UAvatarItem = {
  id?: string;
  fallback: string;
  image?: string | null;
  alt?: string;
  className?: string;
  size?: (typeof SIZES)[keyof typeof SIZES];
};

export const UAvatarGroup = ({ avatars }: UAvatarGroupProps) => {
  const id = useId();
  const size = avatars[0].size || SIZES.md;
  const sizeClasses = {
    xs: "-space-x-1 *:data-[slot=avatar]:ring-4",
    sm: "-space-x-2 *:data-[slot=avatar]:ring-4",
    md: "-space-x-2 *:data-[slot=avatar]:ring-6",
    lg: "-space-x-2 *:data-[slot=avatar]:ring-8",
    xl: "-space-x-2 *:data-[slot=avatar]:ring-8",
  }[size];
  return (
    <div
      className={cn(sizeClasses, "*:data-[slot=avatar]:ring-background flex")}
    >
      {avatars.map((avatar) => (
        <UAvatar key={avatar.id || id} {...avatar} />
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
  size = "md",
}: {
  id?: string;
  fallback: string;
  image?: string | null;
  alt?: string;
  className?: string;
  size?: (typeof SIZES)[keyof typeof SIZES];
}) => {
  const fallbackText = (
    size === SIZES.xs
      ? fallback[0]
      : size === SIZES.sm
        ? fallback.substring(0, 2)
        : fallback
  ).toUpperCase();
  const sizeClasses = {
    xs: "size-6",
    sm: "size-8",
    md: "size-10",
    lg: "size-14",
    xl: "size-20",
  }[size];
  const textClasses =
    fallbackText.length <= 2
      ? {
          xs: "text-[12px]",
          sm: "text-[12px]",
          md: "text-[18px]",
          lg: "text-[24px]",
          xl: "text-[36px]",
        }[size]
      : {
          xs: "",
          sm: "",
          md: "text-[12px]",
          lg: "text-[18px]",
          xl: "text-[24px]",
        }[size];
  return (
    <Avatar
      id={id}
      className={cn(sizeClasses, textClasses, className, "p-0 leading-none")}
    >
      {image ? (
        <AvatarImage src={image} alt={alt || ""} />
      ) : (
        <AvatarFallback className="bg-muted grid place-content-center text-muted-foreground text-center">
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
