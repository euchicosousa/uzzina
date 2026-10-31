// Real Prism gallery and CSS. External requests are blocked.
const assert = require("node:assert/strict");
const engines = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const base = process.env.PRISM_TABS_TEST_URL || "http://127.0.0.1:5191";
  const origin = new URL(base);
  assert.ok(["127.0.0.1", "localhost"].includes(origin.hostname));
  assert.notEqual(origin.port, "5176");
  const browser = await engines[
    process.env.MOBILE_LAYOUT_ENGINE || "chromium"
  ].launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) =>
      new URL(route.request().url()).origin === origin.origin
        ? route.continue()
        : route.abort(),
    );
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ["light", "dark"]) {
        await page.goto(`${base}/ui`);
        await page
          .getByRole("button", { name: "Componentes de UI", exact: true })
          .click();
        await page.evaluate(
          (theme) =>
            document.documentElement.classList.toggle("dark", theme === "dark"),
          theme,
        );
        const tabs = page.getByRole("tablist", { name: "Exemplo de abas" });
        await tabs.scrollIntoViewIfNeeded();
        const details = tabs.getByRole("tab", {
          name: "Informações",
          exact: true,
        });
        const preview = tabs.getByRole("tab", { name: "Prévia", exact: true });
        const input = page.getByRole("textbox", {
          name: "Rascunho do exemplo",
        });
        await input.fill("Preservar rascunho");
        await details.focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await preview.getAttribute("aria-selected"), "true");
        await page.keyboard.press("ArrowRight");
        assert.equal(
          await details.getAttribute("aria-selected"),
          "true",
          "Disabled tab is skipped",
        );
        assert.equal(await input.inputValue(), "Preservar rascunho");
        const panel = page.getByRole("tabpanel", {
          name: "Informações",
          exact: true,
        });
        assert.equal(
          await panel.getAttribute("aria-labelledby"),
          await details.getAttribute("id"),
        );
        await page.waitForTimeout(300);
        const style = await details.evaluate((e) => ({
          radius: getComputedStyle(e).borderRadius,
          selected: getComputedStyle(e, "::after").backgroundColor,
          focus: getComputedStyle(e).borderTopColor,
          height: e.getBoundingClientRect().height,
        }));
        assert.equal(style.radius, "0px");
        assert.notEqual(style.selected, "rgba(0, 0, 0, 0)");
        assert.equal(style.focus, style.selected);
        assert.ok(style.height >= 44);
        if (width === 390 && theme === "dark")
          await page.screenshot({
            path: "/tmp/uzzina-shared-tabs-gallery.png",
          });
        console.log(
          `PASS ${width}px/${theme}: arrows, disabled tab, retained draft, panel relation, underline and keyboard focus`,
        );
      }
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
