const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const base = process.env.MEDIA_CONTROLS_TEST_URL || "http://127.0.0.1:5187";
const image = "https://media.test.invalid/first.jpg";
const video = "https://media.test.invalid/last.mp4";
const initialFiles = [image, image, video];

async function tabTo(page, target) {
  for (let step = 0; step < 24; step++) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  assert.fail(
    `Tab did not reach ${(await target.getAttribute("aria-label")) || (await target.textContent())}`,
  );
}

async function waitForFocus(target) {
  await target.and(target.page().locator(":focus")).waitFor();
}

async function waitForFiles(page, files) {
  await page
    .getByTestId("files")
    .filter({ hasText: JSON.stringify(files) })
    .waitFor();
}

async function check(browser, { mode, width, theme }) {
  const mobile = width < 960;
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: theme,
    hasTouch: mobile,
    isMobile: mobile,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    page.setDefaultTimeout(5000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.href === image)
        return route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="orange"/></svg>',
        });
      if (url.origin !== base) return route.abort();
      if (url.pathname === "/__media-controls-check")
        return route.fulfill({
          contentType: "text/html",
          body: '<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;await import("/tests/fixtures/media-controls-browser.tsx");</script></body></html>',
        });
      return route.continue();
    });

    await page.goto(`${base}/__media-controls-check?mode=${mode}`);
    await page.waitForLoadState("networkidle");
    await page.evaluate((dark) => {
      document.documentElement.classList.toggle("dark", dark);
    }, theme === "dark");
    const opener = page.getByRole("button", {
      name: "Gerenciar conteúdo da ação",
    });
    await opener.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    const preview = dialog.getByRole("complementary", {
      name: "Prévia do arquivo",
    });
    const previewButton = dialog
      .getByRole("button", { name: "Visualizar first.jpg" })
      .first();
    const checkbox = dialog.getByRole("checkbox", {
      name: "Selecionar last.mp4",
    });

    if (mobile || mode === "portal") {
      assert.equal(
        await previewButton.count(),
        0,
        "No lateral preview control",
      );
      if (mode !== "instagram") {
        const original = dialog
          .getByRole("link", { name: "Abrir first.jpg" })
          .first();
        await tabTo(page, original);
        assert.equal(await original.getAttribute("href"), image);
        assert.equal(await original.getAttribute("target"), "_blank");
      }
    }

    if (mode === "instagram" && !mobile) {
      const handle = dialog.getByRole("button", { name: "Reordenar last.mp4" });
      const dragging = handle.and(dialog.locator('[aria-pressed="true"]'));
      await tabTo(page, handle);
      await page.keyboard.press("Space");
      await dragging.waitFor();
      // dnd-kit's keyboard sensor attaches its key listener after activation.
      await page.waitForTimeout(100);
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("Escape");
      await dragging.waitFor({ state: "hidden" });
      assert.equal(
        await dialog.isVisible(),
        true,
        "Escape cancels drag before closing",
      );
      await waitForFiles(page, initialFiles);
      await tabTo(page, handle);
      await page.keyboard.press("Space");
      await dragging.waitFor();
      await page.waitForTimeout(100);
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("Space");
      await waitForFiles(page, [image, video, image]);
    }

    await tabTo(page, checkbox);
    await page.keyboard.press("Space");
    await dialog
      .getByRole("checkbox", { name: "Selecionar last.mp4", checked: true })
      .waitFor();
    const remove = dialog.getByRole("button", { name: "Excluir", exact: true });
    await tabTo(page, remove);
    await page.keyboard.press("Enter");
    const add = dialog.getByRole("button", { name: "Adicionar", exact: true });
    await waitForFocus(add);
    await waitForFiles(page, [image, image]);

    const undo = dialog.getByRole("button", { name: "Desfazer", exact: true });
    await tabTo(page, undo);
    await page.keyboard.press("Enter");
    await waitForFiles(
      page,
      mode === "instagram" && !mobile ? [image, video, image] : initialFiles,
    );
    await waitForFocus(
      dialog.getByRole("button", { name: "Concluir", exact: true }),
    );
    if (!mobile && mode !== "portal") {
      await tabTo(page, previewButton);
      await page.keyboard.press("Enter");
      await preview.waitFor();
      const checked = dialog.getByRole("checkbox", { checked: true });
      assert.equal(
        await checked.count(),
        0,
        "Opening a preview selects no file",
      );
      await tabTo(page, preview.getByRole("button", { name: "Fechar prévia" }));
      await page.keyboard.press("Escape");
      await preview.waitFor({ state: "hidden" });
      await waitForFocus(previewButton);
    }
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    await waitForFocus(opener);
    assert.deepEqual(errors, []);
    console.log(`PASS ${mode}/${width}/${theme} media controls and focus`);
  } catch (error) {
    console.error(
      `${mode}/${width}/${theme}`,
      await page.locator("body").ariaSnapshot(),
    );
    throw error;
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  try {
    for (const mode of ["essentials", "instagram"]) {
      await check(browser, { mode, width: 1440, theme: "light" });
      await check(browser, { mode, width: 390, theme: "dark" });
    }
    await check(browser, { mode: "portal", width: 1440, theme: "light" });
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
