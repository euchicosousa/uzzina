// Actual portal routes and CSS with controlled HTTP; no production access.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  try {
    const base = process.env.PORTAL_TEST_URL || "http://127.0.0.1:5188";
    const page = await browser.newPage();
    page.setDefaultTimeout(5000);
    const errors = [];
    const failures = [];
    const client = {
      id: "portal-layout-test",
      name: "Edrine",
      active: true,
      image: null,
    };
    let partnerCount = 1;
    let loginMode = "error";
    let loginAttempts = 0;
    let releaseLogin;
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== base) return route.abort();
      const json = (body, status = 200) =>
        route.fulfill({ status, json: body });
      if (url.pathname === "/api/dash-auth") {
        const request = route.request().postDataJSON();
        if (request.action === "login") {
          loginAttempts++;
          if (loginMode === "pending")
            await new Promise((resolve) => {
              releaseLogin = resolve;
            });
          if (loginMode === "error")
            return json({ error: "Invalid credentials" }, 401);
        }
        return json({ client });
      }
      if (url.pathname === "/api/dash-data") {
        if (url.searchParams.get("op") === "partners")
          return json({
            partners: Array.from({ length: partnerCount }, (_, i) => ({
              slug: `partner-${i}`,
              title: `Parceiro ${i + 1}`,
              short: "P",
              image: null,
              colors: [],
            })),
          });
        return json({ actions: [] });
      }
      if (url.pathname.startsWith("/api/"))
        throw new Error(`Unexpected API: ${url.pathname}`);
      return route.continue();
    });
    const check = async (label, run) => {
      try {
        await run();
        console.log(`PASS ${label}`);
      } catch (error) {
        failures.push(`${label}: ${error.message}`);
        console.log(`FAIL ${label}: ${error.message}`);
      }
    };
    const fieldBox = (locator) =>
      locator.evaluate((element) => {
        const group = element.closest('[data-slot="input-group"]') || element;
        const rect = group.getBoundingClientRect();
        const style = getComputedStyle(group);
        return {
          height: rect.height,
          width: rect.width,
          left: rect.left,
          background: style.backgroundColor,
          radius: style.borderRadius,
        };
      });
    for (const width of [390, 1440]) {
      for (const dark of [false, true]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${base}/dash/login`);
        await page.getByLabel("E-mail", { exact: true }).waitFor();
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle("dark", dark),
          dark,
        );
        await check(
          `login fields ${width}/${dark ? "dark" : "light"}`,
          async () => {
            const email = await fieldBox(
              page.getByLabel("E-mail", { exact: true }),
            );
            const password = await fieldBox(
              page.getByLabel("Senha", { exact: true }),
            );
            assert.deepEqual(
              email,
              password,
              "Email and password surfaces must match",
            );
            assert.notEqual(email.background, "rgba(0, 0, 0, 0)");
            assert.equal(
              await page
                .getByText("Portal do Parceiro", { exact: true })
                .count(),
              0,
            );
            assert.equal(
              await page.evaluate(
                () => document.documentElement.scrollWidth > innerWidth,
              ),
              false,
            );
          },
        );
      }
    }
    const email = page.getByLabel("E-mail", { exact: true });
    const password = page.getByLabel("Senha", { exact: true });
    await password.focus();
    await page.keyboard.press("Shift+Tab");
    assert.equal(
      await email.evaluate((element) => element === document.activeElement),
      true,
    );
    assert.notEqual(
      await email.evaluate(
        (element) =>
          getComputedStyle(
            element.closest('[data-slot="input-group"]') || element,
          ).boxShadow,
      ),
      "none",
    );
    await email.fill("test@example.com");
    await email.press("Tab");
    await assert.equal(
      await password.evaluate((element) => element === document.activeElement),
      true,
    );
    await password.fill("controlled-password");
    await password.press("Tab");
    await page.keyboard.press("Enter");
    assert.equal(await password.getAttribute("type"), "text");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await page
      .getByText("E-mail ou senha incorretos ou conta inativa.")
      .waitFor();
    assert.equal(loginAttempts, 1);
    loginMode = "pending";
    await password.press("Enter");
    await page.getByRole("button", { name: "Entrando..." }).waitFor();
    assert.equal(
      await page.getByRole("button", { name: "Entrando..." }).isDisabled(),
      true,
    );
    await password.press("Enter");
    assert.equal(loginAttempts, 2);
    loginMode = "success";
    releaseLogin();
    await page.waitForURL("**/dash");
    console.log(
      "PASS login keyboard, error, pending and success with controlled HTTP",
    );

    for (const width of [390, 1023, 1024, 1440]) {
      for (const count of [1, 2]) {
        partnerCount = count;
        client.name = count === 1 ? "Edrine" : "Edrine de Oliveira Sousa";
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${base}/dash?partner=partner-0&sidebar=%22true%22`);
        await page
          .locator("header")
          .waitFor()
          .catch(async (error) => {
            await page.getByText("Show Error", { exact: true }).click();
            console.error(await page.locator("body").innerText(), errors);
            throw error;
          });
        await page
          .locator('[data-slot="toggle-group-item"]')
          .first()
          .waitFor({ state: "attached" });
        const toggle = page.locator(
          'button.absolute.top-4.left-4, button[aria-controls="dash-instagram-feed"]',
        );
        await check(`feed layout ${width}/${count} partners`, async () => {
          if (width < 1024) {
            assert.equal(
              await toggle.isVisible(),
              false,
              "Desktop toggle must be absent on mobile",
            );
            await page
              .getByRole("button", { name: "Feed", exact: true })
              .click();
            await page
              .getByText("Nenhuma publicação programada.")
              .filter({ visible: true })
              .waitFor();
            await page
              .getByRole("button", { name: "Calendário", exact: true })
              .click();
            return;
          }
          const button = await toggle.boundingBox();
          const header = await page.locator("header").boundingBox();
          assert.ok(
            button && header && button.y >= header.y + header.height,
            "Feed toggle overlaps account header",
          );
          const fitsToolbar = await toggle.evaluate((element) => {
            const group = element.parentElement;
            const toolbar = group?.parentElement;
            const dateControls = toolbar?.firstElementChild;
            if (!group || !dateControls) return false;
            return (
              group.getBoundingClientRect().left >=
              dateControls.getBoundingClientRect().right
            );
          });
          assert.equal(
            fitsToolbar,
            true,
            "Feed control must not overlap date controls",
          );
          assert.equal(await toggle.getAttribute("aria-expanded"), "true");
          const panelId = await toggle.getAttribute("aria-controls");
          assert.ok(panelId);
          await page
            .getByRole("button", {
              name: "Ocultar feed do Instagram",
              exact: true,
            })
            .click();
          await page.waitForFunction(
            () =>
              new URL(location.href).searchParams.get("sidebar") === '"false"',
          );
          assert.equal(await page.locator(`#${panelId}`).isVisible(), false);
          await page.keyboard.press("Space");
          await page.waitForFunction(
            () =>
              new URL(location.href).searchParams.get("sidebar") === '"true"',
          );
          assert.equal(await page.locator(`#${panelId}`).isVisible(), true);
          await page.keyboard.press("Enter");
          await page.waitForFunction(
            () =>
              new URL(location.href).searchParams.get("sidebar") === '"false"',
          );
          await page.reload();
          await page
            .getByRole("button", {
              name: "Mostrar feed do Instagram",
              exact: true,
            })
            .waitFor();
          assert.equal(await page.locator(`#${panelId}`).isVisible(), false);
          assert.equal(
            new URL(page.url()).searchParams.get("partner"),
            "partner-0",
          );
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
          );
        });
      }
    }
    await page.setViewportSize({ width: 390, height: 900 });
    await page.getByRole("button", { name: "Feed", exact: true }).click();
    await page
      .getByText("Nenhuma publicação programada.")
      .filter({ visible: true })
      .waitFor();
    await page.setViewportSize({ width: 1024, height: 900 });
    await page
      .getByRole("button", { name: "Mostrar feed do Instagram", exact: true })
      .click();
    assert.equal(await page.locator("#dash-instagram-feed").isVisible(), true);
    console.log(
      "PASS resize preserves mobile feed access and desktop sidebar state",
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
