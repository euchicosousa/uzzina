import { format } from "date-fns";
import { useState } from "react";
import { useMatches } from "react-router";
import { VARIANT } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import type { AppLoaderData } from "~/routes/app";

type ActionItemProps = {
  action: Action;
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
};

export const ActionItem = ({ action, variant }: ActionItemProps) => {
  const { states } = useMatches()[1].loaderData as AppLoaderData;
  const currentState = states.find((state) => state.slug === action.state)!;

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
      className={cn("bg-card flex overflow-hidden rounded border-l-4 p-2")}
      style={{ borderLeftColor: currentState.color }}
    >
      {renderActionVariant()}
    </div>
  );
};

const ActionTitleInput = ({ title }: { title: string }) => {
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
          className="overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {title}
        </button>
      )}
    </div>
  );
};
