import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  useActionPanels,
  type ActionPanels,
} from "../app/hooks/useActionPanels";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router";
import { AppThemeProvider } from "../app/hooks/useAppTheme";
import { GlobalSearchCommand } from "../app/components/features/GlobalSearchCommand";
import { AppContext } from "../app/contexts/AppContext";
import { ActionDrawerPanel } from "../app/components/features/action-drawer/ActionDrawerPanel";
import type { Action, Person, Partner } from "../app/types";
import { QUERY_KEYS } from "../app/lib/query-keys";
import userEvent from "@testing-library/user-event";
import { installVisualViewport } from "./fixtures/visual-viewport";

Object.assign(globalThis, {
  localStorage: window.localStorage,
  KeyboardEvent: window.KeyboardEvent,
  MouseEvent: window.MouseEvent,
  PointerEvent: window.MouseEvent,
});
if (!("CSS" in globalThis))
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });
Object.assign(window.Range.prototype, {
  getClientRects: () => [],
  getBoundingClientRect: () => new window.DOMRect(),
});

type Row = Record<string, unknown>;
let writes: Row[] = [];
let writeIds: string[] = [];
const databaseActions = new Map<string, Action>();
let fail = false;
let resolveWrite: ((value: { data: Action; error: null }) => void) | null =
  null;
let delay = false;
let conflict = false;
const action: Action = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Original title",
  date: "2026-10-06 10:00:00",
  category: "design",
  phase: "do",
  priority: "medium",
  color: "#666666",
  time: 10,
  partners: ["agency"],
  responsibles: [],
  archived: false,
  description: null,
  content_description: null,
  instagram_caption: null,
  content_files: [],
  work_files: [],
  sprints: [],
  strategies: [],
  user_id: "test-user",
  created_at: "2026-10-06T10:00:00Z",
  updated_at: "2026-10-06T10:00:00Z",
};
const person = {
  id: "test-person",
  user_id: "test-user",
  name: "User",
  surname: "Test",
  initials: "UT",
  short: "User",
  email: "user@test.invalid",
  admin: true,
  visible: true,
  image: null,
  areas: [],
  preferences: null,
  created_at: "2026-10-06T10:00:00Z",
} satisfies Person;
const partner = {
  id: "partner",
  slug: "agency",
  title: "Agency",
  short: "Agency",
  colors: ["#666666"],
  users_ids: [],
  archived: false,
  image: null,
  sow: "socialmedia",
  created_at: "2026-10-06T10:00:00Z",
  instagram_caption_tail: null,
  context: null,
  voice: null,
} satisfies Partner;

// Only the external database boundary is controlled; drawer, editors, hooks and validation remain real.
mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: person.user_id } },
        error: null,
      }),
    },
    from: () => {
      let patch: Row | null = null;
      let queriedId = action.id;
      let searchQuery = "";
      const chain = {
        select: () => chain,
        eq: (field: string, value: unknown) => {
          if (field === "id" && typeof value === "string") queriedId = value;
          return chain;
        },
        ilike: (_field: string, value: string) => {
          searchQuery = value.replaceAll("%", "").toLowerCase();
          return chain;
        },
        overlaps: () => chain,
        contains: () => chain,
        limit: async () => ({
          data: [
            action,
            {
              ...action,
              id: "22222222-2222-4222-8222-222222222222",
              title: "Second title",
            },
          ].filter((entry) => entry.title.toLowerCase().includes(searchQuery)),
          error: null,
        }),
        is: () => chain,
        order: () => chain,
        insert: (value: Row) => {
          patch = value;
          return chain;
        },
        update: (value: Row) => {
          patch = value;
          return chain;
        },
        single: async () => {
          if (patch) {
            writes.push({ ...patch });
            writeIds.push(queriedId ?? "insert");
          }
          if (patch && conflict)
            return {
              data: null,
              error: { code: "PGRST116", message: "Version changed" },
            };
          if (fail) return { data: null, error: { message: "Unavailable" } };
          if (delay)
            return new Promise<{ data: Action; error: null }>((resolve) => {
              resolveWrite = resolve;
            });
          const canonical = {
            ...(databaseActions.get(queriedId ?? "") ?? action),
            id: queriedId,
            ...patch,
            updated_at: "2026-10-06T10:01:00Z",
          };
          if (patch && canonical.id)
            databaseActions.set(canonical.id, canonical);
          return { data: canonical, error: null };
        },
      };
      return chain;
    },
  }),
}));

let viewportWidth = 1440;
const mediaChanges = new Set<() => void>();
const originalMatchMedia = Object.getOwnPropertyDescriptor(
  window,
  "matchMedia",
);
function resizeViewport(width: number) {
  viewportWidth = width;
  for (const notify of mediaChanges) notify();
}
function mockMatchMedia(query: string): MediaQueryList {
  const events = new window.EventTarget();
  const minimum = Number(query.match(/min-width: (\d+)px/)?.[1] ?? Infinity);
  const media: MediaQueryList = {
    media: query,
    get matches() {
      return viewportWidth >= minimum;
    },
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  };
  mediaChanges.add(() =>
    events.dispatchEvent(
      Object.assign(new window.Event("change"), {
        matches: media.matches,
        media: query,
      }),
    ),
  );
  return media;
}

beforeEach(() => {
  viewportWidth = 1440;
  mediaChanges.clear();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: mockMatchMedia,
  });
  writes = [];
  writeIds = [];
  databaseActions.clear();
  fail = false;
  delay = false;
  resolveWrite = null;
  conflict = false;
});
afterEach(() => {
  cleanup();
  if (originalMatchMedia)
    Object.defineProperty(window, "matchMedia", originalMatchMedia);
  else Reflect.deleteProperty(window, "matchMedia");
});
function draft(overrides: Partial<Action>): Action {
  return { ...action, ...overrides };
}
function TestPanel({
  initialAction,
  onClose,
  partnerFilters,
  onPanels,
  showSearch,
}: {
  initialAction: Action;
  onClose: () => void;
  partnerFilters: string[];
  onPanels: (panels: ActionPanels) => void;
  showSearch: boolean;
}) {
  const panels = useActionPanels(initialAction);
  const [searchOpen, setSearchOpen] = useState(false);
  const hadAction = useRef(true);
  useEffect(() => {
    onPanels(panels);
  }, [onPanels, panels]);
  const hasActions = Boolean(panels.primaryAction || panels.secondaryAction);
  useEffect(() => {
    if (hadAction.current && !hasActions) onClose();
    hadAction.current = hasActions;
  }, [hasActions, onClose]);
  return (
    <>
      <Suspense fallback={null}>
        <ActionDrawerPanel
          panels={panels}
          partnerFilters={partnerFilters}
          isSearchOpen={searchOpen}
        />
      </Suspense>
      {showSearch && (
        <>
          <button onClick={() => setSearchOpen(true)}>Abrir busca</button>
          <GlobalSearchCommand
            open={searchOpen}
            onOpenChange={setSearchOpen}
            partners={[partner]}
            onBeforeLeave={panels.closeAllActions}
            setPrimaryAction={panels.setPrimaryAction}
            setSecondaryAction={panels.setSecondaryAction}
          />
        </>
      )}
    </>
  );
}
function mount(
  base: Action = action,
  onClose = () => {},
  partnerFilters: string[] = [],
  showSearch = false,
) {
  if (base.id) databaseActions.set(base.id, base);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  client.setQueryData(QUERY_KEYS.people("test-user"), []);
  const router = createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ["/app"] }),
  });
  let latestPanels: ActionPanels | undefined;
  const updatePanels = (panels: ActionPanels) => {
    latestPanels = panels;
  };
  const view = (selected: Action, version: number) => (
    <RouterContextProvider router={router}>
      <QueryClientProvider client={client}>
        <AppThemeProvider>
          <AppContext.Provider
            value={{
              person,
              partners: [partner],
              cloudName: "test",
              uploadPreset: "test",
              setPrimaryAction: () => {},
              partnerFilters,
              setPartnerFilters: () => {},
            }}
          >
            <TestPanel
              initialAction={selected}
              onClose={onClose}
              partnerFilters={partnerFilters}
              onPanels={updatePanels}
              showSearch={showSearch}
              key={`${selected.id || "draft"}:${version}`}
            />
          </AppContext.Provider>
        </AppThemeProvider>
      </QueryClientProvider>
    </RouterContextProvider>
  );
  const mounted = render(view(base, 0));
  return {
    ...mounted,
    panels: () => {
      if (!latestPanels) throw new Error("Panels have not mounted");
      return latestPanels;
    },
    select: (selected: Action, version: number) =>
      mounted.rerender(view(selected, version)),
  };
}
async function descriptionEditor() {
  await waitFor(
    () => {
      expect(
        document.querySelector(".tiptap[contenteditable=true]"),
      ).not.toBeNull();
    },
    { timeout: 5000 },
  );
  const editor = document.querySelector<HTMLElement>(
    ".tiptap[contenteditable=true]",
  );
  if (!editor) throw new Error("Description editor did not mount");
  return editor;
}

it("Tab from the title goes directly to the real description editor", async () => {
  mount(draft({ description: "<p></p>" }));
  const editor = await descriptionEditor();
  const title = screen.getByRole("textbox", { name: "Título da ação" });
  expect(document.activeElement).toBe(title);
  const user = userEvent.setup();
  await user.tab();
  expect(document.activeElement).toBe(editor);
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(title);
  expect(writes).toEqual([]);
});

it("the real editor toolbar supports arrow navigation", async () => {
  mount(draft({ description: "<p></p>" }));
  await descriptionEditor();
  const first = screen.getByRole("button", { name: "Título 1" });
  const user = userEvent.setup();
  act(() => first.focus());
  await user.keyboard("{ArrowRight}");
  expect(
    document.activeElement === screen.getByRole("button", { name: "Título 2" }),
  ).toBe(true);
});

it("formatting shortcut and Tab integrate with the main drawer sequence", async () => {
  mount(draft({ description: "<p>Hello</p>" }));
  const editor = await descriptionEditor();
  const user = userEvent.setup();
  await user.tab();
  await user.keyboard("{Alt>}{Shift>}{F10}{/Shift}{/Alt}");
  expect(
    screen
      .getByRole("toolbar", { name: "Formatação do texto" })
      .contains(document.activeElement),
  ).toBe(true);
  await user.tab();
  expect(document.activeElement === editor).toBe(true);
  await user.tab();
  expect(
    document.activeElement === screen.getByRole("button", { name: "Agency" }),
  ).toBe(true);
});

