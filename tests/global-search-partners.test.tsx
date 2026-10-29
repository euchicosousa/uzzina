import { Route as CelebrationsRoute } from "~/routes/app/admin/celebrations";
import { resetQuerySession } from "~/lib/query-client";
import { QUERY_KEYS } from "~/lib/query-keys";
import { addDays, format } from "date-fns";
import { afterEach, beforeEach, expect, it, mock } from "bun:test";
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppThemeProvider } from "~/hooks/useAppTheme";
import type { SupabaseClient } from "@supabase/supabase-js";
// API tests replace the ESM factory; use the real SDK's separately exported CJS entry.
import { createClient, AuthError } from "@supabase/supabase-js/dist/index.cjs";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { useState } from "react";
import { AppContext } from "~/contexts/AppContext";
import { GlobalSearchCommand } from "~/components/features/GlobalSearchCommand";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import { searchActionsByTitle } from "~/models/actions";
import type { Action, Partner, Celebration } from "~/types";
import { calendarAction, calendarPerson } from "./fixtures/calendar-height";

Object.assign(globalThis, {
  scrollTo: () => {},
  KeyboardEvent: window.KeyboardEvent,
  MouseEvent: window.MouseEvent,
  PointerEvent: window.MouseEvent,
});
if (!("CSS" in globalThis))
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });
const partners: Partner[] = ["Alpha", "Beta", "Gamma"].map((title) => ({
  id: title,
  slug: title.toLowerCase(),
  title,
  short: title,
  colors: ["#000000", "#ffffff"],
  archived: false,
  users_ids: [calendarPerson.user_id],
  created_at: "2026-10-28",
  context: null,
  image: null,
  instagram_caption_tail: null,
  sow: "socialmedia",
  voice: null,
}));
const actions = [
  calendarAction(1, { title: "Campaign Alpha", partners: ["alpha"] }),
  calendarAction(2, {
    title: "Campaign Beta",
    partners: ["beta"],
    archived: false,
  }),
  calendarAction(3, { title: "Campaign Gamma", partners: ["gamma"] }),
  calendarAction(4, { title: "Campaign Shared", partners: ["alpha", "beta"] }),
];
actions.push(
  calendarAction(5, {
    title: "Campaign Retired",
    partners: ["beta"],
    archived: true,
  }),
);
let client: SupabaseClient;
let testClientSequence = 0;
let requests: URL[] = [];
let delayNext = false;
let release: (() => void) | null = null;
const openPrimary = mock(async (_action: Action) => true);
const openSecondary = mock(async (_action: Action) => true);
const changePageFilter = mock(() => {});
const beforeLeave = mock(async () => true);
let admin = true;
let savedPreferences: Record<string, unknown>[] = [];
let signOutCalls = 0;
let failPreferenceSave = false;
let failSignOut = false;
let celebrationEdits: { id: string; title: string; date: string }[] = [];
let storedCelebrations: Celebration[] = [];
let celebrationWrites: { title: string; date: string }[] = [];
let failCelebrationCreate = false;
let delayCelebrationCreate = false;
let releaseCelebrationCreate: (() => void) | null = null;
mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => client,
}));
beforeEach(() => {
  requests = [];
  savedPreferences = [];
  signOutCalls = 0;
  failPreferenceSave = false;
  failSignOut = false;
  celebrationWrites = [];
  celebrationEdits = [];
  storedCelebrations = [
    {
      id: "existing-celebration",
      title: "Data original",
      date: "2026-10-28",
      created_at: "2026-01-01T00:00:00Z",
    },
  ];
  failCelebrationCreate = false;
  delayCelebrationCreate = false;
  releaseCelebrationCreate = null;
  admin = true;
  beforeLeave.mockReset();
  beforeLeave.mockImplementation(async () => true);
  Object.assign(globalThis, { localStorage: window.localStorage });
  localStorage.clear();
  delayNext = false;
  release = null;
  openPrimary.mockClear();
  openSecondary.mockClear();
  changePageFilter.mockClear();
  const sdkClient = createClient("https://search.test", "public-test-key", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: `search-test-${++testClientSequence}`,
    },
    global: {
      fetch: Object.assign(
        async (input: RequestInfo | URL, init?: RequestInit) => {
          const url = new URL(
            typeof input === "string"
              ? input
              : input instanceof URL
                ? input.href
                : input.url,
          );
          if (url.pathname.endsWith("/update_my_preferences")) {
            const body: unknown = JSON.parse(String(init?.body));
            if (
              typeof body === "object" &&
              body &&
              "p_patch" in body &&
              typeof body.p_patch === "object" &&
              body.p_patch
            ) {
              savedPreferences.push(
                Object.fromEntries(Object.entries(body.p_patch)),
              );
            }
            return new Response(
              JSON.stringify(
                failPreferenceSave
                  ? { message: "Preference failure" }
                  : savedPreferences.at(-1),
              ),
              {
                status: failPreferenceSave ? 500 : 200,
                headers: { "Content-Type": "application/json" },
              },
            );
          }
          if (
            url.pathname.endsWith("/celebrations") &&
            init?.method === "PATCH"
          ) {
            const raw: unknown = JSON.parse(String(init.body));
            if (
              !raw ||
              typeof raw !== "object" ||
              !("title" in raw) ||
              !("date" in raw) ||
              typeof raw.title !== "string" ||
              typeof raw.date !== "string"
            )
              throw new Error("Unexpected edit payload");
            const id = (url.searchParams.get("id") || "").replace(/^eq\./, "");
            const patch = { id, title: raw.title, date: raw.date };
            celebrationEdits.push(patch);
            if (delayCelebrationCreate)
              await new Promise<void>((resolve) => {
                releaseCelebrationCreate = resolve;
              });
            const original = storedCelebrations.find((item) => item.id === id);
            if (failCelebrationCreate || !original)
              return new Response(
                JSON.stringify({ message: "Controlled update failure" }),
                {
                  status: 503,
                  headers: { "Content-Type": "application/json" },
                },
              );
            const updated = { ...original, ...patch };
            storedCelebrations = storedCelebrations.map((item) =>
              item.id === id ? updated : item,
            );
            return new Response(JSON.stringify(updated), {
              headers: { "Content-Type": "application/json" },
            });
          }
          if (
            url.pathname.endsWith("/celebrations") &&
            (!init?.method || init.method === "GET")
          ) {
            return new Response(JSON.stringify(storedCelebrations), {
              headers: { "Content-Type": "application/json" },
            });
          }
          if (
            url.pathname.endsWith("/celebrations") &&
            init?.method === "POST"
          ) {
            const raw: unknown = JSON.parse(String(init.body));
            if (
              !Array.isArray(raw) ||
              !raw[0] ||
              typeof raw[0].title !== "string" ||
              typeof raw[0].date !== "string"
            )
              throw new Error("Unexpected celebration payload");
            const item = { title: raw[0].title, date: raw[0].date };
            celebrationWrites.push(item);
            if (delayCelebrationCreate)
              await new Promise<void>((resolve) => {
                releaseCelebrationCreate = resolve;
              });
            return new Response(
              JSON.stringify(
                failCelebrationCreate
                  ? { message: "Controlled creation failure" }
                  : {
                      id: "new-celebration",
                      created_at: new Date().toISOString(),
                      ...item,
                    },
              ),
              {
                status: failCelebrationCreate ? 503 : 201,
                headers: { "Content-Type": "application/json" },
              },
            );
          }
          if (url.pathname.endsWith("/logout")) {
            signOutCalls++;
            return new Response(
              failSignOut
                ? JSON.stringify({ message: "Logout failure" })
                : null,
              { status: failSignOut ? 500 : 204 },
            );
          }
          requests.push(url);
          const scopes = url.searchParams.getAll("partners");
          const slugs = (scopes.find((scope) => scope.startsWith("ov.")) ?? "")
            .replace(/^ov\.\{?|\}?$/g, "")
            .split(",");
          const data = actions.filter(
            (action) =>
              action.partners.some((slug) => slugs.includes(slug)) &&
              (url.searchParams.get("archived") !== "eq.false" ||
                !action.archived),
          );
          const response = () =>
            new Response(JSON.stringify(data), {
              headers: { "Content-Type": "application/json" },
            });
          if (delayNext) {
            delayNext = false;
            return new Promise<Response>((resolve) => {
              release = () => resolve(response());
            });
          }
          return response();
        },
        { preconnect: fetch.preconnect },
      ),
    },
  });
  sdkClient.auth.signOut = async () => {
    signOutCalls++;
    return { error: failSignOut ? new AuthError("Logout failed") : null };
  };
  // The public API is identical; ESM/CJS declarations have distinct private class identities.
  client = sdkClient as unknown as SupabaseClient;
});
afterEach(() => {
  cleanup();
  releaseCelebrationCreate?.();
  release?.();
});
function Harness({
  standalone = false,
  allowAll = false,
}: {
  standalone?: boolean;
  allowAll?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <AppContext.Provider
      value={{
        person: { ...calendarPerson, admin, preferences: {} },
        partners,
        cloudName: "",
        uploadPreset: "",
        setPrimaryAction: () => {},
        partnerFilters: ["alpha"],
        setPartnerFilters: changePageFilter,
      }}
    >
      {standalone ? (
        <>
          <PartnersCombobox
            selectedPartners={selected}
            onSelect={setSelected}
            allowAll={allowAll}
            showText
            variant="filter"
          />
          <output data-testid="selection">{selected.join(",")}</output>
        </>
      ) : (
        <>
          <button onClick={() => setOpen(true)}>Abrir busca</button>
          <Outlet />
          <GlobalSearchCommand
            open={open}
            onOpenChange={setOpen}
            partners={partners}
            onBeforeLeave={beforeLeave}
            setPrimaryAction={openPrimary}
            setSecondaryAction={openSecondary}
          />
        </>
      )}
    </AppContext.Provider>
  );
}
async function mount(
  path = "/app",
  options?: { standalone?: boolean; allowAll?: boolean },
) {
  const root = createRootRoute({ component: () => <Harness {...options} /> });
  const router = createRouter({
    routeTree: root.addChildren([
      createRoute({ getParentRoute: () => root, path: "/app" }),
      createRoute({ getParentRoute: () => root, path: "/app/partner/$slug" }),
      ...[
        "/app/profile",
        "/app/today",
        "/app/notifications",
        "/app/leads",
        "/app/help",
        "/app/admin/partner/$slug",
        "/app/admin/client/$userId",
        "/app/admin/user/$userId",
        "/app/admin/celebrations",
        "/app/admin/partners",
        "/app/admin/clients",
        "/app/admin/users",
      ].map((path) =>
        createRoute({
          getParentRoute: () => root,
          path,
          ...(path === "/app/admin/celebrations"
            ? { component: CelebrationsRoute.options.component }
            : {}),
        }),
      ),
    ]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await act(async () => {
    await router.load();
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <RouterProvider router={router} />
      </AppThemeProvider>
    </QueryClientProvider>,
  );
  const user = userEvent.setup();
  if (!options?.standalone)
    await user.click(
      await screen.findByRole("button", { name: "Abrir busca" }),
    );
  return { user, router, queryClient };
}
const filter = () =>
  screen.getByRole("group", { name: "Filtrar ações por parceiros" });
const search = () =>
  screen.getByRole("searchbox", { name: "Faça sua busca..." });
async function choose(
  name: string,
  user: ReturnType<typeof userEvent.setup>,
  shift = false,
) {
  if (!screen.queryByRole("searchbox", { name: "Procurar parceiro..." }))
    await user.click(within(filter()).getByRole("button"));
  if (shift) await user.keyboard("{Shift>}");
  await user.click(
    screen.getByRole("menuitem", { name: new RegExp(`${name}$`) }),
  );
  if (shift) await user.keyboard("{/Shift}");
}

it("partner page starts scoped and selecting all removes the hidden route restriction", async () => {
  const { user, router } = await mount("/app/partner/alpha");
  expect(within(filter()).getByRole("button", { name: "Alpha" })).toBeTruthy();
  await user.type(search(), "Campaign");
  await screen.findByRole("menuitem", { name: /Campaign Alpha/ });
  expect(screen.queryByRole("menuitem", { name: /Campaign Beta/ })).toBeNull();
  await choose("Todos os parceiros", user);
  await screen.findByRole("menuitem", { name: /Campaign Beta/ });
  expect(requests.at(-1)?.searchParams.getAll("partners")).toEqual([
    "ov.{alpha,beta,gamma}",
  ]);
  expect(changePageFilter).not.toHaveBeenCalled();
  expect(router.state.location.pathname).toBe("/app/partner/alpha");
});

it("model intersects requested partners with available partners and never queries an empty scope", async () => {
  const rows = await searchActionsByTitle(client, {
    query: "Campaign",
    partnerSlugs: ["alpha", "beta"],
    selectedPartnerSlugs: ["beta", "unavailable"],
  });
  expect(rows.map((row) => row.title)).toEqual([
    "Campaign Beta",
    "Campaign Shared",
  ]);
  expect(requests[0]?.searchParams.getAll("partners")).toEqual(["ov.{beta}"]);
  expect(requests[0]?.searchParams.get("title")).toBe("ilike.%Campaign%");
  expect(requests[0]?.searchParams.get("limit")).toBe("10");
  expect(requests[0]?.searchParams.get("archived")).toBe("eq.false");
  const count = requests.length;
  expect(
    await searchActionsByTitle(client, {
      query: "Campaign",
      partnerSlugs: ["alpha"],
      selectedPartnerSlugs: ["unavailable"],
    }),
  ).toEqual([]);
  expect(
    await searchActionsByTitle(client, { query: "Campaign", partnerSlugs: [] }),
  ).toEqual([]);
  expect(requests).toHaveLength(count);
});

it("outside a partner page starts in all, supports multiple partners and returns to all when cleared", async () => {
  const { user } = await mount();
  expect(
    within(filter()).getByRole("button", { name: "Todos os parceiros" }),
  ).toBeTruthy();
  await user.type(search(), "Campaign");
  await screen.findByRole("menuitem", { name: /Campaign Alpha/ });
  await choose("Beta", user);
  await choose("Gamma", user);
  await user.keyboard("{Escape}");
  await screen.findByRole("menuitem", { name: /Campaign Gamma/ });
  expect(screen.queryByRole("menuitem", { name: /Campaign Alpha/ })).toBeNull();
  expect(requests.at(-1)?.searchParams.getAll("partners")).toEqual([
    "ov.{beta,gamma}",
  ]);
  await choose("Gamma", user);
  await choose("Beta", user);
  await user.keyboard("{Escape}");
  await screen.findByRole("menuitem", { name: /Campaign Alpha/ });
  expect(
    within(filter()).getByRole("button", { name: "Todos os parceiros" }),
  ).toBeTruthy();
  expect(requests.at(-1)?.searchParams.getAll("partners")).toEqual([
    "ov.{alpha,beta,gamma}",
  ]);
  expect(changePageFilter).not.toHaveBeenCalled();
});

for (const path of ["/app", "/app/partner/alpha"]) {
  it(`reopening ${path} resets query and filter to the route's initial scope`, async () => {
    const { user } = await mount(path);
    await choose("Beta", user, true);
    await user.type(search(), "Campaign");
    await screen.findByRole("menuitem", { name: /Campaign Beta/ });
    await user.tab();
    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("searchbox", { name: "Faça sua busca..." }),
    ).toBeNull();
    await user.click(screen.getByRole("button", { name: "Abrir busca" }));
    expect(search().getAttribute("value")).toBe("");
    expect(
      within(filter()).getByRole("button", {
        name: path.includes("partner") ? "Alpha" : "Todos os parceiros",
      }),
    ).toBeTruthy();
    await user.type(search(), "Campaign");
    await screen.findByRole("menuitem", { name: /Campaign Alpha/ });
    expect(
      Boolean(screen.queryByRole("menuitem", { name: /Campaign Beta/ })),
    ).toBe(!path.includes("partner"));
  });
}

it("a delayed result from the old partner scope cannot replace the current results", async () => {
  const { user } = await mount("/app/partner/alpha");
  delayNext = true;
  await user.type(search(), "Campaign");
  await waitFor(() => expect(release).not.toBeNull());
  await choose("Beta", user, true);
  await screen.findByRole("menuitem", { name: /Campaign Beta/ });
  const finish = release;
  if (!finish) throw new Error("Missing delayed query");
  await act(async () => {
    finish();
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(screen.queryByRole("menuitem", { name: /Campaign Alpha/ })).toBeNull();
  expect(screen.getByRole("menuitem", { name: /Campaign Beta/ })).toBeTruthy();
});

it("closing a pending search prevents its response from entering the next opening", async () => {
  const { user } = await mount();
  delayNext = true;
  await user.type(search(), "Campaign");
  await waitFor(() => expect(release).not.toBeNull());
  const finish = release;
  if (!finish) throw new Error("Missing delayed query");
  await user.tab();
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("button", { name: "Abrir busca" }));
  await act(async () => {
    finish();
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(screen.queryByRole("menuitem", { name: /Campaign/ })).toBeNull();
  expect(search().getAttribute("value")).toBe("");
});

it("Shift in the picker is exclusive while Shift on a result opens the secondary action", async () => {
  const { user } = await mount();
  await user.click(within(filter()).getByRole("button"));
  const partnerSearch = screen.getByRole("searchbox", {
    name: "Procurar parceiro...",
  });
  await user.type(partnerSearch, "Beta");
  await user.keyboard("{ArrowDown}{Shift>}{Enter}{/Shift}");
  expect(
    screen.queryByRole("searchbox", { name: "Procurar parceiro..." }),
  ).toBeNull();
  expect(within(filter()).getByRole("button", { name: "Beta" })).toBeTruthy();
  expect(openSecondary).not.toHaveBeenCalled();
  await user.type(search(), "Campaign");
  const result = await screen.findByRole("menuitem", { name: /Campaign Beta/ });
  await user.keyboard("{Shift>}");
  await user.click(result);
  await user.keyboard("{/Shift}");
  expect(openPrimary).not.toHaveBeenCalled();
  expect(openSecondary).toHaveBeenCalledTimes(1);
  expect(
    screen.queryByRole("searchbox", { name: "Faça sua busca..." }),
  ).toBeNull();
});

it("choosing all is explicit and existing form selectors keep their original empty behavior", async () => {
  const { user } = await mount("/app", { standalone: true });
  await user.click(screen.getByRole("button", { name: "Parceiros" }));
  expect(
    screen.queryByRole("menuitem", { name: "Todos os parceiros" }),
  ).toBeNull();
  await user.click(screen.getByRole("menuitem", { name: /Alpha$/ }));
  expect(screen.getByTestId("selection").textContent).toBe("alpha");
});

it("the optional all choice clears multiple selections and shows its empty label", async () => {
  const { user } = await mount("/app", { standalone: true, allowAll: true });
  await user.click(screen.getByRole("button", { name: "Todos os parceiros" }));
  await user.click(screen.getByRole("menuitem", { name: /Alpha$/ }));
  await user.click(screen.getByRole("menuitem", { name: /Beta$/ }));
  expect(screen.getByTestId("selection").textContent).toBe("alpha,beta");
  await user.click(
    screen.getByRole("menuitem", { name: "Todos os parceiros" }),
  );
  expect(screen.getByTestId("selection").textContent).toBe("");
  expect(
    screen.getByRole("button", { name: "Todos os parceiros" }),
  ).toBeTruthy();
  expect(screen.queryByRole("searchbox")).toBeNull();
});

it("search filters sit after results without an extra visible label", async () => {
  await mount();
  expect(screen.queryByText("Ações de")).toBeNull();
  const menu = screen.getByRole("menu");
  expect(
    Boolean(
      filter().compareDocumentPosition(menu) & Node.DOCUMENT_POSITION_PRECEDING,
    ),
  ).toBe(true);
  expect(
    screen.getByRole<HTMLInputElement>("checkbox", {
      name: "Incluir arquivadas",
    }).checked,
  ).toBe(false);
});

it("archived actions are opt-in within the chosen partners and reset on reopening", async () => {
  const { user } = await mount();
  await choose("Beta", user, true);
  await user.type(search(), "Campaign");
  await screen.findByRole("menuitem", { name: /Campaign Beta/ });
  expect(
    screen.queryByRole("menuitem", { name: /Campaign Retired/ }),
  ).toBeNull();
  await user.click(
    screen.getByRole("checkbox", { name: "Incluir arquivadas" }),
  );
  await screen.findByRole("menuitem", { name: /Campaign Retired/ });
  expect(requests.at(-1)?.searchParams.getAll("partners")).toEqual([
    "ov.{beta}",
  ]);
  expect(requests.at(-1)?.searchParams.has("archived")).toBe(false);
  expect(screen.queryByRole("menuitem", { name: /Campaign Alpha/ })).toBeNull();
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("button", { name: "Abrir busca" }));
  expect(
    screen.getByRole<HTMLInputElement>("checkbox", {
      name: "Incluir arquivadas",
    }).checked,
  ).toBe(false);
  await user.type(search(), "Campaign");
  await screen.findByRole("menuitem", { name: /Campaign Alpha/ });
  expect(
    screen.queryByRole("menuitem", { name: /Campaign Retired/ }),
  ).toBeNull();
});

it("creates a local primary draft from the empty search without a database request", async () => {
  const { user } = await mount();
  await user.click(screen.getByRole("menuitem", { name: "Criar ação" }));
  expect(openPrimary).toHaveBeenCalledTimes(1);
  expect(openSecondary).not.toHaveBeenCalled();
  expect(openPrimary.mock.calls[0]?.[0]).toMatchObject({
    title: "",
    partners: ["alpha"],
    responsibles: [calendarPerson.user_id],
  });
  expect(openPrimary.mock.calls[0]?.[0]?.id).toBeUndefined();
  expect(requests).toHaveLength(0);
  expect(screen.queryByRole("searchbox")).toBeNull();
});

it("finds the creation command by name and opens secondary with Shift Enter", async () => {
  const { user } = await mount();
  await user.type(search(), "Criar ação");
  await user.keyboard("{ArrowDown}{Shift>}{Enter}{/Shift}");
  await waitFor(() => expect(openSecondary).toHaveBeenCalledTimes(1));
  expect(openPrimary).not.toHaveBeenCalled();
  expect(openSecondary.mock.calls[0]?.[0]?.id).toBeUndefined();
});

it("Shift click creates in the route context independently of the search partner filter", async () => {
  const { user } = await mount("/app/partner/alpha");
  await choose("Beta", user, true);
  await user.keyboard("{Shift>}");
  await user.click(screen.getByRole("menuitem", { name: "Criar ação" }));
  await user.keyboard("{/Shift}");
  expect(openSecondary).toHaveBeenCalledTimes(1);
  expect(openSecondary.mock.calls[0]?.[0]?.partners).toEqual(["alpha"]);
  expect(requests).toHaveLength(0);
});

it("Space remains query text until navigating to the creation command", async () => {
  const { user } = await mount();
  await user.type(search(), "Criar ");
  expect(search().getAttribute("value")).toBe("Criar ");
  expect(openPrimary).not.toHaveBeenCalled();
  await user.type(search(), "ação");
  await user.keyboard("{ArrowDown}");
  await waitFor(() =>
    expect(search().getAttribute("aria-activedescendant")).toBeTruthy(),
  );
  await user.keyboard("{Shift>} {/Shift}");
  await waitFor(() => expect(openSecondary).toHaveBeenCalledTimes(1));
});

it("keeps search open when the current action blocks draft replacement", async () => {
  openPrimary.mockImplementationOnce(async () => false);
  const { user } = await mount();
  await user.click(screen.getByRole("menuitem", { name: "Criar ação" }));
  expect(openPrimary).toHaveBeenCalledTimes(1);
  expect(
    screen.getByRole("searchbox", { name: "Faça sua busca..." }),
  ).toBeTruthy();
});

for (const activation of ["{Enter}", " "]) {
  it(`creates in primary with ordinary keyboard activation ${JSON.stringify(activation)}`, async () => {
    const { user } = await mount();
    await user.type(search(), "Criar ação");
    await user.keyboard("{ArrowDown}");
    await waitFor(() =>
      expect(search().getAttribute("aria-activedescendant")).toBeTruthy(),
    );
    await user.keyboard(activation);
    await waitFor(() => expect(openPrimary).toHaveBeenCalledTimes(1));
    expect(openSecondary).not.toHaveBeenCalled();
  });
}

it("hides all administrative commands from ordinary members", async () => {
  admin = false;
  await mount();
  expect(screen.getByRole("menuitem", { name: "Minha conta" })).toBeTruthy();
  expect(
    screen.getByRole("menuitem", { name: "Tema do sistema" }),
  ).toBeTruthy();
  expect(screen.queryByRole("menuitem", { name: "Criar parceiro" })).toBeNull();
  expect(
    screen.queryByRole("menuitem", { name: "Gerenciar usuários" }),
  ).toBeNull();
  expect(screen.queryByRole("group", { name: "Administração" })).toBeNull();
  expect(
    screen.queryByRole("menuitem", { name: "Criar data comemorativa" }),
  ).toBeNull();
});

for (const [label, path] of [
  ["Minha conta", "/app/profile"],
  ["Ir para início", "/app"],
  ["Ir para Hoje", "/app/today"],
  ["Notificações", "/app/notifications"],
  ["Leads", "/app/leads"],
  ["Ajuda e documentação", "/app/help"],
  ["Criar parceiro", "/app/admin/partner/new"],
  ["Criar cliente", "/app/admin/client/new"],
  ["Criar usuário", "/app/admin/user/new"],
  ["Gerenciar parceiros", "/app/admin/partners"],
  ["Gerenciar clientes", "/app/admin/clients"],
  ["Gerenciar usuários", "/app/admin/users"],
  ["Gerenciar datas comemorativas", "/app/admin/celebrations"],
]) {
  it(`navigates through the guarded ${label} command`, async () => {
    const { user, router } = await mount("/app/partner/alpha");
    await user.click(screen.getByRole("menuitem", { name: label }));
    await waitFor(() => expect(router.state.location.pathname).toBe(path));
    expect(beforeLeave).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });
}

it("a blocked guard keeps navigation and search in place", async () => {
  beforeLeave.mockImplementation(async () => false);
  const { user, router } = await mount();
  await user.click(screen.getByRole("menuitem", { name: "Minha conta" }));
  expect(beforeLeave).toHaveBeenCalledTimes(1);
  expect(router.state.location.pathname).toBe("/app");
  expect(
    screen.getByRole("searchbox", { name: "Faça sua busca..." }),
  ).toBeTruthy();
});

for (const [label, theme] of [
  ["Tema claro", "light"],
  ["Tema escuro", "dark"],
  ["Tema do sistema", "system"],
]) {
  it(`persists ${label} after the search closes without changing palette`, async () => {
    const { user } = await mount();
    localStorage.setItem("uzzina-accent-color-index", "4");
    await user.click(screen.getByRole("menuitem", { name: label }));
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(localStorage.getItem("uzzina-theme")).toBe(theme);
    expect(localStorage.getItem("uzzina-accent-color-index")).toBe("4");
    await waitFor(() => expect(savedPreferences).toEqual([{ theme }]));
    expect(beforeLeave).not.toHaveBeenCalled();
  });
}

it("reports preference failure on reopening and retries the preserved theme patch", async () => {
  failPreferenceSave = true;
  const { user } = await mount();
  await user.click(screen.getByRole("menuitem", { name: "Tema escuro" }));
  await waitFor(() => expect(savedPreferences).toHaveLength(1));
  await user.click(screen.getByRole("button", { name: "Abrir busca" }));
  failPreferenceSave = false;
  await user.click(
    await screen.findByRole("menuitem", { name: "Tentar salvar preferências" }),
  );
  await waitFor(() =>
    expect(savedPreferences).toEqual([{ theme: "dark" }, { theme: "dark" }]),
  );
});

it("Space activates a navigation command while Shift adds no secondary meaning", async () => {
  const { user, router } = await mount();
  await user.type(search(), "Minha conta");
  await user.keyboard("{ArrowDown}");
  await waitFor(() =>
    expect(search().getAttribute("aria-activedescendant")).toBeTruthy(),
  );
  await user.keyboard("{Shift>} {/Shift}");
  await waitFor(() =>
    expect(router.state.location.pathname).toBe("/app/profile"),
  );
  expect(openSecondary).not.toHaveBeenCalled();
});

it("signs out once after the leave guard and closes the search", async () => {
  const { user } = await mount();
  await user.click(screen.getByRole("menuitem", { name: "Sair" }));
  expect(beforeLeave).toHaveBeenCalledTimes(1);
  expect(signOutCalls).toBe(1);
  expect(screen.queryByRole("searchbox")).toBeNull();
});

it("does not sign out when a form blocks leaving", async () => {
  beforeLeave.mockImplementation(async () => false);
  const { user } = await mount();
  await user.click(screen.getByRole("menuitem", { name: "Sair" }));
  expect(signOutCalls).toBe(0);
  expect(
    screen.getByRole("searchbox", { name: "Faça sua busca..." }),
  ).toBeTruthy();
});

it("shows a command error and allows retry after sign out fails", async () => {
  failSignOut = true;
  const { user } = await mount();
  await user.click(screen.getByRole("menuitem", { name: "Sair" }));
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Não foi possível executar o comando",
  );
  expect(
    screen.getByRole("searchbox", { name: "Faça sua busca..." }),
  ).toBeTruthy();
  failSignOut = false;
  await user.click(screen.getByRole("menuitem", { name: "Sair" }));
  expect(signOutCalls).toBe(2);
  expect(screen.queryByRole("searchbox")).toBeNull();
});

it("opens Create celebration as a focused modal without navigating or closing action panels", async () => {
  const { user, router } = await mount("/app/partner/alpha");
  await user.click(
    screen.getByRole("menuitem", { name: "Criar data comemorativa" }),
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Criar data comemorativa",
  });
  expect(router.state.location.pathname).toBe("/app/partner/alpha");
  expect(beforeLeave).not.toHaveBeenCalled();
  expect(openPrimary).not.toHaveBeenCalled();
  expect(openSecondary).not.toHaveBeenCalled();
  expect(screen.queryByRole("searchbox")).toBeNull();
  await waitFor(() =>
    expect(document.activeElement).toBe(
      within(dialog).getByRole("textbox", { name: "Título" }),
    ),
  );
  await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Criar data comemorativa" }),
    ).toBeNull(),
  );
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Abrir busca" }),
    ),
  );
});

