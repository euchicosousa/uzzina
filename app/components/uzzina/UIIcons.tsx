import Color from "color";
import {
  BadgeCheckIcon,
  BrainIcon,
  CameraIcon,
  CircleDollarSignIcon,
  CircleFadingPlusIcon,
  ClipboardCheckIcon,
  Code2Icon,
  ComponentIcon,
  ComputerIcon,
  FunnelIcon,
  GalleryThumbnailsIcon,
  ImageIcon,
  InstagramIcon,
  MegaphoneIcon,
  MoonIcon,
  PenToolIcon,
  PresentationIcon,
  PrinterIcon,
  RabbitIcon,
  ShapesIcon,
  SquarePlayIcon,
  SunIcon,
} from "lucide-react";
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
      return <MegaphoneIcon className={cn(className)} style={style} />;
    case "capture":
      return <CameraIcon className={cn(className)} style={style} />;
    case "carousel":
      return <GalleryThumbnailsIcon className={cn(className)} style={style} />;
    case "design":
      return <PenToolIcon className={cn(className)} style={style} />;
    case "dev":
      return <Code2Icon className={cn(className)} style={style} />;
    case "finance":
      return <CircleDollarSignIcon className={cn(className)} style={style} />;
    case "meeting":
      return <PresentationIcon className={cn(className)} style={style} />;
    case "plan":
      return <BrainIcon className={cn(className)} style={style} />;
    case "post":
      return <ImageIcon className={cn(className)} style={style} />;
    case "print":
      return <PrinterIcon className={cn(className)} style={style} />;
    case "reels":
      return <SquarePlayIcon className={cn(className)} style={style} />;
    case "sm":
      return <BadgeCheckIcon className={cn(className)} style={style} />;
    case "stories":
      return <CircleFadingPlusIcon className={cn(className)} style={style} />;
    case "todo":
      return <ClipboardCheckIcon className={cn(className)} style={style} />;
    case "sprint":
      return <RabbitIcon className={cn(className)} style={style} />;
    case "categories":
      return <ShapesIcon className={cn(className)} style={style} />;
    case "filter":
      return <FunnelIcon className={cn(className)} style={style} />;
    case "instagram":
      return <InstagramIcon className={cn(className)} style={style} />;

    default:
      return <ComponentIcon className={cn(className)} style={style} />;
  }
}

export const getThemeIcon = (theme: Theme | null, className?: string) => {
  switch (theme) {
    case Theme.DARK:
      return <MoonIcon className={cn(className)} />;
    case Theme.LIGHT:
      return <SunIcon className={cn(className)} />;
    default:
      return <ComputerIcon className={cn(className)} />;
  }
};
