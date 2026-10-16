import { createRoot } from "react-dom/client";
import { useState } from "react";
import { addDays, format, startOfMonth, startOfWeek } from "date-fns";
import { CalendarActions } from "~/components/features/Calendar";
import { ClientCalendar } from "~/components/client/ClientCalendar";
import { HomeCalendarView } from "~/components/features/home/HomeCalendarView";
import {
  ViewOptionsComponent,
  useViewOptions,
} from "~/components/features/ViewOptions";
import { CalendarTestProviders, calendarAction } from "./calendar-height";
import "~/tailwind.css";

function Fixture() {
  const params = new URLSearchParams(location.search);
  const count = Number(params.get("count") ?? 20);
  const mode = params.get("mode");
  const date = new Date();
  const actions = Array.from({ length: count }, (_, i) =>
    calendarAction(i, {
      date: `${format(date, "yyyy-MM-dd")} 10:00:00`,
      title: `Action ${i} with a longer title for the calendar`,
      category: i % 2 ? "post" : "design",
      content_files: i % 2 ? ["/__calendar-fixture.svg"] : [],
      content_description:
        "<p>Content preview with enough text to exercise the content layout.</p>",
    }),
  );
  const [variant, setVariant] = useState<"line" | "block" | "content">("line");
  const [options, setOptions] = useViewOptions({
    showOptions: { variant: true, limitHeight: true },
  });
  if (mode === "home")
    return <HomeCalendarView actions={actions} setBaseAction={() => {}} />;
  if (mode === "portal")
    return (
      <div style={{ height: "500px" }}>
        <ClientCalendar
          actions={actions}
          currentDay={date}
          onPrev={() => {}}
          onNext={() => {}}
          onActionClick={() => {}}
          view={params.get("view") === "month" ? "month" : "week"}
        />
      </div>
    );
  const start = startOfWeek(startOfMonth(date));
  return (
    <>
      <ViewOptionsComponent viewOptions={options} setViewOptions={setOptions} />
      <button
        onClick={() =>
          setOptions((previous) => ({
            ...previous,
            limitHeight: !previous.limitHeight,
          }))
        }
      >
        Toggle limit
      </button>
      <button
        onClick={() => {
          const next =
            variant === "line"
              ? "block"
              : variant === "block"
                ? "content"
                : "line";
          setVariant(next);
          setOptions((previous) => ({ ...previous, variant: next }));
        }}
      >
        Next variant
      </button>
      <div
        data-testid="calendar-panel"
        className="flex max-h-[600px] flex-col overflow-y-auto"
      >
        <CalendarActions
          calendar={Array.from({ length: 42 }, (_, i) => ({
            date: addDays(start, i),
            celebrations:
              count > 0 &&
              format(addDays(start, i), "yyyy-MM-dd") ===
                format(date, "yyyy-MM-dd")
                ? [
                    {
                      id: "calendar-celebration",
                      date: format(date, "yyyy-MM-dd"),
                      created_at: date.toISOString(),
                      title: "Calendar celebration",
                    },
                  ]
                : [],
            actions:
              format(addDays(start, i), "yyyy-MM-dd") ===
              format(date, "yyyy-MM-dd")
                ? actions
                : [],
          }))}
          viewOptions={options}
          onCreateAction={() => {}}
        />
      </div>
    </>
  );
}
const root = document.getElementById("root");
if (root)
  createRoot(root).render(
    <CalendarTestProviders>
      <Fixture />
    </CalendarTestProviders>,
  );
