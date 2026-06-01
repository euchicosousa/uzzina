import { useFetchers, useNavigation } from "react-router";
import { useMemo, useRef } from "react";
import { INTENT, PHASES } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";

interface Override {
  timestamp: number;
  payload: any;
}

export function useOptimisticActions(actions: Action[]): Action[] {
  const fetchers = useFetchers();
  const navigation = useNavigation();

  // Keep overrides in a ref to manage them synchronously during the render cycle,
  // preventing any one-frame rendering lag/flicker.
  const overridesRef = useRef<Record<string, Override>>({});
  const overrides = overridesRef.current;

  const now = Date.now();

  // 1. Gather all current pending payloads from active submissions
  const pendingPayloads = useMemo(() => {
    const list: any[] = [];
    const all = [...fetchers, navigation];
    for (const f of all) {
      if ((f as any).json) {
        list.push((f as any).json);
      } else if (f.formData) {
        const obj: Record<string, any> = {};
        f.formData.forEach((value, key) => {
          obj[key] = value;
        });
        list.push(obj);
      }
    }
    return list;
  }, [fetchers, navigation]);

  // 2. Synchronously clean up overrides that are expired or match the server data
  for (const [id, override] of Object.entries(overrides)) {
    // Expire after 8 seconds to prevent stuck state if request fails
    if (now - override.timestamp > 8000) {
      delete overrides[id];
      continue;
    }

    const baseAction = actions.find((a) => String(a.id) === id);
    if (baseAction) {
      let allMatch = true;
      const payload = override.payload;
      for (const key of Object.keys(payload)) {
        if (key === "intent" || key === "id" || key === "ids") continue;
        
        const baseValue = (baseAction as any)[key];
        const payloadValue = payload[key];
        if (JSON.stringify(baseValue) !== JSON.stringify(payloadValue)) {
          allMatch = false;
          break;
        }
      }

      if (allMatch) {
        delete overrides[id];
      }
    }
  }

  // 3. Synchronously add new active submissions to overrides
  for (const payload of pendingPayloads) {
    if (payload.intent === INTENT.update_action && payload.id) {
      const id = String(payload.id);
      overrides[id] = {
        timestamp: now,
        payload,
      };
    } else if (payload.intent === INTENT.bulk_update_actions && payload.ids) {
      const ids = Array.isArray(payload.ids) ? payload.ids : JSON.parse(payload.ids || "[]");
      const { intent, ids: _removed, ...updates } = payload;
      for (const id of ids) {
        const stringId = String(id);
        const subPayload = { id: stringId, intent: INTENT.update_action, ...updates };
        overrides[stringId] = {
          timestamp: now,
          payload: subPayload,
        };
      }
    }
  }

  // 4. Apply overrides to current actions synchronously
  const currentActions = useMemo(() => {
    const actionsMap = new Map(actions.map((action) => [String(action.id), action]));

    for (const [id, override] of Object.entries(overrides)) {
      if (actionsMap.has(id)) {
        const original = actionsMap.get(id)!;
        const updated = { ...original, ...override.payload };

        if (updated.phase === PHASES.concluido.slug || updated.archived === true) {
          updated.sprints = null;
        }

        actionsMap.set(id, updated);
      }
    }

    return Array.from(actionsMap.values());
  }, [actions, pendingPayloads]);

  return currentActions;
}

