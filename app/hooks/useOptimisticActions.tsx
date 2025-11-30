import { useFetchers, useNavigation } from "react-router";
import { useMemo } from "react";
import { INTENT } from "~/lib/CONSTANTS";

export function useOptimisticActions(actions: Action[]): Action[] {
    const fetchers = useFetchers();
    const navigation = useNavigation();

    const currentActions = useMemo(() => {
        const actionsMap = new Map(actions.map((action) => [action.id, action]));

        const pendingSubmissions = [
            ...fetchers,
            navigation
        ].filter((submission) => submission.formData);

        // console.log("useOptimisticActions: pendingSubmissions", pendingSubmissions.length);

        for (const submission of pendingSubmissions) {
            const formData = submission.formData!;
            const intent = formData.get("intent");
            // console.log("useOptimisticActions: intent", intent);

            if (intent === INTENT.update_action) {
                const id = String(formData.get("id"));
                // console.log("useOptimisticActions: id", id);

                if (actionsMap.has(id)) {
                    const action = actionsMap.get(id)!;
                    const newAction = { ...action };

                    // console.log("useOptimisticActions: found action", action.title);

                    // Helper to update string fields
                    const updateString = (key: keyof Action) => {
                        const value = formData.get(key as string);
                        if (value !== null) {
                            // console.log(`useOptimisticActions: updating ${key} to`, value);
                            // @ts-ignore
                            newAction[key] = String(value);
                        }
                    };

                    // Helper to update number fields
                    const updateNumber = (key: keyof Action) => {
                        const value = formData.get(key as string);
                        if (value !== null) {
                            // console.log(`useOptimisticActions: updating ${key} to`, value);
                            // @ts-ignore
                            newAction[key] = Number(value);
                        }
                    };

                    // Helper to update boolean fields
                    const updateBoolean = (key: keyof Action) => {
                        const value = formData.get(key as string);
                        if (value !== null) {
                            // console.log(`useOptimisticActions: updating ${key} to`, value);
                            // @ts-ignore
                            newAction[key] = value === "true";
                        }
                    };

                    // Helper to update array fields
                    const updateArray = (key: keyof Action) => {
                        const values = formData.getAll(key as string);
                        // Filter out "null" string which might be sent by some clients
                        const cleanValues = values.map(String).filter(v => v !== "" && v !== "null");

                        // console.log(`useOptimisticActions: updating array ${key}`, values, cleanValues);

                        if (cleanValues.length === 0) {
                            // @ts-ignore
                            newAction[key] = [];
                        } else if (cleanValues.length === 1 && cleanValues[0].includes(",")) {
                            // Handle comma-separated string (backend compatibility)
                            // @ts-ignore
                            newAction[key] = cleanValues[0].split(",").filter(Boolean);
                        } else {
                            // Standard FormData array
                            // @ts-ignore
                            newAction[key] = cleanValues;
                        }
                        // console.log(`useOptimisticActions: new value for ${key}`, newAction[key]);
                    };

                    // Special handler for topics (number array)
                    const updateNumberArray = (key: keyof Action) => {
                        const values = formData.getAll(key as string);
                        const cleanValues = values.map(String).filter(v => v !== "" && v !== "null");

                        // console.log(`useOptimisticActions: updating number array ${key}`, values, cleanValues);

                        if (cleanValues.length === 0) {
                            // @ts-ignore
                            newAction[key] = [];
                        } else if (cleanValues.length === 1 && cleanValues[0].includes(",")) {
                            // @ts-ignore
                            newAction[key] = cleanValues[0].split(",").filter(Boolean).map(Number);
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
