import { CalendarDaysIcon } from "lucide-react";
import type { ActionVariantRendererProps } from "./types";
import { ActionItemTitleInput } from "../ActionItemTitleInput";
import { UPhaseIcon } from "~/components/uzzina/UPhaseIcon";
import { INTENT, SIZE } from "~/lib/CONSTANTS";
import { getFormattedDateTime, UIcons } from "~/utils";
import {
  ActionItemPartners,
  ActionItemResponsibles,
  ActionItemSprint,
} from "../ActionItem";

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
  dateTimeDisplay,
  handleAction,
}: ActionVariantRendererProps) {
  return (
    <div className="flex flex-col gap-2 pb-2">
      <ActionItemTitleInput
        className="pb-2 text-2xl leading-tight font-medium"
        isEditing={isEditing}
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
          <ActionItemSprint action={action} />
          {showPartner && (
            <ActionItemPartners
              action={action}
              partners={currentPartners}
              size="xs"
            />
          )}

          {showCategory && (
            <UIcons
              className="vivid-ink size-4 shrink-0"
              color={currentCategory.color}
              slug={currentCategory.slug}
            />
          )}

          <UPhaseIcon phase={currentPhase} size="sm" />

          {showResponsibles && (
            <ActionItemResponsibles
              action={action}
              responsibles={currentResponsibles}
              size={SIZE.xs}
            />
          )}
        </div>

        <div className="action-date flex shrink-0 items-center gap-2 text-xs opacity-50">
          <CalendarDaysIcon className="size-3" />
          <div className="font-medium">
            {getFormattedDateTime(action.date, dateTimeDisplay)}
          </div>
        </div>
      </div>
    </div>
  );
}
