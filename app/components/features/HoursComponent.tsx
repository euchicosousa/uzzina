import {
  eachHourOfInterval,
  endOfDay,
  format,
  isSameHour,
  startOfDay,
} from "date-fns";
import { ActionContainer } from "./ActionContainer";
import type { ViewOptions } from "~/routes/app.partner.slug";
import { VARIANT } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";

export function HoursComponent({
  actions,
  date,
  viewOptions,
}: {
  actions: Action[];
  date: Date;
  viewOptions: ViewOptions;
}) {
  let hours = eachHourOfInterval({
    start: startOfDay(date),
    end: endOfDay(date),
  });

  let actionsByHours = hours
    .map((hour) => {
      let _actions = actions.filter((action) => isSameHour(hour, action.date));
      return { actions: _actions, date: hour };
    })
    .filter((hour) => hour.actions.length > 0);

  return (
    <div className="overflow-x-auto">
      <div className="flex h-full w-full">
        {actionsByHours.map((hour, index) => (
          <div
            key={hour.date.toISOString()}
            className="flex max-h-96 min-w-96 flex-col"
          >
            <div className="border-b py-2 font-medium">
              {format(hour.date, "HH'h'mm")}
            </div>
            <div className="relative h-full p-2 pt-8">
              <div
                className={cn(
                  "text-foreground/50 absolute inset-0 grid grid-cols-4 text-center text-xs",
                  index !== 0 && "border-l",
                )}
              >
                <div className="border-r py-2 opacity-50">
                  {format(hour.date, "HH'h00'")}
                </div>
                <div className="border-r py-2 opacity-50">
                  {format(hour.date, "HH'h15'")}
                </div>
                <div className="border-r py-2 opacity-50">
                  {format(hour.date, "HH'h30'")}
                </div>
                <div className="py-2 opacity-50">
                  {format(hour.date, "HH'h45'")}
                </div>
              </div>
              <ActionContainer
                actions={hour.actions}
                ascending={viewOptions.ascending}
                orderBy={viewOptions.order}
                variant={VARIANT.block}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
