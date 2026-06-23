import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import type { AugmentedComment } from "~/models/action_comments.server";
import type { AppLoaderData } from "~/routes/app";
import { CommentInput } from "../ActionComments/CommentInput";
import { CommentList } from "../ActionComments/CommentList";
const DEFAULT_PARTNER_USERS_IDS: string[] = [];
export function ObservationsTab({
  actionId,
  partnerUsersIds = DEFAULT_PARTNER_USERS_IDS,
}: {
  actionId: string;
  partnerUsersIds?: string[];
}) {
  const { person } = useRouteLoaderData("routes/app") as AppLoaderData;
  const fetcher = useFetcher<{
    comments: AugmentedComment[];
  }>();
  const commentFetcher = useFetcher();
  const [newComment, setNewComment] = useState("");
  useEffect(() => {
    if (actionId) {
      fetcher.load(`/action/handle-action?actionId=${actionId}`);
    }
  }, [actionId, fetcher.load]);
  const { data: allPeople = [] } = useQuery({
    queryKey: QUERY_KEYS.people(),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });

  // Filtra as pessoas que possuem acesso ao partner desta ação
  const mentionablePeople = useMemo(() => {
    return allPeople.filter((p) => partnerUsersIds.includes(p.user_id));
  }, [allPeople, partnerUsersIds]);
  const comments = fetcher.data?.comments || [];
  const handleCreate = (content: string, mentions: string[]) => {
    if (!content.trim()) return;
    commentFetcher.submit(
      {
        intent: INTENT.create_comment,
        actionId,
        content,
        isInternal: "false",
        mentions: JSON.stringify(mentions),
      },
      {
        method: "post",
        action: `/action/handle-action`,
      },
    );
    setNewComment("");
  };
  return (
    <div className="flex h-full flex-col overflow-hidden bg-muted/30">
      <div className="flex-1 overflow-y-auto p-6">
        <CommentList
          comments={comments}
          currentUserId={person.user_id}
          emptyMessage="Nenhuma observação encontrada para esta ação."
          isUser={true}
          mentionablePeople={mentionablePeople}
          onDelete={(commentId) => {
            if (confirm("Tem certeza que deseja excluir esta observação?")) {
              commentFetcher.submit(
                {
                  intent: INTENT.delete_comment,
                  commentId,
                },
                {
                  method: "post",
                  action: `/action/handle-action`,
                },
              );
            }
          }}
          onUpdate={(commentId, content) => {
            commentFetcher.submit(
              {
                intent: INTENT.update_comment,
                commentId,
                content,
              },
              {
                method: "post",
                action: `/action/handle-action`,
              },
            );
          }}
        />
      </div>

      <div className="border-t bg-background p-4">
        <CommentInput
          isSubmitting={commentFetcher.state !== "idle"}
          mentionablePeople={mentionablePeople}
          onChange={setNewComment}
          onSend={handleCreate}
          value={newComment}
        />
      </div>
    </div>
  );
}
