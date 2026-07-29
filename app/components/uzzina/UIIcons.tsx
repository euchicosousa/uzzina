import {
  PenIcon,
  BinaryIcon,
  ZapIcon,
  BrainIcon,
  LightbulbIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircle2Icon,
  PlusCircleIcon,
  ClipboardCheckIcon,
  CoinsIcon,
  MonitorIcon,
  FilterIcon,
  HelpCircleIcon,
  LayersIcon,
  LayoutGridIcon,
  MoonIcon,
  PaletteIcon,
  ImageIcon,
  PlayIcon,
  PresentationIcon,
  PrinterIcon,
  BadgeCheckIcon,
  SunIcon,
  UserCheckIcon,
  SplineIcon,
  Volume2Icon,
} from "lucide-react";
import { cn } from "cnfast";
import Color from "color";
import { Theme } from "~/hooks/useAppTheme";
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
      return <Volume2Icon className={cn(className)} style={style} />;
    case "capture":
      return <CameraIcon className={cn(className)} style={style} />;
    case "carousel":
      return <LayersIcon className={cn(className)} style={style} />;
    case "design":
      return <SplineIcon className={cn(className)} style={style} />;
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
      return <PlusCircleIcon className={cn(className)} style={style} />;
    case "todo":
      return <ClipboardCheckIcon className={cn(className)} style={style} />;
    case "sprint":
      return <ZapIcon className={cn(className)} style={style} />;
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
      return <PenIcon className={cn(className)} style={style} />;
    case "done":
      return <CheckCircle2Icon className={cn(className)} style={style} />;

    // Estações (Stations)
    case "flow":
      return <BrainIcon className={cn(className)} style={style} />;
    case "planning":
      return <CalendarIcon className={cn(className)} style={style} />;
    case "creation":
      return <PaletteIcon className={cn(className)} style={style} />;
    case "client":
      return <UserCheckIcon className={cn(className)} style={style} />;
    default:
      return <HelpCircleIcon className={cn(className)} style={style} />;
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
