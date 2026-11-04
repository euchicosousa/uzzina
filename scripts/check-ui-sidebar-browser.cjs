// Run against an isolated Vite server without production environment variables.
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const base = new URL(
    process.env.UI_SIDEBAR_TEST_URL || "http://127.0.0.1:5187",
  );
  assert.ok(["localhost", "127.0.0.1"].includes(base.hostname));
  assert.notEqual(base.port, "5176");
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1244, height: 1000 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== base.origin || url.pathname.startsWith("/api/"))
        return route.abort();
      if (url.pathname === "/ui") {
        return route.fulfill({
          contentType: "text/html",
          body: `<div id="root"></div><script type="module">
import RefreshRuntime from '/@react-refresh';
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => type => type;
await import('/tests/fixtures/ui-sidebar-browser.tsx');
</script>`,
        });
      }
      return route.continue();
    });
    const reached = async (id, offset) => {
      await page.waitForFunction(
        ({ id, offset }) => {
          const target = document.getElementById(id);
          const main = document.querySelector("main");
          return (
            target &&
            main &&
            Math.abs(
              target.getBoundingClientRect().top -
                main.getBoundingClientRect().top -
                offset,
            ) < 3
          );
        },
        { id, offset },
        { timeout: 5000 },
      );
      console.log(`PASS actual content reached ${id}, offset ${offset}px`);
    };
    const click = (id) => page.locator(`nav a[href="#${id}"]`).click();

    for (const reducedMotion of ["no-preference", "reduce"]) {
      await page.emulateMedia({ reducedMotion });
      await page.goto(`${base.origin}/ui#uzzina-phase-combobox`);
      await page.reload();
      await page.locator("#uzzina-avatar-uavatar").waitFor();
      await reached("uzzina-phase-combobox", 64);
      await click("uzzina-avatar");
      await reached("uzzina-avatar-uavatar", 64);
      assert.equal(new URL(page.url()).hash, "#uzzina-avatar-uavatar");
      await click("uzzina-avatar-uavatargroup");
      await reached("uzzina-avatar-uavatargroup", 72);
      await click("uzzina-phase-combobox");
      await click("uzzina-avatar");
      await reached("uzzina-avatar-uavatar", 64);

      await page.goto(`${base.origin}/ui#prism-calendar`);
      await page.reload();
      await page.locator("#prism-button").waitFor();
      await reached("prism-calendar", 64);
      await click("prism-button");
      await reached("prism-button-button", 64);
      await click("prism-button-group");
      await reached("prism-button-group", 72);
      console.log(
        `PASS browser history, restoration, first clicks, rapid clicks: ${reducedMotion}`,
      );
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
