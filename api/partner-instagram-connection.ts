import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import {
  makePartnerComposioUserId,
  parseInstagramAccountObservation,
  type PartnerInstagramConnection,
} from "../app/lib/partner-instagram-contract.js";
import { extractBearerToken } from "../server/auth.js";
import {
  ComposioInstagramError,
  createInstagramConnectLink,
  getInstagramConnectedAccount,
  getInstagramProfile,
  revokeInstagramConnectedAccount,
  type InstagramProfile,
} from "../server/composio-instagram.js";
import { getComposioConfiguration } from "../server/composio-config.js";
import {
  createServiceClient,
  getServiceConfig,
} from "../server/supabase-admin.js";

const partnerSlugSchema = z.string().trim().min(1).max(200);
const connectBodySchema = z
  .object({ action: z.literal("connect"), partnerSlug: partnerSlugSchema })
  .strict();
const callbackBodySchema = z
  .object({
    action: z.literal("complete"),
    partnerSlug: partnerSlugSchema,
    attemptId: z.uuid(),
    state: z.string().min(40).max(100),
    status: z.enum(["success", "failed"]),
    connectedAccountId: z
      .string()
      .regex(/^ca_[A-Za-z0-9_-]+$/)
      .nullable(),
  })
  .strict();
const disconnectBodySchema = z
  .object({ partnerSlug: partnerSlugSchema })
  .strict();

type ServiceClient = ReturnType<typeof createServiceClient>;

interface PartnerRow {
  id: string;
  slug: string;
  archived: boolean | null;
}

interface AttemptRow {
  id: string;
  partner_id: string;
  started_by: string;
  state_hash: string;
  connected_account_id: string | null;
  status: string;
  expires_at: string;
}

interface ConnectionRow {
  id: string;
  partner_id: string;
  connected_account_id: string;
  composio_user_id: string;
  profile_username: string;
  profile_name: string | null;
  biography: string | null;
  website: string | null;
  profile_picture_url: string | null;
  media_count: number | null;
  status: string;
  is_current: boolean;
  connected_at: string;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function safeHashMatches(expected: string, value: string): boolean {
  const expectedBytes = Buffer.from(expected, "hex");
  const actualBytes = Buffer.from(sha256(value), "hex");
  return (
    expectedBytes.length === actualBytes.length &&
    timingSafeEqual(expectedBytes, actualBytes)
  );
}

function getAllowedCallbackOrigin(req: VercelRequest): string | null {
  const originHeader = req.headers.origin;
  if (typeof originHeader !== "string") return null;
  let origin: string;
  try {
    origin = new URL(originHeader).origin;
  } catch {
    return null;
  }

  const allowed = new Set([
    "https://uzzina.cnvt.com.br",
    "http://127.0.0.1:5176",
    "http://localhost:5176",
  ]);
  if (process.env.VERCEL_URL) {
    allowed.add(`https://${process.env.VERCEL_URL}`);
  }
  return allowed.has(origin) ? origin : null;
}

async function authenticateActiveAdmin(
  req: VercelRequest,
  res: VercelResponse,
): Promise<{ client: ServiceClient; userId: string } | null> {
  const serviceConfig = getServiceConfig();
  if (!serviceConfig) {
    res.status(503).json({ error: "Configuração do servidor incompleta." });
    return null;
  }
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Sessão inválida ou expirada." });
    return null;
  }

  const client = createServiceClient(serviceConfig);
  const { data: auth, error: authError } = await client.auth.getUser(token);
  if (authError || !auth.user) {
    res.status(401).json({ error: "Sessão inválida ou expirada." });
    return null;
  }

  const { data: person, error: personError } = await client
    .from("people")
    .select("admin, visible")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (personError) {
    res.status(503).json({ error: "Não foi possível verificar seu acesso." });
    return null;
  }
  if (!person?.visible || !person.admin) {
    res.status(403).json({
      error: "A conexão do Instagram é restrita a administradores ativos.",
    });
    return null;
  }
  return { client, userId: auth.user.id };
}

