import { describe, expect, it } from "bun:test";
import { render } from "@testing-library/react";
import { ULoader } from "~/components/uzzina/ULoader";

describe("ULoader", () => {
  it("renders with default sm size and text-muted-foreground when no props provided", () => {
    const { container } = render(<ULoader />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.classList.contains("size-4")).toBe(true);
    expect(svg?.classList.contains("animate-spin")).toBe(true);
    expect(svg?.classList.contains("text-muted-foreground")).toBe(true);
    expect(svg?.getAttribute("role")).toBe("presentation");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("applies the 6 scale sizes correctly", () => {
    const expectations = [
      { size: "xs", expectedClass: "size-3" },
      { size: "sm", expectedClass: "size-4" },
      { size: "md", expectedClass: "size-5" },
      { size: "default", expectedClass: "size-5" },
      { size: "lg", expectedClass: "size-6" },
      { size: "xl", expectedClass: "size-8" },
      { size: "2xl", expectedClass: "size-12" },
    ] as const;

    for (const { size, expectedClass } of expectations) {
      const { container } = render(<ULoader size={size} />);
      const svg = container.querySelector("svg");
      expect(svg?.classList.contains(expectedClass)).toBe(true);
    }
  });

  it("handles inheritColor prop", () => {
    const { container: inherited } = render(<ULoader inheritColor />);
    const svgInherited = inherited.querySelector("svg");
    expect(svgInherited?.classList.contains("text-current")).toBe(true);
    expect(svgInherited?.classList.contains("text-muted-foreground")).toBe(
      false,
    );

    const { container: muted } = render(<ULoader inheritColor={false} />);
    const svgMuted = muted.querySelector("svg");
    expect(svgMuted?.classList.contains("text-muted-foreground")).toBe(true);
    expect(svgMuted?.classList.contains("text-current")).toBe(false);
  });

  it("allows className overrides for custom geometry (e.g. 40px review page)", () => {
    const { container } = render(
      <ULoader className="size-10 text-foreground" />,
    );
    const svg = container.querySelector("svg");
    expect(svg?.classList.contains("size-10")).toBe(true);
    expect(svg?.classList.contains("text-foreground")).toBe(true);
  });

  it("manages accessible role and aria attributes when label is provided", () => {
    const { container } = render(<ULoader label="Carregando dados..." />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("role")).toBe("status");
    expect(svg?.getAttribute("aria-label")).toBe("Carregando dados...");
    expect(svg?.hasAttribute("aria-hidden")).toBe(false);
  });

  it("respects aria-label prop directly", () => {
    const { container } = render(<ULoader aria-label="Processando..." />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("role")).toBe("status");
    expect(svg?.getAttribute("aria-label")).toBe("Processando...");
  });

  it("allows explicit role and aria-hidden overrides", () => {
    const { container } = render(<ULoader aria-hidden={false} role="status" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("role")).toBe("status");
    expect(svg?.getAttribute("aria-hidden")).toBe("false");
  });
});
