import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
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

type ActiveAction = { action: Action; isInstagramDate?: boolean } | null;

const ActionShortcutContext = createContext<{
  setActiveAction: (active: ActiveAction) => void;
}>({ setActiveAction: () => {} });

/**
 * Provider que registra UM único listener de keydown no document.
 * O listener lê a ação ativa via ref — sem stale closures, sem listeners acumulados.
 * Coloque este provider no layout raiz (app.tsx), dentro do RouteLoaderData.
 */
export function ActionShortcutProvider({ children }: { children: ReactNode }) {
  const submit = useSubmit();
  const { person } = useRouteLoaderData("routes/app") as AppLoaderData;

  const activeRef = useRef<ActiveAction>(null);

  const setActiveAction = useCallback((active: ActiveAction) => {
    activeRef.current = active;
  }, []);

  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      const active = activeRef.current;
      if (!active) return;

      const { action, isInstagramDate } = active;
      const code = event.code;

      const updateDate = (newDate: Date) =>
        handleAction(
          {
            ...action,
            intent: INTENT.update_action,
            ...getNewDateForAction(action, newDate, isInstagramDate),
          },
          submit,
        );

      const getFutureTarget = () => {
        const str = isInstagramDate ? action.instagram_date! : action.date;
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

      if (event.shiftKey) {
        if (code === "KeyD") {
          handleAction(
            { id: action.id, intent: INTENT.duplicate_action },
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
          toggleSprintAction(action, person.user_id, submit);
        } else if (code === "KeyX") {
          if (confirm("Tem certeza que deseja arquivar esta ação?")) {
            handleAction(
              { ...action, intent: INTENT.update_action, archived: true },
              submit,
            );
          }
        }
      } else if (status[code]) {
        handleAction(
          { ...action, intent: INTENT.update_action, state: status[code] },
          submit,
        );
      }
    }

    document.addEventListener("keydown", keyDown);
    return () => document.removeEventListener("keydown", keyDown);
  }, [submit, person.user_id]);

  return (
    <ActionShortcutContext.Provider value={{ setActiveAction }}>
      {children}
    </ActionShortcutContext.Provider>
  );
}

/** Retorna a função para definir a ação ativa no contexto de shortcuts. */
export function useSetActiveAction() {
  return useContext(ActionShortcutContext).setActiveAction;
}
