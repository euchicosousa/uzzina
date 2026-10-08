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
      viewport: { width: 1440, height: 900 },
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
      if (url.pathname === "/rest/v1/actions")
        return route.fulfill({ json: actions });
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
    assert.equal(
      await page.getByText("AÇÃO OCULTA", { exact: true }).count(),
      0,
    );
    assert.equal(
      await page.locator('a[href="/app/partner/hidden"]').count(),
      0,
    );
    await page.goto(`${base}/app/admin/partners`);
    await page.getByText("Parceiro oculto", { exact: true }).waitFor();
    assert.equal(
      await page.getByText("Parceiro ativo", { exact: true }).count(),
      1,
    );
    await page.locator('a[href="/app"]').first().click();
    await page
      .getByRole("heading", { name: "Atrasadas", exact: true })
      .waitFor();
    assert.equal(
      await page.getByText("AÇÃO OCULTA", { exact: true }).count(),
      0,
    );
    assert.equal(
      await page.locator('a[href="/app/partner/hidden"]').count(),
      0,
    );
    const lateMetric = page
      .locator("div.truncate")
      .filter({ hasText: /^Atrasadas$/ })
      .locator("..");
    assert.equal(
      await lateMetric.locator("span").last().innerText(),
      "1",
      "Late counter must exclude the hidden action",
    );
    assert.ok(partnerRequests.includes("eq.false"));
    assert.ok(
      partnerRequests.includes(null),
      "Admin listing must include archived",
    );
    assert.ok(
      scopes.length > 0 && scopes.every((scope) => !scope.includes("hidden")),
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: archived partner excluded from home/actions/late scope; admin still lists archived; returning from admin does not contaminate home. Actual UI/SDK, controlled HTTP.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
