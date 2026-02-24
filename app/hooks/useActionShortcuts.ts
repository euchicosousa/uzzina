import { useCallback, useEffect } from "react";
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

  const keyDown = useCallback(
    (event: KeyboardEvent) => {
      const code = event.code;

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
              ...action,
              intent: INTENT.create_action,
              created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
              updated_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            },
            submit,
          );
        } else if (code === "KeyH") {
          handleAction(
            {
              ...action,
              intent: INTENT.update_action,
              ...getNewDateForAction(
                action,
                addMinutes(new Date(), 30),
                isInstagramDate,
              ),
            },
            submit,
          );
        } else if (code === "KeyA") {
          //Amanhã
          handleAction(
            {
              ...action,
              intent: INTENT.update_action,
              ...getNewDateForAction(
                action,
                addDays(new Date(), 1),
                isInstagramDate,
              ),
            },
            submit,
          );
        } else if (code === "KeyS") {
          // Em 7 dias
          const targetStr = isInstagramDate
            ? action.instagram_date!
            : action.date;
          const targetDateObj = parseISO(targetStr.replace(" ", "T"));

          handleAction(
            {
              ...action,
              intent: INTENT.update_action,
              ...getNewDateForAction(
                action,
                isAfter(targetDateObj, new Date())
                  ? addDays(targetDateObj, 7)
                  : addDays(new Date(), 7),
                isInstagramDate,
              ),
            },
            submit,
          );
        } else if (code === "KeyM") {
          // Em 30 dias
          const targetStr = isInstagramDate
            ? action.instagram_date!
            : action.date;
          const targetDateObj = parseISO(targetStr.replace(" ", "T"));

          handleAction(
            {
              ...action,
              intent: INTENT.update_action,
              ...getNewDateForAction(
                action,
                isAfter(targetDateObj, new Date())
                  ? addDays(targetDateObj, 30)
                  : addDays(new Date(), 30),
                isInstagramDate,
              ),
            },
            submit,
          );
        } else if (code === "KeyU") {
          // Coloca ou retira do sprint
          let sprints = null;
          if (action.sprints) {
            if (action.sprints.find((sprint) => sprint === person.user_id)) {
              sprints = action.sprints.filter(
                (sprint) => sprint !== person.user_id,
              );
            } else {
              sprints = [...action.sprints, person.user_id];
            }
          } else {
            sprints = [person.user_id];
          }

          sprints = sprints.length > 0 ? sprints : null;

          handleAction(
            {
              ...action,
              intent: INTENT.update_action,
              sprints,
            },
            submit,
          );
        } else if (code === "KeyX") {
          if (confirm("Tem certeza que deseja arquivar esta ação?")) {
            handleAction(
              {
                ...action,
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
            ...action,
            intent: INTENT.update_action,
            state: status[code],
          },
          submit,
        );
      }
    },
    [action, isInstagramDate, person.user_id, submit],
  );

  useEffect(() => {
    document.addEventListener("keydown", keyDown);

    return () => document.removeEventListener("keydown", keyDown);
  }, [keyDown]);
};
