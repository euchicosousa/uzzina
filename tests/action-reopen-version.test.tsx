import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { Suspense, useEffect } from "react";
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
import { Toaster } from "sonner";
import {
  useActionPanels,
  type ActionPanels,
} from "../app/hooks/useActionPanels";
import { AppThemeProvider } from "../app/hooks/useAppTheme";
import { AppContext } from "../app/contexts/AppContext";
import { ActionDrawerPanel } from "../app/components/features/action-drawer/ActionDrawerPanel";
import {
  ActionSaveCoordinator,
  compareActionVersions,
} from "../app/components/features/action-drawer/action-save-coordinator";
import { getChangedFields } from "../app/components/features/action-drawer/conflict-comparison";
import { resetQuerySession } from "../app/lib/query-client";
import { QUERY_KEYS } from "../app/lib/query-keys";
import type { Action, Partner, Person } from "../app/types";

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

// ─── Controlled database boundary ────────────────────────────────────────────
// Drawer, panels, coordinator, mutations and comparison stay real. Versions use
// the PostgREST form of a UTC timestamp without time zone, advanced per write.
type Row = Record<string, unknown>;
type ReadOutcome = { row?: Action; error?: { code?: string; message: string } };
const rows = new Map<string, Action>();
let reads: string[] = [];
let writes: { id: string; patch: Row; expected: unknown }[] = [];
let holdReads = false;
let heldReads: { id: string; settle: (outcome?: ReadOutcome) => void }[] = [];
let holdWrites = false;
let heldWrites: (() => void)[] = [];
let clock = 0;
const nextVersion = () =>
  `2026-10-30T12:00:01.${String(++clock).padStart(6, "0")}`;

function readResult(id: string, outcome?: ReadOutcome) {
  if (outcome?.error) return { data: null, error: outcome.error };
  const row = outcome?.row ?? rows.get(id);
  if (!row)
    return {
      data: null,
      error: { code: "PGRST116", message: "JSON object requested, 0 rows" },
    };
  return { data: structuredClone(row), error: null };
}
/** Another person or session saving the action. */
function remoteEdit(id: string, patch: Partial<Action>) {
  const row = rows.get(id);
  if (!row) throw new Error(`Missing row ${id}`);
  const next = { ...row, ...patch, updated_at: nextVersion() } as Action;
  rows.set(id, next);
  return next;
}

mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: "test-user" } },
        error: null,
      }),
    },
    from: (table: string) => {
      let operation: "read" | "update" = "read";
      let patch: Row = {};
      const filters: Record<string, unknown> = {};
      const chain = {
        select: () => chain,
        eq: (field: string, value: unknown) => {
          filters[field] = value;
          return chain;
        },
        update: (value: Row) => {
          operation = "update";
          patch = value;
          return chain;
        },
        ilike: () => chain,
        overlaps: () => chain,
        contains: () => chain,
        is: () => chain,
        order: () => chain,
        limit: async () => ({ data: [], error: null }),
        single: async () => {
          if (table !== "actions")
            return { data: null, error: { message: "Not controlled" } };
          const id = String(filters.id ?? "");
          if (operation === "read") {
            reads.push(id);
            if (holdReads)
              return new Promise<ReturnType<typeof readResult>>((resolve) =>
                heldReads.push({
                  id,
                  settle: (outcome) => resolve(readResult(id, outcome)),
                }),
              );
            return readResult(id);
          }
          const expected = filters.updated_at;
          writes.push({ id, patch: { ...patch }, expected });
          const apply = () => {
            const row = rows.get(id);
            if (!row || row.updated_at !== expected)
              return {
                data: null,
                error: { code: "PGRST116", message: "0 rows" },
              };
            const next = {
              ...row,
              ...patch,
              updated_at: nextVersion(),
            } as Action;
            rows.set(id, next);
            return { data: structuredClone(next), error: null };
          };
          if (holdWrites)
            return new Promise<ReturnType<typeof apply>>((resolve) =>
              heldWrites.push(() => resolve(apply())),
            );
          return apply();
        },
      };
      return chain;
    },
  }),
}));

const V0 = "2026-10-30T12:00:00.5";
const ID_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ID_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const baseAction = (overrides: Partial<Action> = {}): Action => ({
  id: ID_A,
  title: "Opened title",
  date: "2026-10-31T10:00:00",
  category: "design",
  phase: "do",
  priority: "medium",
  color: "#666666",
  time: 10,
  partners: ["agency"],
  responsibles: ["test-user"],
  archived: false,
  description: "<p>Opened description</p>",
  content_description: null,
  instagram_caption: null,
  content_files: [],
  work_files: [],
  sprints: [],
  strategies: [],
  user_id: "test-user",
  created_at: "2026-10-01T10:00:00",
  updated_at: V0,
  ...overrides,
});
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
const partners = ["agency", "studio"].map(
  (slug) =>
    ({
      id: slug,
      slug,
      title: slug === "agency" ? "Agency" : "Studio",
      short: slug,
      colors: ["#666666"],
      users_ids: [],
      archived: false,
      image: null,
      sow: "socialmedia",
      created_at: "2026-10-06T10:00:00Z",
      instagram_caption_tail: null,
      context: null,
      voice: null,
    }) satisfies Partner,
);

