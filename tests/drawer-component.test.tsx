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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContext } from "../app/contexts/AppContext";
import { ActionFormDrawer } from "../app/components/features/action-drawer/ActionFormDrawer";
import type { Action, Person, Partner } from "../app/types";
import { QUERY_KEYS } from "../app/lib/query-keys";
import userEvent from "@testing-library/user-event";

Object.assign(globalThis, { KeyboardEvent: window.KeyboardEvent });
Object.assign(window.Range.prototype, {
  getClientRects: () => [],
  getBoundingClientRect: () => new window.DOMRect(),
});

type Row = Record<string, unknown>;
let writes: Row[] = [];
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
      const chain = {
        select: () => chain,
        eq: () => chain,
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
          if (patch) writes.push({ ...patch });
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
          return {
            data: { ...action, ...patch, updated_at: "2026-10-06T10:01:00Z" },
            error: null,
          };
        },
      };
      return chain;
    },
  }),
}));

beforeEach(() => {
  writes = [];
  fail = false;
  delay = false;
  resolveWrite = null;
  conflict = false;
});
afterEach(cleanup);
function draft(overrides: Partial<Action>): Action {
  return { ...action, ...overrides };
}
function mount(
  base: Action = action,
  onClose = () => {},
  partnerFilters: string[] = [],
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  client.setQueryData(QUERY_KEYS.people("test-user"), []);
  const view = (selected: Action, version: number) => (
    <QueryClientProvider client={client}>
      <AppContext.Provider
        value={{
          person,
          partners: [partner],
          cloudName: "test",
          uploadPreset: "test",
          setBaseAction: () => {},
          partnerFilters,
          setPartnerFilters: () => {},
        }}
      >
        <ActionFormDrawer
          partnerFilters={partnerFilters}
          key={`${selected.id || "draft"}:${version}`}
          BaseAction={selected}
          onClose={onClose}
        />
      </AppContext.Provider>
    </QueryClientProvider>
  );
  const mounted = render(view(base, 0));
  return {
    ...mounted,
    select: (selected: Action, version: number) =>
      mounted.rerender(view(selected, version)),
  };
}
async function descriptionEditor() {
  await waitFor(() => {
    expect(
      document.querySelector(".tiptap[contenteditable=true]"),
    ).not.toBeNull();
  });
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
  expect(document.activeElement === editor).toBe(false);
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

it("the main sequence keeps ordinary boundaries instead of wrapping", async () => {
  mount(draft({ description: "<p></p>" }));
  await descriptionEditor();
  const afterDrawer = document.createElement("button");
  afterDrawer.textContent = "After drawer";
  document.body.append(afterDrawer);
  const user = userEvent.setup();
  await user.tab({ shift: true });
  expect(
    document.activeElement === screen.getByRole("button", { name: "Fechar" }),
  ).toBe(true);
  act(() => screen.getByRole("button", { name: "Atualizar" }).focus());
  await user.tab();
  expect(document.activeElement === afterDrawer).toBe(true);
  afterDrawer.remove();
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
