import { afterEach, beforeEach, expect, it, mock } from "bun:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Action, Notification, Partner, Person } from "~/types";

Object.assign(globalThis, {
  localStorage: window.localStorage,
  KeyboardEvent: window.KeyboardEvent,
  MouseEvent: window.MouseEvent,
  PointerEvent: window.MouseEvent,
  scrollTo: () => {},
});
if (!("CSS" in globalThis))
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });
Object.assign(window.Range.prototype, {
  getClientRects: () => [],
  getBoundingClientRect: () => new window.DOMRect(),
});

const person = {
  id: "nav-person",
  user_id: "nav-user",
  name: "Nav",
  surname: "Test",
  initials: "NT",
  short: "Nav",
  email: "nav@test.invalid",
  admin: false,
  visible: true,
  image: null,
  areas: [],
  preferences: null,
  created_at: "2026-10-27T10:00:00Z",
} satisfies Person;

const partner = {
  id: "nav-partner",
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

function makeAction(
  id: string,
  title: string,
  overrides: Partial<Action> = {},
) {
  return {
    id,
    title,
    date: "2026-10-29 10:00:00",
    category: "design",
    phase: "do",
    priority: "medium",
    color: "#666666",
    time: 10,
    partners: [partner.slug],
    responsibles: [],
    archived: false,
    description: null,
    content_description: null,
    instagram_caption: null,
    content_files: [],
    work_files: [],
    sprints: [],
    strategies: [],
    user_id: person.user_id,
    created_at: "2026-10-29T10:00:00Z",
    updated_at: "2026-10-29T10:00:00Z",
    ...overrides,
  } satisfies Action;
}

function notification(id: string, actionId: string, title: string) {
  return {
    id,
    recipient_id: person.user_id,
    comment_id: `comment-${id}`,
    action_id: actionId,
    type: "mention",
    author_name: "Author",
    action_title: title,
    comment_excerpt: `<p>Excerpt ${title}</p>`,
    created_at: "2026-10-29T12:00:00Z",
    read_at: null,
  } as Notification;
}

type Result = { data: unknown; error: unknown; count?: number };
type Deferred = {
  id: string;
  resolve: () => void;
  reject: () => void;
};

const db = {
  actions: new Map<string, Action>(),
  notifications: [] as Notification[],
  deferDetails: false,
  pendingDetails: [] as Deferred[],
  readUpdates: [] as string[][],
  writes: [] as Record<string, unknown>[],
  failWrites: false,
  holdWrites: false,
  heldWrites: [] as (() => void)[],
  signOuts: 0,
  signOutRejects: false,
};
const authListeners = new Set<
  (event: string, session: { user: { id: string } } | null) => void
>();
const session = { user: { id: person.user_id }, access_token: "test-token" };

// Only the Supabase boundary is controlled; the /app layout, Header, panels and real forms run unchanged.
function query(table: string) {
  const filters: Record<string, unknown> = {};
  let mode: "select" | "update" | "insert" = "select";
  let patch: Record<string, unknown> = {};
  let head = false;
  let inIds: string[] | undefined;
  let searched: string | null = null;
  const actionDetail = (): Promise<Result> => {
    const id = String(filters.id);
    const settle = (): Result => {
      const found = db.actions.get(id);
      return found
        ? { data: { ...found }, error: null }
        : { data: null, error: { message: "No access" } };
    };
    if (!db.deferDetails) return Promise.resolve(settle());
    return new Promise((resolve) => {
      db.pendingDetails.push({
        id,
        resolve: () => resolve(settle()),
        reject: () => resolve({ data: null, error: { message: "Offline" } }),
      });
    });
  };
  const actionWrite = (): Promise<Result> => {
    db.writes.push({ ...patch });
    if (db.failWrites)
      return Promise.resolve({ data: null, error: { message: "Unavailable" } });
    const id = mode === "insert" ? `created-${db.writes.length}` : filters.id;
    const canonical = {
      ...(db.actions.get(String(id)) ?? {}),
      ...patch,
      id,
      updated_at: "2026-10-29T10:05:00Z",
    } as Action;
    const settle = (): Result => {
      db.actions.set(String(id), canonical);
      return { data: canonical, error: null };
    };
    if (!db.holdWrites) return Promise.resolve(settle());
    return new Promise((resolve) => {
      db.heldWrites.push(() => resolve(settle()));
    });
  };
  const list = (): Result => {
    if (table === "notifications") {
      if (mode === "update") {
        db.readUpdates.push(inIds ?? []);
        return { data: null, error: null };
      }
      const own = db.notifications.filter(
        (item) => item.recipient_id === filters.recipient_id,
      );
      return head
        ? {
            data: null,
            error: null,
            count: own.filter((item) => !item.read_at).length,
          }
        : { data: own, error: null };
    }
    if (table === "actions" && searched !== null) {
      const term = searched;
      return {
        data: [...db.actions.values()].filter((entry) =>
          entry.title.toLowerCase().includes(term),
        ),
        error: null,
      };
    }
    return { data: [], error: null };
  };
  const builder: Record<string, unknown> = new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "then")
          return (
            resolve: (value: Result) => unknown,
            reject?: (reason: unknown) => unknown,
          ) => Promise.resolve(list()).then(resolve, reject);
        if (property === "single" || property === "maybeSingle")
          return () =>
            table === "actions"
              ? mode === "select"
                ? actionDetail()
                : actionWrite()
              : Promise.resolve({ data: null, error: null });
        if (property === "select")
          return (_columns?: string, options?: { head?: boolean }) => {
            head = Boolean(options?.head);
            return builder;
          };
        if (property === "update" || property === "insert")
          return (value: Record<string, unknown>) => {
            mode = property;
            patch = value;
            return builder;
          };
        if (property === "eq")
          return (column: string, value: unknown) => {
            if (!(column in filters)) filters[column] = value;
            return builder;
          };
        if (property === "in")
          return (_column: string, values: string[]) => {
            inIds = values;
            return builder;
          };
        if (property === "ilike")
          return (_column: string, value: string) => {
            searched = value.replaceAll("%", "").toLowerCase();
            return builder;
          };
        return () => builder;
      },
    },
  );
  return builder;
}