async function getPartner(
  client: ServiceClient,
  slug: string,
): Promise<PartnerRow | null> {
  const { data, error } = await client
    .from("partners")
    .select("id, slug, archived")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error("PARTNER_LOOKUP_FAILED");
  if (!data || data.archived === true) return null;
  return data;
}

function getInstagramConfig(res: VercelResponse) {
  try {
    return getComposioConfiguration();
  } catch {
    res.status(503).json({
      error: "A integração do Instagram não está configurada no servidor.",
    });
    return null;
  }
}

function mapConnection(row: ConnectionRow): PartnerInstagramConnection {
  return {
    connectedAccountId: row.connected_account_id,
    profileUsername: row.profile_username,
    profileName: row.profile_name,
    biography: row.biography,
    website: row.website,
    profilePictureUrl: row.profile_picture_url,
    mediaCount: row.media_count,
    status:
      row.status === "active" ||
      row.status === "attention" ||
      row.status === "revoked" ||
      row.status === "superseded"
        ? row.status
        : "attention",
    connectedAt: row.connected_at,
  };
}

async function loadCurrentConnection(
  client: ServiceClient,
  partnerId: string,
): Promise<ConnectionRow | null> {
  const { data, error } = await client
    .from("partner_instagram_connections")
    .select(
      "id, partner_id, connected_account_id, composio_user_id, profile_username, profile_name, biography, website, profile_picture_url, media_count, status, is_current, connected_at",
    )
    .eq("partner_id", partnerId)
    .eq("is_current", true)
    .maybeSingle();
  if (error) throw new Error("CONNECTION_LOOKUP_FAILED");
  return data;
}

