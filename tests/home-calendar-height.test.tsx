import { afterEach, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { format, startOfWeek } from "date-fns";
import userEvent from "@testing-library/user-event";
import { HomeCalendarView } from "~/components/features/home/HomeCalendarView";
import { CalendarTestProviders } from "./fixtures/calendar-height";

afterEach(cleanup);
if (!("CSS" in globalThis))
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });

function renderHomeCalendar() {
  const rootRoute = createRootRoute({
    component: () => (
      <CalendarTestProviders>
        <HomeCalendarView actions={[]} setPrimaryAction={() => {}} />
      </CalendarTestProviders>
    ),
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  render(<RouterProvider router={router} />);
}

it("starts the week limited and month automatic, preserving each user choice", async () => {
  const user = userEvent.setup();
  renderHomeCalendar();
  await screen.findByRole("button", { name: "Visualizar" });
  async function option() {
    await user.click(screen.getByRole("button", { name: "Visualizar" }));
    return await screen.findByRole("menuitemcheckbox", {
      name: "Limitar altura dos dias",
    });
  }
  expect((await option()).getAttribute("aria-checked")).toBe("true");
  await user.click(
    screen.getByRole("menuitemcheckbox", { name: "Limitar altura dos dias" }),
  );
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("radio", { name: "Mês" }));
  expect((await option()).getAttribute("aria-checked")).toBe("false");
  await user.click(
    screen.getByRole("menuitemcheckbox", { name: "Limitar altura dos dias" }),
  );
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("radio", { name: "Semana" }));
  expect((await option()).getAttribute("aria-checked")).toBe("false");
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("radio", { name: "Mês" }));
  expect((await option()).getAttribute("aria-checked")).toBe("true");
});

it("links each home calendar day to its date in both week and month views", async () => {
  const user = userEvent.setup();
  renderHomeCalendar();
  const day = startOfWeek(new Date());
  const name = `Ver ações de ${format(day, "dd/MM/yyyy")}`;
  const link = await screen.findByRole("link", { name });
  expect(link.getAttribute("href")).toBe(
    `/app/today?date=${format(day, "yyyy-MM-dd")}`,
  );
  expect(screen.getAllByRole("link").length).toBe(7);
  await user.click(screen.getByRole("radio", { name: "Mês" }));
  expect(screen.getAllByRole("link").length).toBeGreaterThan(7);
  for (const dayLink of screen.getAllByRole("link")) {
    const date = dayLink.getAttribute("aria-label")?.slice(-10);
    const [dayPart, month, year] = date?.split("/") ?? [];
    expect(dayLink.getAttribute("href")).toBe(
      `/app/today?date=${year}-${month}-${dayPart}`,
    );
  }
});
