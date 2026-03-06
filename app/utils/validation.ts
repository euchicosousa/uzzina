import { isBefore } from "date-fns";
import { z } from "zod";
import { STATES } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";

export const isLateAction = (action: Action) =>
  action.state !== STATES.finished.slug && isBefore(action.date, new Date());

export const getLateActions = (actions: Action[]) =>
  actions?.filter(isLateAction) ?? [];

export function getInstagramFeedActions(
  actions: Action[],
  isFeed = true,
  stories = false,
) {
  return (
    actions?.filter((a) => isFeed === isInstagramFeed(a.category, stories)) ??
    []
  );
}

export function isInstagramFeed(category: string, stories = false) {
  return ["post", "reels", "carousel", stories ? "stories" : null].includes(
    category,
  );
}

export const isSprint = (action: Action, person: Person) => {
  return !!action.sprints?.find((sprint) => sprint === person.user_id);
};

export const isColorValid = (color: string) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Aceita string com vírgulas (FormData legado) ou array direto (JSON)
const commaSeparatedStringToArray = z.union([
  z.array(z.string()),
  z.string().transform((val) => val.split(",").filter(Boolean)),
]);

// Mesma coisa mas permite null/undefined
const nullableCommaSeparatedStringToArray = z.union([
  z.array(z.string()).nullable().optional(),
  z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (!val || val === "null" || val === "") return null;
      return val.split(",").filter(Boolean);
    }),
]);

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
