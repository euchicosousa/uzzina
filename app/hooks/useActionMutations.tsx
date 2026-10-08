import { getQuerySessionGeneration } from "~/lib/query-client";
import type { Action } from "~/types";
import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { parseU, getActionRevision as revision } from "~/utils/date";
import { toast } from "sonner";
import { INTENT } from "~/lib/CONSTANTS";
import { getActionListScope, QUERY_KEYS } from "~/lib/query-keys";
import {
  createActionClient,
  updateActionClient,
  duplicateActionClient,
  deleteActionClient,
  bulkUpdateActionsClient,
  bulkUpdateDateOnlyClient,
  bulkUpdateTimeOnlyClient,
  ActionConflictError,
} from "~/lib/supabase.mutations";
import type { ActionCreateInput, ActionPatchInput } from "~/utils/validation";

export type SingleActionInput = {
  intent: string;
  id?: string;
  expectedUpdatedAt?: string;
  [key: string]: unknown;
};

const handleError = (error: unknown) => {
  console.error("Mutation failed:", error);
  if (error instanceof ActionConflictError) {
    toast.error(error.message);
    return;
  }
  const message = error instanceof Error ? error.message : "Erro desconhecido";
  toast.error(`Falha na operação: ${message}`);
};

// Shared by hook instances using the same cache, including confirmations of removed cards.
const confirmedVersions = new WeakMap<
  QueryClient,
  { generation: number; versions: Map<string, number> }
>();