it("the main drawer sequence skips auxiliary controls in both directions", async () => {
  mount(draft({ description: "<p></p>" }));
  const editor = await descriptionEditor();
  const user = userEvent.setup();
  const sequence = [
    screen.getByRole("textbox", { name: "Título da ação" }),
    editor,
    screen.getByRole("button", { name: "Agency" }),
    screen.getByRole("button", { name: /^Fase:/ }),
    screen.getByRole("button", { name: /^Categoria:/ }),
    screen.getByRole("button", { name: "Atualizar" }),
  ];
  for (const target of sequence.slice(1)) {
    await user.tab();
    expect(document.activeElement).toBe(target);
  }
  for (const target of sequence.slice(0, -1).reverse()) {
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(target);
  }
  expect(writes).toEqual([]);
});

it("social actions include color before save and skip sprint and destructive commands", async () => {
  mount(draft({ category: "reels", description: "<p></p>" }));
  await descriptionEditor();
  const user = userEvent.setup();
  for (let step = 0; step < 5; step++) await user.tab();
  expect(
    document.activeElement ===
      screen.getByRole("button", { name: "Abrir seletor de cores" }),
  ).toBe(true);
  await user.tab();
  expect(
    document.activeElement ===
      screen.getByRole("button", { name: "Atualizar" }),
  ).toBe(true);
  await user.tab({ shift: true });
  expect(
    document.activeElement ===
      screen.getByRole("button", { name: "Abrir seletor de cores" }),
  ).toBe(true);
});

for (const [name, content] of [
  ["list", "<ul><li><p>First</p></li><li><p>Second</p></li></ul>"],
  ["table", "<table><tbody><tr><td><p>Cell</p></td></tr></tbody></table>"],
]) {
  it(`Tab leaves a real ${name} without editing its structure`, async () => {
    mount(draft({ description: content }));
    const editor = await descriptionEditor();
    const user = userEvent.setup();
    await user.tab();
    const paragraph = editor.querySelector("p");
    if (!paragraph?.firstChild) throw new Error("Missing editor text");
    const selection = window.getSelection();
    selection?.collapse(paragraph.firstChild, 0);
    const structure = () => ({
      text: editor.textContent,
      lists: editor.querySelectorAll("ul, ol").length,
      items: editor.querySelectorAll("li").length,
      rows: editor.querySelectorAll("tr").length,
      cells: editor.querySelectorAll("td, th").length,
    });
    const before = structure();
    await user.tab();
    expect(
      document.activeElement === screen.getByRole("button", { name: "Agency" }),
    ).toBe(true);
    await user.tab({ shift: true });
    expect(document.activeElement === editor).toBe(true);
    await user.tab({ shift: true });
    expect(
      document.activeElement ===
        screen.getByRole("textbox", { name: "Título da ação" }),
    ).toBe(true);
    expect(structure()).toEqual(before);
  });
}

it("Alt+F10 keeps every auxiliary control reachable with ordinary Tab", async () => {
  mount(draft({ description: "<p></p>" }));
  const editor = await descriptionEditor();
  const user = userEvent.setup();
  await user.keyboard("{Alt>}{F10}{/Alt}");
  expect(screen.getByText(/Tab: todos os controles/)).toBeTruthy();
  await user.tab();
  const responsibles = screen.getByRole("button", { name: "Responsáveis" });
  expect(document.activeElement === responsibles).toBe(true);
  expect(responsibles.textContent).toContain("Responsáveis");
  expect(responsibles.hasAttribute("data-focus-visible")).toBe(true);
  await user.tab();
  expect(
    document.activeElement ===
      screen.getByRole("button", { name: "Alternar exibição do ID da ação" }),
  ).toBe(true);
  await user.keyboard("{Alt>}{F10}{/Alt}");
  await user.tab();
  expect(document.activeElement === editor).toBe(true);
});

it("a draft keeps title autofocus and reaches Create without a color field", async () => {
  mount(draft({ id: undefined, title: "", description: "<p></p>" }));
  await descriptionEditor();
  const user = userEvent.setup();
  expect(
    document.activeElement ===
      screen.getByRole("textbox", { name: "Título da ação" }),
  ).toBe(true);
  for (let step = 0; step < 5; step++) await user.tab();
  expect(
    document.activeElement === screen.getByRole("button", { name: "Criar" }),
  ).toBe(true);
  expect(writes).toEqual([]);
});

it("the partner popover owns its Tab navigation and restores the trigger on Escape", async () => {
  let closed = 0;
  mount(draft({ description: "<p></p>" }), () => closed++);
  await descriptionEditor();
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name: "Agency" });
  await user.tab();
  await user.tab();
  await user.keyboard("{Enter}");
  const search = await screen.findByRole("searchbox");
  expect(document.activeElement === search).toBe(true);
  await user.tab();
  expect(
    document.activeElement?.closest('[data-slot="popover-content"]'),
  ).not.toBeNull();
  await user.keyboard("{Escape}");
  await waitFor(() => expect(document.activeElement === trigger).toBe(true));
  expect(closed).toBe(0);
});

it("the date calendar and time segments keep their own Tab navigation", async () => {
  let closed = 0;
  mount(draft({ description: "<p></p>" }), () => closed++);
  await descriptionEditor();
  const trigger = screen.getByRole("button", { name: /outubro às 10h/ });
  const user = userEvent.setup();
  await user.click(trigger);
  const popup = await waitFor(() => {
    const element = document.querySelector<HTMLElement>(
      '[data-slot="popover-content"]',
    );
    if (!element) throw new Error("Date popover did not open");
    return element;
  });
  await user.tab();
  expect(popup.contains(document.activeElement)).toBe(true);
  const segments = within(popup).getAllByRole("spinbutton");
  act(() => segments[0].focus());
  await user.tab();
  expect(popup.contains(document.activeElement)).toBe(true);
  await user.keyboard("{Escape}");
  await waitFor(() => expect(document.activeElement === trigger).toBe(true));
  expect(closed).toBe(0);
  expect(writes).toEqual([]);
});

it("closing the focus scope restores the opener", async () => {
  const opener = document.createElement("button");
  opener.textContent = "Open action";
  document.body.append(opener);
  opener.focus();
  const mounted = mount(draft({ description: "<p></p>" }));
  await descriptionEditor();
  mounted.unmount();
  await waitFor(() => expect(document.activeElement === opener).toBe(true));
  opener.remove();
});

it("rerendering the same action does not move focus back to the title", async () => {
  const base = draft({ description: "<p></p>" });
  const mounted = mount(base);
  const editor = await descriptionEditor();
  await userEvent.setup().tab();
  mounted.select({ ...base, updated_at: "2026-10-06T10:03:00Z" }, 0);
  expect(document.activeElement === editor).toBe(true);
});

it("save continues through drawer navigation and Shift+Tab reverses it", async () => {
  mount(draft({ description: "<p></p>" }));
  await descriptionEditor();
  const user = userEvent.setup();
  await user.tab({ shift: true });
  expect(
    document.activeElement === screen.getByRole("button", { name: "Fechar" }),
  ).toBe(true);
  act(() => screen.getByRole("button", { name: "Atualizar" }).focus());
  await user.tab();
  expect(
    document.activeElement === screen.getByRole("tab", { name: "ESSENCIAL" }),
  ).toBe(true);
  await user.tab({ shift: true });
  expect(
    document.activeElement ===
      screen.getByRole("button", { name: "Atualizar" }),
  ).toBe(true);
  await user.tab();
  await user.tab();
  expect(
    document.activeElement === screen.getByRole("tab", { name: "OBSERVAÇÕES" }),
  ).toBe(true);
  await user.tab();
  expect(
    document.activeElement === screen.getByRole("button", { name: "Fechar" }),
  ).toBe(true);
  await user.tab();
  expect(
    document.activeElement ===
      screen.getByRole("textbox", { name: "Título da ação" }),
  ).toBe(true);
});

it("other tabs use their normal keyboard sequence", async () => {
  mount(draft({ category: "reels", partners: [], description: "<p></p>" }));
  await descriptionEditor();
  const tab = screen.getByRole("tab", { name: "INSTAGRAM" });
  const user = userEvent.setup();
  await user.click(tab);
  await user.tab();
  expect(
    document.activeElement === screen.getByRole("tab", { name: "OBSERVAÇÕES" }),
  ).toBe(true);
});
it("Create reaches all three navigation tabs on a social draft", async () => {
  mount(draft({ id: undefined, category: "reels", description: "<p></p>" }));
  await descriptionEditor();
  act(() => screen.getByRole("button", { name: "Criar" }).focus());
  const user = userEvent.setup();
  for (const name of ["ESSENCIAL", "INSTAGRAM", "OBSERVAÇÕES"]) {
    await user.tab();
    expect(document.activeElement === screen.getByRole("tab", { name })).toBe(
      true,
    );
  }
});
it("save reaches navigation when the drawer was opened from the page", async () => {
  const opener = document.createElement("button");
  const pageControl = document.createElement("button");
  opener.textContent = "Open action";
  pageControl.textContent = "Page control";
  document.body.append(opener, pageControl);
  opener.focus();
  const mounted = mount(draft({ description: "<p></p>" }));
  await descriptionEditor();
  act(() => screen.getByRole("button", { name: "Atualizar" }).focus());
  await userEvent.setup().tab();
  expect(
    document.activeElement === screen.getByRole("tab", { name: "ESSENCIAL" }),
  ).toBe(true);
  mounted.unmount();
  await waitFor(() => expect(document.activeElement === opener).toBe(true));
  opener.remove();
  pageControl.remove();
});
it("a draft is recognised by the missing id, not by created_at", async () => {
  mount(
    draft({
      id: undefined,
      title: "Stale stamp",
      partners: [],
      created_at: "2026-01-01T00:00:00Z",
      updated_at: undefined,
    }),
    () => {},
    ["agency"],
  );
  fireEvent.click(screen.getByRole("button", { name: "Criar" }));
  await waitFor(() => expect(writes.length).toBe(1));
  expect(writes[0]?.partners).toEqual(["agency"]);
});
it("a new draft is shown as just created, not hours ago, outside UTC", () => {
  const previousTZ = process.env.TZ;
  process.env.TZ = "America/Sao_Paulo";
  try {
    mount(
      draft({
        id: undefined,
        title: "Fresh draft",
        created_at: undefined,
        updated_at: undefined,
      }),
    );
    expect(screen.getByText(/Criada há menos de um minuto/)).toBeTruthy();
  } finally {
    process.env.TZ = previousTZ;
  }
});
it("real drawer closes unchanged without writing", async () => {
  let closed = 0;
  mount(action, () => closed++);
  fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
  await waitFor(() => expect(closed).toBe(1));
  expect(writes.length).toBe(0);
});

