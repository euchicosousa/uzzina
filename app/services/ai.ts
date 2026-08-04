export interface AIPayload {
  intent: string;
  title?: string;
  description?: string;
  partner_context?: string;
  hook?: string;
  racional?: string;
}

export interface AIResult {
  intent: string;
  output: unknown;
}

export async function callAI(payload: AIPayload): Promise<AIResult> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: "Erro desconhecido." }));
    const message =
      typeof errorBody === "object" && errorBody !== null && "error" in errorBody
        ? String((errorBody as { error: unknown }).error)
        : "Erro na API de IA.";
    throw new Error(message);
  }

  const data = (await response.json()) as AIResult;
  return data;
}
