// Actual portal/calendar/fetch client; only HTTP is controlled. No real writes.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  try {
    const base = process.env.PORTAL_TEST_URL || "http://127.0.0.1:5177";
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      timezoneId: "America/Fortaleza",
    });
    page.setDefaultTimeout(10000);
    await page.clock.install({ time: new Date("2026-01-31T15:00:00Z") });
    const periods = [];
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const client = {
      id: "calendar-client",
      name: "Cliente calendário",
      active: true,
      partners: ["smartmed"],
      email: "test@example.com",
    };
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== base) return route.abort();
      if (url.pathname === "/api/dash-auth")
        return route.fulfill({ json: { client } });
      if (url.pathname === "/api/dash-data") {
        if (url.searchParams.get("op") === "partners")
          return route.fulfill({
            json: {
              partners: [
                {
                  slug: "smartmed",
                  title: "Smartmed",
                  short: "SM",
                  colors: ["#112233", "#ffffff"],
                },
              ],
            },
          });
        periods.push({
          from: url.searchParams.get("from"),
          to: url.searchParams.get("to"),
          partner: url.searchParams.get("partner"),
        });
        return route.fulfill({ json: { actions: [] } });
      }
      return route.continue();
    });
    await page.goto(`${base}/dash`);
    const expectPeriod = async (from, to) => {
      await page.waitForFunction(() =>
        document.body.innerText.includes("Smartmed"),
      );
      for (
        let i = 0;
        i < 100 && !periods.some((p) => p.from === from && p.to === to);
        i++
      )
        await page.waitForTimeout(20);
      assert.ok(
        periods.some(
          (p) => p.from === from && p.to === to && p.partner === "smartmed",
        ),
        JSON.stringify({ expected: { from, to }, periods }),
      );
    };
    await expectPeriod("2025-12-28 00:00:00", "2026-01-31 23:59:59");
    const next = () =>
      page
        .locator("button:visible")
        .filter({ has: page.locator(".lucide-chevron-right") })
        .first()
        .click();
    await next();
    await expectPeriod("2026-02-01 00:00:00", "2026-02-28 23:59:59");
    await next();
    await expectPeriod("2026-03-01 00:00:00", "2026-04-04 23:59:59");
    await page.clock.setSystemTime(new Date("2026-12-31T15:00:00Z"));
    await page.reload();
    await expectPeriod("2026-11-29 00:00:00", "2027-01-02 23:59:59");
    await next();
    await expectPeriod("2026-12-27 00:00:00", "2027-02-06 23:59:59");
    await page.getByRole("radio", { name: "Semana", exact: true }).click();
    await expectPeriod("2027-01-31 00:00:00", "2027-02-06 23:59:59");
    assert.deepEqual(errors, []);
    console.log(
      "PASS real portal queries: Jan31→Feb→Mar, Dec→Jan, Sunday–Saturday weekly bounds, America/Fortaleza. Controlled HTTP, not real database.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
