import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
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
} from "lucide-react";
interface TiptapToolbarProps {
  editor: any;
}
function TiptapToolbar({ editor }: TiptapToolbarProps) {
  if (!editor) return null;
  const buttons = [
    {
      icon: Bold,
      label: "Negrito",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Itálico",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: Strikethrough,
      label: "Tachado",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
    },
    {
      icon: List,
      label: "Lista com Marcadores",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Lista Numerada",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      label: "Citação",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
  ];
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-card/60 p-1.5 shrink-0">
      {buttons.map((btn) => {
        const Icon = btn.icon;
        return (
          <button
            key={btn.label}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg transition-all outline-none",
              btn.isActive
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent",
            )}
            onClick={btn.action}
            title={btn.label}
            type="button"
          >
            <Icon className="size-4" />
          </button>
        );
      })}

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
        title="Redo"
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
          "flex flex-col h-full w-full bg-card/10 transition-all duration-200",
          className,
        )}
      >
        <TiptapToolbar editor={editor} />
        <div className="flex-1 overflow-y-auto p-4 text-sm min-h-[150px]">
          <EditorContent
            className="outline-none h-full min-h-[120px]"
            editor={editor}
          />
        </div>
      </div>
    </EditorContext.Provider>
  );
}
