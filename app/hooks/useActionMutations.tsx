import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
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
import type { ActionFormInput } from "~/utils/validation";

export type SingleActionInput = Partial<ActionFormInput> & {
  intent: string;
  id?: string;
};

export function useActionMutations() {
  const queryClient = useQueryClient();

  const invalidateActions = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.actions.all() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lateActions.all() });
  };

  const handleError = (error: unknown) => {
    console.error("Mutation failed:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    toast.error(`Falha na operação: ${message}`);
  };

  // 1. Single Action Mutation
  const singleActionMutation = useMutation({
    mutationKey: ["actionMutation"],
    mutationFn: async (data: SingleActionInput) => {
      const { intent, id, ...values } = data;
      if (intent === INTENT.create_action) {
        return await createActionClient(values as ActionFormInput);
      } else if (intent === INTENT.update_action) {
        if (id) return await updateActionClient(String(id), values as ActionFormInput);
      } else if (intent === INTENT.duplicate_action) {
        if (id) return await duplicateActionClient(String(id));
      } else if (intent === INTENT.delete_action) {
        if (id) return await deleteActionClient(String(id));
      }
    },
    onSuccess: () => {
      invalidateActions();
    },
    onError: handleError,
  });

  // 2. Bulk Actions Mutation
  const bulkActionMutation = useMutation({
    mutationKey: ["bulkActionMutation"],
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<Action> }) => {
      if (ids.length === 0) return;
      return await bulkUpdateActionsClient(ids, updates);
    },
    onSuccess: () => {
      invalidateActions();
    },
    onError: handleError,
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
    onError: handleError,
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
    onError: handleError,
  });

  // Helper wrappers — wrapped in useCallback so their references stay stable
  // across renders. Unstable references here cascade into useCallback/useEffect
  // dependency arrays in consumers (e.g. CreateAndEditAction) and cause
  // infinite re-render loops.
  const handleAction = useCallback(
    async (data: SingleActionInput) => {
      return singleActionMutation.mutateAsync(data);
    },
    [singleActionMutation.mutateAsync],
  );

  const handleBulkAction = useCallback(
    async (ids: string[], updates: Partial<Action>) => {
      return bulkActionMutation.mutateAsync({ ids, updates });
    },
    [bulkActionMutation.mutateAsync],
  );

  const handleBulkDateOnly = useCallback(
    async (ids: string[], newDate: string) => {
      return bulkDateOnlyMutation.mutateAsync({ ids, newDate });
    },
    [bulkDateOnlyMutation.mutateAsync],
  );

  const handleBulkTimeOnly = useCallback(
    async (ids: string[], newTime: string) => {
      return bulkTimeOnlyMutation.mutateAsync({ ids, newTime });
    },
    [bulkTimeOnlyMutation.mutateAsync],
  );

  const toggleSprintAction = useCallback(
    async (action: Action, userId: string) => {
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

      // Convert fields to input-friendly format for handleAction
      const actionInput: SingleActionInput = {
        ...(action as unknown as ActionFormInput),
        intent: INTENT.update_action,
        sprints,
      };

      return handleAction(actionInput);
    },
    [handleAction],
  );

  const submitDeleteAction = useCallback(
    async (action: Action) => {
      const actionInput: SingleActionInput = {
        ...(action as unknown as ActionFormInput),
        intent: INTENT.update_action,
        archived: true,
      };
      return handleAction(actionInput);
    },
    [handleAction],
  );

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