const client = {
  auth: {
    getSession: async () => ({ data: { session } }),
    onAuthStateChange: (
      listener: (
        event: string,
        session: { user: { id: string } } | null,
      ) => void,
    ) => {
      authListeners.add(listener);
      return {
        data: {
          subscription: { unsubscribe: () => authListeners.delete(listener) },
        },
      };
    },
    getUser: async () => ({ data: { user: session.user }, error: null }),
    signOut: async () => {
      db.signOuts++;
      if (db.signOutRejects) throw new Error("Network unavailable");
      return { error: null };
    },
  },
  rpc: async (name: string) =>
    name === "get_app_bootstrap"
      ? { data: { person, partners: [partner] }, error: null }
      : { data: [], error: null },
  from: query,
  channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
  removeChannel: () => {},
};
mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => client,
}));

const { Route: AppRoute } = await import("../app/routes/app");
const { AppThemeProvider } = await import("../app/hooks/useAppTheme");
const { PrismToaster } = await import("../app/components/prism");

const realFetch = globalThis.fetch;
const realConfirm = window.confirm;
beforeEach(() => {
  db.actions = new Map();
  db.notifications = [];
  db.deferDetails = false;
  db.pendingDetails = [];
  db.readUpdates = [];
  db.writes = [];
  db.failWrites = false;
  db.holdWrites = false;
  db.heldWrites = [];
  db.signOuts = 0;
  db.signOutRejects = false;
  localStorage.clear();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    }),
  });
});
afterEach(() => {
  cleanup();
  authListeners.clear();
  globalThis.fetch = realFetch;
  window.confirm = realConfirm;
});

function renderApp(initialEntries = ["/app"], initialIndex?: number) {
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <Outlet />
        <PrismToaster />
      </>
    ),
  });
  const appRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/app",
    component: AppRoute.options.component,
  });
  const page = (path: string, text: string) =>
    createRoute({
      getParentRoute: () => appRoute,
      path,
      component: () => <div>{text}</div>,
    });
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: () => <div>Login page</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      appRoute.addChildren([
        page("/", "Home page"),
        page("/notifications", "Notifications page"),
        page("/profile", "Profile page"),
        page("/partner/$slug", "Partner page"),
      ]),
      loginRoute,
    ]),
    history: createMemoryHistory({ initialEntries, initialIndex }),
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <RouterProvider router={router} />
      </AppThemeProvider>
    </QueryClientProvider>,
  );
  return router;
}

