import { afterEach, beforeEach, expect, it, mock } from "bun:test";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContext } from "~/contexts/AppContext";
import { calendarPerson } from "./fixtures/calendar-height";

type Result = { data: unknown; error: unknown };

// Only the Supabase boundary is controlled; the real route, list, detail and hooks run.
const db = {
  leads: [] as Record<string, unknown>[],
  failLeads: false,
  holdLeads: null as (() => void)[] | null,
};
function leadsResult(): Result {
  return db.failLeads
    ? { data: null, error: new Error("Unavailable") }
    : { data: db.leads.map((lead) => ({ ...lead })), error: null };
}
const builder = {
  select: () => builder,
  order: () => builder,
  // biome-ignore lint/suspicious/noThenProperty: Supabase query builders are awaitable.
  then: (
    resolve: (value: Result) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => {
    const held = db.holdLeads;
    if (held) {
      return new Promise<Result>((release) => {
        held.push(() => release(leadsResult()));
      }).then(resolve, reject);
    }
    return Promise.resolve(leadsResult()).then(resolve, reject);
  },
};
mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => ({ from: () => builder }),
}));

const { Route: LeadsRoute } = await import("~/routes/app/leads");

Object.assign(globalThis, { scrollTo: () => {} });

// Viewport width drives matchMedia("(min-width: Npx)"), like a real resize or rotation.
let viewportWidth = 390;
const mediaListeners = new Set<{
  query: string;
  listener: (event: { matches: boolean }) => void;
}>();
function matches(query: string) {
  const min = /min-width:\s*(\d+)px/.exec(query);
  return min ? viewportWidth >= Number(min[1]) : false;
}
function resizeTo(width: number) {
  viewportWidth = width;
  act(() => {
    for (const entry of mediaListeners)
      entry.listener({ matches: matches(entry.query) });
  });
}
function lead(index: number, overrides: Record<string, unknown> = {}) {
  return {
    id: `lead-${index}`,
    name: `Lead Number ${index}`,
    whatsapp: `1199999000${index}`,
    main_need: "social media",
    completed: true,
    created_at: "2026-10-20T10:00:00Z",
    answers: [
      { question: `Question for ${index}`, answer: `Answer for ${index}` },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  viewportWidth = 390;
  mediaListeners.clear();
  db.leads = [lead(1), lead(2), lead(3)];
  db.failLeads = false;
  db.holdLeads = null;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      get matches() {
        return matches(query);
      },
      media: query,
      addEventListener: (
        _type: string,
        listener: (event: { matches: boolean }) => void,
      ) => mediaListeners.add({ query, listener }),
      removeEventListener: (
        _type: string,
        listener: (event: { matches: boolean }) => void,
      ) => {
        for (const entry of mediaListeners)
          if (entry.listener === listener) mediaListeners.delete(entry);
      },
      addListener: () => {},
      removeListener: () => {},
    }),
  });
});
afterEach(cleanup);

async function renderLeads(entries: string[], index?: number) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const rootRoute = createRootRoute();
  const elsewhere = createRoute({
    getParentRoute: () => rootRoute,
    path: "/elsewhere",
    component: () => <p>Outside the leads page</p>,
  });
  const leadsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/app/leads",
    component: LeadsRoute.options.component,
    validateSearch: LeadsRoute.options.validateSearch,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([elsewhere, leadsRoute]),
    history: createMemoryHistory({
      initialEntries: entries,
      initialIndex: index,
    }),
  });
  await act(async () => {
    render(
      <QueryClientProvider client={client}>
        <AppContext.Provider
          value={{
            person: calendarPerson,
            partners: [],
            cloudName: "test",
            uploadPreset: "test",
            setPrimaryAction: () => {},
            partnerFilters: [],
            setPartnerFilters: () => {},
          }}
        >
          <RouterProvider router={router} />
        </AppContext.Provider>
      </QueryClientProvider>,
    );
    await router.load();
  });
  return { router, client };
}

const detailHeading = (index: number) =>
  screen.queryByRole("heading", { name: `Lead Number ${index}`, level: 2 });
