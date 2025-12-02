import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ORDER_BY, VARIANT, type DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import { sortActions } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import { ActionItem } from "./ActionItem";

type ActionContainerProps = {
  actions: Action[];
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  showLate?: boolean;
  showPartner?: boolean;
  showCategory?: boolean;
  showResponsibles?: boolean;
  showPriority?: boolean;
  showDivider?: boolean;
  showSprint?: boolean;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  orderBy?: (typeof ORDER_BY)[keyof typeof ORDER_BY];
  ascending?: boolean;
  isCompact?: boolean;
  isScroll?: boolean;
  isInstagramDate?: boolean;
  isDraggable?: boolean;
};

export const ActionContainer = ({
  actions,
  variant = VARIANT.line,
  columns = 1,
  showLate = false,
  showPartner,
  showCategory,
  showResponsibles,
  showPriority,
  showDivider,
  showSprint,
  dateTimeDisplay,
  orderBy,
  ascending,
  isCompact,
  isScroll,
  isInstagramDate,
  isDraggable,
}: ActionContainerProps) => {
  const columnsClasses =
    columns === 1
      ? `flex flex-col divide-y`
      : [2, 3, 4, 5, 6].find((c) => c === columns)
        ? `grid grid-cols-2 ${columns >= 3 ? "sm:grid-cols-3" : ""} ${columns >= 4 ? "md:grid-cols-4" : ""} ${columns === 5 ? "lg:grid-cols-5" : "lg:grid-cols-6"} gap-2`
        : `grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] ${[VARIANT.block].find((v) => v === variant) ? "gap-2" : [VARIANT.content].find((v) => v === variant) ? "gap-x-4 gap-y-6" : "gap-1"}`;
  actions = sortActions(actions, orderBy, ascending);
  const [showMore, setShowMore] = useState(isCompact);

  useEffect(() => {
    setShowMore(isCompact);
  }, [isCompact]);

  return (
    <div className={cn(isScroll ? "h-full overflow-y-auto" : "")}>
      <div className={cn(columnsClasses, "relative")}>
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
            showSprint={showSprint}
            dateTimeDisplay={dateTimeDisplay}
            isInstagramDate={isInstagramDate}
            isDraggable={isDraggable}
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
};
