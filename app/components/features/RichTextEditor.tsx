import { Highlight } from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import {
  EditorContent,
  EditorContext,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import { BubbleMenu as BubbleMenuComponent } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "cnfast";
import {
  Bold,
  ChevronDown,
  ChevronRight,
  Columns,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Rows,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Toolbar as AriaToolbar } from "react-aria-components";
import { PrismButton, PrismSeparator, PrismToggle } from "~/components/prism";

/** Plain command button (no pressed state) using the standard Prism icon button. */
function ToolbarCommandButton({
  icon: Icon,
  label,
  onPress,
  isDisabled,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  isDisabled?: boolean;
  className?: string;
}) {
  return (
    <PrismButton
      aria-label={label}
      className={className}
      isDisabled={isDisabled}
      onPress={onPress}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <span className="contents" title={label}>
        <Icon />
      </span>
    </PrismButton>
  );
}

function EditorToolbar({
  children,
  className,
  label,
  shortcut = "Alt+Shift+F10",
}: {
  children: ReactNode;
  className?: string;
  label: string;
  shortcut?: string;
}) {
  return (
    <AriaToolbar
      aria-label={label}
      aria-keyshortcuts={shortcut}
      className={className}
    >
      {children}
    </AriaToolbar>
  );
}
interface TiptapToolbarProps {
  editor: Editor | null;
  isRounded?: boolean;
}
interface ToolbarButtonDef {
  icon: LucideIcon;
  label: string;
  action: () => void;
  selector: (editor: Editor) => boolean;
  isToggle?: boolean;
}
function ToolbarButton({
  icon: Icon,
  label,
  action,
  editor,
  selector,
  isToggle = true,
}: ToolbarButtonDef & {
  editor: Editor;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      active: selector(e),
      editable: e.isEditable,
    }),
  });
  if (!isToggle) {
    return (
      <ToolbarCommandButton
        icon={Icon}
        isDisabled={!state.editable}
        label={label}
        onPress={action}
      />
    );
  }
  return (
    <PrismToggle
      aria-label={label}
      isDisabled={!state.editable}
      isSelected={state.active}
      onChange={() => action()}
      size="icon-sm"
      variant="ghost"
    >
      <span className="contents" title={label}>
        <Icon className="size-4" />
      </span>
    </PrismToggle>
  );
}
function TiptapToolbar({ editor, isRounded }: TiptapToolbarProps) {
  const history = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            undo: e.isEditable && e.can().undo(),
            redo: e.isEditable && e.can().redo(),
          }
        : null,
  });
  if (!editor) return null;
  const buttons: ToolbarButtonDef[] = [
    {
      icon: Heading1,
      label: "Título 1",
      action: () =>
        editor
          .chain()
          .focus()
          .toggleHeading({
            level: 1,
          })
          .run(),
      selector: (e) =>
        e.isActive("heading", {
          level: 1,
        }),
    },
    {
      icon: Heading2,
      label: "Título 2",
      action: () =>
        editor
          .chain()
          .focus()
          .toggleHeading({
            level: 2,
          })
          .run(),
      selector: (e) =>
        e.isActive("heading", {
          level: 2,
        }),
    },
    {
      icon: Heading3,
      label: "Título 3",
      action: () =>
        editor
          .chain()
          .focus()
          .toggleHeading({
            level: 3,
          })
          .run(),
      selector: (e) =>
        e.isActive("heading", {
          level: 3,
        }),
    },
    {
      icon: Bold,
      label: "Negrito",
      action: () => editor.chain().focus().toggleBold().run(),
      selector: (e) => e.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Itálico",
      action: () => editor.chain().focus().toggleItalic().run(),
      selector: (e) => e.isActive("italic"),
    },
    {
      icon: Strikethrough,
      label: "Tachado",
      action: () => editor.chain().focus().toggleStrike().run(),
      selector: (e) => e.isActive("strike"),
    },
    {
      icon: List,
      label: "Lista com Marcadores",
      action: () => editor.chain().focus().toggleBulletList().run(),
      selector: (e) => e.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Lista Numerada",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      selector: (e) => e.isActive("orderedList"),
    },
    {
      icon: Quote,
      label: "Citação",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      selector: (e) => e.isActive("blockquote"),
    },
    {
      icon: LinkIcon,
      label: "Link",
      action: () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Digite o endereço do Link:", previousUrl);
        if (url === null) return;
        if (url === "") {
          editor.chain().focus().unsetLink().run();
          return;
        }
        editor
          .chain()
          .focus()
          .setLink({
            href: url,
          })
          .run();
      },
      selector: (e) => e.isActive("link"),
    },
    {
      icon: Minus,
      isToggle: false,
      label: "Linha Divisória",
      action: () => editor.chain().focus().setHorizontalRule().run(),
      selector: () => false,
    },
    {
      icon: TableIcon,
      isToggle: false,
      label: "Tabela",
      action: () => {
        const colsStr = window.prompt("Quantas Colunas deseja na tabela?", "3");
        if (colsStr === null) return;
        const rowsStr = window.prompt("Quantas Linhas deseja na tabela?", "3");
        if (rowsStr === null) return;
        const cols = Number.parseInt(colsStr, 10) || 3;
        const rows = Number.parseInt(rowsStr, 10) || 3;
        editor
          .chain()
          .focus()
          .insertTable({
            rows,
            cols,
            withHeaderRow: true,
          })
          .run();
      },
      selector: (e) => e.isActive("table"),
    },
    {
      icon: RemoveFormatting,
      isToggle: false,
      label: "Remover Formatação",
      action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
      selector: () => false,
    },
  ];
  return (
    <EditorToolbar
      label="Formatação do texto"
      className={cn(
        "flex max-w-full shrink-0 scrollbar-none flex-nowrap items-center gap-1 overflow-x-auto overscroll-x-contain border-b bg-popover p-1.5 *:shrink-0 [&::-webkit-scrollbar]:hidden",
        isRounded && "rounded-t-2xl squircle",
      )}
    >
      {buttons.map((btn) => (
        <ToolbarButton key={btn.label} {...btn} editor={editor} />
      ))}

      <PrismSeparator className="mx-1 h-4 self-center" orientation="vertical" />

      <ToolbarCommandButton
        icon={Undo2}
        isDisabled={!history?.undo}
        label="Desfazer"
        onPress={() => editor.chain().focus().undo().run()}
      />

      <ToolbarCommandButton
        icon={Redo2}
        isDisabled={!history?.redo}
        label="Refazer"
        onPress={() => editor.chain().focus().redo().run()}
      />
    </EditorToolbar>
  );
}
export function RichTextEditor({
  id,
  "aria-labelledby": ariaLabelledBy,
  content,
  handleBlur,
  handleChange,
  className,
  tabIndex,
  disabled,
  placeholder,
  isRounded,
  editorRef,
}: {
  id?: string;
  "aria-labelledby"?: string;
  content: string;
  handleBlur?: (content: string) => void;
  handleChange?: (content: string) => void;
  className?: string;
  tabIndex?: number;
  disabled?: boolean;
  placeholder?: string;
  isRounded?: boolean;
  /** Lets the owner insert content programmatically (e.g. AI file reading). */
  editorRef?: { current: Editor | null };
}) {
  const editorRoot = useRef<HTMLDivElement>(null);
  const [extensions] = useState(() => {
    const kit = StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      link: {
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      },
    });
    return [
      kit,
      Placeholder.configure({
        placeholder: placeholder || "Escreva algo...",
      }),
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight.configure({
        multicolor: false,
      }),
    ];
  });
  // An unchanged document reports the content it was given, so the editor's
  // serialization of stored HTML (e.g. "<hr />" as "<hr>", or the paragraph
  // the trailing-node plugin appends) is not mistaken for an edit.
  const initialContentRef = useRef(content);
  const baselineHtmlRef = useRef<string | null>(null);
  const lastHtmlRef = useRef<string | null>(null);
  const reportedHtml = (html: string) =>
    html === baselineHtmlRef.current ? initialContentRef.current : html;
  const editor = useEditor({
    extensions,
    content,
    // initial content
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        tabindex: tabIndex?.toString() || "0",
        ...(id ? { id } : {}),
        ...(ariaLabelledBy
          ? {
              role: "textbox",
              "aria-multiline": "true",
              "aria-labelledby": ariaLabelledBy,
            }
          : {}),
      },
    },
    onCreate: (props) => {
      baselineHtmlRef.current = props.editor.getHTML();
      lastHtmlRef.current = baselineHtmlRef.current;
    },
    onUpdate: (props) => {
      const html = props.editor.getHTML();
      const wasUnchanged = lastHtmlRef.current === baselineHtmlRef.current;
      lastHtmlRef.current = html;
      // Only plugins changed the document (the root transaction made no step).
      if (wasUnchanged && !props.transaction.docChanged) {
        baselineHtmlRef.current = html;
        return;
      }
      handleChange?.(reportedHtml(html));
    },
    onBlur: (props) => {
      handleBlur?.(reportedHtml(props.editor.getHTML()));
    },
  });

  if (editorRef) editorRef.current = editor;

  // Update editable state when disabled prop changes
  if (editor && editor.isEditable !== !disabled) {
    editor.setEditable(!disabled);
  }
  const providedValue = useMemo(
    () => ({
      editor,
    }),
    [editor],
  );
  const isSelectionInTable = useEditorState({
    editor,
    selector: ({ editor: e }) => e?.isActive("table") ?? false,
  });
  const bubbleButtons = useMemo<ToolbarButtonDef[]>(() => {
    if (!editor) return [];
    return [
      {
        icon: Heading1,
        label: "Título 1",
        action: () =>
          editor
            .chain()
            .focus()
            .toggleHeading({
              level: 1,
            })
            .run(),
        selector: (e) =>
          e.isActive("heading", {
            level: 1,
          }),
      },
      {
        icon: Heading2,
        label: "Título 2",
        action: () =>
          editor
            .chain()
            .focus()
            .toggleHeading({
              level: 2,
            })
            .run(),
        selector: (e) =>
          e.isActive("heading", {
            level: 2,
          }),
      },
      {
        icon: Heading3,
        label: "Título 3",
        action: () =>
          editor
            .chain()
            .focus()
            .toggleHeading({
              level: 3,
            })
            .run(),
        selector: (e) =>
          e.isActive("heading", {
            level: 3,
          }),
      },
      {
        icon: Bold,
        label: "Negrito",
        action: () => editor.chain().focus().toggleBold().run(),
        selector: (e) => e.isActive("bold"),
      },
      {
        icon: Italic,
        label: "Itálico",
        action: () => editor.chain().focus().toggleItalic().run(),
        selector: (e) => e.isActive("italic"),
      },
      {
        icon: Strikethrough,
        label: "Tachado",
        action: () => editor.chain().focus().toggleStrike().run(),
        selector: (e) => e.isActive("strike"),
      },
      {
        icon: Highlighter,
        label: "Marca-Texto",
        action: () => editor.chain().focus().toggleHighlight().run(),
        selector: (e) => e.isActive("highlight"),
      },
      {
        icon: RemoveFormatting,
        isToggle: false,
        label: "Remover Formatação",
        action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
        selector: () => false,
      },
    ];
  }, [editor]);
  const tableButtons = useMemo<Omit<ToolbarButtonDef, "selector">[]>(() => {
    if (!editor) return [];
    return [
      {
        icon: ChevronDown,
        label: "Inserir Linha Abaixo",
        action: () => editor.chain().focus().addRowAfter().run(),
      },
      {
        icon: ChevronRight,
        label: "Inserir Coluna à Direita",
        action: () => editor.chain().focus().addColumnAfter().run(),
      },
      {
        icon: Rows,
        label: "Excluir Linha",
        action: () => editor.chain().focus().deleteRow().run(),
      },
      {
        icon: Columns,
        label: "Excluir Coluna",
        action: () => editor.chain().focus().deleteColumn().run(),
      },
      {
        icon: Trash2,
        label: "Excluir Tabela",
        action: () => {
          if (window.confirm("Deseja realmente excluir a tabela inteira?")) {
            editor.chain().focus().deleteTable().run();
          }
        },
      },
    ];
  }, [editor]);
  return (
    <EditorContext.Provider value={providedValue}>
      <div
        className={cn(
          "flex h-full w-full flex-col transition-all duration-200",
          className,
        )}
        onFocusCapture={(event) => {
          const control = event.target;
          const toolbar = control.closest<HTMLElement>('[role="toolbar"]');
          if (!toolbar || toolbar.scrollWidth <= toolbar.clientWidth) return;

          // Reveal the focused command without scrolling the writing area.
          const frame = toolbar.getBoundingClientRect();
          const button = control.getBoundingClientRect();
          if (button.left < frame.left) {
            toolbar.scrollLeft -= frame.left - button.left;
          } else if (button.right > frame.right) {
            toolbar.scrollLeft += button.right - frame.right;
          }
        }}
        onKeyDownCapture={(event) => {
          const root = editorRoot.current;
          const target = event.target;
          if (
            !editor ||
            !root ||
            !(target instanceof Element) ||
            !root.contains(target)
          )
            return;
          if (
            target.closest('[role="toolbar"]') &&
            event.key === "Tab" &&
            !event.shiftKey &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey
          ) {
            event.preventDefault();
            event.stopPropagation();
            editor.view.dom.focus();
            return;
          }
          if (
            (event.key !== "F10" && event.key !== "F9") ||
            !event.altKey ||
            !event.shiftKey ||
            event.ctrlKey ||
            event.metaKey
          )
            return;
          const toolbar = root.querySelector<HTMLElement>(
            event.key === "F9"
              ? '[data-editor-context-toolbar] [role="toolbar"]'
              : '[role="toolbar"]',
          );
          if (!toolbar) return;
          const style = getComputedStyle(toolbar);
          if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            toolbar.closest('[aria-hidden="true"]')
          )
            return;
          const button = toolbar.querySelector<HTMLButtonElement>(
            "button:not(:disabled)",
          );
          if (button) {
            event.preventDefault();
            event.stopPropagation();
            button.focus();
          }
        }}
        ref={editorRoot}
        aria-keyshortcuts="Alt+Shift+F10 Alt+Shift+F9"
      >
        <TiptapToolbar editor={editor} isRounded={isRounded} />
        {editor && (
          <BubbleMenuComponent
            className="flex items-center gap-0.5 rounded-2xl border border-foreground/5 bg-popover/95 p-1 shadow-lg backdrop-blur-md squircle dark:border-foreground/10"
            data-editor-context-toolbar
            editor={editor}
            tabIndex={-1}
          >
            <EditorToolbar
              label={
                isSelectionInTable
                  ? "Formatação da tabela"
                  : "Formatação da seleção"
              }
              className="flex items-center gap-0.5"
              shortcut="Alt+Shift+F9"
            >
              {isSelectionInTable
                ? tableButtons.map((btn) => (
                    <ToolbarCommandButton
                      key={`table-control-${btn.label}`}
                      icon={btn.icon}
                      isDisabled={!editor.isEditable}
                      label={btn.label}
                      onPress={btn.action}
                    />
                  ))
                : bubbleButtons.map((btn) => (
                    <ToolbarButton
                      key={`bubble-${btn.label}`}
                      {...btn}
                      editor={editor}
                    />
                  ))}
            </EditorToolbar>
          </BubbleMenuComponent>
        )}
        <EditorContent className="min-h-30 flex-1" editor={editor} />
      </div>
    </EditorContext.Provider>
  );
}
export { RichTextEditor as Tiptap };
