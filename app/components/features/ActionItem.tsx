import { addDays, addMinutes, format, isAfter } from "date-fns";
import { CalendarIcon, InstagramIcon, SignalHighIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, useRouteLoaderData, useSubmit } from "react-router";
import {
  DATE_TIME_DISPLAY,
  INTENT,
  PRIORITY,
  SIZE,
  STATE,
  VARIANT,
} from "~/lib/CONSTANTS";
import {
  getFormattedDateTime,
  getFormattedPartnersName,
  getNewDateForAction,
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
  showSprint?: boolean;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  onClick?: (action: Action) => void;
};

export const ActionItem = ({
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
  showSprint,
  dateTimeDisplay,
  onClick,
}: ActionItemProps) => {
  const { states, people, partners, categories, person } = useRouteLoaderData(
    "routes/app",
  ) as AppLoaderData;

  const sumbit = useSubmit();

  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { setBaseAction } = useOutletContext<OutletContext>();

  const currentState = useMemo(
    () => states.find((state) => state.slug === action.state)!,
    [action.state, states],
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
    () => categories.find((category) => category.slug === action.category)!,
    [action.category, categories],
  );

  variant =
    !isInstagramFeed(action.category) && variant === VARIANT.content
      ? VARIANT.line
      : variant;

  const bgClasses = useMemo(() => {
    if (variant === VARIANT.content) return "";

    if (isEditing) {
      return "ring-foreground focus-within:ring-2 z-100 text-foreground";
    }

    if (showLate && isLateAction(action)) {
      return "bg-destructive/5 text-destructive hover:bg-destructive/10";
    }

    return variant === VARIANT.block
      ? "hover:bg-card bg-card text-card-foreground"
      : "hover:bg-card bg-background text-card-foreground";
  }, [variant, isEditing, showLate, action]);

  const renderActionVariant = () => {
    switch (variant) {
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
                setIsEditing={setIsEditing}
                title={action.title}
                className={"h-7 text-xl font-medium tracking-tight"}
                InputButtonClassName="w-auto"
                lines={1}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ActionItemPartners
                  action={action}
                  partners={currentPartners}
                />
                <Icons
                  slug={currentCategory.slug}
                  className="size-4"
                  color={currentCategory.color}
                />
              </div>
              <ActionItemResponsibles
                action={action}
                responsibles={currentResponsibles}
              />
              <div className="flex items-center gap-2 text-xs">
                {(!isInstagramDate || !isInstagramFeed(action.category)) && (
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="size-3 opacity-50" />
                    {getFormattedDateTime(action.date, dateTimeDisplay)}
                  </div>
                )}
                {isInstagramFeed(action.category) && (
                  <div className="flex items-center gap-1">
                    <InstagramIcon className="size-3 opacity-50" />
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
            <div
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: currentState.color }}
            ></div>
            {!isEditing && <ActionItemSprint action={action} />}
            <ActionItemTitleInput
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              title={action.title}
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

            <div
              className={cn(
                "items-center gap-2",
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
                <ActionItemPriority
                  priority={
                    action.priority as (typeof PRIORITY)[keyof typeof PRIORITY]
                  }
                />
              )}
              {showCategory && (
                <Icons
                  slug={currentCategory.slug}
                  className="size-4"
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

  return (
    <Draggable id={action.id}>
      <div
        title={`${action.title} • ${getFormattedPartnersName(currentPartners)}`}
        className={cn(
          "group/action @container relative flex cursor-pointer overflow-hidden",
          variant === VARIANT.content
            ? "flex-col gap-2"
            : variant === VARIANT.block
              ? "border-l-4 px-5 py-3"
              : "px-3 py-1 transition-colors @xs:p-1",

          bgClasses,
          variant === VARIANT.block ? "flex-col gap-2" : "",
          className,
          isDragging ? "cursor-grabbing" : "",
        )}
        style={{ borderLeftColor: currentState.color }}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
        onClick={() => {
          if (!isEditing) {
            if (onClick) {
              onClick(action);
            } else {
              setBaseAction(action);
            }
          }
        }}
      >
        {variant === VARIANT.content && (
          <div className="flex items-center gap-2 overflow-hidden">
            <ActionItemPartners
              action={action}
              partners={currentPartners}
              size={SIZE.sm}
            />
            <div className="w-full overflow-hidden text-xs leading-none font-medium text-ellipsis whitespace-nowrap">
              {getFormattedPartnersName(currentPartners || [])}
            </div>

            <div
              className="min-h-2 min-w-2 shrink-0 rounded-full"
              style={{ backgroundColor: currentState.color }}
            >
              <div className="hidden px-1.5 text-[10px] font-medium tracking-wide text-white uppercase group-hover/action:block">
                {currentState.title}
              </div>
            </div>
          </div>
        )}
        {renderActionVariant()}
        {isHovered && !isEditing && (
          <ShortcutActions action={action} isInstagramDate={isInstagramDate} />
        )}
      </div>
    </Draggable>
  );
};

export const ActionItemTitleInput = ({
  title,
  isDragging,
  isEditing,
  setIsEditing,
  className,
  InputButtonClassName,
  lines = 1,
  onChange,
}: {
  title: string;
  isDragging?: boolean;
  isEditing?: boolean;
  setIsEditing: (value: boolean) => void;
  className?: string;
  InputButtonClassName?: string;
  lines?: 1 | 2;
  onChange?: (title: string) => void;
}) => {
  const [localTitle, setLocalTitle] = useState(title);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  return (
    <div
      className={cn(
        "flex min-h-6 w-full overflow-hidden text-sm",
        !isEditing && "@md:w-auto",
        className,
      )}
    >
      {isEditing ? (
        <input
          autoFocus
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          className={cn("w-full outline-none", InputButtonClassName)}
          onBlur={() => {
            if (onChange) {
              onChange(localTitle);
            }
            setIsEditing(false);
          }}
        />
      ) : (
        <button
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsEditing(true);
          }}
          className={cn(
            "w-full cursor-text text-left leading-snug",
            lines === 1 ? "line-clamp-1" : "line-clamp-2",
            isDragging ? "cursor-grabbing" : "",
            InputButtonClassName,
          )}
        >
          {localTitle}
        </button>
      )}
    </div>
  );
};

export const ActionItemDateTimeDisplay = ({
  action,
  dateTimeDisplay,
  isInstagramDate = false,
}: {
  action: Action;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  isInstagramDate?: boolean;
}) => {
  return (
    <div className="text-xs whitespace-nowrap opacity-50">
      {getFormattedDateTime(
        isInstagramDate ? action.instagram_date : action.date,
        dateTimeDisplay,
      )}
    </div>
  );
};

export const ActionItemPartners = ({
  action,
  partners,
  size,
}: {
  action: Action;
  partners: Partner[];
  size?: (typeof SIZE)[keyof typeof SIZE];
}) => {
  return size ? (
    <UAvatarGroup
      size={size}
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
};

export const ActionItemResponsibles = ({
  action,
  responsibles,
}: {
  action: Action;
  responsibles: Person[];
}) => {
  return (
    <UAvatarGroup
      size={SIZE.sm}
      avatars={responsibles.map((person) => ({
        id: `${action.id}-${person.id}`,
        fallback: person.short,
        image: person.image,
      }))}
    />
  );
};

export const ActionItemPriority = ({
  priority,
}: {
  priority: (typeof PRIORITY)[keyof typeof PRIORITY];
}) => {
  switch (priority) {
    case PRIORITY.low:
      return <SignalHighIcon className="text-info size-4" />;

    case PRIORITY.high:
      return <SignalHighIcon className="text-error size-4" />;

    case PRIORITY.medium:
    default:
      return <SignalHighIcon className="text-success size-4" />;
  }
};

export const ActionItemSprint = ({
  action,
  className,
}: {
  action: Action;
  className?: string;
}) => {
  const { person } = useRouteLoaderData("routes/app") as AppLoaderData;

  return isSprint(action, person) ? (
    <Icons slug="sprint" className={cn("size-4 shrink-0", className)} />
  ) : null;
};

const ShortcutActions = ({
  action,
  isInstagramDate,
}: {
  action: Action;
  isInstagramDate?: boolean;
}) => {
  useActionShortcuts(action, isInstagramDate);
  return <></>;
};

const useActionShortcuts = (action: Action, isInstagramDate?: boolean) => {
  const submit = useSubmit();
  const { person } = useRouteLoaderData("routes/app") as AppLoaderData;

  const keyDown = useCallback(
    (event: KeyboardEvent) => {
      const code = event.code;

      let status: Record<string, (typeof STATE)[keyof typeof STATE]> = {
        KeyI: STATE.idea,
        KeyF: STATE.do,
        KeyZ: STATE.doing,
        KeyA: STATE.review,
        KeyP: STATE.approved,
        KeyT: STATE.done,
        KeyC: STATE.finished,
      };

      //SHIFT
      //Atalhos de Data
      if (event.shiftKey) {
        // Hoje em 30 minutos
        if (code === "KeyD") {
          handleAction(
            {
              ...action,
              intent: INTENT.create_action,
              created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
              updated_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            },
            submit,
          );
        } else if (code === "KeyH") {
          handleAction(
            {
              ...action,
              intent: INTENT.update_action,
              ...getNewDateForAction(
                action,
                addMinutes(new Date(), 30),
                isInstagramDate,
              ),
            },
            submit,
          );
        } else if (code === "KeyA") {
          //Amanhã
          handleAction(
            {
              ...action,
              intent: INTENT.update_action,
              ...getNewDateForAction(
                action,
                addDays(new Date(), 1),
                isInstagramDate,
              ),
            },
            submit,
          );
        } else if (code === "KeyS") {
          // Em 7 dias
          handleAction(
            {
              ...action,
              intent: INTENT.update_action,
              ...getNewDateForAction(
                action,
                isAfter(
                  isInstagramDate ? action.instagram_date : action.date,
                  new Date(),
                )
                  ? addDays(
                      isInstagramDate ? action.instagram_date : action.date,
                      7,
                    )
                  : addDays(new Date(), 7),
                isInstagramDate,
              ),
            },
            submit,
          );
        } else if (code === "KeyM") {
          // Em 30 dias
          handleAction(
            {
              ...action,
              intent: INTENT.update_action,
              ...getNewDateForAction(
                action,
                isAfter(
                  isInstagramDate ? action.instagram_date : action.date,
                  new Date(),
                )
                  ? addDays(
                      isInstagramDate ? action.instagram_date : action.date,
                      30,
                    )
                  : addDays(new Date(), 30),
                isInstagramDate,
              ),
            },
            submit,
          );
        } else if (code === "KeyU") {
          // Coloca ou retira do sprint
          let sprints = null;
          if (action.sprints) {
            if (action.sprints.find((sprint) => sprint === person.user_id)) {
              sprints = action.sprints.filter(
                (sprint) => sprint !== person.user_id,
              );
            } else {
              sprints = [...action.sprints, person.user_id];
            }
          } else {
            sprints = [person.user_id];
          }

          sprints = sprints.length > 0 ? sprints : null;

          handleAction(
            {
              ...action,
              intent: INTENT.update_action,
              sprints,
            },
            submit,
          );
        } else if (code === "KeyX") {
          if (confirm("Tem certeza que deseja arquivar esta ação?")) {
            handleAction(
              {
                ...action,
                intent: INTENT.update_action,
                archived: true,
              },
              submit,
            );
          }
        }
      } else if (status[code]) {
        handleAction(
          {
            ...action,
            intent: INTENT.update_action,
            state: status[code],
          },
          submit,
        );
      }
    },
    [action, isInstagramDate, person.user_id, submit],
  );

  useEffect(() => {
    document.addEventListener("keydown", keyDown);

    return () => document.removeEventListener("keydown", keyDown);
  }, [keyDown]);
};
