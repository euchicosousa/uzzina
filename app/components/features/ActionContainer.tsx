import type { Action } from "~/types";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import type { DATE_TIME_DISPLAY, ORDER_BY } from "~/lib/CONSTANTS";
import { VARIANT } from "~/lib/CONSTANTS";
import { sortActions } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import { getGridClasses } from "~/lib/uzzina-utils";
import { ActionItem, type ActionDisplayFlags } from "./ActionItem";

type ActionContainerProps = {
  actions: Action[];
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  displayFlags?: ActionDisplayFlags;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  orderBy?: (typeof ORDER_BY)[keyof typeof ORDER_BY];
  ascending?: boolean;
  isCompact?: boolean;
  isDraggable?: boolean;
  onClick?: (action: Action) => void;
};

const DEFAULT_DISPLAY_FLAGS: ActionDisplayFlags = {};
const MAX_ACTIONS = 5;

export function ActionContainer({
  actions,
  variant = VARIANT.line,
  columns = 1,
  displayFlags = DEFAULT_DISPLAY_FLAGS,
  dateTimeDisplay,
  orderBy,
  ascending,
  isCompact,
  isDraggable,
  onClick,
}: ActionContainerProps) {
  const sortedActions = sortActions(actions, orderBy, ascending);
  const [showMoreOverride, setShowMoreOverride] = useState<boolean | null>(
    null,
  );
  const showMore = showMoreOverride !== null ? showMoreOverride : isCompact;

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
    if (isCompact) {
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
  }, [isCompact, checkScroll]);

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
    if (isCompact) return {};

    if (showTopMask && showBottomMask) {
      return {
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)",
        maskImage: "linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)",
      };
    }
    if (showTopMask) {
      return {
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 24px, black 100%)",
        maskImage: "linear-gradient(to bottom, transparent 0px, black 24px, black 100%)",
      };
    }
    if (showBottomMask) {
      return {
        WebkitMaskImage: "linear-gradient(to bottom, black 0px, black calc(100% - 24px), transparent 100%)",
        maskImage: "linear-gradient(to bottom, black 0px, black calc(100% - 24px), transparent 100%)",
      };
    }
    return {};
  }, [isCompact, showTopMask, showBottomMask]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={maskStyle}
      className={cn(
        "relative transition-all duration-300",
        !isCompact ? "h-full overflow-y-auto" : "",
        "p-0.5 pb-6",
      )}
    >
      <div className={cn(gapClasses, gridClasses, "relative")}>
        {(showMore ? sortedActions.slice(0, MAX_ACTIONS) : sortedActions).map((action) => (
          <ActionItem
            key={action.id}
            action={action}
            dateTimeDisplay={dateTimeDisplay}
            displayFlags={displayFlags}
            isDraggable={isDraggable}
            onClick={onClick}
            variant={variant}
          />
        ))}
        {isCompact && sortedActions.length > MAX_ACTIONS && (
          <button
            className="absolute -bottom-3 left-1/2 grid size-6 -translate-x-1/2 cursor-pointer place-content-center rounded-full border bg-muted z-20 shadow-xs hover:shadow-lg hover:bg-card transition-all"
            onClick={() => {
              setShowMoreOverride(!showMore);
            }}
            type="button"
          >
            {showMore ? (
              <ChevronDownIcon className="size-4" />
            ) : (
              <ChevronUpIcon className="size-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
