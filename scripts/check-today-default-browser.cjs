// Real route and SDK with controlled HTTP. No production database requests.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const base = process.env.PORTAL_TEST_URL || "http://127.0.0.1:5176";
  const evidence = await fs.mkdtemp(join(tmpdir(), "uzzina-today-browser-"));
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.routeWebSocket(/.*/, (socket) => socket.close());
    const userId = "11111111-1111-4111-8111-111111111111";
    const user = {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: "profile@test.invalid",
      app_metadata: { provider: "email" },
      user_metadata: {},
      created_at: "2026-01-01T00:00:00Z",
    };
    const person = {
      id: userId,
      user_id: userId,
      name: "Perfil",
      surname: "Teste",
      short: "Perfil",
      initials: "PT",
      admin: true,
      visible: true,
      areas: [],
      image: null,
      email: user.email,
      preferences: {
        theme: "light",
        themeColorIndex: 0,
        futureKey: "preserve",
      },
    };
    const writes = [];
    let fail = false;
    let themeGate;
    let releaseTheme;

    await page.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === base) return route.continue();
      if (url.pathname === "/auth/v1/user")
        return route.fulfill({ json: user });
      if (url.pathname === "/auth/v1/logout")
        return route.fulfill({ json: {} });
      if (url.pathname === "/rest/v1/rpc/get_home_actions")
        return route.fulfill({ json: [] });
      if (url.pathname === "/rest/v1/rpc/get_app_bootstrap")
        return route.fulfill({ json: { person, partners: [] } });
      if (url.pathname === "/rest/v1/people" && request.method() === "PATCH") {
        const body = request.postDataJSON();
        writes.push({ profile: body });
        Object.assign(person, body);
        return route.fulfill({ json: person });
      }
      if (url.pathname === "/rest/v1/rpc/update_my_preferences") {
        const body = request.postDataJSON();
        writes.push({ preferences: body.p_patch });
        if (themeGate && !Object.hasOwn(body.p_patch, "defaultTodayView")) {
          const snapshot = { ...person.preferences, ...body.p_patch };
          Object.assign(person.preferences, body.p_patch);
          await themeGate;
          return route.fulfill({ json: snapshot });
        }

        if (fail)
          return route.fulfill({
            status: 503,
            json: { message: "Controlled failure" },
          });
        Object.assign(person.preferences, body.p_patch);
        return route.fulfill({ json: person.preferences });
      }
      if (request.method() === "GET" && url.pathname.startsWith("/rest/v1/"))
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
    const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${payload}.controlled`;
    await page.evaluate(async (accessToken) => {
      const { createSupabaseBrowserClient } =
        await import("/app/lib/supabase.client.ts");
      const { error } = await createSupabaseBrowserClient().auth.setSession({
        access_token: accessToken,
        refresh_token: "controlled-refresh",
      });
      if (error) throw error;
    }, token);
    await page.goto(`${base}/app/profile`);

    const save = page.getByRole("button", {
      name: "Salvar Alterações",
      exact: true,
    });
    const initial = page.getByRole("radiogroup", {
      name: "Visualização inicial do Hoje",
      exact: true,
    });
    const viewToggle = page.getByRole("radiogroup", {
      name: "Opções de Visualização da Home",
      exact: true,
    });
    const modes = [
      { id: "kanban", label: "Kanban", view: "Visão por Kanban" },
      { id: "categories", label: "Categorias", view: "Visão por Categorias" },
      { id: "feed", label: "Feed", view: "Visão por Feed" },
      { id: "partners", label: "Parceiros", view: "Visão por Parceiros" },
    ];
    const assertView = async (mode) => {
      await viewToggle
        .getByRole("radio", { name: mode.view, exact: true })
        .waitFor();
      assert.equal(
        await viewToggle
          .getByRole("radio", { name: mode.view, exact: true })
          .getAttribute("aria-checked"),
        "true",
      );
    };
    await page
      .getByRole("heading", { name: "Minha Conta", exact: true })
      .waitFor();
    assert.equal(
      await initial
        .getByRole("radio", { name: "Parceiros", exact: true })
        .getAttribute("aria-checked"),
      "true",
    );
    for (const [index, mode] of modes.entries()) {
      await page.goto(`${base}/app/profile`);
      await initial
        .getByRole("radio", { name: mode.label, exact: true })
        .click();
      const before = writes.length;
      await page.waitForTimeout(350);
      assert.equal(
        writes.length,
        before,
        "Choosing a default must stay a local draft",
      );
      if (index === 0) {
        fail = true;
        await save.click();
        await page
          .getByText("Erro ao salvar configurações.", { exact: true })
          .waitFor();
        assert.equal(
          await initial
            .getByRole("radio", { name: mode.label, exact: true })
            .getAttribute("aria-checked"),
          "true",
        );
        assert.equal(person.preferences.defaultTodayView, undefined);
        fail = false;
      }
      await save.click();
      await page
        .getByText("Perfil e preferências salvos com sucesso!", { exact: true })
        .waitFor();
      assert.equal(person.preferences.defaultTodayView, mode.id);
      assert.equal(person.preferences.futureKey, "preserve");
      await page.goto(`${base}/app`);
      await assertView(mode);
      const beforeManual = writes.length;
      const manual = modes[(index + 1) % modes.length];
      await viewToggle
        .getByRole("radio", { name: manual.view, exact: true })
        .click();
      await assertView(manual);
      await page.waitForTimeout(350);
      assert.equal(
        writes.length,
        beforeManual,
        "Manual view changes must not autosave",
      );
      await page.reload();
      await assertView(mode);
      await page.goto(`${base}/app/today?date=2026-10-28`);
      await assertView(mode);
      await viewToggle
        .getByRole("radio", { name: manual.view, exact: true })
        .click();
      await page
        .locator("[data-today-page] button")
        .filter({ has: page.locator("svg.lucide-chevron-right") })
        .click();
      await assertView(manual);
      assert(page.url().includes("2026-10-29"));
      await page.reload();
      await assertView(mode);
    }
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto(`${base}/app/profile`);
    await initial
      .getByRole("radio", { name: "Categorias", exact: true })
      .click();
    await initial
      .getByRole("radio", { name: "Categorias", exact: true })
      .focus();
    await page.screenshot({ path: `${evidence}/today-default-mobile.png` });
    await save.click();
    await page
      .getByText("Perfil e preferências salvos com sucesso!", { exact: true })
      .waitFor();
    await page.goto(`${base}/app/today`);
    await assertView(modes[1]);
    await page.screenshot({ path: `${evidence}/today-default-dedicated.png` });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${base}/app/profile`);
    await initial.waitFor();
    themeGate = new Promise((resolve) => {
      releaseTheme = resolve;
    });
    const themeRequest = page.waitForRequest(
      (request) =>
        new URL(request.url()).pathname ===
          "/rest/v1/rpc/update_my_preferences" &&
        !Object.hasOwn(request.postDataJSON().p_patch, "defaultTodayView"),
    );
    await page
      .getByRole("button", { name: "Menu do perfil do usuário" })
      .click();
    await page
      .getByRole("menuitem", { name: "Tema escuro", exact: true })
      .click();
    await themeRequest;
    await initial.getByRole("radio", { name: "Feed", exact: true }).click();
    await save.click();
    await page
      .getByText("Perfil e preferências salvos com sucesso!", { exact: true })
      .waitFor();
    const themeResponse = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname ===
          "/rest/v1/rpc/update_my_preferences" &&
        !Object.hasOwn(
          response.request().postDataJSON().p_patch,
          "defaultTodayView",
        ),
    );
    releaseTheme();
    await themeResponse;
    themeGate = undefined;
    await page.waitForTimeout(150);
    await page.locator('a[title="Home"]').click();
    await assertView(modes[2]);
    assert.equal(person.preferences.defaultTodayView, "feed");
    assert.deepEqual(errors, []);

    console.log(
      "PASS: four saved defaults in Home + Today; legacy fallback; draft does not write; failure/retry; manual override does not persist; date change preserves manual mode; reload restores default; unknown fields preserved; mobile selector and dedicated page.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
