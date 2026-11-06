import "./dom-setup";
import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { UAIProgressBar } from "~/components/uzzina/UAIProgressBar";

describe("UAIProgressBar", () => {
  afterEach(cleanup);
  it("renders nothing when isGenerating is false initially", () => {
    const { container } = render(<UAIProgressBar isGenerating={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders line variant with h-0.5 and bg-input when isGenerating is true", () => {
    const { container } = render(<UAIProgressBar isGenerating={true} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeTruthy();
    expect(bar.className).toContain("h-0.5");
    expect(bar.className).toContain("bg-input");
    // Ensure no rounded class is present on the track
    expect(bar.className).not.toContain("rounded");

    const fill = container.querySelector(".bg-primary");
    expect(fill).toBeTruthy();
  });

  it("renders circle variant with svg and circles", () => {
    const { container } = render(
      <UAIProgressBar isGenerating={true} variant="circle" />,
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeTruthy();
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);
  });

  it("jumps to 100% when isGenerating becomes false", () => {
    const { rerender } = render(<UAIProgressBar isGenerating={true} />);
    const bar = screen.getByRole("progressbar");
    expect(Number(bar.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(98);

    act(() => {
      rerender(<UAIProgressBar isGenerating={false} />);
    });

    expect(bar.getAttribute("aria-valuenow")).toBe("100");
  });
});