const backButton = () =>
  screen.queryByRole("button", { name: "Voltar para leads" });
const card = (index: number) =>
  screen.getByRole("button", { name: new RegExp(`Lead Number ${index}`) });
const searchBox = () => screen.getByRole("textbox", { name: "Buscar leads" });
const currentId = (router: { state: { location: { search: unknown } } }) =>
  (router.state.location.search as { id?: string }).id;

it("starts on the full-width list on a phone, with no detail replacing it", async () => {
  await renderLeads(["/app/leads"]);
  expect(await screen.findByText("Lead Number 1")).toBeTruthy();
  expect(screen.getByText("Lead Number 3")).toBeTruthy();
  expect(detailHeading(1)).toBeNull();
  expect(screen.queryByText(/Perguntas e Respostas/)).toBeNull();
  expect(backButton()).toBeNull();
});

it("opens the detail with a way back, and returning restores the search and scroll position", async () => {
  const { router } = await renderLeads(["/app/leads"]);
  await screen.findByText("Lead Number 1");
  await userEvent.type(searchBox(), "lead number");
  const list = searchBox()
    .closest("div[class*='flex-col']")
    ?.parentElement?.parentElement?.querySelector<HTMLElement>(
      "[class*='overflow-y-auto']",
    );
  expect(list).toBeTruthy();
  if (!list) return;
  act(() => {
    list.scrollTop = 240;
    list.dispatchEvent(new window.Event("scroll"));
  });

  await userEvent.click(card(2));
  expect(
    await screen.findByRole("heading", { name: "Lead Number 2", level: 2 }),
  ).toBeTruthy();
  expect(currentId(router)).toBe("lead-2");
  expect(screen.queryByRole("textbox", { name: "Buscar leads" })).toBeNull();
  expect(screen.queryByText("Lead Number 3")).toBeNull();

  await userEvent.click(backButton() as HTMLElement);
  await waitFor(() => expect(detailHeading(2)).toBeNull());
  expect(currentId(router)).toBeUndefined();
  expect((searchBox() as HTMLInputElement).value).toBe("lead number");
  const restored = searchBox()
    .closest("div[class*='flex-col']")
    ?.parentElement?.parentElement?.querySelector<HTMLElement>(
      "[class*='overflow-y-auto']",
    );
  expect(restored?.scrollTop).toBe(240);
  expect(document.activeElement).toBe(card(2));
});

it("pushes a history entry for a phone selection so browser Back and Forward move between list and detail", async () => {
  const { router } = await renderLeads(["/app/leads"]);
  await screen.findByText("Lead Number 1");
  await userEvent.click(card(3));
  await screen.findByRole("heading", { name: "Lead Number 3", level: 2 });

  act(() => router.history.back());
  await screen.findByRole("textbox", { name: "Buscar leads" });
  expect(detailHeading(3)).toBeNull();
  expect(currentId(router)).toBeUndefined();

  act(() => router.history.forward());
  await screen.findByRole("heading", { name: "Lead Number 3", level: 2 });
  expect(backButton()).toBeTruthy();
});

it("opens a deep link to the detail on a phone and Voltar shows the list without leaving the app", async () => {
  const { router } = await renderLeads(
    ["/elsewhere", "/app/leads?id=lead-2"],
    1,
  );
  expect(
    await screen.findByRole("heading", { name: "Lead Number 2", level: 2 }),
  ).toBeTruthy();
  expect(screen.getByText("Answer for 2")).toBeTruthy();

  await userEvent.click(backButton() as HTMLElement);
  await screen.findByRole("textbox", { name: "Buscar leads" });
  expect(screen.queryByText("Outside the leads page")).toBeNull();
  expect(router.state.location.pathname).toBe("/app/leads");
  expect(currentId(router)).toBeUndefined();
  // Selecting afterwards still works and gets its own entry.
  await userEvent.click(card(1));
  await screen.findByRole("heading", { name: "Lead Number 1", level: 2 });
  act(() => router.history.back());
  await screen.findByRole("textbox", { name: "Buscar leads" });
});

