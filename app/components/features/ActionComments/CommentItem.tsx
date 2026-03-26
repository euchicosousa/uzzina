import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash, X, Check } from "lucide-react";
import { UAvatar } from "~/components/uzzina/UAvatar";
import type { AugmentedComment } from "~/models/action_comments.server";

interface CommentItemProps {
  comment: AugmentedComment;
  isOwn: boolean;
  brandColor?: string;
  brandTextColor?: string;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

export function CommentItem({
  comment,
  isOwn,
  brandColor,
  brandTextColor,
  onUpdate,
  onDelete,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleSave = () => {
    if (!editContent.trim()) return;
    onUpdate(editContent);
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
          size="lg"
        />
      </div>
      <div
        className={`group relative flex-1 rounded-3xl p-4 shadow-sm ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-tr-xs shadow-black/5"
            : "bg-card rounded-tl-xs border shadow-black/5"
        }`}
        style={
          isOwn && brandColor
            ? { backgroundColor: brandColor, color: brandTextColor }
            : {}
        }
      >
        <div className="mb-1 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">
              {isOwn ? "Você" : comment.author_name}
            </span>
            {isOwn && !editing && (
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => setEditing(true)}
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
          </div>
          <span
            className={`text-xs tabular-nums opacity-70 ${
              isOwn ? "" : "text-muted-foreground"
            }`}
          >
            {comment.created_at
              ? format(parseISO(comment.created_at), "d MMM 'às' HH:mm", {
                  locale: ptBR,
                })
              : ""}
          </span>
        </div>

        {editing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full resize-none rounded-lg bg-black/5 p-2 text-sm focus:outline-none dark:bg-white/5"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="flex size-7 items-center justify-center rounded-full bg-black/10 transition-colors hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
              >
                <X className="size-3" />
              </button>
              <button
                onClick={handleSave}
                className="flex size-7 items-center justify-center rounded-full bg-black/10 transition-colors hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
              >
                <Check className="size-3" />
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
}
