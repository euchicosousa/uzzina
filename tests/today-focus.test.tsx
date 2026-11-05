import { afterEach, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { AppContext } from "~/contexts/AppContext";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";
import { TodayPageView } from "~/components/features/today/TodayPageView";
import { HomeTodayView } from "~/components/features/home/HomeTodayView";
import { QUERY_KEYS } from "~/lib/query-keys";
import type { Action, Partner } from "~/types";
import type { TodayViewMode } from "~/lib/preferences";
import { calendarAction, calendarPerson } from "./fixtures/calendar-height";

if (!("ResizeObserver" in globalThis))
  Object.assign(globalThis, {
    ResizeObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
if (!window.matchMedia)
  window.matchMedia = (media) => ({
    media,
    matches: false,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => true,
  });
Object.assign(globalThis, { MouseEvent: window.MouseEvent });
afterEach(cleanup);
const day = new Date(2026, 9, 30, 12);
const partner: Partner = {
  id: "partner-alpha",
  slug: "alpha",
  title: "Alpha",
  short: "A",
  colors: ["#666666", "#ffffff"],
  users_ids: ["member"],
  archived: false,
  image: null,
  sow: "socialmedia",
  created_at: "2026-10-06T10:00:00Z",
  instagram_caption_tail: null,
  context: null,
  voice: null,
};
const action = calendarAction(0, {
  title: "Ação Alpha",
  date: "2026-10-30 12:00:00",
  partners: [partner.slug],
  category: "post",
});
async function mount({
  view = "partners",
  empty = false,
  loading = false,
  home = false,
}: {
  view?: TodayViewMode;
  empty?: boolean;
  loading?: boolean;
  home?: boolean;
} = {}) {
  const opened: Action[] = [];
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(QUERY_KEYS.people(calendarPerson.user_id), []);
  const root = createRootRoute({
    component: () => (
      <QueryClientProvider client={client}>
        <AppContext.Provider
          value={{
            person: {
              ...calendarPerson,
              preferences: { defaultTodayView: view },
            },
            partners: [partner],
            cloudName: "test",
            uploadPreset: "test",
            setPrimaryAction: (draft) => {
              if (draft) opened.push(draft);
            },
            partnerFilters: [],
            setPartnerFilters() {},
          }}
        >
          <MultiSelectionProvider>
            <button>Before</button>
            {home ? (
              <HomeTodayView actions={empty ? [] : [action]} currentDay={day} />
            ) : (
              <TodayPageView
                actions={empty ? [] : [action]}
                currentDay={day}
                isLoading={loading}
                onCurrentDayChange={() => {}}
              />
            )}
            <button>After</button>
          </MultiSelectionProvider>
        </AppContext.Provider>
      </QueryClientProvider>
    ),
  });
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await act(async () => {
    render(<RouterProvider router={router} />);
    await router.load();
  });
  return opened;
}
for (const view of ["partners", "categories", "feed"] as const)
  for (const empty of [false, true])
    it(`${view} ${empty ? "empty" : "populated"} skips the content wrapper in both Tab directions`, async () => {
      await mount({ view, empty });
      const region = screen.getByRole("region", { name: "Ações do dia" });
      const user = userEvent.setup();
      act(() =>
        screen
          .getByRole("radio", {
            name: `Visão por ${view === "partners" ? "Parceiros" : view === "categories" ? "Categorias" : "Feed"}`,
          })
          .focus(),
      );
      await user.tab();
      expect(document.activeElement === region).toBe(false);
      act(() => screen.getByRole("button", { name: "After" }).focus());
      await user.tab({ shift: true });
      expect(document.activeElement === region).toBe(false);
    });
it("loading Today does not add a content-wrapper Tab stop", async () => {
  await mount({ empty: true, loading: true });
  act(() => screen.getByRole("radio", { name: "Visão por Parceiros" }).focus());
  await userEvent.setup().tab();
  expect(
    document.activeElement ===
      screen.getByRole("region", { name: "Ações do dia" }),
  ).toBe(false);
});
for (const home of [false, true])
  for (const key of ["{Enter}", " "])
    it(`${home ? "Home" : "Today"} partner creation by ${key} opens one contextual draft`, async () => {
      const opened = await mount({ home });
      const user = userEvent.setup();
      const link = screen.getByRole("link", { name: /Alpha$/ });
      act(() => link.focus());
      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Criar ação para Alpha" }),
      );
      await user.keyboard(key);
      expect(opened).toHaveLength(1);
      expect(opened[0]?.partners).toEqual(["alpha"]);
      expect(opened[0]?.responsibles).toEqual(["member"]);
      expect(opened[0]?.date).toContain("2026-10-30");
      expect(opened[0]?.id).toBeUndefined();
    });
it("category creation remains named, keyboard-operable and contextual", async () => {
  const opened = await mount({ view: "categories" });
  const button = screen.getByRole("button", {
    name: "Criar ação em Post Estático",
  });
  act(() => button.focus());
  await userEvent.setup().keyboard("{Enter}");
  expect(opened).toHaveLength(1);
  expect(opened[0]?.category).toBe("post");
  expect(opened[0]?.id).toBeUndefined();
});

for (const view of ["partners", "categories", "feed"] as const)
  for (const empty of [false, true])
    it(`${view} ${empty ? "empty" : "populated"} cannot retain direct focus on the scrolling wrapper`, async () => {
      await mount({ view, empty });
      const region = screen.getByRole("region", { name: "Ações do dia" });
      act(() => region.focus());
      expect(document.activeElement === region).toBe(false);
    });
