import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import {
  MAX_INSTAGRAM_FILES,
  normalizeInstagramReference,
} from "../app/lib/instagram-reference.js";
import { extractBearerToken } from "../server/auth.js";
import { getCloudinaryAdminConfig } from "../server/cloudinary-admin.js";
import {
  ReferenceImportError,
  resolveInstagramReference,
  sourceItemSchema,
} from "../server/instagram-reference-source.js";
import {
  findReferenceAsset,
  referenceAssetIdentity,
  transferReferenceAsset,
  urlMatchesReferenceAsset,
} from "../server/instagram-reference-transfer.js";

const contextSchema = z.object({
  actionId: z.uuid(),
  partnerSlug: z.string().min(1).max(200),
});
const requestSchema = z.discriminatedUnion("operation", [
  contextSchema
    .extend({ operation: z.literal("prepare"), url: z.string().max(2048) })
    .strict(),
  contextSchema
    .extend({
      operation: z.literal("transfer"),
      ticket: z
        .string()
        .max(120_000)
        .regex(/^[\w-]+$/),
      position: z
        .number()
        .int()
        .min(0)
        .max(MAX_INSTAGRAM_FILES - 1),
      retry: z.boolean(),
    })
    .strict(),
]);
const ticketSchema = z.object({
  actionId: z.uuid(),
  partnerId: z.uuid(),
  userId: z.uuid(),
  url: z.string(),
  expiresAt: z.number(),
  items: z.array(sourceItemSchema).min(1).max(MAX_INSTAGRAM_FILES),
});
type Ticket = z.infer<typeof ticketSchema>;

