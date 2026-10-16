import { afterEach, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeCalendarView } from "~/components/features/home/HomeCalendarView";
import { CalendarTestProviders } from "./fixtures/calendar-height";

afterEach(cleanup);
if (!("CSS" in globalThis))
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });

it("starts the week limited and month automatic, preserving each user choice", async () => {
  const user = userEvent.setup();
  render(
    <CalendarTestProviders>
      <HomeCalendarView actions={[]} setBaseAction={() => {}} />
    </CalendarTestProviders>,
  );
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
