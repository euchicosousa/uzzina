// Real calendar components, app CSS and local font; external requests blocked.
const engines = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const engine = engines[process.env.CALENDAR_ENGINE || "chromium"];
const assert = require("node:assert/strict");
(async () => {
  const base = process.env.CALENDAR_TEST_URL || "http://127.0.0.1:5190";
  const url = new URL(base);
  assert.ok(["127.0.0.1", "localhost"].includes(url.hostname));
  assert.notEqual(url.port, "5176");
  const browser = await engine.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  const failures = [];
  try {
    const page = await browser.newPage({
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== base) return route.abort();
      if (url.pathname === "/__calendar-width")
        return route.fulfill({
          contentType: "text/html",
          body: `<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/object-sans/object-sans.css"></head><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh'; RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;await import('/tests/fixtures/calendar-width-browser.tsx');</script></body></html>`,
        });
      return route.continue();
    });
    for (const width of process.env.CALENDAR_BEHAVIOR_ONLY
      ? []
      : [320, 375, 390, 430, 1440]) {
      for (const text of ["100%", "125%", "200%"]) {
        for (const date of process.env.CALENDAR_QUICK
          ? ["2026-09-15"]
          : ["2026-09-15", "2026-11-15", "2026-05-15"]) {
          await page.setViewportSize({ width, height: 800 });
          await page.goto(
            `${base}/__calendar-width?text=${text}&date=${date}T12:00:00`,
          );
          await page
            .locator("button")
            .filter({ has: page.locator("svg.lucide-calendar-days") })
            .click();
          await page.locator('[data-slot="calendar"]').waitFor();
          await page.evaluate(() => {
            document.documentElement.style.fontSize =
              new URLSearchParams(location.search).get("text") || "100%";
            return document.fonts.ready;
          });
          await page.waitForTimeout(150);
          const geometry = await page
            .locator('[data-slot="calendar"]')
            .evaluate((calendar) => {
              const popover = calendar.closest('[data-slot="popover-content"]');
              const rect = (el) => {
                const r = el.getBoundingClientRect();
                return {
                  left: r.left,
                  right: r.right,
                  width: r.width,
                  height: r.height,
                };
              };
              return {
                calendar: rect(calendar),
                popover: rect(popover),
                client: popover.clientWidth,
                scroll: popover.scrollWidth,
                grid: rect(calendar.querySelector("table")),
                headers: [...calendar.querySelectorAll("th")].map(rect),
                cell: rect(calendar.querySelector("td>div>div")),
                controls: [...calendar.querySelectorAll("button")].map(rect),
                captionTextFits: [
                  ...calendar.querySelectorAll('[data-slot="select-value"]'),
                ].every((value) => {
                  const range = document.createRange();
                  range.selectNodeContents(value);
                  const text = range.getBoundingClientRect();
                  const trigger = value
                    .closest("button")
                    .getBoundingClientRect();
                  return (
                    text.left >= trigger.left &&
                    text.right <= trigger.right &&
                    text.top >= trigger.top &&
                    text.bottom <= trigger.bottom
                  );
                }),
                dayTextFits: [...calendar.querySelectorAll("td>div>div")].every(
                  (day) => {
                    const range = document.createRange();
                    range.selectNodeContents(day);
                    return (
                      range.getBoundingClientRect().width <= day.clientWidth
                    );
                  },
                ),
              };
            });
          console.log(
            JSON.stringify({
              width,
              text,
              date,
              client: geometry.client,
              scroll: geometry.scroll,
              grid: geometry.grid.width,
              cell: geometry.cell.width,
            }),
          );
          assert.equal(geometry.headers.length, 7);
          assert.equal(
            geometry.captionTextFits,
            true,
            "Caption text must fit at increased text size",
          );
          assert.equal(
            geometry.dayTextFits,
            true,
            "Day text must fit at increased text size",
          );
          assert.ok(
            Math.abs(
              geometry.cell.width -
                (text === "100%" ? 32 : text === "125%" ? 35 : 40),
            ) < 0.1,
          );
          assert.ok(Math.abs(geometry.cell.height - geometry.cell.width) < 0.1);
          if (
            geometry.scroll > geometry.client + 1 ||
            [...geometry.headers, ...geometry.controls].some(
              (r) =>
                r.left < geometry.popover.left ||
                r.right > geometry.popover.right,
            )
          )
            failures.push({ width, text, date });
          if (
            process.env.CALENDAR_SCREENSHOTS &&
            ((width === 320 && text === "200%") ||
              (width === 390 && text === "100%")) &&
            date === "2026-09-15"
          )
            await page.screenshot({
              path: `/tmp/uzzina-calendar-${width}-${text.replace("%", "")}.png`,
            });
          await page.keyboard.press("Escape");
          await page
            .locator('[data-slot="calendar"]')
            .waitFor({ state: "hidden" });
          assert.equal(
            await page
              .locator("button")
              .filter({ has: page.locator("svg.lucide-calendar-days") })
              .evaluate((el) => el === document.activeElement),
            true,
          );
        }
      }
    }
    await page.setViewportSize({ width: 320, height: 220 });
    await page.goto(`${base}/__calendar-width?date=2026-09-15T12:00:00`);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "125%";
    });
    const trigger = page
      .locator("button")
      .filter({ has: page.locator("svg.lucide-calendar-days") });
    await trigger.click();
    const calendar = page.locator('[data-slot="calendar"]');
    await calendar.waitFor();
    await page.waitForTimeout(150);
    assert.equal(
      await page
        .locator('[data-slot="popover-content"]')
        .evaluate((el) => el.scrollHeight > el.clientHeight),
      true,
      "Short viewport must retain vertical scrolling",
    );
    await calendar.locator('[data-selected="true"]').focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await calendar.waitFor({ state: "hidden" });
    assert.equal(await page.getByTestId("date").textContent(), "2026-9-16");
    await trigger.click();
    await page.locator('[data-slot="select-trigger"]').nth(0).click();
    await page.getByRole("option", { name: "nov.", exact: true }).click();
    await page.locator('[data-slot="select-trigger"]').nth(1).click();
    await page.getByRole("option", { name: "2027", exact: true }).click();
    assert.equal(
      await page.locator('[data-slot="select-trigger"]').nth(0).textContent(),
      "nov.",
    );
    assert.equal(
      await page.locator('[data-slot="select-trigger"]').nth(1).textContent(),
      "2027",
    );
    await page
      .locator('[data-slot="select-content"]')
      .waitFor({ state: "hidden" });
    await page.waitForTimeout(150);
    await page.keyboard.press("Escape");
    await calendar.waitFor({ state: "hidden" });
    console.log(
      "PASS keyboard date selection, month/year selection, Escape/focus return and short-viewport vertical scrolling",
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(
      failures,
      [],
      "Calendar columns/caption overflow the popover",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
