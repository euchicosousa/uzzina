import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY não configurada no servidor." });
  }

  const { intent, title = "", description = "", partner_context = "", hook = "", racional = "" } = req.body;

  if (!intent) {
    return res.status(400).json({ error: "Intent é obrigatório." });
  }

  try {
    const client = new OpenAI({ apiKey });

    // Vamos mapear os intents conforme definidos no app/lib/CONSTANTS.ts e no ai.ts original
    if (intent === "ai-hooks") {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Você é o Estrategista-Chefe da CNVT. Selecione os 5 melhores ângulos do arsenal CNVT e retorne em JSON.",
          },
          {
            role: "user",
            content: `CONTEXTO DA MARCA E TOM DE VOZ:\n${partner_context}\n\nTEMA GERAL:\n${title}\n\nINSUMO:\n${description}\n\nGere os ângulos em JSON.`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content ?? "{}");
      return res.status(200).json({ output, intent });
    }

    if (intent === "ai-caption") {
      const response = await client.chat.completions.create({
        model: "gpt-5.3-chat-latest",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Você é o Estrategista-Chefe da CNVT. Gere uma legenda profissional em JSON contendo somente a propriedade 'caption'.",
          },
          {
            role: "user",
            content: `CONTEXTO DA MARCA:\n${partner_context}\n\nTÍTULO:\n${title}\n\nDIREÇÃO:\n${description}\n\nGere a Legenda em JSON contendo a propriedade "caption".`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content ?? "{}");
      return res.status(200).json({ output, intent });
    }

    if (intent === "ai-post") {
      const response = await client.chat.completions.create({
        model: "gpt-5.3-chat-latest",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Você é o Estrategista-Chefe da CNVT. Gere conteúdo de Post Estático com 'content' e 'caption' em JSON.",
          },
          {
            role: "user",
            content: `CATEGORIA: Post Estático\nESTRATÉGIA:\nRacional: ${racional}\nHook: ${hook}\n\nCONTEXTO:\n${partner_context}\n\nINSUMO:\n${description}`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content ?? "{}");
      return res.status(200).json({ output, intent });
    }

    if (intent === "ai-carousel") {
      const response = await client.chat.completions.create({
        model: "gpt-5.3-chat-latest",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Você é o Estrategista-Chefe da CNVT. Gere roteiro de Carrossel com 'content' e 'caption' em JSON.",
          },
          {
            role: "user",
            content: `CATEGORIA: Carrossel\nTÍTULO:\n${title}\n\nINSUMO:\n${description}\n\nCONTEXTO:\n${partner_context}`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content ?? "{}");
      return res.status(200).json({ output, intent });
    }

    if (intent === "ai-reels") {
      const response = await client.chat.completions.create({
        model: "gpt-5.3-chat-latest",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Você é o Estrategista-Chefe da CNVT. Gere roteiro de Reels com 'content' e 'caption' em JSON.",
          },
          {
            role: "user",
            content: `CATEGORIA: Reels\nTÍTULO:\n${title}\n\nINSUMO:\n${description}\n\nCONTEXTO:\n${partner_context}`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content ?? "{}");
      return res.status(200).json({ output, intent });
    }

    return res.status(400).json({ error: "Intent inválido ou não suportado." });
  } catch (error: unknown) {
    console.error("Erro no processamento da API de IA:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor.";
    return res.status(500).json({ error: errorMessage });
  }
}
