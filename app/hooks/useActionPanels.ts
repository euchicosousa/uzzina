import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Action } from "~/types";
import type { ActionDrawerView } from "~/components/features/action-drawer/ActionFormDrawer";

export type ActionSlot = "primaryAction" | "secondaryAction";
export type ActionLeaveGuard = () => Promise<boolean>;
export interface PanelAction {
  key: string;
  initialAction: Action;
  currentAction: Action;
  view: ActionDrawerView;
}
interface PanelState {
  primaryAction: PanelAction | null;
  secondaryAction: PanelAction | null;
  activeKey: string | null;
  focusRequest: number;
  focusTargetKey: string | null;
}

const emptyState = (): PanelState => ({
  primaryAction: null,
  secondaryAction: null,
  activeKey: null,
  focusRequest: 0,
  focusTargetKey: null,
});

/** Coordinates two independent editing spaces without assigning persistence to the UI. */
export function useActionPanels(initialPrimaryAction?: Action) {
  const id = useId();
  const sequenceRef = useRef(0);
  const [state, setState] = useState<PanelState>(() => ({
    ...emptyState(),
    primaryAction: initialPrimaryAction
      ? {
          key: `${id}-0`,
          initialAction: initialPrimaryAction,
          currentAction: initialPrimaryAction,
          view: "essential",
        }
      : null,
    activeKey: initialPrimaryAction ? `${id}-0` : null,
    focusTargetKey: initialPrimaryAction ? `${id}-0` : null,
  }));
  const stateRef = useRef(state);
  const guardsRef = useRef(new Map<string, ActionLeaveGuard>());
  const generationRef = useRef(0);
  const operatingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      generationRef.current++;
      guardsRef.current.clear();
    };
  }, []);

  const commit = useCallback((next: PanelState) => {
    if (!mountedRef.current) return;
    stateRef.current = next;
    setState(next);
  }, []);

  const reset = useCallback(() => {
    generationRef.current++;
    operatingRef.current = false;
    guardsRef.current.clear();
    commit(emptyState());
  }, [commit]);

  const registerLeaveGuard = useCallback(
    (key: string, guard: ActionLeaveGuard | null) => {
      if (guard) guardsRef.current.set(key, guard);
      else guardsRef.current.delete(key);
    },
    [],
  );

  const activateAction = useCallback(
    (key: string, focusContent = false) => {
      if (operatingRef.current) return;
      const current = stateRef.current;
      if (
        ![current.primaryAction, current.secondaryAction].some(
          (entry) => entry?.key === key,
        )
      )
        return;
      commit({
        ...current,
        activeKey: key,
        focusTargetKey: focusContent ? key : null,
        focusRequest: current.focusRequest + (focusContent ? 1 : 0),
      });
    },
    [commit],
  );

  const prepare = useCallback(
    async (entries: PanelAction[], generation: number) => {
      for (const entry of entries) {
        const guard = guardsRef.current.get(entry.key);
        if (guard && !(await guard())) return false;
        if (!mountedRef.current || generation !== generationRef.current)
          return false;
      }
      return mountedRef.current && generation === generationRef.current;
    },
    [],
  );

  const openAction = useCallback(
    async (action: Action, requestedSlot: ActionSlot) => {
      if (operatingRef.current || !mountedRef.current) return false;
      const current = stateRef.current;
      const existing = action.id
        ? [current.primaryAction, current.secondaryAction].find(
            (entry) => entry?.currentAction.id === action.id,
          )
        : undefined;
      if (existing) {
        activateAction(existing.key, true);
        return true;
      }
      const slot =
        !current.primaryAction && !current.secondaryAction
          ? "primaryAction"
          : requestedSlot;
      const replaced = current[slot];
      const generation = generationRef.current;
      operatingRef.current = true;
      try {
        if (!(await prepare(replaced ? [replaced] : [], generation)))
          return false;
        const nextAction: PanelAction = {
          key: `${id}-${++sequenceRef.current}`,
          initialAction: action,
          currentAction: action,
          view: "essential",
        };
        if (replaced) guardsRef.current.delete(replaced.key);
        commit({
          ...stateRef.current,
          [slot]: nextAction,
          activeKey: nextAction.key,
          focusTargetKey: nextAction.key,
          focusRequest: stateRef.current.focusRequest + 1,
        });
        return true;
      } finally {
        if (generation === generationRef.current) operatingRef.current = false;
      }
    },
    [activateAction, commit, id, prepare],
  );

  const closeAction = useCallback(
    async (key: string) => {
      if (operatingRef.current || !mountedRef.current) return false;
      const current = stateRef.current;
      const slot =
        current.primaryAction?.key === key
          ? "primaryAction"
          : current.secondaryAction?.key === key
            ? "secondaryAction"
            : null;
      if (!slot) return false;
      const entry = current[slot];
      if (!entry) return false;
      const generation = generationRef.current;
      operatingRef.current = true;
      try {
        if (!(await prepare([entry], generation))) return false;
        const latest = stateRef.current;
        const remaining =
          slot === "primaryAction"
            ? latest.secondaryAction
            : latest.primaryAction;
        guardsRef.current.delete(key);
        commit({
          ...latest,
          [slot]: null,
          activeKey:
            latest.activeKey === key
              ? (remaining?.key ?? null)
              : latest.activeKey,
          focusTargetKey: remaining?.key ?? null,
          focusRequest: latest.focusRequest + 1,
        });
        return true;
      } finally {
        if (generation === generationRef.current) operatingRef.current = false;
      }
    },
    [commit, prepare],
  );

  const closeAllActions = useCallback(async () => {
    if (operatingRef.current || !mountedRef.current) return false;
    const current = stateRef.current;
    const entries = [current.primaryAction, current.secondaryAction].filter(
      (entry): entry is PanelAction => entry !== null,
    );
    const generation = generationRef.current;
    operatingRef.current = true;
    try {
      if (!(await prepare(entries, generation))) return false;
      guardsRef.current.clear();
      commit(emptyState());
      return true;
    } finally {
      if (generation === generationRef.current) operatingRef.current = false;
    }
  }, [commit, prepare]);

  const setPrimaryAction = useCallback(
    (action: Action | null) =>
      action
        ? openAction(action, "primaryAction")
        : stateRef.current.primaryAction
          ? closeAction(stateRef.current.primaryAction.key)
          : Promise.resolve(true),
    [closeAction, openAction],
  );
  const setSecondaryAction = useCallback(
    (action: Action) => openAction(action, "secondaryAction"),
    [openAction],
  );

  const updateAction = useCallback(
    (key: string, action: Action) => {
      const current = stateRef.current;
      const slot =
        current.primaryAction?.key === key
          ? "primaryAction"
          : current.secondaryAction?.key === key
            ? "secondaryAction"
            : null;
      if (!slot) return;
      const entry = current[slot];
      if (!entry || entry.currentAction === action) return;
      commit({ ...current, [slot]: { ...entry, currentAction: action } });
    },
    [commit],
  );

  const setView = useCallback(
    (key: string, view: ActionDrawerView) => {
      const current = stateRef.current;
      const slot =
        current.primaryAction?.key === key
          ? "primaryAction"
          : current.secondaryAction?.key === key
            ? "secondaryAction"
            : null;
      if (!slot) return;
      const entry = current[slot];
      if (!entry || entry.view === view) return;
      commit({ ...current, [slot]: { ...entry, view } });
    },
    [commit],
  );

  return {
    ...state,
    setPrimaryAction,
    setSecondaryAction,
    activateAction,
    closeAction,
    closeAllActions,
    registerLeaveGuard,
    updateAction,
    setView,
    reset,
  };
}

export type ActionPanels = ReturnType<typeof useActionPanels>;
