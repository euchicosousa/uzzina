// Actual app and Supabase SDK; HTTP controlled. No production access.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  try {
    const base = process.env.PORTAL_TEST_URL || "http://127.0.0.1:5176";
    const page = await browser.newPage({
      viewport: {
        width: Number(process.env.DRAWER_TEST_WIDTH || 1440),
        height: 900,
      },
      timezoneId: "America/Fortaleza",
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const userId = "11111111-1111-4111-8111-111111111111";
    const user = {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: "test@example.com",
      app_metadata: { provider: "email" },
      user_metadata: {},
      created_at: "2026-01-01T00:00:00Z",
    };
    const person = {
      id: userId,
      user_id: userId,
      name: "Administrador teste",
      surname: "Teste",
      short: "Teste",
      initials: "AT",
      admin: true,
      visible: true,
      areas: [],
      image: null,
      email: user.email,
      preferences: null,
    };
    const partners = [
      {
        id: "p-active",
        slug: "active",
        title: "Parceiro ativo",
        short: "Ativo",
        archived: false,
        users_ids: [userId],
        image: null,
        colors: ["#123456", "#ffffff"],
        sow: "social",
      },
      {
        id: "p-hidden",
        slug: "hidden",
        title: "Parceiro oculto",
        short: "Oculto",
        archived: true,
        users_ids: [userId],
        image: null,
        colors: ["#123456", "#ffffff"],
        sow: "social",
      },
    ];
    const actions = partners.map((p, i) => ({
      id: `action-${i}`,
      title: i ? "AÇÃO OCULTA" : "AÇÃO ATIVA",
      partners: [p.slug],
      responsibles: [userId],
      sprints: [],
      date: "2026-01-01T12:00:00Z",
      phase: "do",
      category: "design",
      priority: "medium",
      color: "#123456",
      description: null,
      content_files: [],
      work_files: [],
      instagram_caption: "",
      archived: false,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    }));
    const partnerRequests = [];
    const scopes = [];
    const writes = [];
    let failWrite = false;
    await page.route("**/*", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.origin === base) return route.continue();
      if (url.pathname === "/auth/v1/user")
        return route.fulfill({ json: user });
      if (url.pathname === "/rest/v1/rpc/get_app_bootstrap")
        return route.fulfill({ json: { person, partners } });
      if (url.pathname === "/rest/v1/rpc/get_home_actions") {
        scopes.push(req.postDataJSON().p_partner_slugs);
        return route.fulfill({ json: actions });
      }
      if (url.pathname === "/rest/v1/partners") {
        partnerRequests.push(url.searchParams.get("archived"));
        const filtered =
          url.searchParams.get("archived") === "eq.false"
            ? partners.filter((p) => !p.archived)
            : partners;
        return route.fulfill({ json: filtered });
      }
      if (url.pathname === "/rest/v1/actions") {
        if (req.method() === "PATCH") {
          const patch = req.postDataJSON();
          const expected = url.searchParams.get("updated_at");
          writes.push({ patch, expected });
          if (failWrite)
            return route.fulfill({
              status: 503,
              json: { code: "XX000", message: "Controlled write failure" },
            });
          assert.equal(expected, `eq.${actions[0].updated_at}`);
          Object.assign(actions[0], patch, {
            updated_at: `2026-10-06T23:00:${String(writes.length).padStart(2, "0")}.000Z`,
          });
          return route.fulfill({ json: actions[0] });
        }
        return route.fulfill({ json: actions });
      }
      if (url.pathname === "/rest/v1/people")
        return route.fulfill({ json: [person] });
      if (url.pathname.startsWith("/rest/v1/"))
        return route.fulfill({ json: [] });
      return route.abort();
    });
    await page.goto(`${base}/login`);
    const payload = Buffer.from(
      JSON.stringify({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 3600,
        aud: "authenticated",
        role: "authenticated",
      }),
    ).toString("base64url");
    const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${payload}.test-signature`;
    await page.evaluate(async (token) => {
      const { createSupabaseBrowserClient } =
        await import("/app/lib/supabase.client.ts");
      const { error } = await createSupabaseBrowserClient().auth.setSession({
        access_token: token,
        refresh_token: "controlled-test-refresh",
      });
      if (error) throw error;
    }, token);
    await page.goto(`${base}/app`);
    await page
      .getByRole("heading", { name: "Atrasadas", exact: true })
      .waitFor();
    await page
      .getByText("AÇÃO ATIVA", { exact: true })
      .first()
      .waitFor({ timeout: 7000 })
      .catch(async (error) => {
        console.error((await page.locator("body").innerText()).slice(0, 1800));
        throw error;
      });

    const openDrawer = async () => {
      await page.locator('[data-action-id="action-0"]').first().press("Enter");
      await page.getByRole("button", { name: "Fechar", exact: true }).waitFor();
    };
    await openDrawer();
    await page.getByRole("button", { name: "Fechar", exact: true }).click();
    await page
      .getByRole("button", { name: "Fechar", exact: true })
      .waitFor({ state: "hidden" });
    assert.equal(writes.length, 0, "Viewing and closing must not write");
    await openDrawer();
    await page
      .locator("[role=button]")
      .filter({ hasText: /quinta, 01 de janeiro/ })
      .click();
    // Calendar DOM activation exercises its real callback; this does not certify touch gestures.
    await page.evaluate(() => {
      const day = [
        ...document.querySelectorAll("[role=gridcell] [role=button]"),
      ].find((e) => e.textContent.trim() === "2");
      if (!day) throw Error("Day2 not found");
      day.click();
    });
    await page.keyboard.press("Escape");
    await page
      .locator("[role=button]")
      .filter({ hasText: /sexta, 02 de janeiro/ })
      .waitFor();
    assert.equal(writes.length, 1);
    assert.deepEqual(writes[0].patch, { date: "2026-01-02 09:00:00" });
    await page.getByRole("button", { name: "Atualizar", exact: true }).click();
    assert.equal(
      writes.length,
      1,
      "Redundant save after confirmed date must not write",
    );
    failWrite = true;
    await page
      .getByRole("textbox", { name: "Título da ação" })
      .fill("Local title retained");
    if (Number(process.env.DRAWER_TEST_WIDTH || 1440) < 640) {
      await page.getByRole("button", { name: "Fechar", exact: true }).click();
    } else {
      await page
        .getByRole("button", { name: "Fechar painel de edição" })
        .click({ position: { x: 10, y: 20 } });
    }
    await page.getByTestId("drawer-error-banner").waitFor();
    assert.equal(
      await page.getByRole("textbox", { name: "Título da ação" }).inputValue(),
      "Local title retained",
    );
    assert.equal(
      await page.getByRole("button", { name: "Fechar", exact: true }).count(),
      1,
    );
    failWrite = false;
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await page.getByTestId("drawer-error-banner").waitFor({ state: "hidden" });
    assert.equal(actions[0].title, "Local title retained");
    await page.getByRole("button", { name: "Fechar", exact: true }).click();
    await page
      .getByRole("button", { name: "Fechar", exact: true })
      .waitFor({ state: "hidden" });
    assert.deepEqual(errors, []);
    console.log(
      "PASS real browser: unchanged close; drawer date; redundant update; failed close preserves draft; retry saves. External HTTP controlled; no production writes.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
