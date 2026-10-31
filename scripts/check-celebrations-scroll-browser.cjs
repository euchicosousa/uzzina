// Actual authenticated route, CSS and local font; every external request controlled.
const assert = require("node:assert/strict");
const engines = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const base = process.env.CELEBRATIONS_TEST_URL || "http://127.0.0.1:5190";
  const origin = new URL(base);
  assert.ok(["127.0.0.1", "localhost"].includes(origin.hostname));
  assert.notEqual(origin.port, "5176");
  const browser = await engines[
    process.env.CELEBRATIONS_ENGINE || "chromium"
  ].launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 800 },
      locale: "pt-BR",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const userId = "11111111-1111-4111-8111-111111111111";
    const user = {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: "test@example.invalid",
      app_metadata: { provider: "email" },
      user_metadata: {},
      created_at: "2026-01-01T00:00:00Z",
    };
    const person = {
      id: userId,
      user_id: userId,
      name: "Teste",
      surname: "Admin",
      short: "Teste",
      initials: "TA",
      email: user.email,
      admin: true,
      visible: true,
      areas: [],
      image: null,
      preferences: null,
    };
    const year = new Date().getFullYear();
    const celebrations = Array.from({ length: 144 }, (_, i) => ({
      id: `date-${i}`,
      date: `${year}-${String(Math.floor(i / 12) + 1).padStart(2, "0")}-${String((i % 12) + 1).padStart(2, "0")}`,
      title: `Data comemorativa ${i}`,
      created_at: `${year}-01-01T00:00:00Z`,
    }));
    await page.route("**/*", (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === base) return route.continue();
      if (url.pathname === "/auth/v1/user")
        return route.fulfill({ json: user });
      if (url.pathname === "/rest/v1/rpc/get_app_bootstrap")
        return route.fulfill({ json: { person, partners: [] } });
      if (!["GET", "HEAD"].includes(request.method()))
        throw new Error(
          `Unexpected external mutation: ${request.method()} ${url.pathname}`,
        );
      if (url.pathname === "/rest/v1/celebrations")
        return route.fulfill({ json: celebrations });
      if (url.pathname === "/rest/v1/people")
        return route.fulfill({ json: [person] });
      if (url.pathname.startsWith("/rest/v1/"))
        return route.fulfill({ json: [] });
      return route.abort();
    });
    await page.goto(`${base}/login`);
    const { loadEnv } = await import("vite");
    const env = loadEnv("production", process.cwd(), "VITE_");
    const project = new URL(env.VITE_SUPABASE_URL).hostname.split(".")[0];
    const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600, aud: "authenticated", role: "authenticated" })).toString("base64url")}.controlled`;
    await page.evaluate(
      ({ key, token, user }) =>
        localStorage.setItem(
          key,
          JSON.stringify({
            access_token: token,
            refresh_token: "controlled-refresh",
            token_type: "bearer",
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user,
          }),
        ),
      { key: `sb-${project}-auth-token`, token, user },
    );
    const failures = [];
    for (const width of [320, 390, 430, 767, 768, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`${base}/app/admin/celebrations`);
      await page
        .locator('[data-celebration-id="date-143"]')
        .waitFor({ state: "attached" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(100);
      const metrics = await page
        .getByRole("heading", { name: "Datas Comemorativas", exact: true })
        .evaluate((heading) => {
          const root = heading.parentElement.parentElement.parentElement;
          const left = root.firstElementChild;
          const list =
            root.querySelector("[data-month]").parentElement.parentElement;
          const app = root.closest("[data-app-scroller]");
          const form = left.querySelector("form");
          const scrollable = (el) =>
            /(auto|scroll)/.test(getComputedStyle(el).overflowY) &&
            el.scrollHeight > el.clientHeight + 1;
          return {
            gap:
              list.getBoundingClientRect().top -
              form.getBoundingClientRect().bottom,
            leftHeight: left.clientHeight,
            listHeight: list.clientHeight,
            listScrollHeight: list.scrollHeight,
            listScrollTop: list.scrollTop,
            appScrollTop: app.scrollTop,
            scrollOwners: [app, root, list].map(scrollable),
            horizontal: app.scrollWidth > app.clientWidth + 1,
          };
        });
      const ok =
        width < 768
          ? JSON.stringify(metrics.scrollOwners) === "[true,false,false]" &&
            metrics.gap <= 80 &&
            metrics.listScrollTop === 0
          : metrics.scrollOwners[2] &&
            metrics.listScrollTop > 0 &&
            metrics.appScrollTop === 0;
      console.log(
        `${ok ? "PASS" : "FAIL"} ${width}px ${JSON.stringify(metrics)}`,
      );
      if (!ok) failures.push({ width, metrics });
      const app = page.locator("[data-app-scroller]");
      const list = page.locator("[data-month]").first().locator("xpath=../..");
      const owner = width < 768 ? app : list;
      await owner.evaluate((el) => {
        el.scrollTop = 0;
      });
      const box = await owner.boundingBox();
      await page.mouse.move(Math.min(width - 20, box.x + box.width / 2), 600);
      await page.mouse.wheel(0, 240);
      await page.waitForTimeout(100);
      assert.ok(
        await owner.evaluate((el) => el.scrollTop > 0),
        `${width}px wheel must scroll its owner`,
      );
      assert.equal(
        await (width < 768 ? list : app).evaluate((el) => el.scrollTop),
        0,
        `${width}px wheel must not scroll the other region`,
      );
      await owner.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      const last = await page
        .locator('[data-celebration-id="date-143"]')
        .boundingBox();
      assert.ok(
        last.y + last.height <= 702,
        `${width}px last date must be above the floating AppBar`,
      );
      assert.equal(await list.locator("[data-app-bar-spacer]").count(), 1);
      if (process.env.CELEBRATIONS_SCREENSHOTS && [390, 1440].includes(width))
        await page.screenshot({
          path: `/tmp/uzzina-celebrations-scroll-${width}.png`,
        });
    }
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto(`${base}/app/admin/celebrations`);
    const list = page.locator("[data-month]").first().locator("xpath=../..");
    await page
      .locator('[data-celebration-id="date-143"]')
      .waitFor({ state: "attached" });
    assert.equal(await list.evaluate((el) => el.scrollTop), 0);
    await page.setViewportSize({ width: 768, height: 800 });
    await page.waitForFunction(
      () =>
        document.querySelector("[data-month]").parentElement.parentElement
          .scrollTop > 0,
    );
    assert.equal(
      await page.locator("[data-app-scroller]").evaluate((el) => el.scrollTop),
      0,
    );
    await list.evaluate((el) => {
      el.scrollTop = 123;
    });
    await page.setViewportSize({ width: 1440, height: 800 });
    await page.waitForTimeout(100);
    assert.equal(
      await list.evaluate((el) => el.scrollTop),
      123,
      "Desktop resize must preserve manual list position",
    );
    await page.setViewportSize({ width: 390, height: 800 });
    await page.waitForTimeout(100);
    assert.equal(
      await list.evaluate((el) => el.scrollTop),
      0,
      "Returning to natural mobile flow must not retain a hidden inner offset",
    );
    await page.setViewportSize({ width: 1440, height: 390 });
    await page.goto(`${base}/app/admin/celebrations`);
    await page
      .locator('[data-celebration-id="date-143"]')
      .waitFor({ state: "attached" });
    await page.waitForTimeout(100);
    const left = page
      .getByRole("heading", { name: "Datas Comemorativas", exact: true })
      .locator("xpath=../..");
    assert.ok(
      await left.evaluate((el) => el.scrollHeight > el.clientHeight),
      "Short desktop must allow the form column to scroll",
    );
    await left.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    const form = await left.locator("form").boundingBox();
    assert.ok(
      form.y + form.height <= 292,
      "Short desktop form must be reachable above AppBar",
    );
    await list.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    const last = await page
      .locator('[data-celebration-id="date-143"]')
      .boundingBox();
    assert.ok(
      last.y + last.height <= 292,
      "Short desktop final date must be reachable above AppBar",
    );
    assert.equal(
      await page.locator("[data-app-scroller]").evaluate((el) => el.scrollTop),
      0,
    );
    console.log(
      "PASS short desktop column/form/AppBar reachability; wheel ownership, last-date/AppBar reachability and mobile→desktop initialization/manual position preservation",
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(
      failures,
      [],
      "Mobile must use one natural page scroll; desktop must retain list scrolling",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