for (const closeWith of ["overlay", "escape", "button"]) {
  it(`the panel closes safely through ${closeWith} without writing an unchanged action`, async () => {
    let closed = 0;
    mount(action, () => closed++);
    if (closeWith === "escape") {
      fireEvent.keyDown(document.activeElement ?? document, { key: "Escape" });
    } else {
      fireEvent.click(
        screen.getByRole("button", {
          name: closeWith === "overlay" ? "Fechar painel de edição" : "Fechar",
        }),
      );
    }
    await waitFor(() => expect(closed).toBe(1));
    expect(writes).toEqual([]);
  });
}

for (const closeWith of ["overlay", "escape"]) {
  it(`the panel preserves edits when ${closeWith} cannot save`, async () => {
    let closed = 0;
    mount(action, () => closed++);
    fail = true;
    const title = screen.getByRole<HTMLTextAreaElement>("textbox", {
      name: "Título da ação",
    });
    fireEvent.change(title, { target: { value: "Keep this edit" } });
    if (closeWith === "escape") {
      fireEvent.keyDown(title, { key: "Escape" });
    } else {
      fireEvent.click(
        screen.getByRole("button", { name: "Fechar painel de edição" }),
      );
    }
    await screen.findByTestId("drawer-error-banner");
    expect(closed).toBe(0);
    expect(title.value).toBe("Keep this edit");
    expect(writes).toHaveLength(1);
  });
}

