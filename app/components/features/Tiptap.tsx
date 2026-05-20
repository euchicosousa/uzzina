import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useMemo } from "react";
import { cn } from "~/lib/utils";

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
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Escreva algo...",
      }),
    ],
    content, // initial content
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

  const providedValue = useMemo(() => ({ editor }), [editor]);

  return (
    <EditorContext.Provider value={providedValue}>
      <EditorContent
        editor={editor}
        className={cn(className, "overflow-hidden")}
      />
      {/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
    </EditorContext.Provider>
  );
}
