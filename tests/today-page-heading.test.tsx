import { afterEach, beforeEach, expect, it, setSystemTime } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContext } from "~/contexts/AppContext";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";
import { HomeTodayView } from "~/components/features/home/HomeTodayView";
import { TodayPageView } from "~/components/features/today/TodayPageView";
import { calendarPerson } from "./fixtures/calendar-height";

if (!("ResizeObserver" in globalThis)) {
  Object.assign(globalThis, {
    ResizeObserver: class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  });
}
if (!window.matchMedia) {
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
}

beforeEach(() => setSystemTime(new Date(2026, 9, 29, 12)));
afterEach(() => {
  cleanup();
  setSystemTime();
});

function wrap(children: React.ReactNode) {
  return (
    <QueryClientProvider client={new QueryClient()}>
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
    </QueryClientProvider>
  );
}

function renderPage(day: Date) {
  render(
    wrap(
      <TodayPageView
        actions={[]}
        currentDay={day}
        onCurrentDayChange={() => {}}
      />,
    ),
  );
  return screen.getByRole("heading", { level: 1 });
}

it("names today's date on both responsive variants", () => {
  const heading = renderPage(new Date(2026, 9, 29, 9));
  expect(heading.textContent).toContain("Hoje, quinta-feira, 29 de outubro");
  expect(heading.textContent).toContain("Hoje, 29 out.");
});

it("shows weekday and date for another day", () => {
  const heading = renderPage(new Date(2026, 10, 25, 9));
  expect(heading.textContent).toContain("Quarta-feira, 25 de novembro");
  expect(heading.textContent).toContain("Qua., 25 nov.");
  expect(heading.textContent).not.toContain("Hoje");
});

it("adds the year only when it differs from the current one", () => {
  const heading = renderPage(new Date(2027, 10, 25, 9));
  expect(heading.textContent).toContain("Quinta-feira, 25 de novembro de 2027");
  expect(heading.textContent).toContain("Qui., 25 nov. 2027");
});

it("hides exactly one variant at each breakpoint", () => {
  const heading = renderPage(new Date(2026, 10, 25, 9));
  const [narrow, wide] = Array.from(heading.children);
  expect(narrow?.className).toContain("md:hidden");
  expect(wide?.className).toContain("hidden");
  expect(wide?.className).toContain("md:inline");
});

it("does not say today in the empty state of another day", () => {
  renderPage(new Date(2026, 10, 25, 9));
  expect(screen.getByText("Nenhuma ação para este dia.")).toBeTruthy();
  expect(screen.queryByText("Nenhuma ação para hoje.")).toBeNull();
});

it("keeps the empty state for today", () => {
  renderPage(new Date(2026, 9, 29, 9));
  expect(screen.getByText("Nenhuma ação para hoje.")).toBeTruthy();
});

it("keeps the Home title short for today and the long form for another day", () => {
  render(
    wrap(<HomeTodayView actions={[]} currentDay={new Date(2026, 9, 29, 9)} />),
  );
  expect(screen.getByRole("heading", { name: "Hoje" })).toBeTruthy();
  cleanup();
  render(
    wrap(<HomeTodayView actions={[]} currentDay={new Date(2026, 10, 25, 9)} />),
  );
  expect(screen.getByText("Quarta-feira, 25 de novembro")).toBeTruthy();
});
