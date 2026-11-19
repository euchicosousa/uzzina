import { cn } from "cnfast";
import { SignalIcon } from "lucide-react";
import { UAvatarGroup } from "~/components/uzzina/UAvatar";
import { useAppContext } from "~/contexts/AppContext";
import {
  PRIORITIES,
  SIZE,
  type DATE_TIME_DISPLAY,
  type PRIORITY,
} from "~/lib/CONSTANTS";
import type { Action, Partner, Person } from "~/types";
import { getFormattedDateTime, isSprint, UIcons } from "~/utils";

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
    <div className="action-date text-xs whitespace-nowrap opacity-50">
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
      return <SignalIcon className="vivid-ink size-4 text-info" />;
    case PRIORITIES.high.slug:
      return <SignalIcon className="vivid-ink size-4 text-error" />;
    default:
      return <SignalIcon className="vivid-ink size-4 text-success" />;
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
    <UIcons className={cn("size-4 shrink-0", className)} slug="sprint" />
  ) : null;
}
