import type { PRIORITY } from "~/lib/CONSTANTS";
import { INTENT } from "~/lib/CONSTANTS";
import { cn } from "cnfast";
import { Icons, isLateAction } from "~/lib/helpers";
import type { ActionVariantRendererProps } from "./types";
import { ActionItemTitleInput } from "../ActionItemTitleInput";
import { PhaseIcon } from "../PhaseIcon";
import { StationIcon } from "../StationIcon";
import {
  ActionItemDateTimeDisplay,
  ActionItemPartners,
  ActionItemPriority,
  ActionItemResponsibles,
  ActionItemSprint,
} from "../ActionItem";
import { AlertCircleIcon } from "lucide-react";
export function ActionLineVariant({
  action,
  currentPhase,
  currentStation,
  currentCategory,
  currentPartners,
  currentResponsibles,
  showCategory,
  showResponsibles,
  showPartner,
  showPriority,
  showStation,
  isEditing,
  handleSetIsEditing,
  dateTimeDisplay,
  handleAction,
}: ActionVariantRendererProps) {
  return (
    <div className="flex w-full items-center justify-between gap-2 overflow-x-hidden py-1">
      <div className="flex w-full items-center gap-2 overflow-hidden">
        <div className="flex items-center gap-2">
          {showStation && <StationIcon size="short" station={currentStation} />}
          {isLateAction(action) ? (
            <AlertCircleIcon className="size-4 text-late-foreground" />
          ) : (
            <PhaseIcon phase={currentPhase} size="dot" />
          )}
        </div>
        {isLateAction(action) && <ActionItemSprint action={action} />}
        <ActionItemTitleInput
          className="w-full lg:text-sm xl:text-base"
          isEditing={isEditing}
          onBlur={(title) => {
            handleAction({
              ...action,
              intent: INTENT.update_action,
              title,
            });
          }}
          setIsEditing={handleSetIsEditing}
          title={action.title}
        />
      </div>
      <div
        className={cn(
          "items-center gap-1",
          isEditing ? "hidden @md:flex" : "flex",
          dateTimeDisplay
            ? "transition duration-500 group-hover/action:-translate-x-3 group-hover/action:opacity-0"
            : "",
        )}
      >
        {(showPartner || currentPartners.length > 1) && (
          <ActionItemPartners action={action} partners={currentPartners} />
        )}
        {showResponsibles && (
          <ActionItemResponsibles
            action={action}
            responsibles={currentResponsibles}
            size="xs"
          />
        )}
        {showPriority && (
          <ActionItemPriority priority={action.priority as PRIORITY} />
        )}
        {showCategory && (
          <Icons
            className="size-4"
            color={currentCategory.color}
            slug={currentCategory.slug}
          />
        )}
      </div>
      {dateTimeDisplay && !isEditing && (
        <div className="absolute right-0 flex justify-end opacity-0 overflow-hidden transition duration-500 group-hover/action:opacity-100 group-hover/action:-translate-x-3 @md:w-22">
          <ActionItemDateTimeDisplay
            action={action}
            dateTimeDisplay={dateTimeDisplay}
          />
        </div>
      )}
    </div>
  );
}
