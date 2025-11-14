import Color from "color";
import { getFormattedDateTime } from "~/lib/helpers";
import { ActionItemCategory } from "./ActionItem";
import { DATE_TIME_DISPLAY, SIZE } from "~/lib/CONSTANTS";
import { UBadge } from "../uzzina/UBadge";

export function Content({
  action,
  category,
}: {
  action: Action;
  category?: Category;
}) {
  const hasFiles = action.content_files && action.content_files?.length;
  const backgroundColor = Color(action.color);
  const foregroundColor = hasFiles
    ? "white"
    : Color(action.color).isLight()
      ? Color(action.color).darken(0.5).hex()
      : Color(action.color).lightness() < 20
        ? "white"
        : Color(action.color).lighten(2).hex();

  return (
    <div className="relative">
      <div className="bg-secondary aspect-[4/5] overflow-hidden rounded border transition-opacity duration-500 group-hover/action:opacity-50">
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
      <div className="absolute inset-0 flex items-end justify-between gap-4 p-2">
        {category && (
          <ActionItemCategory
            category={category}
            text={category.title}
            size="md"
          />
        )}
        <div
          className={`overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap ${hasFiles ? "drop-shadow-[0px_1px_1px_#00000050]" : ""}`}
          style={{ color: foregroundColor }}
        >
          {getFormattedDateTime(action.date, DATE_TIME_DISPLAY.TimeOnly)}
        </div>
      </div>
    </div>
  );
}
