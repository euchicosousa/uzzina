import { expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

it("sem DOM o sanitizador real não devolve HTML reinterpretável", () => {
  const path = resolve("app/utils/sanitize.ts");
  const source = `const {sanitizeHtml} = await import(${JSON.stringify(path)}); console.log(JSON.stringify(sanitizeHtml('<p>texto</p>')));`;
  const result = spawnSync(process.execPath, ["-e", source], {
    cwd: tmpdir(),
    encoding: "utf8",
  });
  expect(result.status).toBe(0);
  expect(result.stdout.trim()).toBe('""');
});
