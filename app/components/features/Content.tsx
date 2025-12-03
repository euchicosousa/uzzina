import Color from "color";
import { useRouteLoaderData } from "react-router";
import { DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import { getFormattedDateTime, Icons, isSprint } from "~/lib/helpers";
import { cn } from "~/lib/utils";

export function Content({
  action,
  category,
  isInstagramDate,
  className,
}: {
  action: Action;
  category?: Category;
  isInstagramDate?: boolean;
  className?: string;
}) {
  const { person } = useRouteLoaderData("routes/app") as {
    person: Person;
  };

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
      <div className="bg-secondary aspect-[4/5] overflow-hidden rounded-xl border transition-opacity duration-500 group-hover/action:opacity-50">
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
        <div>
          {isSprint(action, person) && (
            <Icons slug="sprint" className="size-4" color={foregroundColor} />
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
          <div
            className={`overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap ${hasFiles ? "drop-shadow-[0px_1px_1px_#00000050]" : ""}`}
            style={{ color: foregroundColor }}
          >
            {getFormattedDateTime(
              isInstagramDate ? action.instagram_date : action.date,
              DATE_TIME_DISPLAY.TimeOnly,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
