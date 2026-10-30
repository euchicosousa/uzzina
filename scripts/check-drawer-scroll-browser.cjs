// Actual app and Supabase SDK; HTTP controlled. No production access.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  try {
    const base = process.env.PORTAL_TEST_URL || "http://127.0.0.1:5189";
    const testOrigin = new URL(base);
    assert.ok(
      ["127.0.0.1", "localhost"].includes(testOrigin.hostname),
      "Use an isolated local test server",
    );
    assert.notEqual(
      testOrigin.port,
      "5176",
      "Do not use the owner's running server",
    );
    const page = await browser.newPage({
      viewport: {
        width: Number(process.env.DRAWER_TEST_WIDTH || 844),
        height: 390,
      },
      hasTouch: true,
      timezoneId: "America/Fortaleza",
    });
    await page.addInitScript(() => {
      const state = { height: innerHeight, top: 0, scale: 1 };
      const viewport = new EventTarget();
      for (const [key, getter] of Object.entries({
        height: () => state.height,
        width: () => innerWidth,
        offsetTop: () => state.top,
        offsetLeft: () => 0,
        pageTop: () => state.top,
        pageLeft: () => 0,
        scale: () => state.scale,
      }))
        Object.defineProperty(viewport, key, { get: getter });
      Object.defineProperty(window, "visualViewport", {
        configurable: true,
        value: viewport,
      });
      window.__setVisibleViewport = (patch) => {
        Object.assign(state, patch);
        viewport.dispatchEvent(new Event("resize"));
        viewport.dispatchEvent(new Event("scroll"));
      };
    });
    if (process.env.DRAWER_IOS_PATH === "true")
      await page.addInitScript(() =>
        Object.defineProperty(navigator, "platform", { get: () => "iPhone" }),
      );
    const moduleFailures = [];
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (
        url.origin === base &&
        /\.(?:tsx?|jsx?)$/.test(url.pathname) &&
        response.status() >= 400
      )
        moduleFailures.push({
          path: url.pathname,
          status: response.status(),
          message: response.statusText(),
        });
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
    partners.push({
      ...partners[0],
      id: "p-beta",
      slug: "beta",
      title: "Parceiro Beta",
      short: "Beta",
    });
    const social = true;
    const actions = partners.map((p, i) => ({
      id: `action-${p.slug}`,
      title: i === 2 ? "AÇÃO BETA" : i ? "AÇÃO OCULTA" : "AÇÃO ATIVA",
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
    actions.push({
      ...actions.find((action) => action.partners.includes("beta")),
      id: "action-archived",
      title: "AÇÃO ARQUIVADA BETA",
      archived: true,
    });
    const searchArchiveFilters = [];
    const searchScopes = [];
    const partnerRequests = [];
    const scopes = [];
    const writes = [];
    const failWrite = false;
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
        return route.fulfill({
          json: actions.filter((action) => !action.archived),
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
        const partnerScope = url.searchParams.getAll("partners");
        if (url.searchParams.has("title")) {
          searchScopes.push(partnerScope);
          searchArchiveFilters.push(url.searchParams.get("archived"));
        }
        const overlap = partnerScope.find((scope) => scope.startsWith("ov."));
        const selected = overlap ? overlap.slice(4, -1).split(",") : null;
        return route.fulfill({
          json: actions.filter(
            (entry) =>
              entry.title.toLowerCase().includes(title) &&
              (url.searchParams.get("archived") !== "eq.false" ||
                !entry.archived) &&
              (!selected ||
                entry.partners.some((slug) => selected.includes(slug))),
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

    // Use the actual app scroll region, with enough controlled content to scroll.
    const app = page.locator("[data-app-scroller]");
    await app.evaluate((element) => {
      const filler = document.createElement("div");
      filler.style.height = "5000px";
      element.append(filler);
      element.scrollTop = 360;
    });
    const initialDocument = await page.evaluate(() => ({
      top: scrollY,
      left: scrollX,
      style: document.documentElement.style.cssText,
    }));
    const open = async (name, secondary = false) => {
      await page.keyboard.press("Meta+k");
      await page.getByRole("searchbox").fill(name);
      await page
        .getByRole("menuitem", { name: new RegExp(name) })
        .click({ modifiers: secondary ? ["Shift"] : [] });
      await page.getByRole("searchbox").waitFor({ state: "hidden" });
      await page
        .locator("[data-action-surface]:not([hidden]) .tiptap")
        .waitFor();
    };
    const active = () => page.locator("[data-action-surface]:not([hidden])");
    const editor = () => active().locator(".tiptap").first();
    const title = () =>
      active().getByRole("textbox", { name: "Título da ação" });
    const failures = [];
    const record = (condition, message, metrics) => {
      console.log(
        `${condition ? "PASS" : "FAIL"} ${message}: ${JSON.stringify(metrics)}`,
      );
      if (!condition) failures.push({ message, metrics });
    };
    await open("AÇÃO ATIVA");
    const primaryKey = await active().getAttribute("data-action-surface");
    const originalEditor = await editor().elementHandle();
    const originalTitle = await title().inputValue();
    const checkToolbar = async (label, compact) => {
      const toolbar = active().getByRole("toolbar", {
        name: "Formatação do texto",
      });
      const geometry = await toolbar.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const buttons = [...element.querySelectorAll("button")].map((button) =>
          button.getBoundingClientRect(),
        );
        return {
          height: rect.height,
          rows: [...new Set(buttons.map((button) => Math.round(button.top)))],
          contained: buttons.every(
            (button) => button.left >= rect.left && button.right <= rect.right,
          ),
          wrap: getComputedStyle(element).flexWrap,
        };
      });
      record(
        (await toolbar
          .getByRole("button", { name: "Mais formatação", exact: true })
          .count()) === (compact ? 1 : 0),
        `${label}: expected toolbar mode`,
        geometry,
      );
      if (compact)
        record(
          geometry.rows.length === 1 &&
            geometry.contained &&
            geometry.wrap === "nowrap",
          `${label}: commands stay on one contained row`,
          geometry,
        );
    };
    const checkWriting = async (label) => {
      const constrained = await active()
        .locator("[data-essential-scroller]")
        .evaluate((e) => {
          const r = e.getBoundingClientRect();
          return r.width < 640 || (r.width < 752 && r.height < 480);
        });
      await checkToolbar(`${label} Essential`, constrained);
      // Scroll the actual Essential area, including title/metadata, then the
      // editor's own long-text region; no background region is used to reveal it.
      await editor().scrollIntoViewIfNeeded();
      await editor().evaluate((element) => {
        const outer = element.closest("[data-essential-scroller]");
        if (outer) outer.scrollTop = outer.scrollHeight;
        element.scrollTop = element.scrollHeight;
      });
      const geometry = await editor().evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const scroller = element.closest("[data-essential-scroller]");
        const clip = scroller?.getBoundingClientRect();
        const top = Math.max(
          rect.top,
          clip?.top ?? 0,
          visualViewport.offsetTop,
        );
        const bottom = Math.min(
          rect.bottom,
          clip?.bottom ?? innerHeight,
          visualViewport.offsetTop + visualViewport.height,
        );
        const y = bottom - 8;
        return {
          top,
          bottom,
          hit:
            bottom - top >= 20 &&
            element.contains(document.elementFromPoint(rect.left + 30, y)),
          editorScroll: element.scrollTop,
          outerScroll: scroller?.scrollTop,
          panel: element
            .closest("[data-action-panel]")
            .getBoundingClientRect()
            .toJSON(),
          window: scrollY,
        };
      });
      record(
        geometry.hit,
        `${label}: description receives pointer after deliberate scroll`,
        geometry,
      );
      if (geometry.hit) {
        const box = await editor().boundingBox();
        await page.mouse.click(box.x + 30, geometry.bottom - 8);
        await editor().press("ControlOrMeta+End");
        await page.keyboard.insertText("X");
        record(
          (await editor().textContent()).includes("X"),
          `${label}: real editor accepts typing`,
        );
        const caret = await editor().evaluate((element) => {
          const selection = getSelection();
          if (!selection?.rangeCount || !element.contains(selection.anchorNode))
            return null;
          const range = selection.getRangeAt(0).cloneRange();
          range.collapse(false);
          const rect = range.getBoundingClientRect();
          const outer = element
            .closest("[data-essential-scroller]")
            .getBoundingClientRect();
          return {
            top: rect.top,
            bottom: rect.bottom,
            clipTop: Math.max(outer.top, visualViewport.offsetTop),
            clipBottom: Math.min(
              outer.bottom,
              visualViewport.offsetTop + visualViewport.height,
            ),
          };
        });
        record(
          caret &&
            caret.top >= caret.clipTop - 1 &&
            caret.bottom <= caret.clipBottom + 1,
          `${label}: final-line caret stays visible`,
          caret,
        );
      }
      const positions = await app.evaluate((e) => ({
        top: e.scrollTop,
        left: e.scrollLeft,
        overflow: getComputedStyle(e).overflowY,
      }));
      record(
        positions.top === 360 && positions.overflow === "hidden",
        `${label}: independent background stays locked`,
        positions,
      );
      for (const control of [
        active().getByRole("tab", { name: "ESSENCIAL", exact: true }),
        active().getByRole("button", { name: "Fechar", exact: true }),
        active().getByRole("button", { name: "Atualizar", exact: true }),
      ]) {
        const rect = await control.boundingBox();
        const visible = await page.evaluate(() => ({
          top: visualViewport.offsetTop,
          bottom: visualViewport.offsetTop + visualViewport.height,
        }));
        record(
          rect.y >= visible.top && rect.y + rect.height <= visible.bottom,
          `${label}: ${(await control.getAttribute("aria-label")) || (await control.innerText())} visible`,
          rect,
        );
      }
    };
    await checkWriting("landscape672px");
    // Long text must expose its final lines while keeping both scroll regions independent.
    await editor().fill(
      Array.from({ length: 80 }, (_, i) => `Description line ${i + 1}`).join(
        "\n",
      ),
    );
    await checkWriting("long description");
    for (const scenario of [
      { width: 390, height: 844, visible: 430, top: 180 },
      { width: 844, height: 390, visible: 220, top: 90 },
      { width: 1024, height: 600, visible: 600, top: 0 },
    ]) {
      await page.setViewportSize({
        width: scenario.width,
        height: scenario.height,
      });
      await page.evaluate(
        ({ height, top }) => window.__setVisibleViewport({ height, top }),
        { height: scenario.visible, top: scenario.top },
      );
      await page.waitForTimeout(80);
      const bounds = await page.locator("[data-action-panel]").boundingBox();
      record(
        bounds.y >= scenario.top &&
          bounds.y + bounds.height <= scenario.top + scenario.visible,
        "panel follows visible keyboard/bar bounds",
        bounds,
      );
      await checkWriting(
        `${scenario.width}x${scenario.height}/visible${scenario.visible}`,
      );
      record(
        await editor().evaluate(
          (element, original) => element === original,
          originalEditor,
        ),
        "rotation retains editor identity",
      );
      record(
        (await title().inputValue()) === originalTitle,
        "rotation retains title",
      );
    }
    // Essential's compact menu operates on the real retained selection/history.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() =>
      window.__setVisibleViewport({ height: 430, top: 180 }),
    );
    await editor().fill("Formatting selection");
    await editor().press("ControlOrMeta+A");
    await active()
      .getByRole("button", { name: "Mais formatação", exact: true })
      .click();
    await page
      .getByRole("menuitemcheckbox", { name: "Tachado", exact: true })
      .click();
    record(
      (await editor().locator("s").textContent()) === "Formatting selection",
      "Essential menu formats retained selection",
    );
    record(
      await editor().evaluate((e) => e === document.activeElement),
      "Essential menu returns focus to editor",
    );
    await active()
      .getByRole("button", { name: "Desfazer", exact: true })
      .click();
    record(
      (await editor().locator("s").count()) === 0,
      "Essential compact history undoes formatting",
    );
    await active()
      .getByRole("button", { name: "Refazer", exact: true })
      .click();
    record(
      (await editor().locator("s").count()) === 1,
      "Essential compact history redoes formatting",
    );
    // Verify Instagram independently at phone width, landscape and desktop.
    for (const scenario of [
      { width: 390, height: 844, visible: 430, top: 180, compact: true },
      { width: 844, height: 390, visible: 220, top: 90, compact: true },
      { width: 1440, height: 1000, visible: 1000, top: 0, compact: false },
    ]) {
      await page.setViewportSize({
        width: scenario.width,
        height: scenario.height,
      });
      await page.evaluate(
        ({ height, top }) => window.__setVisibleViewport({ height, top }),
        { height: scenario.visible, top: scenario.top },
      );
      await active()
        .getByRole("tab", { name: "INSTAGRAM", exact: true })
        .click();
      await active().locator(".tiptap").waitFor();
      await page.waitForTimeout(80);
      await checkToolbar(
        `Instagram ${scenario.width}x${scenario.height}`,
        scenario.compact,
      );
      await editor().fill("");
      await checkToolbar(
        `Instagram empty ${scenario.width}px`,
        scenario.compact,
      );
      await editor().fill(
        Array.from({ length: 40 }, (_, i) => `Content line ${i + 1}`).join(
          "\n",
        ),
      );
      await checkToolbar(
        `Instagram long ${scenario.width}px`,
        scenario.compact,
      );
      await active()
        .getByRole("tab", { name: "ESSENCIAL", exact: true })
        .click();
      await editor().waitFor();
      await checkToolbar(
        `Essential ${scenario.width}x${scenario.height}`,
        scenario.compact,
      );
    }
    // Return to the existing ticket13 integration scenario.
    await page.setViewportSize({ width: 1024, height: 600 });
    await page.evaluate(() =>
      window.__setVisibleViewport({ height: 600, top: 0 }),
    );
    await page.waitForTimeout(80);
    const unzoomed = await page.locator("[data-action-panel]").boundingBox();
    await page.evaluate(() =>
      window.__setVisibleViewport({ height: 300, top: 120, scale: 2 }),
    );
    await page.waitForTimeout(50);
    record(
      JSON.stringify(
        await page.locator("[data-action-panel]").boundingBox(),
      ) === JSON.stringify(unzoomed),
      "pinch geometry stays stable",
    );
    await page.evaluate(() =>
      window.__setVisibleViewport({ height: 600, top: 0, scale: 1 }),
    );
    // A real nested popover must not release the document/app locks on dismissal.
    await active()
      .locator("[data-drawer-focus=control]")
      .first()
      .getByRole("button")
      .click();
    await page.getByRole("searchbox").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("searchbox").waitFor({ state: "hidden" });
    record(
      (await app.evaluate((e) => getComputedStyle(e).overflowY)) === "hidden",
      "nested popover keeps app locked",
    );
    record(
      (await page.evaluate(() => document.documentElement.style.overflow)) ===
        "hidden",
      "nested popover keeps document locked",
    );
    // Native Chromium touch gesture against the backdrop and its scroll boundary.
    // Running DRAWER_IOS_PATH also exercises React Aria's iOS-specific handler;
    // neither run certifies the native Safari/iPhone engine.
    const client = await page.context().newCDPSession(page);
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 40, y: 350 }],
    });
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 40, y: 150 }],
    });
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await page.waitForTimeout(80);
    record(
      (await app.evaluate((e) => e.scrollTop)) === 360,
      "touch on backdrop preserves background position",
    );
    await open("AÇÃO SECUNDÁRIA", true);
    await checkToolbar("second mounted Essential panel", true);
    await page.setViewportSize({ width: 2000, height: 1000 });
    await page.evaluate(() =>
      window.__setVisibleViewport({ height: 1000, top: 0 }),
    );
    await page.locator('[data-action-layout="side-by-side"]').waitFor();
    const dualToolbars = page.getByRole("toolbar", {
      name: "Formatação do texto",
    });
    record(
      (await dualToolbars.count()) === 2,
      "both side-by-side panels retain their own toolbar",
    );
    record(
      (await page
        .getByRole("button", { name: "Mais formatação", exact: true })
        .count()) === 0,
      "normal desktop keeps full toolbar in both panels",
    );
    await page.setViewportSize({ width: 1024, height: 600 });
    await page.evaluate(() =>
      window.__setVisibleViewport({ height: 600, top: 0 }),
    );
    await page.locator('[data-action-layout="tabs"]').waitFor();
    record(
      (await page.locator("[data-action-entry]").count()) === 2,
      "both actions stay mounted",
    );
    await active().getByRole("button", { name: "Fechar", exact: true }).click();
    record(
      (await active().getAttribute("data-action-surface")) === primaryKey,
      "individual close retains first identity",
    );
    record(
      (await app.evaluate((e) => getComputedStyle(e).overflowY)) === "hidden",
      "closing one action keeps background locked",
    );
    await active().getByRole("button", { name: "Fechar", exact: true }).click();
    await page.locator("[data-action-panel]").waitFor({ state: "hidden" });
    record(
      (await app.evaluate((e) => e.scrollTop)) === 360,
      "last close restores exact app position",
    );
    record(
      (await app.evaluate((e) => getComputedStyle(e).overflowY)) === "auto",
      "last close releases app lock",
    );
    record(
      JSON.stringify(
        await page.evaluate(() => ({
          top: scrollY,
          left: scrollX,
          style: document.documentElement.style.cssText,
        })),
      ) === JSON.stringify(initialDocument),
      "last close restores document position/styles",
    );
    await open("AÇÃO ATIVA");
    await page.evaluate(async () => {
      const { createSupabaseBrowserClient } =
        await import("/app/lib/supabase.client.ts");
      await createSupabaseBrowserClient().auth.signOut();
    });
    await page.waitForURL(`${base}/login`);
    record(
      (await page.locator("[data-action-panel]").count()) === 0,
      "session reset removes drawers",
    );
    record(
      (await page.evaluate(() => document.documentElement.style.overflow)) !==
        "hidden",
      "session reset releases document lock",
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(moduleFailures, []);
    assert.deepEqual(failures, []);
    console.log(
      "Controlled HTTP/data only; Chromium and simulated visual viewport. Physical Safari remains unverified.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
