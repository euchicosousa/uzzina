import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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
}: {
  children: React.ReactNode;
}) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
      if (isSelectionMode && (e.metaKey || e.ctrlKey) && e.key === "a") {
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
          .map((el) => el.getAttribute("data-action-id"))
          .filter(Boolean) as string[];

        setSelectedIds([...new Set(ids)]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelectionMode]);

  return (
    <MultiSelectionContext.Provider
      value={{
        isSelectionMode,
        selectedIds,
        toggleSelectionMode,
        toggleSelection,
        selectAll,
        clearSelection,
      }}
    >
      {children}
    </MultiSelectionContext.Provider>
  );
}

export function useMultiSelection() {
  const context = useContext(MultiSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useMultiSelection must be used within a MultiSelectionProvider",
    );
  }
  return context;
}
