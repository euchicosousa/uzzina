import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import {
  expectedInstagramPublishFormat,
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

const MIN_SCHEDULE_LEAD_MS = 2 * 60_000;

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
const scheduleSchema = z
  .object({
    operation: z.literal("schedule"),
    actionId: z.uuid(),
    partnerSlug: z.string().min(1).max(200),
    profileUsername: z.string().min(1).max(31),
    format: z.enum(["feed", "video", "reel", "stories"]),
    files: z.array(z.url()).min(1).max(20),
    caption: z.string().max(2200),
    scheduledAt: z
      .array(z.iso.datetime({ offset: true }))
      .min(1)
      .max(10)
      .refine(
        (items) =>
          new Set(items.map((item) => Date.parse(item))).size === items.length,
      ),
    timezone: z
      .string()
      .min(1)
      .max(100)
      .refine((timezone) => {
        try {
          Intl.DateTimeFormat("en", { timeZone: timezone });
          return true;
        } catch {
          return false;
        }
      }),
  })
  .strict();
const cancelScheduleSchema = z
  .object({
    operation: z.literal("cancelSchedule"),
    actionId: z.uuid(),
    scheduleId: z.uuid(),
  })
  .strict();
const calendarQuerySchema = z
  .object({
    from: z.iso.datetime({ offset: true }),
    to: z.iso.datetime({ offset: true }),
  })
  .refine((range) => {
    const duration = Date.parse(range.to) - Date.parse(range.from);
    return duration > 0 && duration <= 45 * 24 * 60 * 60_000;
  });
type Connection = {
  connected_account_id: string;
  composio_user_id: string;
  profile_username: string;
};
type Result = { id: string; permalink: string | null };
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function createServiceClient(url: string, serviceRoleKey: string) {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
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

/**
 * Builds the Instagram containers of one publication and hands each one that
 * must be published to onContainer. Shared by the immediate and scheduled paths.
 */
async function sendPublication(opts: {
  apiKey: string;
  connection: Connection;
  format: "feed" | "video" | "reel" | "stories";
  files: string[];
  caption: string;
  deadline: number;
  onContainer: (container: string) => Promise<void>;
}): Promise<void> {
  const { apiKey, connection, format, files, caption, deadline } = opts;
  if (format === "stories") {
    for (const file of files) {
      if (Date.now() > deadline) throw new Error("PROCESSING_DEADLINE");
      const key =
        getInstagramPublishMediaKind(file) === "video"
          ? "video_url"
          : "image_url";
      await opts.onContainer(
        await createContainer(apiKey, connection, {
          media_type: "STORIES",
          [key]: file,
        }),
      );
    }
  } else if (format === "feed" && files.length > 1) {
    const children: string[] = [];
    for (const file of files) {
      if (Date.now() > deadline) throw new Error("PROCESSING_DEADLINE");
      const isVideo = getInstagramPublishMediaKind(file) === "video";
      const child = await createContainer(apiKey, connection, {
        ...(isVideo
          ? { video_url: file, media_type: "VIDEO" }
          : { image_url: file }),
        is_carousel_item: true,
      });
      await waitReady(apiKey, connection, child, deadline);
      children.push(child);
    }
    await opts.onContainer(
      await createContainer(apiKey, connection, {
        media_type: "CAROUSEL",
        children: children.join(","),
        caption,
      }),
    );
  } else {
    const file = files[0];
    const body =
      format === "feed"
        ? { image_url: file, caption }
        : {
            media_type: format === "reel" ? "REELS" : "VIDEO",
            video_url: file,
            caption,
          };
    await opts.onContainer(await createContainer(apiKey, connection, body));
  }
}

const claimedScheduleSchema = z.object({
  publication_id: z.uuid(),
  claim_token: z.uuid(),
  batch_id: z.uuid(),
  ordinal: z.number(),
  scheduled_at: z.string(),
  action_id: z.uuid(),
  partner_id: z.uuid(),
  created_by: z.uuid(),
  connected_account_id: z.string(),
  profile_username: z.string(),
  format: z.string(),
  files: z.array(z.string()),
  caption: z.string(),
  timezone: z.string(),
  attempt_id: z.uuid().nullable(),
  results: z.array(
    z.object({ id: z.string(), permalink: z.string().nullable() }),
  ),
});

function hasSchedulerSecret(req: VercelRequest): boolean {
  const expected = process.env.INSTAGRAM_SCHEDULER_SECRET;
  const header = req.headers.authorization;
  if (!expected || expected.length < 32 || typeof header !== "string")
    return false;
  const supplied = header.replace(/^Bearer\s+/i, "");
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}

async function runScheduledPublications(
  service: ReturnType<typeof createServiceClient>,
): Promise<{ claimed: number; completed: number }> {
  const apiKey = getComposioConfiguration().apiKey;
  const { data, error } = await service.rpc(
    "claim_instagram_scheduled_publications",
    { p_limit: 1 },
  );
  if (error) throw new Error("SCHEDULE_CLAIM_FAILED");
  const rows = z.array(claimedScheduleSchema).safeParse(data);
  if (!rows.success) throw new Error("SCHEDULE_CLAIM_RESPONSE_INVALID");
  let completed = 0;
  for (const schedule of rows.data) {
    let attemptId = schedule.attempt_id;
    let results = [...schedule.results];
    let status: "published" | "failed" | "uncertain" | "partial" = "failed";
    let detail: string | null = "Não foi possível preparar a publicação.";
    let phase = "preparing";
    let currentContainerId: string | null = null;
    let publishSent = false;
    const deadline = Date.now() + 150_000;
    try {
      const format = z
        .enum(["feed", "video", "reel", "stories"])
        .safeParse(schedule.format);
      if (!format.success || schedule.files.length === 0)
        throw new Error("SCHEDULE_FORMAT_INVALID");
      const caption = format.data === "stories" ? "" : schedule.caption;
      const { data: action, error: actionError } = await service
        .from("actions")
        .select("id, category, archived, partners, content_files")
        .eq("id", schedule.action_id)
        .maybeSingle();
      const { data: partner, error: partnerError } = await service
        .from("partners")
        .select("id, slug, archived")
        .eq("id", schedule.partner_id)
        .maybeSingle();
      const { data: connection, error: connectionError } = await service
        .from("partner_instagram_connections")
        .select(
          "connected_account_id, composio_user_id, profile_username, status",
        )
        .eq("partner_id", schedule.partner_id)
        .eq("is_current", true)
        .maybeSingle();
      if (
        actionError ||
        partnerError ||
        connectionError ||
        !action ||
        action.archived ||
        expectedInstagramPublishFormat(action.category, schedule.files) !==
          format.data ||
        !partner ||
        partner.archived ||
        !Array.isArray(action.partners) ||
        !action.partners.includes(partner.slug) ||
        !connection ||
        connection.status !== "active" ||
        connection.connected_account_id !== schedule.connected_account_id ||
        connection.profile_username !== schedule.profile_username
      )
        throw new Error("SCHEDULE_TARGET_CHANGED");
      const actualFiles: string[] = Array.isArray(action.content_files)
        ? action.content_files
        : [];
      const remaining = [...actualFiles];
      for (const file of schedule.files) {
        const index = remaining.indexOf(file);
        if (index < 0) throw new Error("SCHEDULE_FILES_CHANGED");
        remaining.splice(index, 1);
      }
      if (instagramPublishMediaError(format.data, schedule.files))
        throw new Error("SCHEDULE_MEDIA_INVALID");
      const providerConfig = getComposioConfiguration();
      const expectedUserId = makePartnerComposioUserId(schedule.partner_id);
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
        profile.profileUsername !== schedule.profile_username
      )
        throw new Error("SCHEDULE_PROFILE_UNAVAILABLE");
      if (!attemptId) {
        const { data: attempt, error: attemptError } = await service
          .from("instagram_publish_attempts")
          .insert({
            action_id: schedule.action_id,
            partner_id: schedule.partner_id,
            started_by: schedule.created_by,
            profile_username: schedule.profile_username,
            format: format.data,
            files: schedule.files,
            caption,
          })
          .select("id")
          .single();
        if (attemptError || !attempt)
          throw new Error("SCHEDULE_ATTEMPT_CONFLICT");
        attemptId = attempt.id;
      }
      const saveAttempt = async (
        nextStatus: string,
        nextDetail: string | null,
      ) => {
        if (!attemptId) throw new Error("SCHEDULE_ATTEMPT_MISSING");
        const { error: saveError } = await service
          .from("instagram_publish_attempts")
          .update({
            status: nextStatus,
            phase,
            current_container_id: currentContainerId,
            results,
            detail: nextDetail,
            updated_at: new Date().toISOString(),
          })
          .eq("id", attemptId);
        if (saveError) throw new Error("SCHEDULE_ATTEMPT_SAVE_FAILED");
      };
      const publishContainer = async (container: string) => {
        if (Date.now() > deadline) throw new Error("SCHEDULE_DEADLINE");
        currentContainerId = container;
        await saveAttempt("pending", null);
        await waitReady(apiKey, connection, container, deadline);
        const { data: currentConnection, error: currentConnectionError } =
          await service
            .from("partner_instagram_connections")
            .select("connected_account_id, profile_username, status")
            .eq("partner_id", schedule.partner_id)
            .eq("is_current", true)
            .maybeSingle();
        if (
          currentConnectionError ||
          !currentConnection ||
          currentConnection.status !== "active" ||
          currentConnection.connected_account_id !==
            connection.connected_account_id ||
          currentConnection.profile_username !== schedule.profile_username
        )
          throw new Error("SCHEDULE_CONNECTION_CHANGED");
        phase = "sending";
        await saveAttempt("pending", null);
        publishSent = true;
        const published = await graph(
          apiKey,
          connection,
          "/v21.0/me/media_publish",
          "POST",
          { creation_id: container },
        );
        if (typeof published.id !== "string" || !/^\d+$/.test(published.id))
          throw new Error("SCHEDULE_PUBLISH_RESPONSE_INVALID");
        const result: Result = { id: published.id, permalink: null };
        results.push(result);
        phase = "preparing";
        await saveAttempt("pending", null);
        publishSent = false;
        try {
          const media = await graph(
            apiKey,
            connection,
            `/v21.0/${published.id}?fields=permalink`,
            "GET",
          );
          if (
            typeof media.permalink === "string" &&
            /^https:\/\/(www\.)?instagram\.com\//.test(media.permalink)
          )
            result.permalink = media.permalink;
          await saveAttempt("pending", null);
        } catch {
          // The published media ID is already persisted.
        }
      };
      await sendPublication({
        apiKey,
        connection,
        format: format.data,
        files: schedule.files,
        caption,
        deadline,
        onContainer: publishContainer,
      });
      phase = "finished";
      status = "published";
      detail = null;
      await saveAttempt(status, detail);
    } catch (error) {
      status = publishSent
        ? "uncertain"
        : results.length
          ? "partial"
          : "failed";
      detail = publishSent
        ? "Confira o Instagram antes de tentar novamente."
        : results.length
          ? "A sequência foi interrompida. Confira os itens publicados."
          : error instanceof Error &&
              error.message === "SCHEDULE_PROFILE_UNAVAILABLE"
            ? "O perfil do Instagram não está disponível. Reconecte e revise a programação."
            : error instanceof Error &&
                error.message === "SCHEDULE_TARGET_CHANGED"
              ? "A ação, o parceiro ou a conexão mudou antes do envio."
              : "Não foi possível preparar a publicação programada.";
      if (attemptId) {
        await service
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
      }
    }
    const { data: finished, error: finishError } = await service.rpc(
      "finish_instagram_scheduled_publication",
      {
        p_publication_id: schedule.publication_id,
        p_claim_token: schedule.claim_token,
        p_status: status,
        p_attempt_id: attemptId,
        p_results: results,
        p_detail: detail,
      },
    );
    if (finishError || finished !== true)
      throw new Error("SCHEDULE_FINISH_FAILED");
    completed += 1;
  }
  return { claimed: rows.data.length, completed };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Método não permitido." });
  }
  const config = getServiceConfig();
  const isWorkerRequest =
    req.method === "POST" &&
    isRecord(req.body) &&
    req.body.operation === "runDue";
  if (isWorkerRequest) {
    if (!config || !hasSchedulerSecret(req))
      return res.status(401).json({ error: "Executor não autorizado." });
    const service = createServiceClient(config.url, config.serviceRoleKey);
    try {
      return res.status(200).json(await runScheduledPublications(service));
    } catch {
      return res
        .status(503)
        .json({ error: "Não foi possível processar a fila de programações." });
    }
  }
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
  const isScheduleRequest =
    req.method === "POST" &&
    isRecord(req.body) &&
    req.body.operation === "schedule";
  const isCancelRequest =
    req.method === "POST" &&
    isRecord(req.body) &&
    req.body.operation === "cancelSchedule";
  const isCalendarRequest =
    req.method === "GET" && req.query.view === "calendar";
  const parsed =
    req.method === "POST" && !isScheduleRequest
      ? inputSchema.safeParse(req.body)
      : null;
  const parsedSchedule = isScheduleRequest
    ? scheduleSchema.safeParse(req.body)
    : null;
  const parsedCancel = isCancelRequest
    ? cancelScheduleSchema.safeParse(req.body)
    : null;
  if (
    (parsed && !parsed.success) ||
    (parsedSchedule && !parsedSchedule.success) ||
    (parsedCancel && !parsedCancel.success)
  )
    return res.status(400).json({ error: "Dados de publicação inválidos." });
  const actionId = parsedSchedule?.success
    ? parsedSchedule.data.actionId
    : parsedCancel?.success
      ? parsedCancel.data.actionId
      : parsed?.success
        ? parsed.data.actionId
        : typeof req.query.actionId === "string"
          ? req.query.actionId
          : "";
  if (!isCalendarRequest && !z.uuid().safeParse(actionId).success)
    return res.status(400).json({ error: "Ação inválida." });
  const viewer = createClient(config.url, config.serviceRoleKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  if (isCalendarRequest) {
    res.setHeader("Cache-Control", "private, no-store");
    const parsedRange = calendarQuerySchema.safeParse({
      from: req.query.from,
      to: req.query.to,
    });
    if (!parsedRange.success)
      return res.status(400).json({ error: "Período inválido." });
    const { from, to } = parsedRange.data;
    const { data: visibleActions, error: visibleActionsError } = await viewer
      .from("actions")
      .select("id, title, partners")
      .eq("archived", false);
    if (visibleActionsError || !visibleActions)
      return res
        .status(503)
        .json({ error: "Não foi possível consultar suas ações." });
    const actionById = new Map(
      visibleActions.map((action) => [action.id, action]),
    );
    const partnerSlugs = [
      ...new Set(visibleActions.flatMap((action) => action.partners)),
    ];
    if (partnerSlugs.length === 0)
      return res.status(200).json({ events: [], connectedPartnerIds: [] });
    const { data: visiblePartners, error: visiblePartnersError } = await viewer
      .from("partners")
      .select("id, slug, title")
      .in("slug", partnerSlugs);
    if (visiblePartnersError || !visiblePartners)
      return res
        .status(503)
        .json({ error: "Não foi possível consultar seus parceiros." });
    const partnerById = new Map(
      visiblePartners.map((partner) => [partner.id, partner]),
    );
    const partnerIds = visiblePartners.map((partner) => partner.id);
    if (partnerIds.length === 0)
      return res.status(200).json({ events: [], connectedPartnerIds: [] });
    const { data: instagramConnections, error: instagramConnectionsError } =
      await service
        .from("partner_instagram_connections")
        .select("partner_id")
        .in("partner_id", partnerIds)
        .eq("status", "active")
        .eq("is_current", true);
    if (instagramConnectionsError || !instagramConnections)
      return res.status(503).json({
        error: "Não foi possível consultar os perfis conectados.",
      });
    const connectedPartnerIds = [
      ...new Set(
        instagramConnections.map((connection) => connection.partner_id),
      ),
    ];

    const attemptRows: Array<{
      id: string;
      action_id: string;
      partner_id: string;
      profile_username: string;
      format: string;
      status: string;
      created_at: string;
      results: Array<{ id: string; permalink: string | null }>;
    }> = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await service
        .from("instagram_publish_attempts")
        .select(
          "id, action_id, partner_id, profile_username, format, status, created_at, results",
        )
        .in("partner_id", partnerIds)
        .eq("status", "published")
        .gte("created_at", from)
        .lt("created_at", to)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(offset, offset + 999);
      if (error || !data)
        return res.status(503).json({
          error: "Não foi possível consultar as publicações.",
        });
      attemptRows.push(...data);
      if (data.length < 1000) break;
    }
    const scheduleRows: Array<{
      id: string;
      attempt_id: string | null;
      scheduled_at: string;
      status: string;
      results: Array<{ id: string; permalink: string | null }>;
      instagram_schedule_batches: Array<{
        action_id: string;
        partner_id: string;
        profile_username: string;
        format: string;
      }>;
    }> = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await service
        .from("instagram_scheduled_publications")
        .select(
          "id, attempt_id, scheduled_at, status, results, instagram_schedule_batches!inner(action_id, partner_id, profile_username, format)",
        )
        .in("instagram_schedule_batches.partner_id", partnerIds)
        .in("status", [
          "scheduled",
          "processing",
          "published",
          "failed",
          "partial",
          "uncertain",
        ])
        .gte("scheduled_at", from)
        .lt("scheduled_at", to)
        .order("scheduled_at", { ascending: true })
        .order("id", { ascending: true })
        .range(offset, offset + 999);
      if (error || !data)
        return res.status(503).json({
          error: "Não foi possível consultar os agendamentos.",
        });
      scheduleRows.push(...data);
      if (data.length < 1000) break;
    }
    const scheduledAttemptIds = new Set(
      scheduleRows.flatMap((row) => (row.attempt_id ? [row.attempt_id] : [])),
    );
    const events = [
      ...attemptRows
        .filter(
          (attempt) =>
            actionById.has(attempt.action_id) &&
            !scheduledAttemptIds.has(attempt.id),
        )
        .map((attempt) => {
          const action = actionById.get(attempt.action_id);
          const partner = partnerById.get(attempt.partner_id);
          return {
            id: `publish:${attempt.id}`,
            actionId: attempt.action_id,
            actionTitle: action?.title ?? "Ação",
            partnerId: attempt.partner_id,
            partnerName: partner?.title ?? attempt.profile_username,
            profileUsername: attempt.profile_username,
            format: attempt.format,
            status: attempt.status,
            occurredAt: attempt.created_at,
            permalinks: attempt.results.flatMap((result) =>
              result.permalink ? [result.permalink] : [],
            ),
          };
        }),
      ...scheduleRows.flatMap((schedule) => {
        const batch = schedule.instagram_schedule_batches[0];
        if (!batch) return [];
        const action = actionById.get(batch.action_id);
        if (!action) return [];
        const partner = partnerById.get(batch.partner_id);
        return [
          {
            id: `schedule:${schedule.id}`,
            actionId: batch.action_id,
            actionTitle: action.title,
            partnerId: batch.partner_id,
            partnerName: partner?.title ?? batch.profile_username,
            profileUsername: batch.profile_username,
            format: batch.format,
            status: schedule.status,
            occurredAt: schedule.scheduled_at,
            permalinks: schedule.results.flatMap((result) =>
              result.permalink ? [result.permalink] : [],
            ),
          },
        ];
      }),
    ].sort(
      (left, right) =>
        Date.parse(left.occurredAt) - Date.parse(right.occurredAt),
    );
    return res.status(200).json({ events, connectedPartnerIds });
  }
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
  const { data: scheduledRows, error: schedulesError } = await service
    .from("instagram_scheduled_publications")
    .select(
      "id, batch_id, ordinal, scheduled_at, status, results, detail, instagram_schedule_batches!inner(action_id, partner_id, profile_username, format)",
    )
    .eq("instagram_schedule_batches.action_id", actionId)
    .in("instagram_schedule_batches.partner_id", partnerIds)
    .order("scheduled_at", { ascending: true })
    .limit(100);
  if (schedulesError)
    return res.status(503).json({
      error: "O registro de programações não está disponível.",
    });
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
    return res.status(200).json({
      partners: available,
      attempts,
      schedules: scheduledRows ?? [],
    });
  if (parsedCancel?.success) {
    const canCancel = (scheduledRows ?? []).some(
      (item) =>
        item.id === parsedCancel.data.scheduleId && item.status === "scheduled",
    );
    if (!canCancel)
      return res.status(409).json({
        error:
          "Esta programação já começou ou não está disponível para cancelar.",
      });
    const { data: cancelled, error: cancelError } = await service
      .from("instagram_scheduled_publications")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", parsedCancel.data.scheduleId)
      .eq("status", "scheduled")
      .select("id")
      .maybeSingle();
    if (cancelError || !cancelled)
      return res.status(409).json({
        error: "A programação começou antes do cancelamento ser salvo.",
      });
    return res.status(200).json({ cancelled: true });
  }
  if (parsedSchedule?.success) {
    const schedule = parsedSchedule.data;
    if (
      schedule.format !==
      expectedInstagramPublishFormat(action.category, schedule.files)
    )
      return res
        .status(400)
        .json({ error: "Formato incompatível com a ação." });
    const partner = partners.find((item) => item.slug === schedule.partnerSlug);
    const connection = connections?.find(
      (item) => item.partner_id === partner?.id,
    );
    if (
      !partner ||
      !connection ||
      connection.profile_username !== schedule.profileUsername
    )
      return res.status(409).json({
        error: "O perfil mudou ou está indisponível. Revise o destino.",
      });
    const actualFiles: string[] = Array.isArray(action.content_files)
      ? action.content_files
      : [];
    const remaining = [...actualFiles];
    for (const file of schedule.files) {
      const index = remaining.indexOf(file);
      if (index < 0)
        return res.status(409).json({
          error: "Os arquivos mudaram. Salve a ação e revise novamente.",
        });
      remaining.splice(index, 1);
    }
    if (instagramPublishMediaError(schedule.format, schedule.files))
      return res.status(400).json({
        error: "Formato ou arquivo incompatível com a publicação do Instagram.",
      });
    if (
      schedule.scheduledAt.some(
        (date) => Date.parse(date) < Date.now() + MIN_SCHEDULE_LEAD_MS,
      )
    )
      return res.status(400).json({
        error: "Escolha horários com pelo menos 2 minutos de antecedência.",
      });
    try {
      const providerConfig = getComposioConfiguration();
      const expectedUserId = makePartnerComposioUserId(partner.id);
      const account = await getInstagramConnectedAccount(
        providerConfig.apiKey,
        connection.connected_account_id,
      );
      const observation = parseInstagramAccountObservation(account, {
        connectedAccountId: connection.connected_account_id,
        composioUserId: expectedUserId,
        authConfigId: providerConfig.instagramAuthConfigId,
      });
      const profile = await getInstagramProfile(
        providerConfig.apiKey,
        connection.connected_account_id,
        expectedUserId,
      );
      if (
        !observation ||
        observation.status !== "ACTIVE" ||
        connection.composio_user_id !== expectedUserId ||
        !profile ||
        profile.profileUsername !== schedule.profileUsername
      )
        return res.status(409).json({
          error:
            "Não foi possível confirmar o perfil conectado. Revise a conexão.",
        });
    } catch {
      return res.status(503).json({
        error: "A integração não está configurada.",
      });
    }
    if (
      schedule.scheduledAt.some(
        (date) => Date.parse(date) < Date.now() + MIN_SCHEDULE_LEAD_MS,
      )
    )
      return res.status(400).json({
        error: "Escolha horários com pelo menos 2 minutos de antecedência.",
      });
    const { data: created, error: createError } = await service.rpc(
      "create_instagram_schedule_batch",
      {
        p_action_id: actionId,
        p_partner_id: partner.id,
        p_created_by: auth.user.id,
        p_connected_account_id: connection.connected_account_id,
        p_profile_username: connection.profile_username,
        p_format: schedule.format,
        p_files: schedule.files,
        p_caption: schedule.format === "stories" ? "" : schedule.caption,
        p_timezone: schedule.timezone,
        p_scheduled_at: schedule.scheduledAt,
      },
    );
    if (createError)
      return res.status(503).json({
        error: "Não foi possível salvar a programação.",
      });
    return res.status(201).json({ schedules: created ?? [] });
  }
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
  const expectedFormat = expectedInstagramPublishFormat(
    action.category,
    input.files,
  );
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
    await sendPublication({
      apiKey,
      connection,
      format: input.format,
      files: input.files,
      caption: input.caption,
      deadline,
      onContainer: publish,
    });
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
