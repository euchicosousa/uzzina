// Real Vite/HTTP regression; separate optimizer cache, no database or browser session.
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { mkdtemp, writeFile, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { pathToFileURL } = require("node:url");
const net = require("node:net");

async function availablePort() {
  const listener = net.createServer();
  await new Promise((resolveListen, reject) => {
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", resolveListen);
  });
  const address = listener.address();
  assert(address && typeof address === "object");
  await new Promise((resolveClose) => listener.close(resolveClose));
  return address.port;
}
async function main() {
  const root = resolve(__dirname, "..");
  const workspace = await mkdtemp(join(tmpdir(), "uzzina-dev-imports-"));
  const port = await availablePort();
  const configFile = join(workspace, "vite.config.mjs");
  const cacheDir = join(workspace, "cache");
  await writeFile(
    configFile,
    `import config from ${JSON.stringify(pathToFileURL(join(root, "vite.config.ts")).href)};\nexport default {...config, root: ${JSON.stringify(root)}, cacheDir: ${JSON.stringify(cacheDir)}};\n`,
  );
  const args = ["run", "dev", "--port", String(port), "--config", configFile];
  let output = "";
  const server = spawn("bun", args, {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (chunk) => {
    output += chunk;
  });
  server.stderr.on("data", (chunk) => {
    output += chunk;
  });
  let code;
  server.on("exit", (value) => {
    code = value;
  });
  const base = `http://127.0.0.1:${port}`;
  try {
    for (let attempt = 0; attempt < 160; attempt++) {
      if (code !== undefined)
        throw new Error(`Vite exited before ready: ${output.slice(-1200)}`);
      try {
        if ((await fetch(`${base}/@vite/client`)).ok) break;
      } catch {
        /* Server is still starting. */
      }
      if (attempt === 159) throw new Error("Vite startup timed out");
      await new Promise((done) => setTimeout(done, 250));
    }
    // Use the dependency that returned 504 in the real browser reproduction.
    const response = await fetch(
      `${base}/app/components/features/PartnerCalendarBoard.tsx`,
    );
    assert.equal(response.status, 200);
    const source = await response.text();
    const imports = [
      ...source.matchAll(/(?:from\s*|import\s*)["']([^"']+)["']/g),
    ].map((match) => match[1]);
    const optimizedPath = imports.find(
      (path) => path.includes("/deps/") && path.includes("tiny-invariant"),
    );
    assert(
      optimizedPath,
      "Expected the real optimized import in the partner calendar module",
    );
    const dependencyUrl = new URL(optimizedPath, base).href;
    const before = await fetch(dependencyUrl);
    assert.equal(
      before.status,
      200,
      "Optimized dependency must initially load",
    );
    console.log(
      "PASS initial optimized dependency loads from a real source module",
    );
    // Force is intentional: prove a failed second start cannot clear the live cache.
    const duplicate = spawn("bun", [...args, "--force"], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let duplicateOutput = "";
    duplicate.stdout.on("data", (chunk) => {
      duplicateOutput += chunk;
    });
    duplicate.stderr.on("data", (chunk) => {
      duplicateOutput += chunk;
    });
    const duplicateCode = await new Promise((done, reject) => {
      const timeout = setTimeout(() => {
        duplicate.kill("SIGTERM");
        reject(new Error("Duplicate start did not exit"));
      }, 20000);
      duplicate.once("exit", (value) => {
        clearTimeout(timeout);
        done(value);
      });
      duplicate.once("error", reject);
    });
    assert.notEqual(
      duplicateCode,
      0,
      "Duplicate start must report an occupied port",
    );
    console.log(
      duplicateOutput
        .split("\n")
        .filter((line) => /re-optimiz|already in use/.test(line))
        .join("\n"),
    );
    const freshUrl = new URL(dependencyUrl);
    freshUrl.searchParams.set("probe", "uncached");
    const after = await fetch(freshUrl);
    console.log(
      `Live optimized dependency after rejected start: HTTP ${after.status} ${after.statusText}`,
    );
    assert.equal(
      after.status,
      200,
      "Rejected duplicate start invalidated the active server's optimized imports",
    );
    for (const path of [
      "/app/components/features/RichTextEditor.tsx",
      "/app/components/features/action-drawer/ActionFormDrawer.tsx",
    ]) {
      const moduleResponse = await fetch(`${base}${path}`);
      assert.equal(
        moduleResponse.status,
        200,
        `Lazy source did not load: ${path}`,
      );
    }
    console.log(
      "PASS rejected duplicate start preserves cache and both lazy source modules",
    );
    if (process.env.DEV_IMPORTS_BROWSER === "true") {
      const browserTest = spawn(
        process.execPath,
        [join(root, "scripts/check-action-panels-browser.cjs")],
        {
          cwd: root,
          stdio: "inherit",
          env: {
            ...process.env,
            PORTAL_TEST_URL: base,
            DRAWER_TEST_PREVIEW: "false",
            DRAWER_TEST_LAZY_ONLY: "true",
          },
        },
      );
      const browserCode = await new Promise((done, reject) => {
        browserTest.once("exit", done);
        browserTest.once("error", reject);
      });
      assert.equal(browserCode, 0, "Real dev browser form loading failed");
    }
  } finally {
    server.kill("SIGTERM");
    if (server.exitCode === null)
      await new Promise((done) => server.once("exit", done));
    await rm(workspace, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