let viewportWidth = 1440;
const originalMatchMedia = Object.getOwnPropertyDescriptor(
  window,
  "matchMedia",
);
beforeEach(() => {
  viewportWidth = 1440;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => {
      const minimum = Number(
        query.match(/min-width: (\d+)px/)?.[1] ?? Infinity,
      );
      const events = new window.EventTarget();
      return {
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
    },
  });
  rows.clear();
  reads = [];
  writes = [];
  holdReads = false;
  heldReads = [];
  holdWrites = false;
  heldWrites = [];
  clock = 0;
});
afterEach(() => {
  cleanup();
  if (originalMatchMedia)
    Object.defineProperty(window, "matchMedia", originalMatchMedia);
  else Reflect.deleteProperty(window, "matchMedia");
});

function Panels({
  initialAction,
  onPanels,
}: {
  initialAction: Action;
  onPanels: (panels: ActionPanels) => void;
}) {
  const panels = useActionPanels(initialAction);
  useEffect(() => onPanels(panels), [onPanels, panels]);
  return (
    <Suspense fallback={null}>
      <ActionDrawerPanel panels={panels} />
    </Suspense>
  );
}

/** Opens `opened` (the cached copy) while the database holds `stored`. */
async function open(opened: Action, stored: Action | null = opened) {
  if (stored?.id) rows.set(stored.id, structuredClone(stored));
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  client.setQueryData(QUERY_KEYS.people("test-user"), []);
  const router = createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ["/app"] }),
  });
  let latest: ActionPanels | undefined;
  render(
    <RouterContextProvider router={router}>
      <QueryClientProvider client={client}>
        <AppThemeProvider>
          <AppContext.Provider
            value={{
              person,
              partners,
              cloudName: "test",
              uploadPreset: "test",
              setPrimaryAction: () => {},
              partnerFilters: [],
              setPartnerFilters: () => {},
            }}
          >
            <Panels
              initialAction={opened}
              onPanels={(panels) => {
                latest = panels;
              }}
            />
            <Toaster />
          </AppContext.Provider>
        </AppThemeProvider>
      </QueryClientProvider>
    </RouterContextProvider>,
  );
  await screen.findByRole("textbox", { name: "Título da ação" });
  return {
    client,
    panels: () => {
      if (!latest) throw new Error("Panels have not mounted");
      return latest;
    },
  };
}
const title = () =>
  screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Título da ação" });
const dialog = () =>
  screen.queryByRole("dialog", { name: "Comparar alterações" });
const findDialog = () =>
  screen.findByRole("dialog", { name: "Comparar alterações" });
/** Lets pending reads, writes and React updates finish. */
const settle = () =>
  act(async () => {
    for (let index = 0; index < 5; index++)
      await new Promise((resolve) => setTimeout(resolve, 0));
  });
async function releaseReads(outcome?: ReadOutcome) {
  const pending = heldReads;
  heldReads = [];
  await act(async () => {
    for (const read of pending) read.settle(outcome);
  });
  await settle();
}
/** Answers one held read, leaving the others pending. */
async function releaseRead(index: number, outcome?: ReadOutcome) {
  const [read] = heldReads.splice(index, 1);
  if (!read) throw new Error(`No held read at ${index}`);
  await act(async () => read.settle(outcome));
  await settle();
}
let confirmAnswers: boolean[] = [];
let confirmMessages: string[] = [];
const originalConfirm = Object.getOwnPropertyDescriptor(window, "confirm");
function answerConfirm(...answers: boolean[]) {
  confirmAnswers = answers;
  confirmMessages = [];
  Object.defineProperty(window, "confirm", {
    configurable: true,
    value: (message: string) => {
      confirmMessages.push(message);
      return confirmAnswers.shift() ?? false;
    },
  });
}
afterEach(() => {
  if (originalConfirm)
    Object.defineProperty(window, "confirm", originalConfirm);
  else Reflect.deleteProperty(window, "confirm");
});
/** The real Tiptap instance behind an editor element. */
function tiptap(node: Element) {
  const editor = (
    node as Element & {
      editor?: {
        commands: {
          focus: (position: string) => boolean;
          insertContent: (value: string) => boolean;
        };
      };
    }
  ).editor;
  if (!editor) throw new Error("Editor instance unavailable");
  return editor;
}
async function editorNode() {
  return waitFor(() => {
    const found = document.querySelector<HTMLElement>(
      ".tiptap[contenteditable=true]",
    );
    if (!found) throw new Error("Editor did not mount");
    return found;
  });
}
/** Saves, gets a conflict and opens "Comparar e salvar", whose read stays held. */
async function conflictThenCompare() {
  fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
  await screen.findByTestId("drawer-conflict-banner");
  fireEvent.click(screen.getByRole("button", { name: "Comparar e salvar" }));
  await settle();
}
async function releaseWrites() {
  const pending = heldWrites;
  heldWrites = [];
  await act(async () => {
    for (const write of pending) write();
  });
  await settle();
}
function fieldNotes(regionName: string) {
  const region = within(dialog() as HTMLElement).getByRole("region", {
    name: regionName,
  });
  return [...region.querySelectorAll("dt")].map((node) => node.textContent);
}
function typeTitle(value: string) {
  fireEvent.change(title(), { target: { value } });
}

