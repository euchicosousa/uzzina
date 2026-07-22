import { IconBrain } from "@tabler/icons-react";
import Color from "color";
import {
  BadgeCheckIcon,
  BinaryIcon,
  BlocksIcon,
  CameraIcon,
  CheckCircle2Icon,
  CircleFadingPlusIcon,
  ClipboardCheckIcon,
  CoinsIcon,
  FilterIcon,
  GalleryHorizontalIcon,
  ImageIcon,
  LayoutGridIcon,
  LightbulbIcon,
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
  // Stations
  CalendarDaysIcon,
  PaletteIcon,
  UserCheck2Icon,
} from "lucide-react";
import { Theme } from "~/components/theme-provider";
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
      return (
        <svg
          aria-hidden="true"
          className={cn(className)}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          style={style}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect height="20" rx="5" ry="5" width="20" x="2" y="2" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );

    // Fases
    case "idea":
      return <LightbulbIcon className={cn(className)} style={style} />;
    case "active":
      return <PenToolIcon className={cn(className)} style={style} />;
    case "done":
      return <CheckCircle2Icon className={cn(className)} style={style} />;

    // Estações (Stations)
    case "flow":
      return <IconBrain className={cn(className)} style={style} />;
    case "planning":
      return <CalendarDaysIcon className={cn(className)} style={style} />;
    case "creation":
      return <PaletteIcon className={cn(className)} style={style} />;
    case "client":
      return <UserCheck2Icon className={cn(className)} style={style} />;
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
