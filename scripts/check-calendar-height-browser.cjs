// Real calendar components and CSS; fixture providers seed read-only query data.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  try {
    const base = process.env.CALENDAR_TEST_URL || "http://127.0.0.1:5180";
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    page.setDefaultTimeout(10000);
    await page.clock.setFixedTime(new Date("2026-10-16T15:00:00Z"));
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== base) return route.abort();
      if (url.pathname === "/__calendar-fixture.svg")
        return route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="250"><rect width="200" height="250" fill="#2563eb"/></svg>',
        });
      if (url.pathname === "/__calendar-height-check")
        return route.fulfill({
          contentType: "text/html",
          body: `<html><body><div id="root"></div><script type="module">
      import RefreshRuntime from '/@react-refresh'; RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$=()=>{}; window.$RefreshSig$=()=>type=>type;
      await import('/tests/fixtures/calendar-height-browser.tsx');
      </script></body></html>`,
        });
      return route.continue();
    });
    const open = async (query = "") => {
      await page.goto(`${base}/__calendar-height-check?${query}`);
      await page.locator("#root > *").first().waitFor();
    };
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 600 },
      { width: 1280, height: 450 },
    ]) {
      await page.setViewportSize(viewport);
      await open("count=0");
      const empty = await page.locator('[id^="day_"]').first().boundingBox();
      assert.ok(empty.height < 100, `Empty calendar day: ${empty.height}`);
      await page
        .getByRole("button", { name: "Toggle limit", exact: true })
        .click();
      const limitedEmpty = await page
        .locator('[id^="day_"]')
        .first()
        .boundingBox();
      assert.ok(
        limitedEmpty.height < 100,
        "Limit must not become a fixed height",
      );
      await open("count=24");
      for (const variant of ["line", "block", "content"]) {
        const cell = page
          .locator('[id^="day_"]')
          .filter({ has: page.locator("[data-action-id]") });
        assert.equal(await cell.locator("[data-action-id]").count(), 24);
        const auto = await cell.boundingBox();
        assert.ok(auto.height > 384, `${variant}: natural height should grow`);
        const nextWeek = page.locator('[id^="day_"]').nth(35);
        assert.ok(
          (await nextWeek.boundingBox()).height < 100,
          "Other weeks must not match the busiest week",
        );
        await page
          .getByRole("button", { name: "Toggle limit", exact: true })
          .click();
        const limited = await cell.boundingBox();
        assert.ok(
          limited.height <= Math.min(384, viewport.height * 0.6) + 1,
          `${variant}: max height ${limited.height}`,
        );
        const scroller = cell.locator('[aria-label^="Ações de"]');
        const metric = await scroller.evaluate((e) => {
          e.scrollTop = e.scrollHeight;
          return {
            height: e.clientHeight,
            content: e.scrollHeight,
            top: e.scrollTop,
          };
        });
        assert.ok(
          metric.top > 0 && metric.content > metric.height,
          `${variant}: must scroll`,
        );
        await cell.locator("[data-action-id]").last().scrollIntoViewIfNeeded();
        const visible = await cell
          .locator("[data-action-id]")
          .last()
          .evaluate((e) => {
            const r = e.getBoundingClientRect();
            const p = e
              .closest('[aria-label^="Ações de"]')
              .getBoundingClientRect();
            return r.bottom <= p.bottom + 1 && r.top >= p.top - 1;
          });
        assert.ok(visible, `${variant}: last action reachable`);
        const celebration = cell.getByText("Calendar celebration", {
          exact: true,
        });
        await celebration.scrollIntoViewIfNeeded();
        assert.ok(
          await celebration.evaluate((e) => {
            const r = e.getBoundingClientRect();
            const p = e
              .closest('[aria-label^="Ações de"]')
              .getBoundingClientRect();
            return r.bottom <= p.bottom + 1;
          }),
          "Celebration remains reachable",
        );
        await scroller.evaluate((e) => {
          e.scrollTop = 0;
        });
        await scroller.focus();
        await scroller.press("End");
        await page.waitForFunction(() => document.activeElement.scrollTop > 0);
        if (variant === "content")
          assert.ok(
            await cell
              .locator("img")
              .first()
              .evaluate((e) => e.complete && e.naturalWidth > 0),
            "Content image loaded",
          );
        await page
          .getByRole("button", { name: "Toggle limit", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Next variant", exact: true })
          .click();
      }
      const panel = page.getByTestId("calendar-panel");
      const last = page.locator('[id^="day_"]').last();
      await last.scrollIntoViewIfNeeded();
      const panelMetrics = await panel.evaluate((e) => ({
        top: e.scrollTop,
        height: e.clientHeight,
        content: e.scrollHeight,
      }));
      assert.ok(
        panelMetrics.content <= panelMetrics.height || panelMetrics.top > 0,
        JSON.stringify(panelMetrics),
      );
      console.log(`PASS team calendars ${viewport.width}x${viewport.height}`);
    }
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 600 },
    ]) {
      await page.setViewportSize(viewport);
      await open("mode=home&count=24");
      const busy = page
        .locator('[id^="day_"]')
        .filter({ has: page.locator("[data-action-id]") });
      assert.equal(await busy.locator("[data-action-id]").count(), 24);
      assert.ok((await busy.boundingBox()).height <= 384);
      await page.getByRole("radio", { name: "Mês", exact: true }).click();
      assert.ok(
        (await busy.boundingBox()).height > 384,
        "Home month starts automatic",
      );
      await page
        .getByRole("button", { name: "Visualizar", exact: true })
        .click();
      const limit = page.getByRole("menuitemcheckbox", {
        name: "Limitar altura dos dias",
      });
      assert.equal(await limit.getAttribute("aria-checked"), "false");
      await limit.click();
      await page.keyboard.press("Escape");
      assert.ok(
        (await busy.boundingBox()).height <= 384,
        "Month limit applied",
      );
      console.log(`PASS Home ${viewport.width}x${viewport.height}`);
      for (const view of ["week", "month"]) {
        await open(`mode=portal&view=${view}&count=0`);
        const dayBody = page.locator(".grid > div > div:last-child").first();
        assert.ok(
          (await dayBody.boundingBox()).height < 100,
          "Empty portal day must be natural",
        );
        await open(`mode=portal&view=${view}&count=20`);
        const grid = page.locator(".grid.overflow-y-auto");
        const portalMetrics = await grid.evaluate((e) => {
          e.scrollTop = e.scrollHeight;
          return {
            height: e.clientHeight,
            content: e.scrollHeight,
            top: e.scrollTop,
          };
        });
        assert.ok(
          portalMetrics.top > 0,
          `Portal ${view} scrolls: ${JSON.stringify(portalMetrics)}`,
        );
        const action = page
          .getByRole("button")
          .filter({ has: page.locator(".aspect-4\\/5") })
          .last();
        assert.equal(await action.count(), 1);
        await action.scrollIntoViewIfNeeded();
        const visible = await action.evaluate((e) => {
          const r = e.getBoundingClientRect();
          const p = e.closest(".overflow-y-auto").getBoundingClientRect();
          return r.bottom <= p.bottom + 1;
        });
        assert.ok(visible, `Portal ${view}: final action reachable`);
        console.log(`PASS portal ${view} ${viewport.width}x${viewport.height}`);
      }
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
