// Actual app routes/CSS/font; all external HTTP is controlled, including saves.
const assert = require("node:assert/strict");
const engines = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const base = process.env.MOBILE_LAYOUT_TEST_URL || "http://127.0.0.1:5191";
  const origin = new URL(base);
  assert.ok(["localhost", "127.0.0.1"].includes(origin.hostname));
  assert.notEqual(origin.port, "5176", "Use an isolated test server");
  const browser = await engines[
    process.env.MOBILE_LAYOUT_ENGINE || "chromium"
  ].launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 800 },
      locale: "pt-BR",
      timezoneId: "America/Fortaleza",
    });
    page.setDefaultTimeout(10000);
    await page.clock.install({ time: new Date("2026-10-30T12:00:00Z") });
    const errors = [];
    const resizeNotices = [];
    let phase = "setup";
    page.on("pageerror", (error) => {
      // WebKit reports this scheduling notification while the unchanged
      // viewport-height hook responds to text zoom, including on the baseline.
      if (
        error.message ===
        "ResizeObserver loop completed with undelivered notifications."
      )
        resizeNotices.push({ phase, message: error.message });
      else errors.push(error.message);
    });
    await page.routeWebSocket(/.*/, (socket) => socket.close());
    const userId = "11111111-1111-4111-8111-111111111111";
    const user = {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: "layout@test.invalid",
      app_metadata: { provider: "email" },
      user_metadata: {},
      created_at: "2026-01-01T00:00:00Z",
    };
    const person = {
      id: userId,
      user_id: userId,
      name: "Layout",
      surname: "Teste",
      short: "Layout",
      initials: "LT",
      email: user.email,
      admin: true,
      visible: true,
      areas: [],
      image: null,
      preferences: {
        theme: "light",
        themeColorIndex: 0,
        futureKey: "preserve",
      },
    };
    const writes = [];
    await page.route("**/*", (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === base) return route.continue();
      if (url.pathname === "/auth/v1/user")
        return route.fulfill({ json: user });
      if (url.pathname === "/rest/v1/rpc/get_app_bootstrap")
        return route.fulfill({ json: { person, partners: [] } });
      if (url.pathname === "/rest/v1/rpc/get_home_actions")
        return route.fulfill({ json: [] });
      if (url.pathname === "/rest/v1/people" && request.method() === "PATCH") {
        const patch = request.postDataJSON();
        writes.push({ profile: patch });
        Object.assign(person, patch);
        return route.fulfill({ json: person });
      }
      if (url.pathname === "/rest/v1/rpc/update_my_preferences") {
        const patch = request.postDataJSON().p_patch;
        writes.push({ preferences: patch });
        Object.assign(person.preferences, patch);
        return route.fulfill({ json: person.preferences });
      }
      if (request.method() === "GET" && url.pathname.startsWith("/rest/v1/"))
        return route.fulfill({
          json: url.pathname === "/rest/v1/people" ? [person] : [],
        });
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
    const failures = [];
    let checks = 0;
    const check = (condition, label, metrics) => {
      checks++;
      if (!condition) failures.push({ label, metrics });
      console.log(
        `${condition ? "PASS" : "FAIL"} ${label}: ${JSON.stringify(metrics)}`,
      );
    };
    const alignmentOnly = process.env.GLOBAL_HEADER_ALIGNMENT_ONLY === "true";
    const sizes = [
      { width: 320, height: 740 },
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 844, height: 390 },
      { width: 1440, height: 900 },
    ];
    for (const size of sizes.filter(
      (size) => !alignmentOnly || [320, 390, 430, 1440].includes(size.width),
    )) {
      await page.setViewportSize(size);
      const mobile = size.width < 1024;
      phase = `Today ${size.width}px`;
      await page.goto(`${base}/app/today?date=2027-11-25`);
      const heading = page.locator("[data-today-page] h1");
      await heading.waitFor();
      await page.evaluate(() => document.fonts.ready);
      const today = await heading.evaluate((element) => {
        const header = element.parentElement;
        const root = header.parentElement;
        const region = root.querySelector('[aria-label="Ações do dia"]');
        const text = getComputedStyle(element);
        const h = header.getBoundingClientRect();
        const r = root.getBoundingClientRect();
        const c = region.getBoundingClientRect();
        return {
          text: element.textContent,
          whiteSpace: text.whiteSpace,
          textOverflow: text.textOverflow,
          headerHeight: h.height,
          rootLeft: r.left,
          rootRight: r.right,
          headingLeft: element.getBoundingClientRect().left,
          optionsRight: header.lastElementChild.getBoundingClientRect().right,
          contentLeft:
            c.left + parseFloat(getComputedStyle(region).paddingLeft),
          headerPadding: parseFloat(getComputedStyle(header).paddingLeft),
          contentPadding: parseFloat(getComputedStyle(region).paddingLeft),
          headerWidth: h.width,
          headingWidth: element.getBoundingClientRect().width,
          buttons: [...header.querySelectorAll("button")]
            .filter((b) => b.getBoundingClientRect().height > 0)
            .map((b) => ({
              x: b.getBoundingClientRect().left,
              right: b.getBoundingClientRect().right,
              height: b.getBoundingClientRect().height,
            })),
          externalScroll:
            document.querySelector("[data-app-scroller]").scrollHeight -
            document.querySelector("[data-app-scroller]").clientHeight,
          spacer: region.lastElementChild.getBoundingClientRect().height,
        };
      });
      if (process.env.MOBILE_LAYOUT_SCREENSHOT_DIR && size.width === 390)
        await page.screenshot({
          path: `${process.env.MOBILE_LAYOUT_SCREENSHOT_DIR}/today390.png`,
        });
      check(
        today.text === "Quinta-feira, 25 de novembro de 2027",
        `${size.width}px Today full selected date`,
        today,
      );
      check(
        today.whiteSpace === "nowrap" &&
          today.textOverflow === "ellipsis" &&
          today.headingWidth >= 40,
        `${size.width}px Today single shrinkable heading`,
        today,
      );
      check(
        today.buttons.every(
          (b) => b.x >= 0 && b.right <= size.width && b.height >= 40,
        ),
        `${size.width}px Today controls contained and touch targets preserved`,
        today.buttons,
      );
      check(
        today.externalScroll <= 1 && today.spacer === 98,
        `${size.width}px Today own scroll and AppBar space`,
        today,
      );
      if (mobile) {
        check(
          today.contentLeft <= 25 &&
            today.headerPadding <= 16 &&
            today.contentPadding <= 16,
          `${size.width}px Today local mobile gutters`,
          today,
        );
        check(
          today.headerHeight <= 104,
          `${size.width}px Today bounded header height`,
          today,
        );
      } else
        check(
          today.rootLeft === 32 &&
            today.headerPadding === 64 &&
            today.contentPadding === 64,
          `${size.width}px Today desktop spacing preserved`,
          today,
        );
      phase = `Home ${size.width}px`;
      await page.goto(`${base}/app`);
      const homeHeading = page.getByRole("heading", {
        name: "Hoje",
        exact: true,
      });
      await homeHeading.waitFor();
      const home = await homeHeading.evaluate((element) => {
        const header = element.parentElement;
        const root = header.parentElement;
        const content = root.children[1];
        const r = content.getBoundingClientRect();
        return {
          text: element.textContent,
          rootLeft: root.getBoundingClientRect().left,
          rootRight: root.getBoundingClientRect().right,
          headingLeft: element.getBoundingClientRect().left,
          optionsRight: header.lastElementChild.getBoundingClientRect().right,
          headerHeight: header.getBoundingClientRect().height,
          headingPadding: parseFloat(getComputedStyle(element).paddingTop),
          headerGap: parseFloat(getComputedStyle(header).rowGap),
          contentLeft:
            r.left + parseFloat(getComputedStyle(content).paddingLeft),
          contentPadding: parseFloat(getComputedStyle(content).paddingLeft),
          fontSize: parseFloat(getComputedStyle(element).fontSize),
          height: root.getBoundingClientRect().height,
          overflow: getComputedStyle(root).overflowY,
        };
      });
      if (process.env.MOBILE_LAYOUT_SCREENSHOT_DIR && size.width === 390)
        await page.screenshot({
          path: `${process.env.MOBILE_LAYOUT_SCREENSHOT_DIR}/home390.png`,
        });
      check(
        home.text === "Hoje" && home.overflow === "visible",
        `${size.width}px Home keeps own title and natural height`,
        home,
      );
      if (mobile)
        check(
          home.contentLeft <= 25 &&
            home.headerGap <= 16 &&
            home.headingPadding <= 16 &&
            home.headerHeight <= 128,
          `${size.width}px Home Today local mobile spacing`,
          home,
        );
      else
        check(
          home.rootLeft === 32 &&
            home.contentPadding === 64 &&
            home.headingPadding === 48 &&
            home.headerGap === 32 &&
            home.fontSize === 48,
          `${size.width}px Home desktop composition preserved`,
          home,
        );
      if (alignmentOnly) {
        const headerAlignment = await homeHeading.evaluate((element) => {
          const frame = element.parentElement.parentElement;
          const bounds = frame.getBoundingClientRect();
          const frameStyle = getComputedStyle(frame);
          const menu = document.querySelector(
            '[aria-label="Menu do perfil do usuário"]',
          );
          const header = menu.closest(".border_after");
          const logo = header.querySelector('a[href="/app"]');
          return {
            expectedLeft: bounds.left + parseFloat(frameStyle.borderLeftWidth),
            expectedRight:
              bounds.right - parseFloat(frameStyle.borderRightWidth),
            logoLeft: logo.getBoundingClientRect().left,
            menuRight: menu.getBoundingClientRect().right,
          };
        });
        check(
          Math.abs(headerAlignment.logoLeft - headerAlignment.expectedLeft) <=
            0.5 &&
            Math.abs(
              headerAlignment.menuRight - headerAlignment.expectedRight,
            ) <= 0.5,
          `${size.width}px global logo and profile menu align to page-frame inner edges`,
          headerAlignment,
        );
        continue;
      }
      phase = `Profile ${size.width}px`;
      await page.goto(`${base}/app/profile`);
      await page
        .getByRole("heading", { name: "Minha Conta", exact: true })
        .waitFor();
      const profile = await page.evaluate(() => {
        const form = document.getElementById("profile-form");
        const root = form.parentElement;
        const region = document.querySelector('[aria-label="Preferências"]');
        return {
          padding: parseFloat(getComputedStyle(root).paddingLeft),
          topPadding: parseFloat(getComputedStyle(root).paddingTop),
          regionPadding: parseFloat(getComputedStyle(region).paddingTop),
          regionGap: parseFloat(getComputedStyle(region).rowGap),
          overflow: document.documentElement.scrollWidth > innerWidth,
          regionBottom: region.getBoundingClientRect().bottom,
          externalScroll:
            document.querySelector("[data-app-scroller]").scrollHeight -
            document.querySelector("[data-app-scroller]").clientHeight,
          spacer: region.lastElementChild.getBoundingClientRect().height,
          saveHeight: document
            .querySelector('button[form="profile-form"]')
            .getBoundingClientRect().height,
        };
      });
      if (process.env.MOBILE_LAYOUT_SCREENSHOT_DIR && size.width === 390)
        await page.screenshot({
          path: `${process.env.MOBILE_LAYOUT_SCREENSHOT_DIR}/profile390.png`,
        });
      check(
        !profile.overflow &&
          profile.externalScroll <= 1 &&
          Math.abs(profile.regionBottom - size.height) <= 1 &&
          profile.spacer === 98,
        `${size.width}px Profile independent scroll and reserve`,
        profile,
      );
      if (mobile)
        check(
          profile.padding <= 12 &&
            profile.topPadding <= 12 &&
            profile.regionPadding <= 12 &&
            profile.regionGap <= 16 &&
            profile.saveHeight >= 44,
          `${size.width}px Profile local mobile spacing`,
          profile,
        );
      else
        check(
          profile.padding === 32 &&
            profile.topPadding === 32 &&
            profile.regionPadding === 24 &&
            profile.regionGap === 24 &&
            profile.saveHeight === 40,
          `${size.width}px Profile desktop spacing preserved`,
          profile,
        );
    }
    check(
      writes.length === 0,
      "layout/view changes do not save the account",
      writes,
    );
    if (alignmentOnly) {
      assert.deepEqual(errors, []);
      assert.deepEqual(failures, []);
      console.log(
        `PASS ${checks} global-header alignment and accepted Today/Home behavior assertions`,
      );
      return;
    }
    // Increasing text can wrap controls, while labels, fields and the save action remain reachable.
    for (const route of [
      "/app/today?date=2027-11-25",
      "/app",
      "/app/profile",
    ]) {
      phase = `text200% ${route}`;
      await page.setViewportSize({ width: 320, height: 740 });
      await page.goto(`${base}${route}`);
      await page.locator("#app").waitFor();
      await page.evaluate(
        () => (document.documentElement.style.fontSize = "200%"),
      );
      await page.waitForTimeout(80);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      if (route !== "/app")
        check(!overflow, `320px/text200% ${route}: no document overflow`);
      else {
        const home = await page
          .getByRole("heading", { name: "Hoje", exact: true })
          .evaluate((e) => {
            const root = e.parentElement.parentElement;
            return {
              width: root.clientWidth,
              scroll: root.scrollWidth,
              documentOverflow:
                document.documentElement.scrollWidth > innerWidth,
              overflowing: [...root.querySelectorAll("*")]
                .filter(
                  (c) =>
                    c.getBoundingClientRect().right >
                    root.getBoundingClientRect().right + 1,
                )
                .slice(0, 6)
                .map((c) => ({
                  tag: c.tagName,
                  text: c.textContent.slice(0, 40),
                  class: c.className,
                  right: c.getBoundingClientRect().right,
                })),
            };
          });
        check(
          home.overflowing.length === 0,
          "text200% Home Today content stays contained (full-bleed divider excluded)",
          home,
        );
      }
      if (route.includes("today")) {
        const data = await page.locator("[data-today-page]").evaluate((e) => ({
          width: e.clientWidth,
          scroll: e.scrollWidth,
          text: e.querySelector("h1").textContent,
          buttons: [...e.firstElementChild.querySelectorAll("button")].map(
            (b) => b.getBoundingClientRect().right,
          ),
        }));
        if (process.env.MOBILE_LAYOUT_SCREENSHOT_DIR)
          await page.screenshot({
            path: `${process.env.MOBILE_LAYOUT_SCREENSHOT_DIR}/today320-text200.png`,
          });
        check(
          data.scroll <= data.width &&
            data.buttons.every((right) => right <= 320) &&
            data.text === "Quinta-feira, 25 de novembro de 2027",
          "text200% Today heading/controls remain contained",
          data,
        );
      }
      if (route === "/app/profile") {
        const section = page.getByRole("tablist", {
          name: "Seção da conta",
          exact: true,
        });
        await section
          .getByRole("tab", { name: "Preferências", exact: true })
          .click();
        const prefs = page.getByRole("tabpanel", {
          name: "Preferências",
          exact: true,
        });
        const data = await prefs.evaluate((e) => ({
          width: e.clientWidth,
          scroll: e.scrollWidth,
          saveRight: document
            .querySelector('button[form="profile-form"]')
            .getBoundingClientRect().right,
          overflowing: [...e.querySelectorAll("*")]
            .filter(
              (c) =>
                c.getBoundingClientRect().right >
                e.getBoundingClientRect().right + 1,
            )
            .slice(0, 8)
            .map((c) => ({
              tag: c.tagName,
              label: c.getAttribute("aria-label"),
              text: c.textContent.slice(0, 65),
              class: c.className,
              right: c.getBoundingClientRect().right,
              parentClass: c.parentElement.className,
              parentWrap: getComputedStyle(c.parentElement).flexWrap,
              parentWidth: c.parentElement.getBoundingClientRect().width,
            })),
        }));
        check(
          data.scroll <= data.width && data.saveRight <= 320,
          "text200% Profile choices and save remain contained",
          data,
        );
      }
    }
    // Profile keeps mounted draft values, validates hidden personal fields, and saves manually.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/app/profile`);
    await page
      .getByRole("tablist", { name: "Seção da conta", exact: true })
      .getByRole("tab", { name: "Informações pessoais", exact: true })
      .click();
    await page.getByLabel("Nome", { exact: true }).fill("Nome preservado");
    const section = page.getByRole("tablist", {
      name: "Seção da conta",
      exact: true,
    });
    await page.getByLabel("Sobrenome", { exact: true }).fill("");
    await section
      .getByRole("tab", { name: "Preferências", exact: true })
      .click();
    const save = page.getByRole("button", {
      name: "Salvar Alterações",
      exact: true,
    });
    await save.click();
    check(
      await page
        .getByLabel("Sobrenome", { exact: true })
        .evaluate((e) => e === document.activeElement),
      "native validation reveals and focuses personal section",
    );
    check(writes.length === 0, "invalid profile does not write");
    await page.getByLabel("Sobrenome", { exact: true }).fill("Teste");
    await section
      .getByRole("tab", { name: "Preferências", exact: true })
      .click();
    await page
      .getByRole("radiogroup", {
        name: "Visualização inicial do Hoje",
        exact: true,
      })
      .getByRole("radio", { name: "Feed", exact: true })
      .click();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.setViewportSize({ width: 390, height: 844 });
    await section
      .getByRole("tab", { name: "Informações pessoais", exact: true })
      .click();
    check(
      (await page.getByLabel("Nome", { exact: true }).inputValue()) ===
        "Nome preservado",
      "profile values survive section changes and resize",
    );
    check(writes.length === 0, "profile preference remains a manual draft");
    await save.click();
    await page
      .getByText("Perfil e preferências salvos com sucesso!", { exact: true })
      .waitFor();
    check(
      person.name === "Nome preservado" &&
        person.preferences.defaultTodayView === "feed" &&
        person.preferences.futureKey === "preserve" &&
        writes.length === 2,
      "one explicit complete profile save preserves preference merge",
      writes,
    );
    await page.waitForTimeout(100);
    const settledNotices = resizeNotices.length;
    await page.waitForTimeout(500);
    check(
      resizeNotices.length === settledNotices,
      "layout settles without recurring ResizeObserver notifications",
      resizeNotices,
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    console.log(
      `PASS ${checks} mobile/desktop layout and state assertions; controlled HTTP only. Physical iPhone remains separate.`,
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