it("creates one trimmed celebration with a calendar-selected date and updates only the current cache", async () => {
  const { user, queryClient } = await mount();
  const key = QUERY_KEYS.celebrations(calendarPerson.user_id);
  queryClient.setQueryData(key, []);
  queryClient.setQueryData(QUERY_KEYS.celebrations("other-user"), []);
  await user.click(
    screen.getByRole("menuitem", { name: "Criar data comemorativa" }),
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Criar data comemorativa",
  });
  fireEvent.change(within(dialog).getByRole("textbox", { name: "Título" }), {
    target: { value: "  Evento de teste  " },
  });
  const day = dialog.querySelector('[role="grid"] [tabindex="0"]');
  if (!(day instanceof HTMLElement))
    throw new Error("Calendar focused day missing");
  await act(async () => {
    day.focus();
  });
  await user.keyboard("{ArrowRight}{Enter}");
  delayCelebrationCreate = true;
  const form = dialog.querySelector("form");
  if (!form) throw new Error("Creation form missing");
  fireEvent.submit(form);
  fireEvent.submit(form);
  await waitFor(() => expect(celebrationWrites).toHaveLength(1));
  expect(celebrationWrites[0]).toEqual({
    title: "Evento de teste",
    date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
  });
  expect(
    within(dialog)
      .getByRole("button", { name: "Criando..." })
      .hasAttribute("disabled"),
  ).toBe(true);
  await user.keyboard("{Escape}");
  expect(
    screen.getByRole("dialog", { name: "Criar data comemorativa" }),
  ).toBeTruthy();
  releaseCelebrationCreate?.();
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Criar data comemorativa" }),
    ).toBeNull(),
  );
  expect(queryClient.getQueryData<Celebration[]>(key)).toEqual([
    expect.objectContaining({
      id: "new-celebration",
      title: "Evento de teste",
    }),
  ]);
  expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
  expect(
    queryClient.getQueryState(QUERY_KEYS.celebrations("other-user"))
      ?.isInvalidated,
  ).toBe(false);
});

