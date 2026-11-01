// Run with Bun: the real local TypeScript adapter serves the actual frontend build.
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");
const { resolve, extname, sep } = require("node:path");
const { createDevApiMiddleware } = require("../server/dev-api.ts");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const dist = resolve(__dirname, "../dist");
  let unexpectedApiLoads = 0;
  const middleware = createDevApiMiddleware(async () => {
    unexpectedApiLoads++;
    throw new Error("Browser fixtures must not reach an external database");
  });
  const types = {
    ".js": "text/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".png": "image/png",
    ".ico": "image/x-icon",
  };
  const server = createServer((req, res) => {
    void middleware(req, res, async () => {
      const path = new URL(req.url || "/", "http://localhost").pathname;
      const file = resolve(dist, `.${path}`);
      if (!file.startsWith(dist + sep)) {
        res.statusCode = 403;
        res.end();
        return;
      }
      try {
        const content = await readFile(file);
        res.setHeader(
          "Content-Type",
          types[extname(file)] || "application/octet-stream",
        );
        res.end(content);
      } catch {
        res.setHeader("Content-Type", "text/html");
        res.end(await readFile(resolve(dist, "index.html")));
      }
    });
  });
  await new Promise((done, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", done);
  });
  const address = server.address();
  assert(address && typeof address === "object");
  const base = `http://127.0.0.1:${address.port}`;
  const alias = `http://localhost:${address.port}`;
  process.env.APP_ORIGIN = base;
  delete process.env.VERCEL;
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  let groups = 0;
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(6000);
    const errors = [];
    const requests = [];
    let mode = "success";
    const clients = ["Alpha", "Beta"].map((name, index) => ({
      id: `client-${index}`,
      name,
      email: `${name.toLowerCase()}@test.invalid`,
      active: true,
      partners: ["partner"],
      created_at: "2026-10-31T00:00:00Z",
      image: null,
    }));
    page.on("pageerror", (error) => errors.push(error.message));
    await context.route("**/*", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (![base, alias].includes(url.origin)) return route.abort();
      if (url.pathname === "/api/dash-auth") {
        const input = req.postDataJSON();
        const cookie = req.headers().cookie || "";
        requests.push({
          action: input.action,
          origin: req.headers().origin,
          url: url.origin,
        });
        if (input.action === "login") {
          if (mode !== "success")
            return route.fulfill({
              status: Number(mode),
              json: { error: "Controlled failure" },
            });
          const index = clients.findIndex(
            (client) => client.email === input.email,
          );
          assert(index >= 0);
          return route.fulfill({
            json: { client: clients[index] },
            headers: {
              "Set-Cookie": `uzzina_dash_session=fixture-${index}; HttpOnly; SameSite=Lax; Path=/api`,
            },
          });
        }
        if (input.action === "logout")
          return route.fulfill({
            json: { success: true },
            headers: {
              "Set-Cookie":
                "uzzina_dash_session=; HttpOnly; SameSite=Lax; Path=/api; Max-Age=0",
            },
          });
        const index = clients.findIndex((_, index) =>
          cookie.includes(`uzzina_dash_session=fixture-${index}`),
        );
        return index < 0
          ? route.fulfill({ status: 401, json: { error: "No session" } })
          : route.fulfill({ json: { client: clients[index] } });
      }
      if (url.pathname === "/api/dash-data")
        return route.fulfill({
          json:
            url.searchParams.get("op") === "partners"
              ? {
                  partners: [
                    {
                      slug: "partner",
                      title: "Parceiro",
                      short: "P",
                      image: null,
                      colors: [],
                    },
                  ],
                }
              : { actions: [] },
        });
      if (url.pathname.startsWith("/api/"))
        throw new Error(`Unexpected API ${url.pathname}`);
      return route.continue();
    });
    await page.goto(`${alias}/login`);
    await page.getByRole("button", { name: "Fazer Login" }).waitFor();
    assert.equal(new URL(page.url()).origin, alias);
    await page.getByLabel("E-mail", { exact: true }).fill("team@test.invalid");
    await page.getByLabel("Senha", { exact: true }).fill("fixture-password");
    assert.equal(requests.length, 0);
    groups++;

    for (const client of clients) {
      const response = await page.goto(
        `${alias}/dash/login?partner=partner&sidebar=hide`,
      );
      assert(response);
      assert.equal(new URL(page.url()).origin, alias);
      assert.equal(new URL(page.url()).searchParams.get("sidebar"), "hide");
      await page.getByLabel("E-mail", { exact: true }).fill(client.email);
      await page.getByLabel("Senha", { exact: true }).fill("fixture-password");
      await page.getByRole("button", { name: "Entrar no Portal" }).click();
      await page.waitForURL((url) => url.pathname === "/dash");
      await page.getByRole("button", { name: "Sair", exact: true }).waitFor();
      await page.getByText(client.name, { exact: false }).first().waitFor();
      const cookies = await context.cookies(`${alias}/api/dash-auth`);
      assert(
        cookies.some(
          (cookie) =>
            cookie.name === "uzzina_dash_session" &&
            cookie.httpOnly &&
            cookie.path === "/api" &&
            cookie.domain === "localhost",
        ),
      );
      await page.reload();
      await page.getByRole("button", { name: "Sair", exact: true }).waitFor();
      await page.getByText(client.name, { exact: false }).first().waitFor();
      await page.getByRole("button", { name: "Sair", exact: true }).click();
      await page.waitForURL((url) => url.pathname === "/dash/login");
      groups++;
    }
    for (const status of [401, 403, 503]) {
      mode = String(status);
      await page.getByLabel("E-mail", { exact: true }).fill(clients[0].email);
      await page.getByLabel("Senha", { exact: true }).fill("fixture-password");
      await page.getByRole("button", { name: "Entrar no Portal" }).click();
      const message =
        status === 401
          ? "E-mail ou senha incorretos ou conta inativa."
          : status === 403
            ? "Não foi possível entrar no portal. Tente novamente."
            : "O portal está temporariamente indisponível. Tente novamente.";
      await page.getByText(message, { exact: true }).waitFor();
      groups++;
    }
    assert(requests.length > 0);
    assert(
      requests.every(
        (request) => request.origin === alias && request.url === alias,
      ),
    );
    assert.equal(unexpectedApiLoads, 0);
    assert.deepEqual(errors, []);
    console.log(
      `PASS ${groups} real-build groups: team entry unchanged; portal without address restriction, two accounts, cookie/reload/logout, 401/403/503`,
    );
  } finally {
    await browser.close();
    await new Promise((done) => server.close(done));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
