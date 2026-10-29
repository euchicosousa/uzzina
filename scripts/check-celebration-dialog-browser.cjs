// Real route and SDK with controlled HTTP. No production database requests.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const base = process.env.PORTAL_TEST_URL || "http://127.0.0.1:5176";
  const evidence = await fs.mkdtemp(
    join(tmpdir(), "uzzina-celebration-browser-"),
  );
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
        theme: "system",
        themeColorIndex: 0,
        futureKey: "preserve",
      },
    };

    const creations = [];
    const updates = [];
    const deletions = [];
    const rows = [];
    const unexpectedWrites = [];
    let fail = false;
    let gate;
    let release;
    await page.route("**/*", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.origin === base) return route.continue();
      if (url.pathname === "/auth/v1/user")
        return route.fulfill({ json: user });
      if (url.pathname === "/rest/v1/rpc/get_app_bootstrap")
        return route.fulfill({ json: { person, partners: [] } });
      if (url.pathname === "/rest/v1/rpc/get_home_actions")
        return route.fulfill({ json: [] });
      if (url.pathname === "/rest/v1/celebrations") {
        if (req.method() === "GET") return route.fulfill({ json: rows });

        if (req.method() === "PATCH") {
          const id = (url.searchParams.get("id") || "").replace(/^eq\./, "");
          const body = req.postDataJSON();
          updates.push({ id, ...body });
          if (fail)
            return route.fulfill({
              status: 503,
              json: { message: "Controlled edit failure" },
            });
          const index = rows.findIndex((item) => item.id === id);
          assert(index >= 0, "Edit must target an existing record");
          rows[index] = { ...rows[index], ...body };
          return route.fulfill({ json: rows[index] });
        }
        if (req.method() === "DELETE") {
          const id = (url.searchParams.get("id") || "").replace(/^eq\./, "");
          deletions.push(id);
          const index = rows.findIndex((item) => item.id === id);
          if (index >= 0) rows.splice(index, 1);
          return route.fulfill({ status: 204, body: "" });
        }
        if (req.method() === "POST") {
          const [entry] = req.postDataJSON();
          creations.push(entry);
          if (gate) await gate;
          if (fail)
            return route.fulfill({
              status: 503,
              json: { message: "Controlled creation failure" },
            });
          const result = {
            id: `celebration-${creations.length}`,
            created_at: new Date().toISOString(),
            ...entry,
          };
          rows.push(result);
          return route.fulfill({ status: 201, json: result });
        }
      }
      if (
        (req.method() === "GET" || req.method() === "HEAD") &&
        url.pathname.startsWith("/rest/v1/")
      )
        return route.fulfill({ json: [] });
      if (req.method() !== "GET" && req.method() !== "HEAD")
        unexpectedWrites.push({ path: url.pathname, method: req.method() });
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

    await page.goto(`${base}/app`);
    await page.getByRole("heading", { name: "Hoje", exact: true }).waitFor();
    const dialog = page.getByRole("dialog", {
      name: "Criar data comemorativa",
      exact: true,
    });
    const openCreate = async (shift = false) => {
      await page.keyboard.press("Control+k");
      await page
        .getByRole("menuitem", { name: "Criar data comemorativa", exact: true })
        .click(shift ? { modifiers: ["Shift"] } : {});
      await dialog.waitFor();
      const id = await dialog
        .getByRole("textbox", { name: "Título", exact: true })
        .getAttribute("id");
      await page.waitForFunction((id) => document.activeElement?.id === id, id);
    };
    for (const [width, height, scheme] of [
      [1440, 900, "light"],
      [390, 700, "dark"],
      [390, 480, "dark"],
    ]) {
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ colorScheme: scheme });
      await openCreate();
      assert.equal(page.url(), `${base}/app`);
      assert.equal(creations.length, 0, "Opening must not insert");
      await dialog.locator('[data-slot="select-trigger"]').first().click();
      await page.getByRole("listbox").waitFor();
      await page.keyboard.press("Escape");
      await page.getByRole("listbox").waitFor({ state: "hidden" });
      assert(
        await dialog.isVisible(),
        "Escape closes the month picker before the modal",
      );

      await dialog
        .getByRole("textbox", { name: "Título", exact: true })
        .fill("Data de teste");
      const bounds = await dialog.boundingBox();
      assert(
        bounds.x >= 15 && bounds.x + bounds.width <= width - 15,
        "Modal keeps horizontal gutters",
      );
      const createBounds = await dialog
        .getByRole("button", { name: "Criar data", exact: true })
        .boundingBox();
      assert(
        createBounds.y + createBounds.height <= height - 15,
        "Submit remains visible in a short viewport",
      );
      await page.screenshot({
        path: `${evidence}/celebration-${width}x${height}.png`,
      });
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      assert.equal(creations.length, 0, "Escape must not insert");
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await openCreate();
    await dialog
      .getByRole("textbox", { name: "Título", exact: true })
      .fill("  Data com retry  ");
    const day = dialog.locator('[role="grid"] [tabindex="0"]');
    await day.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    assert.equal(
      creations.length,
      0,
      "Calendar selection must not submit the form",
    );
    gate = new Promise((resolve) => {
      release = resolve;
    });
    fail = true;
    await dialog
      .getByRole("button", { name: "Criar data", exact: true })
      .click();
    await dialog
      .getByRole("button", { name: "Criando...", exact: true })
      .waitFor();
    assert(
      await dialog
        .getByRole("button", { name: "Cancelar", exact: true })
        .isDisabled(),
    );
    await page.keyboard.press("Escape");
    assert(await dialog.isVisible(), "Pending request cannot be dismissed");
    gate = undefined;
    release();
    await dialog.getByRole("alert").waitFor();
    assert.equal(
      await dialog
        .getByRole("textbox", { name: "Título", exact: true })
        .inputValue(),
      "  Data com retry  ",
    );
    fail = false;
    await dialog
      .getByRole("button", { name: "Criar data", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(creations.length, 2);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].title, "Data com retry");
    assert.deepEqual(creations[0], creations[1]);
    await page.keyboard.press("Control+k");
    await page
      .getByRole("menuitem", {
        name: "Gerenciar datas comemorativas",
        exact: true,
      })
      .click();
    await page.waitForURL("**/app/admin/celebrations");
    await page.getByText("Data com retry", { exact: true }).waitFor();
    const originalId = rows[0].id;
    let row = page.locator(`[data-celebration-id="${originalId}"]`);
    await page
      .getByRole("heading", { name: "Datas Comemorativas", exact: true })
      .click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);
    const edit = row.getByRole("button", {
      name: "Editar Data com retry",
      exact: true,
    });
    assert.equal(
      await edit.evaluate((el) => getComputedStyle(el.parentElement).opacity),
      "0",
      "Desktop buttons are hidden off-hover",
    );
    await row.hover();
    await page.waitForTimeout(200);
    assert.equal(
      await edit.evaluate((el) => getComputedStyle(el.parentElement).opacity),
      "1",
    );
    const editBounds = await edit.boundingBox();
    const deleteBounds = await row
      .getByRole("button", { name: "Apagar Data com retry", exact: true })
      .boundingBox();
    assert(
      deleteBounds.x > editBounds.x,
      "Edit precedes delete at the row end",
    );
    assert.equal(
      await row.evaluate((el) => getComputedStyle(el).justifyContent),
      "space-between",
    );
    await page.mouse.move(0, 0);
    await edit.focus();
    await page.waitForTimeout(200);
    assert.equal(
      await edit.evaluate((el) => getComputedStyle(el.parentElement).opacity),
      "1",
      "Keyboard focus reveals desktop controls",
    );
    await edit.click();
    const editing = page.getByRole("dialog", {
      name: "Editar data comemorativa",
      exact: true,
    });
    await editing.waitFor();
    assert.equal(
      await editing
        .getByRole("textbox", { name: "Título", exact: true })
        .inputValue(),
      "Data com retry",
    );
    await editing
      .getByRole("textbox", { name: "Título", exact: true })
      .fill("Data editada");
    await editing.locator('[role="grid"] [tabindex="0"]').focus();
    for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    fail = true;
    await editing
      .getByRole("button", { name: "Salvar alterações", exact: true })
      .click();
    await editing.getByRole("alert").waitFor();
    assert.equal(rows[0].title, "Data com retry");
    fail = false;
    await editing
      .getByRole("button", { name: "Salvar alterações", exact: true })
      .click();
    await editing.waitFor({ state: "hidden" });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, originalId);
    assert.equal(rows[0].title, "Data editada");
    assert.notEqual(rows[0].date, creations[1].date);
    assert.deepEqual(updates[0], updates[1]);
    await page
      .getByRole("button", { name: "Editar Data editada", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Editar Data editada", exact: true })
      .click();
    await editing.waitFor();
    await editing
      .getByRole("textbox", { name: "Título", exact: true })
      .fill("Cancelar mudança");
    await editing
      .getByRole("button", { name: "Cancelar", exact: true })
      .click();
    assert.equal(updates.length, 2);
    assert.equal(rows[0].title, "Data editada");
    await page.setViewportSize({ width: 390, height: 700 });
    row = page.locator(`[data-celebration-id="${originalId}"]`);
    await page
      .getByText("Data comemorativa atualizada.", { exact: true })
      .waitFor({ state: "hidden" });
    await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);
    const mobileEdit = row.getByRole("button", {
      name: "Editar Data editada",
      exact: true,
    });
    assert.equal(
      await mobileEdit.evaluate(
        (el) => getComputedStyle(el.parentElement).opacity,
      ),
      "1",
      "Mobile controls remain visible without hover",
    );
    assert(
      await mobileEdit.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const hit = document.elementFromPoint(
          box.x + box.width / 2,
          box.y + box.height / 2,
        );
        return hit === el || el.contains(hit);
      }),
      "Mobile edit remains reachable above AppBar",
    );
    await page.screenshot({ path: `${evidence}/celebration-edit-mobile.png` });
    await mobileEdit.click();
    await editing.waitFor();
    await page.screenshot({ path: `${evidence}/celebration-edit-dialog.png` });
    await editing
      .getByRole("button", { name: "Cancelar", exact: true })
      .click();
    await row
      .getByRole("button", { name: "Apagar Data editada", exact: true })
      .click();
    await page
      .getByText("Nenhuma data comemorativa cadastrada ainda.", { exact: true })
      .waitFor();
    assert.deepEqual(deletions, [originalId]);
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.locator('a[title="Home"]').click();
    await page.getByRole("button", { name: "Nova Ação", exact: true }).click();
    const actionTitle = page.getByRole("textbox", {
      name: "Título da ação",
      exact: true,
    });
    await actionTitle.fill("Rascunho preservado");
    await openCreate(true);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.equal(await actionTitle.inputValue(), "Rascunho preservado");
    assert.equal(
      await actionTitle.count(),
      1,
      "Shift create celebration must not open a secondary action",
    );
    assert.equal(creations.length, 2);
    person.admin = false;
    await page.goto(`${base}/app`);
    await page.getByRole("heading", { name: "Hoje", exact: true }).waitFor();
    await page.keyboard.press("Control+k");
    await page.getByRole("searchbox").waitFor();
    assert.equal(
      await page
        .getByRole("menuitem", { name: "Criar data comemorativa", exact: true })
        .count(),
      0,
    );
    assert.deepEqual(unexpectedWrites, []);
    assert.deepEqual(errors, []);
    console.log(
      "PASS: desktop/mobile themes, modal focus, Escape/cancel without write, calendar selection, one pending insert, failure/retry, canonical list, distinct Manage route, preserved dirty action, Shift does not create a secondary action, admin-only command; edit title/date with PATCH preserving ID, error/retry/cancel, desktop hover/focus and mobile controls, existing delete. All HTTP controlled.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
