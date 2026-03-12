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
  registerAction: (id: string, data: NonNullable<ActiveAction>) => void;
  unregisterAction: (id: string) => void;
  setEditingId: (id: string | null) => void;
}>({
  registerAction: () => {},
  unregisterAction: () => {},
  setEditingId: () => {},
});

/**
 * Provider que registra UM único listener de keydown no document (capture phase).
 *
 * Em vez de rastrear mouseenter/mouseleave (que pode ser interceptado pelo
 * onKeyDown do dnd-kit no componente Draggable), este provider:
 *  1. Mantém um Map de todas as ações montadas (registry)
 *  2. No keydown, lê document.querySelectorAll('[data-action-id]:hover') para
 *     descobrir qual ação está sob o cursor no exato momento da tecla
 *  3. Usa capture phase (terceiro arg true) para garantir que o evento chegue
 *     antes do onKeyDown do dnd-kit ter chance de bloqueá-lo
 */
export function ActionShortcutProvider({ children }: { children: ReactNode }) {
  const submit = useSubmit();
  const { person } = useRouteLoaderData("routes/app") as AppLoaderData;

  // Registry: actionId → {action, isInstagramDate}
  const actionsMapRef = useRef<Map<string, NonNullable<ActiveAction>>>(
    new Map(),
  );

  // ID da ação que está em modo de edição (sem atalhos)
  const editingIdRef = useRef<string | null>(null);

  const registerAction = useCallback(
    (id: string, data: NonNullable<ActiveAction>) => {
      actionsMapRef.current.set(id, data);
    },
    [],
  );

  const unregisterAction = useCallback((id: string) => {
    actionsMapRef.current.delete(id);
  }, []);

  const setEditingId = useCallback((id: string | null) => {
    editingIdRef.current = id;
  }, []);

  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      // Descobre o elemento mais interno sob o cursor que tenha data-action-id
      const hovered = [
        ...document.querySelectorAll("[data-action-id]:hover"),
      ] as HTMLElement[];
      const el = hovered.at(-1);
      const actionId = el?.getAttribute("data-action-id");

      if (!actionId) return;
      // Se o item está em modo de edição, ignora atalhos
      if (editingIdRef.current === actionId) return;

      const active = actionsMapRef.current.get(actionId);
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

    // capture: true → captura antes do onKeyDown do dnd-kit interceptar
    document.addEventListener("keydown", keyDown, true);
    return () => document.removeEventListener("keydown", keyDown, true);
  }, [submit, person.user_id]);

  return (
    <ActionShortcutContext.Provider
      value={{ registerAction, unregisterAction, setEditingId }}
    >
      {children}
    </ActionShortcutContext.Provider>
  );
}

/** Retorna as funções do context de shortcuts para uso no ActionItem. */
export function useActionShortcutContext() {
  return useContext(ActionShortcutContext);
}

/**
 * @deprecated Use useActionShortcutContext() em vez disso.
 * Mantido por compatibilidade. Retorna um setActiveAction no-op.
 */
export function useSetActiveAction() {
  return () => {};
}
