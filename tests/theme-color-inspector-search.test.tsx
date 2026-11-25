import { afterEach, expect, it } from "bun:test";
import { cleanup, render as renderDom } from "@testing-library/react";
import { PALLETE, SHARED_COLORS } from "~/lib/palettes";
import { ThemeColorInspector } from "../app/components/features/admin/themes/ThemeColorInspector";
import {
  clonePaletteConfig,
  cloneSharedColors,
  matchesSearch,
  normalizeSearchText,
} from "../app/components/features/admin/themes/theme-editor-model";

// The shared DOM preload does not expose InputEvent, which the sliders read.
if (!("InputEvent" in globalThis)) {
  Object.assign(globalThis, { InputEvent: window.InputEvent });
}

const noop = () => {};

afterEach(cleanup);

function render(defaultSearch: string): string {
  cleanup();
  return renderDom(
    <ThemeColorInspector
      defaultSearch={defaultSearch}
      onChangeCategory={noop}
      onChangeDelta={noop}
      onChangeFormula={noop}
      onChangeLate={noop}
      onChangePaletteColor={noop}
      onChangePhase={noop}
      onChangePhaseFormula={noop}
      onChangePrimaryFgDelta={noop}
      onChangeRelief={noop}
      onChangeSharedNumber={noop}
      onChangeState={noop}
      onHoverTarget={noop}
      palette={clonePaletteConfig(PALLETE[0])}
      shared={cloneSharedColors(SHARED_COLORS)}
    />,
  ).container.innerHTML;
}

/** Badge counts per tab, in tab order (null: no badge). */
function badges(html: string): Array<number | null> {
  return ["Tema", "Estados", "Fases e categorias", "Fórmulas"].map((title) => {
    const start = html.indexOf(`${title}<span`);
    if (start === -1) return null;
    const match = html.slice(start).match(/data-slot="badge"[^>]*>(\d+)</);
    return match ? Number(match[1]) : null;
  });
}

it("normalizes case and accents", () => {
  expect(normalizeSearchText("  PRIMÁRIA  ")).toBe("primaria");
  expect(matchesSearch("formula", "Fórmulas")).toBe(true);
  expect(matchesSearch("sombra", undefined, "Sombras e brilho")).toBe(true);
  expect(matchesSearch("borda sombra", "Borda")).toBe(false);
  expect(matchesSearch("", "x")).toBe(true);
});

it("shows everything without badges when the search is empty", () => {
  const html = render("");
  expect(badges(html)).toEqual([null, null, null, null]);
  expect(html).not.toContain("Nenhum item encontrado");
  expect(html).toContain("Base");
});

it("counts matches per tab, accent-insensitive", () => {
  const [tema, estados, fases, formulas] = badges(render("principal"));
  expect(tema).toBeGreaterThan(0);
  expect(estados).toBeNull();
  expect(fases).toBeNull();
  expect(formulas).toBeGreaterThan(0); // "Principal · hover"
  expect(badges(render("PRIMARIA"))).toEqual(badges(render("primária")));
});

it("finds items in every tab", () => {
  expect(badges(render("erro"))[1]).toBeGreaterThan(0);
  expect(badges(render("sombra"))[2]).toBeGreaterThan(0);
  expect(badges(render("sombra"))[3]).toBeGreaterThan(0);
  expect(badges(render("borda"))[0]).toBeGreaterThan(0);
  expect(badges(render("doing"))[2]).toBeGreaterThan(0);
  expect(badges(render("formula"))[3]).toBeGreaterThan(0);
});

it("hides sections without matches and shows an empty state", () => {
  const html = render("sombra");
  expect(html).toContain("3. Ação");
  expect(html).not.toContain("1. Base");
  expect(html).not.toContain("2. Camadas");
  expect(render("zzzxyz")).toContain("Nenhum item encontrado nesta aba.");
  expect(badges(render("zzzxyz"))).toEqual([null, null, null, null]);
});
