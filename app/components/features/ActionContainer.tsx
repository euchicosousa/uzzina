import { VARIANT, type DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import { ActionItem } from "./ActionItem";
import { cn } from "~/lib/utils";

type ActionContainerProps = {
  actions: Action[];
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  columns?: 1 | 2 | 3 | 4 | 6;
  showLate?: boolean;
  showPartner?: boolean;
  showCategory?: boolean;
  showResponsibles?: boolean;
  showPriority?: boolean;
  showDivider?: boolean;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
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
  dateTimeDisplay,
}: ActionContainerProps) => {
  const columnsClasses =
    columns === 2
      ? cn(
          `grid grid-cols-2`,
          [VARIANT.block, VARIANT.content].find((v) => v === variant)
            ? "gap-2"
            : "",
          showDivider ? "divide-y" : "",
        )
      : columns === 3
        ? cn(
            `grid grid-cols-2 sm:grid-cols-3`,
            [VARIANT.block, VARIANT.content].find((v) => v === variant)
              ? "gap-2"
              : "",
            showDivider ? "divide-y" : "",
          )
        : columns === 4
          ? `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${[VARIANT.block, VARIANT.content].find((v) => v === variant) ? "gap-2" : "divide-y"}`
          : columns === 6
            ? `grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] ${[VARIANT.block, VARIANT.content].find((v) => v === variant) ? "gap-2" : "divide-y"}`
            : `flex flex-col ${showDivider ? "divide-y" : ""}`;

  return (
    <div className={cn(columnsClasses)}>
      {actions.map((action) => (
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
        />
      ))}
    </div>
  );
};
