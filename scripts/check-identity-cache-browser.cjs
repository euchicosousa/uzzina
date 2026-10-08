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
        width: Number(process.env.IDENTITY_TEST_WIDTH || 1440),
        height: 900,
      },
      timezoneId: "America/Fortaleza",
    });
    await page.clock.setFixedTime(new Date("2026-10-07T15:00:00Z"));
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
      date: "2026-10-07 10:00:00",
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
    const race = process.env.IDENTITY_BOOTSTRAP_RACE === "true";
    let releaseBootstrap;
    let bootstrapArrived;
    const arrived = new Promise((resolve) => {
      bootstrapArrived = resolve;
    });
    const gate = new Promise((resolve) => {
      releaseBootstrap = resolve;
    });
    await page.route("**/*", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.origin === base) return route.continue();
      if (url.pathname === "/auth/v1/logout")
        return route.fulfill({ status: 204 });
      if (url.pathname === "/auth/v1/user")
        return route.fulfill({ json: user });
      if (url.pathname === "/rest/v1/rpc/get_app_bootstrap") {
        bootstrapArrived();
        if (race) await gate;
        return route.fulfill({ json: { person, partners } });
      }
      if (url.pathname === "/rest/v1/rpc/get_home_actions") {
        const q = req.postDataJSON();
        return route.fulfill({
          json: actions.filter(
            (a) =>
              !a.archived &&
              a.partners.some((p) => q.p_partner_slugs.includes(p)),
          ),
        });
      }
      if (url.pathname === "/rest/v1/partners") {
        const filtered =
          url.searchParams.get("archived") === "eq.false"
            ? partners.filter((p) => !p.archived)
            : partners;
        return route.fulfill({ json: filtered });
      }
      if (url.pathname === "/rest/v1/actions") {
        const id = url.searchParams.get("id");
        if (id)
          return route.fulfill({
            json: actions.find((a) => id === `eq.${a.id}`),
          });
        const overlap = url.searchParams.get("partners");
        let rows = actions.filter(
          (a) =>
            !a.archived &&
            (!overlap || a.partners.some((p) => overlap.includes(p))),
        );
        const before = url.searchParams.get("date");
        if (before?.startsWith("lt."))
          rows = rows.filter(
            (a) => a.date < before.slice(3) && a.phase !== "finished",
          );
        return route.fulfill({ json: rows });
      }
      if (url.pathname === "/rest/v1/action_comments")
        return route.fulfill({
          json: [
            {
              id: "note-a",
              action_id: "action-0",
              author_id: userId,
              author_type: "user",
              content: "NOTA PRIVADA A",
              is_internal: true,
              created_at: "2026-10-07T10:00:00Z",
            },
          ],
        });
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
        exp: 2208988800,
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
    await page.goto(`${base}/app/partner/active`);
    if (race) await arrived;
    else {
      const viewToggle = page.getByRole("button", {
        name: "Alternar Visão Feed",
      });
      await viewToggle.waitFor();
      if ((await viewToggle.getAttribute("aria-pressed")) === "true")
        await viewToggle.click();
      await page.getByText("AÇÃO ATIVA", { exact: true }).first().waitFor();
      await page.locator('[data-action-id="action-0"]').first().press("Enter");
      await page.getByRole("tab", { name: "OBSERVAÇÕES" }).click();
      await page.getByText("NOTA PRIVADA A", { exact: true }).waitFor();
    }
    const userB = {
      ...user,
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      email: "b@example.com",
    };
    const tokenB = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${Buffer.from(JSON.stringify({ sub: userB.id, exp: 2208988800, aud: "authenticated", role: "authenticated" })).toString("base64url")}.test-signature`;
    await page.route("**/auth/v1/user", (route) =>
      route.fulfill({ json: userB }),
    );
    await page.route("**/rest/v1/rpc/get_app_bootstrap", (route) =>
      route.fulfill({
        json: {
          person: {
            ...person,
            user_id: userB.id,
            id: userB.id,
            name: "Conta B",
          },
          partners: [
            { ...partners[0], title: "Parceiro B", users_ids: [userB.id] },
          ],
        },
      }),
    );
    actions.splice(0, actions.length, {
      ...actions[0],
      id: "action-b",
      title: "TRABALHO B",
      responsibles: [userB.id],
    });
    await page.evaluate(async (token) => {
      const { createSupabaseBrowserClient } =
        await import("/app/lib/supabase.client.ts");
      const { error } = await createSupabaseBrowserClient().auth.setSession({
        access_token: token,
        refresh_token: "controlled-b",
      });
      if (error) throw error;
    }, tokenB);
    const bView = page.getByRole("button", { name: "Alternar Visão Feed" });
    await bView.waitFor();
    if ((await bView.getAttribute("aria-pressed")) === "true")
      await bView.click();
    await page
      .getByText("TRABALHO B", { exact: true })
      .first()
      .waitFor({ timeout: 7000 })
      .catch(async (error) => {
        console.error(
          (await page.locator("body").innerText()).slice(0, 2000),
          errors,
        );
        throw error;
      });
    if (race) {
      const response = page.waitForResponse(
        (r) =>
          new URL(r.url()).pathname === "/rest/v1/rpc/get_app_bootstrap" &&
          r.request().postDataJSON().p_user_id === userId,
      );
      releaseBootstrap();
      await (await response).finished();
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      assert.equal(
        (await page.getByText("TRABALHO B", { exact: true }).count()) > 0,
        true,
      );
    }
    assert.equal(
      await page.getByText("NOTA PRIVADA A", { exact: true }).count(),
      0,
    );
    assert.equal(
      await page.getByText("AÇÃO ATIVA", { exact: true }).count(),
      0,
    );
    assert.equal(
      await page.getByRole("textbox", { name: "Título da ação" }).count(),
      0,
    );
    // Same-session partner invalidation must update the context without a reload.
    partners[0].title = "Parceiro atualizado";
    partners[0].short = "Parceiro atualizado";
    await page.evaluate(async () => {
      const { getRouter } = await import("/app/router.tsx");
      const queryClient = getRouter().options.context.queryClient;
      await queryClient.invalidateQueries({ queryKey: ["partners"] });
    });
    await page.keyboard.press("Control+k");
    await page
      .getByText("Parceiro atualizado", { exact: true })
      .and(page.locator(":visible"))
      .first()
      .waitFor();
    await page.keyboard.press("Escape");
    if (Number(process.env.IDENTITY_TEST_WIDTH || 1440) >= 768) {
      const nextPeriod = page.waitForRequest((req) => {
        const u = new URL(req.url());
        return (
          u.pathname === "/rest/v1/actions" &&
          u.searchParams.getAll("date").some((d) => d.startsWith("gte.2026-11"))
        );
      });
      await page
        .locator('button:has(svg[class*="chevron-right"])')
        .first()
        .click();
      await nextPeriod;
    }
    await page.evaluate(async () => {
      const { createSupabaseBrowserClient } =
        await import("/app/lib/supabase.client.ts");
      await createSupabaseBrowserClient().auth.signOut({ scope: "local" });
    });
    await page.waitForURL("**/login");
    const cache = await page.evaluate(async () => {
      const { getRouter } = await import("/app/router.tsx");
      const queryClient = getRouter().options.context.queryClient;
      return queryClient
        .getQueryCache()
        .getAll()
        .filter((q) => q.state.data !== undefined)
        .map((q) => q.queryKey);
    });
    assert.deepEqual(cache, []);
    assert.deepEqual(errors, []);
    console.log(
      `PASS ${process.env.IDENTITY_TEST_WIDTH || 1440}px race=${race}: actual app browser: account A→B without reload; only B work; reactive partners; logout removes private data. Controlled HTTP, no production writes.`,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
