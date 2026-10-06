import {
  createContext,
  use,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

type MultiSelectionContextType = {
  isSelectionMode: boolean;
  selectedIds: string[];
  toggleSelectionMode: (value?: boolean) => void;
  toggleSelection: (id: string, override?: boolean) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
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
    setSelectedIds((prev) => {
      if (override !== undefined) {
        if (override && !prev.includes(id)) return [...prev, id];
        if (!override && prev.includes(id)) return prev.filter((i) => i !== id);
        return prev;
      }
      return prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds([...new Set(ids)]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Cmd+A shortcut to select all visible actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSelectionMode && (e.metaKey || e.ctrlKey) && (e.key === "a" || e.key === "A")) {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement).isContentEditable
        ) {
          return;
        }

        e.preventDefault();
        const actionElements = document.querySelectorAll("[data-action-id]");
        const ids = Array.from(actionElements)
          .filter((el) => {
            if (!(el instanceof HTMLElement)) return false;
            // Ignora elementos ocultos, colapsados ou dentro de gavetas/modais fechados
            if (
              el.closest('[aria-hidden="true"]') ||
              el.closest(".hidden") ||
              el.closest("[inert]")
            ) {
              return false;
            }
            if (el.offsetParent === null && el.style.position !== "fixed") {
              return false;
            }
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
              return false;
            }
            if (typeof window !== "undefined") {
              const style = window.getComputedStyle(el);
              if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                style.opacity === "0"
              ) {
                return false;
              }
            }
            return true;
          })
          .flatMap((el) => {
            const id = el.getAttribute("data-action-id");
            return id ? [id] : [];
          });

        setSelectedIds([...new Set(ids)]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelectionMode]);

  const contextValue = useMemo(
    () => ({
      isSelectionMode,
      selectedIds,
      toggleSelectionMode,
      toggleSelection,
      selectAll,
      clearSelection,
    }),
    [
      isSelectionMode,
      selectedIds,
      toggleSelectionMode,
      toggleSelection,
      selectAll,
      clearSelection,
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
