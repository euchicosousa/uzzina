import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash } from "lucide-react";
import { UAvatar } from "~/components/uzzina/UAvatar";
import type { AugmentedComment } from "~/models/action_comments.server";
import { CommentInput } from "./CommentInput";

interface Person {
  user_id: string;
  name: string;
  image: string | null;
}

interface CommentItemProps {
  comment: AugmentedComment;
  isOwn: boolean;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  mentionablePeople?: Person[];
}

function htmlToPlainText(html: string) {
  if (typeof document === "undefined") return html;
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
}

export function CommentItem({
  comment,
  isOwn,
  onUpdate,
  onDelete,
  mentionablePeople = [],
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleSave = (content: string) => {
    if (!content.trim()) return;
    onUpdate(content);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setEditing(false);
  };

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      <div className="mt-1 shrink-0">
        <UAvatar
          fallback={comment.author_name || "?"}
          image={comment.author_image}
          size="md"
        />
      </div>
      <div
        className={`group relative flex max-w-[85%] flex-col rounded-lg px-4 py-2 ring ring-black/5 md:max-w-[75%] ${
          isOwn ? "bg-primary text-primary-foreground" : "bg-card"
        }`}
      >
        {editing ? (
          <div className="mt-2 w-full min-w-[280px] text-foreground">
            <CommentInput
              value={editContent}
              onChange={setEditContent}
              onSend={handleSave}
              onCancel={handleCancel}
              submitLabel="Salvar"
              mentionablePeople={mentionablePeople}
            />
          </div>
        ) : (
          <>
            <div
              // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is generated safely by Tiptap editor
              dangerouslySetInnerHTML={{ __html: comment.content }}
              className="comment-content text-sm"
            />
            {isOwn && (
              <div className="absolute right-0 bottom-0 flex min-w-24 items-center justify-end gap-1 rounded-br-lg bg-linear-to-l from-primary to-primary/0 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => {
                    setEditContent(htmlToPlainText(comment.content));
                    setEditing(true);
                  }}
                  className="rounded p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  onClick={onDelete}
                  className="rounded p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <Trash className="size-3" />
                </button>
              </div>
            )}
          </>
        )}
        <div className={`text-right text-[10px] tracking-widest opacity-70`}>
          {comment.created_at
            ? format(parseISO(comment.created_at), "d MMM 'às' HH:mm", {
                locale: ptBR,
              })
            : ""}
        </div>
      </div>
    </div>
  );
}
