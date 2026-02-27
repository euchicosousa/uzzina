import { useCallback, useEffect, useRef } from "react";
import { useRouteLoaderData, useSubmit } from "react-router";
import { addDays, addMinutes, format, isAfter, parseISO } from "date-fns";
import { INTENT, STATES } from "~/lib/CONSTANTS";
import { getNewDateForAction, handleAction } from "~/lib/helpers";
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

      let status: Record<string, string> = {
        KeyI: STATES.idea.slug,
        KeyF: STATES.do.slug,
        KeyZ: STATES.doing.slug,
        KeyA: STATES.review.slug,
        KeyP: STATES.approved.slug,
        KeyT: STATES.done.slug,
        KeyC: STATES.finished.slug,
      };

      //SHIFT
      //Atalhos de Data
      if (event.shiftKey) {
        // Hoje em 30 minutos
        if (code === "KeyD") {
          handleAction(
            {
              ...currentAction,
              intent: INTENT.create_action,
              created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
              updated_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            },
            submit,
          );
        } else if (code === "KeyH") {
          handleAction(
            {
              ...currentAction,
              intent: INTENT.update_action,
              ...getNewDateForAction(
                currentAction,
                addMinutes(new Date(), 30),
                currentIsInstagramDate,
              ),
            },
            submit,
          );
        } else if (code === "KeyA") {
          //Amanhã
          handleAction(
            {
              ...currentAction,
              intent: INTENT.update_action,
              ...getNewDateForAction(
                currentAction,
                addDays(new Date(), 1),
                currentIsInstagramDate,
              ),
            },
            submit,
          );
        } else if (code === "KeyS") {
          // Em 7 dias
          const targetStr = currentIsInstagramDate
            ? currentAction.instagram_date!
            : currentAction.date;
          const targetDateObj = parseISO(targetStr.replace(" ", "T"));

          handleAction(
            {
              ...currentAction,
              intent: INTENT.update_action,
              ...getNewDateForAction(
                currentAction,
                isAfter(targetDateObj, new Date())
                  ? addDays(targetDateObj, 7)
                  : addDays(new Date(), 7),
                currentIsInstagramDate,
              ),
            },
            submit,
          );
        } else if (code === "KeyM") {
          // Em 30 dias
          const targetStr = currentIsInstagramDate
            ? currentAction.instagram_date!
            : currentAction.date;
          const targetDateObj = parseISO(targetStr.replace(" ", "T"));

          handleAction(
            {
              ...currentAction,
              intent: INTENT.update_action,
              ...getNewDateForAction(
                currentAction,
                isAfter(targetDateObj, new Date())
                  ? addDays(targetDateObj, 30)
                  : addDays(new Date(), 30),
                currentIsInstagramDate,
              ),
            },
            submit,
          );
        } else if (code === "KeyU") {
          // Coloca ou retira do sprint
          let sprints = null;
          if (currentAction.sprints) {
            if (
              currentAction.sprints.find((sprint) => sprint === person.user_id)
            ) {
              sprints = currentAction.sprints.filter(
                (sprint) => sprint !== person.user_id,
              );
            } else {
              sprints = [...currentAction.sprints, person.user_id];
            }
          } else {
            sprints = [person.user_id];
          }

          sprints = sprints.length > 0 ? sprints : null;

          handleAction(
            {
              ...currentAction,
              intent: INTENT.update_action,
              sprints,
            },
            submit,
          );
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
