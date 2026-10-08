// Actual UI; controlled HTTP. No database or external media writes.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  });
  try {
    const base = process.env.PORTAL_TEST_URL || "http://127.0.0.1:5176";
    const context = await browser.newContext({
      viewport: {
        width: Number(process.env.PORTAL_TEST_WIDTH || 390),
        height: 844,
      },
    });
    const page = await context.newPage();
    const errors = [];
    const writes = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (dialog) => dialog.accept());
    const client = {
      id: "test-client",
      name: "Cliente teste",
      email: "test@example.com",
      image: null,
      partners: ["smartmed"],
      active: true,
    };
    const action = {
      id: "action-a",
      title: "Ação de teste",
      date: "2026-10-06T12:00:00Z",
      category: "design",
      phase: "done",
      description: null,
      content_description: null,
      instagram_caption: "Legenda",
      content_files: [],
      work_files: ["https://media.example/file.pdf"],
      color: "#112233",
      updated_at: "2026-10-06",
      partners: ["smartmed"],
    };
    let comments = [
      {
        id: "own",
        action_id: action.id,
        author_id: client.id,
        author_name: client.name,
        content: "Mensagem inicial",
        created_at: "2026-10-06T12:00:00Z",
        is_user: false,
        is_internal: false,
        mentions: [],
        author_image: null,
      },
    ];
    let failComments = true;
    let failCreate = true;
    let failEdit = true;
    let failDelete = true;
    let failFiles = true;
    await page.route("**/*", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.origin !== base) return route.abort();
      if (url.pathname === "/api/dash-auth")
        return route.fulfill({ json: { client } });
      if (url.pathname === "/api/dash-data")
        return route.fulfill({
          json:
            url.searchParams.get("op") === "partners"
              ? {
                  partners: [
                    {
                      slug: "smartmed",
                      title: "Smartmed",
                      short: "SM",
                      image: null,
                      colors: ["#112233", "#ffffff"],
                    },
                  ],
                }
              : { action },
        });
      if (url.pathname === "/api/dash-action") {
        const op = url.searchParams.get("op");
        if (req.method() === "GET")
          return route.fulfill(
            failComments
              ? { status: 503, json: { error: "Falha" } }
              : { json: { comments } },
          );
        const body = req.postDataJSON();
        writes.push({ method: req.method(), op, body });
        if (op === "work-files") {
          if (failFiles)
            return route.fulfill({ status: 503, json: { error: "Falha" } });
          action.work_files = body.work_files;
          return route.fulfill({
            json: {
              actionId: action.id,
              work_files: action.work_files,
              count: action.work_files.length,
            },
          });
        }
        if (req.method() === "POST") {
          if (failCreate)
            return route.fulfill({ status: 503, json: { error: "Falha" } });
          const comment = { ...comments[0], id: "new", content: body.content };
          comments.push(comment);
          return route.fulfill({ status: 201, json: { comment } });
        }
        if (req.method() === "PATCH") {
          if (failEdit)
            return route.fulfill({ status: 503, json: { error: "Falha" } });
          const comment = comments.find((c) => c.id === body.commentId);
          comment.content = body.content;
          return route.fulfill({ json: { comment } });
        }
        if (failDelete)
          return route.fulfill({ status: 503, json: { error: "Falha" } });
        comments = comments.filter((c) => c.id !== body.commentId);
        return route.fulfill({ json: { deletedId: body.commentId } });
      }
      return route.continue();
    });
    await page.goto(`${base}/dash/action/action-a`);
    await page
      .getByText("Não foi possível carregar as observações.", { exact: true })
      .waitFor();
    failComments = false;
    await page
      .getByRole("button", { name: "Tentar novamente", exact: true })
      .click();
    await page.getByText("Mensagem inicial", { exact: true }).waitFor();
    const input = page.getByPlaceholder("Escreva uma observação...");
    await input.fill("Novo texto");
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Seu texto foi mantido" })
      .waitFor();
    assert.equal(await input.inputValue(), "Novo texto");
    failCreate = false;
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    await page
      .locator(".comment-content")
      .filter({ hasText: "Novo texto" })
      .waitFor();
    assert.equal(await input.inputValue(), "");
    const initial = page
      .locator(".group")
      .filter({ has: page.getByText("Mensagem inicial", { exact: true }) })
      .last();
    await initial.hover();
    await initial.locator("button").first().click();
    const editor = page.getByPlaceholder("Escreva uma observação...").first();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Editing must not overflow the viewport",
    );
    await editor.fill("Edição preservada");
    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Não foi possível salvar a alteração." })
      .waitFor();
    assert.equal(
      await editor.inputValue(),
      "Edição preservada",
      "Failed edit must keep its draft",
    );
    failEdit = false;
    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    await page.getByText("Edição preservada", { exact: true }).waitFor();
    const edited = page
      .locator(".group")
      .filter({ has: page.getByText("Edição preservada", { exact: true }) })
      .last();
    await edited.hover();
    await edited.locator("button").last().click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Não foi possível excluir a observação." })
      .waitFor();
    assert.equal(
      await page.getByText("Edição preservada", { exact: true }).count(),
      1,
    );
    failDelete = false;
    await edited.locator("button").last().click();
    await page
      .getByText("Edição preservada", { exact: true })
      .waitFor({ state: "hidden" });
    const file = page.locator('a[href="https://media.example/file.pdf"]');
    await file.hover();
    await page.getByRole("button", { name: "Remover anexo" }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Não foi possível salvar os anexos." })
      .waitFor();
    assert.equal(
      await file.count(),
      1,
      "Failed write must preserve confirmed attachment",
    );
    failFiles = false;
    await file.hover();
    await page.getByRole("button", { name: "Remover anexo" }).click();
    await file.waitFor({ state: "hidden" });
    for (const write of writes) {
      assert.ok(!Object.hasOwn(write.body, "author_id"));
      assert.ok(!Object.hasOwn(write.body, "is_internal"));
      assert.equal(write.body.actionId, action.id);
    }
    assert.deepEqual(errors, []);
    console.log(
      `PASS ${process.env.PORTAL_TEST_WIDTH || 390}px: comments recovery, create/edit draft preservation, confirmed deletion and attachments, server-only authorship.`,
    );
    await context.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
