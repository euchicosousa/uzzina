import { IconBrandInstagram } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useRouteLoaderData, useSubmit } from "react-router";
import { CalendarDaysIcon, SignalIcon } from "lucide-react";
import {
  CATEGORIES,
  DATE_TIME_DISPLAY,
  INTENT,
  PRIORITIES,
  SIZE,
  STATES,
  VARIANT,
  type CATEGORY,
  type PRIORITY,
  type STATE,
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
import type { AppLoaderData } from "~/routes/app";
import { UAvatarGroup } from "../uzzina/UAvatar";
import { Content } from "./Content";
import { Draggable } from "./DnD";
import { StateIcon } from "./StateIcon";
import { ActionItemTitleInput } from "./ActionItemTitleInput";
import type { Action } from "~/models/actions.server";
import { useActionShortcutContext } from "~/hooks/useActionShortcut";
import { useMultiSelection } from "~/hooks/useMultiSelection";
import { Checkbox } from "~/components/ui/checkbox";

type ActionItemProps = {
  action: Action;
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  className?: string;
  isDragging?: boolean;
  isInstagramDate?: boolean;
  isDraggable?: boolean;
  showLate?: boolean;
  showPartner?: boolean;
  showCategory?: boolean;
  showResponsibles?: boolean;
  showPriority?: boolean;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  onClick?: (action: Action) => void;
};

export function ActionItem({
  action,
  variant = VARIANT.line,
  showLate,
  className,
  isDragging,
  isInstagramDate,
  isDraggable,
  showPartner,
  showCategory,
  showResponsibles,
  showPriority,
  dateTimeDisplay,
  onClick,
}: ActionItemProps) {
  const appData = useRouteLoaderData("routes/app") as AppLoaderData | undefined;
  const people = appData?.people || [];
  const partners = appData?.partners || [];

  const { isSelectionMode, selectedIds, toggleSelection } = useMultiSelection();
  const isSelected = selectedIds.includes(action.id);

  const sumbit = useSubmit();
  const { registerAction, unregisterAction, setEditingId } =
    useActionShortcutContext();

  const [isEditing, setIsEditing] = useState(false);

  // Registra a ação no registry global ao montar, atualiza se action mudar
  useEffect(() => {
    registerAction(action.id, { action, isInstagramDate });
    return () => unregisterAction(action.id);
  }, [action, isInstagramDate, registerAction, unregisterAction]);

  const handleSetIsEditing = (value: boolean) => {
    setEditingId(value ? action.id : null);
    setIsEditing(value);
  };
  const { setBaseAction } = useOutletContext<OutletContext>();

  const currentState = useMemo(
    () => STATES[action.state as STATE],
    [action.state],
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
        return "squircle flex-col gap-2 rounded-2xl px-3 py-2";
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
    if (variant === VARIANT.content) return "";
    if (isEditing)
      return "ring-foreground focus-within:ring-2 z-100 text-foreground";
    if (showLate && isLateAction(action))
      return "bg-destructive/5 dark:bg-destructive/20 text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/30";

    switch (variant) {
      case VARIANT.hour:
        return "hover:bg-card bg-card text-card-foreground";
      case VARIANT.block:
        return "hover:bg-secondary/50 bg-secondary text-card-foreground transition";
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
              <StateIcon state={currentState} />
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
            isInstagramDate={isInstagramDate}
          />
        );
      case VARIANT.block:
        return (
          <div className="flex flex-col gap-2 pb-2">
            <div className="flex items-center gap-2 py-2">
              {!isEditing && <ActionItemSprint action={action} />}
              <ActionItemTitleInput
                isEditing={isEditing}
                setIsEditing={handleSetIsEditing}
                title={action.title}
                className={"h-6 text-xl"}
                InputButtonClassName="w-auto"
                lines={1}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showPartner && (
                  <ActionItemPartners
                    action={action}
                    partners={currentPartners}
                  />
                )}

                {showCategory && (
                  <Icons
                    slug={currentCategory.slug}
                    className="size-4"
                    color={currentCategory.color}
                  />
                )}

                <StateIcon state={currentState} />

                {showResponsibles && (
                  <ActionItemResponsibles
                    action={action}
                    responsibles={currentResponsibles}
                    size={SIZE.xs}
                  />
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                {(!isInstagramDate || !isInstagramFeed(action.category)) && (
                  <div className="flex items-center gap-1">
                    <CalendarDaysIcon className="size-3 opacity-50" />
                    {getFormattedDateTime(action.date, dateTimeDisplay)}
                  </div>
                )}
                {isInstagramFeed(action.category) && (
                  <div className="flex items-center gap-1">
                    <IconBrandInstagram className="size-3 opacity-50" />
                    {getFormattedDateTime(
                      action.instagram_date,
                      dateTimeDisplay,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case VARIANT.line:
      default:
        return (
          <div className="flex w-full items-center justify-between gap-2 overflow-x-hidden py-1">
            <div className="flex w-full items-center gap-2 overflow-hidden">
              <StateIcon state={currentState} size={"dot"} />

              {!isEditing && <ActionItemSprint action={action} />}

              <ActionItemTitleInput
                isEditing={isEditing}
                setIsEditing={handleSetIsEditing}
                title={action.title}
                className="w-full"
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
                  className="size-4 shrink-0"
                  color={currentCategory.color}
                />
              )}

              {/* Data */}
              {dateTimeDisplay && (
                <div className="hidden justify-end overflow-hidden group-hover/action:flex @md:w-[90px]">
                  <ActionItemDateTimeDisplay
                    action={action}
                    dateTimeDisplay={dateTimeDisplay}
                    isInstagramDate={
                      isInstagramDate && isInstagramFeed(action.category)
                    }
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
        "group/action font-inter @container relative shrink-0 cursor-pointer overflow-hidden",
        variantClasses,
        bgClasses,
        className,
        isDragging && "cursor-grabbing",
        isSelectionMode && "relative pl-8 transition-all",
        isSelectionMode && isSelected && "ring-primary ring-2 ring-inset",
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
        <div className="absolute top-1/2 left-2.5 z-20 flex -translate-y-1/2 items-center justify-center">
          <Checkbox checked={isSelected} className="pointer-events-none" />
        </div>
      )}
      {variant === VARIANT.content && (
        <div className="mb-2 flex items-center gap-2 overflow-hidden">
          <ActionItemPartners
            action={action}
            partners={currentPartners}
            size={SIZE.sm}
          />
          <div className="w-full overflow-hidden text-xs leading-none font-medium text-ellipsis whitespace-nowrap">
            {getFormattedPartnersName(currentPartners || [])}
          </div>

          <StateIcon state={currentState} />
        </div>
      )}
      {renderActionVariant()}
    </div>
  );

  return isDraggable ? (
    <Draggable id={action.id}>{content}</Draggable>
  ) : (
    content
  );
}

export function ActionItemDateTimeDisplay({
  action,
  dateTimeDisplay,
  isInstagramDate = false,
}: {
  action: Action;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  isInstagramDate?: boolean;
}) {
  return (
    <div className="text-xs whitespace-nowrap opacity-50">
      {getFormattedDateTime(
        isInstagramDate ? action.instagram_date : action.date,
        dateTimeDisplay,
      )}
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
      isSquircle
      avatars={partners.map((partner) => ({
        id: `${action.id}-${partner.id}`,
        fallback: partner.short,
        backgroundColor: partner.colors[0],
        color: partner.colors[1],
      }))}
    />
  ) : (
    <>
      <div className="@xs:hidden">
        <UAvatarGroup
          size={SIZE.xs}
          isSquircle
          avatars={partners.map((partner) => ({
            id: `${action.id}-${partner.id}`,
            fallback: partner.short,
            backgroundColor: partner.colors[0],
            color: partner.colors[1],
          }))}
        />
      </div>
      <div className="hidden @xs:block">
        <UAvatarGroup
          isSquircle
          size={SIZE.sm}
          avatars={partners.map((partner) => ({
            id: `${action.id}-${partner.id}`,
            fallback: partner.short,
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
        fallback: person.short,
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

  return person && isSprint(action, person) ? (
    <Icons slug="sprint" className={cn("size-4 shrink-0", className)} />
  ) : null;
}
