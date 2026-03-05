import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMemo } from "react";
import { cn } from "~/lib/utils";

export function Tiptap({
  content,
  handleBlur,
  handleChange,
  className,
  tabIndex,
}: {
  content: string;
  handleBlur?: (content: string) => void;
  handleChange?: (content: string) => void;
  className?: string;
  tabIndex?: number;
}) {
  const editor = useEditor({
    extensions: [StarterKit], // define your extension array
    content, // initial content
    immediatelyRender: false,
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
