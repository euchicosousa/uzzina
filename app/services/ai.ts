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
    const errorData = await response.json();
    throw new Error(errorData.error || "Falha ao processar requisição de IA no servidor.");
  }

  return response.json() as Promise<AIResult>;
}
