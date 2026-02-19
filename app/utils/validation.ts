import { isBefore } from "date-fns";
import { STATES } from "~/lib/CONSTANTS";

export function isLateAction(action: Action) {
  const isLate =
    action.state !== STATES.finished.slug && isBefore(action.date, new Date());

  return isLate;
}

export function getLateActions(actions: Action[]) {
  if (!actions) return [];

  const lateActions = actions.filter((action) => {
    return isLateAction(action);
  });

  return lateActions;
}

export function isInstagramFeed(category: string, stories = false) {
  return ["post", "reels", "carousel", stories ? "stories" : null].includes(
    category,
  );
}

export const isSprint = (action: Action, person: Person) => {
  return action.sprints?.find((sprint) => sprint === person.user_id);
};

export const isColorValid = (color: string) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};
