import type { Action } from "~/types";
import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { INTENT } from "~/lib/CONSTANTS";
import { QUERY_KEYS } from "~/lib/query-keys";
import { format } from "date-fns";
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

interface MutationContext {
  previousActions?: [QueryKey, Action[] | undefined][];
  previousLateActions?: [QueryKey, Action[] | undefined][];
}

const handleError = (error: unknown) => {
  console.error("Mutation failed:", error);
  const message =
    error instanceof Error ? error.message : "Erro desconhecido";
  toast.error(`Falha na operação: ${message}`);
};

export function useActionMutations() {
  const queryClient = useQueryClient();

  const invalidateActions = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.actions.all() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lateActions.all() });
  };

  // Helper function to rollback cache on error
  const onErrorRollback = (
    err: unknown,
    _vars: unknown,
    context: MutationContext | undefined,
  ) => {
    handleError(err);
    if (context?.previousActions) {
      context.previousActions.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    }
    if (context?.previousLateActions) {
      context.previousLateActions.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    }
  };

  // 1. Single Action Mutation
  const singleActionMutation = useMutation({
    mutationKey: ["actionMutation"],
    mutationFn: async (data: SingleActionInput) => {
      const { intent, id, ...values } = data;
      if (intent === INTENT.create_action) {
        return await createActionClient(values as ActionFormInput);
      } else if (intent === INTENT.update_action) {
        if (id)
          return await updateActionClient(
            String(id),
            values as ActionFormInput,
          );
      } else if (intent === INTENT.duplicate_action) {
        if (id) return await duplicateActionClient(String(id));
      } else if (intent === INTENT.delete_action) {
        if (id) return await deleteActionClient(String(id));
      }
    },
    onMutate: async (data: SingleActionInput) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.actions.all() });
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.lateActions.all(),
      });

      const previousActions = queryClient.getQueriesData<Action[]>({
        queryKey: QUERY_KEYS.actions.all(),
      });
      const previousLateActions = queryClient.getQueriesData<Action[]>({
        queryKey: QUERY_KEYS.lateActions.all(),
      });

      const updateData = (oldData: Action[] | undefined) => {
        if (!oldData) return [];
        const { intent, id, ...values } = data;
        let nextData = [...oldData];

        if (intent === INTENT.update_action && id) {
          nextData = nextData.map((action) =>
            action.id === id ? ({ ...action, ...values } as Action) : action,
          );
        } else if (intent === INTENT.create_action) {
          const tempId = id || `temp-${Date.now()}`;
          if (!nextData.some((action) => action.id === tempId)) {
            nextData.push({
              id: tempId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              archived: false,
              ...values,
            } as Action);
          }
        } else if (intent === INTENT.delete_action && id) {
          nextData = nextData.filter((action) => action.id !== id);
        } else if (intent === INTENT.duplicate_action && id) {
          const original = nextData.find((action) => action.id === id);
          if (original) {
            nextData.push({
              ...original,
              id: `temp-dup-${Date.now()}`,
              title: `${original.title} (Cópia)`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }

        // Remove as ações que foram arquivadas otimisticamente
        return nextData.filter((action) => !action.archived);
      };

      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.actions.all() },
        updateData,
      );
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.lateActions.all() },
        updateData,
      );

      return { previousActions, previousLateActions };
    },
    onError: onErrorRollback,
    onSettled: () => {
      invalidateActions();
    },
  });

  // 2. Bulk Actions Mutation
  const bulkActionMutation = useMutation({
    mutationKey: ["bulkActionMutation"],
    mutationFn: async ({
      ids,
      updates,
    }: {
      ids: string[];
      updates: Partial<Action>;
    }) => {
      if (ids.length === 0) return;
      return await bulkUpdateActionsClient(ids, updates);
    },
    onMutate: async ({ ids, updates }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.actions.all() });
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.lateActions.all(),
      });

      const previousActions = queryClient.getQueriesData<Action[]>({
        queryKey: QUERY_KEYS.actions.all(),
      });
      const previousLateActions = queryClient.getQueriesData<Action[]>({
        queryKey: QUERY_KEYS.lateActions.all(),
      });

      const updateData = (oldData: Action[] | undefined) => {
        if (!oldData) return [];
        const nextData = oldData.map((action) =>
          ids.includes(action.id)
            ? ({ ...action, ...updates } as Action)
            : action,
        );
        return nextData.filter((action) => !action.archived);
      };

      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.actions.all() },
        updateData,
      );
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.lateActions.all() },
        updateData,
      );

      return { previousActions, previousLateActions };
    },
    onError: onErrorRollback,
    onSettled: () => {
      invalidateActions();
    },
  });

  // 3. Bulk Date Only Mutation
  const bulkDateOnlyMutation = useMutation({
    mutationKey: ["bulkDateOnlyMutation"],
    mutationFn: async ({
      ids,
      newDate,
    }: {
      ids: string[];
      newDate: string;
    }) => {
      if (ids.length === 0) return;
      return await bulkUpdateDateOnlyClient(ids, newDate);
    },
    onMutate: async ({ ids, newDate }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.actions.all() });
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.lateActions.all(),
      });

      const previousActions = queryClient.getQueriesData<Action[]>({
        queryKey: QUERY_KEYS.actions.all(),
      });
      const previousLateActions = queryClient.getQueriesData<Action[]>({
        queryKey: QUERY_KEYS.lateActions.all(),
      });

      const updateData = (oldData: Action[] | undefined) => {
        if (!oldData) return [];
        return oldData.map((action) => {
          if (ids.includes(action.id)) {
            try {
              const existingTime = format(
                new Date(action.date.replace(" ", "T")),
                "HH:mm:ss",
              );
              return {
                ...action,
                date: `${newDate} ${existingTime}`,
              } as Action;
            } catch {
              return { ...action, date: `${newDate} 00:00:00` } as Action;
            }
          }
          return action;
        });
      };

      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.actions.all() },
        updateData,
      );
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.lateActions.all() },
        updateData,
      );

      return { previousActions, previousLateActions };
    },
    onError: onErrorRollback,
    onSettled: () => {
      invalidateActions();
    },
  });

  // 4. Bulk Time Only Mutation
  const bulkTimeOnlyMutation = useMutation({
    mutationKey: ["bulkTimeOnlyMutation"],
    mutationFn: async ({
      ids,
      newTime,
    }: {
      ids: string[];
      newTime: string;
    }) => {
      if (ids.length === 0) return;
      return await bulkUpdateTimeOnlyClient(ids, newTime);
    },
    onMutate: async ({ ids, newTime }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.actions.all() });
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.lateActions.all(),
      });

      const previousActions = queryClient.getQueriesData<Action[]>({
        queryKey: QUERY_KEYS.actions.all(),
      });
      const previousLateActions = queryClient.getQueriesData<Action[]>({
        queryKey: QUERY_KEYS.lateActions.all(),
      });

      const updateData = (oldData: Action[] | undefined) => {
        if (!oldData) return [];
        return oldData.map((action) => {
          if (ids.includes(action.id)) {
            try {
              const existingDate = format(
                new Date(action.date.replace(" ", "T")),
                "yyyy-MM-dd",
              );
              return {
                ...action,
                date: `${existingDate} ${newTime}:00`,
              } as Action;
            } catch {
              return action;
            }
          }
          return action;
        });
      };

      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.actions.all() },
        updateData,
      );
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.lateActions.all() },
        updateData,
      );

      return { previousActions, previousLateActions };
    },
    onError: onErrorRollback,
    onSettled: () => {
      invalidateActions();
    },
  });

  // Helper wrappers — wrapped in useCallback so their references stay stable
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