async function updateConnectionStatus(
  client: ServiceClient,
  row: ConnectionRow,
  status: PartnerInstagramConnection["status"],
  profileUsername?: string,
): Promise<void> {
  const { error } = await client
    .from("partner_instagram_connections")
    .update({
      status,
      ...(profileUsername ? { profile_username: profileUsername } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);
  if (error) throw new Error("CONNECTION_UPDATE_FAILED");
}

async function handleGet(
  req: VercelRequest,
  res: VercelResponse,
  client: ServiceClient,
  apiKey: string,
  authConfigId: string,
): Promise<void> {
  const parsedSlug = partnerSlugSchema.safeParse(req.query.partnerSlug);
  if (!parsedSlug.success) {
    res.status(400).json({ error: "Parceiro inválido." });
    return;
  }
  const partner = await getPartner(client, parsedSlug.data);
  if (!partner) {
    res.status(404).json({ error: "Parceiro não encontrado ou arquivado." });
    return;
  }
  const row = await loadCurrentConnection(client, partner.id);
  if (!row) {
    res.status(200).json({ connection: null });
    return;
  }

  let connection = mapConnection(row);
  let verification: PartnerInstagramConnection["verification"] = "unavailable";
  try {
    const account = await getInstagramConnectedAccount(
      apiKey,
      row.connected_account_id,
    );
    const expectedUserId = makePartnerComposioUserId(partner.id);
    const observation = parseInstagramAccountObservation(account, {
      connectedAccountId: row.connected_account_id,
      composioUserId: expectedUserId,
      authConfigId,
    });
    verification = observation ? "verified" : "failed";
    if (!observation) {
      connection = { ...connection, status: "attention", verification };
      await updateConnectionStatus(client, row, "attention");
    } else if (observation.status === "ACTIVE") {
      const profileUsername =
        observation.profileUsername ?? row.profile_username;
      connection = {
        ...connection,
        status: "active",
        profileUsername,
        verification,
      };
      if (row.status !== "active" || row.profile_username !== profileUsername) {
        await updateConnectionStatus(client, row, "active", profileUsername);
      }
      if (
        !row.profile_name &&
        !row.biography &&
        !row.website &&
        !row.profile_picture_url &&
        row.media_count === null
      ) {
        try {
          const profile = await getInstagramProfile(
            apiKey,
            row.connected_account_id,
            expectedUserId,
          );
          if (profile) {
            const { error: profileError } = await client
              .from("partner_instagram_connections")
              .update({
                profile_username: profile.profileUsername,
                profile_name: profile.profileName,
                biography: profile.biography,
                website: profile.website,
                profile_picture_url: profile.profilePictureUrl,
                media_count: profile.mediaCount,
                updated_at: new Date().toISOString(),
              })
              .eq("id", row.id)
              .eq("is_current", true);
            if (!profileError) {
              connection = {
                ...connection,
                profileUsername: profile.profileUsername,
                profileName: profile.profileName,
                biography: profile.biography,
                website: profile.website,
                profilePictureUrl: profile.profilePictureUrl,
                mediaCount: profile.mediaCount,
              };
            }
          }
        } catch (error) {
          if (!(error instanceof ComposioInstagramError)) throw error;
        }
      }
    } else {
      const status = observation.status === "REVOKED" ? "revoked" : "attention";
      connection = { ...connection, status, verification };
      if (row.status !== status)
        await updateConnectionStatus(client, row, status);
    }
  } catch (error) {
    if (!(error instanceof ComposioInstagramError)) throw error;
    connection = { ...connection, verification: "unavailable" };
  }

  res.status(200).json({ connection });
}

async function handleConnect(
  req: VercelRequest,
  res: VercelResponse,
  client: ServiceClient,
  userId: string,
  apiKey: string,
  authConfigId: string,
): Promise<void> {
  const parsedBody = connectBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: "Pedido de conexão inválido." });
    return;
  }
  const partner = await getPartner(client, parsedBody.data.partnerSlug);
  if (!partner) {
    res.status(404).json({ error: "Parceiro não encontrado ou arquivado." });
    return;
  }
  const origin = getAllowedCallbackOrigin(req);
  if (!origin) {
    res.status(400).json({
      error: "Não foi possível validar o endereço de retorno do Instagram.",
    });
    return;
  }

  const now = new Date().toISOString();
  const { error: expireError } = await client
    .from("partner_instagram_connection_attempts")
    .update({ status: "expired", updated_at: now })
    .eq("partner_id", partner.id)
    .eq("status", "pending")
    .lte("expires_at", now);
  if (expireError) {
    res.status(503).json({
      error: "Não foi possível verificar tentativas anteriores.",
    });
    return;
  }
  const { data: pendingAttempt, error: pendingError } = await client
    .from("partner_instagram_connection_attempts")
    .select("id")
    .eq("partner_id", partner.id)
    .eq("status", "pending")
    .gt("expires_at", now)
    .maybeSingle();
  if (pendingError) {
    res.status(503).json({
      error: "Não foi possível verificar tentativas anteriores.",
    });
    return;
  }
  if (pendingAttempt) {
    res.status(409).json({
      error:
        "Já existe uma tentativa de conexão em andamento para este parceiro.",
    });
    return;
  }

  const state = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const { data: attempt, error: attemptError } = await client
    .from("partner_instagram_connection_attempts")
    .insert({
      partner_id: partner.id,
      started_by: userId,
      state_hash: sha256(state),
      expires_at: expiresAt,
      status: "pending",
    })
    .select("id")
    .single();
  if (attemptError || !attempt) {
    res
      .status(attemptError?.code === "23505" ? 409 : 503)
      .json({ error: "Não foi possível iniciar a conexão." });
    return;
  }

  const callbackUrl = new URL(
    `/app/admin/partner/${encodeURIComponent(partner.slug)}`,
    origin,
  );
  callbackUrl.searchParams.set("instagram_attempt", attempt.id);
  callbackUrl.searchParams.set("instagram_state", state);

  try {
    const link = await createInstagramConnectLink({
      apiKey,
      authConfigId,
      composioUserId: makePartnerComposioUserId(partner.id),
      callbackUrl: callbackUrl.toString(),
    });
    const linkExpiration = Date.parse(link.expiresAt);
    const safeExpiration =
      Number.isFinite(linkExpiration) && linkExpiration > Date.now()
        ? new Date(linkExpiration).toISOString()
        : expiresAt;
    const { error: updateError } = await client
      .from("partner_instagram_connection_attempts")
      .update({
        connected_account_id: link.connectedAccountId,
        expires_at: safeExpiration,
        updated_at: new Date().toISOString(),
      })
      .eq("id", attempt.id)
      .eq("status", "pending");
    if (updateError) throw new Error("ATTEMPT_UPDATE_FAILED");
    res.status(200).json({
      attemptId: attempt.id,
      redirectUrl: link.redirectUrl,
    });
  } catch (error) {
    await client
      .from("partner_instagram_connection_attempts")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", attempt.id)
      .eq("status", "pending");
    if (error instanceof ComposioInstagramError) {
      res.status(502).json({
        error: "O Composio não conseguiu iniciar a conexão. Tente novamente.",
      });
      return;
    }
    res.status(503).json({ error: "Não foi possível iniciar a conexão." });
  }
}

