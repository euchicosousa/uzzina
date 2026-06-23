import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ORDER_BY, DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import { VARIANT } from "~/lib/CONSTANTS";
import { sortActions } from "~/lib/helpers";
import { cn, getGridClasses } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import { ActionItem } from "./ActionItem";

type ActionContainerProps = {
  actions: Action[];
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  showLate?: boolean;
  showSprint?: boolean;
  showPartner?: boolean;
  showCategory?: boolean;
  showResponsibles?: boolean;
  showPriority?: boolean;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  orderBy?: (typeof ORDER_BY)[keyof typeof ORDER_BY];
  ascending?: boolean;
  isCompact?: boolean;
  isScroll?: boolean;
  isDraggable?: boolean;
  onClick?: (action: Action) => void;
};

export function ActionContainer({
  actions,
  variant = VARIANT.line,
  columns = 1,
  showLate = false,
  showSprint,
  showPartner,
  showCategory,
  showResponsibles,
  showPriority,
  dateTimeDisplay,
  orderBy,
  ascending,
  isCompact,
  isScroll,
  isDraggable,
  onClick,
}: ActionContainerProps) {
  actions = sortActions(actions, orderBy, ascending);
  const [showMore, setShowMore] = useState(isCompact);

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

  useEffect(() => {
    setShowMore(isCompact);
  }, [isCompact]);

  return (
    <div
      className={cn(
        "relative",
        isScroll ? "h-full overflow-y-auto" : "",
        "p-0.5 pb-6",
      )}
    >
      <div className={cn(gapClasses, gridClasses, "relative")}>
        {(showMore ? actions.slice(0, 6) : actions).map((action) => (
          <ActionItem
            action={action}
            key={action.id}
            variant={variant}
            showLate={showLate}
            showPartner={showPartner}
            showCategory={showCategory}
            showResponsibles={showResponsibles}
            showPriority={showPriority}
            dateTimeDisplay={dateTimeDisplay}
            isDraggable={isDraggable}
            onClick={onClick}
            showSprint={showSprint}
          />
        ))}
        {isCompact && actions.length > 6 && (
          <button
            className="absolute -bottom-3 left-1/2 grid size-6 -translate-x-1/2 cursor-pointer place-content-center rounded-full border bg-background"
            onClick={() => {
              setShowMore(!showMore);
            }}
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