it("explains an id that is not available instead of showing another lead", async () => {
  await renderLeads(["/app/leads?id=gone"]);
  expect(
    await screen.findByText(/não foi encontrado ou você não tem acesso/),
  ).toBeTruthy();
  expect(backButton()).toBeTruthy();
  expect(detailHeading(1)).toBeNull();
});

it("shows loading while a linked lead loads and an error with retry when the list fails", async () => {
  const held: (() => void)[] = [];
  db.holdLeads = held;
  await renderLeads(["/app/leads?id=lead-2"]);
  expect(screen.getByRole("status").textContent).toContain("Carregando lead");
  expect(backButton()).toBeTruthy();
  db.holdLeads = null;
  await act(async () => {
    for (const release of held) release();
  });
  expect(
    await screen.findByRole("heading", { name: "Lead Number 2", level: 2 }),
  ).toBeTruthy();
  cleanup();

  db.failLeads = true;
  await renderLeads(["/app/leads"]);
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Não foi possível carregar os leads",
  );
  db.failLeads = false;
  await userEvent.click(
    screen.getByRole("button", { name: "Tentar novamente" }),
  );
  expect(await screen.findByText("Lead Number 1")).toBeTruthy();
});

it("says so when no lead matches the search", async () => {
  await renderLeads(["/app/leads"]);
  await screen.findByText("Lead Number 1");
  await userEvent.type(searchBox(), "zzz");
  expect(screen.getByText("Nenhum lead encontrado.")).toBeTruthy();
});

it("shows list and detail side by side on desktop, defaulting to the first lead and replacing history on selection", async () => {
  viewportWidth = 1280;
  const { router } = await renderLeads(["/app/leads"]);
  expect(
    await screen.findByRole("heading", { name: "Lead Number 1", level: 2 }),
  ).toBeTruthy();
  expect(screen.getByText("Lead Number 3")).toBeTruthy();
  expect(backButton()).toBeNull();
  const length = router.history.length;

  await userEvent.click(card(3));
  expect(
    await screen.findByRole("heading", { name: "Lead Number 3", level: 2 }),
  ).toBeTruthy();
  expect(screen.getByRole("textbox", { name: "Buscar leads" })).toBeTruthy();
  expect(router.history.length).toBe(length);
});

it("keeps the selected lead and data when the viewport crosses the breakpoint", async () => {
  const { router } = await renderLeads(["/app/leads"]);
  await screen.findByText("Lead Number 1");
  await userEvent.click(card(2));
  await screen.findByRole("heading", { name: "Lead Number 2", level: 2 });

  resizeTo(1024);
  expect(
    await screen.findByRole("heading", { name: "Lead Number 2", level: 2 }),
  ).toBeTruthy();
  expect(screen.getByText("Lead Number 3")).toBeTruthy();
  expect(backButton()).toBeNull();
  expect(currentId(router)).toBe("lead-2");

  resizeTo(390);
  expect(
    await screen.findByRole("heading", { name: "Lead Number 2", level: 2 }),
  ).toBeTruthy();
  expect(screen.queryByText("Lead Number 3")).toBeNull();
  expect(backButton()).toBeTruthy();
});

it("ends every visible scroll region with the AppBar spacer", async () => {
  await renderLeads(["/app/leads"]);
  await screen.findByText("Lead Number 1");
  const regions = () =>
    Array.from(document.querySelectorAll("[class*='overflow-y-auto']"));
  expect(regions()).toHaveLength(1);
  for (const region of regions())
    expect(region.lastElementChild?.hasAttribute("data-app-bar-spacer")).toBe(
      true,
    );

  await userEvent.click(card(1));
  await screen.findByRole("heading", { name: "Lead Number 1", level: 2 });
  expect(regions()).toHaveLength(1);
  for (const region of regions())
    expect(region.lastElementChild?.hasAttribute("data-app-bar-spacer")).toBe(
      true,
    );

  viewportWidth = 1280;
  resizeTo(1280);
  await waitFor(() => expect(regions()).toHaveLength(2));
  for (const region of regions())
    expect(region.lastElementChild?.hasAttribute("data-app-bar-spacer")).toBe(
      true,
    );
});
