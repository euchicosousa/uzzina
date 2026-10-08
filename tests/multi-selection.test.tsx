import { StrictMode } from "react";
import type { Action } from "../app/types";
import { afterEach, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  MultiSelectionProvider,
  useMultiSelection,
  useSelectionActions,
  useSelectionContext,
} from "../app/hooks/useMultiSelection";

afterEach(cleanup);
function Controls() {
  const selection = useMultiSelection();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          selection.toggleSelectionMode(true);
          selection.selectAll(["outside"]);
        }}
      >
        Select
      </button>
      <output>{selection.selectedIds.join(",")}</output>
      <input aria-label="Title" />
    </>
  );
}
it("select all cannot select actions outside the registered view", () => {
  render(
    <MultiSelectionProvider locationKey="home">
      <Controls />
    </MultiSelectionProvider>,
  );
  fireEvent.click(screen.getByText("Select"));
  expect(screen.getByRole("status").textContent).toBe("");
});

const row = {
  id: "one",
  title: "One",
  date: "2026-10-07 10:00:00",
  updated_at: "2026-10-07T10:00:00Z",
} as Action;
function Registered({
  actions,
  context = "day1",
}: {
  actions: Action[];
  context?: string;
}) {
  useSelectionActions(actions);
  useSelectionContext(context);
  return <Controls />;
}
it("keyboard uses the registered recorte and preserves text selection", () => {
  render(
    <MultiSelectionProvider>
      <Registered actions={[row]} />
    </MultiSelectionProvider>,
  );
  fireEvent.click(screen.getByText("Select"));
  const input = screen.getByRole("textbox");
  const event = new window.KeyboardEvent("keydown", {
    key: "a",
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  input.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  expect(screen.getByRole("status").textContent).toBe("");
  fireEvent.keyDown(window, { key: "a", ctrlKey: true });
  expect(screen.getByRole("status").textContent).toBe("one");
});
it("changing filters clears selection even when the eligible IDs are identical", () => {
  const view = (context: string) => (
    <MultiSelectionProvider>
      <Registered actions={[row]} context={context} />
    </MultiSelectionProvider>
  );
  const mounted = render(view("day1"));
  fireEvent.click(screen.getByText("Select"));
  fireEvent.keyDown(window, { key: "a", ctrlKey: true });
  expect(screen.getByRole("status").textContent).toBe("one");
  mounted.rerender(view("day2"));
  expect(screen.getByRole("status").textContent).toBe("");
});
it("an empty view cannot retain previous selected actions", () => {
  const view = (actions: Action[]) => (
    <MultiSelectionProvider>
      <Registered actions={actions} />
    </MultiSelectionProvider>
  );
  const mounted = render(view([row]));
  fireEvent.click(screen.getByText("Select"));
  fireEvent.keyDown(window, { key: "a", ctrlKey: true });
  mounted.rerender(view([]));
  expect(screen.getByRole("status").textContent).toBe("");
});

it("a view mounted with data remains selectable in React StrictMode", () => {
  render(
    <StrictMode>
      <MultiSelectionProvider>
        <Registered actions={[row]} />
      </MultiSelectionProvider>
    </StrictMode>,
  );
  fireEvent.click(screen.getByText("Select"));
  fireEvent.keyDown(window, { key: "a", ctrlKey: true });
  expect(screen.getByRole("status").textContent).toBe("one");
});
