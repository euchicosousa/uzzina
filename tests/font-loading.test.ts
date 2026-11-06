import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const FAMILY = "PP Object Sans";
const SIGNATURES: Record<string, string> = { woff2: "wOF2", woff: "wOFF" };

let outDir = "";

// Resolves a root-relative or file-relative URL the way the browser would,
// against the built site root served from outDir.
function resolveBuiltPath(ref: string, baseUrlPath: string): string {
  const url = new URL(ref, `http://site.test${baseUrlPath}`);
  return join(outDir, decodeURIComponent(url.pathname));
}

function stylesheetHrefs(html: string): string[] {
  const hrefs: string[] = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    if (!/rel=["']?stylesheet/i.test(tag)) continue;
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (href) hrefs.push(href);
  }
  return hrefs;
}

beforeAll(() => {
  outDir = mkdtempSync(join(tmpdir(), "uzzina-font-build-"));
  const result = spawnSync(
    "bunx",
    ["vite", "build", "--outDir", outDir, "--emptyOutDir"],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(`vite build failed:\n${result.stdout}\n${result.stderr}`);
  }
}, 120_000);

afterAll(() => {
  if (outDir) rmSync(outDir, { recursive: true, force: true });
});

describe("brand web font in the production build", () => {
  test("built index.html reaches @font-face rules whose files exist with valid signatures", () => {
    const html = readFileSync(join(outDir, "index.html"), "utf8");

    // Only stylesheets the built entry page really links can register faces.
    const faces: {
      weight: string;
      sources: { url: string; format: string; path: string }[];
    }[] = [];
    for (const href of stylesheetHrefs(html)) {
      const cssPath = resolveBuiltPath(href, "/");
      expect(existsSync(cssPath)).toBe(true);
      const css = readFileSync(cssPath, "utf8");
      const cssUrlPath = new URL(href, "http://site.test/").pathname;
      for (const block of css.match(/@font-face\s*{[^}]*}/g) ?? []) {
        if (!block.includes(FAMILY)) continue;
        const weight = block.match(/font-weight:\s*([^;]+);/)?.[1].trim() ?? "";
        const sources = [
          ...block.matchAll(
            /url\(["']?([^"')]+)["']?\)\s*format\(["']([^"']+)["']\)/g,
          ),
        ].map(([, url, format]) => ({
          url,
          format,
          path: resolveBuiltPath(url, dirname(cssUrlPath) + "/"),
        }));
        faces.push({ weight, sources });
      }
    }

    const normalized = faces.map((face) =>
      face.weight === "normal"
        ? "400"
        : face.weight === "bold"
          ? "700"
          : face.weight,
    );
    expect(normalized.sort()).toEqual(["300", "400", "500", "700"]);

    for (const face of faces) {
      expect(face.sources.map((source) => source.format)).toEqual([
        "woff2",
        "woff",
      ]);
      for (const source of face.sources) {
        expect(existsSync(source.path)).toBe(true);
        const header = readFileSync(source.path)
          .subarray(0, 4)
          .toString("latin1");
        expect(header).toBe(SIGNATURES[source.format]);
      }
    }
  });

  // Since ad0c0ed (01/11) the brand family is commented out on purpose so the
  // app uses the system sans stack; index.html also keeps its stylesheet off.
  test("font stack uses the system sans while the brand family is disabled", () => {
    const css = readFileSync(join(process.cwd(), "app/tailwind.css"), "utf8");
    expect(css).toMatch(
      /--font-sans:\s*\/\*\s*"PP Object Sans",\s*\*\/\s*ui-sans-serif,\s*system-ui,\s*sans-serif/,
    );
  });
});
