import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DATE_TIME_DISPLAY, ORDER_BY } from "~/lib/CONSTANTS";
import { VARIANT } from "~/lib/CONSTANTS";
import { sortActions } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import { getGridClasses } from "~/lib/uzzina-utils";
import type { Action } from "~/models/actions.server";
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
  isScroll?: boolean;
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
  isScroll,
  isDraggable,
  onClick,
}: ActionContainerProps) {
  actions = sortActions(actions, orderBy, ascending);
  const [showMoreOverride, setShowMoreOverride] = useState<boolean | null>(
    null,
  );
  const showMore = showMoreOverride !== null ? showMoreOverride : isCompact;

  // Lógica de Gaps (Variantes)
  const gapClasses = useMemo(() => {
    const map = {
      block: "gap-2",
      content: "gap-x-4 gap-y-6",
    };

    // Dizemos que 'variant' deve ser tratada como uma chave do 'map'
    return map[variant as keyof typeof map] ?? "gap-1";
  }, [variant]);

  // Lógica de Grid (Responsivo ou Automático)
  const gridClasses = useMemo(() => {
    return getGridClasses(columns); // Aquela função que criamos antes
  }, [columns]);
  return (
    <div
      className={cn(
        "relative",
        isScroll ? "h-full overflow-y-auto" : "",
        "p-0.5 pb-6",
      )}
    >
      <div className={cn(gapClasses, gridClasses, "relative")}>
        {(showMore ? actions.slice(0, MAX_ACTIONS) : actions).map((action) => (
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
        {isCompact && actions.length > MAX_ACTIONS && (
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
      {isScroll && (
        <div className="sticky right-0 -bottom-6 left-0 h-6 bg-linear-to-t from-background"></div>
      )}
    </div>
  );
}
