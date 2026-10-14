import { afterEach, expect, it } from "bun:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichTextEditor } from "../app/components/features/RichTextEditor";

Object.assign(globalThis, { KeyboardEvent: window.KeyboardEvent });
Object.assign(window.Range.prototype, {
  getClientRects: () => [],
  getBoundingClientRect: () => new window.DOMRect(),
});
afterEach(cleanup);

async function mountEditor(disabled = false) {
  const mounted = render(
    <RichTextEditor content="<p>Hello</p>" disabled={disabled} />,
  );
  await screen.findByRole("toolbar", { name: "Formatação do texto" });
  const editor = mounted.container.querySelector<HTMLElement>(".tiptap");
  if (!editor) throw new Error("Editor did not mount");
  const toolbar = screen.getByRole("toolbar", { name: "Formatação do texto" });
  return { ...mounted, editor, toolbar, user: userEvent.setup() };
}

it("shortcut focuses formatting and arrows move without editing text", async () => {
  const { editor, toolbar, user } = await mountEditor();
  act(() => editor.focus());
  const before = editor.innerHTML;
  await user.keyboard("{Alt>}{Shift>}{F10}{/Shift}{/Alt}");
  expect(toolbar.contains(document.activeElement)).toBe(true);
  await user.keyboard("{ArrowRight}");
  expect(
    document.activeElement ===
      within(toolbar).getByRole("button", { name: "Título 2" }),
  ).toBe(true);
  await user.keyboard("{ArrowLeft}");
  expect(
    document.activeElement ===
      within(toolbar).getByRole("button", { name: "Título 1" }),
  ).toBe(true);
  expect(editor.innerHTML).toBe(before);
});

it("Tab from any formatting command goes directly back to the editor", async () => {
  const { editor, toolbar, user } = await mountEditor();
  act(() => within(toolbar).getByRole("button", { name: "Itálico" }).focus());
  await user.tab();
  expect(document.activeElement === editor).toBe(true);
});

for (const key of ["{Enter}", " "]) {
  it(`${key} formats the selected text and returns focus to typing`, async () => {
    const { editor, toolbar, user } = await mountEditor();
    act(() => editor.focus());
    await user.keyboard("{Control>}a{/Control}");
    await user.keyboard("{Alt>}{Shift>}{F10}{/Shift}{/Alt}");
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    expect(
      document.activeElement ===
        within(toolbar).getByRole("button", { name: "Negrito" }),
    ).toBe(true);
    await user.keyboard(key);
    await waitFor(() => expect(document.activeElement === editor).toBe(true));
    expect(editor.querySelector("strong")?.textContent).toBe("Hello");
    expect(
      within(toolbar)
        .getByRole("button", { name: "Negrito" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
}

it("history commands react to edits and keep their keyboard behavior", async () => {
  const { editor, toolbar, user } = await mountEditor();
  const undo = within(toolbar).getByRole("button", { name: "Desfazer" });
  const redo = within(toolbar).getByRole("button", { name: "Refazer" });
  expect(undo.hasAttribute("disabled")).toBe(true);
  expect(redo.hasAttribute("disabled")).toBe(true);
  act(() => editor.focus());
  await user.keyboard("{Alt>}{Shift>}{F10}{/Shift}{/Alt}");
  await user.keyboard("{Enter}");
  await waitFor(() => expect(editor.querySelector("h1")).not.toBeNull());
  await waitFor(() => expect(document.activeElement === editor).toBe(true));
  expect(undo.hasAttribute("disabled")).toBe(false);
  await user.keyboard("{Alt>}{Shift>}{F10}{/Shift}{/Alt}");
  for (let step = 0; step < 15 && document.activeElement !== undo; step++) {
    await user.keyboard("{ArrowRight}");
  }
  expect(document.activeElement === undo).toBe(true);
  await user.keyboard("{Enter}");
  await waitFor(() => expect(editor.querySelector("h1")).toBeNull());
  await waitFor(() => expect(document.activeElement === editor).toBe(true));
  expect(redo.hasAttribute("disabled")).toBe(false);
  await user.keyboard("{Alt>}{Shift>}{F10}{/Shift}{/Alt}");
  for (let step = 0; step < 15 && document.activeElement !== redo; step++) {
    await user.keyboard("{ArrowRight}");
  }
  expect(document.activeElement === redo).toBe(true);
  await user.keyboard(" ");
  await waitFor(() => expect(editor.querySelector("h1")).not.toBeNull());
});

it("a disabled editor exposes no executable formatting commands", async () => {
  const { toolbar, user, editor } = await mountEditor(true);
  for (const button of within(toolbar).getAllByRole("button")) {
    expect(button.hasAttribute("disabled")).toBe(true);
  }
  const before = editor.innerHTML;
  await user.click(within(toolbar).getByRole("button", { name: "Negrito" }));
  expect(editor.innerHTML).toBe(before);
});

it("standalone editors have one toolbar stop before the text", async () => {
  const { editor, toolbar, user } = await mountEditor();
  await user.tab();
  expect(toolbar.contains(document.activeElement)).toBe(true);
  await user.tab();
  expect(document.activeElement === editor).toBe(true);
});

it("the contextual toolbar is reachable without losing the text selection", async () => {
  const { editor, user } = await mountEditor();
  act(() => editor.focus());
  await user.keyboard("{Control>}a{/Control}");
  const context = await screen.findByRole("toolbar", {
    name: "Formatação da seleção",
  });
  await user.keyboard("{Alt>}{Shift>}{F9}{/Shift}{/Alt}");
  expect(context.contains(document.activeElement)).toBe(true);
  await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{Enter}");
  await waitFor(() => expect(document.activeElement === editor).toBe(true));
  expect(editor.querySelector("strong")?.textContent).toBe("Hello");
});

it("table commands remain keyboard accessible in their contextual toolbar", async () => {
  const mounted = render(
    <RichTextEditor content="<table><tbody><tr><td><p>Cell</p></td></tr></tbody></table>" />,
  );
  await screen.findByRole("toolbar", { name: "Formatação do texto" });
  const editor = mounted.container.querySelector<HTMLElement>(".tiptap");
  const text = editor?.querySelector("td p")?.firstChild;
  if (!editor || !text) throw new Error("Missing table editor");
  act(() => {
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(text);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    fireEvent(document, new window.Event("selectionchange"));
  });
  const context = await screen.findByRole("toolbar", {
    name: "Formatação da tabela",
  });
  const user = userEvent.setup();
  await user.keyboard("{Alt>}{Shift>}{F9}{/Shift}{/Alt}");
  expect(
    document.activeElement ===
      within(context).getByRole("button", { name: "Inserir Linha Abaixo" }),
  ).toBe(true);
  await user.keyboard("{Enter}");
  await waitFor(() => expect(editor.querySelectorAll("tr").length).toBe(2));
  await waitFor(() => expect(document.activeElement === editor).toBe(true));
});
