import { format } from "date-fns";
import { useState } from "react";
import { useMatches } from "react-router";
import { DATE_TIME_DISPLAY, SIZE, VARIANT } from "~/lib/CONSTANTS";
import {
  getFormattedDate,
  isAlmostLateAction,
  isLateAction,
} from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { AppLoaderData } from "~/routes/app";
import { UAvatarGroup } from "../uzzina/UAvatar";
import { UBadge } from "../uzzina/UBadge";

type ActionItemProps = {
  action: Action;
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  className?: string;
  isDragging?: boolean;
  showLate?: boolean;
  showPartner?: boolean;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
};

export const ActionItem = ({
  action,
  variant,
  showLate,
  className,
  isDragging,
  showPartner = true,
  dateTimeDisplay,
}: ActionItemProps) => {
  const { states, partners, categories, priorities } = useMatches()[1]
    .loaderData as AppLoaderData;

  const [isEditing, setIsEditing] = useState(false);

  const currentState = states.find((state) => state.slug === action.state)!;
  const currentPartners = action.partners.map((partner) => {
    return partners.find((p) => p.slug === partner)!;
  });
  const currentCategory = categories.find(
    (category) => category.slug === action.category,
  )!;
  const currentPriority = priorities.find(
    (priority) => priority.slug === action.priority,
  );

  const bgClasses = isEditing
    ? "bg-input ring-foreground focus-within:ring-2 ring-offset-2 ring-offset-background"
    : showLate
      ? isLateAction(action)
        ? "bg-error-background/50 border-error/50 text-error hover:bg-error-background"
        : isAlmostLateAction(action)
          ? "bg-warning-background/50 text-warning hover:bg-warning-background border-warning/50"
          : "bg-card hover:bg-card/50"
      : "bg-card hover:bg-card/50";

  const renderActionVariant = () => {
    switch (variant) {
      case VARIANT.block:
        return (
          <div className="flex flex-col gap-2">
            <ActionTitleInput
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              title={action.title}
            />
            <div className="text-xs">
              {getFormattedDate(action.date, dateTimeDisplay)}
            </div>
          </div>
        );
      case VARIANT.line:
      default:
        return (
          <div className="flex w-full items-center justify-between gap-4 overflow-hidden">
            <ActionTitleInput
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              title={action.title}
            />

            <div
              className={cn(
                "items-center gap-2",
                isEditing ? "hidden @md:flex" : "flex",
              )}
            >
              {/* Categoria */}
              <UBadge
                text={currentCategory.title}
                size="sm"
                style={{
                  backgroundColor: currentCategory.color,
                  color: "white",
                  border: "none",
                }}
              />
              {/* Responsáveis */}

              {/* Parceiro */}
              {showPartner && (
                <UAvatarGroup
                  size={SIZE.xs}
                  avatars={currentPartners.map((partner) => ({
                    id: `${action.id}-${partner.id}`,
                    fallback: partner.short,
                    backgroundColor: partner.colors[0],
                    color: partner.colors[1],
                  }))}
                />
              )}
              {/* Data */}
              <div className="text-xs whitespace-nowrap opacity-50">
                {getFormattedDate(action.date, dateTimeDisplay)}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "group/action border-card @container relative flex overflow-hidden rounded border border-l-4 p-2 transition-colors",
        bgClasses,
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
  isEditing,
  setIsEditing,
}: {
  title: string;
  isDragging?: boolean;
  isEditing?: boolean;
  setIsEditing: (value: boolean) => void;
}) => {
  const [localTItle, setLocalTitle] = useState(title);

  return (
    <div className="flex overflow-hidden text-left text-sm">
      {isEditing ? (
        <input
          autoFocus
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
