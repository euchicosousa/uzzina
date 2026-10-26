import { afterEach, expect, it } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { format } from "date-fns";
import { CalendarActions } from "~/components/features/Calendar";
import {
  CalendarTestProviders,
  calendarAction,
} from "./fixtures/calendar-height";

afterEach(cleanup);
it("turns an action red when its date passes while it stays on screen", async () => {
  const dueAt = new Date(Date.now() + 2000);
  const action = calendarAction(1, {
    date: format(dueAt, "yyyy-MM-dd HH:mm:ss"),
  });
  const { container } = render(
    <CalendarTestProviders>
      <CalendarActions
        calendar={[{ date: dueAt, actions: [action] }]}
        viewOptions={{ variant: "line", late: true, showOptions: {} }}
      />
    </CalendarTestProviders>,
  );
  const item = () => container.querySelector(`[data-action-id="${action.id}"]`);
  expect(item()?.className).not.toContain("bg-late");
  await waitFor(() => expect(item()?.className).toContain("bg-late"), {
    timeout: 3500,
  });
});