it("shows the empty-title error in the dialog instead of the browser bubble", async () => {
  const { user } = await mount();
  await user.click(
    screen.getByRole("menuitem", { name: "Criar data comemorativa" }),
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Criar data comemorativa",
  });
  const title = within(dialog).getByRole("textbox", { name: "Título" });
  expect(dialog.querySelector("form")?.noValidate).toBe(true);
  await user.click(within(dialog).getByRole("button", { name: "Criar data" }));
  const error = await within(dialog).findByRole("alert");
  expect(error.textContent).toContain("Informe um título");
  expect(title.getAttribute("aria-invalid")).toBe("true");
  expect(title.getAttribute("aria-describedby")).toBe(error.id);
  expect(document.activeElement).toBe(title);
  expect(celebrationWrites).toHaveLength(0);
  await user.type(title, "A");
  expect(within(dialog).queryByRole("alert")).toBeNull();
  expect(title.hasAttribute("aria-invalid")).toBe(false);
});

it("submits with Enter in the title without moving the calendar month", async () => {
  const { user } = await mount();
  await user.click(
    screen.getByRole("menuitem", { name: "Criar data comemorativa" }),
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Criar data comemorativa",
  });
  const month = within(dialog).getByRole("grid").getAttribute("aria-label");
  // The calendar's visually hidden next button has no type; it must not be
  // the form's default button.
  const form = dialog.querySelector("form");
  const defaultButton = Array.from(document.querySelectorAll("button")).find(
    (button) => button.form === form && button.type === "submit",
  );
  expect(defaultButton?.textContent).toBe("Criar data");
  await user.type(
    within(dialog).getByRole("textbox", { name: "Título" }),
    "Data pelo Enter{Enter}",
  );
  await waitFor(() => expect(celebrationWrites).toHaveLength(1));
  expect(month).toBeTruthy();
});

