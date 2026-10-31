// Measure the real action component with application CSS and controlled data.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  try {
    const base = process.env.ACTION_TITLE_TEST_URL || "http://127.0.0.1:5187";
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== base) return route.abort();
      if (url.pathname === "/__title-height-check") {
        return route.fulfill({
          contentType: "text/html",
          body: `<html><head><link rel="stylesheet" href="/object-sans/object-sans.css"></head><body><div id="root"></div><script type="module">
import RefreshRuntime from '/@react-refresh';
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$=()=>{}; window.$RefreshSig$=()=>type=>type;
await import('/tests/fixtures/action-title-height-browser.tsx');
</script></body></html>`,
        });
      }
      return route.continue();
    });
    const failures = [];
    for (const variant of ["line", "hair", "block", "content"]) {
      for (const scenario of ["short", "long"]) {
        if (variant === "content" && scenario === "long") continue;
        for (const width of [1193, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 700 });
          await page.goto(
            `${base}/__title-height-check?variant=${variant}&long=${scenario !== "short"}`,
          );
          const title =
            scenario === "short"
              ? "Drinks"
              : "A long action title that wraps across two lines in a narrow card";
          const label = `${variant}/${scenario}/${width}px`;
          const card = page.locator("[data-action-id]");
          await card.waitFor();
          await page.evaluate(() => document.fonts.ready);
          if (variant === "content") {
            assert.equal(
              await card
                .getByRole("textbox", { name: "Editar título da ação" })
                .count(),
              0,
            );
            assert.equal(
              await card
                .getByRole("button", { name: title, exact: true })
                .count(),
              0,
            );
            console.log(`PASS ${label}: content has no inline title editor`);
            continue;
          }
          const measure = () =>
            card.evaluate((element) => {
              const title = element.querySelector("input, button");
              const following = document.querySelector(
                '[data-testid="following"]',
              );
              if (!title || !following)
                throw new Error("Missing fixture elements");
              return {
                height: element.getBoundingClientRect().height,
                titleHeight: title.getBoundingClientRect().height,
                followingTop: following.getBoundingClientRect().top,
              };
            });
          const titleButton = card.getByRole("button", {
            name: title,
            exact: true,
          });
          const titleStyle = await titleButton.evaluate((element) => {
            const style = getComputedStyle(element);
            return {
              whiteSpace: style.whiteSpace,
              overflow: style.overflow,
              textOverflow: style.textOverflow,
            };
          });
          assert.deepEqual(
            titleStyle,
            {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
            `${label}: title must stay on one line`,
          );
          console.log(`PASS ${label}: single-line title with ellipsis`);
          const before = await measure();
          await card.getByRole("button", { name: title, exact: true }).click();
          const input = card.getByRole("textbox", {
            name: "Editar título da ação",
          });
          assert.equal(
            await input.evaluate(
              (element) => element === document.activeElement,
            ),
            true,
          );
          const editing = await measure();
          if (JSON.stringify(editing) !== JSON.stringify(before)) {
            failures.push({ label, before, editing });
          }
          assert.match(await card.getAttribute("class"), /focus-within:ring-2/);
          await input.fill("Changed title");
          await input.press("Escape");
          await card
            .getByRole("button", { name: title, exact: true })
            .waitFor();
          assert.deepEqual(
            await measure(),
            before,
            `${width}px: cancel must preserve geometry`,
          );
          console.log(
            `${JSON.stringify(editing) === JSON.stringify(before) ? "PASS" : "FAIL"} ${label}: ${before.height}→${editing.height}px, title ${before.titleHeight}→${editing.titleHeight}px`,
          );
        }
      }
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, [], "Editing geometry changed");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