async function handleComplete(
  req: VercelRequest,
  res: VercelResponse,
  client: ServiceClient,
  userId: string,
  apiKey: string,
  authConfigId: string,
): Promise<void> {
  const parsedBody = callbackBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: "Retorno da conexão inválido." });
    return;
  }
  const callback = parsedBody.data;
  const { data: attempt, error: attemptError } = await client
    .from("partner_instagram_connection_attempts")
    .select(
      "id, partner_id, started_by, state_hash, connected_account_id, status, expires_at",
    )
    .eq("id", callback.attemptId)
    .maybeSingle();
  if (attemptError) {
    res.status(503).json({ error: "Não foi possível validar o retorno." });
    return;
  }
  if (!attempt || !safeHashMatches(attempt.state_hash, callback.state)) {
    res.status(404).json({ error: "A tentativa de conexão não existe." });
    return;
  }
  if (attempt.started_by !== userId) {
    res.status(403).json({
      error: "Entre com a conta que iniciou a conexão do Instagram.",
    });
    return;
  }
  const partner = await getPartner(client, callback.partnerSlug);
  if (!partner || partner.id !== attempt.partner_id) {
    res
      .status(403)
      .json({ error: "O retorno não corresponde a este parceiro." });
    return;
  }

  if (attempt.status === "completed") {
    const existing = await loadCurrentConnection(client, partner.id);
    if (
      existing?.connected_account_id === callback.connectedAccountId &&
      callback.status === "success"
    ) {
      res
        .status(200)
        .json({ connection: mapConnection(existing), failed: false });
    } else {
      res.status(409).json({ error: "Esta tentativa já foi concluída." });
    }
    return;
  }
  if (attempt.status !== "pending") {
    res.status(409).json({ error: "Esta tentativa não está mais ativa." });
    return;
  }
  if (Date.parse(attempt.expires_at) <= Date.now()) {
    await client
      .from("partner_instagram_connection_attempts")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("id", attempt.id)
      .eq("status", "pending");
    res
      .status(410)
      .json({ error: "A tentativa expirou. Inicie outra conexão." });
    return;
  }

  if (callback.status === "failed") {
    const { error } = await client
      .from("partner_instagram_connection_attempts")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", attempt.id)
      .eq("status", "pending");
    if (error) {
      res.status(503).json({ error: "Não foi possível registrar a falha." });
      return;
    }
    res.status(200).json({ connection: null, failed: true });
    return;
  }

  if (
    !callback.connectedAccountId ||
    !attempt.connected_account_id ||
    callback.connectedAccountId !== attempt.connected_account_id
  ) {
    res.status(409).json({
      error: "A conta retornada não corresponde à tentativa iniciada.",
    });
    return;
  }

  const composioUserId = makePartnerComposioUserId(partner.id);
  let account: unknown;
  try {
    account = await getInstagramConnectedAccount(
      apiKey,
      callback.connectedAccountId,
    );
  } catch {
    res.status(502).json({
      error:
        "Não foi possível verificar a conexão com o Instagram. Tente confirmar novamente.",
    });
    return;
  }
  const observation = parseInstagramAccountObservation(account, {
    connectedAccountId: attempt.connected_account_id,
    composioUserId,
    authConfigId,
  });
  if (!observation || observation.status !== "ACTIVE") {
    res.status(409).json({
      error:
        "O Composio ainda não confirmou o perfil do Instagram. A conexão anterior foi mantida.",
    });
    return;
  }

  let profile: InstagramProfile | null = null;
  try {
    profile = await getInstagramProfile(
      apiKey,
      attempt.connected_account_id,
      composioUserId,
    );
  } catch {
    res.status(502).json({
      error:
        "A conexão está ativa, mas não foi possível consultar os dados do perfil. Tente confirmar novamente.",
    });
    return;
  }
  if (!profile) {
    res.status(409).json({
      error:
        "A conexão está ativa, mas o Instagram não retornou os dados do perfil. A conexão anterior foi mantida.",
    });
    return;
  }
  const profileUsername = profile.profileUsername;
  if (!profileUsername) {
    res.status(409).json({
      error:
        "A conexão está ativa, mas o Composio não retornou o @ do Instagram. A conexão anterior foi mantida.",
    });
    return;
  }

  const { error: saveError } = await client.rpc(
    "save_partner_instagram_connection",
    {
      p_partner_id: partner.id,
      p_connected_account_id: observation.connectedAccountId,
      p_composio_user_id: composioUserId,
      p_profile_username: profileUsername,
      p_profile_name: profile?.profileName ?? null,
      p_biography: profile?.biography ?? null,
      p_website: profile?.website ?? null,
      p_profile_picture_url: profile?.profilePictureUrl ?? null,
      p_media_count: profile?.mediaCount ?? null,
    },
  );
  if (saveError) {
    res.status(503).json({
      error:
        "Não foi possível guardar o perfil. A conexão anterior foi mantida.",
    });
    return;
  }

  const { error: completeError } = await client
    .from("partner_instagram_connection_attempts")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", attempt.id)
    .eq("status", "pending");
  if (completeError) {
    res.status(503).json({
      error:
        "O perfil foi verificado, mas não foi possível encerrar a tentativa.",
    });
    return;
  }

  res.status(200).json({
    connection: {
      connectedAccountId: observation.connectedAccountId,
      profileUsername,
      profileName: profile?.profileName ?? null,
      biography: profile?.biography ?? null,
      website: profile?.website ?? null,
      profilePictureUrl: profile?.profilePictureUrl ?? null,
      mediaCount: profile?.mediaCount ?? null,
      status: "active",
      connectedAt: new Date().toISOString(),
      verification: "verified",
    } satisfies PartnerInstagramConnection,
    failed: false,
  });
}

