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
    const width = Number(process.env.REVIEW_TEST_WIDTH || 1440);
    const context = await browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
      viewport: { width, height: 900 },
      hasTouch: width < 768,
      isMobile: width < 768,
      timezoneId: "America/Fortaleza",
    });
    const page = await context.newPage();
    const activate = (locator) =>
      width < 768 ? locator.tap() : locator.click();
    await page.clock.setFixedTime(new Date("2026-10-07T15:00:00Z"));
    page.setDefaultTimeout(10000);
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
    const actions = Array.from({ length: 5 }, (_, i) => {
      const p = partners[0];
      return {
        id: `${i + 1}1111111-1111-4111-8111-111111111111`,
        title: `AÇÃO ATIVA ${i + 1}`,
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
        updated_at: "2026-01-01T00:00:00.000000Z",
      };
    });
    const reviewRequests = [];
    let reviewUnavailable = false;
    let reviewStatus = 200;
    await page.route("**/*", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.origin === base && url.pathname === "/api/review-links") {
        assert.equal(req.method(), "POST");
        assert.ok(req.headers().authorization.startsWith("Bearer "));
        reviewRequests.push(req.postDataJSON());
        return route.fulfill({
          status: reviewUnavailable ? 503 : 200,
          json: reviewUnavailable
            ? { error: "Falha controlada de revisão" }
            : {
                link: { url: "/dash/review/active?r=controlled-review-token" },
              },
        });
      }
      if (url.origin === base) return route.continue();
      if (url.pathname === "/auth/v1/user")
        return route.fulfill({ json: user });
      if (url.pathname === "/rest/v1/rpc/get_app_bootstrap")
        return route.fulfill({ json: { person, partners } });
      if (url.pathname === "/rest/v1/rpc/get_home_actions")
        return route.fulfill({ json: actions });
      if (url.pathname === "/rest/v1/partners")
        return route.fulfill({ json: partners.filter((p) => !p.archived) });
      if (url.pathname === "/rest/v1/actions")
        return route.fulfill({ json: actions });
      if (url.pathname === "/rest/v1/people")
        return route.fulfill({ json: [person] });
      if (url.pathname.startsWith("/rest/v1/"))
        return route.fulfill({ json: [] });
      return route.abort();
    });
    console.log("Opening local app");
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
    console.log("Opening partner view");
    await page.goto(`${base}/app/partner/active`);
    const viewToggle = page.getByRole("button", {
      name: "Alternar Visão Feed",
    });
    await viewToggle.waitFor();
    if ((await viewToggle.getAttribute("aria-pressed")) === "true")
      await viewToggle.click();
    await page
      .getByText("AÇÃO ATIVA 1", { exact: true })
      .first()
      .waitFor({ timeout: 7000 })
      .catch(async (error) => {
        console.error((await page.locator("body").innerText()).slice(0, 1800));
        throw error;
      });

    const revealBar = async () => {
      const reveal = page.getByRole("button", {
        name: "Revelar barra de navegação",
      });
      if (await reveal.isVisible()) await reveal.click();
    };
    await revealBar();
    await activate(page.locator("button:has(svg.lucide-circle-check-big)"));
    await page.locator("body").click({ position: { x: 5, y: 200 } });
    await page.keyboard.press("Control+a");
    const selected = page.getByRole("button", {
      name: "5 Selecionadas",
      exact: true,
    });
    await selected.waitFor();
    await revealBar();
    // Open the real menu using keyboard, verify Escape restores its trigger.
    await selected.focus();
    await page.keyboard.press("Enter");
    const share = page.getByRole("menuitem", {
      name: "Compartilhar para Revisão",
      exact: true,
    });
    await share.waitFor();
    await page.keyboard.press("Escape");
    await page.waitForFunction(() =>
      document.activeElement?.textContent?.includes("5 Selecionadas"),
    );
    reviewUnavailable = true;
    await activate(selected);
    await activate(share);
    await page
      .getByText("Falha controlada de revisão", { exact: true })
      .waitFor();
    assert.equal(await selected.count(), 1);
    reviewUnavailable = false;
    await revealBar();
    await activate(selected);
    await activate(share);
    await page
      .getByText("Link seguro de revisão copiado!", { exact: true })
      .waitFor();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(
      copied,
      `${base}/dash/review/active?r=controlled-review-token`,
    );
    assert.deepEqual(
      reviewRequests,
      [1, 2].map(() => ({
        partner_slug: "active",
        action_ids: actions.map((a) => a.id),
      })),
    );
    // New browser context has no team/client identity or cookies.
    const publicContext = await browser.newContext({
      viewport: { width, height: 900 },
      hasTouch: width < 768,
      isMobile: width < 768,
    });
    const publicPage = await publicContext.newPage();
    publicPage.setDefaultTimeout(10000);
    publicPage.on("pageerror", (e) => errors.push(e.message));
    await publicPage.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== base) return route.abort();
      if (url.pathname === "/api/dash-auth")
        return route.fulfill({ status: 401, json: { error: "Sem sessão" } });
      if (url.pathname === "/api/review") {
        assert.equal(url.searchParams.get("r"), "controlled-review-token");
        const invalid = url.searchParams.get("slug") !== "active";
        return route.fulfill({
          status: invalid ? 404 : reviewStatus,
          json:
            invalid || reviewStatus !== 200
              ? { error: "Indisponível" }
              : {
                  partner: partners[0],
                  actions: actions.map((a) => ({
                    id: a.id,
                    title: a.title,
                    date: a.date,
                    category: a.category,
                    partners: a.partners,
                    content_description:
                      '<p>CONTEÚDO PÚBLICO <img src=x onerror="window.__auditXss=1"><a href="javascript:window.__auditXss=2">Link malicioso</a></p>',
                    instagram_caption: "Legenda pública",
                  })),
                },
        });
      }
      return route.continue();
    });
    await publicPage.goto(copied);
    await publicPage
      .getByRole("heading", { name: "Parceiro ativo", exact: true })
      .waitFor()
      .catch(async (e) => {
        console.error(
          publicPage.url(),
          await publicPage.locator("body").innerText(),
        );
        throw e;
      });
    await publicPage.getByText("AÇÃO ATIVA 1", { exact: true }).waitFor();
    assert.equal(
      await publicPage.locator('img[onerror],a[href^="javascript:"]').count(),
      0,
    );
    await publicPage
      .getByText("Link malicioso", { exact: true })
      .first()
      .click();
    assert.equal(await publicPage.evaluate(() => window.__auditXss || 0), 0);
    await publicPage.goto(`${copied}&ids=unauthorized-extra`);
    await publicPage.getByText("AÇÃO ATIVA 1", { exact: true }).waitFor();
    await publicPage.goto(copied.replace("/active?", "/other?"));
    await publicPage
      .getByText("Este link de revisão expirou, foi revogado ou é inválido.", {
        exact: true,
      })
      .waitFor();
    reviewStatus = 404;
    await publicPage.goto(copied);
    await publicPage
      .getByText("Este link de revisão expirou, foi revogado ou é inválido.", {
        exact: true,
      })
      .waitFor();
    reviewStatus = 503;
    await publicPage.reload();
    await publicPage
      .getByText("Falha ao carregar a revisão. Tente novamente mais tarde.", {
        exact: true,
      })
      .waitFor();
    await publicPage.goto(`${base}/dash/review/active?ids=guessed`);
    await publicPage
      .getByRole("heading", { name: "Link Descontinuado", exact: true })
      .waitFor();
    await publicPage.goto(`${base}/dash/review/active`);
    await publicPage
      .getByRole("heading", { name: "Link Inválido", exact: true })
      .waitFor();
    await publicPage.goto(`${base}/dash/action/guessed`);
    await publicPage.locator("input[type=email]").waitFor();
    assert.ok(publicPage.url().includes("/dash/login"));
    assert.deepEqual(errors, []);
    await publicContext.close();
    await context.close();
    console.log(
      `PASS ${width}px actual review generation failure/retry, exact selected scope, real clipboard, keyboard menu focus return; public unauthenticated view, sanitized HTML, tampered slug/extra IDs, denied link, service failure and legacy/missing token. HTTP controlled; expiration/revocation enforcement belongs to handler/database tests.`,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
