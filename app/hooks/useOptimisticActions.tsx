import { useFetchers, useNavigation } from "react-router";
import { useMemo } from "react";
import { INTENT } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";

export function useOptimisticActions(actions: Action[]): Action[] {
  const fetchers = useFetchers();
  const navigation = useNavigation();

  const currentActions = useMemo(() => {
    const actionsMap = new Map(actions.map((action) => [action.id, action]));

    const pendingSubmissions = [...fetchers, navigation].filter(
      (submission) => submission.formData || (submission as any).json,
    );

    for (const submission of pendingSubmissions) {
      // Normalize React Router v7 payloads (FormData vs JSON)
      const dataPayload = {
        get: (key: string) => {
          if (submission.formData) return submission.formData.get(key);
          if ((submission as any).json)
            return (submission as any).json[key] ?? null;
          return null;
        },
        getAll: (key: string) => {
          if (submission.formData) return submission.formData.getAll(key);
          if ((submission as any).json) {
            const val = (submission as any).json[key];
            return Array.isArray(val) ? val : val != null ? [val] : [];
          }
          return [];
        },
      };

      const intent = dataPayload.get("intent");

      if (intent === INTENT.update_action) {
        const id = String(dataPayload.get("id"));

        if (actionsMap.has(id)) {
          const action = actionsMap.get(id)!;
          const newAction = { ...action };

          const updateString = (key: keyof Action) => {
            const value = dataPayload.get(key as string);
            if (value !== null) {
              // @ts-ignore
              newAction[key] = String(value);
            }
          };

          const updateNumber = (key: keyof Action) => {
            const value = dataPayload.get(key as string);
            if (value !== null) {
              // @ts-ignore
              newAction[key] = Number(value);
            }
          };

          const updateBoolean = (key: keyof Action) => {
            const value = dataPayload.get(key as string);
            if (value !== null) {
              // @ts-ignore
              newAction[key] = value === "true" || value === true;
            }
          };

          const updateArray = (key: keyof Action) => {
            const values = dataPayload.getAll(key as string);
            const cleanValues = values
              .map(String)
              .filter((v) => v !== "" && v !== "null");

            if (cleanValues.length === 0) {
              // @ts-ignore
              newAction[key] = [];
            } else if (
              cleanValues.length === 1 &&
              cleanValues[0].includes(",")
            ) {
              // @ts-ignore
              newAction[key] = cleanValues[0].split(",").filter(Boolean);
            } else {
              // @ts-ignore
              newAction[key] = cleanValues;
            }
          };

          const updateNumberArray = (key: keyof Action) => {
            const values = dataPayload.getAll(key as string);
            const cleanValues = values
              .map(String)
              .filter((v) => v !== "" && v !== "null");

            if (cleanValues.length === 0) {
              // @ts-ignore
              newAction[key] = [];
            } else if (
              cleanValues.length === 1 &&
              cleanValues[0].includes(",")
            ) {
              // @ts-ignore
              newAction[key] = cleanValues[0]
                .split(",")
                .filter(Boolean)
                .map(Number);
            } else {
              // @ts-ignore
              newAction[key] = cleanValues.map(Number);
            }
          };

          // Update fields
          updateString("state");
          updateString("priority");
          updateString("category");
          updateString("title");
          updateString("description");
          updateString("date");
          updateString("instagram_date");
          updateString("instagram_caption");
          updateString("instagram_content");
          updateString("color");
          updateNumber("time");

          updateBoolean("archived");

          updateArray("content_files");
          updateArray("partners");
          updateArray("responsibles");
          updateArray("sprints");
          updateArray("work_files");

          updateNumberArray("topics");

          actionsMap.set(id, newAction);
        }
      }
    }

    return Array.from(actionsMap.values());
  }, [actions, fetchers, navigation]);

  return currentActions;
}
