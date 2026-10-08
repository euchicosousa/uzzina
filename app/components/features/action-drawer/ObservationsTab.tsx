import { getQuerySessionGeneration } from "~/lib/query-client";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import { CommentInput } from "../ActionComments/CommentInput";
import { CommentList } from "../ActionComments/CommentList";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  getAllCommentsByAction,
  createComment,
  updateComment,
  deleteComment,
} from "~/models/action_comments";
import { createNotificationsForMentions } from "~/models/notifications";
import { getActionTitle } from "~/models/actions";
import { getPersonName } from "~/models/people";
import { toast } from "sonner";

const DEFAULT_PARTNER_USERS_IDS: string[] = [];
import { useAppContext } from "~/contexts/AppContext";

export function ObservationsTab({
  actionId,
  partnerUsersIds = DEFAULT_PARTNER_USERS_IDS,
}: {
  actionId: string;
  partnerUsersIds?: string[];
}) {
  const { person } = useAppContext();
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const generation = useRef(getQuerySessionGeneration(queryClient)).current;
  const isCurrentSession = () =>
    generation === getQuerySessionGeneration(queryClient);

  // Busca os comentários no client usando TanStack Query
  const { data: comments = [] } = useQuery({
    queryKey: QUERY_KEYS.comments.all(actionId, person.user_id),
    queryFn: () => getAllCommentsByAction(supabase, actionId),
    enabled: !!actionId,
  });

  const { data: allPeople = [] } = useQuery({
    queryKey: QUERY_KEYS.people(person.user_id),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });

  // Filtra as pessoas que possuem acesso ao partner desta ação
  const mentionablePeople = useMemo(() => {
    return allPeople.filter((p) => partnerUsersIds.includes(p.user_id));
  }, [allPeople, partnerUsersIds]);

  // Mutations
  const createCommentMutation = useMutation({
    mutationFn: async ({
      content,
      mentions,
      is_internal = true,
    }: {
      content: string;
      mentions: string[];
      is_internal?: boolean;
    }) => {
      const [personName, title] = await Promise.all([
        getPersonName(supabase, person.user_id),
        getActionTitle(supabase, actionId),
      ]);

      if (!isCurrentSession())
        throw new Error("A sessão mudou. Entre novamente.");
      const authorName = personName || "Agência";
      const actionTitle = title || "Ação";

      const insertedComment = await createComment(supabase, {
        action_id: actionId,
        author_id: person.user_id,
        author_name: authorName,
        content,
        is_internal,
        is_user: true,
        mentions,
      });

      if (mentions.length > 0 && isCurrentSession()) {
        const plainText = content.replace(/<[^>]*>/g, "");
        const commentExcerpt =
          plainText.length > 100
            ? `${plainText.substring(0, 100)}...`
            : plainText;
        await createNotificationsForMentions(supabase, {
          commentId: insertedComment.id,
          actionId,
          actionTitle,
          authorName,
          commentExcerpt,
          authorId: person.user_id,
          mentionedIds: mentions,
        });
      }
      return insertedComment;
    },
    onSuccess: (_, variables) => {
      if (!isCurrentSession()) return;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.comments.all(actionId, person.user_id),
      });
      if (!variables.is_internal) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.comments.public(actionId, person.user_id),
        });
      }
    },
    onError: (error) => {
      if (!isCurrentSession()) return;
      console.error("Erro ao criar comentário:", error);
      toast.error("Não foi possível salvar o comentário.");
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => {
      await updateComment(supabase, commentId, content, person.user_id, true);
    },
    onSuccess: () => {
      if (!isCurrentSession()) return;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.comments.all(actionId, person.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.comments.public(actionId, person.user_id),
      });
    },
    onError: (error) => {
      if (!isCurrentSession()) return;
      console.error("Erro ao atualizar comentário:", error);
      toast.error("Não foi possível atualizar o comentário.");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await deleteComment(supabase, commentId, person.user_id, true);
    },
    onSuccess: () => {
      if (!isCurrentSession()) return;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.comments.all(actionId, person.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.comments.public(actionId, person.user_id),
      });
    },
    onError: (error) => {
      if (!isCurrentSession()) return;
      console.error("Erro ao excluir comentário:", error);
      toast.error("Não foi possível excluir o comentário.");
    },
  });

  const [newComment, setNewComment] = useState("");

  const handleCreate = async (
    content: string,
    mentions: string[],
    isInternal?: boolean,
  ) => {
    if (!content.trim()) return;
    await createCommentMutation.mutateAsync({
      content,
      mentions,
      is_internal: isInternal ?? true,
    });
    setNewComment("");
  };

  const isMutating =
    createCommentMutation.isPending ||
    updateCommentMutation.isPending ||
    deleteCommentMutation.isPending;

  return (
    <div className="flex h-full w-full max-w-full flex-col overflow-hidden bg-muted/30">
      <div className="flex-1 overflow-y-auto p-6">
        <CommentList
          comments={comments}
          currentUserId={person.user_id}
          emptyMessage="Nenhuma observação encontrada para esta ação."
          isUser={true}
          mentionablePeople={mentionablePeople}
          onDelete={(commentId) => {
            if (confirm("Tem certeza que deseja excluir esta observação?")) {
              deleteCommentMutation.mutate(commentId);
            }
          }}
          onUpdate={(commentId, content) => {
            updateCommentMutation.mutate({ commentId, content });
          }}
        />
      </div>

      <div className="border-t">
        <CommentInput
          allowAudienceToggle={true}
          initialIsInternal={true}
          isSubmitting={isMutating}
          mentionablePeople={mentionablePeople}
          onChange={setNewComment}
          onSend={handleCreate}
          value={newComment}
        />
      </div>
    </div>
  );
}