it("validates blank titles and preserves the draft/date after an error for explicit retry", async () => {
  const { user } = await mount();
  await user.click(
    screen.getByRole("menuitem", { name: "Criar data comemorativa" }),
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Criar data comemorativa",
  });
  const title = within(dialog).getByRole("textbox", { name: "Título" });
  fireEvent.change(title, { target: { value: "   " } });
  await user.click(within(dialog).getByRole("button", { name: "Criar data" }));
  expect(await within(dialog).findByRole("alert")).toBeTruthy();
  expect(celebrationWrites).toHaveLength(0);
  fireEvent.change(title, { target: { value: "Teste com retry" } });
  failCelebrationCreate = true;
  await user.click(within(dialog).getByRole("button", { name: "Criar data" }));
  await waitFor(() =>
    expect(within(dialog).getByRole("alert").textContent).toContain(
      "Não foi possível",
    ),
  );
  expect(title.getAttribute("value")).toBe("Teste com retry");
  failCelebrationCreate = false;
  await user.click(within(dialog).getByRole("button", { name: "Criar data" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Criar data comemorativa" }),
    ).toBeNull(),
  );
  expect(celebrationWrites).toHaveLength(2);
  expect(celebrationWrites[1]).toEqual(celebrationWrites[0]);
});

it("cancel and Escape never create and reopening starts a fresh draft", async () => {
  const { user } = await mount();
  await user.click(
    screen.getByRole("menuitem", { name: "Criar data comemorativa" }),
  );
  fireEvent.change(await screen.findByRole("textbox", { name: "Título" }), {
    target: { value: "Não gravar" },
  });
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("textbox", { name: "Título" })).toBeNull(),
  );
  expect(celebrationWrites).toHaveLength(0);
  await user.click(screen.getByRole("button", { name: "Abrir busca" }));
  await user.click(
    screen.getByRole("menuitem", { name: "Criar data comemorativa" }),
  );
  expect(
    (await screen.findByRole("textbox", { name: "Título" })).getAttribute(
      "value",
    ),
  ).toBe("");
});

