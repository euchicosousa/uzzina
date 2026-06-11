import {
  useQuery,
  useMutationState,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { format } from "date-fns";
import { INTENT } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";

export function useOptimisticQuery<TData = Action[]>(
  options: UseQueryOptions<TData, Error, TData>,
) {
  const queryResult = useQuery<TData, Error, TData>(options);

  // Escuta mutações de ação única
  const actionMutations = useMutationState({
    filters: { mutationKey: ["actionMutation"] },
    select: (mutation) => ({
      // biome-ignore lint/suspicious/noExplicitAny: variables payload shape is defined dynamically by React Query mutation key
      variables: mutation.state.variables as any,
      status: mutation.state.status,
      submittedAt: mutation.state.submittedAt,
    }),
  });

  // Escuta mutações em lote
  const bulkActionMutations = useMutationState({
    filters: { mutationKey: ["bulkActionMutation"] },
    select: (mutation) => ({
      // biome-ignore lint/suspicious/noExplicitAny: variables payload shape is defined dynamically by React Query mutation key
      variables: mutation.state.variables as any,
      status: mutation.state.status,
      submittedAt: mutation.state.submittedAt,
    }),
  });

  const optimisticData = useMemo(() => {
    const data = queryResult.data;
    if (!data || !Array.isArray(data)) return data;

    let nextData = [...data] as Action[];

    // Mutações ativas: que começaram após a última atualização da query e que não falharam
    const activeBulkActions = bulkActionMutations.filter(
      (m) => m.submittedAt > queryResult.dataUpdatedAt && m.status !== "error",
    );

    const activeActions = actionMutations.filter(
      (m) => m.submittedAt > queryResult.dataUpdatedAt && m.status !== "error",
    );

    // 1. Aplicar mutações em lote primeiro
    activeBulkActions.forEach((mutation) => {
      const mutationVars = mutation.variables;
      if (!mutationVars) return;

      const { ids, updates, newDate, newTime } = mutationVars;
      if (!ids || !Array.isArray(ids)) return;

      nextData = nextData.map((action) => {
        if (ids.includes(action.id)) {
          if (updates) {
            return { ...action, ...updates };
          }
          if (newDate) {
            try {
              const existingTime = format(
                new Date(action.date.replace(" ", "T")),
                "HH:mm:ss",
              );
              return { ...action, date: `${newDate} ${existingTime}` };
            } catch {
              return { ...action, date: `${newDate} 00:00:00` };
            }
          }
          if (newTime) {
            try {
              const existingDate = format(
                new Date(action.date.replace(" ", "T")),
                "yyyy-MM-dd",
              );
              return { ...action, date: `${existingDate} ${newTime}:00` };
            } catch {
              return action;
            }
          }
        }
        return action;
      });
    });

    // 2. Aplicar mutações individuais
    activeActions.forEach((mutation) => {
      const mutationVars = mutation.variables;
      if (!mutationVars) return;

      const { intent, id, ...values } = mutationVars;

      if (intent === INTENT.update_action && id) {
        nextData = nextData.map((action) =>
          action.id === id ? { ...action, ...values } : action,
        );
      } else if (intent === INTENT.create_action) {
        // Gera um ID temporário se não houver um
        const tempId = values.id || `temp-${Date.now()}`;
        // Só insere se já não existir na lista
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
          const tempId = `temp-dup-${Date.now()}`;
          nextData.push({
            ...original,
            id: tempId,
            title: `${original.title} (Cópia)`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    });

    return nextData as unknown as TData;
  }, [
    queryResult.data,
    queryResult.dataUpdatedAt,
    actionMutations,
    bulkActionMutations,
  ]);

  return {
    ...queryResult,
    data: optimisticData,
  };
}
