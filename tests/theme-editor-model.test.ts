import { expect, it } from "bun:test";
import { PALLETE, SHARED_COLORS } from "~/lib/palettes";
import {
  buildPalettesSource,
  clonePaletteConfig,
  cloneSharedColors,
} from "../app/components/features/admin/themes/theme-editor-model";

it("keeps palette helpers when generating the replacement palettes.ts", () => {
  const shared = cloneSharedColors(SHARED_COLORS);
  shared.shadow.mix.light = 41;
  const source = buildPalettesSource(clonePaletteConfig(PALLETE[0]), shared);

  expect(source).toContain("export const DEFAULT_PALETTE_ID = PALLETE[0].id;");
  expect(source).toContain(
    "export function getPaletteIndexById(id: unknown): number",
  );
  expect(source).toContain(
    "export function getPaletteById(id: unknown): PaletteConfig | undefined",
  );
  expect(source).toContain("export const SHARED_COLORS: SharedColors =");
  expect(source).toContain("mix: {\n      light: 41,");
  expect(source).toContain(
    "export function oklchToCss(color: OklchColor): string",
  );
});
