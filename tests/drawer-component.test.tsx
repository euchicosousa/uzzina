import { afterEach, beforeEach, expect, it, mock } from "bun:test";
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
import { GlobalSearchCommand } from "../app/components/features/GlobalSearchCommand";
import { AppContext } from "../app/contexts/AppContext";
import { ActionDrawerPanel } from "../app/components/features/action-drawer/ActionDrawerPanel";
import type { Action, Person, Partner } from "../app/types";
import { QUERY_KEYS } from "../app/lib/query-keys";
import userEvent from "@testing-library/user-event";

Object.assign(globalThis, {
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