it("repeated close commands share one pending close and write", async () => {
  let closed = 0;
  mount(action, () => closed++);
  delay = true;
  fireEvent.change(screen.getByRole("textbox", { name: "Título da ação" }), {
    target: { value: "Pending close" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Fechar painel de edição" }),
  );
  await waitFor(() => expect(writes).toHaveLength(1));
  fireEvent.keyDown(document, { key: "Escape" });
  fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
  delay = false;
  await act(async () => {
    resolveWrite?.({
      data: { ...action, title: "Pending close" },
      error: null,
    });
  });
  await waitFor(() => expect(closed).toBe(1));
  expect(writes).toHaveLength(1);
});

it("a close that finishes after unmount cannot close a later panel", async () => {
  let closed = 0;
  const mounted = mount(action, () => closed++);
  delay = true;
  fireEvent.change(screen.getByRole("textbox", { name: "Título da ação" }), {
    target: { value: "Old action" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
  await waitFor(() => expect(writes).toHaveLength(1));
  mounted.select(draft({ title: "New action" }), 1);
  delay = false;
  await act(async () => {
    resolveWrite?.({ data: { ...action, title: "Old action" }, error: null });
  });
  expect(closed).toBe(0);
  expect(
    screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Título da ação" })
      .value,
  ).toBe("New action");
});

it("replacing an action uses its real leave guard before mounting the next one", async () => {
  const mounted = mount(action);
  fireEvent.change(screen.getByRole("textbox", { name: "Título da ação" }), {
    target: { value: "Saved before replacement" },
  });
  await act(async () => {
    expect(
      await mounted.panels().setPrimaryAction(
        draft({
          id: "22222222-2222-4222-8222-222222222222",
          title: "Replacement",
        }),
      ),
    ).toBe(true);
  });
  expect(writes).toHaveLength(1);
  expect(writes[0]?.title).toBe("Saved before replacement");
  expect(
    screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Título da ação" })
      .value,
  ).toBe("Replacement");
});

it("the panel owns width changes without remounting the form", async () => {
  mount(draft({ category: "post", partners: [] }));
  const form = screen.getByRole("region", { name: "Edição da ação" });
  fireEvent.change(screen.getByRole("textbox", { name: "Título da ação" }), {
    target: { value: "Title retained across views" },
  });
  const panel = document.querySelector("[data-action-panel]");
  expect(panel?.className).toContain("lg:w-2xl");
  fireEvent.click(screen.getByRole("tab", { name: "INSTAGRAM" }));
  expect(panel?.className).toContain("lg:w-3xl");
  fireEvent.click(screen.getByRole("tab", { name: "ESSENCIAL" }));
  expect(panel?.className).toContain("lg:w-2xl");
  expect(screen.getByRole("region", { name: "Edição da ação" })).toBe(form);
  expect(
    screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Título da ação" })
      .value,
  ).toBe("Title retained across views");
  expect(writes).toEqual([]);
});

it("the save shortcut sends one write through the real panel", async () => {
  let closed = 0;
  mount(action, () => closed++);
  fireEvent.change(screen.getByRole("textbox", { name: "Título da ação" }), {
    target: { value: "Keyboard save" },
  });
  fireEvent.keyDown(document.activeElement ?? document, {
    key: "Enter",
    metaKey: true,
  });
  await waitFor(() => expect(closed).toBe(1));
  expect(writes).toHaveLength(1);
  expect(writes[0]?.title).toBe("Keyboard save");
});
it("real manual create sends complete draft and one insert", async () => {
  mount(
    draft({
      id: undefined,
      title: "Manual create",
      created_at: undefined,
      updated_at: undefined,
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Criar" }));
  await waitFor(() => expect(writes.length).toBe(1));
  expect(writes[0]?.date).toBe("2026-10-06 10:00:00");
  expect(writes[0]?.partners).toEqual(["agency"]);
  expect(writes[0]?.category).toBe("design");
  expect(typeof writes[0]?.updated_at).toBe("string");
});
it("real drawer preserves typed title and stays open when save fails", async () => {
  let closed = 0;
  mount(action, () => closed++);
  fail = true;
  fireEvent.change(screen.getByRole("textbox", { name: "Título da ação" }), {
    target: { value: "Unsaved title" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
  await screen.findByTestId("drawer-error-banner");
  expect(closed).toBe(0);
  expect(
    (
      screen.getByRole("textbox", {
        name: "Título da ação",
      }) as HTMLTextAreaElement
    ).value,
  ).toBe("Unsaved title");
});
it("edits made during INSERT survive its response and reach UPDATE", async () => {
  delay = true;
  mount(
    draft({
      id: undefined,
      title: "First title",
      created_at: undefined,
      updated_at: undefined,
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Criar" }));
  await waitFor(() => expect(writes.length).toBe(1));
  fireEvent.change(screen.getByRole("textbox", { name: "Título da ação" }), {
    target: { value: "Latest title" },
  });
  delay = false;
  await act(async () => {
    resolveWrite?.({ data: { ...action, title: "First title" }, error: null });
  });
  await waitFor(() => expect(writes.length).toBe(2));
  expect(writes[1]?.title).toBe("Latest title");
  expect(
    (
      screen.getByRole("textbox", {
        name: "Título da ação",
      }) as HTMLTextAreaElement
    ).value,
  ).toBe("Latest title");
});

it("switching from an existing action to a new draft resets title and files", async () => {
  const mounted = mount(
    draft({ work_files: ["https://files.test.invalid/old.png"] }),
  );
  mounted.select(
    draft({
      id: undefined,
      title: "Fresh draft",
      work_files: [],
      content_files: [],
      created_at: undefined,
      updated_at: undefined,
    }),
    1,
  );
  expect(
    (
      screen.getByRole("textbox", {
        name: "Título da ação",
      }) as HTMLTextAreaElement
    ).value,
  ).toBe("Fresh draft");
  fireEvent.click(screen.getByRole("button", { name: "Criar" }));
  await waitFor(() => expect(writes.length).toBe(1));
  expect(writes[0]?.work_files).toEqual([]);
  expect(writes[0]?.content_files).toEqual([]);
});

it("drawer compares a conflict in an app dialog; cancel preserves edits and confirm saves", async () => {
  mount();
  conflict = true;
  fireEvent.change(screen.getByRole("textbox", { name: "Título da ação" }), {
    target: { value: "My pending title" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
  await screen.findByTestId("drawer-conflict-banner");
  conflict = false;
  fireEvent.click(screen.getByRole("button", { name: "Comparar e salvar" }));
  const dialog = await screen.findByRole("dialog", {
    name: "Comparar alterações",
  });
  expect(within(dialog).getByText("Versão atual")).toBeTruthy();
  expect(within(dialog).getByText("Sua edição")).toBeTruthy();
  expect(within(dialog).getByText("My pending title")).toBeTruthy();
  const count = writes.length;
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Comparar alterações" }),
    ).toBeNull(),
  );
  expect(writes.length).toBe(count);
  expect(
    (
      screen.getByRole("textbox", {
        name: "Título da ação",
      }) as HTMLTextAreaElement
    ).value,
  ).toBe("My pending title");
  fireEvent.click(screen.getByRole("button", { name: "Comparar e salvar" }));
  await screen.findByRole("dialog", { name: "Comparar alterações" });
  conflict = true;
  fireEvent.click(
    screen.getByRole("button", { name: "Salvar minhas alterações" }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Comparar alterações" }),
    ).toBeNull(),
  );
  expect(screen.getByTestId("drawer-conflict-banner")).toBeTruthy();
  expect(
    (
      screen.getByRole("textbox", {
        name: "Título da ação",
      }) as HTMLTextAreaElement
    ).value,
  ).toBe("My pending title");
  conflict = false;
  const retryCount = writes.length;
  fireEvent.click(screen.getByRole("button", { name: "Comparar e salvar" }));
  await screen.findByRole("dialog", { name: "Comparar alterações" });
  fireEvent.click(
    screen.getByRole("button", { name: "Salvar minhas alterações" }),
  );
  await waitFor(() => expect(writes.length).toBe(retryCount + 1));
  expect(writes[retryCount]?.title).toBe("My pending title");
  await waitFor(() =>
    expect(screen.queryByTestId("drawer-conflict-banner")).toBeNull(),
  );
});

it("selecting a strategy adopts its headline as the action title", async () => {
  const strategy = (headline: string) => ({
    headline,
    angulo: "Ângulo",
    racional: "Racional",
    direcionamento: "Direcionamento",
  });
  mount(
    draft({
      category: "post",
      strategies: [
        strategy("Primeira headline"),
        strategy(
          "Se toda segunda você recomeça, o problema não é força de vontade",
        ),
      ],
    }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Ver estratégias geradas" }),
  );
  const dialog = await screen.findByRole("dialog");
  const boxes = within(dialog).getAllByRole("checkbox", {
    name: "Selecionar estratégia",
  });
  fireEvent.click(boxes[1] as HTMLElement);
  const expected =
    "Se toda segunda você recomeça, o problema não é força de vontade";
  await waitFor(() =>
    expect(writes.some((write) => write.title === expected)).toBe(true),
  );
  expect(
    (
      screen.getByRole("textbox", {
        name: "Título da ação",
        hidden: true,
      }) as HTMLTextAreaElement
    ).value,
  ).toBe(expected);
  fireEvent.click(boxes[1] as HTMLElement);
  await waitFor(() => expect(writes.length).toBeGreaterThan(1));
  expect(writes.at(-1)?.title).toBeUndefined();
});

const secondAction = () =>
  draft({ id: "22222222-2222-4222-8222-222222222222", title: "Second title" });

it("two real forms remain mounted and tabs preserve edited title and view", async () => {
  const mounted = mount(draft({ category: "post", partners: [] }));
  const primaryTitle = screen.getByRole<HTMLTextAreaElement>("textbox", {
    name: "Título da ação",
  });
  fireEvent.change(primaryTitle, { target: { value: "Primary work" } });
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  const secondaryTitle = screen.getByRole<HTMLTextAreaElement>("textbox", {
    name: "Título da ação",
  });
  expect(secondaryTitle).not.toBe(primaryTitle);
  expect(document.querySelectorAll("[data-drawer-focus-scope]")).toHaveLength(
    2,
  );
  const tabs = screen.getByRole("tablist", { name: "Ações abertas" });
  fireEvent.click(within(tabs).getByRole("tab", { name: /Primary work/ }));
  expect(screen.getByRole("textbox", { name: "Título da ação" })).toBe(
    primaryTitle,
  );
  expect(primaryTitle.value).toBe("Primary work");
  fireEvent.click(screen.getByRole("tab", { name: "INSTAGRAM" }));
  fireEvent.click(within(tabs).getByRole("tab", { name: /Second title/ }));
  expect(screen.getByRole("textbox", { name: "Título da ação" })).toBe(
    secondaryTitle,
  );
  fireEvent.click(within(tabs).getByRole("tab", { name: /Primary work/ }));
  expect(
    screen
      .getByRole("tab", { name: "INSTAGRAM" })
      .getAttribute("aria-selected"),
  ).toBe("true");
});

it("only the active form saves on the keyboard shortcut", async () => {
  const mounted = mount();
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  const title = screen.getByRole("textbox", { name: "Título da ação" });
  fireEvent.change(title, { target: { value: "Saved secondary" } });
  fireEvent.keyDown(title, { key: "Enter", metaKey: true, shiftKey: true });
  await waitFor(() => expect(writes).toHaveLength(1));
  expect(writeIds).toEqual([secondAction().id]);
  expect(writes[0]?.title).toBe("Saved secondary");
  expect(document.querySelectorAll("[data-drawer-focus-scope]")).toHaveLength(
    2,
  );
});

it("closing primary leaves the same secondary form with only its individual close button", async () => {
  const mounted = mount();
  const key = mounted.panels().primaryAction?.key;
  if (!key) throw new Error("Missing primary");
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  const secondaryTitle = screen.getByRole("textbox", {
    name: "Título da ação",
  });
  expect(
    screen.queryByRole("button", { name: "Fechar todas as ações" }),
  ).toBeNull();
  await act(async () => {
    await mounted.panels().closeAction(key);
  });
  expect(mounted.panels().primaryAction).toBeNull();
  expect(screen.getByRole("textbox", { name: "Título da ação" })).toBe(
    secondaryTitle,
  );
  expect(
    screen.queryByRole("button", { name: "Fechar todas as ações" }),
  ).toBeNull();
  expect(screen.queryByRole("tablist", { name: "Ações abertas" })).toBeNull();
});

it("individual close buttons keep each action independent without a close-all button", async () => {
  const mounted = mount();
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  await screen.findByRole("tab", { name: /Second title/ });
  expect(
    screen.queryByRole("button", { name: "Fechar todas as ações" }),
  ).toBeNull();
  await userEvent
    .setup()
    .click(screen.getByRole("tab", { name: /Original title/ }));
  fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
  await waitFor(() => expect(mounted.panels().primaryAction).toBeNull());
  expect(mounted.panels().secondaryAction?.currentAction.title).toBe(
    "Second title",
  );
  fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
  await waitFor(() => expect(mounted.panels().secondaryAction).toBeNull());
});

for (const method of ["overlay", "escape"]) {
  it(`closing two forms via ${method} closes both without a write`, async () => {
    const mounted = mount();
    await act(async () => {
      await mounted.panels().setSecondaryAction(secondAction());
    });
    if (method === "escape")
      fireEvent.keyDown(
        screen.getByRole("textbox", { name: "Título da ação" }),
        { key: "Escape" },
      );
    else
      fireEvent.click(
        screen.getByRole("button", {
          name: "Fechar painel de edição",
        }),
      );
    await waitFor(() =>
      expect(
        document.querySelectorAll("[data-drawer-focus-scope]"),
      ).toHaveLength(0),
    );
    expect(mounted.panels().primaryAction).toBeNull();
    expect(mounted.panels().secondaryAction).toBeNull();
    expect(writes).toEqual([]);
  });
}

it("a failed save on the second form blocks closing both and retains edits", async () => {
  const mounted = mount();
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  fail = true;
  const title = screen.getByRole<HTMLTextAreaElement>("textbox", {
    name: "Título da ação",
  });
  fireEvent.change(title, {
    target: { value: "Retained after close-all failure" },
  });
  fireEvent.keyDown(title, { key: "Escape" });
  await screen.findByTestId("drawer-error-banner");
  expect(title.value).toBe("Retained after close-all failure");
  expect(document.querySelectorAll("[data-drawer-focus-scope]")).toHaveLength(
    2,
  );
  fail = false;
  fireEvent.click(
    screen.getByRole("button", { name: "Fechar painel de edição" }),
  );
  await waitFor(() =>
    expect(document.querySelectorAll("[data-drawer-focus-scope]")).toHaveLength(
      0,
    ),
  );
  expect(writes.at(-1)?.title).toBe("Retained after close-all failure");
});

it("the outer action tabs keep arrow navigation without focusing a hidden form", async () => {
  const mounted = mount();
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  const tabs = screen.getByRole("tablist", { name: "Ações abertas" });
  const primaryTab = within(tabs).getByRole("tab", { name: /Original title/ });
  const secondaryTab = within(tabs).getByRole("tab", { name: /Second title/ });
  const user = userEvent.setup();
  await user.click(primaryTab);
  expect(document.activeElement === primaryTab).toBe(true);
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement === secondaryTab).toBe(true);
  expect(
    screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Título da ação" })
      .value,
  ).toBe("Second title");
});

for (const activation of [
  "click",
  "enter",
  "space",
  "shift-click",
  "shift-enter",
  "shift-space",
]) {
  it(`the real global search opens the correct space with ${activation}`, async () => {
    const mounted = mount(action, () => {}, [], true);
    await screen.findByRole("textbox", { name: "Título da ação" });
    fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
    const input = await screen.findByRole("searchbox");
    fireEvent.change(input, { target: { value: "Second" } });
    const item = await screen.findByRole("menuitem", { name: /Second title/ });
    const user = userEvent.setup();
    if (activation.endsWith("click")) {
      if (activation.startsWith("shift")) await user.keyboard("{Shift>}");
      await user.click(item);
      if (activation.startsWith("shift")) await user.keyboard("{/Shift}");
    } else {
      act(() => input.focus());
      await user.keyboard("{ArrowDown}");
      const key = activation.endsWith("enter") ? "{Enter}" : " ";
      await user.keyboard(
        activation.startsWith("shift") ? `{Shift>}${key}{/Shift}` : key,
      );
    }
    await waitFor(() =>
      expect(screen.queryByRole("searchbox") === null).toBe(true),
    );
    if (activation.startsWith("shift")) {
      expect(mounted.panels().primaryAction?.currentAction.id).toBe(action.id);
      expect(mounted.panels().secondaryAction?.currentAction.id).toBe(
        secondAction().id,
      );
    } else {
      expect(mounted.panels().primaryAction?.currentAction.id).toBe(
        secondAction().id,
      );
      expect(mounted.panels().secondaryAction).toBeNull();
    }
    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Título da ação",
      }).value,
    ).toBe("Second title");
  });
}

it("Escape inside the search closes only the search, preserving both actions", async () => {
  const mounted = mount(action, () => {}, [], true);
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
  await screen.findByRole("searchbox");
  await userEvent.setup().keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("searchbox") === null).toBe(true),
  );
  expect(mounted.panels().primaryAction?.currentAction.id).toBe(action.id);
  expect(mounted.panels().secondaryAction?.currentAction.id).toBe(
    secondAction().id,
  );
});

it("spaces in a search query still type normally before navigating results", async () => {
  const mounted = mount(action, () => {}, [], true);
  await screen.findByRole("textbox", { name: "Título da ação" });
  fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
  const input = await screen.findByRole<HTMLInputElement>("searchbox");
  await userEvent.setup().type(input, "Second title");
  await screen.findByRole("menuitem", { name: /Second title/ });
  expect(input.value).toBe("Second title");
  expect(mounted.panels().secondaryAction).toBeNull();
  expect(mounted.panels().primaryAction?.currentAction.id).toBe(action.id);
});

it("a blocked replacement from search leaves the current action and search available", async () => {
  const mounted = mount(action, () => {}, [], true);
  const title = await screen.findByRole("textbox", { name: "Título da ação" });
  fail = true;
  fireEvent.change(title, { target: { value: "Unconfirmed primary" } });
  fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
  const input = await screen.findByRole("searchbox");
  fireEvent.change(input, { target: { value: "Second" } });
  await userEvent
    .setup()
    .click(await screen.findByRole("menuitem", { name: /Second title/ }));
  await waitFor(() => expect(writes.length > 0).toBe(true));
  expect(screen.queryByRole("searchbox") !== null).toBe(true);
  expect(mounted.panels().primaryAction?.currentAction.id).toBe(action.id);
  expect(mounted.panels().secondaryAction).toBeNull();
});

it("an incomplete primary draft survives opening an existing secondary without a discard prompt", async () => {
  const confirm = window.confirm;
  let confirmations = 0;
  window.confirm = () => {
    confirmations++;
    return false;
  };
  try {
    const mounted = mount(
      draft({
        id: undefined,
        title: "x",
        created_at: undefined,
        updated_at: undefined,
      }),
    );
    await screen.findByRole("textbox", { name: "Título da ação" });
    await act(async () => {
      expect(await mounted.panels().setSecondaryAction(secondAction())).toBe(
        true,
      );
    });
    const tabs = screen.getByRole("tablist", { name: "Ações abertas" });
    await userEvent
      .setup()
      .click(within(tabs).getByRole("tab", { name: /^x/ }));
    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Título da ação",
      }).value,
    ).toBe("x");
    expect(confirmations).toBe(0);
    expect(writes).toEqual([]);
    expect(mounted.panels().primaryAction?.currentAction.id).toBeUndefined();
  } finally {
    window.confirm = confirm;
  }
});

it("two mounted forms produce distinct DOM identifiers", async () => {
  const mounted = mount(draft({ category: "post" }));
  await screen.findByRole("textbox", { name: "Título da ação" });
  await act(async () => {
    await mounted
      .panels()
      .setSecondaryAction({ ...secondAction(), category: "post" });
  });
  const ids = Array.from(
    document.querySelectorAll<HTMLElement>("[id]"),
    (element) => element.id,
  );
  expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
});

it("wide desktop shows both complete forms without the outer action tabs", async () => {
  resizeViewport(2048);
  const mounted = mount();
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  await waitFor(() =>
    expect(
      screen.getAllByRole("textbox", { name: "Título da ação" }),
    ).toHaveLength(2),
  );
  expect(screen.queryByRole("tablist", { name: "Ações abertas" })).toBeNull();
  expect(screen.getAllByRole("button", { name: "Fechar" })).toHaveLength(2);
});

it("resizing across the two-maximum-width threshold preserves both forms and their edits", async () => {
  resizeViewport(1600);
  const mounted = mount();
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  const titles = await screen.findAllByRole<HTMLTextAreaElement>("textbox", {
    name: "Título da ação",
  });
  await waitFor(() => expect(titles).toHaveLength(2));
  const [primaryTitle, secondaryTitle] = titles;
  if (!primaryTitle || !secondaryTitle)
    throw new Error("Missing side-by-side forms");
  const primaryEntry = primaryTitle.closest("[data-action-entry]");
  const secondaryEntry = secondaryTitle.closest("[data-action-entry]");
  fireEvent.change(primaryTitle, { target: { value: "Primary preserved" } });
  fireEvent.change(secondaryTitle, {
    target: { value: "Secondary preserved" },
  });
  await act(async () => {
    resizeViewport(1599);
  });
  expect(screen.getAllByRole("textbox", { name: "Título da ação" })).toEqual([
    secondaryTitle,
  ]);
  expect(screen.getByRole("tablist", { name: "Ações abertas" })).toBeTruthy();
  expect(primaryTitle.closest("[inert]")).toBeTruthy();
  await act(async () => {
    resizeViewport(2560);
  });
  expect(screen.getAllByRole("textbox", { name: "Título da ação" })).toEqual([
    primaryTitle,
    secondaryTitle,
  ]);
  expect(primaryTitle.closest("[data-action-entry]")).toBe(primaryEntry);
  expect(secondaryTitle.closest("[data-action-entry]")).toBe(secondaryEntry);
  expect(primaryTitle.value).toBe("Primary preserved");
  expect(secondaryTitle.value).toBe("Secondary preserved");
  expect(primaryTitle.closest("[inert]")).toBeNull();
  expect(writes).toEqual([]);
  expect(mounted.panels().activeKey).toBe(
    mounted.panels().secondaryAction?.key ?? null,
  );
});

it("side-by-side focus and save shortcuts operate on the form receiving the event", async () => {
  resizeViewport(2048);
  const mounted = mount();
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  await screen.findByRole("region", { name: "Original title" });
  const primary = screen.getByRole("region", { name: "Original title" });
  const secondary = screen.getByRole("region", { name: "Second title" });
  const primaryTitle = within(primary).getByRole("textbox", {
    name: "Título da ação",
  });
  const secondaryTitle = within(secondary).getByRole("textbox", {
    name: "Título da ação",
  });
  const user = userEvent.setup();
  await user.click(primaryTitle);
  expect(mounted.panels().activeKey).toBe(
    mounted.panels().primaryAction?.key ?? null,
  );
  fireEvent.change(primaryTitle, { target: { value: "Saved left" } });
  fireEvent.keyDown(primaryTitle, {
    key: "Enter",
    metaKey: true,
    shiftKey: true,
  });
  await waitFor(() => expect(writeIds).toEqual([action.id ?? ""]));
  await user.click(secondaryTitle);
  expect(mounted.panels().activeKey).toBe(
    mounted.panels().secondaryAction?.key ?? null,
  );
  fireEvent.change(secondaryTitle, { target: { value: "Saved right" } });
  fireEvent.keyDown(secondaryTitle, {
    key: "Enter",
    metaKey: true,
    shiftKey: true,
  });
  await waitFor(() =>
    expect(writeIds).toEqual([action.id ?? "", secondAction().id ?? ""]),
  );
  expect(document.activeElement).toBe(secondaryTitle);
});

it("internal tabs and individual closing preserve the other wide form", async () => {
  resizeViewport(2048);
  const mounted = mount(draft({ category: "post" }));
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  const primary = await screen.findByRole("region", { name: "Original title" });
  const secondary = screen.getByRole("region", { name: "Second title" });
  const secondaryTitle = within(secondary).getByRole("textbox", {
    name: "Título da ação",
  });
  const user = userEvent.setup();
  await user.click(within(primary).getByRole("tab", { name: /INSTAGRAM/ }));
  expect(
    document.querySelector("[data-action-layout='side-by-side']"),
  ).toBeTruthy();
  expect(screen.queryByRole("tablist", { name: "Ações abertas" })).toBeNull();
  await user.click(within(primary).getByRole("tab", { name: /OBSERVAÇÕES/ }));
  expect(
    within(secondary).getByRole("textbox", { name: "Título da ação" }),
  ).toBe(secondaryTitle);
  await user.click(within(primary).getByRole("button", { name: "Fechar" }));
  expect(mounted.panels().primaryAction).toBeNull();
  expect(mounted.panels().secondaryAction).not.toBeNull();
  expect(screen.getByRole("textbox", { name: "Título da ação" })).toBe(
    secondaryTitle,
  );
  expect(document.querySelector("[data-action-layout='tabs']")).toBeTruthy();
});

for (const method of ["overlay", "escape"]) {
  it(`wide ${method} keeps both forms when a save fails and closes both on retry`, async () => {
    resizeViewport(2048);
    const mounted = mount();
    await act(async () => {
      await mounted.panels().setSecondaryAction(secondAction());
    });
    const secondary = await screen.findByRole("region", {
      name: "Second title",
    });
    const title = within(secondary).getByRole("textbox", {
      name: "Título da ação",
    });
    fireEvent.change(title, { target: { value: "Unsaved wide action" } });
    const close = () =>
      method === "overlay"
        ? fireEvent.click(
            screen.getByRole("button", { name: "Fechar painel de edição" }),
          )
        : fireEvent.keyDown(title, { key: "Escape" });
    fail = true;
    close();
    await screen.findByTestId("drawer-error-banner");
    expect(screen.getAllByRole("button", { name: "Fechar" })).toHaveLength(2);
    fail = false;
    close();
    await waitFor(() => expect(mounted.panels().secondaryAction).toBeNull());
    expect(mounted.panels().primaryAction).toBeNull();
  });
}

it("search creates a secondary draft beside an existing form and saves it once without changing either identity", async () => {
  const mounted = mount(action, () => {}, ["agency"], true);
  const primaryTitle = await screen.findByRole("textbox", {
    name: "Título da ação",
  });
  const primaryKey = mounted.panels().primaryAction?.key;
  fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
  const user = userEvent.setup();
  await user.keyboard("{Shift>}");
  await user.click(await screen.findByRole("menuitem", { name: "Criar ação" }));
  await user.keyboard("{/Shift}");
  await waitFor(() => expect(mounted.panels().secondaryAction).not.toBeNull());
  const draftKey = mounted.panels().secondaryAction?.key;
  const secondaryTitle = screen.getByRole<HTMLTextAreaElement>("textbox", {
    name: "Título da ação",
  });
  expect(secondaryTitle).not.toBe(primaryTitle);
  expect(mounted.panels().secondaryAction?.currentAction.id).toBeUndefined();
  expect(mounted.panels().secondaryAction?.currentAction.partners).toEqual([
    "agency",
  ]);
  expect(writes).toHaveLength(0);
  fireEvent.change(secondaryTitle, {
    target: { value: "New secondary draft" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Criar" }));
  await screen.findByRole("button", { name: "Atualizar" });
  expect(writes).toHaveLength(1);
  expect(mounted.panels().secondaryAction?.key).toBe(draftKey);
  expect(mounted.panels().secondaryAction?.currentAction.id).toBeTruthy();
  expect(mounted.panels().primaryAction?.key).toBe(primaryKey);
  await user.click(
    within(screen.getByRole("tablist", { name: "Ações abertas" })).getByRole(
      "tab",
      { name: /Original title/ },
    ),
  );
  expect(screen.getByRole("textbox", { name: "Título da ação" })).toBe(
    primaryTitle,
  );
});

it("a search-created primary draft survives opening an existing secondary from search", async () => {
  const mounted = mount(action, () => {}, ["agency"], true);
  await screen.findByRole("textbox", { name: "Título da ação" });
  const user = userEvent.setup();
  fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
  await user.click(await screen.findByRole("menuitem", { name: "Criar ação" }));
  await screen.findByRole("button", { name: "Criar" });
  const draftKey = mounted.panels().primaryAction?.key;
  const title = screen.getByRole<HTMLTextAreaElement>("textbox", {
    name: "Título da ação",
  });
  fireEvent.change(title, { target: { value: "x" } });
  fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
  await user.type(await screen.findByRole("searchbox"), "Second");
  await user.keyboard("{Shift>}");
  await user.click(
    await screen.findByRole("menuitem", { name: /Second title/ }),
  );
  await user.keyboard("{/Shift}");
  expect(mounted.panels().primaryAction?.key).toBe(draftKey);
  expect(mounted.panels().primaryAction?.currentAction.id).toBeUndefined();
  expect(mounted.panels().secondaryAction?.currentAction.id).toBe(
    secondAction().id,
  );
  expect(writes).toHaveLength(0);
  await user.click(
    within(screen.getByRole("tablist", { name: "Ações abertas" })).getByRole(
      "tab",
      { name: /^x/ },
    ),
  );
  expect(screen.getByRole("textbox", { name: "Título da ação" })).toBe(title);
  expect(title.value).toBe("x");
});

it("a failed secondary save blocks replacing it with a search-created draft", async () => {
  const mounted = mount(action, () => {}, ["agency"], true);
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  const secondaryKey = mounted.panels().secondaryAction?.key;
  const title = await screen.findByRole("textbox", { name: "Título da ação" });
  fireEvent.change(title, { target: { value: "Pending secondary edit" } });
  fail = true;
  fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
  const user = userEvent.setup();
  await user.keyboard("{Shift>}");
  await user.click(await screen.findByRole("menuitem", { name: "Criar ação" }));
  await user.keyboard("{/Shift}");
  await waitFor(() => expect(writes.length).toBeGreaterThan(0));
  expect(screen.getByRole("searchbox")).toBeTruthy();
  expect(mounted.panels().secondaryAction?.key).toBe(secondaryKey);
  expect(mounted.panels().secondaryAction?.currentAction.id).toBe(
    secondAction().id,
  );
  expect(mounted.panels().primaryAction?.currentAction.id).toBe(action.id);
});

it("Shift creation with empty panels opens primary, then creates a distinct secondary draft", async () => {
  const mounted = mount(action, () => {}, ["agency"], true);
  await act(async () => {
    mounted.panels().reset();
  });
  const user = userEvent.setup();
  for (let index = 0; index < 2; index++) {
    fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
    await user.keyboard("{Shift>}");
    await user.click(
      await screen.findByRole("menuitem", { name: "Criar ação" }),
    );
    await user.keyboard("{/Shift}");
    await waitFor(() => expect(screen.queryByRole("searchbox")).toBeNull());
    if (index === 0) {
      expect(mounted.panels().primaryAction?.currentAction.id).toBeUndefined();
      expect(mounted.panels().primaryAction).not.toBeNull();
      expect(mounted.panels().secondaryAction).toBeNull();
    }
  }
  expect(mounted.panels().primaryAction?.key).not.toBe(
    mounted.panels().secondaryAction?.key,
  );
  expect(document.querySelectorAll("[data-drawer-focus-scope]")).toHaveLength(
    2,
  );
  expect(writes).toHaveLength(0);
});

it("navigation from search respects both real form guards when a save fails", async () => {
  const mounted = mount(action, () => {}, ["agency"], true);
  await act(async () => {
    await mounted.panels().setSecondaryAction(secondAction());
  });
  const primaryKey = mounted.panels().primaryAction?.key;
  const secondaryKey = mounted.panels().secondaryAction?.key;
  fireEvent.change(screen.getByRole("textbox", { name: "Título da ação" }), {
    target: { value: "Pending secondary" },
  });
  fail = true;
  fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
  const user = userEvent.setup();
  await user.click(
    await screen.findByRole("menuitem", { name: "Minha conta" }),
  );
  await waitFor(() => expect(writes.length).toBeGreaterThan(0));
  expect(mounted.panels().primaryAction?.key).toBe(primaryKey);
  expect(mounted.panels().secondaryAction?.key).toBe(secondaryKey);
  expect(screen.getByRole("searchbox")).toBeTruthy();
});

describe("phone-width action panel", () => {
  // Layout is the controlled boundary: jsdom has no CSS layout or ResizeObserver.
  let panelWidth = 390;
  const resizeCallbacks = new Set<() => void>();
  class TestResizeObserver {
    private readonly callback: () => void;
    constructor(callback: () => void) {
      this.callback = callback;
    }
    observe() {
      resizeCallbacks.add(this.callback);
    }
    unobserve() {}
    disconnect() {
      resizeCallbacks.delete(this.callback);
    }
  }
  // Other files spy on HTMLElement.prototype, so stub and restore at that level.
  const elementPrototype = window.HTMLElement.prototype;
  let previousRect: PropertyDescriptor | undefined;
  let previousObserver: PropertyDescriptor | undefined;
  // Visible area of the Instagram tab's scroll region, when a test lays it out.
  let instagramScrollerRect: DOMRect | null = null;
  beforeEach(() => {
    panelWidth = 390;
    instagramScrollerRect = null;
    resizeCallbacks.clear();
    previousObserver = Object.getOwnPropertyDescriptor(
      globalThis,
      "ResizeObserver",
    );
    Object.assign(globalThis, { ResizeObserver: TestResizeObserver });
    previousRect = Object.getOwnPropertyDescriptor(
      elementPrototype,
      "getBoundingClientRect",
    );
    const measure = elementPrototype.getBoundingClientRect;
    Object.defineProperty(elementPrototype, "getBoundingClientRect", {
      configurable: true,
      writable: true,
      value(this: HTMLElement) {
        // The drawer's content area spans the whole action panel.
        if (this.hasAttribute("data-action-layout-width"))
          return new window.DOMRect(0, 0, panelWidth, 700);
        if (
          instagramScrollerRect &&
          this.hasAttribute("data-instagram-scroller")
        )
          return instagramScrollerRect;
        return measure.call(this);
      },
    });
  });
  afterEach(() => {
    if (previousRect)
      Object.defineProperty(
        elementPrototype,
        "getBoundingClientRect",
        previousRect,
      );
    else Reflect.deleteProperty(elementPrototype, "getBoundingClientRect");
    if (previousObserver)
      Object.defineProperty(globalThis, "ResizeObserver", previousObserver);
    else Reflect.deleteProperty(globalThis, "ResizeObserver");
  });
  function resizePanel(width: number) {
    panelWidth = width;
    act(() => {
      for (const notify of [...resizeCallbacks]) notify();
    });
  }
  function footerStrip() {
    const strip = document.querySelector<HTMLElement>(
      "[data-action-footer-strip]",
    );
    if (!strip) throw new Error("Footer strip did not render");
    const save = screen.getByRole("button", { name: /^(Atualiz|Cri)/ });
    return { save, strip };
  }
  function expectSameElements(actual: Element[], expected: Element[]) {
    expect(actual.length).toBe(expected.length);
    expected.forEach((element, index) => {
      expect(actual[index] === element).toBe(true);
    });
  }
  function layout(element: Element, left: number, width: number) {
    Object.defineProperty(element, "getBoundingClientRect", {
      configurable: true,
      value: () => new window.DOMRect(left, 0, width, 48),
    });
  }
  function scrollMetrics(
    element: HTMLElement,
    metrics: { scrollWidth: number; clientWidth: number },
  ) {
    let scrollLeft = 0;
    Object.defineProperties(element, {
      scrollWidth: { configurable: true, value: metrics.scrollWidth },
      clientWidth: { configurable: true, value: metrics.clientWidth },
      scrollLeft: {
        configurable: true,
        get: () => scrollLeft,
        set: (value: number) => {
          scrollLeft = Math.max(
            0,
            Math.min(value, metrics.scrollWidth - metrics.clientWidth),
          );
        },
      },
    });
  }
  function fades(strip: HTMLElement) {
    const overlays = strip.parentElement?.querySelectorAll(
      ":scope > [data-strip-fade]",
    );
    return [...(overlays ?? [])].map((overlay) => {
      // Decorative only: hidden from assistive tech and never holds controls.
      expect(overlay.getAttribute("aria-hidden")).toBe("true");
      expect(overlay.childElementCount).toBe(0);
      return overlay.getAttribute("data-strip-fade");
    });
  }

  it("collapses metadata to the date and an expand control without visible labels", async () => {
    mount(draft({ description: "<p></p>" }));
    await descriptionEditor();
    const expand = screen.getByRole("button", { name: "Detalhes da ação" });
    expect(expand.getAttribute("aria-expanded")).toBe("false");
    const date = screen.getByRole("button", { name: /outubro às 10h/ });
    const summary = expand.parentElement;
    if (!summary) throw new Error("Summary did not render");
    expect(summary.contains(date)).toBe(true);
    // Only the date is written; icon controls carry accessible names instead.
    expect(summary.textContent).toBe(date.textContent);
    expect(screen.queryByText(/Mais detalhes/)).toBeNull();
    expect(screen.queryByRole("img", { name: /arquivos/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Responsáveis" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Alternar exibição do ID da ação" }),
    ).toBeNull();
    expect(writes).toEqual([]);
  });

  it("shows the file indicator only when work attachments exist", async () => {
    mount(
      draft({
        description: "<p></p>",
        work_files: ["https://files.test/brief.pdf"],
      }),
    );
    await descriptionEditor();
    const indicator = screen.getByRole("img", {
      name: "Com arquivos de trabalho",
    });
    const summary = screen.getByRole("button", {
      name: "Detalhes da ação",
    }).parentElement;
    expect(summary?.contains(indicator)).toBe(true);
    // No file count or label next to the date.
    expect(summary?.textContent).toBe(
      screen.getByRole("button", { name: /outubro às 10h/ }).textContent,
    );
  });

  it("collapsed details leave the focus order; expanded ones are reachable and keep state", async () => {
    mount(draft({ category: "reels", description: "<p></p>" }));
    const editor = await descriptionEditor();
    const user = userEvent.setup();
    const visitUntilEditor = async () => {
      const visited: Element[] = [];
      act(() =>
        screen.getByRole("textbox", { name: "Título da ação" }).focus(),
      );
      for (let step = 0; step < 12; step++) {
        await user.tab();
        if (document.activeElement === editor) return visited;
        if (document.activeElement) visited.push(document.activeElement);
      }
      throw new Error("Tab never reached the description");
    };
    await user.keyboard("{Alt>}{F10}{/Alt}");
    const expand = screen.getByRole("button", { name: "Detalhes da ação" });
    const details = document.getElementById(
      expand.getAttribute("aria-controls") ?? "",
    );
    if (!details) throw new Error("Expand control does not name its region");
    const collapsed = await visitUntilEditor();
    expect(collapsed.includes(expand)).toBe(true);
    expect(collapsed.some((node) => details.contains(node))).toBe(false);

    await user.click(expand);
    expect(expand.getAttribute("aria-expanded")).toBe("true");
    const responsibles = screen.getByRole("button", { name: "Responsáveis" });
    const idToggle = screen.getByRole("button", {
      name: "Alternar exibição do ID da ação",
    });
    expect(screen.getByRole("button", { name: /ESTRATÉGIA/ })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Adicionar arquivo/ }),
    ).toBeTruthy();
    const expanded = await visitUntilEditor();
    expect(expanded.includes(responsibles)).toBe(true);
    expect(expanded.includes(idToggle)).toBe(true);

    // Collapsing keeps the same mounted controls and their local state.
    await user.click(idToggle);
    expect(idToggle.textContent).toBe(action.id);
    await user.click(expand);
    expect(screen.queryByRole("button", { name: "Responsáveis" })).toBeNull();
    await user.click(expand);
    expect(
      screen.getByRole("button", {
        name: "Alternar exibição do ID da ação",
      }) === idToggle,
    ).toBe(true);
    expect(idToggle.textContent).toBe(action.id);
    expect(writes).toEqual([]);
  });

  it("widening the panel restores the full metadata without losing compact state", async () => {
    mount(draft({ description: "<p></p>" }));
    await descriptionEditor();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Detalhes da ação" }));
    const responsibles = screen.getByRole("button", { name: "Responsáveis" });
    resizePanel(672);
    expect(
      screen.queryByRole("button", { name: "Detalhes da ação" }),
    ).toBeNull();
    expect(document.querySelector("[data-action-footer-strip]")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Responsáveis" }) === responsibles,
    ).toBe(true);
    expect(screen.getByRole("button", { name: "Atualizar" }).textContent).toBe(
      "Atualizar",
    );
    resizePanel(390);
    expect(
      screen
        .getByRole("button", { name: "Detalhes da ação" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: "Responsáveis" }) === responsibles,
    ).toBe(true);
  });

  it("one strip holds every footer control in order, with save outside it", async () => {
    mount(draft({ category: "reels", description: "<p></p>" }));
    await descriptionEditor();
    const { save, strip } = footerStrip();
    expectSameElements(within(strip).getAllByRole("button"), [
      screen.getByRole("button", { name: "Agency" }),
      screen.getByRole("button", { name: /^Fase:/ }),
      screen.getByRole("button", { name: /^Categoria:/ }),
      screen.getByRole("button", { name: "Abrir seletor de cores" }),
      screen.getByRole("button", { name: "Sprints" }),
      screen.getByRole("button", { name: "Duplicar ação (Shift+D)" }),
      screen.getByRole("button", { name: "Arquivar ação" }),
    ]);
    expect(strip.contains(save)).toBe(false);
    expect(save.getAttribute("aria-label")).toBe("Atualizar");
    expect(save.textContent).toBe("");
  });

  it("archived and draft actions keep their own strip commands", async () => {
    mount(draft({ archived: true, description: "<p></p>" }));
    await descriptionEditor();
    expectSameElements(
      within(footerStrip().strip).getAllByRole("button").slice(-3),
      [
        screen.getByRole("button", { name: "Sprints" }),
        screen.getByRole("button", { name: "Duplicar ação (Shift+D)" }),
        screen.getByRole("button", { name: "Desarquivar ação" }),
      ],
    );
    cleanup();
    mount(draft({ id: undefined, title: "", description: "<p></p>" }));
    await descriptionEditor();
    const { save, strip } = footerStrip();
    expectSameElements(within(strip).getAllByRole("button"), [
      screen.getByRole("button", { name: "Agency" }),
      screen.getByRole("button", { name: /^Fase:/ }),
      screen.getByRole("button", { name: /^Categoria:/ }),
    ]);
    expect(save.getAttribute("aria-label")).toBe("Criar");
  });

  it("the icon-only save keeps its pending name and state", async () => {
    delay = true;
    mount(action);
    fireEvent.change(screen.getByRole("textbox", { name: "Título da ação" }), {
      target: { value: "Pending compact save" },
    });
    fireEvent.click(footerStrip().save);
    const pending = await screen.findByRole("button", {
      name: "Atualizando...",
    });
    expect(pending.hasAttribute("disabled")).toBe(true);
    expect(pending.querySelector(".animate-spin")).not.toBeNull();
    expect(footerStrip().strip.contains(pending)).toBe(false);
    act(() =>
      resolveWrite?.({
        data: { ...action, title: "Pending compact save" },
        error: null,
      }),
    );
    await screen.findByRole("button", { name: "Atualizar" });
    expect(writes).toHaveLength(1);
  });

  it("edge fades follow the strip scroll position", async () => {
    mount(draft({ category: "reels", description: "<p></p>" }));
    await descriptionEditor();
    const { strip } = footerStrip();
    scrollMetrics(strip, { scrollWidth: 520, clientWidth: 300 });
    fireEvent.scroll(strip);
    expect(fades(strip)).toEqual(["end"]);
    strip.scrollLeft = 120;
    fireEvent.scroll(strip);
    expect(fades(strip)).toEqual(["start", "end"]);
    strip.scrollLeft = 220;
    fireEvent.scroll(strip);
    expect(fades(strip)).toEqual(["start"]);
    scrollMetrics(strip, { scrollWidth: 300, clientWidth: 300 });
    fireEvent.scroll(strip);
    expect(fades(strip)).toEqual([]);
  });

  it("keyboard focus brings an offscreen strip control into view", async () => {
    mount(draft({ description: "<p></p>" }));
    await descriptionEditor();
    const { strip } = footerStrip();
    scrollMetrics(strip, { scrollWidth: 500, clientWidth: 300 });
    layout(strip, 0, 300);
    const duplicate = screen.getByRole("button", {
      name: "Duplicar ação (Shift+D)",
    });
    const archive = screen.getByRole("button", { name: "Arquivar ação" });
    layout(duplicate, 200, 48);
    layout(archive, 398, 48);
    const user = userEvent.setup();
    act(() => duplicate.focus());
    expect(strip.scrollLeft).toBe(0);
    await user.keyboard("{Alt>}{F10}{/Alt}");
    await user.tab();
    expect(document.activeElement === archive).toBe(true);
    // 446 - (300 - 24px fade): the control ends clear of the right fade.
    expect(strip.scrollLeft).toBe(170);
    expect(fades(strip)).toEqual(["start", "end"]);
  });

  it("pointer focus leaves the strip where it is", async () => {
    mount(draft({ description: "<p></p>" }));
    await descriptionEditor();
    const { strip } = footerStrip();
    scrollMetrics(strip, { scrollWidth: 500, clientWidth: 300 });
    layout(strip, 0, 300);
    const archive = screen.getByRole("button", { name: "Arquivar ação" });
    layout(archive, 280, 48);
    fireEvent.pointerDown(archive);
    act(() => archive.focus());
    // Scrolling here would move the control away before the press ends.
    expect(strip.scrollLeft).toBe(0);
  });

  it("the Essencial Tab order is unchanged on a phone-width panel", async () => {
    mount(draft({ category: "reels", description: "<p></p>" }));
    const editor = await descriptionEditor();
    const user = userEvent.setup();
    const sequence = [
      screen.getByRole("textbox", { name: "Título da ação" }),
      editor,
      screen.getByRole("button", { name: "Agency" }),
      screen.getByRole("button", { name: /^Fase:/ }),
      screen.getByRole("button", { name: /^Categoria:/ }),
      screen.getByRole("button", { name: "Abrir seletor de cores" }),
      screen.getByRole("button", { name: "Atualizar" }),
    ];
    for (const target of sequence.slice(1)) {
      await user.tab();
      expect(document.activeElement === target).toBe(true);
    }
    for (const target of sequence.slice(0, -1).reverse()) {
      await user.tab({ shift: true });
      expect(document.activeElement === target).toBe(true);
    }
    expect(writes).toEqual([]);
  });
  const IMAGE = "https://res.cloudinary.com/test/image/upload/v1/post.jpg";
  async function openInstagram(overrides: Partial<Action> = {}) {
    mount(draft({ category: "post", description: "<p></p>", ...overrides }));
    await descriptionEditor();
    fireEvent.click(screen.getByRole("tab", { name: "INSTAGRAM" }));
    const scroller = document.querySelector<HTMLElement>(
      "[data-instagram-scroller]",
    );
    if (!scroller) throw new Error("Instagram tab did not render");
    return scroller;
  }
  function instagramEditor(scroller: HTMLElement) {
    const editor = scroller.querySelector<HTMLElement>(
      ".tiptap[contenteditable=true]",
    );
    if (!editor) throw new Error("Content editor did not mount");
    return editor;
  }

  it("without media the compact media area holds only Adicionar conteúdo", async () => {
    const scroller = await openInstagram();
    const media = within(scroller);
    expect(
      media.getByRole("button", { name: "Adicionar conteúdo" }),
    ).toBeTruthy();
    expect(
      media.queryByRole("button", { name: /Gerenciar|arquivo/ }),
    ).toBeNull();
    expect(media.queryByText("Nenhum conteúdo")).toBeNull();
    expect(scroller.querySelector("img, video")).toBeNull();
  });

  it("with media the compact area shows the preview, Adicionar conteúdo and Gerenciar", async () => {
    const scroller = await openInstagram({ content_files: [IMAGE] });
    const media = within(scroller);
    expect(scroller.querySelector("img")?.getAttribute("src")).toBe(IMAGE);
    expect(
      media.getByRole("button", { name: "Adicionar conteúdo" }),
    ).toBeTruthy();
    await userEvent
      .setup()
      .click(media.getByRole("button", { name: "Gerenciar" }));
    expect(
      await screen.findByRole("heading", { name: /Gerenciar conteúdo/ }),
    ).toBeTruthy();
    expect(writes).toEqual([]);
  });

  it("the upload control stays the same mounted widget while files arrive", async () => {
    let deliver: ((error: unknown, result: unknown) => void) | null = null;
    let destroyed = 0;
    Object.assign(window, {
      cloudinary: {
        createUploadWidget: (
          _options: object,
          callback: (error: unknown, result: unknown) => void,
        ) => {
          deliver = callback;
          return { open: () => {}, destroy: () => destroyed++ };
        },
      },
    });
    try {
      const scroller = await openInstagram();
      const add = within(scroller).getByRole("button", {
        name: "Adicionar conteúdo",
      });
      await userEvent.setup().click(add);
      const success = (url: string, name: string) =>
        act(() =>
          deliver?.(null, {
            event: "success",
            info: { secure_url: url, public_id: name, original_filename: name },
          }),
        );
      success(IMAGE, "a");
      success(IMAGE.replace("post", "second"), "b");
      expect(
        within(scroller).getByRole("button", { name: "Adicionar conteúdo" }) ===
          add,
      ).toBe(true);
      expect(destroyed).toBe(0);
      expect(
        within(scroller).getByRole("button", { name: "Gerenciar" }),
      ).toBeTruthy();
      await waitFor(() =>
        expect(writes.at(-1)?.content_files).toEqual([
          IMAGE,
          IMAGE.replace("post", "second"),
        ]),
      );
    } finally {
      Reflect.deleteProperty(window, "cloudinary");
    }
  });

  it("the compact content editor has one toolbar row and a menu for the other commands", async () => {
    const scroller = await openInstagram({
      content_description: "<p>Slide</p>",
    });
    const editor = instagramEditor(scroller);
    const toolbar = within(scroller).getByRole("toolbar", {
      name: "Formatação do texto",
    });
    expect(
      within(toolbar).getByRole("button", { name: "Mais formatação" }),
    ).toBeTruthy();
    expect(
      within(toolbar).queryByRole("button", { name: "Título 1" }),
    ).toBeNull();
    const user = userEvent.setup();
    act(() => editor.focus());
    await user.keyboard("{Alt>}{Shift>}{F10}{/Shift}{/Alt}");
    expect(toolbar.contains(document.activeElement)).toBe(true);
    await user.tab();
    expect(document.activeElement === editor).toBe(true);
    // A wide panel keeps the full toolbar on the same editor instance.
    resizePanel(768);
    const wideToolbar = within(scroller).getByRole("toolbar", {
      name: "Formatação do texto",
    });
    expect(
      within(wideToolbar).getByRole("button", { name: "Título 1" }),
    ).toBeTruthy();
    expect(
      within(wideToolbar).queryByRole("button", { name: "Mais formatação" }),
    ).toBeNull();
    expect(instagramEditor(scroller) === editor).toBe(true);
    expect(within(scroller).getByText("Nenhum conteúdo")).toBeTruthy();
    expect(
      within(scroller).getByRole("button", { name: "Gerenciar" }),
    ).toBeTruthy();
  });

  it("the writing column follows the visible space and keeps the caption selection", async () => {
    const viewport = installVisualViewport({ height: 800 });
    try {
      const scroller = await openInstagram();
      const column = scroller.querySelector<HTMLElement>(
        "[data-instagram-writing]",
      );
      if (!column) throw new Error("Writing column did not render");
      // The tab's scroll area spans 100–700px of the layout viewport.
      instagramScrollerRect = new window.DOMRect(0, 100, 390, 600);
      resizePanel(390);
      expect(column.style.height).toBe("600px");
      fireEvent.click(within(column).getByRole("tab", { name: "Legenda" }));
      const caption = within(column).getByRole("textbox", {
        name: "Legenda do Instagram",
      });
      if (!(caption instanceof window.HTMLTextAreaElement))
        throw new Error("Caption is not a textarea");
      fireEvent.change(caption, { target: { value: "Primeira linha" } });
      caption.setSelectionRange(3, 8);
      // The iOS keyboard leaves 400px visible: only 300px of the area remain.
      viewport.set({ height: 400 });
      expect(column.style.height).toBe("300px");
      // A very short viewport keeps a minimal writing region, not zero.
      viewport.set({ height: 160 });
      expect(column.style.height).toBe("144px");
      expect(
        within(column).getByRole("textbox", {
          name: "Legenda do Instagram",
        }) === caption,
      ).toBe(true);
      expect([caption.selectionStart, caption.selectionEnd]).toEqual([3, 8]);
      expect(caption.value).toBe("Primeira linha");
      // Wide panels return to their container-query layout.
      resizePanel(768);
      expect(column.style.height).toBe("");
    } finally {
      viewport.restore();
    }
  });
  it("the writing column can scroll fully above the keyboard", async () => {
    const viewport = installVisualViewport({ height: 844 });
    try {
      const scroller = await openInstagram();
      const column = scroller.querySelector<HTMLElement>(
        "[data-instagram-writing]",
      );
      if (!column) throw new Error("Writing column did not render");
      // The drawer is fixed to the layout viewport: its scroll area spans
      // 160–760px and keeps that box when the keyboard opens.
      instagramScrollerRect = new window.DOMRect(0, 160, 390, 600);
      resizePanel(390);
      expect(column.style.height).toBe("600px");
      expect(scroller.querySelector("[data-keyboard-inset]")).toBeNull();
      viewport.set({ height: 470 });
      const inset = scroller.querySelector<HTMLElement>(
        "[data-keyboard-inset]",
      );
      if (!inset) throw new Error("No room was reserved under the keyboard");
      // The spacer is the last scrolled content, directly after the column.
      expect(column.nextElementSibling === inset).toBe(true);
      expect(scroller.lastElementChild === inset).toBe(true);
      const columnHeight = Number.parseFloat(column.style.height);
      const insetHeight = Number.parseFloat(inset.style.height);
      expect(columnHeight).toBe(310);
      // Column and spacer fill the scroll area, so at maximum scroll the
      // content ends at its bottom (760px) and the column ends above it.
      expect(columnHeight + insetHeight).toBeGreaterThanOrEqual(600);
      const columnBottom = 760 - insetHeight;
      expect(columnBottom).toBeLessThanOrEqual(470);
      expect(columnBottom - columnHeight).toBeGreaterThanOrEqual(160);
      viewport.set({ height: 844 });
      expect(scroller.querySelector("[data-keyboard-inset]")).toBeNull();
      expect(column.style.height).toBe("600px");
    } finally {
      viewport.restore();
    }
  });

  it("a wide but short landscape panel uses the writing layout without toggling on the keyboard", async () => {
    const viewport = installVisualViewport({ width: 844, height: 390 });
    try {
      // Landscape phone: the panel is 672px wide (not compact) and the
      // Instagram scroll area spans 120–340px.
      panelWidth = 672;
      instagramScrollerRect = new window.DOMRect(0, 120, 672, 220);
      const scroller = await openInstagram();
      const media = within(scroller);
      const editor = instagramEditor(scroller);
      const column = scroller.querySelector<HTMLElement>(
        "[data-instagram-writing]",
      );
      if (!column) throw new Error("Writing column did not render");
      expect(document.querySelector("[data-action-footer-strip]")).toBeNull();
      expect(
        media.getByRole("button", { name: "Adicionar conteúdo" }),
      ).toBeTruthy();
      expect(
        media.queryByRole("button", { name: /Gerenciar|arquivo/ }),
      ).toBeNull();
      expect(media.queryByText("Nenhum conteúdo")).toBeNull();
      const toolbar = () =>
        within(media.getByRole("toolbar", { name: "Formatação do texto" }));
      expect(
        toolbar().getByRole("button", { name: "Mais formatação" }),
      ).toBeTruthy();
      expect(toolbar().queryByRole("button", { name: "Título 1" })).toBeNull();
      expect(column.style.height).toBe("220px");
      // The keyboard shrinks only the visual viewport: same layout, smaller
      // column (kept at the minimum) and room to scroll it above the keyboard.
      viewport.set({ height: 250 });
      expect(
        toolbar().getByRole("button", { name: "Mais formatação" }),
      ).toBeTruthy();
      expect(column.style.height).toBe("144px");
      expect(
        scroller.querySelector<HTMLElement>("[data-keyboard-inset]")?.style
          .height,
      ).toBe("90px");
      viewport.set({ height: 390 });
      // Near the limit the writing layout holds until clearly taller.
      instagramScrollerRect = new window.DOMRect(0, 120, 672, 500);
      resizePanel(672);
      expect(
        toolbar().getByRole("button", { name: "Mais formatação" }),
      ).toBeTruthy();
      instagramScrollerRect = new window.DOMRect(0, 120, 672, 600);
      resizePanel(672);
      expect(toolbar().getByRole("button", { name: "Título 1" })).toBeTruthy();
      expect(
        toolbar().queryByRole("button", { name: "Mais formatação" }),
      ).toBeNull();
      expect(media.getByText("Nenhum conteúdo")).toBeTruthy();
      expect(column.style.height).toBe("");
      expect(instagramEditor(scroller) === editor).toBe(true);
      // Short desktop windows keep the side-by-side container-query layout.
      instagramScrollerRect = new window.DOMRect(0, 120, 800, 220);
      resizePanel(800);
      expect(toolbar().getByRole("button", { name: "Título 1" })).toBeTruthy();
      expect(column.style.height).toBe("");
    } finally {
      viewport.restore();
    }
  });
});
