import { z } from "zod";
import { aiResultSchema } from "./ai-contract.js";

export const strategyOperationSchema = z.object({
  id: z.uuid(),
  actionId: z.uuid(),
  state: z.enum([
    "queued",
    "generating",
    "generated",
    "succeeded",
    "failed",
    "conflict",
    "uncertain",
  ]),
  result: aiResultSchema.options[0].shape.output.shape.strategies.nullable(),
  errorCode: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StrategyOperation = z.infer<typeof strategyOperationSchema>;
export const strategyCommandSchema = z.discriminatedUnion("command", [
  z
    .object({
      command: z.literal("accept"),
      model: z.string().trim().min(1).max(100).optional(),
      actionId: z.uuid(),
      operationId: z.uuid(),
      expectedVersion: z.string().min(19).max(35),
    })
    .strict(),
  z
    .object({
      command: z.literal("retry"),
      actionId: z.uuid(),
      operationId: z.uuid(),
      expectedVersion: z.string().min(19).max(35),
      confirmChangedSource: z.boolean().default(false),
    })
    .strict(),
]);

export function strategyOperationMessage(
  operation: StrategyOperation,
): string | null {
  if (operation.state === "uncertain")
    return "Não foi possível confirmar a resposta da IA. A geração não será repetida automaticamente. Confira o resultado antes de pedir uma nova geração.";
  if (operation.state === "conflict")
    return "A ação ou o contexto mudou durante a geração. O resultado foi preservado para revisão e não substituiu as estratégias atuais.";
  if (operation.errorCode === "ACCESS_REVOKED")
    return "Seu acesso a esta ação mudou. As estratégias não foram aplicadas.";
  if (operation.errorCode === "QUOTA_EXCEEDED")
    return "Seu limite diário de IA foi atingido. Aguarde a renovação às 00h UTC.";
  if (operation.errorCode === "SAVE_FAILED")
    return "A IA terminou, mas as estratégias ainda não foram salvas. Tente aplicar o resultado preservado.";
  if (operation.state === "failed")
    return "Não foi possível concluir a geração. Seu texto foi mantido.";
  return null;
}
