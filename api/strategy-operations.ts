import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import {
  strategyCommandSchema,
  strategyOperationSchema,
} from "../app/lib/strategy-operation-contract.js";
import { extractBearerToken } from "../server/auth.js";
import {
  createServiceClient,
  getServiceConfig,
} from "../server/supabase-admin.js";
import {
  StrategyStoreError,
  strategyRPC,
} from "../server/strategy-operations.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Método não permitido." });
  }
  const token = extractBearerToken(req);
  if (!token)
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  const capability = req.method === "GET" && req.query.capability === "true";
  const config = getServiceConfig();
  if (!config)
    return res
      .status(503)
      .json({ error: "O serviço de estratégias está indisponível." });
  try {
    const client = createServiceClient(config);
    const {
      data: { user },
      error,
    } = await client.auth.getUser(token);
    if (error || !user)
      return res.status(401).json({ error: "Sessão inválida ou expirada." });
    const { data: member, error: memberError } = await client
      .from("people")
      .select("visible")
      .eq("user_id", user.id)
      .single();
    if (memberError)
      return res
        .status(503)
        .json({ error: "Não foi possível verificar seu acesso." });
    if (!member?.visible)
      return res.status(403).json({ error: "Seu acesso está desativado." });
    if (capability)
      return res.status(200).json({
        configured: true,
        ready:
          process.env.UZZINA_STRATEGY_ACCEPTING !== "false" &&
          (await strategyRPC(client, "strategy_ready")) === true,
      });
    if (req.method === "GET") {
      const actionId = z.uuid().safeParse(req.query.actionId);
      if (!actionId.success)
        return res.status(400).json({ error: "Ação inválida." });
      const operation = await strategyRPC(client, "read_strategy_operation", {
        p_user_id: user.id,
        p_action_id: actionId.data,
      });
      return res.status(200).json({
        operation:
          operation === null ? null : strategyOperationSchema.parse(operation),
      });
    }
    const serialized =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
    if (Buffer.byteLength(serialized, "utf8") > 2048)
      return res.status(413).json({ error: "Solicitação muito grande." });
    const body: unknown =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const parsed = strategyCommandSchema.safeParse(body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Solicitação de estratégias inválida." });
    const command = parsed.data;
    if (
      command.command === "accept" &&
      process.env.UZZINA_STRATEGY_ACCEPTING === "false"
    )
      return res.status(503).json({
        error:
          "Novas gerações estão pausadas. As operações aceitas continuam no servidor.",
      });
    const current =
      command.command === "retry"
        ? await strategyRPC(client, "read_strategy_operation", {
            p_user_id: user.id,
            p_action_id: command.actionId,
          })
        : null;
    if (
      command.command === "retry" &&
      (!current ||
        strategyOperationSchema.parse(current).id !== command.operationId)
    )
      return res
        .status(409)
        .json({ error: "A operação mudou. Reabra a ação para conferir." });
    const operation =
      command.command === "accept"
        ? await strategyRPC(client, "accept_strategy_operation", {
            p_user_id: user.id,
            p_action_id: command.actionId,
            p_operation_id: command.operationId,
            p_expected_version: command.expectedVersion,
          })
        : await strategyRPC(client, "retry_strategy_result", {
            p_user_id: user.id,
            p_operation_id: command.operationId,
            p_expected_version: command.expectedVersion,
            p_confirm_changed_source: command.confirmChangedSource,
          });
    return res
      .status(command.command === "accept" ? 202 : 200)
      .json({ operation: strategyOperationSchema.parse(operation) });
  } catch (error) {
    if (error instanceof SyntaxError)
      return res.status(400).json({ error: "JSON inválido." });
    const code = error instanceof StrategyStoreError ? error.code : null;
    if (code === "P0003")
      return res.status(429).json({
        code: "AI_MONTHLY_ALLOWANCE_EXCEEDED",
        error: "Sua franquia mensal de IA não tem saldo para esta geração.",
      });
    if (code === "42501")
      return res
        .status(403)
        .json({ error: "A ação não está disponível para sua conta." });
    if (code === "40001" || code === "23505")
      return res.status(409).json({
        error:
          "A ação mudou ou já tem uma geração em andamento. Reabra para conferir.",
      });
    if (code === "22023" || code === "22007" || code === "22008")
      return res.status(400).json({
        error:
          "Revise o título, o formato e o contexto da ação antes de gerar.",
      });
    return res.status(503).json({
      error:
        "Não foi possível confirmar a operação. Confira o estado da ação antes de tentar novamente.",
    });
  }
}
