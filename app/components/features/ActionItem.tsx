import Color from "color";
import { SignalHighIcon } from "lucide-react";
import { useState } from "react";
import { useMatches, useOutletContext } from "react-router";
import { Theme, useTheme } from "remix-themes";
import { DATE_TIME_DISPLAY, PRIORITY, SIZE, VARIANT } from "~/lib/CONSTANTS";
import {
  getFormattedDateTime,
  getFormattedPartnersName,
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
          />
        );
      case VARIANT.block:
        return (
          <div className="flex flex-col gap-2">
            <ActionItemTitleInput
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              title={action.title}
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
                <ActionItemCategory category={currentCategory} />
                // </div>
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
      className={cn(
        "group/action @container relative flex cursor-pointer overflow-hidden",
        variant === VARIANT.content
          ? "flex-col gap-2"
          : "border-l-4 px-4 py-2 transition-colors @xs:p-2",

        bgClasses,
        variant === VARIANT.block ? "flex-col gap-2" : "",
        className,
        isDragging ? "cursor-grabbing" : "",
      )}
      style={{ borderLeftColor: currentState.color }}
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
            size={SIZE.md}
          />
          <div className="w-full overflow-hidden leading-none font-medium tracking-tight text-ellipsis whitespace-nowrap">
            {getFormattedPartnersName(currentPartners)}
          </div>
          <div
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: currentState.color }}
          ></div>
        </div>
      )}

      {renderActionVariant()}
    </div>
  );
};

export const ActionItemTitleInput = ({
  title,
  isDragging,
  isEditing,
  setIsEditing,
}: {
  title: string;
  isDragging?: boolean;
  isEditing?: boolean;
  setIsEditing: (value: boolean) => void;
}) => {
  const [localTItle, setLocalTitle] = useState(title);

  return (
    <div
      className={cn(
        "flex w-full overflow-hidden text-sm",
        !isEditing && "@md:w-auto",
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
