import { useFetchers, useNavigation } from "react-router";
import { useMemo } from "react";
import { INTENT, PHASES } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";

export function useOptimisticActions(actions: Action[]): Action[] {
  const fetchers = useFetchers();
  const navigation = useNavigation();

  return useMemo(() => {
    // 1. Gather all active optimistic update payloads
    const activeUpdates: any[] = [];
    const allSubmissions = [...fetchers, navigation];

    for (const f of allSubmissions) {
      if (!f.formData && !(f as any).json) continue;
      
      let payload: any = null;
      if ((f as any).json) {
        payload = (f as any).json;
      } else if (f.formData) {
        const obj: Record<string, any> = {};
        f.formData.forEach((value, key) => {
          obj[key] = value;
        });
        payload = obj;
      }

      if (payload) {
        activeUpdates.push(payload);
      }
    }

    if (activeUpdates.length === 0) return actions;

    // 2. Apply updates to the actions list
    return actions.map((action) => {
      let updatedAction = { ...action };
      let hasUpdate = false;

      for (const payload of activeUpdates) {
        if (payload.intent === INTENT.update_action && String(payload.id) === String(action.id)) {
          updatedAction = { ...updatedAction, ...payload };
          hasUpdate = true;
        } else if (payload.intent === INTENT.bulk_update_actions && payload.ids) {
          const ids = Array.isArray(payload.ids)
            ? payload.ids
            : JSON.parse(payload.ids || "[]");
          if (ids.map(String).includes(String(action.id))) {
            const { intent, ids: _removed, ...updates } = payload;
            updatedAction = { ...updatedAction, ...updates };
            hasUpdate = true;
          }
        }
      }

      if (hasUpdate) {
        // If marked as done or archived, remove from sprints optimistically
        if (
          updatedAction.phase === PHASES.concluido.slug ||
          updatedAction.archived === true
        ) {
          updatedAction.sprints = null;
        }
      }

      return updatedAction;
    });
  }, [actions, fetchers, navigation]);
}

