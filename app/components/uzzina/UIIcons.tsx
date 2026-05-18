import Color from "color";
import {
  BadgeCheckIcon,
  BinaryIcon,
  BlocksIcon,
  BrainIcon,
  CameraIcon,
  CheckCircle2Icon,
  CircleFadingPlusIcon,
  ClipboardCheckIcon,
  CodeIcon,
  CoinsIcon,
  FilterIcon,
  GalleryHorizontalIcon,
  ImageIcon,
  InstagramIcon,
  LayoutGridIcon,
  LightbulbIcon,
  ListCheckIcon,
  MegaphoneIcon,
  MonitorIcon,
  MoonIcon,
  PenToolIcon,
  PlayIcon,
  PresentationIcon,
  PrinterIcon,
  RabbitIcon,
  SplinePointerIcon,
  SunIcon,
  UserCheck2Icon,
  Users2Icon,
  UsersIcon,
  Wand2Icon,
} from "lucide-react";
import { Theme } from "remix-themes";
import { cn } from "~/lib/utils";

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
      return <MegaphoneIcon className={cn(className)} style={style} />;
    case "capture":
      return <CameraIcon className={cn(className)} style={style} />;
    case "carousel":
      return <GalleryHorizontalIcon className={cn(className)} style={style} />;
    case "design":
      return <SplinePointerIcon className={cn(className)} style={style} />;
    case "dev":
      return <BinaryIcon className={cn(className)} style={style} />;
    case "finance":
      return <CoinsIcon className={cn(className)} style={style} />;
    case "meeting":
      return <PresentationIcon className={cn(className)} style={style} />;
    case "post":
      return <ImageIcon className={cn(className)} style={style} />;
    case "print":
      return <PrinterIcon className={cn(className)} style={style} />;
    case "reels":
      return <PlayIcon className={cn(className)} style={style} />;
    case "sm":
      return <BadgeCheckIcon className={cn(className)} style={style} />;
    case "stories":
      return <CircleFadingPlusIcon className={cn(className)} style={style} />;
    case "todo":
      return <ClipboardCheckIcon className={cn(className)} style={style} />;
    case "sprint":
      return <RabbitIcon className={cn(className)} style={style} />;
    case "categories":
      return <LayoutGridIcon className={cn(className)} style={style} />;
    case "filter":
      return <FilterIcon className={cn(className)} style={style} />;
    case "instagram":
      return <InstagramIcon className={cn(className)} style={style} />;

    // Fases
    case "idea":
      return <LightbulbIcon className={cn(className)} style={style} />;
    case "estrategia":
      return <BrainIcon className={cn(className)} style={style} />;
    case "fazer":
      return <ListCheckIcon className={cn(className)} style={style} />;
    case "alinhamento":
      return <UsersIcon className={cn(className)} style={style} />;
    case "criacao":
      return <PenToolIcon className={cn(className)} style={style} />;
    case "aprovacao":
      return <UserCheck2Icon className={cn(className)} style={style} />;
    case "concluido":
      return <CheckCircle2Icon className={cn(className)} style={style} />;

    default:
      return <BlocksIcon className={cn(className)} style={style} />;
  }
}

export const getThemeIcon = (theme: Theme | null, className?: string) => {
  switch (theme) {
    case Theme.DARK:
      return <MoonIcon className={cn(className)} />;
    case Theme.LIGHT:
      return <SunIcon className={cn(className)} />;
    default:
      return <MonitorIcon className={cn(className)} />;
  }
};
