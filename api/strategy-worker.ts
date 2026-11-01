import { createHmac, timingSafeEqual } from "node:crypto";
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
  const timestamp = req.headers["x-strategy-timestamp"];
  const nonce = req.headers["x-strategy-nonce"];
  const signature = req.headers["x-strategy-signature"];
  const issuedAt = typeof timestamp === "string" ? Number(timestamp) : NaN;
  if (
    req.headers.authorization !== undefined ||
    typeof timestamp !== "string" ||
    !/^(0|[1-9]\d{0,15})$/.test(timestamp) ||
    !Number.isSafeInteger(issuedAt) ||
    Math.abs(Date.now() / 1000 - issuedAt) > 60 ||
    typeof nonce !== "string" ||
    !/^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
      nonce,
    ) ||
    typeof signature !== "string" ||
    !/^[\da-f]{64}$/i.test(signature)
  )
    return res.status(401).json({ error: "Acesso não autorizado." });
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}:${nonce}:POST:/api/strategy-worker`)
    .digest();
  if (!timingSafeEqual(Buffer.from(signature, "hex"), expected))
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
