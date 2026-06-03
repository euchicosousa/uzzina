import { CalendarDaysIcon, SignalIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useRouteLoaderData, useSubmit } from "react-router";
import { Checkbox } from "~/components/ui/checkbox";
import { useActionShortcutContext } from "~/hooks/useActionShortcut";
import { useMultiSelection } from "~/hooks/useMultiSelection";
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
  handleAction,
  Icons,
  isInstagramFeed,
  isLateAction,
  isSprint,
} from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import type { AppLoaderData } from "~/routes/app";
import { UAvatarGroup } from "../uzzina/UAvatar";
import { ActionItemTitleInput } from "./ActionItemTitleInput";
import { Content } from "./Content";
import { Draggable } from "./DnD";
import { PhaseIcon } from "./PhaseIcon";
import { ActionHoverCard } from "./ActionHoverCard";

type ActionItemProps = {
  action: Action;
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  className?: string;
  isDragging?: boolean;
  isDraggable?: boolean;
  showLate?: boolean;
  showPartner?: boolean;
  showCategory?: boolean;
  showResponsibles?: boolean;
  showPriority?: boolean;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  onClick?: (action: Action) => void;
  enableHoverCard?: boolean;
  lines?: 1 | 2;
};

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
  const people = appData?.people || [];
  const partners = appData?.partners || [];
  const person = appData?.person;

  const { isSelectionMode, selectedIds, toggleSelection } = useMultiSelection();
  const isSelected = selectedIds.includes(action.id);

  const sumbit = useSubmit();
  const { registerAction, unregisterAction, setEditingId } =
    useActionShortcutContext();

  const [isEditing, setIsEditing] = useState(false);

  // Registra a ação no registry global ao montar, atualiza se action mudar
  useEffect(() => {
    registerAction(action.id, { action });
    return () => unregisterAction(action.id);
  }, [action, registerAction, unregisterAction]);

  const handleSetIsEditing = (value: boolean) => {
    setEditingId(value ? action.id : null);
    setIsEditing(value);
  };
  const { setBaseAction } = useOutletContext<OutletContext>();

  const currentPhase = useMemo(
    () => PHASES[(action.phase as PHASE) || "idea"],
    [action.phase],
  );

  const currentPartners = useMemo(
    () =>
      action.partners
        .map((partner) => partners.find((p) => p.slug === partner)!)
        .filter((p) => p !== undefined),
    [action.partners, partners],
  );

  const currentResponsibles = useMemo(
    () =>
      action.responsibles
        .map((person) => people.find((p) => p.user_id === person))
        .filter((r) => r !== undefined),
    [action.responsibles, people],
  );

  const currentCategory = useMemo(
    () => CATEGORIES[action.category as CATEGORY],
    [action.category],
  );

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
      case VARIANT.line:
      default:
        return "squircle rounded-xl px-3 py-1 transition-colors @xs:p-1";
    }
  }, [variant]);

  const bgClasses = useMemo(() => {
    if (variant === VARIANT.content && showLate && isLateAction(action))
      return "bg-destructive/5 dark:bg-destructive/20 text-destructive p-1 rounded-xl hover:bg-destructive/10 dark:hover:bg-destructive/30 ring-destructive/20 ring-1";

    if (person && isSprint(action, person)) {
      return "hover:bg-primary/80 bg-primary text-primary-foreground transition";
    } else {
      if (isEditing) {
        return "ring-foreground focus-within:ring-2 z-100 text-foreground";
      } else if (showLate && isLateAction(action)) {
        return "bg-destructive/5 dark:bg-destructive/20 text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/30 ring-destructive/20 ring-1";
      }
    }

    switch (variant) {
      case VARIANT.hour:
        return "hover:bg-card bg-card text-card-foreground";
      case VARIANT.block:
        return "hover:bg-card bg-card/50 ring-foreground/10 ring-1 text-card-foreground transition";
      default:
        return "hover:bg-card bg-background text-card-foreground";
    }
  }, [variant, isEditing, showLate, action]);

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
            {/* <div className="flex items-center gap-2 py-1"> */}
            <ActionItemTitleInput
              isEditing={isEditing}
              setIsEditing={handleSetIsEditing}
              title={action.title}
              className={"text-xl leading-tight font-medium"}
              lines={lines} // resolver essas linhas
            />
            {/* </div> */}

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
                    className={cn(
                      "size-4",
                      isSprint(action, person) && "text-primary-foreground",
                    )}
                    color={
                      !isSprint(action, person)
                        ? currentCategory.color
                        : undefined
                    }
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
      case VARIANT.line:
      default:
        return (
          <div className="flex w-full items-center justify-between gap-2 overflow-x-hidden py-1">
            <div className="flex w-full items-center gap-2 overflow-hidden">
              <PhaseIcon phase={currentPhase} size="dot" />

              {/* {!isEditing && <ActionItemSprint action={action} />} */}

              <ActionItemTitleInput
                isEditing={isEditing}
                setIsEditing={handleSetIsEditing}
                title={action.title}
                className="w-full lg:text-sm xl:text-base"
                onChange={(title) => {
                  handleAction(
                    {
                      ...action,
                      intent: INTENT.update_action,
                      title,
                    },
                    sumbit,
                  );
                }}
              />
            </div>

            <div
              className={cn(
                "items-center gap-1",
                isEditing ? "hidden @md:flex" : "flex",
              )}
            >
              {/* Parceiro */}
              {(showPartner || currentPartners.length > 1) && (
                <ActionItemPartners
                  action={action}
                  partners={currentPartners}
                />
              )}
              {/* Responsáveis */}
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
                  className={cn(
                    "size-4",
                    isSprint(action, person) && "text-primary-foreground",
                  )}
                  color={
                    !isSprint(action, person)
                      ? currentCategory.color
                      : undefined
                  }
                />
              )}

              {/* Data */}
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
          } else {
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

export function ActionItemPriority({ priority }: { priority: PRIORITY }) {
  switch (priority) {
    case PRIORITIES.low.slug:
      return <SignalIcon className="text-info size-4" />;

    case PRIORITIES.high.slug:
      return <SignalIcon className="text-error size-4" />;

    case PRIORITIES.medium.slug:
    default:
      return <SignalIcon className="text-success size-4" />;
  }
}

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