export function useActionMutations() {
  const queryClient = useQueryClient();
  const generation = useRef(getQuerySessionGeneration(queryClient)).current;
  const isCurrentSession = () =>
    generation === getQuerySessionGeneration(queryClient);
  const requireCurrentSession = () => {
    if (!isCurrentSession())
      throw new Error("A sessão mudou. Reabra a ação na conta atual.");
  };

  const invalidateActions = () => {
    if (!isCurrentSession()) return;
    // All action lists share this prefix, including overdue lists. Visit them only once.
    void queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.actions.all(),
      refetchType:
        queryClient.isMutating({ mutationKey: ["action-write"] }) > 1
          ? "none"
          : "active",
    });
  };

  const applyConfirmedAction = (action: Action) => {
    if (!isCurrentSession()) return;
    const lists = queryClient.getQueriesData<Action[]>({
      queryKey: QUERY_KEYS.actions.all(),
    });
    const previous = confirmedVersions.get(queryClient);
    const versions =
      previous?.generation === generation
        ? previous.versions
        : new Map<string, number>();
    confirmedVersions.set(queryClient, { generation, versions });
    const knownVersion = Math.max(
      versions.get(action.id || "") || 0,
      ...lists.map(([, rows]) =>
        Array.isArray(rows)
          ? revision(rows.find((row) => row.id === action.id)?.updated_at)
          : 0,
      ),
    );
    const serverVersion = revision(action.updated_at);
    if (!Number.isFinite(serverVersion) || serverVersion < knownVersion) return;
    versions.set(action.id || "", serverVersion);
    for (const [key, rows] of lists) {
      const scope = getActionListScope(key);
      if (!scope || !Array.isArray(rows)) continue; // Unknown lists are refreshed, never guessed.
      const existing = rows.find((row) => row.id === action.id);
      const date = parseU(action.date).getTime();
      const from = scope.from ? parseU(scope.from).getTime() : -Infinity;
      const to = scope.to === "now" ? Date.now() : parseU(scope.to).getTime();
      const belongs =
        !action.archived &&
        (!scope.strictArchived || action.archived === false) &&
        action.partners.some((partner) => scope.partners.includes(partner)) &&
        (scope.isAdmin || action.responsibles.includes(scope.userId)) &&
        date >= from &&
        (scope.kind === "late"
          ? date < to && action.phase !== "finished"
          : date <= to);
      queryClient.setQueryData<Action[]>(
        key,
        belongs
          ? existing
            ? rows.map((row) => (row.id === action.id ? action : row))
            : [...rows, action]
          : rows.filter((row) => row.id !== action.id),
      );
    }
  };

  // 1. Single Action Mutation
  const singleActionMutation = useMutation({
    mutationKey: ["action-write", "single"],
    onMutate: () =>
      queryClient.cancelQueries({ queryKey: QUERY_KEYS.actions.all() }),
    mutationFn: async (data: SingleActionInput) => {
      requireCurrentSession();
      const { intent, id, expectedUpdatedAt, ...values } = data;
      if (intent === INTENT.create_action) {
        return await createActionClient(values as ActionCreateInput);
      } else if (intent === INTENT.update_action) {
        if (!id) throw new Error("ID da ação é obrigatório para atualização.");
        if (!expectedUpdatedAt || typeof expectedUpdatedAt !== "string") {
          throw new Error(
            "expectedUpdatedAt é obrigatório para atualização de ação.",
          );
        }
        return await updateActionClient(
          String(id),
          values as ActionPatchInput,
          expectedUpdatedAt,
        );
      } else if (intent === INTENT.duplicate_action) {
        if (id)
          return await duplicateActionClient(String(id), requireCurrentSession);
      } else if (intent === INTENT.delete_action) {
        if (id) return await deleteActionClient(String(id));
      }
    },
    onSuccess: (result) => {
      if (result) applyConfirmedAction(result);
    },
    onError: (error) => {
      if (isCurrentSession()) handleError(error);
    },
    onSettled: () => {
      invalidateActions();
    },
  });

  // 2. Bulk Actions Mutation
  const bulkActionMutation = useMutation({
    mutationKey: ["action-write", "bulk"],
    onMutate: () =>
      queryClient.cancelQueries({ queryKey: QUERY_KEYS.actions.all() }),
    mutationFn: async ({
      actions,
      updates,
    }: {
      actions: Action[];
      updates: ActionPatchInput;
    }) => {
      requireCurrentSession();
      return await bulkUpdateActionsClient(
        actions,
        updates,
        applyConfirmedAction,
        requireCurrentSession,
      );
    },
    onError: (error) => {
      if (isCurrentSession()) handleError(error);
    },
    onSettled: () => {
      invalidateActions();
    },
  });

  // 3. Bulk Date Only Mutation
  const bulkDateOnlyMutation = useMutation({
    mutationKey: ["action-write", "date"],
    onMutate: () =>
      queryClient.cancelQueries({ queryKey: QUERY_KEYS.actions.all() }),
    mutationFn: async ({
      actions,
      newDate,
    }: {
      actions: Action[];
      newDate: string;
    }) => {
      requireCurrentSession();
      return await bulkUpdateDateOnlyClient(
        actions,
        newDate,
        applyConfirmedAction,
        requireCurrentSession,
      );
    },
    onError: (error) => {
      if (isCurrentSession()) handleError(error);
    },
    onSettled: () => {
      invalidateActions();
    },
  });

  // 4. Bulk Time Only Mutation
  const bulkTimeOnlyMutation = useMutation({
    mutationKey: ["action-write", "time"],
    onMutate: () =>
      queryClient.cancelQueries({ queryKey: QUERY_KEYS.actions.all() }),
    mutationFn: async ({
      actions,
      newTime,
    }: {
      actions: Action[];
      newTime: string;
    }) => {
      requireCurrentSession();
      return await bulkUpdateTimeOnlyClient(
        actions,
        newTime,
        applyConfirmedAction,
        requireCurrentSession,
      );
    },
    onError: (error) => {
      if (isCurrentSession()) handleError(error);
    },
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
    async (actions: Action[], updates: ActionPatchInput) => {
      return bulkActionMutation.mutateAsync({ actions, updates });
    },
    [bulkActionMutation.mutateAsync],
  );

  const handleBulkDateOnly = useCallback(
    async (actions: Action[], newDate: string) => {
      return bulkDateOnlyMutation.mutateAsync({ actions, newDate });
    },
    [bulkDateOnlyMutation.mutateAsync],
  );

  const handleBulkTimeOnly = useCallback(
    async (actions: Action[], newTime: string) => {
      return bulkTimeOnlyMutation.mutateAsync({ actions, newTime });
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
        intent: INTENT.update_action,
        id: action.id,
        expectedUpdatedAt: action.updated_at,
        sprints,
      };

      return handleAction(actionInput);
    },
    [handleAction],
  );

  const submitDeleteAction = useCallback(
    async (action: Action) => {
      const actionInput: SingleActionInput = {
        intent: INTENT.update_action,
        id: action.id,
        expectedUpdatedAt: action.updated_at,
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
