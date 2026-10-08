import type { Action } from "~/types";
import {
  createContext,
  use,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useId,
  useRef,
} from "react";

type MultiSelectionContextType = {
  isSelectionMode: boolean;
  selectedIds: string[];
  toggleSelectionMode: (value?: boolean) => void;
  toggleSelection: (id: string, override?: boolean) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  removeSelected: (ids: string[]) => void;
  eligibleActions: Action[];
  registerActions: (key: string, actions: Action[] | null) => void;
};

const MultiSelectionContext = createContext<
  MultiSelectionContextType | undefined
>(undefined);

export function MultiSelectionProvider({
  children,
  locationKey,
}: {
  children: React.ReactNode;
  locationKey?: string;
}) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [views, setViews] = useState<Record<string, Action[]>>({});
  const registerActions = useCallback((key: string, actions: Action[] | null) => {
    setViews(previous => {
      const next = {...previous};
      if (actions) next[key] = actions;
      else delete next[key];
      return next;
    });
  }, []);
  const eligibleActions = useMemo(() => [...new Map(Object.values(views).flat().map(action => [action.id, action])).values()], [views]);
  const eligibleIds = useMemo(() => new Set(eligibleActions.map(action => action.id)), [eligibleActions]);
  const effectiveIds = selectedIds.filter(id => eligibleIds.has(id));
  useEffect(() => {
    setSelectedIds(previous => {
      const next = previous.filter(id => eligibleIds.has(id));
      return next.length === previous.length ? previous : next;
    });
  }, [eligibleIds]);
  const removeSelected = useCallback((ids: string[]) => {
    setSelectedIds(previous => previous.filter(id => !ids.includes(id)));
  }, []);

  // Limpa seleção ao mudar de rota ou contexto
  useEffect(() => {
    if (locationKey !== undefined) {
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
  }, [locationKey]);

  useEffect(() => {
    const handlePopState = () => {
      setSelectedIds([]);
      setIsSelectionMode(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const toggleSelectionMode = useCallback((value?: boolean) => {
    setIsSelectionMode((prev) => {
      const nextValue = value !== undefined ? value : !prev;
      if (!nextValue) setSelectedIds([]); // Clear selection when exiting mode
      return nextValue;
    });
  }, []);

  const toggleSelection = useCallback((id: string, override?: boolean) => {
    if (!eligibleIds.has(id)) return;
    setSelectedIds((prev) => {
      if (override !== undefined) {
        if (override && !prev.includes(id)) return [...prev, id];
        if (!override && prev.includes(id)) return prev.filter((i) => i !== id);
        return prev;
      }
      return prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
    });
  }, [eligibleIds]);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds([...new Set(ids)].filter(id => eligibleIds.has(id)));
  }, [eligibleIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Cmd+A shortcut to select all visible actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSelectionMode && (e.metaKey || e.ctrlKey) && (e.key === "a" || e.key === "A")) {
        const target = e.target;
        if (target instanceof Element && target.closest('input, textarea, [contenteditable]:not([contenteditable="false"])')) return;
        e.preventDefault();
        setSelectedIds([...eligibleIds]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelectionMode, eligibleIds]);

  const contextValue = useMemo(
    () => ({
      isSelectionMode,
      selectedIds: effectiveIds,
      toggleSelectionMode,
      toggleSelection,
      selectAll,
      clearSelection,
      removeSelected,
      eligibleActions,
      registerActions,
    }),
    [
      isSelectionMode,
      effectiveIds,
      toggleSelectionMode,
      toggleSelection,
      selectAll,
      clearSelection,
      removeSelected,
      eligibleActions,
      registerActions,
    ],
  );

  return (
    <MultiSelectionContext.Provider value={contextValue}>
      {children}
    </MultiSelectionContext.Provider>
  );
}

export function useMultiSelection() {
  const context = use(MultiSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useMultiSelection must be used within a MultiSelectionProvider",
    );
  }
  return context;
}

// Containers publish their rendered data, never DOM geometry or unrelated cached lists.
export function useSelectionActions(actions: Action[]) {
  const context = use(MultiSelectionContext);
  const key = useId();
  const register = context?.registerActions;
  const latestActions = useRef(actions);
  latestActions.current = actions;
  const signature = JSON.stringify(actions.map(action => [action.id, action.updated_at, action.date]));
  const previousSignature = useRef<string | null>(null);
  useEffect(() => {
    if (previousSignature.current === signature) return;
    previousSignature.current = signature;
    register?.(key, latestActions.current);
  }, [register, key, signature]);
  useEffect(() => () => {
    previousSignature.current = null;
    register?.(key, null);
  }, [register, key]);
}

export function useSelectionContext(key: string) {
  const context = use(MultiSelectionContext);
  const clear = context?.clearSelection;
  const previousKey = useRef(key);
  useEffect(() => {
    if (previousKey.current !== key) clear?.();
    previousKey.current = key;
  }, [clear, key]);
}
