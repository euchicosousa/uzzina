import { z } from "zod";

export const aiInputSchema = z
  .object({
    intent: z.enum(["ai-strategy", "ai-content", "ai-caption"]),
    category: z.string().trim().min(1).max(100),
    title: z.string().max(500).default(""),
    description: z.string().max(10000).default(""),
    partner_name: z.string().trim().min(1).max(500),
    partner_context: z.string().max(10000).default(""),
    racional: z.string().max(2000).default(""),
    headline: z.string().max(2000).default(""),
    direcionamento: z.string().max(2000).default(""),
    // Optional model for this generation; the server validates it per command.
    model: z.string().trim().min(1).max(100).optional(),
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
  z.object({
    intent: z.literal("ai-content"),
    output: z.object({ content: text }),
  }),
  z.object({
    intent: z.literal("ai-caption"),
    output: z.object({ caption: text }),
  }),
]);

// File reading (IA-M08). The browser never sends file addresses or model ids:
// it names an action and positions in that action's work files, and the server
// resolves the addresses and the model. `checks` carries the tail of each file
// address only to detect that the saved list changed since the dialog loaded.
export const maxFileReadFiles = 12;
const filePositions = z
  .array(z.number().int().min(0).max(99))
  .min(1)
  .max(maxFileReadFiles);
const fileChecks = z.array(z.string().max(64)).min(1).max(maxFileReadFiles);
export const fileReadInputSchema = z.discriminatedUnion("intent", [
  z
    .object({
      intent: z.literal("ai-transcribe"),
      action_id: z.string().uuid(),
      positions: filePositions.length(1),
      checks: fileChecks.length(1),
    })
    .strict(),
  z
    .object({
      intent: z.literal("ai-interpret"),
      action_id: z.string().uuid(),
      positions: filePositions,
      checks: fileChecks,
      careful: z.boolean().default(false),
    })
    .strict(),
]);
export const fileReadResultSchema = z.object({
  intent: z.enum(["ai-transcribe", "ai-interpret"]),
  output: z.object({ text: z.string().trim().min(1).max(50000) }),
  model: z.string().min(1).max(100),
});
export type FileReadPayload = z.input<typeof fileReadInputSchema>;
export type FileReadResult = z.infer<typeof fileReadResultSchema>;

export type AIPayload = z.input<typeof aiInputSchema>;
export type AIResult = z.infer<typeof aiResultSchema>;

// Matches a block that is only the word "Legenda" (optionally bold and/or
// followed by a colon), such as <h4>Legenda</h4> or <p><strong>Legenda:</strong></p>.
const CAPTION_HEADING =
  /<(h[1-6]|p)\b[^>]*>\s*(?:<(?:strong|b|em)>\s*)*legenda\s*:?\s*(?:<\/(?:strong|b|em)>\s*)*<\/\1>/i;
const NEXT_HEADING = /<h[1-6]\b/i;

// Content generation must never carry a ready-made caption. Drops a block
// titled "Legenda" and everything under it up to the next heading (or the end).
// Anything else, and a result that would end up empty, is returned unchanged.
export function stripCaptionSection(html: string): string {
  const match = CAPTION_HEADING.exec(html);
  if (!match) return html;
  const afterHeading = match.index + match[0].length;
  const next = NEXT_HEADING.exec(html.slice(afterHeading));
  const rest = next ? html.slice(afterHeading + next.index) : "";
  const result = (html.slice(0, match.index) + rest).trim();
  return result || html;
}
