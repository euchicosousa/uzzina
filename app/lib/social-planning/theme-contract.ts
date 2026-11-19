import { z } from "zod";

const planningFormatSchema = z.enum(["static", "carousel", "reels"]);
const planningPartnerSchema = z.string().trim().min(1).max(200);
const planningDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const formatCount = z.number().int().min(0).max(63);
const periodSlotLimit = 123;

const editorialInput = z.object({
  partner: planningPartnerSchema,
  direction: z.string().trim().min(1).max(10000),
  formatMode: z.enum(["auto", "manual"]),
  model: z.string().trim().min(1).max(80).optional(),
});

export const themePlanningInputSchema = editorialInput.extend({
  formats: z.array(planningFormatSchema).min(1).max(30),
});

const periodSlotSchema = z.object({
  date: planningDateSchema,
  format: planningFormatSchema,
  isExtra: z.boolean(),
  isCommemorative: z.boolean(),
  celebrationTitle: z.string().optional(),
});

export const periodPlanningInputSchema = editorialInput.extend({
  startDate: planningDateSchema,
  endDate: planningDateSchema,
  postsPerWeek: z.number().int().min(1).max(7),
  selectedDays: z
    .array(
      z
        .string()
        .refine((day) =>
          ["dom", "seg", "ter", "qua", "qui", "sex", "sab"].includes(day),
        ),
    )
    .min(1)
    .max(7),
  formatCounts: z.tuple([formatCount, formatCount, formatCount]),
  considerHolidays: z.boolean(),
  selectedCelebrationIds: z.array(z.string().uuid()).max(1024),
  expectedSlots: z.array(periodSlotSchema).min(1).max(periodSlotLimit),
});

export const themePlanningRequestSchema = z.discriminatedUnion("intent", [
  themePlanningInputSchema.extend({
    intent: z.literal("start"),
    requestId: z.string().uuid(),
  }),
  periodPlanningInputSchema.extend({
    intent: z.literal("start-period"),
    requestId: z.string().uuid(),
  }),
  z.object({
    intent: z.literal("resume"),
    partner: planningPartnerSchema,
    requestId: z.string().uuid(),
  }),
]);

const editorialSuggestion = z.object({
  format: planningFormatSchema,
  title: z.string().trim().min(1).max(200),
  objective: z.string().trim().min(1).max(400),
  briefing: z.string().trim().min(1).max(1200),
});

export const themePlanningResultSchema = z.object({
  suggestions: z.array(editorialSuggestion).min(1).max(30),
});

export const periodPlanningResultSchema = z.object({
  suggestions: z
    .array(
      editorialSuggestion.extend({
        slot: z.number().int().nonnegative(),
        date: planningDateSchema,
      }),
    )
    .min(1)
    .max(periodSlotLimit),
});

export const periodOperationSchema = z.object({
  planningMode: z.literal("period"),
  periodDirection: z.string(),
  generationModel: z.string(),
  generationSlots: z.array(periodSlotSchema).min(1).max(periodSlotLimit),
  editorialSource: z.object({
    marca: z.string(),
    contexto: z.string().nullable(),
    tom_de_voz: z.string().nullable(),
  }),
});

export const periodProgressSchema = z
  .array(
    editorialSuggestion.extend({
      id: z.string().uuid(),
      status: z.literal("pending"),
      scheduled_date: planningDateSchema,
      is_commemorative: z.boolean(),
      celebration_title: z.string().optional(),
    }),
  )
  .max(periodSlotLimit);

export type ThemePlanningInput = z.infer<typeof themePlanningInputSchema>;
export type PeriodPlanningInput = z.infer<typeof periodPlanningInputSchema>;
export type PeriodPlanningSlot = z.infer<typeof periodSlotSchema>;
export type PlanningGenerationRequest = z.infer<
  typeof themePlanningRequestSchema
>;
