import { useEffect, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CommentList } from "../ActionComments/CommentList";
import { CommentInput } from "../ActionComments/CommentInput";
import { INTENT } from "~/lib/CONSTANTS";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import type { AugmentedComment } from "~/models/action_comments.server";
import type { AppLoaderData } from "~/routes/app";

export function ObservationsTab({
  actionId,
  actionColor,
  actionTextColor,
  partnerUsersIds = [],
}: {
  actionId: string;
  actionColor?: string;
  actionTextColor?: string;
  partnerUsersIds?: string[];
}) {
  const { person } = useRouteLoaderData("routes/app") as AppLoaderData;
  const fetcher = useFetcher<{ comments: AugmentedComment[] }>();
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
  const mentionablePeople = allPeople.filter((p) =>
    partnerUsersIds.includes(p.user_id)
  );

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
          isUser={true}
          brandColor={actionColor}
          brandTextColor={actionTextColor}
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
          emptyMessage="Nenhuma observação encontrada para esta ação."
        />
      </div>

      <div className="border-t bg-background p-4">
        <CommentInput
          value={newComment}
          onChange={setNewComment}
          onSend={handleCreate}
          isSubmitting={commentFetcher.state !== "idle"}
          mentionablePeople={mentionablePeople}
        />
      </div>
    </div>
  );
}
