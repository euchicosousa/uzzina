import { z } from "zod";

export const aiInputSchema = z
  .object({
    intent: z.enum(["ai-strategy", "ai-content", "ai-hooks", "ai-caption"]),
    category: z.string().trim().min(1).max(100),
    title: z.string().max(500).default(""),
    description: z.string().max(10000).default(""),
    partner_context: z.string().max(10000).default(""),
    racional: z.string().max(2000).default(""),
    headline: z.string().max(2000).default(""),
    direcionamento: z.string().max(2000).default(""),
  })
  .strict();

const text = z.string().trim().min(1).max(50000);
const strategies = z.object({
  strategies: z
    .array(
      z.object({
        headline: text,
        angulo: text,
        racional: text,
        direcionamento: text,
      }),
    )
    .length(5),
});
export const aiResultSchema = z.discriminatedUnion("intent", [
  z.object({ intent: z.literal("ai-strategy"), output: strategies }),
  z.object({ intent: z.literal("ai-hooks"), output: strategies }),
  z.object({
    intent: z.literal("ai-content"),
    output: z.object({ content: text }),
  }),
  z.object({
    intent: z.literal("ai-caption"),
    output: z.object({ caption: text }),
  }),
]);
export type AIPayload = z.input<typeof aiInputSchema>;
export type AIResult = z.infer<typeof aiResultSchema>;
