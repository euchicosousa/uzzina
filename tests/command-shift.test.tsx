import "./dom-setup";
import { afterEach, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  PrismCommand,
  PrismCommandInput,
  PrismCommandItem,
  PrismCommandList,
} from "../app/components/prism/command";

if (!("CSS" in globalThis)) {
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });
}
Object.assign(globalThis, {
  KeyboardEvent: window.KeyboardEvent,
  MouseEvent: window.MouseEvent,
  PointerEvent: window.MouseEvent,
});
afterEach(cleanup);

function Selection({ search = true }: { search?: boolean }) {
  const [selected, setSelected] = useState(["One", "Two", "Three"]);
  return (
    <PrismCommand>
      {search && <PrismCommandInput placeholder="Find option" />}
      <PrismCommandList aria-label="Options">
        {["One", "Two", "Three", "Four"].map((name) => (
          <PrismCommandItem
            key={name}
            id={name}
            textValue={name}
            onAction={({ shiftKey }) => {
              setSelected((previous) =>
                shiftKey
                  ? [name]
                  : previous.includes(name)
                    ? previous.filter((item) => item !== name)
                    : [...previous, name],
              );
            }}
          >
            {name}
          </PrismCommandItem>
        ))}
      </PrismCommandList>
      <output>{selected.join(",")}</output>
    </PrismCommand>
  );
}

for (const name of ["One", "Four"]) {
  it(`Shift+Enter exclusively selects ${name} from the search field`, async () => {
    render(<Selection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), name);
    await user.keyboard("{ArrowDown}{Shift>}{Enter}{/Shift}");
    expect(screen.getByRole("status").textContent).toBe(name);
  });
  it(`Shift+click exclusively selects ${name}`, async () => {
    render(<Selection />);
    const user = userEvent.setup();
    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("menuitem", { name }));
    await user.keyboard("{/Shift}");
    expect(screen.getByRole("status").textContent).toBe(name);
  });
}

it("ordinary Enter toggles without retaining Shift from the previous activation", async () => {
  render(<Selection />);
  const user = userEvent.setup();
  const input = screen.getByRole("searchbox");
  await user.click(input);
  await user.keyboard("{ArrowDown}{Shift>}{Enter}{/Shift}{ArrowDown}{Enter}");
  expect(screen.getByRole("status").textContent).toBe("One,Two");
  await user.keyboard("{Enter}");
  expect(screen.getByRole("status").textContent).toBe("One");
});

it("preserves Shift when Enter is dispatched directly to a menu item", () => {
  render(<Selection search={false} />);
  fireEvent.keyDown(screen.getByRole("menuitem", { name: "Four" }), {
    key: "Enter",
    shiftKey: true,
  });
  expect(screen.getByRole("status").textContent).toBe("Four");
});
