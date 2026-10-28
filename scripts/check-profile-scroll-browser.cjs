// Real route and SDK with controlled HTTP. No production database requests.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const base = process.env.PORTAL_TEST_URL || "http://127.0.0.1:5176";
  const evidence = ".scratch/account-preferences/evidence";
  await fs.mkdir(evidence, { recursive: true });
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
    let release;
    let pending;
    await page.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === base) return route.continue();
      if (url.pathname === "/auth/v1/user")
        return route.fulfill({ json: user });
      if (url.pathname === "/auth/v1/logout")
        return route.fulfill({ json: {} });
      if (url.pathname === "/rest/v1/rpc/get_app_bootstrap")
        return route.fulfill({ json: { person, partners: [] } });
      if (url.pathname === "/rest/v1/people" && request.method() === "PATCH") {
        const body = request.postDataJSON();
        writes.push({ profile: body });
        if (pending) await pending;
        Object.assign(person, body);
        return route.fulfill({ json: person });
      }
      if (url.pathname === "/rest/v1/rpc/update_my_preferences") {
        const body = request.postDataJSON();
        writes.push({ preferences: body.p_patch });
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
    const title = page.getByRole("heading", {
      name: "Minha Conta",
      exact: true,
    });
    await title.waitFor();
    const prefs = page.getByRole("region", {
      name: "Preferências",
      exact: true,
    });
    const personal = page.getByRole("region", {
      name: "Informações pessoais",
      exact: true,
    });
    const save = page.getByRole("button", {
      name: "Salvar Alterações",
      exact: true,
    });
    const section = page.getByRole("radiogroup", {
      name: "Seção da conta",
      exact: true,
    });
    const geometry = async (label) => {
      const result = await page.evaluate(() => {
        const button = [...document.querySelectorAll("button")].find((b) =>
          b.textContent.includes("Salvar Alterações"),
        );
        const outer = [...document.querySelectorAll("div")].filter(
          (e) =>
            getComputedStyle(e).overflowY === "auto" && !e.hasAttribute("role"),
        );
        const region = document.querySelector(
          '[role="region"][aria-label="Preferências"]',
        );
        return {
          externalOverflow: outer.some(
            (e) => e.scrollHeight > e.clientHeight + 1,
          ),
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
          saveInHeader:
            button.parentElement.querySelector("h1")?.textContent ===
            "Minha Conta",
          ownsForm: button.form?.id === "profile-form",
          columnBottom: region.getBoundingClientRect().bottom,
          headerCutGap:
            innerWidth >= 1024
              ? region.getBoundingClientRect().top -
                button.parentElement.getBoundingClientRect().bottom
              : 0,
          columns: [...document.querySelectorAll('[role="region"]')]
            .filter((e) => e.clientHeight > 0)
            .map((e) => ({
              bottom: e.getBoundingClientRect().bottom,
              spacerHeight: e.lastElementChild?.hasAttribute(
                "data-app-bar-spacer",
              )
                ? e.lastElementChild.getBoundingClientRect().height
                : 0,
            })),
          overlapsNavigation: (() => {
            const nav =
              document.querySelector('a[title="Home"]')?.parentElement;
            if (!nav) throw new Error("AppBar not found");
            const a = button.getBoundingClientRect();
            const b = nav.getBoundingClientRect();
            return (
              a.left < b.right &&
              a.right > b.left &&
              a.top < b.bottom &&
              a.bottom > b.top
            );
          })(),
          buttonBottom: button.getBoundingClientRect().bottom,
          buttonTop: button.getBoundingClientRect().top,
          windowHeight: innerHeight,
          regionHeight: region.clientHeight,
          regionScroll: region.scrollHeight,
        };
      });
      assert.equal(
        result.externalOverflow,
        false,
        `${label}: external scrolling`,
      );
      assert.equal(
        result.horizontalOverflow,
        false,
        `${label}: horizontal overflow`,
      );
      assert(result.saveInHeader, `${label}: save must be next to Minha Conta`);
      assert(
        result.ownsForm,
        `${label}: header save must submit the complete profile form`,
      );
      assert(
        Math.abs(result.columnBottom - result.windowHeight) <= 1,
        `${label}: columns must extend to the viewport bottom`,
      );
      assert.equal(
        result.overlapsNavigation,
        false,
        `${label}: save overlaps navigation`,
      );
      assert(
        result.buttonBottom <= result.windowHeight - 16,
        `${label}: button below viewport`,
      );
      assert(result.buttonTop >= 0, `${label}: button outside viewport`);
      assert(
        Math.abs(result.headerCutGap) <= 1,
        `${label}: scrolling must clip at the Minha Conta header, gap ${result.headerCutGap}px`,
      );
      for (const column of result.columns) {
        assert(
          Math.abs(column.bottom - result.windowHeight) <= 1,
          `${label}: every visible column reaches the bottom`,
        );
        assert.equal(
          column.spacerHeight,
          98,
          `${label}: AppBar space belongs inside each scroll region`,
        );
      }
      console.log(label, result);
    };
    await geometry("desktop before scroll");
    await page.screenshot({ path: `${evidence}/desktop-initial.png` });
    const titleBefore = await title.boundingBox();
    const personalBefore = await personal.boundingBox();
    const buttonBefore = await save.boundingBox();
    await prefs.hover();
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(200);
    assert(await prefs.evaluate((e) => e.scrollTop > 0));
    assert.equal((await title.boundingBox()).y, titleBefore.y);
    assert.equal((await personal.boundingBox()).y, personalBefore.y);
    assert.equal((await save.boundingBox()).y, buttonBefore.y);
    await prefs.locator("#showInstagramSidebar").focus();
    const focused = await page.locator(":focus").boundingBox();
    const visibleBottom = await prefs.evaluate(
      (e) => e.getBoundingClientRect().bottom,
    );
    assert(
      focused.y + focused.height <= visibleBottom - 98,
      "Last preference must be reachable above floating AppBar",
    );
    await page.keyboard.press("Shift+Tab");
    assert(await prefs.evaluate((e) => e.contains(document.activeElement)));
    await personal.focus();
    await page.keyboard.press("Shift+Tab");
    assert(
      await save.evaluate((e) => e === document.activeElement),
      "Header save precedes personal fields in keyboard order",
    );
    await page.keyboard.press("Tab");
    assert(await personal.evaluate((e) => e === document.activeElement));
    await prefs
      .getByRole("radio", { name: "Personalizado", exact: true })
      .click();
    await geometry("desktop custom theme");
    await page.screenshot({ path: `${evidence}/desktop.png` });
    for (const size of [
      { width: 1024, height: 600 },
      { width: 390, height: 700 },
      { width: 390, height: 480 },
      { width: 720, height: 450 },
    ]) {
      await page.setViewportSize(size);
      await page.waitForTimeout(150);
      await geometry(`${size.width}x${size.height}`);
      assert(await prefs.isVisible());
    }
    // Compact layouts preserve both mounted sections and the single form.
    await section
      .getByRole("radio", { name: "Informações pessoais", exact: true })
      .click();
    await page.getByLabel("Nome", { exact: true }).fill("Nome alterado");
    await page.getByLabel("Sobrenome", { exact: true }).fill("");
    await section
      .getByRole("radio", { name: "Preferências", exact: true })
      .click();
    await save.click();
    assert(
      await personal.isVisible(),
      "Invalid personal field must reveal its section",
    );
    assert(
      await page
        .getByLabel("Sobrenome", { exact: true })
        .evaluate((e) => e === document.activeElement),
    );
    assert.equal(writes.length, 0, "Invalid form must not write");
    await page.getByLabel("Sobrenome", { exact: true }).fill("Teste");
    await section
      .getByRole("radio", { name: "Preferências", exact: true })
      .click();
    await prefs.getByRole("radio", { name: "Bloco", exact: true }).click();
    pending = new Promise((resolve) => {
      release = resolve;
    });
    await save.click();
    const saving = page.getByRole("button", {
      name: "Salvando...",
      exact: true,
    });
    await saving.waitFor();
    assert(await saving.isDisabled());
    assert.equal(writes.length, 1);
    fail = true;
    pending = undefined;
    release();
    await page
      .getByText("Erro ao salvar configurações.", { exact: true })
      .waitFor();
    assert.equal(
      await prefs
        .getByRole("radio", { name: "Bloco", exact: true })
        .getAttribute("aria-checked"),
      "true",
    );
    fail = false;
    await save.click();
    await page
      .getByText("Perfil e preferências salvos com sucesso!", { exact: true })
      .waitFor();
    assert.equal(
      writes.length,
      4,
      "One profile + one preferences call per valid submission",
    );
    assert.equal(person.name, "Nome alterado");
    assert.equal(person.preferences.defaultViewVariant, "block");
    assert.equal(person.preferences.futureKey, "preserve");
    await prefs.getByRole("radio", { name: "Escuro", exact: true }).click();
    assert.equal(
      await prefs
        .getByRole("radio", { name: "Escuro", exact: true })
        .getAttribute("aria-checked"),
      "true",
    );
    await geometry("compact dark");
    await page.setViewportSize({ width: 390, height: 700 });
    await page.waitForTimeout(4500);
    await page.screenshot({ path: `${evidence}/mobile-dark.png` });
    await section
      .getByRole("radio", { name: "Informações pessoais", exact: true })
      .click();
    assert.equal(
      await page.getByLabel("Nome", { exact: true }).inputValue(),
      "Nome alterado",
    );
    await page.getByLabel("Nome", { exact: true }).press("Enter");
    await page.waitForFunction(
      () =>
        ![...document.querySelectorAll("button")].some((b) =>
          b.textContent.includes("Salvando..."),
        ),
    );
    assert.equal(writes.length, 6, "Enter submits the same complete form");
    assert.deepEqual(errors, []);
    console.log(
      "PASS: independent columns to viewport bottom with internal AppBar space, header save, compact sections, validation focus, keyboard, profile+preferences submit, failure/retry, merge; controlled HTTP only.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
