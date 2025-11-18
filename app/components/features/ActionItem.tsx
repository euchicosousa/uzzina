import Color from "color";
import { addDays, addMinutes, format } from "date-fns";
import { SignalHighIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useMatches, useOutletContext, useSubmit } from "react-router";
import { Theme, useTheme } from "remix-themes";
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
  handleAction,
  Icons,
  isAlmostLateAction,
  isLateAction,
} from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { AppLoaderData } from "~/routes/app";
import { UAvatarGroup } from "../uzzina/UAvatar";
import { UBadge, type TSize } from "../uzzina/UBadge";
import { Content } from "./Content";

type ActionItemProps = {
  action: Action;
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  className?: string;
  isDragging?: boolean;
  isInstagramDate?: boolean;
  showLate?: boolean;
  showPartner?: boolean;
  showCategory?: boolean;
  showResponsibles?: boolean;
  showPriority?: boolean;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];

  onClick?: (action: Action) => void;
};

export const ActionItem = ({
  action,
  variant,
  showLate,
  className,
  isDragging,
  isInstagramDate,
  showPartner,
  showCategory,
  showResponsibles,
  showPriority,
  dateTimeDisplay,
  onClick,
}: ActionItemProps) => {
  const { states, people, partners, categories } = useMatches()[1]
    .loaderData as AppLoaderData;

  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { setBaseAction } = useOutletContext<OutletContext>();

  const currentState = states.find((state) => state.slug === action.state)!;
  const currentPartners = action.partners.map((partner) => {
    return partners.find((p) => p.slug === partner)!;
  });
  const currentResponsibles = action.responsibles.map((person) => {
    return people.find((p) => p.user_id === person)!;
  });
  const currentCategory = categories.find(
    (category) => category.slug === action.category,
  )!;

  const bgClasses =
    variant === VARIANT.content
      ? ""
      : isEditing
        ? "bg-input ring-foreground focus-within:ring-2 ring-offset-2 ring-offset-background"
        : showLate
          ? isLateAction(action)
            ? "bg-error-background/50 border-error/50 text-error hover:bg-error-background"
            : isAlmostLateAction(action)
              ? "bg-warning-background/50 text-warning hover:bg-warning-background border-warning/50"
              : "hover:bg-input/35"
          : "hover:bg-input/35";

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
          <div className="flex flex-col gap-2">
            <ActionItemTitleInput
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              title={action.title}
              className={"text-lg font-medium tracking-tight"}
            />
            <div className="text-xs">
              {getFormattedDateTime(action.date, dateTimeDisplay)}
            </div>
          </div>
        );
      case VARIANT.line:
      default:
        return (
          <div className="flex w-full items-center justify-between gap-4 overflow-hidden">
            <ActionItemTitleInput
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              title={action.title}
            />

            <div
              className={cn(
                "items-center gap-2",
                isEditing ? "hidden @md:flex" : "flex",
              )}
            >
              {/* Parceiro */}
              {showPartner && (
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
                // <div className="flex justify-center overflow-hidden @md:w-[120px]">
                // <ActionItemCategory category={currentCategory} />
                // </div>
                <Icons
                  slug={currentCategory.slug}
                  className="size-4"
                  color={currentCategory.color}
                />
              )}

              {/* Data */}
              {dateTimeDisplay && (
                <div className="flex justify-end overflow-hidden @md:w-[90px]">
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

  return (
    <div
      title={`${action.title} • ${getFormattedPartnersName(currentPartners)}`}
      className={cn(
        "group/action @container relative flex cursor-pointer overflow-hidden",
        variant === VARIANT.content
          ? "flex-col gap-2"
          : "border-l-4 px-3 py-2 transition-colors @xs:p-2",

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
        <div className="flex items-center gap-1 overflow-hidden">
          <ActionItemPartners
            action={action}
            partners={currentPartners}
            size={SIZE.sm}
          />
          <div className="w-full overflow-hidden text-xs leading-none font-medium text-ellipsis whitespace-nowrap">
            {getFormattedPartnersName(currentPartners)}
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
      {isHovered && (
        <ShortcutActions action={action} isInstagramDate={isInstagramDate} />
      )}
    </div>
  );
};

export const ActionItemTitleInput = ({
  title,
  isDragging,
  isEditing,
  setIsEditing,
  className,
}: {
  title: string;
  isDragging?: boolean;
  isEditing?: boolean;
  setIsEditing: (value: boolean) => void;
  className?: string;
}) => {
  const [localTItle, setLocalTitle] = useState(title);

  return (
    <div
      className={cn(
        "flex w-full overflow-hidden text-sm",
        !isEditing && "@md:w-auto",
        className,
      )}
    >
      {isEditing ? (
        <input
          autoFocus
          type="text"
          value={localTItle}
          onChange={(e) => setLocalTitle(e.target.value)}
          className={cn("w-full outline-none")}
          onBlur={() => setIsEditing(false)}
        />
      ) : (
        <button
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsEditing(true);
          }}
          className={cn(
            "w-full cursor-text overflow-hidden text-left text-ellipsis whitespace-nowrap",
            isDragging ? "cursor-grabbing" : "",
          )}
        >
          {title}
        </button>
      )}
    </div>
  );
};

export const ActionItemDateTimeDisplay = ({
  action,
  dateTimeDisplay,
}: {
  action: Action;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
}) => {
  return (
    <div className="text-xs whitespace-nowrap opacity-50">
      {getFormattedDateTime(action.date, dateTimeDisplay)}
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

export const ActionItemCategory = ({
  category,
  size,
  text,
}: {
  category: Category;
  size?: TSize;
  text?: string;
}) => {
  const [theme] = useTheme();
  const foregroundColor =
    theme === Theme.LIGHT ? Color(category.color).darken(0.5).hex() : "white";
  const backgroundColor =
    theme === Theme.LIGHT
      ? Color(category.color).lighten(0.8).hex()
      : Color(category.color).darken(0.6).desaturate(0.3).hex();

  return text ? (
    <UBadge
      className="uppercase @xs:hidden"
      text={text}
      size={size || "sm"}
      style={{
        backgroundColor: backgroundColor,
        color: foregroundColor,
        border: "none",
      }}
    />
  ) : (
    <>
      <UBadge
        className="uppercase @xs:hidden"
        text={category.tag[0] || ""}
        size={size || "sm"}
        style={{
          backgroundColor: backgroundColor,
          color: foregroundColor,
          border: "none",
        }}
      />
      <UBadge
        className="hidden w-12 items-center text-center uppercase @xs:flex @sm:hidden"
        text={category.tag || ""}
        size={size || "sm"}
        style={{
          backgroundColor: backgroundColor,
          color: foregroundColor,
          border: "none",
        }}
      />
      <UBadge
        className="bg-secondary text-secondary-foreground hidden w-30 items-center tracking-wider uppercase @sm:flex"
        text={category.title}
        size={size || "sm"}
        style={{
          backgroundColor: backgroundColor,
          color: foregroundColor,
          border: "none",
        }}
      />
    </>
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

const ShortcutActions = ({
  action,
  isInstagramDate,
}: {
  action: Action;
  isInstagramDate?: boolean;
}) => {
  const submit = useSubmit();

  function keyDown(event: KeyboardEvent) {
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

    //Atalhos de status
    if (event.shiftKey) {
      if (code === "KeyH") {
        handleAction(
          {
            ...action,
            intent: INTENT.update_action,
            date: isInstagramDate
              ? action.date
              : format(addMinutes(new Date(), 30), "yyyy-MM-dd'T'HH:mm:ss"),
            instagram_date: isInstagramDate
              ? format(addMinutes(new Date(), 30), "yyyy-MM-dd'T'HH:mm:ss")
              : action.instagram_date,
          },
          submit,
        );
      } else if (code === "KeyA") {
        //Amanhã
        handleAction(
          {
            ...action,
            intent: INTENT.update_action,
            date: isInstagramDate
              ? action.date
              : format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"),
            instagram_date: isInstagramDate
              ? format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss")
              : action.instagram_date,
          },
          submit,
        );
      } else if (code === "KeyS") {
        handleAction(
          {
            ...action,
            intent: INTENT.update_action,
            date: isInstagramDate
              ? action.date
              : format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss"),
            instagram_date: isInstagramDate
              ? format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss")
              : action.instagram_date,
          },
          submit,
        );
      } else if (code === "KeyM") {
        handleAction(
          {
            ...action,
            intent: INTENT.update_action,
            date: isInstagramDate
              ? action.date
              : format(addDays(new Date(), 30), "yyyy-MM-dd'T'HH:mm:ss"),
            instagram_date: isInstagramDate
              ? format(addDays(new Date(), 30), "yyyy-MM-dd'T'HH:mm:ss")
              : action.instagram_date,
          },
          submit,
        );
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
  }

  useEffect(() => {
    document.addEventListener("keydown", keyDown);

    return () => document.removeEventListener("keydown", keyDown);
  }, []);

  return <></>;
};