it("ignores a creation confirmation after the query session resets", async () => {
  const { user, queryClient } = await mount();
  await user.click(
    screen.getByRole("menuitem", { name: "Criar data comemorativa" }),
  );
  fireEvent.change(await screen.findByRole("textbox", { name: "Título" }), {
    target: { value: "Sessão anterior" },
  });
  delayCelebrationCreate = true;
  await user.click(screen.getByRole("button", { name: "Criar data" }));
  await waitFor(() => expect(celebrationWrites).toHaveLength(1));
  resetQuerySession(queryClient);
  releaseCelebrationCreate?.();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
  expect(
    queryClient.getQueryData(QUERY_KEYS.celebrations(calendarPerson.user_id)),
  ).toBeUndefined();
});

it("edits the existing celebration title and date from the list without inserting or duplicating", async () => {
  const { user, queryClient } = await mount("/app/admin/celebrations");
  await user.keyboard("{Escape}");
  await user.click(
    await screen.findByRole("button", { name: "Editar Data original" }),
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Editar data comemorativa",
  });
  const title = within(dialog).getByRole("textbox", { name: "Título" });
  expect(title.getAttribute("value")).toBe("Data original");
  fireEvent.change(title, { target: { value: "  Data editada  " } });
  const day = dialog.querySelector('[role="grid"] [tabindex="0"]');
  if (!(day instanceof HTMLElement))
    throw new Error("Selected calendar date missing");
  await act(async () => {
    day.focus();
  });
  await user.keyboard(
    "{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{Enter}",
  );
  await user.click(
    within(dialog).getByRole("button", { name: "Salvar alterações" }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Editar data comemorativa" }),
    ).toBeNull(),
  );
  expect(celebrationEdits).toEqual([
    { id: "existing-celebration", title: "Data editada", date: "2026-11-01" },
  ]);
  expect(celebrationWrites).toHaveLength(0);
  expect(
    await screen.findByRole("heading", { name: "novembro de 2026" }),
  ).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "outubro de 2026" })).toBeNull();
  expect(
    queryClient.getQueryData<Celebration[]>(
      QUERY_KEYS.celebrations(calendarPerson.user_id),
    ),
  ).toHaveLength(1);
  expect(
    await screen.findByRole("button", { name: "Editar Data editada" }),
  ).toBeTruthy();
});

it("keeps the editing draft on failure, retries once and cancels without writing", async () => {
  const { user } = await mount("/app/admin/celebrations");
  await user.keyboard("{Escape}");
  await user.click(
    await screen.findByRole("button", { name: "Editar Data original" }),
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Editar data comemorativa",
  });
  const title = within(dialog).getByRole("textbox", { name: "Título" });
  fireEvent.change(title, { target: { value: "Título corrigido" } });
  failCelebrationCreate = true;
  await user.click(
    within(dialog).getByRole("button", { name: "Salvar alterações" }),
  );
  await within(dialog).findByRole("alert");
  expect(title.getAttribute("value")).toBe("Título corrigido");
  expect(storedCelebrations[0]?.title).toBe("Data original");
  failCelebrationCreate = false;
  await user.click(
    within(dialog).getByRole("button", { name: "Salvar alterações" }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Editar data comemorativa" }),
    ).toBeNull(),
  );
  expect(celebrationEdits).toHaveLength(2);
  await user.click(
    await screen.findByRole("button", { name: "Editar Título corrigido" }),
  );
  await user.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(celebrationEdits).toHaveLength(2);
});