const user = userEvent.setup();
const titles = () =>
  screen.queryAllByRole<HTMLTextAreaElement>("textbox", {
    name: "Título da ação",
    // The inactive tab panel stays mounted but hidden.
    hidden: true,
  });
const seeAll = () => screen.queryByText(/Ver todas as notificações/);

async function openBell() {
  await user.click(
    await screen.findByRole("button", { name: /^Notificações/ }),
  );
  return screen.findByText(/Ver todas as notificações/);
}
async function clickNotification(title: string) {
  await openBell();
  await user.click(
    await screen.findByRole("button", {
      name: new RegExp(`mencionou você na ação ${title}`),
    }),
  );
}
async function openFromNotification(action: Action) {
  await clickNotification(action.title);
  await waitFor(() =>
    expect(titles().map((title) => title.value)).toContain(action.title),
  );
}
async function seeAllNotifications() {
  await openBell();
  const link = seeAll();
  if (!link) throw new Error("Missing notifications link");
  await user.click(link);
}
async function openSecondaryDraft() {
  fireEvent.keyDown(document, { key: "k", ctrlKey: true });
  await screen.findByRole("searchbox");
  await user.keyboard("{Shift>}");
  await user.click(await screen.findByRole("menuitem", { name: "Criar ação" }));
  await user.keyboard("{/Shift}");
  await waitFor(() => expect(titles()).toHaveLength(2));
}
function seed(...actions: Action[]) {
  for (const [index, action] of actions.entries()) {
    db.actions.set(action.id, action);
    db.notifications.push(
      notification(`n${index + 1}`, action.id, action.title),
    );
  }
}

it("a notification click closes its popover first and opens the action once loaded", async () => {
  const action = makeAction("a1", "First mention");
  seed(action);
  const router = renderApp();
  await screen.findByText("Home page");
  db.deferDetails = true;
  await clickNotification(action.title);
  // The popover is gone while the detail is still loading.
  await waitFor(() => expect(seeAll()).toBeNull());
  expect(titles()).toHaveLength(0);
  await waitFor(() => expect(db.pendingDetails).toHaveLength(1));
  await act(async () => db.pendingDetails[0]?.resolve());
  await waitFor(() => expect(titles()[0]?.value).toBe(action.title));
  expect(db.readUpdates).toEqual([["n1"]]);
  expect(router.state.location.pathname).toBe("/app");
});

it("a failed detail load closes the popover and reports the failure without a panel", async () => {
  seed(makeAction("a1", "Hidden mention"));
  renderApp();
  await screen.findByText("Home page");
  db.deferDetails = true;
  await clickNotification("Hidden mention");
  await waitFor(() => expect(seeAll()).toBeNull());
  await waitFor(() => expect(db.pendingDetails).toHaveLength(1));
  await act(async () => db.pendingDetails[0]?.reject());
  await screen.findByText("Não foi possível carregar o detalhe da ação.");
  expect(titles()).toHaveLength(0);
  expect(db.readUpdates).toEqual([["n1"]]);
});

it("with repeated clicks only the latest notification opens, even when an older response arrives last", async () => {
  const older = makeAction("a1", "Older mention");
  const newer = makeAction("a2", "Newer mention");
  seed(older, newer);
  renderApp();
  await screen.findByText("Home page");
  db.deferDetails = true;
  await clickNotification(older.title);
  await clickNotification(newer.title);
  await waitFor(() => expect(db.pendingDetails).toHaveLength(2));
  const [first, second] = db.pendingDetails;
  await act(async () => second?.resolve());
  await waitFor(() => expect(titles()[0]?.value).toBe(newer.title));
  await act(async () => first?.resolve());
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(titles().map((title) => title.value)).toEqual([newer.title]);
});

it("a page change through Back discards a pending notification load but keeps open drawers", async () => {
  const open = makeAction("a1", "Already open");
  const pending = makeAction("a2", "Pending mention");
  seed(open, pending);
  const router = renderApp(["/app/profile", "/app"], 1);
  await screen.findByText("Home page");
  await openFromNotification(open);
  db.deferDetails = true;
  await clickNotification(pending.title);
  await waitFor(() => expect(db.pendingDetails).toHaveLength(1));
  await act(async () => router.history.back());
  await screen.findByText("Profile page");
  // Browser history keeps its meaning: no route-change cleanup closes the drawer.
  expect(titles().map((title) => title.value)).toEqual([open.title]);
  await act(async () => db.pendingDetails[0]?.resolve());
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(titles().map((title) => title.value)).toEqual([open.title]);
});

