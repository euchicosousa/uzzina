import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useRouteLoaderData } from "react-router";
import { addDays, addMinutes, isAfter, parseISO } from "date-fns";
import { toast } from "sonner";
import { INTENT, PHASES } from "~/lib/CONSTANTS";
import {
  getNewDateForAction,
} from "~/lib/helpers";
import { useActionMutations } from "~/hooks/useActionMutations";
import type { Action } from "~/models/actions.server";
import type { AppLoaderData } from "~/routes/app";

type ActiveAction = { action: Action } | null;

const ActionShortcutContext = createContext<{
  registerAction: (id: string, data: NonNullable<ActiveAction>) => void;
  unregisterAction: (id: string) => void;
  setEditingId: (id: string | null) => void;
}>({
  registerAction: () => { },
  unregisterAction: () => { },
  setEditingId: () => { },
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
  const { handleAction, toggleSprintAction } = useActionMutations();
  const appData = useRouteLoaderData("routes/app") as AppLoaderData | undefined;
  const person = appData?.person;

  // Registry: actionId → {action}
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

      const { action } = active;
      const code = event.code;

      const updateDate = (newDate: Date) =>
        handleAction(
          {
            ...action,
            intent: INTENT.update_action,
            ...getNewDateForAction(action, newDate),
          }
        );

      const getFutureTarget = () => {
        const str = action.date;
        const d = parseISO(str.replace(" ", "T"));
        return isAfter(d, new Date()) ? d : new Date();
      };

      const phases = Object.values(PHASES).reduce<Record<string, string>>(
        (acc, phase) => {
          if ("key" in phase && phase.key) {
            acc[phase.key] = phase.slug;
          }
          return acc;
        },
        {}
      );

      let targetPhase = phases[code];
      if (!targetPhase && code === "KeyF") {
        targetPhase = "estrategia";
      }

      if (event.shiftKey) {
        if (code === "KeyD") {
          handleAction(
            { id: action.id, intent: INTENT.duplicate_action }
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
          if (person) toggleSprintAction(action, person.user_id);
        } else if (code === "KeyX") {
          handleAction(
            { ...action, intent: INTENT.update_action, archived: true }
          );
          toast("Ação arquivada", {
            action: {
              label: "Desfazer",
              onClick: () => {
                handleAction(
                  { ...action, intent: INTENT.update_action, archived: false }
                );
              },
            },
          });
        }
      } else if (targetPhase) {
        handleAction(
          { ...action, intent: INTENT.update_action, phase: targetPhase }
        );
      }
    }

    // capture: true → captura antes do onKeyDown do dnd-kit interceptar
    document.addEventListener("keydown", keyDown, true);
    return () => document.removeEventListener("keydown", keyDown, true);
  }, [handleAction, toggleSprintAction, person]);

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
  return () => { };
}
