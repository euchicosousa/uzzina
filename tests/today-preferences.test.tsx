import { afterEach, expect, it } from "bun:test";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContext } from "~/contexts/AppContext";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";
import { getUserPreferences } from "~/lib/preferences";
import { HomeTodayView } from "~/components/features/home/HomeTodayView";
import { TodayPageView } from "~/components/features/today/TodayPageView";
import { calendarPerson } from "./fixtures/calendar-height";
import type { Person } from "~/types";
import type { Json } from "../types/database";

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
afterEach(cleanup);
const modes = ["partners", "kanban", "categories", "feed"] as const;
const labels = {
  partners: "Visão por Parceiros",
  kanban: "Visão por Kanban",
  categories: "Visão por Categorias",
  feed: "Visão por Feed",
};
const day = new Date(2026, 9, 28, 12);

function fixture(person: Person, date = day) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AppContext.Provider
        key={person.user_id}
        value={{
          person,
          partners: [],
          cloudName: "test",
          uploadPreset: "test",
          setPrimaryAction() {},
          partnerFilters: [],
          setPartnerFilters() {},
        }}
      >
        <MultiSelectionProvider>
          <section aria-label="Home fixture">
            <HomeTodayView actions={[]} currentDay={date} />
          </section>
          <section aria-label="Today fixture">
            <TodayPageView
              actions={[]}
              currentDay={date}
              onCurrentDayChange={() => {}}
            />
          </section>
        </MultiSelectionProvider>
      </AppContext.Provider>
    </QueryClientProvider>
  );
}
for (const mode of modes) {
  it(`initializes both real Today contexts from saved ${mode}`, () => {
    const person = {
      ...calendarPerson,
      preferences: { defaultTodayView: mode },
    };
    render(fixture(person));
    for (const name of ["Home fixture", "Today fixture"]) {
      expect(
        within(screen.getByRole("region", { name }))
          .getByRole("radio", { name: labels[mode] })
          .getAttribute("aria-checked"),
      ).toBe("true");
    }
    expect(getUserPreferences(person).defaultTodayView).toBe(mode);
  });
}
for (const value of [undefined, null, "wrong", 42, [], {}, true]) {
  it(`falls back to partners for invalid or missing saved mode ${JSON.stringify(value)}`, () => {
    const prefs: Json = value === undefined ? {} : { defaultTodayView: value };
    expect(getUserPreferences({ preferences: prefs }).defaultTodayView).toBe(
      "partners",
    );
    render(fixture({ ...calendarPerson, preferences: prefs }));
    expect(
      screen
        .getAllByRole("radio", { name: labels.partners })
        .every((e) => e.getAttribute("aria-checked") === "true"),
    ).toBe(true);
  });
}
it("keeps manual modes local across date/data/preferences updates and uses the new default only on remount", async () => {
  const person: Person = {
    ...calendarPerson,
    preferences: { defaultTodayView: "kanban", futureKey: "preserve" },
  };
  const view = render(fixture(person));
  const user = userEvent.setup();
  await user.click(
    within(screen.getByRole("region", { name: "Home fixture" })).getByRole(
      "radio",
      { name: labels.categories },
    ),
  );
  await user.click(
    within(screen.getByRole("region", { name: "Today fixture" })).getByRole(
      "radio",
      { name: labels.feed },
    ),
  );
  expect(person.preferences).toEqual({
    defaultTodayView: "kanban",
    futureKey: "preserve",
  });
  person.preferences = { defaultTodayView: "partners", theme: "dark" };
  view.rerender(fixture(person, new Date(2026, 9, 29, 12)));
  expect(
    within(screen.getByRole("region", { name: "Home fixture" }))
      .getByRole("radio", { name: labels.categories })
      .getAttribute("aria-checked"),
  ).toBe("true");
  expect(
    within(screen.getByRole("region", { name: "Today fixture" }))
      .getByRole("radio", { name: labels.feed })
      .getAttribute("aria-checked"),
  ).toBe("true");
  view.unmount();
  render(fixture(person));
  expect(
    screen
      .getAllByRole("radio", { name: labels.partners })
      .every((e) => e.getAttribute("aria-checked") === "true"),
  ).toBe(true);
});
it("a new account initializes from its own default instead of the previous manual mode", async () => {
  const person: Person = {
    ...calendarPerson,
    preferences: { defaultTodayView: "kanban" },
  };
  const view = render(fixture(person));
  await userEvent
    .setup()
    .click(
      within(screen.getByRole("region", { name: "Home fixture" })).getByRole(
        "radio",
        { name: labels.feed },
      ),
    );
  view.rerender(
    fixture({
      ...person,
      user_id: "another-user",
      preferences: { defaultTodayView: "categories" },
    }),
  );
  expect(
    screen
      .getAllByRole("radio", { name: labels.categories })
      .every((e) => e.getAttribute("aria-checked") === "true"),
  ).toBe(true);
});
