import { format } from "date-fns";
import { useState } from "react";
import { useMatches } from "react-router";
import { VARIANT } from "~/lib/CONSTANTS";
import { isAlmostLateAction, isLateAction } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { AppLoaderData } from "~/routes/app";

type ActionItemProps = {
  action: Action;
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  showLate?: boolean;
  className?: string;
  isDragging?: boolean;
};

export const ActionItem = ({
  action,
  variant,
  showLate,
  className,
  isDragging,
}: ActionItemProps) => {
  const { states } = useMatches()[1].loaderData as AppLoaderData;
  const currentState = states.find((state) => state.slug === action.state)!;
  const lateClasses = showLate
    ? isLateAction(action)
      ? "bg-error-background/50 text-error-foreground hover:bg-error-background"
      : isAlmostLateAction(action)
        ? "bg-warning-background/50 text-warning-foreground hover:bg-warning-background"
        : "bg-card hover:bg-card"
    : "bg-card hover:bg-card";

  const renderActionVariant = () => {
    switch (variant) {
      case VARIANT.block:
        return (
          <div className="flex flex-col gap-2">
            <ActionTitleInput title={action.title} />
            <div className="text-xs">{format(action.date, "dd/MM/yyyy")}</div>
          </div>
        );
      case VARIANT.line:
      default:
        return <ActionTitleInput title={action.title} />;
    }
  };

  return (
    <div
      className={cn(
        "group/action relative flex overflow-hidden rounded border-l-4 p-2 transition-colors",
        lateClasses,
        variant === VARIANT.block ? "flex-col gap-2" : "",
        className,
        isDragging ? "cursor-grabbing" : "",
      )}
      style={{ borderLeftColor: currentState.color }}
    >
      {renderActionVariant()}
    </div>
  );
};

const ActionTitleInput = ({
  title,
  isDragging,
}: {
  title: string;
  isDragging?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localTItle, setLocalTitle] = useState(title);

  return (
    <div className="flex overflow-hidden text-left text-sm">
      {isEditing ? (
        <input
          type="text"
          value={localTItle}
          onChange={(e) => setLocalTitle(e.target.value)}
          className={cn("outline-none")}
          onBlur={() => setIsEditing(false)}
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className={cn(
            "cursor-text overflow-hidden text-ellipsis whitespace-nowrap",
            isDragging ? "cursor-grabbing" : "",
          )}
        >
          {title}
        </button>
      )}
    </div>
  );
};
