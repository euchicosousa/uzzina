import { z } from "zod";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  strategyOperationSchema,
  type StrategyOperation,
} from "~/lib/strategy-operation-contract";

export class StrategyRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request(query: string, body?: unknown): Promise<unknown> {
  const {
    data: { session },
  } = await createSupabaseBrowserClient().auth.getSession();
  if (!session?.access_token)
    throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(`/api/strategy-operations${query}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    const failure: unknown = await response.json().catch(() => null);
    const message =
      failure &&
      typeof failure === "object" &&
      "error" in failure &&
      typeof failure.error === "string"
        ? failure.error
        : "Não foi possível confirmar a operação. Reabra a ação antes de tentar novamente.";
    throw new StrategyRequestError(response.status, message);
  }
  return response.json();
}
const responseSchema = z.object({
  operation: strategyOperationSchema.nullable(),
});
export async function readStrategyOperation(
  actionId: string,
): Promise<StrategyOperation | null> {
  return responseSchema.parse(
    await request(`?actionId=${encodeURIComponent(actionId)}`),
  ).operation;
}
export async function strategyCapability() {
  return z
    .object({ configured: z.boolean(), ready: z.boolean() })
    .parse(await request("?capability=true"));
}
export async function acceptStrategyOperation(
  actionId: string,
  operationId: string,
  expectedVersion: string,
) {
  return responseSchema.parse(
    await request("", {
      command: "accept",
      actionId,
      operationId,
      expectedVersion,
    }),
  ).operation;
}
export async function retryStrategyResult(
  actionId: string,
  operationId: string,
  expectedVersion: string,
  confirmChangedSource: boolean,
) {
  return responseSchema.parse(
    await request("", {
      command: "retry",
      actionId,
      operationId,
      expectedVersion,
      confirmChangedSource,
    }),
  ).operation;
}
