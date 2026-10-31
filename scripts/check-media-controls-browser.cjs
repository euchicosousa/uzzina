const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  const base = process.env.MEDIA_CONTROLS_TEST_URL || "http://127.0.0.1:5187";
  const errors = [];
  let checks = 0;
  try {
    const context = await browser.newContext({ hasTouch: true });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== base) return route.abort();
      if (url.pathname === "/__media-controls-check")
        return route.fulfill({
          contentType: "text/html",
          body: `<html><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;await import('/tests/fixtures/media-controls-browser.tsx');</script></body></html>`,
        });
      return route.continue();
    });
    for (const width of [390, 1440])
      for (const theme of ["light", "dark"]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${base}/__media-controls-check`);
        await page.evaluate(
          (theme) =>
            document.documentElement.classList.toggle("dark", theme === "dark"),
          theme,
        );
        const opener = page.getByRole("button", {
          name: "Gerenciar conteúdo da ação",
        });
        await opener.click();
        const dialog = page.getByRole("dialog");
        await dialog.waitFor();
        await page.mouse.move(0, 0);
        const thumbnail = dialog.locator(".aspect-square").first();
        const remove = thumbnail.locator("button").last();
        assert.equal(
          await remove.isVisible(),
          true,
          `${width}/${theme}: removal hidden without hover`,
        );
        const geometry = await thumbnail.evaluate((el) => {
          const buttons = [...el.querySelectorAll("button")];
          const boxes = buttons.map((button) => {
            const b = button.getBoundingClientRect();
            return {
              x: b.x,
              y: b.y,
              width: b.width,
              height: b.height,
              opacity: getComputedStyle(button).opacity,
            };
          });
          const [a, b] = boxes;
          return {
            boxes,
            overlap:
              a &&
              b &&
              a.x < b.x + b.width &&
              a.x + a.width > b.x &&
              a.y < b.y + b.height &&
              a.y + a.height > b.y,
          };
        });
        assert.equal(geometry.boxes.length, 2);
        assert.ok(
          geometry.boxes.every(
            (b) => b.width >= 32 && b.height >= 32 && b.opacity === "1",
          ),
        );
        assert.equal(geometry.overlap, false);
        assert.equal(
          await thumbnail.getByText("1", { exact: true }).isVisible(),
          true,
        );
        checks++;
        const handle = dialog.getByRole("button", {
          name: "Reordenar arquivo 3",
        });
        await handle.focus();
        await page.keyboard.press("Space");
        await page.waitForTimeout(100);
        await page.keyboard.press("ArrowLeft");
        await page.waitForTimeout(100);
        await page.keyboard.press("Space");
        assert.deepEqual(
          await page.getByTestId("files").textContent().then(JSON.parse),
          [
            "https://media.test.invalid/first.jpg",
            "https://media.test.invalid/last.mp4",
            "https://media.test.invalid/first.jpg",
          ],
        );
        checks++;
        await dialog
          .getByRole("button", { name: "Reordenar arquivo 1" })
          .focus();
        await page.keyboard.press("Space");
        await page.waitForTimeout(100);
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(100);
        await page.keyboard.press("Escape");
        assert.equal(
          await dialog.isVisible(),
          true,
          "drag Escape must not dismiss dialog",
        );
        assert.deepEqual(
          await page.getByTestId("files").textContent().then(JSON.parse),
          [
            "https://media.test.invalid/first.jpg",
            "https://media.test.invalid/last.mp4",
            "https://media.test.invalid/first.jpg",
          ],
        );
        checks++;
        if (width === 390 && theme === "light") {
          await page.waitForTimeout(250);
          const from = await dialog
            .getByRole("button", { name: "Reordenar arquivo 1" })
            .boundingBox();
          const to = await dialog
            .getByRole("button", { name: "Reordenar arquivo 2" })
            .boundingBox();
          assert.ok(from && to);
          await page.mouse.move(
            from.x + from.width / 2,
            from.y + from.height / 2,
          );
          await page.mouse.down();
          await page.waitForTimeout(100);
          assert.equal(
            await dialog
              .getByRole("button", { name: "Reordenar arquivo 1" })
              .getAttribute("aria-pressed"),
            "true",
            "pointer starts drag",
          );
          await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
            steps: 10,
          });
          await page.waitForTimeout(100);
          await page.mouse.up();
          assert.deepEqual(
            await page.getByTestId("files").textContent().then(JSON.parse),
            [
              "https://media.test.invalid/last.mp4",
              "https://media.test.invalid/first.jpg",
              "https://media.test.invalid/first.jpg",
            ],
          );
          await dialog
            .getByRole("button", { name: "Reordenar arquivo 1" })
            .focus();
          await page.keyboard.press("Space");
          await page.waitForTimeout(100);
          await page.keyboard.press("ArrowRight");
          await page.waitForTimeout(100);
          await page.keyboard.press("Space");
          assert.deepEqual(
            await page.getByTestId("files").textContent().then(JSON.parse),
            [
              "https://media.test.invalid/first.jpg",
              "https://media.test.invalid/last.mp4",
              "https://media.test.invalid/first.jpg",
            ],
          );
          checks++;
        }
        await dialog.getByRole("button", { name: "Remover arquivo 2" }).focus();
        await page.keyboard.press("Enter");
        assert.equal(
          await dialog
            .getByRole("button", { name: "Remover arquivo 2" })
            .evaluate((el) => el === document.activeElement),
          true,
        );
        assert.deepEqual(
          await page.getByTestId("files").textContent().then(JSON.parse),
          [
            "https://media.test.invalid/first.jpg",
            "https://media.test.invalid/first.jpg",
          ],
        );
        checks++;
        await page.keyboard.press("Space");
        assert.equal(
          await dialog
            .getByRole("button", { name: "Remover arquivo 1" })
            .evaluate((el) => el === document.activeElement),
          true,
        );
        assert.deepEqual(
          await page.getByTestId("files").textContent().then(JSON.parse),
          ["https://media.test.invalid/first.jpg"],
        );
        checks++;
        await dialog.getByRole("button", { name: "Remover arquivo 1" }).tap();
        assert.equal(
          await dialog
            .getByRole("button", { name: "Adicionar", exact: true })
            .evaluate((el) => el === document.activeElement),
          true,
        );
        assert.deepEqual(
          await page.getByTestId("files").textContent().then(JSON.parse),
          [],
        );
        checks++;
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        await page.waitForFunction(
          () =>
            document.activeElement?.textContent ===
            "Gerenciar conteúdo da ação",
        );
        assert.equal(
          await opener.evaluate((el) => el === document.activeElement),
          true,
        );
        checks++;
      }
    assert.deepEqual(errors, []);
    console.log(
      `PASS ${checks} media visibility/geometry/keyboard/touch/focus groups`,
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
