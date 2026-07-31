import { CalendarDaysIcon, SignalIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "~/contexts/AppContext";
import type { Action, Partner, Person } from "~/types";

// UI Components
import { PrismCheckbox } from "~/components/prism";
import { UAvatarGroup } from "../uzzina/UAvatar";
import { ActionItemTitleInput } from "./ActionItemTitleInput";
import { ActionBlockVariant } from "./ActionVariants/ActionBlockVariant";
import { ActionContentVariant } from "./ActionVariants/ActionContentVariant";
import { ActionLineVariant } from "./ActionVariants/ActionLineVariant";
import type { ActionVariantRendererProps } from "./ActionVariants/types";
import { Content } from "./Content";
import { Draggable } from "./DnD";
import { PhaseIcon } from "./PhaseIcon";
import { StationIcon } from "./StationIcon";

// Hooks
import { useActionShortcutContext } from "~/hooks/useActionShortcut";
import { useMultiSelection } from "~/hooks/useMultiSelection";

// Constants & Helpers
import { useQuery } from "@tanstack/react-query";
import { cn } from "cnfast";
import { useActionMutations } from "~/hooks/useActionMutations";
import {
  CATEGORIES,
  INTENT,
  PHASES,
  PRIORITIES,
  SIZE,
  STATIONS,
  VARIANT,
  type DATE_TIME_DISPLAY,
  type CATEGORY,
  type CATEGORY_TYPE,
  type PHASE,
  type PHASE_TYPE,
  type PRIORITY,
  type STATION_TYPE,
} from "~/lib/CONSTANTS";
import {
  getFormattedDateTime,
  getFormattedPartnersName,
  Icons,
  isInstagramFeed,
  isLateAction,
  isSprint,
} from "~/lib/helpers";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import { PhaseStationIcon } from "./PhaseStationIcon";
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
  showStation?: boolean;
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
  /** Whether to wrap the item with a hover card detailing the action */
  /** Max lines for the title layout in certain variants */
  lines?: 1 | 2;
};

/**
 * ActionItem Component
 *
 * Renders a single Action card/item in various layouts (line, block, hour, content, hair).
 * Integrates drag-and-drop capability, selection mode, inline title editing, and action shortcuts.
 */
const DEFAULT_DISPLAY_FLAGS: ActionDisplayFlags = {};
const _DEFAULT_PARTNERS: Partner[] = [];
const DEFAULT_PEOPLE: Person[] = [];
export function ActionItem({
  action,
  variant = VARIANT.line,
  className,
  isDragging,
  isDraggable,
  displayFlags = DEFAULT_DISPLAY_FLAGS,
  dateTimeDisplay,
  onClick,
  lines = 1,
}: ActionItemProps) {
  const {
    showLate = false,
    showSprint = true,
    showPartner = false,
    showCategory = false,
    showResponsibles = false,
    showPriority = false,
  } = displayFlags;
  const { partners, person } = useAppContext();
  const { data: people = DEFAULT_PEOPLE } = useQuery({
    queryKey: QUERY_KEYS.people(),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });
  const { isSelectionMode, selectedIds, toggleSelection } = useMultiSelection();
  const isSelected = selectedIds.includes(action.id);
  const { handleAction } = useActionMutations();
  const { registerAction, unregisterAction, setEditingId } =
    useActionShortcutContext();
  const [isEditing, setIsEditing] = useState(false);

  // Register the action in the global shortcut registry on mount/update
  useEffect(() => {
    registerAction(action.id, {
      action,
    });
    return () => unregisterAction(action.id);
  }, [action, registerAction, unregisterAction]);
  const handleSetIsEditing = (value: boolean) => {
    setEditingId(value ? action.id : null);
    setIsEditing(value);
  };
  const { setBaseAction } = useAppContext();
  const currentPhase = useMemo(
    () => PHASES[(action.phase as PHASE) || "idea"],
    [action.phase],
  );
  const currentStation = useMemo(
    () =>
      (action.station
        ? (STATIONS[action.station as keyof typeof STATIONS] ?? null)
        : null) as STATION_TYPE | null,
    [action.station],
  );
  const currentPartners = useMemo(
    () =>
      action.partners
        .map((partner) => partners.find((p: Partner) => p.slug === partner))
        .filter((p): p is Partner => p !== undefined),
    [action.partners, partners],
  );
  const currentResponsibles = useMemo(
    () =>
      action.responsibles
        .map((person) => people.find((p: Person) => p.user_id === person))
        .filter((r) => r !== undefined) as Person[],
    [action.responsibles, people],
  );
  const currentCategory = useMemo(
    () => CATEGORIES[action.category as CATEGORY],
    [action.category],
  );

  // Fallback variant check
  variant =
    !isInstagramFeed(action.category) && variant === VARIANT.content
      ? VARIANT.line
      : variant;
  const variantClasses = useMemo(() => {
    switch (variant) {
      case VARIANT.content:
        return "flex-col gap-2";
      case VARIANT.block:
        return "flex-col gap-2 px-4 py-3";
      // case VARIANT.line:
      default:
        return "rounded-xl px-3 py-1 transition-colors @xs:p-1";
    }
  }, [variant]);
  const bgClasses = useMemo(() => {
    let baseStyles = `
    text-foreground
    bg-action
    transition-all
    duration-500
    shadow-sm
    shadow-black/10
    border-t
    border-white
    z-0
    ring ring-foreground/3
    hover:z-10
    hover:shadow-lg
    hover:bg-action-hover
    dark:border-white/10
    dark:shadow-black/20
    `;

    // 1. Determine base background/text colors based on priority states
    if (showLate && isLateAction(action)) {
      baseStyles = cn(
        baseStyles,
        "bg-late text-late-foreground hover:bg-late-hover border-t-white/50 ring ring-destructive/50",
      );
    }
    if (showSprint && person && isSprint(action, person)) {
      baseStyles = cn(baseStyles, "ring-2 ring-primary");
    }

    // 2. Apply editing ring/focus overrides on top of the base style
    if (isEditing) {
      baseStyles = cn(baseStyles, "ring-primary focus-within:ring-2 z-100");
    }
    return baseStyles;
  }, [isEditing, showLate, action, person, showSprint]);
  const content = (
    <div
      className={cn(
        "group/action @container relative shrink-0 cursor-pointer overflow-hidden rounded-2xl squircle",
        variantClasses,
        bgClasses,
        className,
        isDragging && "cursor-grabbing",
        isSelectionMode &&
          (variant !== VARIANT.content
            ? "pl-8 transition-all"
            : "transition-all"),
        isSelectionMode && isSelected && "ring-2 ring-primary",
      )}
      data-action-id={action.id}
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
          } else if (setBaseAction) {
            setBaseAction(action);
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
            } else if (setBaseAction) {
              setBaseAction(action);
            }
          }
        }
      }}
      role="button"
      tabIndex={0}
      title={`${action.title} • ${getFormattedPartnersName(currentPartners)}`}
    >
      {isSelectionMode && (
        <div
          className={cn(
            "absolute z-20 flex items-center justify-center transition-all",
            variant !== VARIANT.content
              ? "top-1/2 left-2.5 -translate-y-1/2"
              : isSelected
                ? "top-3 left-3"
                : showLate && isLateAction(action)
                  ? "top-2 left-2"
                  : "top-3 left-3",
          )}
        >
          <PrismCheckbox
            boxClassName="bg-background"
            className="pointer-events-none"
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
          <PhaseIcon phase={currentPhase} />
          {/* <PhaseStationIcon phase={currentPhase} station={currentStation} /> */}
        </div>
      )}

      <ActionVariantRenderer
        action={action}
        currentCategory={currentCategory}
        currentPartners={currentPartners}
        currentPhase={currentPhase}
        currentResponsibles={currentResponsibles}
        currentStation={currentStation}
        dateTimeDisplay={dateTimeDisplay}
        handleAction={handleAction}
        handleSetIsEditing={handleSetIsEditing}
        isEditing={isEditing}
        lines={lines}
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

