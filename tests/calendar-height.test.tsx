import { afterEach, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { CalendarActions } from "~/components/features/Calendar";
import {
  CalendarTestProviders,
  calendarAction,
} from "./fixtures/calendar-height";

afterEach(cleanup);
it("renders every action in a monthly calendar instead of truncating after five", () => {
  render(
    <CalendarTestProviders>
      <CalendarActions
        calendar={[
          {
            date: new Date(2026, 9, 16),
            actions: Array.from({ length: 7 }, (_, i) => calendarAction(i)),
          },
        ]}
        viewOptions={{ variant: "line", showOptions: {} }}
      />
    </CalendarTestProviders>,
  );
  expect(screen.getByText("Action 6")).toBeTruthy();
});

it("keeps all actions in both content groups", () => {
  render(
    <CalendarTestProviders>
      <CalendarActions
        calendar={[
          {
            date: new Date(2026, 9, 16),
            actions: Array.from({ length: 14 }, (_, i) =>
              calendarAction(i, { category: i % 2 ? "post" : "design" }),
            ),
          },
        ]}
        viewOptions={{ variant: "content", limitHeight: true, showOptions: {} }}
      />
    </CalendarTestProviders>,
  );
  expect(screen.getByText("Action 12")).toBeTruthy();
  expect(screen.getByText("Action 13")).toBeTruthy();
  expect(screen.getAllByLabelText("Ações de 16/10/2026")).toHaveLength(1);
});

it("reserves AppBar space after the last week only when asked", () => {
  const calendar = [{ date: new Date(2026, 9, 16), actions: [] }];
  const viewOptions = { variant: "line", showOptions: {} } as const;
  const { container, rerender } = render(
    <CalendarTestProviders>
      <CalendarActions calendar={calendar} viewOptions={viewOptions} />
    </CalendarTestProviders>,
  );
  expect(container.querySelector("[data-app-bar-spacer]")).toBeNull();
  rerender(
    <CalendarTestProviders>
      <CalendarActions
        calendar={calendar}
        layoutOptions={{ reserveAppBarSpace: true }}
        viewOptions={viewOptions}
      />
    </CalendarTestProviders>,
  );
  const spacer = container.querySelector("[data-app-bar-spacer]");
  expect(spacer?.previousElementSibling?.className).toContain("grid-cols-7");
});
