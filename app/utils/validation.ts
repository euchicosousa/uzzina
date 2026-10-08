import type { Action, Person } from "~/types";
import { isBefore } from "date-fns";
import { z } from "zod";
import { PHASES } from "~/lib/CONSTANTS";
export const isLateAction = (action: Action) =>
  action.phase !== PHASES.finished.slug &&
  isBefore(new Date(action.date), new Date());
export function getInstagramFeedActions<T extends { category: string }>(
  actions: T[],
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
export function isSocialMediaContent(category: string) {
  return ["post", "reels", "carousel", "stories"].includes(category);
}
export const isSprint = (action: Action, person?: Person) => {
  if (!person) return false;
  return !!action.sprints?.find((sprint) => sprint === person.user_id);
};

// Aceita string com vírgulas (FormData legado) ou array direto (JSON)
const requiredPartnersArray = z
  .union([
    z.array(z.string()),
    z.string().transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ])
  .refine(
    (arr) => Array.isArray(arr) && arr.length > 0,
    "Pelo menos um parceiro é obrigatório",
  );

const optionalPartnersArray = z
  .union([
    z.array(z.string()),
    z.string().transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
    z.undefined(),
  ])
  .refine(
    (arr) => arr === undefined || (Array.isArray(arr) && arr.length > 0),
    "Pelo menos um parceiro é obrigatório",
  );

const responsiblesArray = z
  .union([
    z.array(z.string()),
    z.string().transform((val) => {
      if (!val || val === "null" || val === "") return [];
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }),
    z.null().transform(() => []),
    z.undefined(),
  ])
  .transform((val) => {
    if (val === undefined) return undefined;
    if (Array.isArray(val)) return val;
    return [];
  });

// Validação estrita de formato de data (ISO ou YYYY-MM-DD HH:mm:ss)
const validDateString = z
  .string()
  .min(1, "A data é obrigatória")
  .refine((val) => {
    if (!/^\d{4}-\d{2}-\d{2}/.test(val)) return false;
    const parsed = new Date(val.replace(" ", "T"));
    return !Number.isNaN(parsed.getTime());
  }, "Data inválida");

// Helper para arrays/listas que podem ser omitidos (undefined), limpos (null) ou atualizados
const nullableArrayOrCommaString = z
  .union([z.array(z.string()), z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === undefined) return undefined;
    if (val === null || val === "null" || val === "") return null;
    if (Array.isArray(val)) return val;
    const split = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return split.length > 0 ? split : null;
  });

// Distingue ausente (undefined) de explicitamente limpo (null / "")
const nullableOptionalString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === undefined) return undefined;
    if (val === null || val === "null" || val === "") return null;
    return val;
  });

/**
 * Esquema estrito para criação de uma nova ação.
 * Exige campos obrigatórios com defaults para os opcionais.
 */
export const ActionCreateSchema = z.object({
  title: z.string().trim().min(2, "O Título deve ter pelo menos 2 caracteres"),
  date: validDateString,
  category: z.string().min(1, "A categoria é obrigatória"),
  priority: z.string().min(1, "A prioridade é obrigatória"),
  partners: requiredPartnersArray,
  responsibles: responsiblesArray.default([]),
  description: nullableOptionalString.default(null),
  content_files: nullableArrayOrCommaString.default(null),
  work_files: nullableArrayOrCommaString.default(null),
  sprints: nullableArrayOrCommaString.default(null),
  instagram_caption: nullableOptionalString.default(null),
  content_description: nullableOptionalString.default(null),
  color: z.string().nullable().optional().default("#666666"),
  phase: z.string().optional().default("idea"),
  strategies: z.unknown().optional().nullable(),
  time: z.number().optional().nullable().default(10),
  user_id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  archived: z.boolean().nullable().optional().default(false),
});

/**
 * Esquema para patch parcial de atualização.
 * Todos os campos são opcionais. Campos omitidos permanecem `undefined`
 * e nunca sobrescrevem valores pré-existentes no banco.
 */
export const ActionPatchSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "O Título deve ter pelo menos 2 caracteres")
    .optional(),
  date: validDateString.optional(),
  category: z.string().min(1).optional(),
  priority: z.string().min(1).optional(),
  partners: optionalPartnersArray.optional(),
  responsibles: responsiblesArray.optional(),
  description: nullableOptionalString.optional(),
  content_files: nullableArrayOrCommaString.optional(),
  work_files: nullableArrayOrCommaString.optional(),
  sprints: nullableArrayOrCommaString.optional(),
  instagram_caption: nullableOptionalString.optional(),
  content_description: nullableOptionalString.optional(),
  color: z.string().optional().nullable(),
  phase: z.string().optional().nullable(),
  strategies: z.unknown().optional().nullable(),
  time: z.number().optional().nullable(),
  user_id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  archived: z.boolean().optional().nullable(),
});

// Compatibilidade retroativa
export const ActionFormSchema = ActionCreateSchema;

export type ActionCreateInput = z.input<typeof ActionCreateSchema>;
export type ActionCreateOutput = z.output<typeof ActionCreateSchema>;
export type ActionPatchInput = z.input<typeof ActionPatchSchema>;
export type ActionPatchOutput = z.output<typeof ActionPatchSchema>;
export type ActionFormInput = ActionCreateInput;
export type ActionFormOutput = ActionCreateOutput;
