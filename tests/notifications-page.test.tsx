import { afterEach, beforeEach, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContext } from "~/contexts/AppContext";
import { resetQuerySession } from "~/lib/query-client";
import type { Action, Notification, Person } from "~/types";
import { calendarAction, calendarPerson } from "./fixtures/calendar-height";

type Row = Record<string, unknown>;
type Result = { data: unknown; error: unknown; count?: number };

const state = {
  notifications: [] as Notification[],
  listError: null as Error | null,
  actions: new Map<string, Action>(),
  updates: [] as { ids?: string[]; recipient?: unknown; all: boolean }[],
  listLimits: [] as number[],
};

// Minimal Supabase query builder: records the filters the models apply and answers from `state`.
function query(table: string) {
  const filters: Record<string, unknown> = {};
  let mode: "select" | "update" = "select";
  let head = false;
  let limit = Infinity;
  let ids: string[] | undefined;
  const run = (): Result => {
    if (table === "actions") {
      const action = state.actions.get(String(filters.id));
      return action
        ? { data: action, error: null }
        : { data: null, error: new Error("No access") };
    }
    if (mode === "update") {
      state.updates.push({
        ids,
        recipient: filters.recipient_id,
        all: !ids,
      });
      for (const item of state.notifications) {
        if (!ids || ids.includes(item.id)) {
          item.read_at = new Date().toISOString();
        }
      }
      return { data: null, error: null };
    }
    if (state.listError) return { data: null, error: state.listError };
    const own = state.notifications.filter(
      (item) => item.recipient_id === filters.recipient_id,
    );
    if (head) {
      return {
        data: null,
        error: null,
        count: own.filter((item) => !item.read_at).length,
      };
    }
    state.listLimits.push(limit);
    return {
      data: own.slice(0, limit).map((item) => ({ ...item })),
      error: null,
    };
  };
  const builder = {
    select(_columns?: string, options?: { head?: boolean }) {
      head = Boolean(options?.head);
      return builder;
    },
    update() {
      mode = "update";
      return builder;
    },
    eq(column: string, value: unknown) {
      filters[column] = value;
      return builder;
    },
    in(_column: string, values: string[]) {
      ids = values;
      return builder;
    },
    is() {
      return builder;
    },
    order() {
      return builder;
    },
    limit(value: number) {
      limit = value;
      return builder;
    },
    single: () => Promise.resolve(run()),
    // biome-ignore lint/suspicious/noThenProperty: Supabase query builders are awaitable.
    then: (
      resolve: (value: Result) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(run()).then(resolve, reject),
  };
  return builder;
}

mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => ({ from: query }),
}));

const { NotificationsPage } = await import("~/routes/app/notifications");

if (!("ResizeObserver" in globalThis)) {
  Object.assign(globalThis, {
    ResizeObserver: class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  });
}

function notification(index: number, overrides: Row = {}): Notification {
  return {
    id: `n${index}`,
    recipient_id: calendarPerson.user_id,
    comment_id: `c${index}`,
    action_id: `a${index}`,
    type: "mention",
    author_name: `Author ${index}`,
    action_title: `Action title ${index}`,
    comment_excerpt: `<p>Excerpt ${index}</p>`,
    created_at: `2026-10-${String(28 - index).padStart(2, "0")}T12:00:00Z`,
    read_at: null,
    ...overrides,
  } as Notification;
}

let client: QueryClient;
let opened: (Action | null)[];

function page(person: Person = calendarPerson) {
  return (
    <QueryClientProvider client={client}>
      <AppContext.Provider
        key={person.user_id}
        value={{
          person,
          partners: [],
          cloudName: "test",
          uploadPreset: "test",
          setPrimaryAction: (action) => opened.push(action),
          partnerFilters: [],
          setPartnerFilters() {},
        }}
      >
        <NotificationsPage />
      </AppContext.Provider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  opened = [];
  state.notifications = [];
  state.listError = null;
  state.actions = new Map();
  state.updates = [];
  state.listLimits = [];
});
afterEach(cleanup);

it("shows loading, then the empty state", async () => {
  render(page());
  expect(screen.getByRole("status").textContent).toContain("Carregando");
  expect(await screen.findByText("Nenhuma notificação.")).toBeTruthy();
});

