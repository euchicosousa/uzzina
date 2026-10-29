import "./dom-setup";
import { afterEach, expect, it, spyOn } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "react-aria-components";
import {
  PrismDialog,
  PrismDialogHeader,
  PrismDialogTitle,
} from "~/components/prism/dialog";
import { PrismPopover, PrismPopoverTrigger } from "~/components/prism/popover";
import { installVisualViewport } from "./fixtures/visual-viewport";

Object.assign(globalThis, {
  KeyboardEvent: window.KeyboardEvent,
  MouseEvent: window.MouseEvent,
  PointerEvent: window.MouseEvent,
});
if (!("CSS" in globalThis))
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });

const restorers: (() => void)[] = [];
afterEach(() => {
  cleanup();
  while (restorers.length) restorers.pop()?.();
});

// Replaces a read-only browser measurement for one test.
function override<T extends object>(
  target: T,
  property: string,
  get: (this: T) => number,
) {
  const original = Object.getOwnPropertyDescriptor(target, property);
  Object.defineProperty(target, property, { configurable: true, get });
  restorers.push(() => {
    if (original) Object.defineProperty(target, property, original);
    else Reflect.deleteProperty(target, property);
  });
}

function frame() {
  const element = document.querySelector('[data-slot="dialog-viewport"]');
  if (!(element instanceof HTMLElement)) throw new Error("No dialog frame");
  return element;
}
function geometry(element: HTMLElement) {
  const { top, height, paddingTop, paddingRight, paddingBottom, paddingLeft } =
    element.style;
  return [top, height, paddingTop, paddingRight, paddingBottom, paddingLeft]
    .map((value) => Number.parseFloat(value))
    .map((value) => Math.round(value * 100) / 100);
}

function TallDialog() {
  return (
    <PrismDialog isOpen showCloseButton={false}>
      <PrismDialogHeader>
        <PrismDialogTitle>Estratégias</PrismDialogTitle>
      </PrismDialogHeader>
      <input aria-label="Campo" />
    </PrismDialog>
  );
}

it("centers a dialog in the visible viewport and follows keyboard resize and pan", async () => {
  const viewport = installVisualViewport({ height: 844 });
  restorers.push(viewport.restore);
  render(<TallDialog />);
  const dialog = screen.getByRole("dialog", { name: "Estratégias" });
  // [top, height, paddingTop, paddingRight, paddingBottom, paddingLeft]
  expect(geometry(frame())).toEqual([0, 844, 16, 16, 16, 16]);
  const input = screen.getByRole("textbox", { name: "Campo" });
  const user = userEvent.setup();
  await user.type(input, "rascunho");
  // iOS opens the keyboard: the visual viewport shrinks and pans down while
  // the layout viewport (and vh/dvh) stay unchanged.
  viewport.set({ height: 380, offsetTop: 210 });
  expect(geometry(frame())).toEqual([210, 380, 16, 16, 16, 16]);
  expect(screen.getByRole("dialog", { name: "Estratégias" })).toBe(dialog);
  expect(document.activeElement).toBe(input);
  expect(input).toHaveProperty("value", "rascunho");
  viewport.set({ height: 844, offsetTop: 0 });
  expect(geometry(frame())).toEqual([0, 844, 16, 16, 16, 16]);
});

it("falls back to the window height without the visual viewport API", () => {
  let height = 700;
  override(window, "innerHeight", () => height);
  render(<TallDialog />);
  expect(geometry(frame())).toEqual([0, 700, 16, 16, 16, 16]);
  height = 500;
  act(() => {
    window.dispatchEvent(new window.Event("resize"));
  });
  expect(geometry(frame())).toEqual([0, 500, 16, 16, 16, 16]);
});

it("keeps the unzoomed geometry while the page is pinch-zoomed", () => {
  const viewport = installVisualViewport({ height: 800 });
  restorers.push(viewport.restore);
  render(<TallDialog />);
  viewport.set({ height: 400, offsetTop: 300, scale: 2 });
  expect(geometry(frame())).toEqual([0, 800, 16, 16, 16, 16]);
});

it("anchors a popover above the keyboard when it covers the trigger", async () => {
  const viewport = installVisualViewport({ height: 844, width: 375 });
  restorers.push(viewport.restore);
  override(document.documentElement, "clientHeight", () => 844);
  override(document.documentElement, "clientWidth", () => 375);
  for (const [property, size] of [
    ["scrollHeight", 300],
    ["offsetHeight", 300],
    ["offsetWidth", 288],
  ] as const)
    override(HTMLElement.prototype, property, function () {
      return this.dataset.slot === "popover-content" ? size : 0;
    });
  const rects = spyOn(HTMLElement.prototype, "getBoundingClientRect");
  restorers.push(() => rects.mockRestore());
  rects.mockImplementation(function (this: HTMLElement) {
    // The trigger sits near the bottom of the screen, like a selector in the
    // floating app bar or at the end of the action drawer.
    const [top, height, width] =
      this.getAttribute("aria-label") === "Parceiros"
        ? [780, 32, 120]
        : this.dataset.slot === "popover-content"
          ? [0, 300, 288]
          : [0, 0, 0];
    return {
      x: 20,
      y: top,
      top,
      bottom: top + height,
      left: 20,
      right: 20 + width,
      width,
      height,
      toJSON: () => ({}),
    };
  });
  render(
    <PrismPopoverTrigger>
      <Button aria-label="Parceiros">Parceiros</Button>
      <PrismPopover aria-label="Lista de parceiros">
        <input aria-label="Procurar parceiro" />
      </PrismPopover>
    </PrismPopoverTrigger>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Parceiros" }));
  const popover = document.querySelector('[data-slot="popover-content"]');
  if (!(popover instanceof HTMLElement)) throw new Error("No popover");
  // The keyboard opens: only the top 400px of the screen remain visible.
  viewport.set({ height: 400, offsetTop: 0 });
  // React Aria subscribes to the viewport captured when it loaded (none in
  // this DOM); its window resize listener applies the same recalculation.
  act(() => {
    window.dispatchEvent(new window.Event("resize"));
  });
  const visibleBottom = 400;
  const popoverBottom = 844 - Number.parseFloat(popover.style.bottom);
  expect(popover.dataset.placement).toBe("top");
  expect(popoverBottom).toBeLessThanOrEqual(visibleBottom);
  expect(Number.parseFloat(popover.style.maxHeight)).toBeLessThanOrEqual(
    visibleBottom,
  );
});
