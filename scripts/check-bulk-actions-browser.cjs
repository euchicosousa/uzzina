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
    let allowRetry = false;
    const patches = [];
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
        const q = req.postDataJSON();
        scopes.push(q.p_partner_slugs);
        return route.fulfill({
          json: actions.filter(
            (a) =>
              !a.archived &&
              a.partners.some((p) => q.p_partner_slugs.includes(p)),
          ),
        });
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
          const id = url.searchParams.get("id")?.slice(3);
          const row = actions.find((a) => a.id === id);
          const patch = req.postDataJSON();
          patches.push({
            id,
            patch,
            version: url.searchParams.get("updated_at"),
          });
          if (id?.startsWith("3"))
            return route.fulfill({
              status: 406,
              json: { code: "PGRST116", message: "Zero rows" },
            });
          if (!allowRetry && (id?.startsWith("4") || id?.startsWith("5")))
            return route.fulfill({
              status: 403,
              json: { code: "42501", message: "Falha controlada" },
            });
          Object.assign(row, patch, {
            updated_at: "2026-10-07T15:00:00.000001Z",
          });
          return route.fulfill({ json: row });
        }
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
    console.log("Selecting actions");
    await revealBar();
    await page.locator("button:has(svg.lucide-circle-check-big)").click();
    await page
      .getByRole("button", { name: "Selecione as ações", exact: true })
      .waitFor();
    await page.locator("body").click({ position: { x: 5, y: 200 } });
    await page.keyboard.press("Control+a");
    await page
      .getByRole("button", { name: "5 Selecionadas", exact: true })
      .waitFor()
      .catch(async (error) => {
        console.error((await page.locator("body").innerText()).slice(-2200));
        throw error;
      });
    // Text selection must not replace the existing selected set.
    const search = page.getByPlaceholder("Buscar ação...");
    await search.focus();
    await page.keyboard.press("Control+a");
    assert.equal(
      await page
        .getByRole("button", { name: "5 Selecionadas", exact: true })
        .count(),
      1,
    );
    await revealBar();
    await page
      .getByRole("button", { name: "5 Selecionadas", exact: true })
      .click();
    await page.getByRole("menuitem", { name: "Arquivar", exact: true }).click();
    await page
      .getByRole("button", { name: "Arquivar 5 ações", exact: true })
      .click();
    await page
      .getByRole("button", { name: "3 Selecionadas", exact: true })
      .waitFor();
    await page
      .getByText("2 ação(ões) atualizada(s)!", { exact: true })
      .waitFor();
    await page
      .getByText("3 ação(ões) não atualizada(s).", { exact: true })
      .waitFor();
    assert.equal(patches.length, 5);
    assert.ok(
      patches.every(
        (p) =>
          p.version === "eq.2026-01-01T00:00:00.000000Z" &&
          p.patch.sprints === null &&
          !("updated_at" in p.patch),
      ),
    );
    // A conflict cannot be retried by silently using a refreshed version.
    await revealBar();
    await page
      .getByRole("button", { name: "3 Selecionadas", exact: true })
      .click();
    await page.getByRole("menuitem", { name: "Arquivar", exact: true }).click();
    await page
      .getByRole("button", { name: "Arquivar 3 ações", exact: true })
      .click();
    await page
      .getByText(
        "Recarregue e confira as ações em conflito antes de tentar novamente.",
        { exact: true },
      )
      .waitFor();
    assert.equal(patches.length, 5);
    // A filter producing no actions clears selection and disables operations.
    await search.fill("NENHUMA AÇÃO EXISTE");
    await page
      .getByRole("button", { name: "Selecione as ações", exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Selecione as ações", exact: true })
        .isDisabled(),
      true,
    );
    assert.equal(patches.length, 5);
    await search.fill("");
    await page
      .locator('[data-action-id="41111111-1111-4111-8111-111111111111"]')
      .click({ position: { x: 5, y: 5 } });
    await page
      .locator('[data-action-id="51111111-1111-4111-8111-111111111111"]')
      .click({ position: { x: 5, y: 5 } });
    await page
      .getByRole("button", { name: "2 Selecionadas", exact: true })
      .waitFor()
      .catch(async (error) => {
        console.error((await page.locator("body").innerText()).slice(-1600));
        throw error;
      });
    allowRetry = true;
    await revealBar();
    await page
      .getByRole("button", { name: "2 Selecionadas", exact: true })
      .click();
    await page.getByRole("menuitem", { name: "Arquivar", exact: true }).click();
    await page
      .getByRole("button", { name: "Arquivar 2 ações", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Selecione as ações", exact: true })
      .waitFor();
    assert.equal(patches.length, 7);
    assert.deepEqual(
      patches.slice(5).map((p) => p.id),
      actions.slice(3).map((a) => a.id),
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS real browser bulk: 2 confirmed, 1 conflict, 2 failures; 3 remain selected; CAS and sprint cleanup; conflict retry blocked; empty filter disables writes; input Cmd+A preserved; retry writes only the two failed actions. Controlled HTTP only.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
