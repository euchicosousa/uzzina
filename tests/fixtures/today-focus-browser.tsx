import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { AppContext } from "~/contexts/AppContext";
import { TodayPageView } from "~/components/features/today/TodayPageView";
import { HomeTodayView } from "~/components/features/home/HomeTodayView";
import { WorkFileThumbnail } from "~/components/features/media/WorkFileThumbnail";
import {
  CalendarTestProviders,
  calendarAction,
  calendarPerson,
} from "./calendar-height";
import type { Action, Partner } from "~/types";
import type { TodayViewMode } from "~/lib/preferences";
import "~/tailwind.css";

const params = new URLSearchParams(location.search);
const view: TodayViewMode =
  params.get("view") === "categories"
    ? "categories"
    : params.get("view") === "feed"
      ? "feed"
      : "partners";
const partner: Partner = {
  id: "focus-partner",
  slug: "alpha",
  title: "Alpha",
  short: "A",
  colors: ["#666666", "#ffffff"],
  users_ids: [calendarPerson.user_id],
  archived: false,
  image: null,
  sow: "socialmedia",
  created_at: "2026-10-06T10:00:00Z",
  instagram_caption_tail: null,
  context: null,
  voice: null,
};
function Fixture() {
  const [opened, setOpened] = useState<Action[]>([]);
  const [day, setDay] = useState(new Date(2026, 9, 30, 12));
  const [removed, setRemoved] = useState(false);
  if (params.has("inventory"))
    return (
      <div className="p-8">
        <button type="button">Before</button>
        {!removed && (
          <WorkFileThumbnail
            url="https://files.test.invalid/example.pdf"
            onRemove={() => setRemoved(true)}
          />
        )}
        <output data-testid="removed">{String(removed)}</output>
      </div>
    );
  const actions = params.has("empty")
    ? []
    : Array.from({ length: 35 }, (_, i) =>
        calendarAction(i, {
          partners: ["alpha"],
          title: `Ação ${i}`,
          date: "2026-10-30 12:00:00",
          category: "post",
        }),
      );
  return (
    <CalendarTestProviders>
      <AppContext.Provider
        value={{
          person: {
            ...calendarPerson,
            preferences: { defaultTodayView: view },
          },
          partners: [partner],
          cloudName: "test",
          uploadPreset: "test",
          setPrimaryAction: (action) => {
            if (action) setOpened((previous) => [...previous, action]);
          },
          partnerFilters: [],
          setPartnerFilters() {},
        }}
      >
        <button type="button">Before</button>
        <main
          data-app-scroller
          style={{ height: "calc(100dvh - 70px)", overflowY: "auto" }}
        >
          {params.has("home") ? (
            <HomeTodayView
              actions={actions}
              currentDay={day}
              onCurrentDayChange={setDay}
            />
          ) : (
            <TodayPageView
              actions={actions}
              currentDay={day}
              onCurrentDayChange={setDay}
            />
          )}
        </main>
        <button type="button">After</button>
        <output data-testid="opened">{JSON.stringify(opened)}</output>
      </AppContext.Provider>
    </CalendarTestProviders>
  );
}
const route = createRootRoute({ component: Fixture });
const router = createRouter({
  routeTree: route,
  history: createMemoryHistory({ initialEntries: ["/"] }),
});
const root = document.getElementById("root");
if (root) createRoot(root).render(<RouterProvider router={router} />);
