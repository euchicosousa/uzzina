import { useCallback, useEffect, useRef } from "react";
import { useRouteLoaderData, useSubmit } from "react-router";
import { addDays, addMinutes, isAfter, parseISO } from "date-fns";
import { INTENT, STATES } from "~/lib/CONSTANTS";
import {
  getNewDateForAction,
  handleAction,
  toggleSprintAction,
} from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import type { AppLoaderData } from "~/routes/app";

export const useActionShortcuts = (
  action: Action,
  isInstagramDate?: boolean,
) => {
  const submit = useSubmit();
  const { person } = useRouteLoaderData("routes/app") as AppLoaderData;

  // Use refs so the keyDown callback always reads the latest values,
  // avoiding stale closures when shortcuts are pressed multiple times in a row.
  const actionRef = useRef(action);
  actionRef.current = action;

  const isInstagramDateRef = useRef(isInstagramDate);
  isInstagramDateRef.current = isInstagramDate;

  const keyDown = useCallback(
    (event: KeyboardEvent) => {
      const code = event.code;
      // Always read from the ref to get the latest action value
      const currentAction = actionRef.current;
      const currentIsInstagramDate = isInstagramDateRef.current;

      // Helper: update action date to a given Date
      const updateDate = (newDate: Date) =>
        handleAction(
          {
            ...currentAction,
            intent: INTENT.update_action,
            ...getNewDateForAction(
              currentAction,
              newDate,
              currentIsInstagramDate,
            ),
          },
          submit,
        );

      // Helper: returns the action's relevant date if it's in the future, otherwise today
      const getFutureTarget = () => {
        const str = currentIsInstagramDate
          ? currentAction.instagram_date!
          : currentAction.date;
        const d = parseISO(str.replace(" ", "T"));
        return isAfter(d, new Date()) ? d : new Date();
      };

      const status: Record<string, string> = {
        KeyI: STATES.idea.slug,
        KeyF: STATES.do.slug,
        KeyZ: STATES.doing.slug,
        KeyA: STATES.review.slug,
        KeyP: STATES.approved.slug,
        KeyT: STATES.done.slug,
        KeyC: STATES.finished.slug,
      };

      //SHIFT — Atalhos de Data
      if (event.shiftKey) {
        if (code === "KeyD") {
          handleAction(
            { id: currentAction.id, intent: INTENT.duplicate_action },
            submit,
          );
        } else if (code === "KeyH") {
          updateDate(addMinutes(new Date(), 30));
        } else if (code === "Digit1") {
          updateDate(addMinutes(new Date(), 60));
        } else if (code === "Digit2") {
          updateDate(addMinutes(new Date(), 120));
        } else if (code === "Digit3") {
          updateDate(addMinutes(new Date(), 180));
        } else if (code === "KeyA") {
          updateDate(addDays(new Date(), 1));
        } else if (code === "KeyS") {
          updateDate(addDays(getFutureTarget(), 7));
        } else if (code === "KeyM") {
          updateDate(addDays(getFutureTarget(), 30));
        } else if (code === "KeyU") {
          toggleSprintAction(currentAction, person.user_id, submit);
        } else if (code === "KeyX") {
          if (confirm("Tem certeza que deseja arquivar esta ação?")) {
            handleAction(
              {
                ...currentAction,
                intent: INTENT.update_action,
                archived: true,
              },
              submit,
            );
          }
        }
      } else if (status[code]) {
        handleAction(
          {
            ...currentAction,
            intent: INTENT.update_action,
            state: status[code],
          },
          submit,
        );
      }
    },
    // The callback only depends on stable values (submit, person.user_id).
    // Action data is always read from the ref, which is kept up-to-date.
    [submit, person.user_id],
  );

  useEffect(() => {
    document.addEventListener("keydown", keyDown);

    return () => document.removeEventListener("keydown", keyDown);
  }, [keyDown]);
};
