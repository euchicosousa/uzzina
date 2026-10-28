import {
  afterEach,
  beforeEach,
  expect,
  it,
  setSystemTime,
  spyOn,
} from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { endOfDay, format, startOfDay } from "date-fns";
import { Route as TodayRoute } from "~/routes/app/today";
import { HomeTodayView } from "~/components/features/home/HomeTodayView";
import { QUERY_KEYS } from "~/lib/query-keys";
import { parseU } from "~/utils/date";
import {
  CalendarTestProviders,
  calendarPerson,
} from "./fixtures/calendar-height";

beforeEach(() => setSystemTime(new Date(2026, 9, 27, 12)));
afterEach(() => {
  cleanup();
  setSystemTime();
  geometrySpy?.mockRestore();
});
Object.assign(globalThis, { scrollTo: () => {} });
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  });
}
let geometrySpy:
  ReturnType<typeof spyOn<Element, "getBoundingClientRect">> | undefined;

async function renderToday(entry: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  for (const date of [
    "2026-10-28",
    "2026-10-29",
    "2026-10-30",
    format(new Date(), "yyyy-MM-dd"),
  ]) {
    client.setQueryData(
      QUERY_KEYS.actions.list(
        "today",
        calendarPerson.user_id,
        calendarPerson.admin,
        [],
        startOfDay(parseU(date)).toISOString(),
        endOfDay(parseU(date)).toISOString(),
      ),
      [],
    );
  }
  const rootRoute = createRootRoute();
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <HomeTodayView actions={[]} linkTitle />,
  });
  const todayRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/app/today",
    component: TodayRoute.options.component,
    validateSearch: TodayRoute.options.validateSearch,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, todayRoute]),
    history: createMemoryHistory({ initialEntries: [entry] }),
  });
  await act(async () => {
    render(
      <CalendarTestProviders queryClient={client}>
        <div
          data-testid="route-viewport"
          style={{ height: 820, overflowY: "auto" }}
        >
          <RouterProvider router={router} />
        </div>
      </CalendarTestProviders>,
    );
    await router.load();
  });
  return { router, client };
}

it("fits the dedicated Kanban to the available viewport and keeps Home compact", async () => {
  let viewportBottom = 900;
  geometrySpy = spyOn(
    Element.prototype,
    "getBoundingClientRect",
  ).mockImplementation(function (this: Element) {
    const top = 80;
    return {
      x: 0,
      y: top,
      top,
      left: 0,
      right: 1200,
      bottom: viewportBottom,
      width: 1200,
      height: viewportBottom - top,
      toJSON: () => ({}),
    };
  });
  const { router } = await renderToday("/app/today?date=2026-10-29");
  const user = userEvent.setup();
  await user.click(
    await screen.findByRole("radio", { name: "Visão por Kanban" }),
  );
  const section = screen.getByRole("heading", {
    name: "Quinta-feira, 29 de outubro",
  }).parentElement?.parentElement;
  expect(section?.style.height).toBe("820px");
  viewportBottom = 700;
  await act(async () => {
    window.dispatchEvent(new Event("resize"));
  });
  expect(section?.style.height).toBe("620px");
  await user.click(screen.getByRole("radio", { name: "Visão por Parceiros" }));
  expect(section?.style.height).toBe("");
  await act(async () => {
    await router.navigate({ to: "/" });
  });
  await user.click(
    await screen.findByRole("radio", { name: "Visão por Kanban" }),
  );
  const homeSection = screen.getByRole("heading", { name: "Hoje" })
    .parentElement?.parentElement;
  expect(homeSection?.style.height).toBe("");
});

it("opens the day selected in the home today block when its title is clicked", async () => {
  const { router } = await renderToday("/");
  const user = userEvent.setup();
  await screen.findByRole("link", { name: "Hoje" });
  const nextButton = document
    .querySelector(".lucide-chevron-right")
    ?.closest("button");
  if (!nextButton) throw new Error("Missing next day button");
  await user.click(nextButton);
  const titleLink = screen.getByRole("link", {
    name: "Quarta-feira, 28 de outubro",
  });
  expect(titleLink.getAttribute("href")).toBe("/app/today?date=2026-10-28");
  await user.click(titleLink);
  expect(router.state.location.search).toEqual({ date: "2026-10-28" });
  expect(
    await screen.findByRole("heading", { name: "Quarta-feira, 28 de outubro" }),
  ).toBeTruthy();
});

it("opens the requested local day and follows date changes and browser back", async () => {
  const { router, client } = await renderToday("/app/today?date=2026-10-29");
  expect(
    await screen.findByRole("heading", { name: "Quinta-feira, 29 de outubro" }),
  ).toBeTruthy();
  const activeQueries = client
    .getQueryCache()
    .findAll({ queryKey: ["actions"], type: "active" });
  expect(activeQueries.length).toBe(1);
  expect(activeQueries[0]?.queryKey).toEqual(
    QUERY_KEYS.actions.list(
      "today",
      calendarPerson.user_id,
      calendarPerson.admin,
      [],
      startOfDay(parseU("2026-10-29")).toISOString(),
      endOfDay(parseU("2026-10-29")).toISOString(),
    ),
  );
  const nextButton = document
    .querySelector(".lucide-chevron-right")
    ?.closest("button");
  if (!nextButton) throw new Error("Missing next day button");
  await userEvent.setup().click(nextButton);
  expect(
    await screen.findByRole("heading", { name: "Sexta-feira, 30 de outubro" }),
  ).toBeTruthy();
  expect(router.state.location.search).toEqual({ date: "2026-10-30" });
  await act(async () => {
    router.history.back();
  });
  expect(
    await screen.findByRole("heading", { name: "Quinta-feira, 29 de outubro" }),
  ).toBeTruthy();
});

it.each([
  "/app/today",
  "/app/today?date=2026-02-30",
  "/app/today?date=invalid",
])("opens today when no valid day is provided: %s", async (entry) => {
  await renderToday(entry);
  expect(await screen.findByRole("heading", { name: "Hoje" })).toBeTruthy();
});

it("accepts only real calendar dates", () => {
  const schema = TodayRoute.options.validateSearch;
  if (!schema || typeof schema !== "object" || !("parse" in schema)) {
    throw new Error("Missing date search schema");
  }
  expect(schema?.parse({ date: "2026-02-30" })).toEqual({ date: undefined });
  expect(schema?.parse({ date: "invalid" })).toEqual({ date: undefined });
  expect(schema?.parse({ date: ["2026-10-29"] })).toEqual({ date: undefined });
  expect(schema?.parse({})).toEqual({});
  expect(schema?.parse({ date: "2028-02-29" })).toEqual({ date: "2028-02-29" });
});