it("a session reset during the detail load ignores the late response", async () => {
  seed(makeAction("a1", "Before logout"));
  const router = renderApp();
  await screen.findByText("Home page");
  db.deferDetails = true;
  await clickNotification("Before logout");
  await waitFor(() => expect(db.pendingDetails).toHaveLength(1));
  await act(async () => {
    for (const listener of [...authListeners]) listener("SIGNED_OUT", null);
  });
  await screen.findByText("Login page");
  await act(async () => router.navigate({ to: "/app" }));
  await screen.findByText("Home page");
  await act(async () => db.pendingDetails[0]?.resolve());
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(titles()).toHaveLength(0);
});

it("Ver todas without open actions closes the popover and navigates", async () => {
  const router = renderApp();
  await screen.findByText("Home page");
  await seeAllNotifications();
  await screen.findByText("Notifications page");
  expect(router.state.location.pathname).toBe("/app/notifications");
  expect(seeAll()).toBeNull();
});

it("Ver todas closes one clean action through its guard before navigating", async () => {
  const action = makeAction("a1", "Clean action");
  seed(action);
  const router = renderApp();
  await screen.findByText("Home page");
  await openFromNotification(action);
  await seeAllNotifications();
  await screen.findByText("Notifications page");
  expect(router.state.location.pathname).toBe("/app/notifications");
  expect(titles()).toHaveLength(0);
  expect(seeAll()).toBeNull();
  expect(db.writes).toEqual([]);
});

it("Ver todas closes primary and secondary actions before navigating", async () => {
  const action = makeAction("a1", "Primary action");
  seed(action);
  const router = renderApp();
  await screen.findByText("Home page");
  await openFromNotification(action);
  await openSecondaryDraft();
  await seeAllNotifications();
  await screen.findByText("Notifications page");
  expect(router.state.location.pathname).toBe("/app/notifications");
  expect(titles()).toHaveLength(0);
});

it("Ver todas saves a dirty action before leaving and navigates after confirmation", async () => {
  const action = makeAction("a1", "Dirty action");
  seed(action);
  const router = renderApp();
  await screen.findByText("Home page");
  await openFromNotification(action);
  fireEvent.change(titles()[0] as HTMLTextAreaElement, {
    target: { value: "Saved before leaving" },
  });
  await seeAllNotifications();
  await screen.findByText("Notifications page");
  expect(router.state.location.pathname).toBe("/app/notifications");
  expect(db.writes.map((write) => write.title)).toContain(
    "Saved before leaving",
  );
  expect(titles()).toHaveLength(0);
});

it("a dirty action that cannot save keeps the route and its edit", async () => {
  const action = makeAction("a1", "Unsaved action");
  seed(action);
  const router = renderApp();
  await screen.findByText("Home page");
  await openFromNotification(action);
  db.failWrites = true;
  fireEvent.change(titles()[0] as HTMLTextAreaElement, {
    target: { value: "Keep this edit" },
  });
  await seeAllNotifications();
  await screen.findByTestId("drawer-error-banner");
  expect(router.state.location.pathname).toBe("/app");
  expect(screen.getByText("Home page")).toBeTruthy();
  expect(titles().map((title) => title.value)).toEqual(["Keep this edit"]);
  expect(seeAll()).toBeNull();
});

it("the second action's blocking guard keeps both actions and the route", async () => {
  const action = makeAction("a1", "Clean primary");
  seed(action);
  const router = renderApp(["/app/partner/agency"]);
  await screen.findByText("Partner page");
  await openFromNotification(action);
  // On a partner page the new draft belongs to that partner, so it really tries to save.
  await openSecondaryDraft();
  const secondary = titles().find((title) => title.value === "");
  if (!secondary) throw new Error("Missing secondary draft");
  db.failWrites = true;
  fireEvent.change(secondary, { target: { value: "Secondary edit" } });
  await seeAllNotifications();
  await waitFor(() => expect(db.writes.length).toBeGreaterThan(0));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(router.state.location.pathname).toBe("/app/partner/agency");
  expect(titles().map((title) => title.value)).toEqual([
    action.title,
    "Secondary edit",
  ]);
  expect(db.writes.every((write) => write.title === "Secondary edit")).toBe(
    true,
  );
});

