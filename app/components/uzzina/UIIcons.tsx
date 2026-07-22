import {
  IconBrain,
  IconVolume,
  IconCamera,
  IconLayersDifference,
  IconVectorSpline,
  IconBinary,
  IconCoins,
  IconPresentation,
  IconPhoto,
  IconPrinter,
  IconPlayerPlay,
  IconRosette,
  IconCirclePlus,
  IconClipboardCheck,
  IconBallpen,
  IconLayoutGrid,
  IconFilter,
  IconBulb,
  IconCircleCheck,
  IconCalendarEvent,
  IconPalette,
  IconUserCheck,
  IconHelp,
  IconSun,
  IconMoon,
  IconDeviceDesktop,
} from "@tabler/icons-react";
import Color from "color";
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
      return <IconVolume className={cn(className)} style={style} />;
    case "capture":
      return <IconCamera className={cn(className)} style={style} />;
    case "carousel":
      return <IconLayersDifference className={cn(className)} style={style} />;
    case "design":
      return <IconVectorSpline className={cn(className)} style={style} />;
    case "dev":
      return <IconBinary className={cn(className)} style={style} />;
    case "finance":
      return <IconCoins className={cn(className)} style={style} />;
    case "meeting":
      return <IconPresentation className={cn(className)} style={style} />;
    case "post":
      return <IconPhoto className={cn(className)} style={style} />;
    case "print":
      return <IconPrinter className={cn(className)} style={style} />;
    case "reels":
      return <IconPlayerPlay className={cn(className)} style={style} />;
    case "sm":
      return <IconRosette className={cn(className)} style={style} />;
    case "stories":
      return <IconCirclePlus className={cn(className)} style={style} />;
    case "todo":
      return <IconClipboardCheck className={cn(className)} style={style} />;
    case "sprint":
      return <IconBallpen className={cn(className)} style={style} />;
    case "categories":
      return <IconLayoutGrid className={cn(className)} style={style} />;
    case "filter":
      return <IconFilter className={cn(className)} style={style} />;
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
      return <IconBulb className={cn(className)} style={style} />;
    case "active":
      return <IconBallpen className={cn(className)} style={style} />;
    case "done":
      return <IconCircleCheck className={cn(className)} style={style} />;

    // Estações (Stations)
    case "flow":
      return <IconBrain className={cn(className)} style={style} />;
    case "planning":
      return <IconCalendarEvent className={cn(className)} style={style} />;
    case "creation":
      return <IconPalette className={cn(className)} style={style} />;
    case "client":
      return <IconUserCheck className={cn(className)} style={style} />;
    default:
      return <IconHelp className={cn(className)} style={style} />;
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
