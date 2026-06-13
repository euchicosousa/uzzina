import { CalendarDaysIcon, SignalIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useRouteLoaderData } from "react-router";

// UI Components
import { Checkbox } from "~/components/ui/checkbox";
import { UAvatarGroup } from "../uzzina/UAvatar";
import { ActionHoverCard } from "./ActionHoverCard";
import { ActionItemTitleInput } from "./ActionItemTitleInput";
import { Content } from "./Content";
import { Draggable } from "./DnD";
import { PhaseIcon } from "./PhaseIcon";

// Hooks
import { useActionShortcutContext } from "~/hooks/useActionShortcut";
import { useMultiSelection } from "~/hooks/useMultiSelection";

// Constants & Helpers
import { useQuery } from "@tanstack/react-query";
import { useActionMutations } from "~/hooks/useActionMutations";
import {
  CATEGORIES,
  DATE_TIME_DISPLAY,
  INTENT,
  PHASES,
  PRIORITIES,
  SIZE,
  VARIANT,
  type CATEGORY,
  type PHASE,
  type PRIORITY,
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
import { cn } from "~/lib/utils";

// Types
import type { Action } from "~/models/actions.server";
import type { Partner } from "~/models/partners.server"; // Imported explicitly for subcomponents
import type { Person } from "~/models/people.server"; // Imported explicitly for subcomponents
import type { AppLoaderData } from "~/routes/app";

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
  /** Whether to highlight the action if it is late */
  showLate?: boolean;
  /** Whether to show the associated partner information */
  showPartner?: boolean;
  /** Whether to show the category icon */
  showCategory?: boolean;
  /** Whether to show the avatar group of responsible users */
  showResponsibles?: boolean;
  /** Whether to show the priority icon indicator */
  showPriority?: boolean;
  /** Format pattern for displaying dates and times */
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  /** Optional click handler override */
  onClick?: (action: Action) => void;
  /** Whether to wrap the item with a hover card detailing the action */
  enableHoverCard?: boolean;
  /** Max lines for the title layout in certain variants */
  lines?: 1 | 2;
};

/**
 * Interface representing the context structure returned by React Router's useOutletContext.
 */
interface OutletContext {
  setBaseAction: (action: Action) => void;
}

/**
 * ActionItem Component
 *
 * Renders a single Action card/item in various layouts (line, block, hour, content, hair).
 * Integrates drag-and-drop capability, selection mode, inline title editing, and action shortcuts.
 */
