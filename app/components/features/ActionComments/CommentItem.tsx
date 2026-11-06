import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash, LockIcon } from "lucide-react";
import { useState } from "react";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { PrismButton } from "~/components/prism";
import type { AugmentedComment } from "~/models/action_comments";
import { CommentInput } from "./CommentInput";

interface CommentItemProps {
  comment: AugmentedComment;
  isOwn: boolean;
  onUpdate:
    ((content: string) => void) | ((content: string) => Promise<unknown>);
  onDelete: () => void;
  mentionablePeople?: Person[];
}
const DEFAULT_MENTIONABLE_PEOPLE: Person[] = [];

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
  mentionablePeople = DEFAULT_MENTIONABLE_PEOPLE,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [overrideContent, setOverrideContent] = useState<string | null>(null);
  const editContent =
    overrideContent !== null ? overrideContent : comment.content;

  const handleSave = async (content: string) => {
    if (!content.trim() || saving) return;
    setSaving(true);
    setSaveFailed(false);
    try {
      await onUpdate(content);
      setEditing(false);
      setOverrideContent(null);
    } catch {
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (saving) return;
    setSaveFailed(false);
    setOverrideContent(null);
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
        className={`group relative flex max-w-[85%] flex-col rounded-2xl border border-foreground/5 px-4 py-2 squircle md:max-w-[75%] dark:border-foreground/10 ${
          isOwn ? "bg-primary text-primary-foreground" : "bg-card"
        }`}
      >
        {editing ? (
          <div className="mt-2 w-full min-w-0 text-foreground">
            <CommentInput
              value={editContent}
              onChange={setOverrideContent}
              onSend={handleSave}
              isSubmitting={saving}
              onCancel={handleCancel}
              submitLabel="Salvar"
              mentionablePeople={mentionablePeople}
            />
            {saveFailed && (
              <p role="alert" className="mt-2 text-sm">
                Não foi possível salvar. Seu texto foi mantido.
              </p>
            )}
          </div>
        ) : (
          <>
            {comment.is_internal && (
              <div className="mb-1 flex items-center gap-1 text-[10px] font-medium opacity-75">
                <LockIcon className="size-2.5" />
                <span>Nota interna</span>
              </div>
            )}
            <div className="comment-content text-sm whitespace-pre-line">
              {comment.content}
            </div>

            {isOwn && (
              <div className="relative flex min-w-24 items-center justify-end gap-1 p-1 opacity-100 transition-opacity focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                <PrismButton
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Editar observação"
                  onClick={() => {
                    setOverrideContent(htmlToPlainText(comment.content));
                    setEditing(true);
                  }}
                >
                  <Pencil className="size-3" />
                </PrismButton>
                <PrismButton
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Excluir observação"
                  onClick={onDelete}
                >
                  <Trash className="size-3" />
                </PrismButton>
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