describe("version comparison", () => {
  it("orders parsed versions instead of comparing strings", () => {
    // Same instant in different representations is the same version.
    expect(
      compareActionVersions(
        "2026-10-30T12:00:00.1",
        "2026-10-30T12:00:00.100000",
      ),
    ).toBe(0);
    expect(
      compareActionVersions("2026-10-30T12:00:00", "2026-10-30T12:00:00Z"),
    ).toBe(0);
    expect(
      compareActionVersions(
        "2026-10-30T09:00:00.5-03:00",
        "2026-10-30 12:00:00.5",
      ),
    ).toBe(0);
    // Lexicographically "…00Z" sorts after "…00.000001", but it is older.
    expect(
      compareActionVersions(
        "2026-10-30T12:00:00Z",
        "2026-10-30T12:00:00.000001",
      ),
    ).toBe(-1);
    // Microsecond precision beyond milliseconds.
    expect(
      compareActionVersions(
        "2026-10-30T12:00:00.123457",
        "2026-10-30T12:00:00.123456",
      ),
    ).toBe(1);
    expect(compareActionVersions("not a version", V0)).toBeNull();
  });

  it("ignores representation-only differences between stored values", () => {
    const base = baseAction({ sprints: null, archived: null });
    expect(
      getChangedFields(
        base as unknown as Row,
        {
          ...base,
          date: "2026-10-31 10:00:00",
          sprints: [],
          archived: false,
          strategies: "[]",
          description: base.description,
          updated_at: "2026-10-30T13:00:00",
        } as unknown as Row,
      ),
    ).toEqual([]);
    // Reordering media is a real change.
    expect(
      getChangedFields(
        baseAction({
          content_files: [
            "https://files.test/a.png",
            "https://files.test/b.png",
          ],
        }) as unknown as Row,
        baseAction({
          content_files: [
            "https://files.test/b.png",
            "https://files.test/a.png",
          ],
        }) as unknown as Row,
      ),
    ).toEqual(["content_files"]);
  });
});

describe("coordinator remote versions", () => {
  const writer = () => {
    const sent: Record<string, unknown>[] = [];
    let release: ((action: Action) => void) | null = null;
    return {
      sent,
      release: (action: Action) => release?.(action),
      writeFn: async (payload: Record<string, unknown>) => {
        sent.push(payload);
        return new Promise<Action>((resolve) => {
          release = resolve;
        });
      },
    };
  };

  it("reconciles a save in flight before judging a read", async () => {
    const io = writer();
    const coordinator = new ActionSaveCoordinator({
      key: ID_A,
      initialAction: baseAction(),
      writeFn: io.writeFn,
    });
    const save = coordinator.scheduleUpdate({ title: "Mine" });
    // The read ran on the server after this save committed.
    const own = baseAction({ title: "Mine", updated_at: nextVersion() });
    const verdict = coordinator.receiveRemoteVersion(
      own,
      coordinator.getGeneration(),
    );
    io.release(own);
    await save;
    expect(await verdict).toBe("same");
    // A read that ran before the save is older than its confirmation.
    expect(
      await coordinator.receiveRemoteVersion(
        baseAction(),
        coordinator.getGeneration(),
      ),
    ).toBe("stale");
    expect(coordinator.getState().remoteVersion).toBeNull();
    expect(coordinator.getState().confirmedAction?.title).toBe("Mine");
  });

  it("pauses writes after a newer version and resumes only through a decision", async () => {
    const sent: Record<string, unknown>[] = [];
    const coordinator = new ActionSaveCoordinator({
      key: ID_A,
      initialAction: baseAction(),
      writeFn: async (payload) => {
        sent.push(payload);
        return baseAction({ ...payload, updated_at: nextVersion() });
      },
    });
    const remote = baseAction({ phase: "doing", updated_at: nextVersion() });
    const generation = coordinator.getGeneration();
    expect(await coordinator.receiveRemoteVersion(remote, generation)).toBe(
      "newer",
    );
    expect(await coordinator.receiveRemoteVersion(remote, generation)).toBe(
      "known",
    );
    expect(await coordinator.scheduleUpdate({ title: "Mine" })).toBeNull();
    expect(sent).toEqual([]);
    expect(coordinator.getState().confirmedAction?.updated_at).toBe(V0);
    // Clean forms can still leave without writing.
    const clean = new ActionSaveCoordinator({
      key: ID_A,
      initialAction: baseAction(),
      writeFn: async () => null,
    });
    await clean.receiveRemoteVersion(remote, clean.getGeneration());
    expect(await clean.safeClose({ title: "Opened title" })).toBe(true);
    // Keeping local edits sends only those fields against the reviewed version.
    expect(coordinator.rebase(remote)).toBe(true);
    expect(await coordinator.saveNow()).toBe(true);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      title: "Mine",
      expectedUpdatedAt: remote.updated_at,
    });
    expect(Object.keys(sent[0] ?? {}).sort()).toEqual(
      ["expectedUpdatedAt", "id", "intent", "title"].sort(),
    );
  });

  it("ignores reads from a previous opening", async () => {
    const coordinator = new ActionSaveCoordinator({
      key: ID_A,
      initialAction: baseAction(),
      writeFn: async () => null,
    });
    const generation = coordinator.getGeneration();
    coordinator.reset(baseAction());
    expect(
      await coordinator.receiveRemoteVersion(
        baseAction({ updated_at: nextVersion() }),
        generation,
      ),
    ).toBe("ignored");
    expect(coordinator.getState().remoteVersion).toBeNull();
  });
});

