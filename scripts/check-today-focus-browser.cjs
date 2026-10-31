const assert = require("node:assert/strict");
const engines = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const browser = await engines[
    process.env.BROWSER_ENGINE || "chromium"
  ].launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  const base = process.env.TODAY_FOCUS_TEST_URL || "http://127.0.0.1:5187";
  const failures = [];
  let groups = 0;
  const check = (condition, message) => {
    if (!condition) failures.push(message);
  };
  try {
    let page;
    const errors = [];
    const freshPage = async (width) => {
      if (page) await page.close();
      page = await browser.newPage({ viewport: { width, height: 800 } });
      page.setDefaultTimeout(6000);
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/*", (route) => {
        const url = new URL(route.request().url());
        if (url.origin !== base || url.pathname.startsWith("/api/"))
          return route.abort();
        if (url.pathname === "/__today-focus-check")
          return route.fulfill({
            contentType: "text/html",
            body: `<html><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;await import('/tests/fixtures/today-focus-browser.tsx');</script></body></html>`,
          });
        return route.continue();
      });
    };
    for (const width of [390, 1440])
      for (const theme of ["light", "dark"]) {
        for (const view of ["partners", "categories", "feed"])
          for (const empty of [false, true]) {
            const label = `${width}/${theme}/${view}/${empty ? "empty" : "populated"}`;
            await freshPage(width);
            await page.goto(
              `${base}/__today-focus-check?view=${view}${empty ? "&empty" : ""}`,
            );
            await page
              .getByRole("button", { name: "Before", exact: true })
              .waitFor();
            await page.waitForLoadState("networkidle");
            await page.evaluate(
              (theme) =>
                document.documentElement.classList.toggle(
                  "dark",
                  theme === "dark",
                ),
              theme,
            );
            const region = page.getByRole("region", { name: "Ações do dia" });
            const radio = page.getByRole("radio", {
              name: `Visão por ${view === "partners" ? "Parceiros" : view === "categories" ? "Categorias" : "Feed"}`,
            });
            await radio.focus();
            await page.keyboard.press("Tab");
            check(
              await region.evaluate((el) => el !== document.activeElement),
              `${label}: forward Tab focuses wrapper`,
            );
            await page
              .getByRole("button", { name: "After", exact: true })
              .focus();
            await page.keyboard.press("Shift+Tab");
            check(
              await region.evaluate((el) => el !== document.activeElement),
              `${label}: backward Tab focuses wrapper`,
            );
            await page
              .getByRole("button", { name: "Before", exact: true })
              .focus();
            await region.click({ position: { x: 2, y: 2 } });
            check(
              await region.evaluate((el) => el !== document.activeElement),
              `${label}: blank click focuses wrapper`,
            );
            groups++;
            if (!empty && view !== "feed") {
              const button =
                view === "partners"
                  ? page
                      .getByRole("link", { name: /Alpha$/ })
                      .locator("..")
                      .getByRole("button")
                  : page
                      .getByText("Post Estático", { exact: true })
                      .first()
                      .locator("..")
                      .locator("..")
                      .getByRole("button");
              await page.mouse.move(0, 0);
              if (view === "partners") {
                await page.getByRole("link", { name: /Alpha$/ }).focus();
                await page.keyboard.press("Tab");
              } else {
                await button.focus();
                await page.keyboard.press("Shift+Tab");
                await page.keyboard.press("Tab");
              }
              await page
                .waitForFunction(
                  (el) =>
                    el === document.activeElement &&
                    getComputedStyle(el).opacity === "1",
                  await button.elementHandle(),
                  { timeout: 1500 },
                )
                .catch(() => {});
              check(
                await button.evaluate(
                  (el) =>
                    el === document.activeElement &&
                    getComputedStyle(el).opacity === "1",
                ),
                `${label}: create hidden on keyboard focus`,
              );
              check(
                (await button.getAttribute("aria-label")) ===
                  (view === "partners"
                    ? "Criar ação para Alpha"
                    : "Criar ação em Post Estático"),
                `${label}: missing contextual name`,
              );
              await page.keyboard.press("Enter");
              const opened = JSON.parse(
                await page.getByTestId("opened").textContent(),
              );
              check(
                opened.length === 1 &&
                  !opened[0].id &&
                  (view === "partners"
                    ? opened[0].partners[0] === "alpha"
                    : opened[0].category === "post"),
                `${label}: create does not open contextual draft`,
              );
              await region.evaluate((el) => {
                el.scrollTop = el.scrollHeight;
              });
              check(
                await region.evaluate(
                  (el) => el.scrollHeight > el.clientHeight && el.scrollTop > 0,
                ),
                `${label}: inner scroll not usable`,
              );
              groups++;
            }
          }
        await freshPage(width);
        await page.goto(`${base}/__today-focus-check?home`);
        const link = page.getByRole("link", { name: /Alpha$/ });
        await link.waitFor();
        await page.waitForLoadState("networkidle");
        await page.mouse.move(0, 0);
        await link.focus();
        await page.keyboard.press("Tab");
        const create = link.locator("..").getByRole("button");
        await page
          .waitForFunction(
            (el) =>
              el === document.activeElement &&
              getComputedStyle(el).opacity === "1",
            await create.elementHandle(),
            { timeout: 1500 },
          )
          .catch(() => {});
        check(
          await create.evaluate(
            (el) =>
              el === document.activeElement &&
              getComputedStyle(el).opacity === "1",
          ),
          `${width}/${theme}: Home create hidden at focus`,
        );
        await page.keyboard.press("Space");
        check(
          JSON.parse(await page.getByTestId("opened").textContent()).length ===
            1,
          `${width}/${theme}: Home create failed`,
        );
        groups++;
      }
    await freshPage(390);
    await page.goto(`${base}/__today-focus-check?inventory`);
    await page.getByRole("link", { name: "Abrir anexo" }).waitFor();
    await page.waitForLoadState("networkidle");
    await page.mouse.move(0, 0);
    await page.getByRole("link", { name: "Abrir anexo" }).focus();
    const remove = page.getByRole("button", { name: "Remover anexo" });
    check(
      await remove.isVisible(),
      "WorkFileThumbnail does not reveal removal on link focus",
    );
    await page.keyboard.press("Tab");
    check(
      await remove.evaluate((el) => el === document.activeElement),
      "WorkFileThumbnail removal is skipped by Tab",
    );
    await page.keyboard.press("Enter");
    check(
      (await page.getByTestId("removed").textContent()) === "true",
      "WorkFileThumbnail keyboard removal failed",
    );
    groups++;
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    console.log(
      `PASS ${groups} Today/Home native focus, creation, visibility and scroll groups`,
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
