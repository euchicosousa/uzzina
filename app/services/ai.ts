import OpenAI from "openai";
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
const model = "gpt-5.6-luna";
export async function callAI(payload: AIPayload): Promise<AIResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_OPENAI_API_KEY não configurada no cliente.");
  }
  const {
    intent,
    title = "",
    description = "",
    partner_context = "",
    hook = "",
    racional = "",
  } = payload;
  const client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
  if (intent === "ai-hooks") {
    const response = await client.chat.completions.create({
      model,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "Você é o Estrategista-Chefe da CNVT. Selecione os 5 melhores ângulos do arsenal CNVT e retorne em JSON.",
        },
        {
          role: "user",
          content: `CONTEXTO DA MARCA E TOM DE VOZ:\n${partner_context}\n\nTEMA GERAL:\n${title}\n\nINSUMO:\n${description}\n\nGere os ângulos em JSON.`,
        },
      ],
    });
    const output = JSON.parse(response.choices[0].message.content ?? "{}");
    return {
      output,
      intent,
    };
  }
  if (intent === "ai-caption") {
    const response = await client.chat.completions.create({
      model,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "Você é o Estrategista-Chefe da CNVT. Gere uma legenda profissional em JSON contendo somente a propriedade 'caption'.",
        },
        {
          role: "user",
          content: `CONTEXTO DA MARCA:\n${partner_context}\n\nTÍTULO:\n${title}\n\nDIREÇÃO:\n${description}\n\nGere a Legenda em JSON contendo a propriedade "caption".`,
        },
      ],
    });
    const output = JSON.parse(response.choices[0].message.content ?? "{}");
    return {
      output,
      intent,
    };
  }
  if (intent === "ai-post") {
    const response = await client.chat.completions.create({
      model,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "Você é o Estrategista-Chefe da CNVT. Gere conteúdo de Post Estático com 'content' e 'caption' em JSON.",
        },
        {
          role: "user",
          content: `CATEGORIA: Post Estático\nESTRATÉGIA:\nRacional: ${racional}\nHook: ${hook}\n\nCONTEXTO:\n${partner_context}\n\nINSUMO:\n${description}`,
        },
      ],
    });
    const output = JSON.parse(response.choices[0].message.content ?? "{}");
    return {
      output,
      intent,
    };
  }
  if (intent === "ai-carousel") {
    const response = await client.chat.completions.create({
      model,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "Você é o Estrategista-Chefe da CNVT. Gere roteiro de Carrossel com 'content' e 'caption' em JSON.",
        },
        {
          role: "user",
          content: `CATEGORIA: Carrossel\nTÍTULO:\n${title}\n\nINSUMO:\n${description}\n\nCONTEXTO:\n${partner_context}`,
        },
      ],
    });
    const output = JSON.parse(response.choices[0].message.content ?? "{}");
    return {
      output,
      intent,
    };
  }
  if (intent === "ai-reels") {
    const response = await client.chat.completions.create({
      model,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "Você é o Estrategista-Chefe da CNVT. Gere roteiro de Reels com 'content' e 'caption' em JSON.",
        },
        {
          role: "user",
          content: `CATEGORIA: Reels\nTÍTULO:\n${title}\n\nINSUMO:\n${description}\n\nCONTEXTO:\n${partner_context}`,
        },
      ],
    });
    const output = JSON.parse(response.choices[0].message.content ?? "{}");
    return {
      output,
      intent,
    };
  }
  throw new Error("Intent inválido ou não suportado.");
}
