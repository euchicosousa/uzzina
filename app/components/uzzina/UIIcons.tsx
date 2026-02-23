import Color from "color";
import {
  IconRosetteDiscountCheck,
  IconBrain,
  IconCamera,
  IconCoin,
  IconCirclePlus,
  IconClipboardCheck,
  IconCode,
  IconComponents,
  IconDeviceDesktop,
  IconFilter,
  IconLayoutCards,
  IconPhoto,
  IconBrandInstagram,
  IconSpeakerphone,
  IconMoon,
  IconPencil,
  IconPresentation,
  IconPrinter,
  IconGhost,
  IconCategory,
  IconPlayerPlay,
  IconSun,
} from "@tabler/icons-react";
import { Theme } from "remix-themes";
import { cn } from "~/lib/utils";

export function Icons(
  {
    slug,
    className,
    style,
    color,
  }: {
    slug?: string;
    className?: string;
    style?: React.CSSProperties;
    color?: string;
  }
) {
  style = style
    ? style
    : color
      ? {
          color: Color(color).desaturate(0.3).alpha(0.7).hsl().toString(),
          fill: Color(color).desaturate(0.3).alpha(0.1).hsl().toString(),
        }
      : undefined;

  switch (slug) {
    case "ads":
      return <IconSpeakerphone className={cn(className)} style={style} />;
    case "capture":
      return <IconCamera className={cn(className)} style={style} />;
    case "carousel":
      return <IconLayoutCards className={cn(className)} style={style} />;
    case "design":
      return <IconPencil className={cn(className)} style={style} />;
    case "dev":
      return <IconCode className={cn(className)} style={style} />;
    case "finance":
      return <IconCoin className={cn(className)} style={style} />;
    case "meeting":
      return <IconPresentation className={cn(className)} style={style} />;
    case "plan":
      return <IconBrain className={cn(className)} style={style} />;
    case "post":
      return <IconPhoto className={cn(className)} style={style} />;
    case "print":
      return <IconPrinter className={cn(className)} style={style} />;
    case "reels":
      return <IconPlayerPlay className={cn(className)} style={style} />;
    case "sm":
      return <IconRosetteDiscountCheck className={cn(className)} style={style} />;
    case "stories":
      return <IconCirclePlus className={cn(className)} style={style} />;
    case "todo":
      return <IconClipboardCheck className={cn(className)} style={style} />;
    case "sprint":
      return <IconGhost className={cn(className)} style={style} />;
    case "categories":
      return <IconCategory className={cn(className)} style={style} />;
    case "filter":
      return <IconFilter className={cn(className)} style={style} />;
    case "instagram":
      return <IconBrandInstagram className={cn(className)} style={style} />;

    default:
      return <IconComponents className={cn(className)} style={style} />;
  }
}

export const getThemeIcon = (theme: Theme | null, className?: string) => {
  switch (theme) {
    case Theme.DARK:
      return <IconMoon className={cn(className)} />;
    case Theme.LIGHT:
      return <IconSun className={cn(className)} />;
    default:
      return <IconDeviceDesktop className={cn(className)} />;
  }
};
