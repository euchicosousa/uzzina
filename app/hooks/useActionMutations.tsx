import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INTENT } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";
import { QUERY_KEYS } from "~/lib/query-keys";
import {
  createActionClient,
  updateActionClient,
  duplicateActionClient,
  deleteActionClient,
  bulkUpdateActionsClient,
  bulkUpdateDateOnlyClient,
  bulkUpdateTimeOnlyClient,
} from "~/lib/supabase.mutations";

export function useActionMutations() {
  const queryClient = useQueryClient();

  const invalidateActions = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.actions.all() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lateActions.all() });
  };

  // 1. Single Action Mutation
  const singleActionMutation = useMutation({
    mutationKey: ["actionMutation"],
    mutationFn: async (data: any) => {
      const { intent, id, ...values } = data;
      if (intent === INTENT.create_action) {
        return await createActionClient(values);
      } else if (intent === INTENT.update_action) {
        if (id) return await updateActionClient(String(id), values);
      } else if (intent === INTENT.duplicate_action) {
        if (id) return await duplicateActionClient(String(id));
      } else if (intent === INTENT.delete_action) {
        if (id) return await deleteActionClient(String(id));
      }
    },
    onSuccess: () => {
      invalidateActions();
    },
  });

  // 2. Bulk Actions Mutation
  const bulkActionMutation = useMutation({
    mutationKey: ["bulkActionMutation"],
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Record<string, any> }) => {
      if (ids.length === 0) return;
      return await bulkUpdateActionsClient(ids, updates);
    },
    onSuccess: () => {
      invalidateActions();
    },
  });

  // 3. Bulk Date Only Mutation
  const bulkDateOnlyMutation = useMutation({
    mutationKey: ["bulkActionMutation"],
    mutationFn: async ({ ids, newDate }: { ids: string[]; newDate: string }) => {
      if (ids.length === 0) return;
      return await bulkUpdateDateOnlyClient(ids, newDate);
    },
    onSuccess: () => {
      invalidateActions();
    },
  });

  // 4. Bulk Time Only Mutation
  const bulkTimeOnlyMutation = useMutation({
    mutationKey: ["bulkActionMutation"],
    mutationFn: async ({ ids, newTime }: { ids: string[]; newTime: string }) => {
      if (ids.length === 0) return;
      return await bulkUpdateTimeOnlyClient(ids, newTime);
    },
    onSuccess: () => {
      invalidateActions();
    },
  });

  // Helper wrappers
  const handleAction = async (data: any) => {
    return singleActionMutation.mutateAsync(data);
  };

  const handleBulkAction = async (ids: string[], updates: Record<string, any>) => {
    return bulkActionMutation.mutateAsync({ ids, updates });
  };

  const handleBulkDateOnly = async (ids: string[], newDate: string) => {
    return bulkDateOnlyMutation.mutateAsync({ ids, newDate });
  };

  const handleBulkTimeOnly = async (ids: string[], newTime: string) => {
    return bulkTimeOnlyMutation.mutateAsync({ ids, newTime });
  };

  const toggleSprintAction = async (action: Action, userId: string) => {
    let sprints: string[] | null = null;
    if (action.sprints) {
      if (action.sprints.includes(userId)) {
        sprints = action.sprints.filter((s) => s !== userId);
      } else {
        sprints = [...action.sprints, userId];
      }
    } else {
      sprints = [userId];
    }
    sprints = sprints.length > 0 ? sprints : null;

    return handleAction({ ...action, intent: INTENT.update_action, sprints });
  };

  const submitDeleteAction = async (action: Action) => {
    return handleAction({ ...action, intent: INTENT.update_action, archived: true });
  };

  return {
    handleAction,
    handleBulkAction,
    handleBulkDateOnly,
    handleBulkTimeOnly,
    toggleSprintAction,
    submitDeleteAction,
    isLoading:
      singleActionMutation.isPending ||
      bulkActionMutation.isPending ||
      bulkDateOnlyMutation.isPending ||
      bulkTimeOnlyMutation.isPending,
  };
}
