import {
  afterAll,
  afterEach,
  expect,
  it,
  setSystemTime,
  spyOn,
} from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { CelebrationsList } from "~/routes/app/admin/celebrations";
import type { Celebration } from "~/types";

const celebrations: Celebration[] = [
  {
    id: "old",
    title: "Previous October",
    created_at: "2026-01-01T00:00:00Z",
    date: "2025-10-01",
  },
  {
    id: "january",
    title: "January",
    created_at: "2026-01-01T00:00:00Z",
    date: "2026-01-01",
  },
  {
    id: "october",
    title: "October",
    created_at: "2026-01-01T00:00:00Z",
    date: "2026-10-12",
  },
  {
    id: "december",
    title: "December",
    created_at: "2026-01-01T00:00:00Z",
    date: "2026-12-25",
  },
];

const geometry = spyOn(HTMLElement.prototype, "getBoundingClientRect");

afterAll(() => geometry.mockRestore());

afterEach(() => {
  cleanup();
  setSystemTime();
  geometry.mockReset();
});

function setupGeometry() {
  setSystemTime(new Date(2026, 9, 18, 12));
  geometry.mockImplementation(function (this: HTMLElement) {
    const top = this.dataset.month === "2026-10" ? 900 : 100;
    return {
      top,
      bottom: top + 100,
      left: 0,
      right: 500,
      width: 500,
      height: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    };
  });
}

it("waits for dates, scrolls to the current month and year once, and preserves manual scrolling", () => {
  setupGeometry();
  const props = { isSubmitting: false, onDelete: () => {} };
  const { container, rerender, unmount } = render(
    <CelebrationsList {...props} celebrations={[]} />,
  );
  const list = container.firstElementChild;
  expect(list?.scrollTop).toBe(0);

  rerender(<CelebrationsList {...props} celebrations={celebrations} />);
  expect(screen.getByRole("heading", { name: "outubro de 2026" })).toBeTruthy();
  expect(list?.scrollTop).toBe(800);

  if (!(list instanceof HTMLElement)) throw new Error("Missing list");
  list.scrollTop = 123;
  rerender(<CelebrationsList {...props} celebrations={[...celebrations]} />);
  expect(list.scrollTop).toBe(123);

  unmount();
  const reopened = render(
    <CelebrationsList {...props} celebrations={celebrations} />,
  );
  expect(reopened.container.firstElementChild?.scrollTop).toBe(800);
});

it("keeps the list available when the current month has no dates", () => {
  setupGeometry();
  const { container } = render(
    <CelebrationsList
      celebrations={celebrations.filter((item) => item.id !== "october")}
      isSubmitting={false}
      onDelete={() => {}}
    />,
  );
  expect(container.firstElementChild?.scrollTop).toBe(0);
  expect(screen.getByText("January")).toBeTruthy();
});
