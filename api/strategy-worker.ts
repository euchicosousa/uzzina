import { timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createServiceClient,
  getServiceConfig,
} from "../server/supabase-admin.js";
import { runStrategyWorker } from "../server/strategy-operations.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }
  const secret = process.env.STRATEGY_WORKER_SECRET;
  if (!secret || secret.length < 32)
    return res.status(503).json({ error: "Executor não configurado." });
  const header = req.headers.authorization;
  const provided =
    typeof header === "string" ? Buffer.from(header) : Buffer.alloc(0);
  const expected = Buffer.from(`Bearer ${secret}`);
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  )
    return res.status(401).json({ error: "Acesso não autorizado." });
  const config = getServiceConfig();
  const rawLimit = process.env.AI_DAILY_LIMIT ?? "100";
  const limit = Number(rawLimit);
  if (
    !config ||
    !process.env.OPENAI_API_KEY ||
    !/^\d+$/.test(rawLimit) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 10000
  )
    return res.status(503).json({ error: "Executor não configurado." });
  try {
    return res
      .status(200)
      .json(await runStrategyWorker(createServiceClient(config), limit));
  } catch {
    return res
      .status(503)
      .json({ error: "A execução será conferida novamente pelo agendador." });
  }
}
