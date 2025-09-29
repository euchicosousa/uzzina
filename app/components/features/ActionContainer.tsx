import type { VARIANT } from "~/lib/CONSTANTS";
import { ActionItem } from "./ActionItem";
import { cn } from "~/lib/utils";

type ActionContainerProps = {
  actions: Action[];
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  columns?: 1 | 2 | 3 | 4 | 6;
};

export const ActionContainer = ({
  actions,
  variant,
  columns = 1,
}: ActionContainerProps) => {
  const columnsClasses =
    columns === 2
      ? "grid grid-cols-2 gap-2"
      : columns === 3
        ? "grid grid-cols-2 sm:grid-cols-3 gap-2"
        : columns === 4
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
          : columns === 6
            ? "grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2"
            : "flex flex-col gap-1";

  return (
    <div className={cn("", columnsClasses)}>
      {actions.map((action) => (
        <ActionItem action={action} key={action.id} variant={variant} />
      ))}
    </div>
  );
};