async function handleDelete(
  req: VercelRequest,
  res: VercelResponse,
  client: ServiceClient,
  apiKey: string,
  authConfigId: string,
): Promise<void> {
  const parsedBody = disconnectBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: "Parceiro inválido." });
    return;
  }
  const partner = await getPartner(client, parsedBody.data.partnerSlug);
  if (!partner) {
    res.status(404).json({ error: "Parceiro não encontrado ou arquivado." });
    return;
  }
  const row = await loadCurrentConnection(client, partner.id);
  if (!row) {
    res.status(404).json({ error: "Não há perfil conectado neste parceiro." });
    return;
  }

  const now = new Date().toISOString();
  const { error: expireError } = await client
    .from("partner_instagram_connection_attempts")
    .update({ status: "expired", updated_at: now })
    .eq("partner_id", partner.id)
    .eq("status", "pending")
    .lte("expires_at", now);
  if (expireError) {
    res.status(503).json({
      error: "Não foi possível verificar tentativas pendentes.",
    });
    return;
  }
  const { data: pendingAttempt, error: pendingError } = await client
    .from("partner_instagram_connection_attempts")
    .select("id")
    .eq("partner_id", partner.id)
    .eq("status", "pending")
    .gt("expires_at", now)
    .maybeSingle();
  if (pendingError) {
    res.status(503).json({
      error: "Não foi possível verificar tentativas pendentes.",
    });
    return;
  }
  if (pendingAttempt) {
    res.status(409).json({
      error:
        "Conclua ou aguarde o encerramento da tentativa de conexão antes de desconectar.",
    });
    return;
  }

  let account: unknown;
  try {
    account = await getInstagramConnectedAccount(
      apiKey,
      row.connected_account_id,
    );
  } catch {
    res.status(502).json({ error: "Não foi possível verificar a conexão." });
    return;
  }
  const expectedUserId = makePartnerComposioUserId(partner.id);
  const observation = parseInstagramAccountObservation(account, {
    connectedAccountId: row.connected_account_id,
    composioUserId: expectedUserId,
    authConfigId,
  });
  if (!observation) {
    res
      .status(409)
      .json({ error: "A conexão não corresponde a este parceiro." });
    return;
  }

  if (observation.status !== "REVOKED") {
    let revoked: boolean;
    try {
      revoked = await revokeInstagramConnectedAccount(
        apiKey,
        row.connected_account_id,
      );
    } catch (error) {
      if (
        error instanceof ComposioInstagramError &&
        (error.status === 400 || error.status === 409)
      ) {
        res.status(409).json({
          error:
            "O Composio não permite revogar este estado. A conexão foi mantida.",
        });
        return;
      }
      res.status(502).json({
        error: "O Composio não confirmou a revogação. A conexão foi mantida.",
      });
      return;
    }
    if (!revoked) {
      res.status(502).json({
        error: "O Composio não confirmou a revogação. A conexão foi mantida.",
      });
      return;
    }
  }

  const { data: disconnected, error: updateError } = await client
    .from("partner_instagram_connections")
    .update({
      status: "revoked",
      is_current: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("connected_account_id", row.connected_account_id)
    .eq("is_current", true)
    .select("id")
    .maybeSingle();
  if (updateError || !disconnected) {
    res.status(503).json({
      error:
        "A revogação ocorreu, mas não foi possível atualizar o cadastro. Atualize a tela.",
    });
    return;
  }

  res.status(200).json({ disconnected: true });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (!["GET", "POST", "DELETE"].includes(req.method ?? "")) {
    res.setHeader("Allow", "GET, POST, DELETE");
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  const admin = await authenticateActiveAdmin(req, res);
  if (!admin) return;
  const composio = getInstagramConfig(res);
  if (!composio) return;

  try {
    if (req.method === "GET") {
      await handleGet(
        req,
        res,
        admin.client,
        composio.apiKey,
        composio.instagramAuthConfigId,
      );
      return;
    }
    if (req.method === "DELETE") {
      await handleDelete(
        req,
        res,
        admin.client,
        composio.apiKey,
        composio.instagramAuthConfigId,
      );
      return;
    }

    const action =
      typeof req.body === "object" && req.body !== null && "action" in req.body
        ? req.body.action
        : null;
    if (action === "connect") {
      await handleConnect(
        req,
        res,
        admin.client,
        admin.userId,
        composio.apiKey,
        composio.instagramAuthConfigId,
      );
      return;
    }
    if (action === "complete") {
      await handleComplete(
        req,
        res,
        admin.client,
        admin.userId,
        composio.apiKey,
        composio.instagramAuthConfigId,
      );
      return;
    }
    res.status(400).json({ error: "Operação do Instagram inválida." });
  } catch {
    res.status(503).json({
      error: "Não foi possível acessar a conexão do Instagram.",
    });
  }
}