it("lists unread and read notifications with author, action, excerpt and state", async () => {
  state.notifications = [
    notification(1),
    notification(2, { read_at: "2026-10-27T13:00:00Z" }),
    notification(3, { recipient_id: "someone-else" }),
  ];
  render(page());
  expect(await screen.findByText("Action title 1")).toBeTruthy();
  expect(screen.getByText("Author 1")).toBeTruthy();
  expect(screen.getByText("Excerpt 1")).toBeTruthy();
  expect(screen.queryByText("Action title 3")).toBeNull();
  expect(screen.getByText("Não lida")).toBeTruthy();
  expect(screen.getAllByText("Lida")).toHaveLength(1);
});

it("reports a failed query and retries it", async () => {
  state.listError = new Error("boom");
  state.notifications = [notification(1)];
  render(page());
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.queryByText("Nenhuma notificação.")).toBeNull();
  state.listError = null;
  await userEvent.click(
    screen.getByRole("button", { name: "Tentar novamente" }),
  );
  expect(await screen.findByText("Action title 1")).toBeTruthy();
});

it("opens the related action in the main panel and marks the notification read", async () => {
  state.notifications = [notification(1)];
  state.actions.set("a1", calendarAction(1, { id: "a1" }));
  render(page());
  await userEvent.click(
    await screen.findByRole("button", { name: /Excerpt 1/ }),
  );
  await waitFor(() => expect(opened.map((item) => item?.id)).toEqual(["a1"]));
  await waitFor(() => expect(screen.getByText("Lida")).toBeTruthy());
  expect(state.updates).toEqual([
    { ids: ["n1"], recipient: calendarPerson.user_id, all: false },
  ]);
});

it("explains an unavailable action without opening a panel", async () => {
  state.notifications = [notification(1)];
  render(page());
  await userEvent.click(
    await screen.findByRole("button", { name: /Excerpt 1/ }),
  );
  expect(await screen.findByText(/não está disponível/i)).toBeTruthy();
  expect(opened).toEqual([]);
});

it("marks one and all notifications as read and keeps the bell cache in sync", async () => {
  state.notifications = [notification(1), notification(2)];
  render(page());
  await userEvent.click(
    (await screen.findAllByRole("button", { name: /Marcar como lida/ }))[0],
  );
  await waitFor(() => expect(screen.getAllByText("Não lida")).toHaveLength(1));
  await userEvent.click(
    screen.getByRole("button", { name: "Marcar todas como lidas" }),
  );
  await waitFor(() => expect(screen.queryByText("Não lida")).toBeNull());
  expect(state.updates.at(-1)?.all).toBe(true);
  const bell = client.getQueriesData({ queryKey: ["notifications"] });
  expect(bell.length).toBeGreaterThan(0);
  for (const [, data] of bell) {
    expect((data as { unreadCount: number }).unreadCount).toBe(0);
  }
});

it("offers earlier notifications when the page is full instead of implying a complete history", async () => {
  state.notifications = Array.from({ length: 45 }, (_, index) =>
    notification(index + 1, {
      created_at: new Date(2026, 9, 28, 12, 45 - index).toISOString(),
    }),
  );
  render(page());
  await screen.findByText("Action title 1");
  expect(screen.queryByText("Action title 41")).toBeNull();
  await userEvent.click(
    screen.getByRole("button", { name: "Carregar anteriores" }),
  );
  expect(await screen.findByText("Action title 45")).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "Carregar anteriores" }),
  ).toBeNull();
});

it("does not show the previous identity's notifications after a session change", async () => {
  state.notifications = [notification(1)];
  const { rerender } = render(page());
  await screen.findByText("Action title 1");
  resetQuerySession(client);
  const other: Person = {
    ...calendarPerson,
    id: "other",
    user_id: "other-user",
  };
  state.notifications = [
    notification(2, { recipient_id: "other-user", action_title: "Other's" }),
  ];
  rerender(page(other));
  expect(await screen.findByText("Other's")).toBeTruthy();
  expect(screen.queryByText("Action title 1")).toBeNull();
});

it("shows a plain excerpt even when it was cut inside a mention tag", async () => {
  state.notifications = [
    notification(1, {
      comment_excerpt:
        'tenta ter esa notificação <span class="mention" data-type="mention" data-id="77c95550-a6ff-498b-9...',
    }),
  ];
  const { container } = render(page());
  await screen.findByText("Action title 1");
  expect(container.textContent).toContain("tenta ter esa notificação");
  expect(container.textContent).not.toContain("<span");
  expect(container.textContent).not.toContain("data-id");
});