it("a save in progress delays navigation until it is confirmed", async () => {
  const action = makeAction("a1", "Saving action");
  seed(action);
  const router = renderApp();
  await screen.findByText("Home page");
  await openFromNotification(action);
  db.holdWrites = true;
  fireEvent.change(titles()[0] as HTMLTextAreaElement, {
    target: { value: "Saving now" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
  await waitFor(() => expect(db.heldWrites).toHaveLength(1));
  await seeAllNotifications();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(router.state.location.pathname).toBe("/app");
  expect(titles().map((title) => title.value)).toEqual(["Saving now"]);
  await act(async () => db.heldWrites[0]?.());
  await screen.findByText("Notifications page");
  expect(titles()).toHaveLength(0);
  expect(db.writes).toHaveLength(1);
});

it("AI processing blocks leaving and keeps the action and route", async () => {
  const action = makeAction("a1", "Social action", { category: "post" });
  seed(action);
  let finishAI: ((response: Response) => void) | undefined;
  globalThis.fetch = (() =>
    new Promise<Response>((resolve) => {
      finishAI = resolve;
    })) as unknown as typeof fetch;
  const router = renderApp();
  await screen.findByText("Home page");
  await openFromNotification(action);
  await user.click(screen.getByRole("button", { name: /CRIAR ESTRATÉGIA/ }));
  // Starting a strategy opens its progress dialog, which makes the rest of
  // the page inert. Closing it does not cancel the generation.
  const progress = await screen.findByRole("dialog");
  await user.click(within(progress).getByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await screen.findByRole("button", { name: /CRIANDO ESTRATÉGIA/ });
  await seeAllNotifications();
  await screen.findByText(
    "Aguarde a geração terminar antes de trocar ou fechar a ação.",
  );
  expect(router.state.location.pathname).toBe("/app");
  expect(titles().map((title) => title.value)).toEqual([action.title]);
  await act(async () => {
    finishAI?.(new Response(null, { status: 503 }));
  });
});

it("a cancelled discard confirmation keeps the route and the draft", async () => {
  let asked = 0;
  window.confirm = () => {
    asked++;
    return false;
  };
  const router = renderApp();
  await screen.findByText("Home page");
  fireEvent.keyDown(document, { code: "KeyA", altKey: true, ctrlKey: true });
  await waitFor(() => expect(titles()).toHaveLength(1));
  fireEvent.change(titles()[0] as HTMLTextAreaElement, {
    target: { value: "X" },
  });
  await seeAllNotifications();
  await waitFor(() => expect(asked).toBe(1));
  expect(router.state.location.pathname).toBe("/app");
  expect(titles().map((title) => title.value)).toEqual(["X"]);
});

it("profile menu pages and the logo navigate in-app only after the actions close", async () => {
  const action = makeAction("a1", "Menu action");
  const other = makeAction("a2", "Logo action");
  seed(action, other);
  const router = renderApp(["/app/notifications"]);
  await screen.findByText("Notifications page");
  await openFromNotification(action);
  db.failWrites = true;
  fireEvent.change(titles()[0] as HTMLTextAreaElement, {
    target: { value: "Blocked edit" },
  });
  await user.click(
    screen.getByRole("button", { name: "Menu do perfil do usuário" }),
  );
  await user.click(
    await screen.findByRole("menuitem", { name: "Minha Conta" }),
  );
  await screen.findByTestId("drawer-error-banner");
  expect(router.state.location.pathname).toBe("/app/notifications");
  expect(titles().map((title) => title.value)).toEqual(["Blocked edit"]);

  db.failWrites = false;
  await user.click(
    screen.getByRole("button", { name: "Menu do perfil do usuário" }),
  );
  await user.click(
    await screen.findByRole("menuitem", { name: "Minha Conta" }),
  );
  await screen.findByText("Profile page");
  expect(titles()).toHaveLength(0);

  await openFromNotification(other);
  // The AppBar is hidden while an action is open, so the only home link is the header logo.
  const logo = document.querySelector('a[href="/app"]');
  if (!logo) throw new Error("Missing header logo link");
  await user.click(logo);
  await screen.findByText("Home page");
  expect(router.state.location.pathname).toBe("/app");
  expect(titles()).toHaveLength(0);
});

it("profile menu Sair waits for the action guards and keeps the session when blocked", async () => {
  const action = makeAction("a1", "Logout action");
  seed(action);
  renderApp();
  await screen.findByText("Home page");
  await openFromNotification(action);
  db.failWrites = true;
  fireEvent.change(titles()[0] as HTMLTextAreaElement, {
    target: { value: "Unsaved before logout" },
  });
  await user.click(
    screen.getByRole("button", { name: "Menu do perfil do usuário" }),
  );
  await user.click(await screen.findByRole("menuitem", { name: "Sair" }));
  await screen.findByTestId("drawer-error-banner");
  expect(db.signOuts).toBe(0);
  expect(titles().map((title) => title.value)).toEqual([
    "Unsaved before logout",
  ]);
  db.failWrites = false;
  await user.click(
    screen.getByRole("button", { name: "Menu do perfil do usuário" }),
  );
  await user.click(await screen.findByRole("menuitem", { name: "Sair" }));
  await waitFor(() => expect(db.signOuts).toBe(1));
});

const headerLogo = () => {
  // The AppBar is hidden while an action is open, so the only home link is the header logo.
  const logo = document.querySelector('a[href="/app"]');
  if (!logo) throw new Error("Missing header logo link");
  return logo;
};
async function heldDirtyAction(path: string) {
  const action = makeAction("a1", "Held action");
  seed(action);
  const router = renderApp([path]);
  await openFromNotification(action);
  db.holdWrites = true;
  fireEvent.change(titles()[0] as HTMLTextAreaElement, {
    target: { value: "Saving while leaving" },
  });
  return router;
}

it("a second leave while the guard is saving retargets the first instead of stranding it", async () => {
  const router = await heldDirtyAction("/app/notifications");
  await screen.findByText("Notifications page");
  await user.click(headerLogo());
  await waitFor(() => expect(db.heldWrites).toHaveLength(1));
  await user.click(headerLogo());
  await user.click(
    screen.getByRole("button", { name: "Menu do perfil do usuário" }),
  );
  await user.click(
    await screen.findByRole("menuitem", { name: "Minha Conta" }),
  );
  await act(async () => db.heldWrites[0]?.());
  await screen.findByText("Profile page");
  expect(router.state.location.pathname).toBe("/app/profile");
  expect(titles()).toHaveLength(0);
  expect(db.writes).toHaveLength(1);
});

it("sign-out requested during a pending page leave wins once the guard allows", async () => {
  await heldDirtyAction("/app/notifications");
  await screen.findByText("Notifications page");
  await user.click(headerLogo());
  await waitFor(() => expect(db.heldWrites).toHaveLength(1));
  await user.click(
    screen.getByRole("button", { name: "Menu do perfil do usuário" }),
  );
  await user.click(await screen.findByRole("menuitem", { name: "Sair" }));
  await user.click(headerLogo());
  await act(async () => db.heldWrites[0]?.());
  await waitFor(() => expect(db.signOuts).toBe(1));
  expect(titles()).toHaveLength(0);
});

it("a rejected sign-out reports the failure", async () => {
  db.signOutRejects = true;
  renderApp();
  await screen.findByText("Home page");
  await user.click(
    screen.getByRole("button", { name: "Menu do perfil do usuário" }),
  );
  await user.click(await screen.findByRole("menuitem", { name: "Sair" }));
  await screen.findByText("Não foi possível sair. Tente novamente.");
  expect(db.signOuts).toBe(1);
});

it("asking for the current page keeps open actions without running their guards", async () => {
  const action = makeAction("a1", "Stay here");
  seed(action);
  const router = renderApp(["/app/notifications"]);
  await screen.findByText("Notifications page");
  await openFromNotification(action);
  // A clean action would close if its guard ran; the current page request must not ask.
  await seeAllNotifications();
  await waitFor(() => expect(seeAll()).toBeNull());
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(router.state.location.pathname).toBe("/app/notifications");
  expect(titles().map((title) => title.value)).toEqual([action.title]);
  expect(db.writes).toEqual([]);
});
