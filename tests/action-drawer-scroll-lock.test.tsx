import "./dom-setup";
import { afterEach, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { useRef } from "react";
import { usePreventScroll } from "react-aria/usePreventScroll";
import { useActionDrawerScrollLock } from "~/hooks/useActionDrawerScrollLock";

afterEach(cleanup);

function NestedOverlay() {
  usePreventScroll();
  return <div role="dialog">Nested overlay</div>;
}

function Harness({
  count = 0,
  nested = false,
}: {
  count?: number;
  nested?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useActionDrawerScrollLock(ref, count > 0);
  return (
    <>
      <div ref={ref} data-testid="app-scroller" />
      {nested && <NestedOverlay />}
    </>
  );
}

it("locks the real background region until the final action closes and restores both offsets and styles", () => {
  const view = render(<Harness />);
  const scroller = view.getByTestId("app-scroller");
  scroller.style.setProperty("overflow-y", "scroll", "important");
  scroller.style.overflowX = "auto";
  scroller.style.color = "red";
  scroller.scrollTop = 317;
  scroller.scrollLeft = 42;
  const root = document.documentElement;
  const rootStyle = root.style.cssText;
  const pagePosition = [window.scrollX, window.scrollY];
  view.rerender(<Harness count={1} />);
  expect(scroller.style.overflowY).toBe("hidden");
  expect(root.style.overflow).toBe("hidden");
  view.rerender(<Harness count={2} />);
  view.rerender(<Harness count={1} />);
  expect(scroller.style.overflowY).toBe("hidden");
  // Focus or another owner can adjust a hidden scroller programmatically.
  scroller.scrollTop = 8;
  scroller.scrollLeft = 3;
  view.rerender(<Harness count={0} />);
  expect(scroller.scrollTop).toBe(317);
  expect(scroller.scrollLeft).toBe(42);
  expect(scroller.style.overflowY).toBe("scroll");
  expect(scroller.style.getPropertyPriority("overflow-y")).toBe("important");
  expect(scroller.style.overflowX).toBe("auto");
  expect(scroller.style.color).toBe("red");
  expect(root.style.cssText).toBe(rootStyle);
  expect([window.scrollX, window.scrollY]).toEqual(pagePosition);
});

it("shares the document lock with nested overlays and cleans up on reset, repetition and unmount", () => {
  const rootStyle = document.documentElement.style.cssText;
  const view = render(<Harness count={1} nested />);
  const scroller = view.getByTestId("app-scroller");
  view.rerender(<Harness count={1} />);
  expect(document.documentElement.style.overflow).toBe("hidden");
  expect(scroller.style.overflowY).toBe("hidden");
  view.rerender(<Harness count={1} nested />);
  view.rerender(<Harness nested />);
  expect(document.documentElement.style.overflow).toBe("hidden");
  expect(scroller.style.overflowY).toBe("");
  view.rerender(<Harness />);
  expect(document.documentElement.style.cssText).toBe(rootStyle);
  scroller.scrollTop = 25;
  view.rerender(<Harness count={1} nested />);
  scroller.scrollTop = 99;
  view.unmount();
  expect(scroller.scrollTop).toBe(25);
  expect(scroller.style.overflowY).toBe("");
  expect(document.documentElement.style.cssText).toBe(rootStyle);
});
