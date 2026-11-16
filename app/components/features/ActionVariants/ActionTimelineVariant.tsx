import { INTENT } from "~/lib/CONSTANTS";
import { ActionItemTitleInput } from "../ActionItemTitleInput";
import type { ActionVariantRendererProps } from "./types";

export function ActionTimelineVariant({
  action,
  isEditing,
  handleSetIsEditing,
  handleAction,
}: ActionVariantRendererProps) {
  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <ActionItemTitleInput
        className="w-full text-xs leading-tight font-medium"
        isEditing={isEditing}
        multiline
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
    </div>
  );
}
