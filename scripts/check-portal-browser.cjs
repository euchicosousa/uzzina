// Run against local Vite: PLAYWRIGHT_MODULE=<installed playwright> node scripts/check-portal-browser.cjs
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  try {
    const context = await browser.newContext({
      viewport: {
        width: Number(process.env.PORTAL_TEST_WIDTH || 390),
        height: 844,
      },
    });
    const page = await context.newPage();
    const uncaught = [];
    page.on("pageerror", (error) => uncaught.push(error.message));
    page.on("console", (message) => {
      if (message.text().includes("useDashContext must be used within"))
        uncaught.push(message.text());
    });
    const base = process.env.PORTAL_TEST_URL || "http://127.0.0.1:5176";
    for (const [path, options, statuses] of [
      ["/api/dash-data?op=partners", {}, [401, 503]],
      ["/api/dash-auth", {}, [405]],
      [
        "/api/dash-auth",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{",
        },
        [400],
      ],
    ]) {
      const response = await fetch(base + path, options);
      assert.ok(
        response.headers.get("content-type").includes("application/json"),
        "Local API must not serve the SPA",
      );
      assert.ok(statuses.includes(response.status));
    }
    let loggedIn = false;
    let unavailable = false;
    let calendarUnavailable = false;
    let logoutFails = false;
    const client = {
      id: "test-client",
      name: "Cliente de teste",
      email: "teste@example.com",
      image: null,
      active: true,
      partners: ["smartmed"],
    };
    let verificationCalls = 0;
    await page.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== base) return route.abort();
      if (url.pathname === "/api/dash-auth") {
        const { action } = request.postDataJSON();
        if (action === "logout" && logoutFails)
          return route.fulfill({
            status: 503,
            json: { error: "Revogação indisponível" },
          });
        if (action === "login") loggedIn = true;
        if (action === "logout") loggedIn = false;
        if (action === "verify") verificationCalls++;
        return route.fulfill({
          status: loggedIn || action === "logout" ? 200 : 401,
          json: action === "logout" ? { success: true } : { client },
        });
      }
      if (url.pathname === "/api/dash-data") {
        if (
          unavailable ||
          (calendarUnavailable && url.searchParams.get("op") === "actions")
        )
          return route.fulfill({
            status: 503,
            json: { error: "Indisponível" },
          });
        return route.fulfill({
          json:
            url.searchParams.get("op") === "partners"
              ? {
                  partners: [
                    {
                      slug: "smartmed",
                      title: "Smartmed",
                      short: "SM",
                      image: null,
                      colors: ["#112233", "#ffffff"],
                    },
                  ],
                }
              : { actions: [] },
        });
      }
      return route.continue();
    });
    await page.goto(`${base}/dash/login`);
    await page.locator("input[type=email]").fill("teste@example.com");
    await page.locator("input[type=password]").fill("senha-de-teste");
    await page.locator("button[type=submit]").click();
    await page
      .getByText("Cliente de teste", { exact: true })
      .waitFor({ timeout: 5000 });
    assert.ok(verificationCalls > 0, "Login must revalidate the layout");
    const htmlSafe = await page.evaluate(async () => {
      const { sanitizeHtml } = await import("/app/utils/sanitize.ts");
      const root = document.createElement("div");
      document.body.append(root);
      window.__auditXss = 0;
      for (const payload of [
        "<a href=javascript:window.__auditXss=1>abrir</a>",
        '<a href="java&#x73;cript:window.__auditXss=2">abrir</a>',
      ]) {
        root.innerHTML = sanitizeHtml(payload);
        root.querySelector("a").click();
        if (window.__auditXss !== 0) return false;
      }
      root.innerHTML = sanitizeHtml(
        '<video src="https://example.com/a.mp4">v</video><a href="ftp://example.com">ftp</a>',
      );
      const safe =
        !root.querySelector("video") &&
        !root.querySelector("a").hasAttribute("href");
      root.remove();
      return safe;
    });
    assert.ok(
      htmlSafe,
      "Real browser HTML parser must respect the sanitizer policy",
    );
    logoutFails = true;
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Não foi possível encerrar a sessão" })
      .waitFor();
    assert.equal(
      await page.getByText("Cliente de teste", { exact: true }).count(),
      1,
    );
    logoutFails = false;
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    await page.locator("input[type=email]").waitFor();
    assert.equal(
      await page.getByText("Cliente de teste", { exact: true }).count(),
      0,
    );
    client.id = "client-b";
    client.name = "Cliente B";
    await page.evaluate(() =>
      localStorage.setItem("uzzina_dash_client_id", "test-client"),
    );
    await page.locator("input[type=email]").fill("b@example.com");
    await page.locator("input[type=password]").fill("senha-de-teste");
    await page.locator("button[type=submit]").click();
    await page.getByText("Cliente B", { exact: true }).waitFor();
    assert.equal(
      await page.getByText("Cliente de teste", { exact: true }).count(),
      0,
    );
    const keys = await page.evaluate(async () => {
      const { getRouter } = await import("/app/router.tsx");
      return getRouter()
        .options.context.queryClient.getQueryCache()
        .getAll()
        .map((query) => query.queryKey);
    });
    assert.ok(
      keys.some((key) => key[0] === "dashActions" && key[1] === "client-b"),
      "Portal queries must use the verified server identity",
    );
    assert.ok(
      !keys.some((key) => key[0] === "dashActions" && key[1] === "test-client"),
      "Previous client cache must be removed",
    );
    loggedIn = true;
    unavailable = true;
    await page.goto(`${base}/dash`);
    await page
      .getByRole("heading", { name: "Falha ao carregar o portal" })
      .waitFor();
    unavailable = false;
    await page
      .getByRole("button", { name: "Tentar novamente", exact: true })
      .click();
    await page.getByText("Cliente B", { exact: true }).waitFor();
    calendarUnavailable = true;
    await page.goto(`${base}/dash`);
    await page
      .getByRole("heading", { name: "Falha ao carregar calendário" })
      .waitFor();
    calendarUnavailable = false;
    await page
      .getByRole("button", { name: "Tentar novamente", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Falha ao carregar calendário" })
      .waitFor({ state: "hidden" });
    assert.deepEqual(
      uncaught,
      [],
      "Route transitions must not render a child outside DashContext",
    );
    console.log(
      `PASS (${process.env.PORTAL_TEST_WIDTH || 390}px): login → portal without reload; HTML policy; failed/successful logout; A→B with server identity; bootstrap and calendar recovery; no uncaught errors. External requests blocked.`,
    );
    await context.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