export function ActionItem({
  action,
  variant = VARIANT.line,
  showLate,
  className,
  isDragging,
  isDraggable,
  showPartner,
  showCategory,
  showResponsibles,
  showPriority,
  dateTimeDisplay,
  onClick,
  enableHoverCard = false,
  lines = 1,
}: ActionItemProps) {
  const appData = useRouteLoaderData("routes/app") as AppLoaderData | undefined;
  const { data: people = [] } = useQuery({
    queryKey: QUERY_KEYS.people(),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });
  const partners = appData?.partners || [];
  const person = appData?.person;

  const { isSelectionMode, selectedIds, toggleSelection } = useMultiSelection();
  const isSelected = selectedIds.includes(action.id);

  const { handleAction } = useActionMutations();
  const { registerAction, unregisterAction, setEditingId } =
    useActionShortcutContext();

  const [isEditing, setIsEditing] = useState(false);

  // Register the action in the global shortcut registry on mount/update
  useEffect(() => {
    registerAction(action.id, { action });
    return () => unregisterAction(action.id);
  }, [action, registerAction, unregisterAction]);

  const handleSetIsEditing = (value: boolean) => {
    setEditingId(value ? action.id : null);
    setIsEditing(value);
  };
  const context = useOutletContext<OutletContext | undefined>();
  const setBaseAction = context?.setBaseAction;

  const currentPhase = useMemo(
    () => PHASES[(action.phase as PHASE) || "idea"],
    [action.phase],
  );

  const currentPartners = useMemo(
    () =>
      action.partners
        .map((partner) => partners.find((p) => p.slug === partner))
        .filter((p) => p !== undefined),
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
        return "squircle flex-col gap-2 rounded-2xl px-4 py-3";
      case VARIANT.hour:
        return "squircle w-auto rounded-xl px-3 py-2";
      case VARIANT.hair:
        return "squircle rounded-xl px-3 py-0 transition-colors @xs:p-0";
      // case VARIANT.line:
      default:
        return "squircle rounded-xl px-3 py-1 transition-colors @xs:p-1";
    }
  }, [variant]);

  const bgClasses = useMemo(() => {
    let baseStyles = "";

    // 1. Determine base background/text colors based on priority states
    if (showLate && isLateAction(action)) {
      if (variant === VARIANT.content) {
        baseStyles =
          "bg-destructive/10 dark:bg-destructive/20 text-destructive p-1 rounded-xl hover:bg-destructive/10 dark:hover:bg-destructive/30 ring-destructive/20 ring-1";
      } else {
        baseStyles =
          "bg-destructive/10 dark:bg-destructive/20 text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/30 ring-destructive/20 ring-1";
      }
    } else if (person && isSprint(action, person)) {
      baseStyles =
        "hover:bg-primary/10 bg-primary/5 transition ring-primary/20 ring-1";
    } else {
      baseStyles =
        "hover:bg-card bg-card/50 shadow-xs text-card-foreground transition hover:shadow-lg duration-500 border-t border-card hover:z-10 z-0";
      // GUARDAR PARA TESTES
      // switch (variant) {
      //   case VARIANT.hour:
      //     baseStyles = "hover:bg-card bg-card text-card-foreground";
      //     break;
      //   case VARIANT.block:
      //     baseStyles =
      //       "hover:bg-card bg-card/50 shadow-xs text-card-foreground transition hover:shadow-xl duration-500 border-t border-card";
      //     break;
      //   default:
      //     baseStyles = "hover:bg-card bg-background text-card-foreground";
      //     break;
      // }
    }

    // 2. Apply editing ring/focus overrides on top of the base style
    if (isEditing) {
      baseStyles = cn(
        baseStyles,
        "ring-foreground focus-within:ring-2 z-100 text-foreground",
      );
    }

    return baseStyles;
  }, [variant, isEditing, showLate, action, person]);

  const renderActionVariant = () => {
    switch (variant) {
      case VARIANT.hour:
        return (
          <div className="flex items-center justify-between gap-1 overflow-hidden text-sm">
            <div className="flex items-center gap-2 overflow-hidden">
              <PhaseIcon phase={currentPhase} size="dot" />
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {action.title}
              </div>
            </div>

            <div className="text-xs opacity-50">
              {getFormattedDateTime(action.date, DATE_TIME_DISPLAY.TimeOnly)}
            </div>
          </div>
        );
      case VARIANT.content:
        return (
          <Content
            action={action}
            category={showCategory ? currentCategory : undefined}
            showResponsibles={showResponsibles}
          />
        );
      case VARIANT.block:
        return (
          <div className="flex flex-col gap-2 pb-2">
            <ActionItemTitleInput
              isEditing={isEditing}
              setIsEditing={handleSetIsEditing}
              title={action.title}
              className={"text-xl leading-tight font-medium"}
              lines={lines}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ActionItemSprint action={action} />
                {showPartner && (
                  <ActionItemPartners
                    action={action}
                    partners={currentPartners}
                  />
                )}

                {showCategory && (
                  <Icons
                    slug={currentCategory.slug}
                    className={cn("size-4")}
                    color={currentCategory.color}
                  />
                )}

                <PhaseIcon phase={currentPhase} size="dot" />

                {showResponsibles && (
                  <ActionItemResponsibles
                    action={action}
                    responsibles={currentResponsibles}
                    size={SIZE.xs}
                  />
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <CalendarDaysIcon className="size-3 opacity-50" />
                    {getFormattedDateTime(action.date, dateTimeDisplay)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      // case VARIANT.line:
      default:
        return (
          <div className="flex w-full items-center justify-between gap-2 overflow-x-hidden py-1">
            <div className="flex w-full items-center gap-2 overflow-hidden">
              <PhaseIcon phase={currentPhase} size="dot" />

              <ActionItemTitleInput
                isEditing={isEditing}
                setIsEditing={handleSetIsEditing}
                title={action.title}
                className="w-full lg:text-sm xl:text-base"
                onChange={(title) => {
                  handleAction({
                    ...action,
                    intent: INTENT.update_action,
                    title,
                  });
                }}
              />
            </div>

            <div
              className={cn(
                "items-center gap-1",
                isEditing ? "hidden @md:flex" : "flex",
              )}
            >
              {(showPartner || currentPartners.length > 1) && (
                <ActionItemPartners
                  action={action}
                  partners={currentPartners}
                />
              )}
              {showResponsibles && (
                <ActionItemResponsibles
                  size="xs"
                  action={action}
                  responsibles={currentResponsibles}
                />
              )}
              {showPriority && (
                <ActionItemPriority priority={action.priority as PRIORITY} />
              )}
              {showCategory && (
                <Icons
                  slug={currentCategory.slug}
                  className={cn("size-4")}
                  color={currentCategory.color}
                />
              )}

              {dateTimeDisplay && (
                <div className="hidden justify-end overflow-hidden group-hover/action:flex @md:w-[90px]">
                  <ActionItemDateTimeDisplay
                    action={action}
                    dateTimeDisplay={dateTimeDisplay}
                  />
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const content = (
    <div
      data-action-id={action.id}
      title={`${action.title} • ${getFormattedPartnersName(currentPartners)}`}
      className={cn(
        "group/action squircle @container relative shrink-0 cursor-pointer overflow-hidden rounded-3xl p-2",
        variantClasses,
        bgClasses,
        className,
        isDragging && "cursor-grabbing",
        isSelectionMode &&
          (variant !== VARIANT.content
            ? "relative pl-8 transition-all"
            : "relative transition-all"),
        isSelectionMode && isSelected && "ring-2 ring-primary ring-inset",
        isSelected && variant === VARIANT.content && "squircle rounded-3xl p-2",
      )}
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
                  : "top-1 left-1",
          )}
        >
          <Checkbox
            checked={isSelected}
            className="pointer-events-none bg-background"
          />
        </div>
      )}
      {variant === VARIANT.content && (
        <div className={cn("mb-2 flex items-center gap-2 overflow-hidden")}>
          <ActionItemPartners
            action={action}
            partners={currentPartners}
            size={SIZE.sm}
          />
          <div className="w-full overflow-hidden text-xs leading-none font-medium text-ellipsis whitespace-nowrap">
            {getFormattedPartnersName(currentPartners || [])}
          </div>
        </div>
      )}
      {renderActionVariant()}
    </div>
  );

  const wrapper = enableHoverCard ? (
    <ActionHoverCard action={action} onClick={onClick}>
      {content}
    </ActionHoverCard>
  ) : (
    content
  );

  return isDraggable ? (
    <Draggable id={action.id}>{wrapper}</Draggable>
  ) : (
    wrapper
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

/**
 * ActionItemPartners Component
 *
 * Renders avatar(s) for the partner(s) associated with an action.
 */
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
      size={size}
      avatars={partners.map((partner) => ({
        id: `${action.id}-${partner.id}`,
        fallback: partner.short.toLocaleUpperCase(),
        image: partner.image,
        backgroundColor: partner.colors[0],
        color: partner.colors[1],
      }))}
    />
  ) : (
    <>
      <div className="@xs:hidden">
        <UAvatarGroup
          size={SIZE.xs}
          avatars={partners.map((partner) => ({
            id: `${action.id}-${partner.id}`,
            fallback: partner.short.toLocaleUpperCase(),
            image: partner.image,
            backgroundColor: partner.colors[0],
            color: partner.colors[1],
          }))}
        />
      </div>
      <div className="hidden @xs:block">
        <UAvatarGroup
          size={SIZE.sm}
          avatars={partners.map((partner) => ({
            id: `${action.id}-${partner.id}`,
            fallback: partner.short.toLocaleUpperCase(),
            image: partner.image,
            backgroundColor: partner.colors[0],
            color: partner.colors[1],
          }))}
        />
      </div>
    </>
  );
}

/**
 * ActionItemResponsibles Component
 *
 * Renders an avatar group representing the team members responsible for the action.
 */
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
      size={size || SIZE.sm}
      avatars={responsibles.map((person) => ({
        id: `${action.id}-${person.id}`,
        fallback: person.short.toLocaleUpperCase(),
        image: person.image,
      }))}
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
  const appData = useRouteLoaderData("routes/app") as AppLoaderData | undefined;
  const person = appData?.person;

  return isSprint(action, person) ? (
    <Icons slug="sprint" className={cn("size-4 shrink-0", className)} />
  ) : null;
}
