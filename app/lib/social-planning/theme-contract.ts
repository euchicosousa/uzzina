import { z } from "zod";

const planningFormatSchema = z.enum(["static", "carousel", "reels"]);
const planningPartnerSchema = z.string().trim().min(1).max(200);

export const themePlanningInputSchema = z.object({
  partner: planningPartnerSchema,
  direction: z.string().trim().min(1).max(10000),
  formats: z.array(planningFormatSchema).min(1).max(30),
  formatMode: z.enum(["auto", "manual"]),
  model: z.string().trim().min(1).max(80).optional(),
});

export const themePlanningRequestSchema = z.discriminatedUnion("intent", [
  themePlanningInputSchema.extend({
    intent: z.literal("start"),
    requestId: z.string().uuid(),
  }),
  z.object({
    intent: z.literal("resume"),
    partner: planningPartnerSchema,
    requestId: z.string().uuid(),
  }),
]);

export const themePlanningResultSchema = z.object({
  suggestions: z
    .array(
      z.object({
        format: planningFormatSchema,
        title: z.string().trim().min(1).max(200),
        objective: z.string().trim().min(1).max(400),
        briefing: z.string().trim().min(1).max(1200),
      }),
    )
    .min(1)
    .max(30),
});

export type ThemePlanningInput = z.infer<typeof themePlanningInputSchema>;
export type ThemePlanningRequest = z.infer<typeof themePlanningRequestSchema>;
