import { useQuery } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import { AppContext } from "~/contexts/AppContext";
import { buildTopicColorMap } from "~/lib/action-color";
import { QUERY_KEYS } from "~/lib/query-keys";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { getPartnerTopics } from "~/models/partners";
import type { PartnerTopic } from "~/types";

const NO_TOPICS: PartnerTopic[] = [];

/**
 * Topics visible to the signed-in team member. Safe outside the team app
 * (portal, public review): without AppContext it stays disabled and empty.
 */
export function usePartnerTopics() {
  const userId = useContext(AppContext)?.person.user_id;
  const query = useQuery({
    queryKey: QUERY_KEYS.partnerTopics(userId ?? ""),
    queryFn: () => getPartnerTopics(createSupabaseBrowserClient()),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
  const topics = query.data ?? NO_TOPICS;
  const topicColors = useMemo(() => buildTopicColorMap(topics), [topics]);
  return { topics, topicColors, isLoading: query.isLoading };
}
