import type { Action } from "~/types";
import {
  createContext,
  useCallback,
  use,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { addDays, addMinutes, isAfter } from "date-fns";
import { parseU } from "~/utils/date";
import { toast } from "sonner";
import { INTENT, PHASES } from "~/lib/CONSTANTS";
import { getNewDateForAction } from "~/lib/helpers";
import { isInputFocused } from "~/lib/uzzina-utils";
import { useActionMutations } from "~/hooks/useActionMutations";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { useAppContext } from "~/contexts/AppContext";

const ActionShortcutContext = createContext<{
  setEditingId: (id: string | null) => void;
}>({
  setEditingId: () => { },
});

export function ActionShortcutProvider({ children }: { children: ReactNode }) {
  const { handleAction, toggleSprintAction } = useActionMutations();
  const { person } = useAppContext();
  const queryClient = useQueryClient();

  // Guarda as funções em refs para que o listener não precise ser recriado a cada render
  const handleActionRef = useRef(handleAction);
  const toggleSprintActionRef = useRef(toggleSprintAction);
  const personRef = useRef(person);

  useEffect(() => {
    handleActionRef.current = handleAction;
    toggleSprintActionRef.current = toggleSprintAction;
    personRef.current = person;
  });

  // ID da ação que está em modo de edição (sem atalhos)
  const editingIdRef = useRef<string | null>(null);

  const setEditingId = useCallback((id: string | null) => {
    editingIdRef.current = id;
  }, []);

  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      // Ignora repetição de tecla segurada
      if (event.repeat) return;

      if (isInputFocused(event)) return;

      // Descobre o elemento mais interno sob o cursor que tenha data-action-id
      const hovered = [
        ...document.querySelectorAll("[data-action-id]:hover"),
      ] as HTMLElement[];
      const el = hovered.at(-1);
      const actionId = el?.getAttribute("data-action-id");

      if (!actionId) return;
      // Se o item está em modo de edição, ignora atalhos
      if (editingIdRef.current === actionId) return;

      // Busca a ação diretamente de todas as queries de actions cacheadas no TanStack Query
      const actionQueries = queryClient.getQueriesData<Action[]>({
        queryKey: QUERY_KEYS.actions.all(),
      });
      const lateActionQueries = queryClient.getQueriesData<Action[]>({
        queryKey: QUERY_KEYS.lateActions.all(),
      });

      let targetAction: Action | undefined;
      for (const [, actions] of [...actionQueries, ...lateActionQueries]) {
        if (Array.isArray(actions)) {
          const found = actions.find((a) => a.id === actionId);
          if (found) {
            targetAction = found;
            break;
          }
        }
      }

      if (!targetAction) return;

      const action = targetAction;
      const code = event.code;

      const updateDate = (newDate: Date) =>
        handleActionRef.current(
          {
            ...action,
            intent: INTENT.update_action,
            ...getNewDateForAction(action, newDate),
          }
        );

      const getFutureTarget = () => {
        const str = action.date;
        const d = parseU(str);
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

      const targetPhase = phases[code];

      if (event.shiftKey) {
        if (code === "KeyD") {
          event.preventDefault();
          handleActionRef.current(
            { id: action.id, intent: INTENT.duplicate_action }
          );
        } else if (code === "KeyH") {
          event.preventDefault();
          updateDate(addMinutes(new Date(), 30));
        } else if (code === "Digit1") {
          event.preventDefault();
          updateDate(addMinutes(new Date(), 60));
        } else if (code === "Digit2") {
          event.preventDefault();
          updateDate(addMinutes(new Date(), 120));
        } else if (code === "Digit3") {
          event.preventDefault();
          updateDate(addMinutes(new Date(), 180));
        } else if (code === "KeyA") {
          event.preventDefault();
          updateDate(addDays(new Date(), 1));
        } else if (code === "KeyS") {
          event.preventDefault();
          updateDate(addDays(getFutureTarget(), 7));
        } else if (code === "KeyM") {
          event.preventDefault();
          updateDate(addDays(getFutureTarget(), 30));
        } else if (code === "KeyU") {
          event.preventDefault();
          const currentPerson = personRef.current;
          if (currentPerson) toggleSprintActionRef.current(action, currentPerson.user_id);
        } else if (code === "KeyX") {
          event.preventDefault();
          handleActionRef.current(
            { ...action, intent: INTENT.update_action, archived: true }
          );
          toast("Ação arquivada", {
            action: {
              label: "Desfazer",
              onClick: () => {
                handleActionRef.current(
                  { ...action, intent: INTENT.update_action, archived: false }
                );
              },
            },
          });
        }
      } else if (targetPhase) {
        event.preventDefault();
        handleActionRef.current(
          { ...action, intent: INTENT.update_action, phase: targetPhase }
        );
      }
    }

    // capture: true → captura antes do onKeyDown do dnd-kit interceptar
    document.addEventListener("keydown", keyDown, true);
    return () => document.removeEventListener("keydown", keyDown, true);
  }, [queryClient]);

  const contextValue = useMemo(
    () => ({ setEditingId }),
    [setEditingId],
  );

  return (
    <ActionShortcutContext.Provider value={contextValue}>
      {children}
    </ActionShortcutContext.Provider>
  );
}

/** Retorna as funções do context de shortcuts para uso no ActionItem. */
export function useActionShortcutContext() {
  return use(ActionShortcutContext);
}


