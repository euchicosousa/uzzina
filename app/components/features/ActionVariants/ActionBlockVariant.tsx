import { CalendarDaysIcon } from "lucide-react";
import type { ActionVariantRendererProps } from "./types";
import { ActionItemTitleInput } from "../ActionItemTitleInput";
import { PhaseIcon } from "../PhaseIcon";
import { INTENT, SIZE } from "~/lib/CONSTANTS";
import { getFormattedDateTime, Icons } from "~/lib/helpers";
import {
  ActionItemPartners,
  ActionItemResponsibles,
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
  lines,
  dateTimeDisplay,
  handleAction,
}: ActionVariantRendererProps) {
  return (
    <div className="flex flex-col gap-2 pb-2">
      <ActionItemTitleInput
        className="text-2xl leading-tight font-medium pb-2"
        isEditing={isEditing}
        lines={lines}
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

      <div className="flex items-center justify-between overflow-hidden gap-4">
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

        <div className="flex items-center shrink-0 gap-2 text-xs opacity-50">
          <CalendarDaysIcon className="size-3 opacity-50" />
          <div className="font-medium">
            {getFormattedDateTime(action.date, dateTimeDisplay)}
          </div>
        </div>
      </div>
    </div>
  );
}
