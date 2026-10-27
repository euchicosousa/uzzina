import { afterEach, beforeEach, expect, it, setSystemTime } from "bun:test";
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
});
Object.assign(globalThis, { scrollTo: () => {} });

async function renderToday(entry: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  for (const date of [
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
  const todayRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/app/today",
    component: TodayRoute.options.component,
    validateSearch: TodayRoute.options.validateSearch,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([todayRoute]),
    history: createMemoryHistory({ initialEntries: [entry] }),
  });
  await act(async () => {
    render(
      <CalendarTestProviders queryClient={client}>
        <RouterProvider router={router} />
      </CalendarTestProviders>,
    );
    await router.load();
  });
  return { router, client };
}

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
