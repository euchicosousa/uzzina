import { afterEach, expect, it } from "bun:test";
import { CalendarDate } from "@internationalized/date";
import { cleanup, render } from "@testing-library/react";
import { I18nProvider } from "react-aria";
import { PrismCalendar } from "~/components/prism";

afterEach(cleanup);

it("tabs through the dropdown caption in visual order: previous, month, year, next", () => {
  render(
    <I18nProvider locale="pt-BR">
      <PrismCalendar
        aria-label="Data"
        captionLayout="dropdown"
        defaultValue={new CalendarDate(2026, 10, 28)}
      />
    </I18nProvider>,
  );
  const order = Array.from(
    document.querySelectorAll<HTMLButtonElement>("button:not([tabindex='-1'])"),
  ).map(
    (button) => button.getAttribute("aria-label") ?? button.textContent?.trim(),
  );
  expect(order.slice(0, 4)).toEqual(["Anterior", "mês", "ano", "Próximo"]);
});
