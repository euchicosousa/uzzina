import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { INTENT } from "../app/lib/CONSTANTS";

const contents = {
  hooks: `
=== PROTOCOLO DE HOOKS (ANATOMIA DO IMPACTO) ===
O hook deve ter no máximo 20 palavras.
Você deve selecionar os 5 melhores ângulos do arsenal CNVT e retornar em formato JSON correspondente.
`,
  post: `
=== PROTCOLO DE POST ESTÁTICO ===
Gere a resposta estruturada com o conteúdo final (content e caption) em JSON.
`,
  caption: `
=== PROTOCOLO DE LEGENDA ===
Você deve agir como o Estrategista-Chefe da CNVT.
Gere a legenda em JSON contendo um único campo "caption".
`,
  carousel: `
=== PROTOCOLO DE CARROSSEL ===
Gere a resposta estruturada em JSON com "content" e "caption".
`,
  reels: `
=== PROTOCOLO DE REELS ===
Gere o roteiro e a legenda em JSON.
`,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { intent, title, description, partner_context, hook, racional } = req.body;

  const client = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
  });

  try {
    if (intent === INTENT.ai_hooks) {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: contents.hooks },
          {
            role: "user",
            content: `CONTEXTO DA MARCA E TOM DE VOZ:\n${partner_context}\n\nTEMA GERAL:\n${title}\n\nINSUMO:\n${description}\n\nGere os ângulos em JSON.`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content || "{}");
      return res.status(200).json({ output, intent });
    }

    if (intent === INTENT.ai_post) {
      const response = await client.chat.completions.create({
        model: "gpt-5.3-chat-latest",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: contents.post },
          {
            role: "user",
            content: `CATEGORIA: Post Estático\nESTRATÉGIA:\nRacional: ${racional}\nHook: ${hook}\n\nCONTEXTO:\n${partner_context}\n\nINSUMO:\n${description}`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content || "{}");
      return res.status(200).json({ output, intent });
    }

    if (intent === INTENT.ai_caption) {
      const response = await client.chat.completions.create({
        model: "gpt-5.3-chat-latest",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: contents.caption },
          {
            role: "user",
            content: `CONTEXTO DA MARCA:\n${partner_context}\n\nTÍTULO:\n${title}\n\nDIREÇÃO:\n${description}\n\nGere a Legenda em JSON contendo a propriedade "caption".`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content || "{}");
      return res.status(200).json({ output, intent });
    }

    if (intent === INTENT.ai_carousel) {
      const response = await client.chat.completions.create({
        model: "gpt-5.3-chat-latest",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: contents.carousel },
          {
            role: "user",
            content: `CATEGORIA: Carrossel\nTÍTULO:\n${title}\n\nINSUMO:\n${description}\n\nCONTEXTO:\n${partner_context}`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content || "{}");
      return res.status(200).json({ output, intent });
    }

    if (intent === INTENT.ai_reels) {
      const response = await client.chat.completions.create({
        model: "gpt-5.3-chat-latest",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: contents.reels },
          {
            role: "user",
            content: `CATEGORIA: Reels\nTÍTULO:\n${title}\n\nINSUMO:\n${description}\n\nCONTEXTO:\n${partner_context}`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content || "{}");
      return res.status(200).json({ output, intent });
    }

    return res.status(400).json({ error: "Invalid intent" });
  } catch (error) {
    console.error("AI handler error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ error: message });
  }
}