describe("reopening an existing action", () => {
  it("same version: one background read and nothing visible, with or without edits", async () => {
    holdReads = true;
    await open(baseAction());
    expect(reads).toEqual([ID_A]);
    // Editable before the read returns.
    typeTitle("Typed while checking");
    await releaseReads();
    expect(dialog()).toBeNull();
    expect(screen.queryByTestId("drawer-remote-version-banner")).toBeNull();
    expect(title().value).toBe("Typed while checking");
    expect(writes).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    await settle();
    expect(writes).toEqual([
      {
        id: ID_A,
        patch: { title: "Typed while checking" },
        expected: V0,
      },
    ]);
    expect(reads).toEqual([ID_A]);
  });

  it("newer version with a clean form opens the comparison without adopting it", async () => {
    holdReads = true;
    await open(
      baseAction({
        work_files: ["https://files.test/brief.png"],
        content_files: ["https://files.test/a.png", "https://files.test/b.png"],
      }),
    );
    const remote = remoteEdit(ID_A, {
      title: "Remote title",
      date: "2026-11-01T15:30:00",
      partners: ["agency", "studio"],
      responsibles: [],
      phase: "doing",
      category: "post",
      color: "#ff0000",
      archived: true,
      strategies: [
        {
          headline: "Remote strategy",
          angulo: "A",
          racional: "R",
          direcionamento: "D",
        },
      ],
      // Media removed and reordered by the other session.
      work_files: [],
      content_files: ["https://files.test/b.png"],
    });
    await releaseReads();
    const shown = await findDialog();
    // The modal hides the form from the accessibility tree; it is still the opened version.
    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Título da ação",
        hidden: true,
      }).value,
    ).toBe("Opened title");
    expect(writes).toEqual([]);
    const server = fieldNotes("Versão atual");
    expect(server).toEqual([
      "Título · Mudou no servidor",
      "Data · Mudou no servidor",
      "Parceiros · Mudou no servidor",
      "Responsáveis · Mudou no servidor",
      "Estado · Mudou no servidor",
      "Tipo · Mudou no servidor",
      "Estratégias · Mudou no servidor",
      "Arquivos do conteúdo · Mudou no servidor",
      "Arquivos de trabalho · Mudou no servidor",
      "Cor · Mudou no servidor",
      "Arquivamento · Mudou no servidor",
    ]);
    expect(
      fieldNotes("Versão aberta").every((note) =>
        note?.endsWith("Sem alteração sua"),
      ),
    ).toBe(true);
    const current = within(shown).getByRole("region", { name: "Versão atual" });
    const opened = within(shown).getByRole("region", { name: "Versão aberta" });
    expect(within(current).getByText("01/11/2026 às 15h30")).toBeTruthy();
    expect(within(current).getByText("Fazendo")).toBeTruthy();
    expect(within(current).getByText(/Agency\s+Studio/)).toBeTruthy();
    expect(within(opened).getByText(/a\.png\s+b\.png/)).toBeTruthy();
    expect(within(current).getByText("b.png")).toBeTruthy();
    // Without local changes there is nothing of the user's to save.
    expect(
      within(shown).queryByRole("button", { name: "Salvar minhas alterações" }),
    ).toBeNull();
    fireEvent.click(
      within(shown).getByRole("button", { name: "Usar versão atual" }),
    );
    await waitFor(() => expect(dialog()).toBeNull());
    expect(title().value).toBe("Remote title");
    expect(screen.queryAllByRole("link", { name: "Abrir anexo" })).toHaveLength(
      0,
    );
    expect(writes).toEqual([]);
    // The accepted version is the new write base; untouched fields are not resent.
    typeTitle("After accepting");
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    await settle();
    expect(writes).toEqual([
      {
        id: ID_A,
        patch: { title: "After accepting" },
        expected: remote.updated_at,
      },
    ]);
  });

  it("only technical version metadata changed: says so without inventing content", async () => {
    holdReads = true;
    await open(baseAction());
    remoteEdit(ID_A, {});
    await releaseReads();
    const shown = await findDialog();
    expect(within(shown).getByRole("status").textContent).toContain(
      "Nenhum campo do conteúdo mudou",
    );
    expect(within(shown).queryByTestId("conflict-comparison")).toBeNull();
  });

  it("same field edited locally and remotely while the read is pending", async () => {
    holdReads = true;
    await open(baseAction());
    typeTitle("My title");
    remoteEdit(ID_A, { title: "Their title" });
    await releaseReads();
    const shown = await findDialog();
    expect(fieldNotes("Versão atual")).toEqual(["Título · Mudou no servidor"]);
    expect(fieldNotes("Sua edição")).toEqual(["Título · Alterado por você"]);
    expect(
      within(
        within(shown).getByRole("region", { name: "Sua edição" }),
      ).getByText("My title"),
    ).toBeTruthy();
    expect(
      within(
        within(shown).getByRole("region", { name: "Versão atual" }),
      ).getByText("Their title"),
    ).toBeTruthy();
    expect(
      within(shown).getByRole("button", {
        name: "Descartar minhas alterações e usar a atual",
      }),
    ).toBeTruthy();
    expect(writes).toEqual([]);
  });

  it("different fields: keeping local edits saves only the true patch over the reviewed version", async () => {
    holdReads = true;
    await open(baseAction());
    typeTitle("My title");
    const remote = remoteEdit(ID_A, {
      phase: "doing",
      description: "<p>Their description</p>",
    });
    await releaseReads();
    const shown = await findDialog();
    expect(fieldNotes("Versão atual")).toEqual([
      "Título · Sem mudança no servidor",
      "Descrição · Mudou no servidor",
      "Estado · Mudou no servidor",
    ]);
    expect(fieldNotes("Sua edição")).toEqual([
      "Título · Alterado por você",
      "Descrição · Sem alteração sua",
      "Estado · Sem alteração sua",
    ]);
    fireEvent.click(
      within(shown).getByRole("button", { name: "Salvar minhas alterações" }),
    );
    await waitFor(() => expect(dialog()).toBeNull());
    expect(writes).toEqual([
      { id: ID_A, patch: { title: "My title" }, expected: remote.updated_at },
    ]);
    expect(rows.get(ID_A)).toMatchObject({
      title: "My title",
      phase: "doing",
      description: "<p>Their description</p>",
    });
    // The form now shows the reviewed server fields next to the kept edit.
    expect(title().value).toBe("My title");
    await waitFor(() =>
      expect(
        document.querySelector(".tiptap[contenteditable=true]")?.textContent,
      ).toBe("Their description"),
    );
    expect(screen.getByRole("button", { name: "Fase: Fazendo" })).toBeTruthy();
    // Closing afterwards does not send the old description back.
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    await settle();
    expect(writes).toHaveLength(1);
  });

  it("composition and blur when the dialog opens keep keystrokes without writing", async () => {
    holdReads = true;
    await open(baseAction());
    const field = title();
    act(() => field.focus());
    fireEvent.compositionStart(field);
    fireEvent.change(field, { target: { value: "Compondo ação" } });
    remoteEdit(ID_A, { phase: "doing" });
    await releaseReads();
    await findDialog();
    // Focus moved to the dialog; the title's blur must not write.
    fireEvent.compositionEnd(field);
    fireEvent.blur(field);
    await settle();
    expect(writes).toEqual([]);
    expect(fieldNotes("Sua edição")[0]).toBe("Título · Alterado por você");
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(dialog()).toBeNull());
    expect(title().value).toBe("Compondo ação");
    expect(writes).toEqual([]);
  });

  it("text typed in the focused description editor survives its blur into the dialog", async () => {
    holdReads = true;
    await open(baseAction());
    const node = await waitFor(() => {
      const found = document.querySelector<HTMLElement>(
        ".tiptap[contenteditable=true]",
      );
      if (!found) throw new Error("Description editor did not mount");
      return found;
    });
    // The real editor instance; its update and blur callbacks are the drawer's.
    const editor = (
      node as HTMLElement & {
        editor?: {
          commands: {
            focus: (position: string) => boolean;
            insertContent: (value: string) => boolean;
          };
        };
      }
    ).editor;
    if (!editor) throw new Error("Editor instance unavailable");
    act(() => {
      editor.commands.focus("end");
      editor.commands.insertContent(" plus typed");
    });
    remoteEdit(ID_A, { title: "Their title" });
    await releaseReads();
    await findDialog();
    fireEvent.blur(node);
    await settle();
    expect(writes).toEqual([]);
    expect(fieldNotes("Sua edição")).toEqual([
      "Título · Sem alteração sua",
      "Descrição · Alterado por você",
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(dialog()).toBeNull());
    expect(node.textContent).toBe("Opened description plus typed");
    expect(writes).toEqual([]);
  });

  it("cancel keeps edits and the base; saves and closing stay guarded and reopen one comparison", async () => {
    holdReads = true;
    let closed = 0;
    const view = await open(baseAction());
    typeTitle("Unsent title");
    remoteEdit(ID_A, { phase: "doing" });
    await releaseReads();
    await findDialog();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(dialog()).toBeNull());
    expect(title().value).toBe("Unsent title");
    expect(screen.getByTestId("drawer-remote-version-banner")).toBeTruthy();
    // Blur-triggered autosave is paused.
    fireEvent.blur(title());
    await settle();
    expect(writes).toEqual([]);
    // Save asks for the decision again instead of writing.
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    await findDialog();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(dialog()).toBeNull());
    // Closing with unresolved edits is blocked and shows the comparison.
    await act(async () => {
      closed = (await view.panels().closeAllActions()) ? 1 : 0;
    });
    expect(closed).toBe(0);
    await findDialog();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(dialog()).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Comparar" }));
    await findDialog();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(writes).toEqual([]);
    expect(reads).toEqual([ID_A]);
  });

  it("accepting the server version discards local edits explicitly and updates the form", async () => {
    holdReads = true;
    await open(baseAction({ work_files: ["https://files.test/brief.png"] }));
    typeTitle("Discard me");
    remoteEdit(ID_A, {
      title: "Server title",
      description: "<p>Server description</p>",
      work_files: [],
    });
    await releaseReads();
    const shown = await findDialog();
    fireEvent.click(
      within(shown).getByRole("button", {
        name: "Descartar minhas alterações e usar a atual",
      }),
    );
    await waitFor(() => expect(dialog()).toBeNull());
    expect(title().value).toBe("Server title");
    await waitFor(() =>
      expect(
        document.querySelector(".tiptap[contenteditable=true]")?.textContent,
      ).toBe("Server description"),
    );
    expect(screen.queryAllByRole("link", { name: "Abrir anexo" })).toHaveLength(
      0,
    );
    expect(screen.queryByTestId("drawer-remote-version-banner")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    await settle();
    expect(writes).toEqual([]);
  });

  it("own save confirmation racing the read is not a conflict", async () => {
    holdReads = true;
    holdWrites = true;
    await open(baseAction());
    typeTitle("Saved by me");
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    await settle();
    expect(writes).toHaveLength(1);
    // The read ran before the write committed and returns the opening version.
    const before = structuredClone(rows.get(ID_A) as Action);
    await releaseWrites();
    await releaseReads({ row: before });
    expect(dialog()).toBeNull();
    expect(title().value).toBe("Saved by me");
  });

  it("a read answered while the save is in flight waits for its confirmation", async () => {
    holdReads = true;
    holdWrites = true;
    await open(baseAction());
    typeTitle("Saved by me");
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    await settle();
    // The read observed this user's own committed write.
    const ownVersion = {
      ...baseAction(),
      title: "Saved by me",
      updated_at: "2026-10-30T12:00:01.000001",
    };
    await releaseReads({ row: ownVersion });
    expect(dialog()).toBeNull();
    await releaseWrites();
    expect(rows.get(ID_A)?.updated_at).toBe(ownVersion.updated_at);
    expect(dialog()).toBeNull();
    expect(screen.queryByTestId("drawer-remote-version-banner")).toBeNull();
  });

  it("a stale read does not roll back or raise a conflict", async () => {
    const newer = baseAction({
      title: "Cached newer",
      updated_at: "2026-10-30T12:00:02",
    });
    // Cache already holds a version newer than the answer.
    await open(newer, baseAction());
    await settle();
    expect(dialog()).toBeNull();
    expect(title().value).toBe("Cached newer");
  });

  it("a newer conflict during resolution keeps the normal version check", async () => {
    holdReads = true;
    await open(baseAction());
    typeTitle("Mine");
    const reviewed = remoteEdit(ID_A, { phase: "doing" });
    await releaseReads();
    const shown = await findDialog();
    // Yet another change lands while the user is reviewing.
    remoteEdit(ID_A, { phase: "review" });
    fireEvent.click(
      within(shown).getByRole("button", { name: "Salvar minhas alterações" }),
    );
    await screen.findByTestId("drawer-conflict-banner");
    expect(writes).toEqual([
      { id: ID_A, patch: { title: "Mine" }, expected: reviewed.updated_at },
    ]);
    expect(rows.get(ID_A)?.title).toBe("Opened title");
    expect(title().value).toBe("Mine");
  });

  it("a failed read keeps the form editable and offers a retry", async () => {
    holdReads = true;
    await open(baseAction());
    await releaseReads({ error: { message: "Failed to fetch" } });
    await screen.findByText(/Não foi possível verificar se esta ação mudou/);
    expect(dialog()).toBeNull();
    typeTitle("Still editable");
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    await settle();
    expect(writes.at(-1)).toEqual({
      id: ID_A,
      patch: { title: "Still editable" },
      expected: V0,
    });
    // Retry is explicit and uses the same opening.
    remoteEdit(ID_A, { phase: "doing" });
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await settle();
    await releaseReads();
    await findDialog();
  });

  it("revoked access shows the inaccessible notice instead of trusting the cache", async () => {
    holdReads = true;
    await open(baseAction());
    rows.delete(ID_A);
    await releaseReads();
    const notice = await screen.findByTestId("drawer-unavailable-banner");
    expect(notice.getAttribute("role")).toBe("alert");
    expect(notice.textContent).toBe(
      "Esta ação não está disponível ou você não tem acesso a ela.",
    );
    expect(dialog()).toBeNull();
    expect(title().value).toBe("Opened title");
  });

  it("a read from a previous session is ignored", async () => {
    holdReads = true;
    const view = await open(baseAction());
    remoteEdit(ID_A, { phase: "doing" });
    act(() => resetQuerySession(view.client));
    await releaseReads();
    expect(dialog()).toBeNull();
    expect(screen.queryByTestId("drawer-remote-version-banner")).toBeNull();
  });

  it("drafts and refocusing an open action do not read again", async () => {
    const { id: _id, ...fields } = baseAction();
    const draft = { ...fields, title: "Draft" } as Action;
    await open(draft, null);
    await settle();
    expect(reads).toEqual([]);
    cleanup();
    const view = await open(baseAction());
    await settle();
    expect(reads).toEqual([ID_A]);
    await act(async () => {
      await view.panels().setPrimaryAction(baseAction());
    });
    await settle();
    expect(reads).toEqual([ID_A]);
  });

  it("replacing the panel ignores the previous action's read", async () => {
    holdReads = true;
    const view = await open(baseAction());
    rows.set(ID_B, baseAction({ id: ID_B, title: "Second action" }));
    await act(async () => {
      await view
        .panels()
        .setPrimaryAction(baseAction({ id: ID_B, title: "Second action" }));
    });
    remoteEdit(ID_A, { title: "Changed elsewhere" });
    await releaseReads();
    expect(reads).toEqual([ID_A, ID_B]);
    expect(dialog()).toBeNull();
    expect(title().value).toBe("Second action");
  });

  it("two actions keep their own comparison and identity", async () => {
    holdReads = true;
    const view = await open(baseAction());
    const second = baseAction({ id: ID_B, title: "Second action" });
    rows.set(ID_B, structuredClone(second));
    await act(async () => {
      await view.panels().setSecondaryAction(second);
    });
    remoteEdit(ID_A, { title: "Primary changed elsewhere" });
    await releaseReads();
    // The secondary is active and current; the primary waits for its turn.
    expect(dialog()).toBeNull();
    const tabs = screen.getByRole("tablist", { name: "Ações abertas" });
    fireEvent.click(within(tabs).getByRole("tab", { name: /Opened title/ }));
    const shown = await findDialog();
    expect(
      within(
        within(shown).getByRole("region", { name: "Versão atual" }),
      ).getByText("Primary changed elsewhere"),
    ).toBeTruthy();
    fireEvent.click(within(shown).getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(dialog()).toBeNull());
    fireEvent.click(within(tabs).getByRole("tab", { name: /Second action/ }));
    expect(dialog()).toBeNull();
    expect(title().value).toBe("Second action");
    expect(view.panels().secondaryAction?.currentAction.id).toBe(ID_B);
    expect(reads).toEqual([ID_A, ID_B]);
    expect(writes).toEqual([]);
  });

  it("a change after the read is still caught by the save version check", async () => {
    await open(baseAction());
    await settle();
    expect(dialog()).toBeNull();
    remoteEdit(ID_A, { phase: "doing" });
    typeTitle("Late edit");
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    await screen.findByTestId("drawer-conflict-banner");
    expect(rows.get(ID_A)?.title).toBe("Opened title");
  });

  it("an unavailable action stops writes and is left only through an explicit discard", async () => {
    holdReads = true;
    const view = await open(baseAction());
    typeTitle("Edit nobody can save");
    rows.delete(ID_A);
    await releaseReads();
    await screen.findByTestId("drawer-unavailable-banner");
    fireEvent.blur(title());
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    await settle();
    expect(writes).toEqual([]);
    answerConfirm(false);
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    await settle();
    expect(confirmMessages).toHaveLength(1);
    expect(confirmMessages[0]).toContain("Descartar as alterações não salvas");
    expect(title().value).toBe("Edit nobody can save");
    expect(view.panels().primaryAction).not.toBeNull();
    answerConfirm(true);
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    await settle();
    expect(view.panels().primaryAction).toBeNull();
    expect(writes).toEqual([]);
  });

  it("a save rejected after access was revoked can still be discarded and closed", async () => {
    const view = await open(baseAction());
    await settle();
    rows.delete(ID_A);
    typeTitle("Rejected edit");
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    await screen.findByTestId("drawer-conflict-banner");
    fireEvent.click(screen.getByRole("button", { name: "Comparar e salvar" }));
    await screen.findByTestId("drawer-unavailable-banner");
    expect(dialog()).toBeNull();
    answerConfirm(true);
    await act(async () => {
      expect(await view.panels().closeAllActions()).toBe(true);
    });
    expect(view.panels().primaryAction).toBeNull();
    expect(writes).toHaveLength(1);
  });

  it("stored HTML the editors reformat is not a local change when the dialog takes focus", async () => {
    holdReads = true;
    await open(baseAction({ description: "<p>a</p>\n<hr />" }));
    tiptap(await editorNode()).commands.focus("end");
    remoteEdit(ID_A, { title: "Their title" });
    await releaseReads();
    const shown = await findDialog();
    fireEvent.blur(await editorNode());
    await settle();
    expect(fieldNotes("Versão aberta")).toEqual(["Título · Sem alteração sua"]);
    expect(
      within(shown).queryByRole("button", { name: "Salvar minhas alterações" }),
    ).toBeNull();
    expect(
      within(shown).getByRole("button", { name: "Usar versão atual" }),
    ).toBeTruthy();
    expect(writes).toEqual([]);
  });

  it("the Instagram content editor does not turn reformatted HTML into an edit", async () => {
    holdReads = true;
    await open(
      baseAction({ category: "post", content_description: "<p>b</p>\n<hr />" }),
    );
    fireEvent.click(screen.getByRole("tab", { name: "INSTAGRAM" }));
    const node = await editorNode();
    tiptap(node).commands.focus("end");
    remoteEdit(ID_A, { title: "Their title" });
    await releaseReads();
    const shown = await findDialog();
    fireEvent.blur(node);
    await settle();
    expect(fieldNotes("Versão aberta")).toEqual(["Título · Sem alteração sua"]);
    expect(
      within(shown).queryByRole("button", { name: "Salvar minhas alterações" }),
    ).toBeNull();
    expect(writes).toEqual([]);
  });

  it("keeping edits against an older snapshot moves on to the newer known version", async () => {
    holdReads = true;
    await open(baseAction());
    typeTitle("Mine");
    remoteEdit(ID_A, { phase: "doing" });
    await conflictThenCompare();
    // The comparison read answers first; the opening read is still pending.
    await releaseRead(1);
    await findDialog();
    const newer = remoteEdit(ID_A, { category: "post" });
    await releaseRead(0);
    fireEvent.click(
      screen.getByRole("button", { name: "Salvar minhas alterações" }),
    );
    await settle();
    // Nothing is written over the newer version; its comparison is shown.
    expect(writes).toHaveLength(1);
    expect(fieldNotes("Versão atual")).toEqual([
      "Título · Sem mudança no servidor",
      "Tipo · Mudou no servidor",
    ]);
    fireEvent.click(
      screen.getByRole("button", { name: "Salvar minhas alterações" }),
    );
    await waitFor(() => expect(dialog()).toBeNull());
    expect(writes.at(-1)).toEqual({
      id: ID_A,
      patch: { title: "Mine" },
      expected: newer.updated_at,
    });
  });

  it("accepting an older snapshot keeps the newer known version for its own decision", async () => {
    holdReads = true;
    await open(baseAction());
    typeTitle("Mine");
    remoteEdit(ID_A, { phase: "doing" });
    await conflictThenCompare();
    await releaseRead(1);
    await findDialog();
    remoteEdit(ID_A, { category: "post" });
    await releaseRead(0);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Descartar minhas alterações e usar a atual",
      }),
    );
    await settle();
    const shown = await findDialog();
    expect(fieldNotes("Versão atual")).toEqual(["Tipo · Mudou no servidor"]);
    expect(
      within(shown).getByRole("button", { name: "Usar versão atual" }),
    ).toBeTruthy();
    expect(writes).toHaveLength(1);
  });

  it("a newer read updates scoped lists and refreshes lists of unknown scope", async () => {
    holdReads = true;
    const view = await open(baseAction());
    const scoped = QUERY_KEYS.actions.list(
      "home",
      "test-user",
      true,
      ["agency"],
      "2026-10-01 00:00:00",
      "2026-12-31 23:59:59",
    );
    const unknown = QUERY_KEYS.actions.home("test-user");
    view.client.setQueryData(scoped, [baseAction()]);
    view.client.setQueryData(unknown, [baseAction()]);
    remoteEdit(ID_A, { title: "Changed elsewhere" });
    await releaseReads();
    await findDialog();
    expect(
      view.client.getQueryData<Action[]>(scoped)?.map((row) => row.title),
    ).toEqual(["Changed elsewhere"]);
    expect(view.client.getQueryState(scoped)?.isInvalidated).toBe(false);
    expect(view.client.getQueryState(unknown)?.isInvalidated).toBe(true);
  });

  it("accepting a version returns focus to the remounted editor", async () => {
    holdReads = true;
    await open(baseAction());
    tiptap(await editorNode()).commands.focus("end");
    remoteEdit(ID_A, { description: "<p>Server text</p>" });
    await releaseReads();
    const shown = await findDialog();
    fireEvent.click(
      within(shown).getByRole("button", { name: "Usar versão atual" }),
    );
    await waitFor(() => expect(dialog()).toBeNull());
    await waitFor(() => {
      const active = document.activeElement;
      expect(active?.classList.contains("tiptap")).toBe(true);
      expect(active?.isConnected).toBe(true);
      expect(active?.textContent).toBe("Server text");
    });
  });
});
