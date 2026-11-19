import { useMemo, useState } from "react";
import { useAppContext } from "~/contexts/AppContext";
import type { Action } from "~/types";

// UI Components
import { PrismCheckbox } from "~/components/prism";
import { ActionItemPartners } from "./ActionItemDetails";
import { ActionBlockVariant } from "./ActionVariants/ActionBlockVariant";
import { ActionContentVariant } from "./ActionVariants/ActionContentVariant";
import { ActionLineVariant } from "./ActionVariants/ActionLineVariant";
import { ActionTimelineVariant } from "./ActionVariants/ActionTimelineVariant";
import type { ActionVariantRendererProps } from "./ActionVariants/types";
import { Draggable } from "./DnD";
import { UPhaseIcon } from "~/components/uzzina/UPhaseIcon";

// Hooks
import { useActionData } from "~/hooks/useActionData";
import { useActionShortcutContext } from "~/hooks/useActionShortcut";
import { useMultiSelection } from "~/hooks/useMultiSelection";

// Constants & Helpers
import { cn } from "cnfast";
import { getUserPreferences } from "~/lib/preferences";
import { useActionMutations } from "~/hooks/useActionMutations";
import { useIsLateAction } from "~/hooks/useIsLateAction";
import { SIZE, VARIANT, type DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import {
  getFormattedPartnersName,
  isSocialMediaContent,
  isSprint,
} from "~/utils";

export type ActionDisplayFlags = {
  /** Whether to highlight the action if it is late */
  showLate?: boolean;
  /** Whether to highlight the action if it is a sprint */
  showSprint?: boolean;
  /** Whether to show the associated partner information */
  showPartner?: boolean;
  /** Whether to show the category icon */
  showCategory?: boolean;
  /** Whether to show the avatar group of responsible users */
  showResponsibles?: boolean;
  /** Whether to show the priority icon indicator */
  showPriority?: boolean;
};

/**
 * Props for the ActionItem component.
 */
type ActionItemProps = {
  /** The action object to render */
  action: Action;
  /** The layout variant of the action item */
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  /** Additional CSS class names to apply to the wrapper */
  className?: string;
  /** Whether the item is currently being dragged */
  isDragging?: boolean;
  /** Whether the item is draggable */
  isDraggable?: boolean;
  /** Configuration object for showing various details/badges */
  displayFlags?: ActionDisplayFlags;
  /** Format pattern for displaying dates and times */
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  /** Optional click handler override */
  onClick?: (action: Action) => void;
};

/**
 * ActionItem Component
 *
 * Renders a single Action card/item in various layouts (line, block, content, timeline).
 * Integrates drag-and-drop capability, selection mode, inline title editing, and action shortcuts.
 */
const DEFAULT_DISPLAY_FLAGS: ActionDisplayFlags = {};
export function ActionItem({
  action,
  variant = VARIANT.line,
  className,
  isDragging,
  isDraggable,
  displayFlags = DEFAULT_DISPLAY_FLAGS,
  dateTimeDisplay,
  onClick,
}: ActionItemProps) {
  const {
    showLate = false,
    showSprint = true,
    showPartner = false,
    showCategory = false,
    showResponsibles = false,
    showPriority = false,
  } = displayFlags;
  const { person, setPrimaryAction } = useAppContext();
  // Phase color is one account-wide preference (DS19): off, soft tint or vivid fill
  const rawPreferences = person?.preferences;
  const showPhaseColor = useMemo(
    () => getUserPreferences({ preferences: rawPreferences }).phaseColor,
    [rawPreferences],
  );
  const {
    currentPhase,
    currentPartners,
    currentResponsibles,
    currentCategory,
  } = useActionData(action);

  const { isSelectionMode, selectedIds, toggleSelection } = useMultiSelection();
  const isSelected = selectedIds.includes(action.id);
  const { handleAction } = useActionMutations();
  // Line variant shows the late icon regardless of showLate, so always watch
  const isLate = useIsLateAction(action);
  const { setEditingId } = useActionShortcutContext();
  const [isEditing, setIsEditing] = useState(false);

  const handleSetIsEditing = (value: boolean) => {
    setEditingId(value ? action.id : null);
    setIsEditing(value);
  };

  // Fallback variant check: non-social content cannot use social content preview layout
  variant =
    !isSocialMediaContent(action.category) && variant === VARIANT.content
      ? VARIANT.line
      : variant;
  const variantClasses = useMemo(() => {
    switch (variant) {
      case VARIANT.content:
        return "flex-col gap-2";
      case VARIANT.block:
        return "flex-col gap-2 px-4 py-3";
      case VARIANT.timeline:
        return "flex min-h-7 items-center rounded-xl px-[min(8px,10%)] py-1";
      // case VARIANT.line:
      default:
        return "rounded-xl px-3 py-1 @xs:p-1";
    }
  }, [variant]);
  const bgClasses = useMemo(() => {
    let baseStyles = `
    text-foreground
    bg-action
    transition-[color,background-color,border-color,box-shadow,padding]
    duration-500
    motion-reduce:transition-none
    shadow-action
    border-t
    border-action-top-border
    z-0
    ring ring-action-ring
    focus-within:outline-2
    focus-within:outline-primary
    hover:z-10
    hover:shadow-action-hover
    hover:bg-action-hover
    `;

    // 1. Determine base background/text colors based on priority states
    const isLateShown = showLate && isLate;
    if (isLateShown) {
      baseStyles = cn(
        baseStyles,
        "late-surface bg-error-background/70 text-error-foreground hover:bg-error-background ring ring-error",
      );
    }
    // Sprint keeps its thicker ring; a late action keeps it red.
    if (showSprint && person && isSprint(action, person)) {
      baseStyles = cn(
        baseStyles,
        isLateShown ? "ring-2 ring-error" : "ring-2 ring-primary",
      );
    }

    // 2. Editing raises the card; focus styling comes from focus-within above
    if (isEditing) {
      baseStyles = cn(baseStyles, "z-100");
    }
    return baseStyles;
  }, [isEditing, showLate, isLate, action, person, showSprint]);
  const effectivePhaseColor =
    variant === VARIANT.timeline
      ? showPhaseColor === "vivid"
        ? "vivid"
        : "soft"
      : showPhaseColor;
  // Late keeps its own background; an unknown legacy phase keeps the default.
  const phaseColor =
    effectivePhaseColor !== "off" && !(showLate && isLate)
      ? currentPhase?.color
      : undefined;
  const content = (
    <div
      className={cn(
        "group/action @container relative shrink-0 cursor-pointer overflow-hidden rounded-2xl squircle",
        variantClasses,
        bgClasses,
        phaseColor &&
          (effectivePhaseColor === "vivid" ? "phase-vivid" : "phase-surface"),
        className,
        isDragging && "cursor-grabbing",
        isSelectionMode && variant !== VARIANT.content && "pl-8",
        isSelectionMode && isSelected && "ring-2 ring-primary",
      )}
      data-action-id={action.id}
      style={
        phaseColor
          ? ({ "--phase-color": phaseColor } as React.CSSProperties)
          : undefined
      }
      onClick={(e) => {
        if (isSelectionMode) {
          e.preventDefault();
          e.stopPropagation();
          toggleSelection(action.id);
          return;
        }
        if (!isEditing) {
          if (onClick) {
            onClick(action);
          } else if (setPrimaryAction) {
            setPrimaryAction(action);
          }
        }
      }}
      onKeyDown={(e) => {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement).isContentEditable
        ) {
          return;
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (isSelectionMode) {
            toggleSelection(action.id);
            return;
          }
          if (!isEditing) {
            if (onClick) {
              onClick(action);
            } else if (setPrimaryAction) {
              setPrimaryAction(action);
            }
          }
        }
      }}
      role="button"
      aria-pressed={isSelectionMode ? isSelected : undefined}
      tabIndex={0}
      aria-label={variant === VARIANT.timeline ? action.title : undefined}
      title={
        variant === VARIANT.timeline
          ? undefined
          : `${action.title} • ${getFormattedPartnersName(currentPartners)}`
      }
    >
      {isSelectionMode && (
        <div
          aria-hidden="true"
          inert
          className={cn(
            "absolute z-20 flex items-center justify-center transition-all",
            variant !== VARIANT.content
              ? "top-1/2 left-2.5 -translate-y-1/2"
              : isSelected
                ? "top-3 left-3"
                : showLate && isLate
                  ? "top-2 left-2"
                  : "top-3 left-3",
          )}
        >
          <PrismCheckbox
            boxClassName={isSelected ? undefined : "bg-background"}
            className="pointer-events-none"
            isReadOnly
            isSelected={isSelected}
            size="sm"
          />
        </div>
      )}
      {variant === VARIANT.content && (
        <div className={cn("flex items-center gap-2 overflow-hidden p-2")}>
          <ActionItemPartners
            action={action}
            partners={currentPartners}
            size={SIZE.sm}
          />
          <div className="w-full overflow-hidden text-xs leading-none font-medium text-ellipsis whitespace-nowrap">
            {getFormattedPartnersName(currentPartners || [])}
          </div>
          <UPhaseIcon phase={currentPhase} />
          {/* <PhaseStationIcon phase={currentPhase} station={currentStation} /> */}
        </div>
      )}

      <ActionVariantRenderer
        action={action}
        currentCategory={currentCategory}
        currentPartners={currentPartners}
        currentPhase={currentPhase}
        currentResponsibles={currentResponsibles}
        dateTimeDisplay={dateTimeDisplay}
        handleAction={handleAction}
        handleSetIsEditing={handleSetIsEditing}
        isEditing={isEditing}
        showCategory={showCategory}
        showPartner={showPartner}
        showPriority={showPriority}
        showResponsibles={showResponsibles}
        variant={variant}
      />
    </div>
  );
  return isDraggable ? (
    <Draggable id={action.id}>{content}</Draggable>
  ) : (
    content
  );
}

function ActionVariantRenderer(props: ActionVariantRendererProps) {
  switch (props.variant) {
    case VARIANT.content:
      return <ActionContentVariant {...props} />;
    case VARIANT.block:
      return <ActionBlockVariant {...props} />;
    case VARIANT.timeline:
      return <ActionTimelineVariant {...props} />;
    default:
      return <ActionLineVariant {...props} />;
  }
}