/**
 * ActionItemDateTimeDisplay Component
 *
 * Renders the formatted date and time for an action.
 */
export function ActionItemDateTimeDisplay({
  action,
  dateTimeDisplay,
}: {
  action: Action;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
}) {
  return (
    <div className="text-xs whitespace-nowrap opacity-50">
      {getFormattedDateTime(action.date, dateTimeDisplay)}
    </div>
  );
}
export function ActionItemPartners({
  action,
  partners,
  size,
}: {
  action: Action;
  partners: Partner[];
  size?: (typeof SIZE)[keyof typeof SIZE];
}) {
  return size ? (
    <UAvatarGroup
      avatars={partners.map((partner) => ({
        id: `${action.id}-${partner.id}`,
        fallback: partner.short.toLocaleUpperCase(),
        image: partner.image,
        backgroundColor: partner.colors[0],
        color: partner.colors[1],
      }))}
      size={size}
    />
  ) : (
    <>
      <div className="@xs:hidden">
        <UAvatarGroup
          avatars={partners.map((partner) => ({
            id: `${action.id}-${partner.id}`,
            fallback: partner.short.toLocaleUpperCase(),
            image: partner.image,
            backgroundColor: partner.colors[0],
            color: partner.colors[1],
          }))}
          size={SIZE.xs}
        />
      </div>
      <div className="hidden @xs:block">
        <UAvatarGroup
          avatars={partners.map((partner) => ({
            id: `${action.id}-${partner.id}`,
            fallback: partner.short.toLocaleUpperCase(),
            image: partner.image,
            backgroundColor: partner.colors[0],
            color: partner.colors[1],
          }))}
          size={SIZE.sm}
        />
      </div>
    </>
  );
}
export function ActionItemResponsibles({
  action,
  responsibles,
  size,
}: {
  action: Action;
  responsibles: Person[];
  size?: (typeof SIZE)[keyof typeof SIZE];
}) {
  return (
    <UAvatarGroup
      avatars={responsibles.map((person) => ({
        id: `${action.id}-${person.id}`,
        fallback: person.short.toLocaleUpperCase(),
        image: person.image,
      }))}
      size={size || SIZE.sm}
    />
  );
}

/**
 * ActionItemPriority Component
 *
 * Renders a priority indicator icon colored according to the action's priority level.
 */
export function ActionItemPriority({ priority }: { priority: PRIORITY }) {
  switch (priority) {
    case PRIORITIES.low.slug:
      return <SignalIcon className="text-info size-4" />;
    case PRIORITIES.high.slug:
      return <SignalIcon className="text-error size-4" />;
    default:
      return <SignalIcon className="text-success size-4" />;
  }
}

/**
 * ActionItemSprint Component
 *
 * Displays a sprint icon if the action belongs to the active user's current sprint.
 */
export function ActionItemSprint({
  action,
  className,
}: {
  action: Action;
  className?: string;
}) {
  const { person } = useAppContext();
  return isSprint(action, person) ? (
    <Icons className={cn("size-4 shrink-0", className)} slug="sprint" />
  ) : null;
}
function ActionVariantRenderer(props: ActionVariantRendererProps) {
  switch (props.variant) {
    case VARIANT.content:
      return <ActionContentVariant {...props} />;
    case VARIANT.block:
      return <ActionBlockVariant {...props} />;
    default:
      return <ActionLineVariant {...props} />;
  }
}
