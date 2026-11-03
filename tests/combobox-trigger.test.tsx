import "./dom-setup";
import { afterEach, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComboboxTrigger } from "~/components/features/ComboboxTrigger";
afterEach(cleanup);
it("maps disabled footer triggers to React Aria and excludes them from activation and Tab", async () => {
  let presses = 0;
  render(
    <>
      <button type="button">Before</button>
      <ComboboxTrigger
        variant="ghost"
        size="icon-lg"
        disabled
        onPress={() => presses++}
      >
        Disabled
      </ComboboxTrigger>
      <button type="button">After</button>
    </>,
  );
  const disabled = screen.getByRole("button", { name: "Disabled" });
  expect(disabled.hasAttribute("disabled")).toBe(true);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Before" }));
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "After" }),
  );
  expect(presses).toBe(0);
});
