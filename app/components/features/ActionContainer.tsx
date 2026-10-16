import { useSelectionActions } from "~/hooks/useMultiSelection";
import type { Action } from "~/types";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import type { DATE_TIME_DISPLAY, ORDER_BY } from "~/lib/CONSTANTS";
import { VARIANT } from "~/lib/CONSTANTS";
import { sortActions } from "~/utils";
import { cn } from "cnfast";
import { getGridClasses } from "~/utils/uzzina-utils";
import { ActionItem, type ActionDisplayFlags } from "./ActionItem";
type ActionContainerProps = {
  actions: Action[];
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  displayFlags?: ActionDisplayFlags;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  orderBy?: (typeof ORDER_BY)[keyof typeof ORDER_BY];
  ascending?: boolean;
  scrollable?: boolean;
  isDraggable?: boolean;
  isSortable?: boolean;
  onClick?: (action: Action) => void;
};
const DEFAULT_DISPLAY_FLAGS: ActionDisplayFlags = {};
export function ActionContainer({
  actions,
  variant = VARIANT.line,
  columns = 1,
  displayFlags = DEFAULT_DISPLAY_FLAGS,
  dateTimeDisplay,
  orderBy,
  ascending,
  scrollable = true,
  isDraggable,
  isSortable,
  onClick,
}: ActionContainerProps) {
  // Quando isSortable está ativo, o array chega pré-ordenado pelo hook useSprintOrder.
  // Chamar sortActions aqui sobrescreveria a ordem customizada do usuário.
  const sortedActions = isSortable
    ? actions
    : sortActions(actions, orderBy, ascending);
  const renderedActions = sortedActions;
  useSelectionActions(renderedActions);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTopMask, setShowTopMask] = useState(false);
  const [showBottomMask, setShowBottomMask] = useState(false);

  // Check scroll positions
  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowTopMask(scrollTop > 5);
    setShowBottomMask(scrollTop + clientHeight < scrollHeight - 5);
  }, []);
  const handleScroll = () => {
    checkScroll();
  };

  // Sync scroll mask state on element size change
  useEffect(() => {
    if (!scrollable) {
      setShowTopMask(false);
      setShowBottomMask(false);
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    // Check initially
    checkScroll();

    // Observe size changes
    const observer = new ResizeObserver(() => {
      checkScroll();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [scrollable, checkScroll]);

  // Lógica de Gaps (Variantes)
  const gapClasses = useMemo(() => {
    const map = {
      block: "gap-2",
      content: "gap-x-4 gap-y-6",
    };
    return map[variant as keyof typeof map] ?? "gap-1";
  }, [variant]);

  // Lógica de Grid (Responsivo ou Automático)
  const gridClasses = useMemo(() => {
    return getGridClasses(columns);
  }, [columns]);
  const maskStyle = useMemo((): React.CSSProperties => {
    if (!scrollable) return {};
    if (showTopMask && showBottomMask) {
      return {
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)",
      };
    }
    if (showTopMask) {
      return {
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0px, black 24px, black 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0px, black 24px, black 100%)",
      };
    }
    if (showBottomMask) {
      return {
        WebkitMaskImage:
          "linear-gradient(to bottom, black 0px, black calc(100% - 24px), transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, black 0px, black calc(100% - 24px), transparent 100%)",
      };
    }
    return {};
  }, [scrollable, showTopMask, showBottomMask]);
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative transition-all duration-300",
        scrollable ? "h-full overflow-y-auto" : "",
        "p-1 pb-6",
      )}
      onScroll={handleScroll}
      style={maskStyle}
    >
      <div className={cn(gapClasses, gridClasses, "relative")}>
        {renderedActions.map((action) => (
          <ActionItem
            key={action.id}
            action={action}
            dateTimeDisplay={dateTimeDisplay}
            displayFlags={displayFlags}
            isDraggable={isDraggable}
            isSortable={isSortable}
            onClick={onClick}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}
