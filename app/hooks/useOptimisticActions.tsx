import { useFetchers, useNavigation } from "react-router";
import { useMemo, useState, useEffect } from "react";
import { INTENT, PHASES } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";

interface Override {
  timestamp: number;
  payload: any;
}

export function useOptimisticActions(actions: Action[]): Action[] {
  const fetchers = useFetchers();
  const navigation = useNavigation();

  // Local state to keep track of active overrides.
  // Key is action ID.
  const [overrides, setOverrides] = useState<Record<string, Override>>({});

  // 1. Gather all current pending payloads from active submissions
  const pendingPayloads = useMemo(() => {
    const list: any[] = [];
    const all = [...fetchers, navigation];
    for (const f of all) {
      if ((f as any).json) {
        list.push((f as any).json);
      } else if (f.formData) {
        // Fallback for standard form data just in case
        const obj: Record<string, any> = {};
        f.formData.forEach((value, key) => {
          obj[key] = value;
        });
        list.push(obj);
      }
    }
    return list;
  }, [fetchers, navigation]);

  // 2. Synchronize overrides state with active submissions and database actions
  useEffect(() => {
    setOverrides((prev) => {
      const next = { ...prev };
      let changed = false;
      const now = Date.now();

      // Clean up expired overrides (e.g. older than 8 seconds) or those that already match the server data
      for (const [id, override] of Object.entries(next)) {
        // Expire after 8 seconds to prevent stuck state if request fails
        if (now - override.timestamp > 8000) {
          delete next[id];
          changed = true;
          continue;
        }

        const baseAction = actions.find((a) => String(a.id) === id);
        if (baseAction) {
          // Check if baseAction already has all the values specified in the payload
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
            delete next[id];
            changed = true;
          }
        }
      }

      // Add new active submissions to overrides
      for (const payload of pendingPayloads) {
        if (payload.intent === INTENT.update_action && payload.id) {
          const id = String(payload.id);
          const existing = next[id];
          if (!existing || JSON.stringify(existing.payload) !== JSON.stringify(payload)) {
            next[id] = {
              timestamp: now,
              payload,
            };
            changed = true;
          }
        } else if (payload.intent === INTENT.bulk_update_actions && payload.ids) {
          const ids = Array.isArray(payload.ids) ? payload.ids : JSON.parse(payload.ids || "[]");
          const { intent, ids: _removed, ...updates } = payload;
          for (const id of ids) {
            const stringId = String(id);
            const existing = next[stringId];
            const subPayload = { id: stringId, intent: INTENT.update_action, ...updates };
            if (!existing || JSON.stringify(existing.payload) !== JSON.stringify(subPayload)) {
              next[stringId] = {
                timestamp: now,
                payload: subPayload,
              };
              changed = true;
            }
          }
        }
      }

      return changed ? next : prev;
    });
  }, [pendingPayloads, actions]);

  // 3. Apply overrides to current actions
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
  }, [actions, overrides]);

  return currentActions;
}

