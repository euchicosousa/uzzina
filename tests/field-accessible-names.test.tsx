import { afterEach, expect, it, mock } from "bun:test";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  type RouteComponent,
} from "@tanstack/react-router";
import { AppContext } from "~/contexts/AppContext";
import { CommentInput } from "~/components/features/ActionComments/CommentInput";
import { calendarPerson } from "./fixtures/calendar-height";

// Real routes/editors run with queries disabled; no test input reaches a backend.
mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => ({
    from: () => {
      throw new Error("Unexpected backend access");
    },
  }),
}));
const { Route: CelebrationsRoute } =
  await import("~/routes/app/admin/celebrations");
const { Route: PartnerRoute } =
  await import("~/routes/app/admin/partner/$slug");
Object.assign(globalThis, {
  MouseEvent: window.MouseEvent,
  KeyboardEvent: window.KeyboardEvent,
  scrollTo() {},
});
Object.assign(window.Range.prototype, {
  getClientRects: () => [],
  getBoundingClientRect: () => new window.DOMRect(),
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
afterEach(cleanup);

async function mountRoute(
  component: RouteComponent,
  path: string,
  entry: string,
) {
  const client = new QueryClient({
    defaultOptions: { queries: { enabled: false, retry: false } },
  });
  const root = createRootRoute();
  const route = createRoute({ getParentRoute: () => root, path, component });
  const router = createRouter({
    routeTree: root.addChildren([route]),
    history: createMemoryHistory({ initialEntries: [entry] }),
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
            setPrimaryAction() {},
            partnerFilters: [],
            setPartnerFilters() {},
          }}
        >
          <RouterProvider router={router} />
        </AppContext.Provider>
      </QueryClientProvider>,
    );
    await router.load();
  });
}

it("names the celebration creation field without replacing its placeholder or keyboard input", async () => {
  const component = CelebrationsRoute.options.component;
  if (!component) throw new Error("Missing route component");
  await mountRoute(
    component,
    "/app/admin/celebrations",
    "/app/admin/celebrations",
  );
  const field = await screen.findByRole("textbox", {
    name: "Nome do feriado/data",
  });
  expect(field.getAttribute("placeholder")).toBe("Nome do feriado/data");
  act(() => field.focus());
  await userEvent.setup().keyboard("Data de teste");
  expect(field).toHaveProperty("value", "Data de teste");
});

it("names the actual portal observation field and preserves keyboard sending", async () => {
  const sends: unknown[][] = [];
  function Fixture() {
    const [value, setValue] = useState("");
    return (
      <CommentInput
        value={value}
        onChange={setValue}
        onSend={(...args) => sends.push(args)}
        initialIsInternal={false}
      />
    );
  }
  render(<Fixture />);
  const field = screen.getByRole("textbox", { name: "Observação" });
  expect(field.getAttribute("placeholder")).toBe("Escreva uma observação...");
  act(() => field.focus());
  const user = userEvent.setup();
  await user.keyboard("Comentário de teste{Control>}{Enter}{/Control}");
  expect(sends).toEqual([["Comentário de teste", [], false]]);
});

it("partner labels identify and focus separate live editors, retaining identity and unsaved text", async () => {
  const component = PartnerRoute.options.component;
  if (!component) throw new Error("Missing route component");
  await mountRoute(
    component,
    "/app/admin/partner/$slug",
    "/app/admin/partner/new",
  );
  const context = await screen.findByRole("textbox", { name: "Contexto" });
  const voice = screen.getByRole("textbox", { name: "Tom de Voz" });
  expect(context.getAttribute("contenteditable")).toBe("true");
  expect(voice.getAttribute("contenteditable")).toBe("true");
  expect(context.getAttribute("aria-multiline")).toBe("true");
  expect(context.id).not.toBe(voice.id);
  expect(document.querySelectorAll(`#${context.id}`)).toHaveLength(1);
  expect(document.querySelectorAll(`#${voice.id}`)).toHaveLength(1);
  const user = userEvent.setup();
  await user.click(screen.getByText("Contexto", { selector: "label" }));
  expect(document.activeElement === context).toBe(true);
  await user.keyboard("Contexto de teste");
  await user.click(screen.getByText("Tom de Voz", { selector: "label" }));
  expect(document.activeElement === voice).toBe(true);
  await user.keyboard("Tom de teste");
  await user.click(screen.getByText("Contexto", { selector: "label" }));
  await waitFor(() =>
    expect(context.textContent).toContain("Contexto de teste"),
  );
  expect(voice.textContent).toContain("Tom de teste");
  const storedContext = document.querySelector<HTMLInputElement>(
    'input[name="context"]',
  );
  const storedVoice = document.querySelector<HTMLInputElement>(
    'input[name="voice"]',
  );
  expect(storedContext?.type).toBe("hidden");
  expect(storedVoice?.type).toBe("hidden");
  expect(storedContext?.value).toContain("Contexto de teste");
  expect(storedVoice?.value).toContain("Tom de teste");
  expect(screen.getByRole("textbox", { name: "Contexto" }) === context).toBe(
    true,
  );
  expect(screen.getByRole("textbox", { name: "Tom de Voz" }) === voice).toBe(
    true,
  );
});
