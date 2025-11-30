import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { useMemo } from "react";
import { cn } from "~/lib/utils";

export const Tiptap = ({
  content,
  handleBlur,
  className,
}: {
  content: string;
  handleBlur: (content: string) => void;
  className?: string;
}) => {
  const editor = useEditor({
    extensions: [StarterKit], // define your extension array
    content, // initial content

    onBlur: (props) => {
      handleBlur(props.editor.getHTML());
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
};
