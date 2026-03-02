import { IconBrandInstagram } from "@tabler/icons-react";
import Color from "color";
import { Theme } from "remix-themes";
import { cn } from "~/lib/utils";
import {
  BadgeCheck,
  Blocks,
  Brain,
  Camera,
  CirclePlus,
  ClipboardCheck,
  Code,
  Coins,
  Filter,
  GalleryHorizontal,
  Image,
  LayoutGrid,
  Megaphone,
  Monitor,
  Moon,
  Play,
  Presentation,
  Printer,
  Rabbit,
  SplinePointer,
  Sun,
} from "lucide-react";

export function Icons({
  slug,
  className,
  style,
  color,
}: {
  slug?: string;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}) {
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
      return <Megaphone className={cn(className)} style={style} />;
    case "capture":
      return <Camera className={cn(className)} style={style} />;
    case "carousel":
      return <GalleryHorizontal className={cn(className)} style={style} />;
    case "design":
      return <SplinePointer className={cn(className)} style={style} />;
    case "dev":
      return <Code className={cn(className)} style={style} />;
    case "finance":
      return <Coins className={cn(className)} style={style} />;
    case "meeting":
      return <Presentation className={cn(className)} style={style} />;
    case "plan":
      return <Brain className={cn(className)} style={style} />;
    case "post":
      return <Image className={cn(className)} style={style} />;
    case "print":
      return <Printer className={cn(className)} style={style} />;
    case "reels":
      return <Play className={cn(className)} style={style} />;
    case "sm":
      return <BadgeCheck className={cn(className)} style={style} />;
    case "stories":
      return <CirclePlus className={cn(className)} style={style} />;
    case "todo":
      return <ClipboardCheck className={cn(className)} style={style} />;
    case "sprint":
      return <Rabbit className={cn(className)} style={style} />;
    case "categories":
      return <LayoutGrid className={cn(className)} style={style} />;
    case "filter":
      return <Filter className={cn(className)} style={style} />;
    case "instagram":
      return <IconBrandInstagram className={cn(className)} style={style} />;

    default:
      return <Blocks className={cn(className)} style={style} />;
  }
}

export const getThemeIcon = (theme: Theme | null, className?: string) => {
  switch (theme) {
    case Theme.DARK:
      return <Moon className={cn(className)} />;
    case Theme.LIGHT:
      return <Sun className={cn(className)} />;
    default:
      return <Monitor className={cn(className)} />;
  }
};
