import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  COLUMNS,
  ORDER_BY,
  VARIANT,
  type DATE_TIME_DISPLAY,
} from "~/lib/CONSTANTS";
import { sortActions } from "~/lib/helpers";
import { cn, getGridClasses } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import { ActionItem } from "./ActionItem";

type ActionContainerProps = {
  actions: Action[];
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  columns?: (typeof COLUMNS)[keyof typeof COLUMNS];
  showLate?: boolean;
  showPartner?: boolean;
  showCategory?: boolean;
  showResponsibles?: boolean;
  showPriority?: boolean;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  orderBy?: (typeof ORDER_BY)[keyof typeof ORDER_BY];
  ascending?: boolean;
  isCompact?: boolean;
  isScroll?: boolean;
  isInstagramDate?: boolean;
  isDraggable?: boolean;
  onClick?: (action: Action) => void;
};

export function ActionContainer({
  actions,
  variant = VARIANT.line,
  columns = 1,
  showLate = false,
  showPartner,
  showCategory,
  showResponsibles,
  showPriority,
  dateTimeDisplay,
  orderBy,
  ascending,
  isCompact,
  isScroll,
  isInstagramDate,
  isDraggable,
  onClick,
}: ActionContainerProps) {
  actions = sortActions(actions, orderBy, ascending);
  const [showMore, setShowMore] = useState(isCompact);

  const gapAndDividerClasses = `${[VARIANT.block].find((v) => v === variant) ? "gap-2" : [VARIANT.content].find((v) => v === variant) ? "gap-x-4 gap-y-6" : "gap-px"}`;

  useEffect(() => {
    setShowMore(isCompact);
  }, [isCompact]);

  return (
    <div className={cn(isScroll ? "h-full overflow-y-auto" : "", "p-0.5")}>
      <div
        className={cn(
          getGridClasses(columns),
          gapAndDividerClasses,
          "relative",
        )}
      >
        {/* <pre>{JSON.stringify(showMore, null, 2)}</pre> */}
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
            isInstagramDate={isInstagramDate}
            isDraggable={isDraggable}
            onClick={onClick}
          />
        ))}
        {isCompact && actions.length > 6 && (
          <button
            className="bg-background absolute -bottom-3 left-1/2 grid size-6 -translate-x-1/2 cursor-pointer place-content-center rounded-full border"
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
    </div>
  );
}
