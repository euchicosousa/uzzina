import "./dom-setup";
import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Partner, Person } from "~/types";

if (!("localStorage" in globalThis)) {
  Object.assign(globalThis, { localStorage: window.localStorage });
}
Object.assign(globalThis, { scrollTo: () => {} });
Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
});

const person = {
  id: "bar-person",
  user_id: "bar-user",
  name: "Bar",
  surname: "Test",
  initials: "BT",
  short: "Bar",
  email: "bar@test.invalid",
  admin: true,
  visible: true,
  image: null,
  areas: [],
  preferences: null,
  created_at: "2026-10-27T10:00:00Z",
} satisfies Person;

const partner = {
  id: "bar-partner",
  slug: "agency",
  title: "Agency",
  short: "AG",
  colors: ["#000000", "#ffffff"],
  users_ids: [person.user_id],
  archived: false,
  image: null,
  sow: "socialmedia",
  created_at: "2026-10-27T10:00:00Z",
  instagram_caption_tail: null,
  context: null,
  voice: null,
} satisfies Partner;

// Only the external Supabase boundary is controlled; the /app layout and AppBar are real.
mock.module("~/lib/supabase.client", () => {
  // Every query builder step returns the same settled empty result.
  const methods = [
    "select",
    "eq",
    "neq",
    "in",
    "is",
    "not",
    "or",
    "gte",
    "lte",
    "lt",
    "gt",
    "order",
    "limit",
    "range",
    "contains",
    "overlaps",
    "ilike",
  ];
  const chain: Promise<unknown> = Object.assign(
    Promise.resolve({ data: [], error: null }),
    Object.fromEntries(methods.map((method) => [method, () => chain])),
  );
  const client = {
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: person.user_id } } },
      }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    rpc: async (name: string) =>
      name === "get_app_bootstrap"
        ? { data: { person, partners: [partner] }, error: null }
        : { data: [], error: null },
    from: () => chain,
    channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    removeChannel: () => {},
  };
  return { createSupabaseBrowserClient: () => client };
});

const { Route: AppRoute } = await import("../app/routes/app");
const { AppThemeProvider } = await import("../app/hooks/useAppTheme");

afterEach(cleanup);

function renderAppAt(path: string) {
  const rootRoute = createRootRoute();
  const appRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/app",
    component: AppRoute.options.component,
  });
  const homeRoute = createRoute({
    getParentRoute: () => appRoute,
    path: "/",
    component: () => <div>Home page</div>,
  });
  const partnerRoute = createRoute({
    getParentRoute: () => appRoute,
    path: "/partner/$slug",
    component: () => <div>Partner page</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      appRoute.addChildren([homeRoute, partnerRoute]),
    ]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <AppThemeProvider>
        <RouterProvider router={router} />
      </AppThemeProvider>
    </QueryClientProvider>,
  );
}

it("keeps the AppBar visible outside the home page without a reveal control", async () => {
  renderAppAt("/app/partner/agency");
  await screen.findByText("Partner page");
  const home = await screen.findByTitle("Home");
  const bar = home.closest(".fixed.right-0.bottom-0");
  if (!(bar instanceof HTMLElement)) throw new Error("Missing AppBar wrapper");
  expect(bar.className).not.toContain("opacity-0");
  expect(bar.className).not.toContain("translate-y-28");
  expect(screen.queryByLabelText("Revelar barra de navegação")).toBeNull();
});

it("keeps the AppBar visible on the home page", async () => {
  renderAppAt("/app");
  await screen.findByText("Home page");
  await waitFor(() => expect(screen.getByTitle("Home")).toBeTruthy());
  expect(screen.queryByLabelText("Revelar barra de navegação")).toBeNull();
});
