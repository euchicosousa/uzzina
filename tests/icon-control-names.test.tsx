import { afterEach, expect, it, mock } from "bun:test";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { AppContext } from "~/contexts/AppContext";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";
import { AppThemeProvider } from "~/hooks/useAppTheme";
import { CalendarToolbar } from "~/components/features/CalendarToolbar";
import { ClientCalendar } from "~/components/client/ClientCalendar";
import { AppBar } from "~/components/layout/AppBar";
import { calendarPerson } from "./fixtures/calendar-height";

let passwordWrites = 0;
// Auth is controlled only at its external boundary; routes and controls are real.
mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: "test-user" } } },
      }),
      signInWithPassword: async () => {
        passwordWrites++;
        return { error: null };
      },
      updateUser: async () => {
        passwordWrites++;
        return { error: null };
      },
    },
  }),
}));
const { Route: LoginRoute } = await import("~/routes/login");
const { Route: ResetRoute } = await import("~/routes/reset-password");
const { Header } = await import("~/components/layout/Header");
Object.assign(globalThis, {
  MouseEvent: window.MouseEvent,
  localStorage: window.localStorage,
  scrollTo() {},
});
if (!("CSS" in globalThis))
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });
if (!("ResizeObserver" in globalThis))
  Object.assign(globalThis, {
    ResizeObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
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
afterEach(() => {
  cleanup();
  passwordWrites = 0;
  localStorage.clear();
});

async function mount(children: ReactNode, path = "/app") {
  const client = new QueryClient({
    defaultOptions: { queries: { enabled: false, retry: false } },
  });
  const root = createRootRoute({
    component: () => (
      <QueryClientProvider client={client}>
        <AppThemeProvider>
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
            <MultiSelectionProvider>{children}</MultiSelectionProvider>
          </AppContext.Provider>
        </AppThemeProvider>
      </QueryClientProvider>
    ),
  });
  root.addChildren(
    ["/app", "/app/profile"].map((path) =>
      createRoute({ getParentRoute: () => root, path, component: () => null }),
    ),
  );
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await act(async () => {
    render(<RouterProvider router={router} />);
    await router.load();
  });
  return router;
}

for (const [label, Route, field] of [
  ["login", LoginRoute, "Senha"],
  ["recovery", ResetRoute, "Nova Senha"],
] as const) {
  it(`${label} names the current password visibility action and keeps keyboard activation out of submit`, async () => {
    const Component = Route.options.component;
    if (!Component) throw new Error("Missing route component");
    await mount(<Component />);
    const input = await screen.findByLabelText(field, { exact: true });
    const user = userEvent.setup();
    await user.type(input, "fixture-password");
    const show = screen.getByRole("button", {
      name: "Mostrar senha",
    });
    expect(show.getAttribute("type")).toBe("button");
    act(() => show.focus());
    await user.keyboard("{Enter}");
    const hide = screen.getByRole("button", {
      name: "Ocultar senha",
    });
    expect(input.getAttribute("type")).toBe("text");
    expect(input).toHaveProperty("value", "fixture-password");
    expect(screen.queryByRole("button", { name: "Mostrar senha" })).toBeNull();
    act(() => hide.focus());
    await user.keyboard(" ");
    expect(input.getAttribute("type")).toBe("password");
    expect(passwordWrites).toBe(0);
  });
}

it.each([
  { days: 1, previous: "Dia anterior", next: "Próximo dia", expected: 15 },
  { days: 7, previous: "Voltar 7 dias", next: "Avançar 7 dias", expected: 9 },
  {
    days: 30,
    previous: "Voltar 30 dias",
    next: "Avançar 30 dias",
    expected: 16,
  },
])(
  "team calendar names the actual $days-day navigation without changing its interval",
  async ({ days, previous, next, expected }) => {
    const changes: Date[] = [];
    function Fixture() {
      const [day, setDay] = useState(new Date(2026, 9, 16));
      return (
        <CalendarToolbar
          days={days}
          currentDay={day}
          setCurrentDay={(value) => {
            changes.push(value);
            setDay(value);
          }}
        />
      );
    }
    await mount(<Fixture />);
    const user = userEvent.setup();
    act(() => screen.getByRole("button", { name: previous }).focus());
    await user.keyboard("{Enter}");
    expect(changes[0]?.getDate()).toBe(expected);
    await user.click(screen.getByRole("button", { name: next }));
    expect(changes[1]?.getDate()).toBe(16);
    expect(changes[1]?.getMonth()).toBe(9);
  },
);
it("the date trigger retains its visible month in its name and returns focus after Escape", async () => {
  await mount(
    <CalendarToolbar
      currentDay={new Date(2026, 9, 16)}
      setCurrentDay={() => {}}
      showDate
    />,
  );
  const trigger = screen.getByRole("button", {
    name: "Escolher data, outubro/26",
  });
  act(() => trigger.focus());
  const user = userEvent.setup();
  await user.keyboard("{Enter}");
  expect(await screen.findByRole("grid")).toBeTruthy();
  await user.keyboard("{Escape}");
  await waitFor(() => expect(document.activeElement === trigger).toBe(true));
});
it.each(["week", "month"] as const)(
  "portal calendar names the %s navigation and keeps callbacks singular",
  async (view) => {
    let previous = 0;
    let next = 0;
    await mount(
      <ClientCalendar
        actions={[]}
        currentDay={new Date(2026, 9, 16)}
        view={view}
        onPrev={() => previous++}
        onNext={() => next++}
        onActionClick={() => {}}
      />,
    );
    const user = userEvent.setup();
    const prev = screen.getByRole("button", {
      name: view === "week" ? "Semana anterior" : "Mês anterior",
    });
    act(() => prev.focus());
    await user.keyboard("{Enter}");
    await user.click(
      screen.getByRole("button", {
        name: view === "week" ? "Próxima semana" : "Próximo mês",
      }),
    );
    expect(previous).toBe(1);
    expect(next).toBe(1);
  },
);
it("AppBar names selection/search and retains their activation and state", async () => {
  const searches: boolean[] = [];
  await mount(
    <AppBar
      partners={[]}
      person={calendarPerson}
      setPrimaryAction={() => {}}
      setOpenCmdK={(open) => searches.push(open)}
      partnerFilters={[]}
      setPartnerFilters={() => {}}
    />,
  );
  expect(screen.getAllByRole("link", { name: "Início" })).toHaveLength(1);
  const user = userEvent.setup();
  act(() =>
    screen.getByRole("button", { name: "Ativar seleção de ações" }).focus(),
  );
  await user.keyboard(" ");
  await user.click(
    screen.getByRole("button", {
      name: "Encerrar seleção de ações",
    }),
  );
  expect(
    screen.getByRole("button", {
      name: "Ativar seleção de ações",
    }),
  ).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Buscar ações" }));
  expect(searches).toEqual([true]);
});
it("AppBar names its partner trigger and filter toggle without changing pressed semantics", async () => {
  await mount(
    <AppBar
      partners={[]}
      person={calendarPerson}
      setPrimaryAction={() => {}}
      setOpenCmdK={() => {}}
      partnerFilters={[]}
      setPartnerFilters={() => {}}
    />,
  );
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", {
    name: "Selecionar parceiro",
  });
  act(() => trigger.focus());
  await user.keyboard("{Enter}");
  const filter = await screen.findByRole("button", {
    name: "Filtrar ações por parceiro",
  });
  expect(filter.getAttribute("aria-pressed")).toBe("false");
  await user.click(filter);
  expect(filter.getAttribute("aria-pressed")).toBe("true");
  await user.keyboard("{Escape}");
  await waitFor(() => expect(document.activeElement === trigger).toBe(true));
});
it("the named header logo still honors the existing leave guard", async () => {
  let leaves = 0;
  const router = await mount(
    <Header
      person={calendarPerson}
      setPrimaryAction={async () => true}
      onBeforeLeave={async () => {
        leaves++;
        return false;
      }}
    />,
    "/app/profile",
  );
  const logo = screen.getByRole("link", {
    name: "Ir para o início da UZZINA",
  });
  expect(logo.getAttribute("href")).toBe("/app");
  act(() => logo.focus());
  await userEvent.setup().keyboard("{Enter}");
  await waitFor(() => expect(leaves).toBe(1));
  expect(router.state.location.pathname).toBe("/app/profile");
});
