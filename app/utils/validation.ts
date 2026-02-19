import { isBefore } from "date-fns";
import { z } from "zod";
import { STATES } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";

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

// Helper for comma-separated strings to array of strings
const commaSeparatedStringToArray = z
  .string()
  .transform((val) => val.split(",").filter(Boolean));

// Helper for arrays or null from comma-separated strings
const nullableCommaSeparatedStringToArray = z
  .string()
  .nullable()
  .optional()
  .transform((val) => {
    if (!val || val === "null" || val === "") return null;
    return val.split(",").filter(Boolean);
  });

// Helper for strings that might be "null" or empty
const nullableString = z
  .string()
  .nullable()
  .optional()
  .transform((val) => {
    if (!val || val === "null" || val === "") return undefined; // undefined removes it from the spread
    return val;
  });

export const ActionFormSchema = z
  .object({
    title: z.string().min(2, "O Título deve ter pelo menos 2 caracteres"),
    date: z.string().min(1, "A data é obrigatória"),
    category: z.string().min(1, "A categoria é obrigatória"),
    state: z.string().min(1, "O estado é obrigatório"),
    priority: z.string().min(1, "A prioridade é obrigatória"),
    description: nullableString,

    responsibles: commaSeparatedStringToArray,
    partners: commaSeparatedStringToArray,

    content_files: nullableCommaSeparatedStringToArray,
    work_files: nullableCommaSeparatedStringToArray,
    sprints: nullableCommaSeparatedStringToArray,

    topics: nullableString,
    instagram_content: nullableString,
    instagram_caption: nullableString,
    instagram_date: nullableString,
  })
  .passthrough(); // passthrough allows other unexpected fields from formData like created_at, user_id just in case, though we only care about validating these known fields.
