// Actual app and Supabase SDK; HTTP controlled. No production access.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  try {
    const base = process.env.PORTAL_TEST_URL || "http://127.0.0.1:5176";
    const width = Number(process.env.AI_TEST_WIDTH || 1440);
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      hasTouch: width < 768,
      isMobile: width < 768,
      timezoneId: "America/Fortaleza",
    });
    page.setDefaultTimeout(10000);
    const activate = (locator) =>
      width < 768 ? locator.tap() : locator.click();
    const errors = [];
    page.on("pageerror", (e) => {
      errors.push(e.message);
      console.error("PAGEERROR", e.message);
    });
    const userId = "11111111-1111-4111-8111-111111111111";
    const user = {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: "test@example.com",
      app_metadata: { provider: "email" },
      user_metadata: {},
      created_at: "2026-01-01T00:00:00Z",
    };
    const person = {
      id: userId,
      user_id: userId,
      name: "Administrador teste",
      surname: "Teste",
      short: "Teste",
      initials: "AT",
      admin: true,
      visible: true,
      areas: [],
      image: null,
      email: user.email,
      preferences: null,
    };
    const partners = [
      {
        id: "p-active",
        slug: "active",
        title: "Parceiro ativo",
        short: "Ativo",
        archived: false,
        users_ids: [userId],
        image: null,
        colors: ["#123456", "#ffffff"],
        sow: "social",
      },
      {
        id: "p-hidden",
        slug: "hidden",
        title: "Parceiro oculto",
        short: "Oculto",
        archived: true,
        users_ids: [userId],
        image: null,
        colors: ["#123456", "#ffffff"],
        sow: "social",
      },
    ];
    const actions = partners.map((p, i) => ({
      id: `action-${i}`,
      title: i ? "AÇÃO OCULTA" : "AÇÃO ATIVA",
      partners: [p.slug],
      responsibles: [userId],
      sprints: [],
      date: "2026-01-01T12:00:00Z",
      phase: "do",
      category: "post",
      priority: "medium",
      color: "#123456",
      description: "<p>INSUMO ORIGINAL — manter</p>",
      content_description: "<p>CONTEÚDO ORIGINAL</p>",
      strategies: [],
      content_files: [],
      work_files: [],
      instagram_caption: "LEGENDA ORIGINAL — manter",
      archived: false,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    }));
    const writes = [];
    const aiRequests = [];
    let aiMode = "success";
    let aiGate = null;
    let releaseAI;
    const strategies = Array.from({ length: 5 }, (_, i) => ({
      headline: `Estratégia teste ${i + 1}`,
      angulo: `${i + 1}. Ângulo teste`,
      racional: "Racional de teste",
      direcionamento: "Direção de teste",
    }));
    await page.route("**/*", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.origin === base && url.pathname === "/api/ai") {
        const payload = req.postDataJSON();
        aiRequests.push(payload);
        const gate = aiGate;
        if (gate) await gate;
        if (aiMode === "abort") return route.abort("internetdisconnected");
        if (typeof aiMode === "number")
          return route.fulfill({
            status: aiMode,
            json: { error: "Controlled failure" },
            headers: { "Retry-After": "60" },
          });
        const output =
          payload.intent === "ai-strategy"
            ? { strategies }
            : payload.intent === "ai-content"
              ? { content: "<p>CONTEÚDO GERADO DE TESTE</p>" }
              : { caption: "LEGENDA GERADA DE TESTE" };
        return route.fulfill({
          json: {
            intent: payload.intent,
            output: aiMode === "invalid" ? { caption: 42 } : output,
          },
        });
      }
      if (url.origin === base) return route.continue();
      if (url.pathname === "/auth/v1/user")
        return route.fulfill({ json: user });
      if (url.pathname === "/rest/v1/rpc/get_app_bootstrap")
        return route.fulfill({ json: { person, partners } });
      if (url.pathname === "/rest/v1/rpc/get_home_actions") {
        return route.fulfill({ json: actions });
      }
      if (url.pathname === "/rest/v1/partners") {
        const filtered =
          url.searchParams.get("archived") === "eq.false"
            ? partners.filter((p) => !p.archived)
            : partners;
        return route.fulfill({ json: filtered });
      }
      if (url.pathname === "/rest/v1/actions") {
        if (req.method() === "PATCH") {
          const patch = req.postDataJSON();
          const expected = url.searchParams.get("updated_at");
          writes.push({ patch, expected });
          assert.equal(expected, `eq.${actions[0].updated_at}`);
          Object.assign(actions[0], patch, {
            updated_at: `2026-10-06T23:00:${String(writes.length).padStart(2, "0")}.000Z`,
          });
          return route.fulfill({ json: actions[0] });
        }
        return route.fulfill({ json: actions });
      }
      if (url.pathname === "/rest/v1/people")
        return route.fulfill({ json: [person] });
      if (url.pathname.startsWith("/rest/v1/"))
        return route.fulfill({ json: [] });
      return route.abort();
    });
    assert.equal((await page.request.get(`${base}/api/ai`)).status(), 405);
    assert.equal(
      (
        await page.request.post(`${base}/api/ai`, {
          data: { intent: "ai-caption", category: "post" },
        })
      ).status(),
      401,
    );
    await page.goto(`${base}/login`);
    const payload = Buffer.from(
      JSON.stringify({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 3600,
        aud: "authenticated",
        role: "authenticated",
      }),
    ).toString("base64url");
    const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${payload}.test-signature`;
    await page.evaluate(async (token) => {
      const { createSupabaseBrowserClient } =
        await import("/app/lib/supabase.client.ts");
      const { error } = await createSupabaseBrowserClient().auth.setSession({
        access_token: token,
        refresh_token: "controlled-test-refresh",
      });
      if (error) throw error;
    }, token);
    await page.goto(`${base}/app`);
    await page
      .getByRole("heading", { name: "Atrasadas", exact: true })
      .waitFor();
    await page
      .getByText("AÇÃO ATIVA", { exact: true })
      .first()
      .waitFor({ timeout: 7000 })
      .catch(async (error) => {
        console.error((await page.locator("body").innerText()).slice(0, 1800));
        throw error;
      });

    const openDrawer = async () => {
      const card = page.locator('[data-action-id="action-0"]').first();
      if (width < 768) {
        const bounds = await card.boundingBox();
        assert.ok(bounds);
        await card.tap({
          position: { x: bounds.width - 12, y: bounds.height - 12 },
        });
      } else await card.press("Enter");
      await page.getByRole("button", { name: "Fechar", exact: true }).waitFor();
    };
    await openDrawer();
    aiGate = new Promise((resolve) => {
      releaseAI = resolve;
    });
    const arriving = page.waitForRequest(
      (req) => new URL(req.url()).pathname === "/api/ai",
    );
    const firstGenerate = page.getByRole("button", {
      name: "CRIAR ESTRATÉGIA",
      exact: true,
    });
    if (width < 768) {
      await firstGenerate.scrollIntoViewIfNeeded();
      const bounds = await firstGenerate.boundingBox();
      assert.ok(bounds);
      const x = bounds.x + bounds.width / 2;
      const y = bounds.y + bounds.height / 2;
      await page.touchscreen.tap(x, y);
      await page.touchscreen.tap(x, y);
    } else await firstGenerate.dblclick();
    await arriving;
    await activate(page.getByRole("button", { name: "Fechar", exact: true }));
    await page
      .getByText(
        "Aguarde a geração terminar antes de trocar ou fechar a ação.",
        { exact: true },
      )
      .waitFor();
    assert.equal(
      await page.getByRole("textbox", { name: "Título da ação" }).inputValue(),
      "AÇÃO ATIVA",
    );
    assert.equal(aiRequests.length, 1);
    aiGate = null;
    releaseAI();
    await page
      .getByRole("heading", { name: "5 Estratégias Sugeridas" })
      .waitFor();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Modal must not overflow viewport",
    );
    assert.equal(
      await page
        .getByRole("checkbox", { name: "Selecionar estratégia" })
        .count(),
      5,
    );
    await activate(
      page.getByRole("button", { name: "Estratégia teste 1", exact: true }),
    );
    await activate(
      page
        .getByRole("button", { name: "USAR ESTA ESTRATÉGIA", exact: true })
        .first(),
    );
    await activate(page.getByRole("tab", { name: "INSTAGRAM", exact: true }));
    await activate(page.getByRole("tab", { name: "Conteúdo", exact: true }));
    await page
      .getByText("CONTEÚDO GERADO DE TESTE", { exact: true })
      .waitFor({ timeout: 5000 });
    await activate(page.getByRole("tab", { name: "Legenda", exact: true }));
    await activate(
      page.getByRole("button", { name: "Gerar legenda", exact: true }),
    );
    await page.waitForFunction(() =>
      document
        .querySelector('textarea[aria-label="Legenda do Instagram"]')
        ?.value.includes("LEGENDA GERADA DE TESTE"),
    );
    await activate(page.getByRole("button", { name: "Fechar", exact: true }));
    await page
      .getByRole("button", { name: "Fechar", exact: true })
      .waitFor({ state: "hidden" });
    assert.ok(
      actions[0].content_description.includes("CONTEÚDO GERADO DE TESTE"),
    );
    assert.ok(actions[0].instagram_caption.includes("LEGENDA GERADA DE TESTE"));
    await openDrawer();
    await activate(page.getByRole("tab", { name: "INSTAGRAM", exact: true }));
    await activate(page.getByRole("tab", { name: "Legenda", exact: true }));
    assert.ok(
      (
        await page
          .getByRole("textbox", { name: "Legenda do Instagram" })
          .inputValue()
      ).includes("LEGENDA GERADA DE TESTE"),
    );
    assert.equal(actions[0].description, "<p>INSUMO ORIGINAL — manter</p>");
    const caption = page.getByRole("textbox", { name: "Legenda do Instagram" });
    const keepCaption = await caption.inputValue();
    const generation = page.getByRole("button", {
      name: "Gerar legenda",
      exact: true,
    });
    for (const [status, message] of [
      [
        400,
        "A solicitação de IA contém campos inválidos ou grandes demais. Revise o título, as descrições e a estratégia.",
      ],
      [401, "Sua sessão expirou. Entre novamente para usar a IA."],
      [403, "Seu acesso à IA está desativado. Fale com o administrador."],
      [
        413,
        "A solicitação de IA excede 64 KB. Reduza as descrições e o contexto do parceiro.",
      ],
      [
        429,
        "Seu limite diário de IA foi atingido. Aguarde a renovação às 00h UTC.",
      ],
      [
        502,
        "A IA não retornou uma resposta válida. Tente novamente; seu texto foi mantido.",
      ],
      [
        503,
        "O serviço de IA está temporariamente indisponível. Tente novamente mais tarde; seu texto foi mantido.",
      ],
      [
        "invalid",
        "A IA não retornou uma resposta válida. Tente novamente; seu texto foi mantido.",
      ],
      [
        "abort",
        "Não foi possível conectar à IA. Verifique sua conexão e tente novamente; seu texto foi mantido.",
      ],
    ]) {
      aiMode = status;
      const beforeWrites = writes.length;
      const start = aiRequests.length;
      await activate(generation);
      await page.getByText(message, { exact: true }).first().waitFor();
      await generation.and(page.locator(":enabled")).waitFor();
      assert.equal(await generation.isEnabled(), true);
      assert.equal(await caption.inputValue(), keepCaption);
      assert.equal(writes.length, beforeWrites);
      assert.equal(aiRequests.length, start + 1);
    }
    aiMode = "success";
    await activate(generation);
    await page.waitForFunction(
      () =>
        !document.querySelector('textarea[aria-label="Legenda do Instagram"]')
          ?.disabled,
    );
    assert.equal(await caption.inputValue(), keepCaption);
    await activate(page.getByRole("tab", { name: "ESSENCIAL", exact: true }));
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.fill("a".repeat(10001));
    const beforeAI = aiRequests.length;
    await activate(
      page.getByRole("button", { name: "RECRIAR ESTRATÉGIAS", exact: true }),
    );
    await page
      .getByText(
        "A solicitação de IA contém campos inválidos ou grandes demais. Revise o título, as descrições e a estratégia.",
        { exact: true },
      )
      .first()
      .waitFor();
    assert.equal(
      aiRequests.length,
      beforeAI,
      "Invalid input must not reach the API",
    );
    await page
      .getByRole("button", { name: "RECRIAR ESTRATÉGIAS", exact: true })
      .and(page.locator(":enabled"))
      .waitFor();
    assert.equal((await editor.innerText()).trim().length, 10001);
    await editor.fill("INSUMO ORIGINAL — manter");
    await activate(page.getByRole("button", { name: "Fechar", exact: true }));
    await page
      .getByRole("button", { name: "Fechar", exact: true })
      .waitFor({ state: "hidden" });
    await openDrawer();
    await activate(page.getByRole("tab", { name: "INSTAGRAM", exact: true }));
    await activate(page.getByRole("tab", { name: "Legenda", exact: true }));
    assert.equal(await caption.inputValue(), keepCaption);
    assert.equal(actions[0].description, "<p>INSUMO ORIGINAL — manter</p>");
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Drawer must not overflow viewport",
    );
    assert.deepEqual(errors, []);
    console.log(
      `PASS ${width}px: strategy→use→content→caption→save/reopen; double clicks; close guard; HTTP400/401/403/413/429/502/503; invalid200; broken connection/recovery; long input rejected locally; text preserved. Controlled HTTP; local real API405/401. No real database/OpenAI writes.`,
    );
  } catch (error) {
    await browser
      .contexts()[0]
      ?.pages()[0]
      ?.screenshot({ path: "/tmp/uzzina-ai-failure.png", fullPage: true });
    console.error(
      (
        await browser.contexts()[0]?.pages()[0]?.locator("body").innerText()
      )?.slice(-2200),
    );
    throw error;
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
