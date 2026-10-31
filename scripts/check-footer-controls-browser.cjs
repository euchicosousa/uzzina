const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  const base = process.env.FOOTER_CONTROLS_TEST_URL || "http://127.0.0.1:5187";
  let groups = 0;
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== base) return route.abort();
      if (url.pathname === "/__footer-controls-check")
        return route.fulfill({
          contentType: "text/html",
          body: `<html><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;await import('/tests/fixtures/footer-controls-browser.tsx');</script></body></html>`,
        });
      return route.continue();
    });
    for (const size of [
      { width: 390, height: 844 },
      { width: 844, height: 390 },
      { width: 1600, height: 900 },
    ])
      for (const theme of ["light", "dark"]) {
        await page.setViewportSize(size);
        await page.goto(`${base}/__footer-controls-check`);
        await page.evaluate(
          (theme) =>
            document.documentElement.classList.toggle("dark", theme === "dark"),
          theme,
        );
        const footer = page.getByTestId("primary");
        await footer.getByRole("button", { name: "Atualizar" }).waitFor();
        const geometry = await footer
          .getByRole("button")
          .evaluateAll((buttons) =>
            buttons.map((button) => {
              const box = button.getBoundingClientRect();
              const style = getComputedStyle(button);
              return {
                name:
                  button.getAttribute("aria-label") ||
                  button.textContent.trim(),
                height: box.height,
                width: box.width,
                radius: style.borderRadius,
              };
            }),
          );
        assert.ok(
          geometry.every(
            (button) => button.height === 48 && button.width >= 48,
          ),
          JSON.stringify({ size, theme, geometry }),
        );
        const duplicate = geometry.find((button) =>
          button.name.startsWith("Duplicar"),
        );
        assert.ok(duplicate);
        assert.ok(
          geometry.every((button) => button.radius === duplicate.radius),
          JSON.stringify(geometry),
        );
        const partners = footer.getByRole("button", { name: /Alpha/ });
        const avatars = await partners.locator('[data-slot="avatar"]').count();
        assert.ok(avatars >= 2);
        groups++;
        await partners.click();
        const beta = page.getByRole("menuitem", { name: /Beta$/ });
        await beta.click({ modifiers: ["Shift"] });
        assert.deepEqual(
          await page
            .getByTestId("primary-patches")
            .textContent()
            .then(JSON.parse)
            .then((rows) => rows.at(-1).partners),
          ["beta"],
        );
        groups++;
        await footer.getByRole("button", { name: /^Fase:/ }).click();
        await page.getByRole("menuitem", { name: /Concluído$/ }).click();
        assert.equal(
          await page
            .getByTestId("primary-patches")
            .textContent()
            .then(JSON.parse)
            .then((rows) => rows.at(-1).phase),
          "finished",
        );
        groups++;
        if (size.width === 390) {
          const strip = footer.locator("[data-action-footer-strip]");
          assert.ok(
            await strip.evaluate(
              (element) => element.scrollWidth > element.clientWidth,
            ),
          );
          await strip.evaluate((element) => {
            element.scrollLeft = element.scrollWidth;
          });
          await footer.locator('[data-strip-fade="start"]').waitFor();
          const save = await footer
            .getByRole("button", { name: "Atualizar" })
            .evaluate(
              (button) => !button.closest("[data-action-footer-strip]"),
            );
          assert.equal(save, true);
          groups++;
        }
        if (size.width === 1600)
          assert.equal(
            await page.getByTestId("secondary-patches").textContent(),
            "[]",
          );
        const disabled = page.getByRole("button", {
          name: "Disabled",
          exact: true,
        });
        assert.equal(await disabled.isDisabled(), true);
        await disabled.dispatchEvent("click");
        assert.equal(
          await page.getByTestId("disabled-presses").textContent(),
          "0",
        );
        groups++;
      }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/__footer-controls-check?empty`);
    const emptyPartner = page
      .getByTestId("primary")
      .getByRole("button", { name: "Parceiros", exact: true });
    await emptyPartner.waitFor();
    const emptyBox = await emptyPartner.boundingBox();
    assert.ok(emptyBox && emptyBox.height === 48 && emptyBox.width >= 48);
    await page.mouse.move(emptyBox.x + 10, emptyBox.y + 10);
    await page.mouse.down();
    await page.mouse.move(emptyBox.x + 10, emptyBox.y + 100, { steps: 5 });
    await page.mouse.up();
    assert.equal(
      await page.getByRole("menu").count(),
      0,
      "dragged pointer must not open a selector",
    );
    assert.equal(await page.getByTestId("primary-patches").textContent(), "[]");
    groups++;
    assert.deepEqual(errors, []);
    console.log(
      `PASS ${groups} footer geometry/selection/Shift/disabled/strip/independence groups`,
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
