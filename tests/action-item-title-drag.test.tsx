import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

mock.module("~/hooks/useMultiSelection", () => ({
  useMultiSelection: () => ({ isSelectionMode: false }),
}));
const { ActionItemTitleInput } =
  await import("../app/components/features/ActionItemTitleInput");

afterEach(cleanup);

function Harness({ seen }: { seen: string[] }) {
  const [editing, setEditing] = useState(false);
  // The wrapper stands in for dnd-kit's activators (mouse, pointer and touch).
  return (
    <div
      onMouseDown={(e) =>
        // dnd-kit skips a press whose default was prevented.
        seen.push(e.nativeEvent.defaultPrevented ? "prevented" : "mousedown")
      }
      onPointerDown={(e) =>
        seen.push(e.nativeEvent.defaultPrevented ? "prevented" : "pointerdown")
      }
      onTouchStart={() => seen.push("touchstart")}
    >
      <ActionItemTitleInput
        isEditing={editing}
        setIsEditing={setEditing}
        title="My action"
      />
    </div>
  );
}

it("the title does not block the drag activators of the action item", () => {
  const seen: string[] = [];
  render(<Harness seen={seen} />);
  const title = screen.getByRole("button", { name: "My action" });
  fireEvent.pointerDown(title);
  fireEvent.mouseDown(title);
  fireEvent.touchStart(title);
  expect(seen).toEqual(["pointerdown", "mousedown", "touchstart"]);
});

it("a plain click on the title edits it in place", () => {
  render(<Harness seen={[]} />);
  fireEvent.click(screen.getByRole("button", { name: "My action" }));
  expect(
    screen.getByRole("textbox", { name: "Editar título da ação" }),
  ).toBeTruthy();
});

it("while editing, pressing inside the field does not start a drag", () => {
  const seen: string[] = [];
  render(<Harness seen={seen} />);
  fireEvent.click(screen.getByRole("button", { name: "My action" }));
  const field = screen.getByRole("textbox", { name: "Editar título da ação" });
  fireEvent.pointerDown(field);
  fireEvent.mouseDown(field);
  fireEvent.touchStart(field);
  expect(seen).toEqual([]);
});

it("pressing the title leaves the press untouched for dnd-kit", () => {
  render(<Harness seen={[]} />);
  const title = screen.getByRole("button", { name: "My action" });
  // fireEvent returns false when the event's default was prevented.
  expect(fireEvent.mouseDown(title)).toBe(true);
  expect(fireEvent.pointerDown(title)).toBe(true);
});
