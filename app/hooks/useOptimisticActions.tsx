import { useFetchers, useNavigation } from "react-router";
import { useMemo } from "react";
import { INTENT, PHASES } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";

export function useOptimisticActions(actions: Action[]): Action[] {
  const fetchers = useFetchers();
  const navigation = useNavigation();

  const currentActions = useMemo(() => {
    const actionsMap = new Map(actions.map((action) => [action.id, action]));

    // Coleta todos os payloads pendentes (fetchers + navigation)
    const pendingPayloads = [...fetchers, navigation]
      .map((f) => (f as any).json ?? null)
      .filter(Boolean);

    for (const payload of pendingPayloads) {
      if (payload.intent === INTENT.update_action) {
        const id = String(payload.id);
        if (!actionsMap.has(id)) continue;

        const original = actionsMap.get(id)!;
        const updated = { ...original, ...payload };

        if (updated.phase === PHASES.concluido.slug || updated.archived === true) {
          updated.sprints = null;
        }

        actionsMap.set(id, updated);
      } else if (payload.intent === INTENT.bulk_update_actions) {
        const ids = Array.isArray(payload.ids) ? payload.ids : JSON.parse(payload.ids || "[]");
        const { intent, ids: _removed, ...updates } = payload;
        
        for (const id of ids) {
          const stringId = String(id);
          if (actionsMap.has(stringId)) {
            const original = actionsMap.get(stringId)!;
            const updated = { ...original, ...updates };

            if (updated.phase === PHASES.concluido.slug || updated.archived === true) {
              updated.sprints = null;
            }

            actionsMap.set(stringId, updated);
          }
        }
      }
    }

    return Array.from(actionsMap.values());
  }, [actions, fetchers, navigation]);

  return currentActions;
}

