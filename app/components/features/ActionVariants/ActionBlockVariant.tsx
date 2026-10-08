import { CalendarDaysIcon } from "lucide-react";
import type { ActionVariantRendererProps } from "./types";
import { ActionItemTitleInput } from "../ActionItemTitleInput";
import { PhaseIcon } from "../PhaseIcon";
import { INTENT, SIZE } from "~/lib/CONSTANTS";
import { getFormattedDateTime, Icons } from "~/utils";
import { ActionItemPartners, ActionItemResponsibles } from "../ActionItem";

export function ActionBlockVariant({
  action,
  currentPhase,
  currentCategory,
  currentPartners,
  currentResponsibles,
  showCategory,
  showResponsibles,
  showPartner,
  isEditing,
  handleSetIsEditing,
  lines,
  dateTimeDisplay,
  handleAction,
}: ActionVariantRendererProps) {
  return (
    <div className="flex flex-col gap-2 pb-2">
      <ActionItemTitleInput
        className="pb-2 text-2xl leading-tight font-medium"
        isEditing={isEditing}
        lines={lines}
        onBlur={(title) => {
          handleAction({
            intent: INTENT.update_action,
            id: action.id,
            expectedUpdatedAt: action.updated_at,
            title,
          });
        }}
        setIsEditing={handleSetIsEditing}
        title={action.title}
      />

      <div className="flex items-center justify-between gap-4 overflow-hidden">
        <div className="flex items-center gap-2 overflow-hidden">
          {showPartner && (
            <ActionItemPartners
              action={action}
              partners={currentPartners}
              size="xs"
            />
          )}

          {showCategory && (
            <Icons
              className="size-4 shrink-0"
              color={currentCategory.color}
              slug={currentCategory.slug}
            />
          )}

          <PhaseIcon phase={currentPhase} size="sm" />

          {showResponsibles && (
            <ActionItemResponsibles
              action={action}
              responsibles={currentResponsibles}
              size={SIZE.xs}
            />
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 text-xs opacity-50">
          <CalendarDaysIcon className="size-3 opacity-50" />
          <div className="font-medium">
            {getFormattedDateTime(action.date, dateTimeDisplay)}
          </div>
        </div>
      </div>
    </div>
  );
}
