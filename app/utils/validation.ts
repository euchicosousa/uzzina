import type { Action, Person } from "~/types";
import { isBefore } from "date-fns";
import { z } from "zod";
import { PHASES } from "~/lib/CONSTANTS";

export const isLateAction = (action: Action) =>
  action.phase !== PHASES.concluido.slug &&
  isBefore(new Date(action.date), new Date());



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

export const isSprint = (action: Action, person?: Person) => {
  if (!person) return false;
  return !!action.sprints?.find((sprint) => sprint === person.user_id);
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

export const ActionFormSchema = z.object({
  title: z.string().min(2, "O Título deve ter pelo menos 2 caracteres"),
  date: z.string().min(1, "A data é obrigatória"),
  category: z.string().min(1, "A categoria é obrigatória"),

  priority: z.string().min(1, "A prioridade é obrigatória"),
  description: nullableString,

  responsibles: commaSeparatedStringToArray,
  partners: commaSeparatedStringToArray,

  content_files: nullableCommaSeparatedStringToArray,
  work_files: nullableCommaSeparatedStringToArray,
  sprints: nullableCommaSeparatedStringToArray,

  instagram_caption: nullableString,
  color: z.string().optional(),
  phase: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  archived: z.boolean().nullable().optional(),
});

export type ActionFormInput = z.input<typeof ActionFormSchema>;
export type ActionFormOutput = z.output<typeof ActionFormSchema>;

