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
    const social = true;
    const actions = partners.map((p, i) => ({
      id: `action-${i}`,
      title: i ? "AÇÃO OCULTA" : "AÇÃO ATIVA",
      partners: [p.slug],
      responsibles: [userId],
      sprints: [],
      date: "2026-01-01T12:00:00Z",
      phase: "do",
      category: social ? "post" : "design",
      priority: "medium",
      color: "#123456",
      description: social ? "<p>Existing description.</p>" : null,
      content_description: social ? "<p>Existing content.</p>" : null,
      content_files: ["https://media.test/preview.png"],
      work_files: [],
      instagram_caption: "",
      archived: false,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    }));
    actions.splice(
      1,
      1,
      { ...actions[0], id: "action-1", title: "AÇÃO SECUNDÁRIA" },
      { ...actions[0], id: "action-2", title: "AÇÃO TERCEIRA" },
    );
    const partnerRequests = [];
    const scopes = [];
    const writes = [];
    let failWrite = false;
    await page.route("**/*", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.origin === base) return route.continue();
      if (url.hostname === "media.test")
        return route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750"><rect width="600" height="750" fill="#245950"/><circle cx="300" cy="320" r="180" fill="#ead4ac"/><text x="300" y="620" font-family="sans-serif" font-size="50" text-anchor="middle" fill="white">UZZINA</text></svg>',
        });
      if (url.pathname === "/auth/v1/user")
        return route.fulfill({ json: user });
      if (url.pathname === "/auth/v1/logout")
        return route.fulfill({ status: 204 });
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
        const id = (url.searchParams.get("id") || "").replace(/^eq\./, "");
        const row = actions.find((action) => action.id === id);
        if (req.method() === "PATCH") {
          if (!row) throw new Error("Unknown action in controlled update");
          const patch = req.postDataJSON();
          writes.push({ id, patch, method: "PATCH" });
          if (failWrite)
            return route.fulfill({
              status: 503,
              json: { code: "XX000", message: "Controlled write failure" },
            });
          assert.equal(
            url.searchParams.get("updated_at"),
            `eq.${row.updated_at}`,
          );
          Object.assign(row, patch, {
            updated_at: `2026-10-27T20:00:${String(writes.length).padStart(2, "0")}.000Z`,
          });
          return route.fulfill({ json: row });
        }
        if (req.method() === "POST") {
          const patch = req.postDataJSON();
          const created = {
            ...actions[0],
            ...patch,
            id: "action-created",
            updated_at: "2026-10-27T20:01:00.000Z",
          };
          actions.push(created);
          writes.push({ id: created.id, patch, method: "POST" });
          return route.fulfill({ status: 201, json: created });
        }
        if (row) return route.fulfill({ json: row });
        const title = (url.searchParams.get("title") || "")
          .replace(/^ilike\./, "")
          .replaceAll("%", "")
          .toLowerCase();
        return route.fulfill({
          json: actions.filter((entry) =>
            entry.title.toLowerCase().includes(title),
          ),
        });
      }
      if (url.pathname === "/rest/v1/people")
        return route.fulfill({ json: [person] });
      if (url.pathname === "/rest/v1/rpc/update_my_preferences") {
        person.preferences = {
          ...(person.preferences || {}),
          ...req.postDataJSON().p_patch,
        };
        return route.fulfill({ json: person.preferences });
      }
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
    if (process.env.DRAWER_TEST_PREVIEW === "true") {
      const { loadEnv } = await import("vite");
      const { VITE_SUPABASE_URL } = loadEnv(
        process.env.DRAWER_TEST_BUILD_MODE || "production",
        process.cwd(),
        "VITE_",
      );
      const projectRef = new URL(VITE_SUPABASE_URL).hostname.split(".")[0];
      await page.evaluate(
        ({ token, storageKey, user }) => {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              access_token: token,
              refresh_token: "controlled-test-refresh",
              token_type: "bearer",
              expires_in: 3600,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
              user,
            }),
          );
        },
        { token, storageKey: `sb-${projectRef}-auth-token`, user },
      );
    } else {
      await page.evaluate(async (token) => {
        const { createSupabaseBrowserClient } =
          await import("/app/lib/supabase.client.ts");
        const { error } = await createSupabaseBrowserClient().auth.setSession({
          access_token: token,
          refresh_token: "controlled-test-refresh",
        });
        if (error) throw error;
      }, token);
    }
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

    const title = () => page.getByRole("textbox", { name: "Título da ação" });
    const tabs = () => page.getByRole("tablist", { name: "Ações abertas" });
    const key = async () =>
      title().evaluate((element) =>
        element
          .closest("[data-action-entry]")
          .getAttribute("data-action-entry"),
      );
    const openSearchResult = async (name, activation = "shift-click") => {
      await page.keyboard.press("Meta+k");
      const input = page.getByRole("searchbox");
      await input.fill(name.source);
      const item = page.getByRole("menuitem", { name });
      await item.waitFor();
      if (activation === "shift-click")
        await item.click({ modifiers: ["Shift"] });
      else if (activation === "click") await item.click();
      else {
        await input.focus();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press(
          activation === "shift-space" ? "Shift+Space" : "Shift+Enter",
        );
      }
      await input.waitFor({ state: "hidden" });
      await title().waitFor();
      assert.match(await title().inputValue(), name);
    };
    const selectTab = async (name) => {
      await tabs().getByRole("tab", { name }).click();
    };

    await page.locator('[data-action-id="action-0"]').first().press("Enter");
    await title().waitFor();
    const primaryKey = await key();
    await openSearchResult(/AÇÃO SECUNDÁRIA/);
    assert.equal(await page.locator("[data-action-entry]").count(), 2);
    assert.equal(await title().inputValue(), "AÇÃO SECUNDÁRIA");
    const secondaryKey = await key();
    assert.equal(
      await page
        .getByRole("button", { name: "Fechar todas as ações", exact: true })
        .count(),
      0,
    );
    await selectTab(/AÇÃO ATIVA/);
    await title().fill("AÇÃO ATIVA EDITADA");
    await page.keyboard.press("Meta+Shift+Enter");
    assert.equal(writes.at(-1).id, "action-0");
    await page.getByRole("tab", { name: "INSTAGRAM", exact: true }).click();
    await page.getByRole("tab", { name: "Legenda", exact: true }).click();
    await page
      .getByRole("textbox", { name: "Legenda do Instagram" })
      .fill("Legenda preservada");
    await selectTab(/AÇÃO SECUNDÁRIA/);
    assert.equal(await key(), secondaryKey);
    await title().fill("AÇÃO SECUNDÁRIA EDITADA");
    await page.keyboard.press("Meta+Shift+Enter");
    assert.equal(writes.at(-1).id, "action-1");
    await selectTab(/AÇÃO ATIVA EDITADA/);
    assert.equal(
      await page
        .getByRole("textbox", { name: "Legenda do Instagram" })
        .inputValue(),
      "Legenda preservada",
    );
    await page.getByRole("tab", { name: "ESSENCIAL", exact: true }).click();
    assert.equal(await key(), primaryKey);
    await selectTab(/AÇÃO SECUNDÁRIA EDITADA/);
    await openSearchResult(/AÇÃO TERCEIRA/, "shift-enter");
    const thirdKey = await key();
    assert.notEqual(thirdKey, secondaryKey);
    await selectTab(/AÇÃO ATIVA EDITADA/);
    assert.equal(await key(), primaryKey);
    await openSearchResult(/AÇÃO SECUNDÁRIA EDITADA/, "click");
    assert.equal(await title().inputValue(), "AÇÃO SECUNDÁRIA EDITADA");
    await selectTab(/AÇÃO TERCEIRA/);
    assert.equal(await key(), thirdKey);
    await page.keyboard.press("Meta+Alt+a");
    await page.getByRole("button", { name: "Criar", exact: true }).waitFor();
    assert.equal(await title().inputValue(), "");
    const draftKey = await key();
    await page.getByRole("button", { name: "Parceiros", exact: true }).click();
    await page.getByRole("searchbox").fill("Parceiro ativo");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Shift+Enter");
    await page.getByRole("searchbox").waitFor({ state: "hidden" });
    await title().fill("AÇÃO NOVA");
    await page.keyboard.press("Meta+Shift+Enter");
    await page
      .getByRole("button", { name: "Atualizar", exact: true })
      .waitFor();
    assert.equal(writes.filter((write) => write.method === "POST").length, 1);
    assert.equal(await key(), draftKey);
    await selectTab(/AÇÃO TERCEIRA/);
    assert.equal(await key(), thirdKey);
    await openSearchResult(/AÇÃO NOVA/);
    assert.equal(
      await key(),
      draftKey,
      "A created draft must be focused rather than duplicated",
    );
    assert.equal(await page.locator("[data-action-entry]").count(), 2);
    await page.getByRole("button", { name: "Fechar", exact: true }).click();
    await title().waitFor();
    assert.equal(
      await key(),
      thirdKey,
      "Closing primary must retain secondary identity",
    );
    assert.equal(await tabs().count(), 0);
    assert.equal(
      await page
        .getByRole("button", { name: "Fechar todas as ações", exact: true })
        .count(),
      0,
    );
    await openSearchResult(/AÇÃO SECUNDÁRIA EDITADA/);
    assert.equal(await page.locator("[data-action-entry]").count(), 1);
    assert.equal(await tabs().count(), 0);
    await openSearchResult(/AÇÃO NOVA/, "click");
    await openSearchResult(/AÇÃO ATIVA EDITADA/, "shift-space");
    assert.equal(await title().inputValue(), "AÇÃO ATIVA EDITADA");
    await title().fill("AÇÃO COM ERRO PENDENTE");
    failWrite = true;
    await page.keyboard.press("Escape");
    await page.getByTestId("drawer-error-banner").waitFor();
    assert.equal(await page.locator("[data-action-entry]").count(), 2);
    assert.equal(await title().inputValue(), "AÇÃO COM ERRO PENDENTE");
    failWrite = false;
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await page.getByTestId("drawer-error-banner").waitFor({ state: "hidden" });
    for (const theme of ["light", "dark"]) {
      await page
        .getByRole("button", { name: "Menu do perfil do usuário" })
        .click();
      await page
        .getByRole("menuitem", {
          name: theme === "dark" ? "Tema escuro" : "Tema claro",
          exact: true,
        })
        .click();
      if (process.env.DRAWER_TEST_SCREENSHOT_DIR)
        await page.screenshot({
          animations: "disabled",
          path: `${process.env.DRAWER_TEST_SCREENSHOT_DIR}/uzzina-two-actions-${page.viewportSize().width}-${theme}.png`,
        });
    }
    if (page.viewportSize().width > 896) {
      await page
        .getByRole("button", { name: "Fechar painel de edição", exact: true })
        .click({ position: { x: 5, y: 5 } });
    } else {
      await title().click();
      await page.keyboard.press("Escape");
    }
    await page.locator("[data-action-panel]").waitFor({ state: "hidden" });
    await openSearchResult(/AÇÃO NOVA/);
    assert.equal(await page.locator("[data-action-entry]").count(), 1);
    assert.equal(await tabs().count(), 0);
    await page.keyboard.press("Escape");
    await page.locator("[data-action-panel]").waitFor({ state: "hidden" });
    await openSearchResult(/AÇÃO NOVA/);
    await openSearchResult(/AÇÃO SECUNDÁRIA EDITADA/);
    assert.equal(await page.locator("[data-action-entry]").count(), 2);
    const editor = page
      .locator(
        '[data-action-entry]:not([hidden]) .tiptap[contenteditable="true"]',
      )
      .filter({ visible: true })
      .first();
    await editor.click();
    await page.evaluate(() => {
      document.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Escape")
            window.__escapeProbe = {
              prevented: event.defaultPrevented,
              target: event.target.className,
            };
        },
        { once: true },
      );
    });
    await page.keyboard.press("Escape");
    assert.equal(
      await page.locator("[data-action-entry]").count(),
      2,
      "Tiptap must retain both actions when it consumes Escape",
    );
    const escapeProbe = await page.evaluate(() => window.__escapeProbe);
    assert.equal(escapeProbe?.prevented, true);
    assert.match(escapeProbe?.target, /ProseMirror/);
    await title().click();
    await page.keyboard.press("Escape");
    await page.locator("[data-action-panel]").waitFor({ state: "hidden" });
    await openSearchResult(/AÇÃO NOVA/);
    await openSearchResult(/AÇÃO SECUNDÁRIA EDITADA/);
    await openSearchResult(/AÇÃO COM ERRO PENDENTE/, "click");
    await page.setViewportSize({ width: 2560, height: 1080 });
    await page.locator('[data-action-layout="side-by-side"]').waitFor();
    assert.equal(await tabs().count(), 0);
    const surfaces = page.locator("[data-action-surface]");
    const left = surfaces.nth(0);
    const right = surfaces.nth(1);
    const leftTitle = left.getByRole("textbox", { name: "Título da ação" });
    const rightTitle = right.getByRole("textbox", { name: "Título da ação" });
    assert.equal(await leftTitle.inputValue(), "AÇÃO COM ERRO PENDENTE");
    assert.equal(await rightTitle.inputValue(), "AÇÃO SECUNDÁRIA EDITADA");
    const leftHandle = await left.elementHandle();
    const rightHandle = await right.elementHandle();
    const checkGeometry = async (leftWidth, rightWidth) => {
      const a = await left.boundingBox();
      const b = await right.boundingBox();
      assert.equal(a.width, leftWidth);
      assert.equal(b.width, rightWidth);
      assert.equal(a.x + a.width, b.x);
      assert.equal(b.x + b.width, page.viewportSize().width);
      assert.ok(a.x >= 64);
      for (const surface of [left, right])
        assert.equal(
          await surface.evaluate(
            (element) => element.scrollWidth <= element.clientWidth,
          ),
          true,
        );
    };
    await checkGeometry(672, 672);
    await leftTitle.fill("PRINCIPAL LADO A LADO");
    await page.keyboard.press("Meta+Shift+Enter");
    assert.equal(writes.at(-1).id, "action-0");
    await rightTitle.fill("SECUNDÁRIA LADO A LADO");
    await page.keyboard.press("Meta+Shift+Enter");
    assert.equal(writes.at(-1).id, "action-1");
    await left.getByRole("tab", { name: "INSTAGRAM", exact: true }).click();
    await checkGeometry(896, 672);
    await right.getByRole("tab", { name: "INSTAGRAM", exact: true }).click();
    await right.getByRole("tab", { name: "Legenda", exact: true }).click();
    const caption = right.getByRole("textbox", {
      name: "Legenda do Instagram",
    });
    const captionText =
      "Legenda mantida no resize\n" +
      Array.from(
        { length: 60 },
        (_, index) => `Linha ${index + 1} da legenda`,
      ).join("\n");
    await caption.fill(captionText);
    await caption.evaluate((element) => {
      element.scrollTop = 160;
    });
    const captionScroll = await caption.evaluate(
      (element) => element.scrollTop,
    );
    assert.ok(captionScroll > 0);
    await checkGeometry(896, 896);
    assert.equal(
      await left
        .locator("img")
        .first()
        .evaluate((img) => img.complete && img.naturalWidth > 0),
      true,
    );
    for (const theme of ["light", "dark"]) {
      await page
        .getByRole("button", { name: "Menu do perfil do usuário" })
        .click();
      await page
        .getByRole("menuitem", {
          name: theme === "dark" ? "Tema escuro" : "Tema claro",
          exact: true,
        })
        .click();
      if (process.env.DRAWER_TEST_SCREENSHOT_DIR)
        await page.screenshot({
          animations: "disabled",
          path: `${process.env.DRAWER_TEST_SCREENSHOT_DIR}/uzzina-side-by-side-instagram-${theme}.png`,
        });
    }
    const writeCount = writes.length;
    await page.setViewportSize({ width: 1855, height: 1080 });
    await page.locator('[data-action-layout="tabs"]').waitFor();
    await tabs().waitFor();
    assert.equal(await caption.inputValue(), captionText);
    await page.setViewportSize({ width: 1856, height: 1080 });
    await page.locator('[data-action-layout="side-by-side"]').waitFor();
    await checkGeometry(896, 896);
    assert.equal(
      await left.evaluate((element, prior) => element === prior, leftHandle),
      true,
    );
    assert.equal(
      await right.evaluate((element, prior) => element === prior, rightHandle),
      true,
    );
    assert.equal(await caption.inputValue(), captionText);
    assert.equal(
      await caption.evaluate((element) => element.scrollTop),
      captionScroll,
    );
    assert.equal(writes.length, writeCount);
    await page.setViewportSize({ width: 2560, height: 1080 });
    await left.getByRole("tab", { name: "OBSERVAÇÕES", exact: true }).click();
    await checkGeometry(672, 896);
    if (process.env.DRAWER_TEST_SCREENSHOT_DIR)
      await page.screenshot({
        animations: "disabled",
        path: `${process.env.DRAWER_TEST_SCREENSHOT_DIR}/uzzina-side-by-side-observations.png`,
      });
    await right.getByRole("tab", { name: "ESSENCIAL", exact: true }).click();
    await left.getByRole("button", { name: "Fechar", exact: true }).click();
    await page.locator('[data-action-layout="tabs"]').waitFor();
    assert.equal(await page.locator("[data-action-entry]").count(), 1);
    assert.equal(
      await page
        .locator("[data-action-surface]")
        .evaluate((element, prior) => element === prior, rightHandle),
      true,
    );
    assert.equal(await tabs().count(), 0);
    await page.keyboard.press("Meta+k");
    const lastSearch = page.getByRole("searchbox");
    await lastSearch.fill("PRINCIPAL LADO A LADO");
    await page.getByRole("menuitem", { name: /PRINCIPAL LADO A LADO/ }).click();
    await lastSearch.waitFor({ state: "hidden" });
    await page.locator('[data-action-layout="side-by-side"]').waitFor();
    await page
      .getByRole("button", { name: "Menu do perfil do usuário" })
      .click();
    await page.getByRole("menuitem", { name: "Sair", exact: true }).click();
    await page.waitForURL(`${base}/login`);
    assert.equal(await page.locator("[data-action-entry]").count(), 0);
    assert.deepEqual(errors, []);
    console.log(
      "PASS two real forms: Shift click/Enter/Space, ordinary replacement, tabs/state, scoped saving, draft creation and stable identity, isolated secondary, atomic close failure/retry, overlay close-all, Tiptap Escape ownership, wide geometry, resize without remount/writes, scoped wide saves, individual close, session cleanup, light/dark. HTTP controlled; no production writes.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
