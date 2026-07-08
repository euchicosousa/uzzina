import { useEditor, EditorContent, EditorContext, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useMemo } from "react";
import { cn } from "~/lib/utils";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  type LucideIcon,
} from "lucide-react";

interface TiptapToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonDef {
  icon: LucideIcon;
  label: string;
  action: () => void;
  selector: (editor: Editor) => boolean;
}

function ToolbarButton({
  icon: Icon,
  label,
  action,
  editor,
  selector,
}: ToolbarButtonDef & { editor: Editor }) {
  const isActive = useEditorState({
    editor,
    selector: ({ editor: e }) => selector(e),
  });

  return (
    <button
      type="button"
      className={cn(
        "flex size-8 items-center justify-center rounded-lg transition-all outline-none",
        isActive
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent",
      )}
      onClick={action}
      title={label}
    >
      <Icon className="size-4" />
    </button>
  );
}

function TiptapToolbar({ editor }: TiptapToolbarProps) {
  if (!editor) return null;

  const buttons: ToolbarButtonDef[] = [
    {
      icon: Heading1,
      label: "Título 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      selector: (e) => e.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      label: "Título 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      selector: (e) => e.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      label: "Título 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      selector: (e) => e.isActive("heading", { level: 3 }),
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
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-card/60 p-1.5 shrink-0">
      {buttons.map((btn) => (
        <ToolbarButton key={btn.label} {...btn} editor={editor} />
      ))}

      <div className="mx-1 h-4 w-px bg-border shrink-0" />

      <button
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all outline-none"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
        title="Desfazer"
        type="button"
      >
        <Undo2 className="size-4" />
      </button>

      <button
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all outline-none"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
        title="Refazer"
        type="button"
      >
        <Redo2 className="size-4" />
      </button>
    </div>
  );
}
export function Tiptap({
  content,
  handleBlur,
  handleChange,
  className,
  tabIndex,
  disabled,
  placeholder,
}: {
  content: string;
  handleBlur?: (content: string) => void;
  handleChange?: (content: string) => void;
  className?: string;
  tabIndex?: number;
  disabled?: boolean;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Ensure standard heading, paragraph, and bullet list support are active
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Escreva algo...",
      }),
    ],
    content,
    // initial content
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        tabindex: tabIndex?.toString() || "0",
      },
    },
    onUpdate: (props) => {
      handleChange?.(props.editor.getHTML());
    },
    onBlur: (props) => {
      handleBlur?.(props.editor.getHTML());
    },
  });

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
  return (
    <EditorContext.Provider value={providedValue}>
      <div
        className={cn(
          "flex flex-col h-full w-full bg-card/10 transition-all duration-200 focus-within:bg-secondary/50",
          className,
        )}
      >
        <TiptapToolbar editor={editor} />
        <EditorContent className="flex-1 min-h-[150px]" editor={editor} />
      </div>
    </EditorContext.Provider>
  );
}
