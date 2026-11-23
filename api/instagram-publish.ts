import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import {
  getInstagramPublishMediaKind,
  instagramPublishMediaError,
} from "../app/lib/instagram-publish-media.js";
import { extractBearerToken } from "../server/auth.js";
import { getServiceConfig } from "../server/supabase-admin.js";
import { getComposioConfiguration } from "../server/composio-config.js";
import {
  getInstagramConnectedAccount,
  getInstagramProfile,
} from "../server/composio-instagram.js";
import {
  makePartnerComposioUserId,
  parseInstagramAccountObservation,
} from "../app/lib/partner-instagram-contract.js";

const inputSchema = z
  .object({
    actionId: z.uuid(),
    partnerSlug: z.string().min(1).max(200),
    profileUsername: z.string().min(1).max(31),
    format: z.enum(["feed", "video", "reel", "stories"]),
    files: z.array(z.url()).min(1).max(20),
    caption: z.string().max(2200),
    confirmed: z.literal(true),
  })
  .strict();
type Connection = {
  connected_account_id: string;
  composio_user_id: string;
  profile_username: string;
};
type Result = { id: string; permalink: string | null };
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
async function graph(
  apiKey: string,
  connection: Connection,
  endpoint: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await fetch(
    "https://backend.composio.dev/api/v3.1/tools/execute/proxy",
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        connected_account_id: connection.connected_account_id,
        user_id: connection.composio_user_id,
        endpoint,
        method,
        ...(body ? { body } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!response.ok) throw new Error("PROVIDER_REQUEST_FAILED");
  const result: unknown = await response.json();
  if (
    !isRecord(result) ||
    typeof result.status !== "number" ||
    result.status < 200 ||
    result.status >= 300 ||
    !isRecord(result.data)
  )
    throw new Error("PROVIDER_REJECTED");
  return result.data;
}
async function createContainer(
  apiKey: string,
  connection: Connection,
  body: Record<string, unknown>,
): Promise<string> {
  const data = await graph(apiKey, connection, "/v21.0/me/media", "POST", body);
  if (typeof data.id !== "string" || !/^\d+$/.test(data.id))
    throw new Error("CONTAINER_RESPONSE_INVALID");
  return data.id;
}
async function waitReady(
  apiKey: string,
  connection: Connection,
  container: string,
  deadline: number,
): Promise<void> {
  for (let i = 0; i < 12; i++) {
    if (Date.now() > deadline) throw new Error("PROCESSING_DEADLINE");
    const status = await graph(
      apiKey,
      connection,
      `/v21.0/${container}?fields=status_code`,
      "GET",
    );
    if (status.status_code === "FINISHED") return;
    if (status.status_code !== "IN_PROGRESS")
      throw new Error("CONTAINER_NOT_READY");
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error("CONTAINER_PROCESSING_TIMEOUT");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido." });
  const config = getServiceConfig();
  const token = extractBearerToken(req);
  if (!config || !token)
    return res
      .status(401)
      .json({ error: "Sessão inválida ou configuração indisponível." });
  const service = createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false },
  });
  const { data: auth, error: authError } = await service.auth.getUser(token);
  if (authError || !auth.user)
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  const { data: person, error: personError } = await service
    .from("people")
    .select("visible")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (personError || !person?.visible)
    return res
      .status(403)
      .json({ error: "Apenas membros ativos podem publicar." });
  const parsed = req.method === "POST" ? inputSchema.safeParse(req.body) : null;
  if (parsed && !parsed.success)
    return res.status(400).json({ error: "Dados de publicação inválidos." });
  const actionId = parsed?.success
    ? parsed.data.actionId
    : typeof req.query.actionId === "string"
      ? req.query.actionId
      : "";
  if (!z.uuid().safeParse(actionId).success)
    return res.status(400).json({ error: "Ação inválida." });
  const viewer = createClient(config.url, config.serviceRoleKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: action, error: actionError } = await viewer
    .from("actions")
    .select("id, partners, content_files, category, archived")
    .eq("id", actionId)
    .maybeSingle();
  if (actionError || !action || action.archived)
    return res.status(404).json({ error: "Ação indisponível." });
  const slugs: string[] = Array.isArray(action.partners)
    ? action.partners.filter(
        (item: unknown): item is string => typeof item === "string",
      )
    : [];
  const { data: partners, error: partnerError } = await viewer
    .from("partners")
    .select("id, slug, title, archived")
    .in("slug", slugs)
    .eq("archived", false);
  if (partnerError || !partners)
    return res
      .status(503)
      .json({ error: "Não foi possível verificar os parceiros." });
  const partnerIds = partners.map((partner) => partner.id);
  const { data: connections, error: connectionError } = await service
    .from("partner_instagram_connections")
    .select(
      "partner_id, connected_account_id, composio_user_id, profile_username, profile_picture_url",
    )
    .in("partner_id", partnerIds)
    .eq("is_current", true)
    .eq("status", "active");
  if (connectionError)
    return res
      .status(503)
      .json({ error: "Não foi possível verificar os perfis." });
  const { data: attempts, error: historyError } = await service
    .from("instagram_publish_attempts")
    .select(
      "id, partner_id, profile_username, format, status, phase, current_container_id, results, detail, created_at",
    )
    .eq("action_id", actionId)
    .in("partner_id", partnerIds)
    .order("created_at", { ascending: false })
    .limit(50);
  if (historyError)
    return res
      .status(503)
      .json({ error: "O registro de publicações não está disponível." });
  const available = partners.map((partner) => ({
    id: partner.id,
    slug: partner.slug,
    title: partner.title,
    username:
      connections?.find((c) => c.partner_id === partner.id)?.profile_username ??
      null,
    avatarUrl:
      connections?.find((c) => c.partner_id === partner.id)
        ?.profile_picture_url ?? null,
  }));
  if (req.method === "GET")
    return res.status(200).json({ partners: available, attempts });
  if (!parsed?.success)
    return res.status(400).json({ error: "Dados inválidos." });
  const input = parsed.data;
  const partner = partners.find((item) => item.slug === input.partnerSlug);
  const connection = connections?.find(
    (item) => item.partner_id === partner?.id,
  );
  if (
    !partner ||
    !connection ||
    connection.profile_username !== input.profileUsername
  )
    return res.status(409).json({
      error: "O perfil mudou ou está indisponível. Revise o destino.",
    });
  const actualFiles: string[] = Array.isArray(action.content_files)
    ? action.content_files
    : [];
  const expectedFormat: string | null =
    action.category === "post"
      ? input.files.length > 1
        ? null
        : getInstagramPublishMediaKind(input.files[0]) === "video"
          ? "video"
          : "feed"
      : action.category === "carousel"
        ? "feed"
        : action.category === "reels"
          ? "reel"
          : action.category === "stories"
            ? "stories"
            : null;
  if (input.format !== expectedFormat)
    return res.status(400).json({ error: "Formato incompatível com a ação." });
  const remaining = [...actualFiles];
  for (const file of input.files) {
    const index = remaining.indexOf(file);
    if (index < 0)
      return res.status(409).json({
        error: "Os arquivos mudaram. Salve a ação e revise novamente.",
      });
    remaining.splice(index, 1);
  }
  if (instagramPublishMediaError(input.format, input.files))
    return res.status(400).json({
      error: "Formato ou arquivo incompatível com a publicação do Instagram.",
    });
  let apiKey: string;
  try {
    const providerConfig = getComposioConfiguration();
    apiKey = providerConfig.apiKey;
    const expectedUserId = makePartnerComposioUserId(partner.id);
    const account = await getInstagramConnectedAccount(
      apiKey,
      connection.connected_account_id,
    );
    const observation = parseInstagramAccountObservation(account, {
      connectedAccountId: connection.connected_account_id,
      composioUserId: expectedUserId,
      authConfigId: providerConfig.instagramAuthConfigId,
    });
    const profile = await getInstagramProfile(
      apiKey,
      connection.connected_account_id,
      expectedUserId,
    );
    if (
      !observation ||
      observation.status !== "ACTIVE" ||
      connection.composio_user_id !== expectedUserId ||
      !profile ||
      profile.profileUsername !== input.profileUsername
    )
      return res.status(409).json({
        error:
          "Não foi possível confirmar o perfil conectado. Revise a conexão.",
      });
  } catch {
    return res
      .status(503)
      .json({ error: "A integração não está configurada." });
  }
  const { data: attempt, error: insertError } = await service
    .from("instagram_publish_attempts")
    .insert({
      action_id: actionId,
      partner_id: partner.id,
      started_by: auth.user.id,
      profile_username: connection.profile_username,
      format: input.format,
      files: input.files,
      caption: input.format === "stories" ? "" : input.caption,
    })
    .select("id")
    .single();
  if (insertError || !attempt)
    return res.status(insertError?.code === "23505" ? 409 : 503).json({
      error:
        insertError?.code === "23505"
          ? "Existe um envio pendente ou com resultado incerto. Confira antes de publicar novamente."
          : "Não foi possível registrar a tentativa.",
    });
  const partnerId: string = partner.id;
  const attemptId: string = attempt.id;
  const verifiedConnection: Connection = connection;
  const results: Result[] = [];
  const deadline = Date.now() + 120_000;
  let phase = "preparing";
  let currentContainerId: string | null = null;
  let publishSent = false;
  async function save(status: string, detail: string | null = null) {
    const { error } = await service
      .from("instagram_publish_attempts")
      .update({
        status,
        phase,
        current_container_id: currentContainerId,
        results,
        detail,
        updated_at: new Date().toISOString(),
      })
      .eq("id", attemptId);
    if (error) throw new Error("ATTEMPT_SAVE_FAILED");
  }
  async function publish(container: string) {
    currentContainerId = container;
    await save("pending");
    await waitReady(apiKey, verifiedConnection, container, deadline);
    const { data: currentConnection, error: currentError } = await service
      .from("partner_instagram_connections")
      .select("connected_account_id, profile_username, status")
      .eq("partner_id", partnerId)
      .eq("is_current", true)
      .maybeSingle();
    if (
      currentError ||
      !currentConnection ||
      currentConnection.status !== "active" ||
      currentConnection.connected_account_id !==
        verifiedConnection.connected_account_id ||
      currentConnection.profile_username !== input.profileUsername
    )
      throw new Error("CONNECTION_CHANGED");
    phase = "sending";
    await save("pending");
    publishSent = true;
    const data = await graph(
      apiKey,
      verifiedConnection,
      "/v21.0/me/media_publish",
      "POST",
      { creation_id: container },
    );
    if (typeof data.id !== "string" || !/^\d+$/.test(data.id))
      throw new Error("PUBLISH_RESPONSE_INVALID");
    const result: Result = { id: data.id, permalink: null };
    results.push(result);
    phase = "preparing";
    await save("pending");
    publishSent = false;
    try {
      const details = await graph(
        apiKey,
        verifiedConnection,
        `/v21.0/${data.id}?fields=permalink`,
        "GET",
      );
      if (
        typeof details.permalink === "string" &&
        /^https:\/\/(www\.)?instagram\.com\//.test(details.permalink)
      )
        result.permalink = details.permalink;
      await save("pending");
    } catch {
      /* The published ID was already saved. */
    }
  }
  try {
    if (input.format === "stories") {
      for (const file of input.files) {
        if (Date.now() > deadline) throw new Error("PROCESSING_DEADLINE");
        const key =
          getInstagramPublishMediaKind(file) === "video"
            ? "video_url"
            : "image_url";
        await publish(
          await createContainer(apiKey, connection, {
            media_type: "STORIES",
            [key]: file,
          }),
        );
      }
    } else if (input.format === "feed" && input.files.length > 1) {
      const children: string[] = [];
      for (const file of input.files) {
        if (Date.now() > deadline) throw new Error("PROCESSING_DEADLINE");
        const isVideo = getInstagramPublishMediaKind(file) === "video";
        const child = await createContainer(apiKey, connection, {
          ...(isVideo
            ? { video_url: file, media_type: "VIDEO" }
            : { image_url: file }),
          is_carousel_item: true,
        });
        await waitReady(apiKey, verifiedConnection, child, deadline);
        children.push(child);
      }
      const container = await createContainer(apiKey, connection, {
        media_type: "CAROUSEL",
        children: children.join(","),
        caption: input.caption,
      });
      await publish(container);
    } else {
      const file = input.files[0];
      const body =
        input.format === "feed"
          ? { image_url: file, caption: input.caption }
          : {
              media_type: input.format === "reel" ? "REELS" : "VIDEO",
              video_url: file,
              caption: input.caption,
            };
      await publish(await createContainer(apiKey, connection, body));
    }
    phase = "finished";
    await save("published");
    return res
      .status(200)
      .json({ id: attempt.id, status: "published", results });
  } catch {
    const status = publishSent
      ? "uncertain"
      : results.length
        ? "partial"
        : "failed";
    await save(
      status,
      status === "uncertain"
        ? "Confira o Instagram antes de tentar novamente."
        : status === "partial"
          ? "A sequência foi interrompida. Confira os itens publicados."
          : "Não foi possível preparar a publicação.",
    ).catch(() => undefined);
    return res.status(502).json({
      id: attempt.id,
      status,
      results,
      error:
        status === "uncertain"
          ? "Resultado incerto. Confira o Instagram antes de tentar novamente."
          : status === "partial"
            ? "A sequência foi interrompida. Confira os itens publicados."
            : "Não foi possível preparar a publicação.",
    });
  }
}
