import type { AugmentedComment } from "~/models/action_comments.server";
import { CommentItem } from "./CommentItem";

interface Person {
  user_id: string;
  name: string;
  image: string | null;
}

interface CommentListProps {
  comments: AugmentedComment[];
  currentUserId: string;
  isUser: boolean; // if true, comparing against is_user true, else is_user false
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
  mentionablePeople?: Person[];
}

const DEFAULT_MENTIONABLE_PEOPLE: Person[] = [];

export function CommentList({
  comments,
  currentUserId,
  isUser,
  onUpdate,
  onDelete,
  emptyMessage = "Nenhuma observação encontrada.",
  mentionablePeople = DEFAULT_MENTIONABLE_PEOPLE,
}: CommentListProps) {
  return (
    <div className="flex flex-col space-y-4">
      {comments.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          {emptyMessage}
        </p>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isOwn={comment.author_id === currentUserId && comment.is_user === isUser}
            onUpdate={(content) => onUpdate(comment.id, content)}
            onDelete={() => onDelete(comment.id)}
            mentionablePeople={mentionablePeople}
          />
        ))
      )}
    </div>
  );
}