function ticketKey(secret: string) {
  return createHmac("sha256", secret)
    .update("uzzina instagram-reference ticket v1")
    .digest();
}
function seal(ticket: Ticket, key: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([
    cipher.update(JSON.stringify(ticket)),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
}
function unseal(ticket: string, key: Buffer) {
  try {
    const data = Buffer.from(ticket, "base64url");
    const cipher = createDecipheriv("aes-256-gcm", key, data.subarray(0, 12));
    cipher.setAuthTag(data.subarray(12, 28));
    return ticketSchema.parse(
      JSON.parse(
        Buffer.concat([
          cipher.update(data.subarray(28)),
          cipher.final(),
        ]).toString("utf8"),
      ),
    );
  } catch {
    return null;
  }
}
const MAX_WORK_FILES = 100;
const noSpace = "Não há espaço para todos os arquivos desta referência.";
const restart = "A importação expirou. Importe o mesmo link para continuar.";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }
  const bearer = extractBearerToken(req);
  if (!bearer) return res.status(401).json({ error: "Sua sessão expirou." });
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Dados de importação inválidos." });
  const input = parsed.data;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const cloud = getCloudinaryAdminConfig();
  const apiKey = process.env.COMPOSIO_API_KEY?.trim();
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !cloud || !apiKey || !publishableKey)
    return res
      .status(503)
      .json({ error: "A importação do Instagram não está configurada." });

  try {
    const viewer = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: `Bearer ${bearer}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: auth, error: authError } = await viewer.auth.getUser(bearer);
    if (authError || !auth.user)
      return res.status(401).json({ error: "Sua sessão expirou." });
    const [canEdit, actionResult, partnerResult] = await Promise.all([
      viewer.rpc("can_access_action", { p_action_id: input.actionId }),
      viewer
        .from("actions")
        .select("partners, work_files")
        .eq("id", input.actionId)
        .eq("archived", false)
        .maybeSingle(),
      viewer
        .from("partners")
        .select("id")
        .eq("slug", input.partnerSlug)
        .eq("archived", false)
        .maybeSingle(),
    ]);
    const action = actionResult.data;
    const partnerId = z.uuid().safeParse(partnerResult.data?.id);
    if (
      canEdit.error ||
      canEdit.data !== true ||
      actionResult.error ||
      partnerResult.error ||
      !partnerId.success ||
      !Array.isArray(action?.partners) ||
      !action.partners.includes(input.partnerSlug)
    )
      return res.status(403).json({
        error: "Você não pode editar esta ação ou usar o parceiro escolhido.",
      });
    const files: string[] = Array.isArray(action.work_files)
      ? action.work_files.filter(
          (item: unknown): item is string => typeof item === "string",
        )
      : [];
    const userId = auth.user.id;
    const key = ticketKey(cloud.apiSecret);
    const identity = (url: string, position: number) =>
      referenceAssetIdentity(
        partnerId.data,
        input.actionId,
        url.split("/")[4] ?? "",
        position,
      );
    const attached = (url: string, position: number, kind: "image" | "video") =>
      files.find((file) =>
        urlMatchesReferenceAsset(
          file,
          cloud.cloudName,
          kind,
          identity(url, position),
        ),
      );

    if (input.operation === "prepare") {
      const url = normalizeInstagramReference(input.url);
      if (!url)
        throw new ReferenceImportError(
          "Cole um link público de publicação ou Reel do Instagram.",
          400,
        );
      if (files.length >= MAX_WORK_FILES)
        throw new ReferenceImportError(noSpace, 409);
      const items = await resolveInstagramReference(apiKey, userId, url);
      if (!items.some((item) => item.sourceUrl))
        throw new ReferenceImportError(
          "Nenhum arquivo compatível está disponível nesta publicação.",
          422,
        );
      const missing = items.filter(
        (item, index) => !attached(url, index, item.kind),
      ).length;
      if (files.length + missing > MAX_WORK_FILES)
        throw new ReferenceImportError(noSpace, 409);
      return res.status(200).json({
        ticket: seal(
          {
            actionId: input.actionId,
            partnerId: partnerId.data,
            userId,
            url,
            items,
            expiresAt: Date.now() + 3_600_000,
          },
          key,
        ),
        items: items.map((item, position) => ({
          position,
          kind: item.kind,
          url: attached(url, position, item.kind) ?? null,
        })),
      });
    }

    const ticket = unseal(input.ticket, key);
    if (
      !ticket ||
      ticket.userId !== userId ||
      ticket.actionId !== input.actionId ||
      ticket.partnerId !== partnerId.data
    )
      throw new ReferenceImportError(
        "A importação não pertence a esta ação ou parceiro.",
        403,
      );
    const item = ticket.items[input.position];
    if (!item)
      throw new ReferenceImportError("Item da importação inválido.", 400);
    const knownUrl = attached(ticket.url, input.position, item.kind);
    if (knownUrl)
      return res.status(200).json({
        url: knownUrl,
        position: input.position,
        ticket: input.ticket,
      });
    if (files.length >= MAX_WORK_FILES)
      throw new ReferenceImportError(noSpace, 409);
    const destination = identity(ticket.url, input.position);
    if (input.retry) {
      const existingUrl = await findReferenceAsset(
        cloud,
        item.kind,
        destination,
      );
      if (existingUrl)
        return res.status(200).json({
          url: existingUrl,
          position: input.position,
          ticket: input.ticket,
        });
    }
    if (Date.now() > ticket.expiresAt)
      throw new ReferenceImportError(restart, 409);
    let nextTicket = input.ticket;
    let url: string;
    try {
      url = await transferReferenceAsset(cloud, item, destination);
    } catch (error) {
      if (
        !(
          error instanceof ReferenceImportError &&
          error.code === "SOURCE_EXPIRED"
        ) &&
        !(input.retry && item.sourceUrl === null)
      )
        throw error;
      const refreshed = await resolveInstagramReference(
        apiKey,
        userId,
        ticket.url,
      );
      if (
        refreshed.length !== ticket.items.length ||
        refreshed.some((candidate, position) => {
          const previous = ticket.items[position];
          return (
            !previous ||
            candidate.kind !== previous.kind ||
            (previous.id !== null && candidate.id !== previous.id)
          );
        })
      )
        throw new ReferenceImportError(
          "A publicação mudou. Confira o link antes de importar novamente.",
          409,
        );
      const refreshedItem = refreshed[input.position];
      if (!refreshedItem) throw new ReferenceImportError(restart, 409);
      nextTicket = seal({ ...ticket, items: refreshed }, key);
      url = await transferReferenceAsset(cloud, refreshedItem, destination);
    }
    return res
      .status(200)
      .json({ url, position: input.position, ticket: nextTicket });
  } catch (error) {
    if (error instanceof ReferenceImportError)
      return res.status(error.status).json({ error: error.message });
    return res
      .status(502)
      .json({ error: "Não foi possível importar agora. Tente novamente." });
  }
}
