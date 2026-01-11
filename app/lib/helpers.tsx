import Color from "color";
import {
  addMinutes,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isToday,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
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
import {
  redirect,
  useRouteLoaderData,
  type SubmitFunction,
} from "react-router";
import { Theme } from "remix-themes";
import type { AppLoaderData } from "~/routes/app";
import {
  DATE_TIME_DISPLAY,
  ORDER_BY,
  PRIORITIES,
  STATES,
  type PRIORITY,
  type STATE,
} from "./CONSTANTS";
import { createSupabaseClient } from "./supabase";
import { cn } from "./utils";

export async function getUserId(request: Request) {
  const { supabase } = await createSupabaseClient(request);

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    throw redirect("/login");
  }

  const user_id = data.claims.sub;

  return { user_id, supabase };
}

export function getLateActions(actions: Action[]) {
  if (!actions) return [];

  const lateActions = actions.filter((action) => {
    return isLateAction(action);
  });

  return lateActions;
}

export function isLateAction(action: Action) {
  const isLate =
    action.state !== STATES.finished.slug && isBefore(action.date, new Date());

  return isLate;
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

export function isInstagramFeed(category: string, stories = false) {
  return ["post", "reels", "carousel", stories ? "stories" : null].includes(
    category,
  );
}

export function getFormattedDateTime(
  date: Date | string,
  option?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY],
  preffix?: string,
) {
  let formatString = "";
  if (option === undefined || option === DATE_TIME_DISPLAY.Null) {
    formatString = "dd/MM";
  } else if (option === DATE_TIME_DISPLAY.Relative) {
    return `${preffix || ""} ${formatDistanceToNow(date, { addSuffix: true, locale: ptBR })}`;
  }

  const showYear =
    new Date(date).getFullYear() !== new Date().getFullYear()
      ? option === 4
        ? " 'de' yyyy"
        : "/yy"
      : "";
  formatString = `dd/MM${showYear}`;
  const showMinutes = format(date, "mm") !== "00" ? "mm" : "";

  switch (option) {
    case DATE_TIME_DISPLAY.DateTime:
      formatString = `dd/MM${showYear} 'às' HH'h'${showMinutes}`;
      break;
    case 3:
      formatString = `dd 'de' MMM${showYear}, HH'h'${showMinutes}`;
      break;
    case 4:
      formatString = `E, dd 'de' MMMM${showYear} 'às' HH'h'${showMinutes}`;
      break;
    case 5:
      formatString = `eeeeee, d/MM${showYear}`;
      break;
    case 6:
      formatString = `HH'h'${showMinutes}`;
      break;
  }

  return format(date, formatString, { locale: ptBR });
}

export function getFormattedPartnersName(partners: Partner[]) {
  return partners.map((partner) => partner.title).join(", ");
}
export function getFormattedPeopleName(people: Person[]) {
  return people
    .filter((p) => p)
    .map((person) => person.name)
    .join(", ");
}

export function sortActions(
  actions: Action[],
  orderBy?: (typeof ORDER_BY)[keyof typeof ORDER_BY],
  ascending = true,
) {
  const priorities_order = Object.values(PRIORITIES).map(
    (priority) => priority.slug,
  );
  const states_order = Object.values(STATES).map((state) => state.slug);

  switch (orderBy) {
    case ORDER_BY.priority:
      actions.sort(
        (a, b) =>
          (priorities_order.indexOf(a.priority as PRIORITY) -
            priorities_order.indexOf(b.priority as PRIORITY)) *
          (ascending ? 1 : -1),
      );
      break;
    case ORDER_BY.state:
      actions.sort(
        (a, b) =>
          (states_order.indexOf(a.state as STATE) -
            states_order.indexOf(b.state as STATE)) *
          (ascending ? 1 : -1),
      );
      break;
    case ORDER_BY.date:
      actions.sort(
        (a, b) =>
          (parseISO(a.date).getTime() - parseISO(b.date).getTime()) *
          (ascending ? 1 : -1),
      );
    case ORDER_BY.instagram_date:
      actions.sort(
        (a, b) =>
          (parseISO(a.instagram_date).getTime() -
            parseISO(b.instagram_date).getTime()) *
          (ascending ? 1 : -1),
      );
    default:
      break;
  }

  return actions;
}

export const handleAction = async (data: any, submit: SubmitFunction) => {
  await submit(
    {
      ...data,
    },
    {
      method: "post",
      action: "/action/handle-action",
      navigate: false,
    },
  );
};

export const Icons = ({
  slug,
  className,
  style,
  color,
}: {
  slug?: string;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}) => {
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
};

export const getCleanAction = (user_id: string, date?: Date) => {
  date = date || new Date();
  let _date = format(
    isToday(date)
      ? date.getHours() < 11
        ? date.setHours(11, 0, 0)
        : addMinutes(date, 10)
      : date.setHours(11, 0, 0),
    "yyyy-MM-dd HH:mm:ss",
  );

  return {
    title: "",
    description: "",
    state: STATES.idea.slug,
    priority: PRIORITIES.medium.slug,
    category: "post",
    responsibles: [user_id],
    topics: null,
    color: "#999",
    date: _date,
    instagram_date: format(addMinutes(_date, 10), "yyyy-MM-dd HH:mm:ss"),
    partners: [],
    time: 10,
  };
};

export const getNewDateForAction = (
  action: Action,
  newDateInput: Date,
  isInstagramDate = false,
) => {
  const duration = action.time || 5; // Duration in minutes

  // Rule: date <= instagram_date - duration

  if (isInstagramDate) {
    // Priority: Update instagram_date
    // New instagram_date = newDateInput

    // Calculate max allowed start date: new_instagram_date - duration
    const maxStartDate = addMinutes(newDateInput, -duration);
    const currentStartDate = parseISO(action.date);

    // If current start date is after max start date, we must move it back
    const newStartDate = isAfter(currentStartDate, maxStartDate)
      ? maxStartDate
      : currentStartDate;

    return {
      date: format(newStartDate, "yyyy-MM-dd HH:mm:ss"),
      instagram_date: format(newDateInput, "yyyy-MM-dd HH:mm:ss"),
    };
  } else {
    // Priority: Update date (start date)
    // New date = newDateInput

    // Calculate min allowed instagram date: new_date + duration
    const minInstagramDate = addMinutes(newDateInput, duration);
    const currentInstagramDate = parseISO(action.instagram_date);

    // If current instagram date is before min instagram date, we must move it forward
    const newInstagramDate = isBefore(currentInstagramDate, minInstagramDate)
      ? minInstagramDate
      : currentInstagramDate;

    return {
      date: format(newDateInput, "yyyy-MM-dd HH:mm:ss"),
      instagram_date: format(newInstagramDate, "yyyy-MM-dd HH:mm:ss"),
    };
  }
};

export const isSprint = (action: Action, person: Person) => {
  return action.sprints?.find((sprint) => sprint === person.user_id);
};

export function getFullPartner(partner: string) {
  const { partners } = useRouteLoaderData("routes/app") as AppLoaderData;

  const fullPartner = partners.find((p) => p.slug === partner);

  return fullPartner;
}

export const isColorValid = (color: string) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};
