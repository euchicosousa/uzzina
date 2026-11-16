import type { Action } from "~/types";
import type { DashActionDto } from "~/services/dash-client";
import Color from "color";
import { type CATEGORIES, DATE_TIME_DISPLAY, SIZE } from "~/lib/CONSTANTS";
import { getFormattedDateTime, UIcons, isSprint } from "~/utils";
import { cn } from "cnfast";
import { UAvatarGroup } from "../uzzina/UAvatar";
import { getPeople } from "~/utils/filter";
import { resolveActionColor } from "~/utils/uzzina-utils";
import { usePartnerTopics } from "~/hooks/usePartnerTopics";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import { AppContext } from "~/contexts/AppContext";
import { useContext } from "react";
import type { Person } from "~/types";
interface ContentProps {
  action: Action | DashActionDto;
  category?: (typeof CATEGORIES)[keyof typeof CATEGORIES];
  className?: string;
  isSquared?: boolean;
  showDate?: boolean;
  showResponsibles?: boolean;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
}

const NO_TOPIC_COLORS: ReadonlyMap<string, string> = new Map();

/** Portal and public review render without the team providers: no topic query there. */
export function Content(props: ContentProps) {
  const isTeamApp = useContext(AppContext) !== null;
  return isTeamApp ? (
    <TeamContent {...props} />
  ) : (
    <ContentBody {...props} topicColors={NO_TOPIC_COLORS} />
  );
}

function TeamContent(props: ContentProps) {
  const { topicColors } = usePartnerTopics();
  return <ContentBody {...props} topicColors={topicColors} />;
}

function ContentBody({
  action,
  category,
  className,
  isSquared,
  showDate = true,
  showResponsibles,
  dateTimeDisplay = DATE_TIME_DISPLAY.TimeOnly,
  topicColors,
}: ContentProps & { topicColors: ReadonlyMap<string, string> }) {
  const person = useContext(AppContext)?.person;

  // Topic color first, then the action's own color; always a valid hex (the portal DTO arrives already resolved).
  const actionColor = resolveActionColor(
    {
      color: action.color,
      topic_id: "topic_id" in action ? action.topic_id : null,
    },
    topicColors,
  );
  const hasFiles = action.content_files?.length;
  const backgroundColor = Color(actionColor);
  const foregroundColor = hasFiles
    ? "white"
    : Color(actionColor).isLight()
      ? Color(actionColor).darken(0.5).hex()
      : Color(actionColor).lightness() < 20
        ? "white"
        : Color(actionColor).lighten(2).hex();
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "aspect-4/5 overflow-hidden bg-secondary ring ring-border transition-opacity duration-500 group-hover/action:opacity-80",
          !isSquared && "rounded-2xl squircle",
        )}
      >
        {action.content_files?.length ? (
          <img
            alt={action.title}
            className="h-full w-full object-cover"
            src={action.content_files[0]}
          />
        ) : (
          <div
            className="grid h-full place-content-center p-4 text-center text-xl leading-tight font-medium tracking-tighter text-foreground"
            style={{
              backgroundColor: backgroundColor.hex(),
              color: foregroundColor,
              borderColor: backgroundColor.darken(0.1).hex(),
            }}
          >
            {action.title}
          </div>
        )}
      </div>
      <div className="absolute inset-0 flex flex-col justify-between p-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            {person &&
              "sprints" in action &&
              isSprint(action as Action, person) && (
                <UIcons
                  className="size-4"
                  color={foregroundColor}
                  slug="sprint"
                />
              )}
          </div>

          {person && showResponsibles && "responsibles" in action && (
            <ContentResponsibles
              userId={person.user_id}
              responsibles={action.responsibles}
            />
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {category && (
            <UIcons
              className="size-4"
              color={foregroundColor}
              slug={category.slug}
            />
          )}
          {showDate && (
            <div
              className={`overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap ${hasFiles ? "drop-shadow-[0px_1px_1px_#00000050]" : ""}`}
              style={{
                color: foregroundColor,
              }}
            >
              {getFormattedDateTime(action.date, dateTimeDisplay)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentResponsibles({
  userId,
  responsibles,
}: {
  userId: string;
  responsibles: string[];
}) {
  const { data: people = [] } = useQuery({
    queryKey: QUERY_KEYS.people(userId),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });
  return (
    <UAvatarGroup
      avatars={getPeople(responsibles, people).map((responsible: Person) => ({
        id: responsible.user_id,
        fallback: responsible.name,
        image: responsible.image,
      }))}
      size={SIZE.sm}
    />
  );
}
