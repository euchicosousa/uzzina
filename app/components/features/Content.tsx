import Color from "color";
import { getFormattedDateTime } from "~/lib/helpers";
import { ActionItemCategory } from "./ActionItem";
import { SIZE } from "~/lib/CONSTANTS";
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
      : Color(action.color).lighten(2).hex();

  return (
    <div className="relative">
      {action.content_files?.length ? (
        <div className="aspect-[4/5] overflow-hidden rounded border">
          <img src={action.content_files[0]} alt={action.title} />
        </div>
      ) : (
        <div
          className="bg-secondary text-secondary-foreground grid aspect-[4/5] place-content-center rounded border p-2 text-center text-xl font-medium tracking-tighter"
          style={{
            backgroundColor: backgroundColor.hex(),
            color: foregroundColor,
            borderColor: backgroundColor.darken(0.1).hex(),
          }}
        >
          {action.title}
        </div>
      )}
      <div className="absolute inset-0 flex items-end justify-between p-2">
        {category && (
          <ActionItemCategory
            category={category}
            text={category.title}
            size="md"
          />
        )}
        <div
          className={`text-xs font-medium ${hasFiles ? "drop-shadow-[0px_1px_1px_#00000050]" : ""}`}
          style={{ color: foregroundColor }}
        >
          {getFormattedDateTime(action.date, 1)}
        </div>
      </div>
    </div>
  );
}
