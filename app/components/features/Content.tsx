import Color from "color";
import { useRouteLoaderData } from "react-router";
import { CATEGORIES, DATE_TIME_DISPLAY, SIZE } from "~/lib/CONSTANTS";
import { getFormattedDateTime, Icons, isSprint } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import { UAvatarGroup } from "../uzzina/UAvatar";
import { getPeople } from "~/utils/filter";

export function Content({
  action,
  category,
  className,
  isSquared,
  showDate = true,
  showResponsibles,
  dateTimeDisplay = DATE_TIME_DISPLAY.TimeOnly,
}: {
  action: Action;
  category?: (typeof CATEGORIES)[keyof typeof CATEGORIES];
  className?: string;
  isSquared?: boolean;
  showDate?: boolean;
  showResponsibles?: boolean;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
}) {
  const appData = useRouteLoaderData("routes/app") as
    | {
        person?: Person;
        people?: Person[];
      }
    | undefined;
  const person = appData?.person;
  const people = appData?.people || [];

  const actionColor = action.color;

  const hasFiles = action.content_files && action.content_files?.length;
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
          "bg-secondary ring-foreground/5 aspect-[4/5] overflow-hidden ring transition-opacity duration-500 group-hover/action:opacity-80",
          !isSquared && "squircle rounded-2xl",
        )}
      >
        {action.content_files?.length ? (
          <img
            src={action.content_files[0]}
            alt={action.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="text-secondary-foreground grid h-full place-content-center p-4 text-center text-xl leading-tight font-medium tracking-tighter"
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
            {person && isSprint(action, person) && (
              <Icons slug="sprint" className="size-4" color={foregroundColor} />
            )}
          </div>

          {showResponsibles && (
            <UAvatarGroup
              avatars={getPeople(action.responsibles, people).map(
                (responsible) => ({
                  id: responsible.user_id,
                  fallback: responsible.name,
                  image: responsible.image,
                }),
              )}
              // ringColor={backgroundColor.hex()}
              size={SIZE.sm}
            />
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {category && (
            <Icons
              slug={category.slug}
              className="size-4"
              color={foregroundColor}
            />
          )}
          {showDate && (
            <div
              className={`overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap ${hasFiles ? "drop-shadow-[0px_1px_1px_#00000050]" : ""}`}
              style={{ color: foregroundColor }}
            >
              {getFormattedDateTime(action.date, dateTimeDisplay)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
