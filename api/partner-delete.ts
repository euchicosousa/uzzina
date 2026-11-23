import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import {
  classifyPartnerMedia,
  extractCloudinaryUrls,
  normalizeCloudinaryAssetKey,
} from "../app/lib/cloudinary-references.js";
import type {
  PartnerDeleteActionItem,
  PartnerDeleteClientItem,
  PartnerDeletePreview,
  PartnerDeleteResult,
  PartnerDeleteReviewLinkItem,
  PartnerDeleteSharedActionItem,
} from "../app/lib/partner-delete-contract.js";
import { extractBearerToken } from "../server/auth.js";
import {
  createServiceClient,
  getServiceConfig,
} from "../server/supabase-admin.js";

const PAGE_SIZE = 1000;
const BATCH_SIZE = 100;

const deleteBodySchema = z
  .object({
    partnerId: z.string().uuid(),
    slug: z.string().trim().min(1).max(200),
    expectedCounts: z.object({
      exclusiveActions: z.number().int().min(0),
      sharedActions: z.number().int().min(0),
      exclusiveClients: z.number().int().min(0),
      sharedClients: z.number().int().min(0),
    }),
  })
  .strict();

type ServiceClient = ReturnType<typeof createServiceClient>;

interface ActionPreviewRow {
  id: string;
  title: string;
  date: string;
  category: string;
  phase: string;
  archived: boolean | null;
  partners: string[];
  topic_id: string | null;
  work_files: string[] | null;
  content_files: string[] | null;
  description: string | null;
  content_description: string | null;
}

interface ActionMediaRow {
  id: string;
  work_files: string[] | null;
  content_files: string[] | null;
  description: string | null;
  content_description: string | null;
}

function isMissingRelationError(error: {
  code?: string;
  message?: string;
}): boolean {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    Boolean(error.message?.includes("does not exist"))
  );
}

function isMissingRpcError(error: {
  code?: string;
  message?: string;
}): boolean {
  return (
    error.code === "42883" ||
    error.code === "PGRST202" ||
    Boolean(error.message?.includes("Could not find the function"))
  );
}

async function fetchPaginated<T>(
  fetchPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message?: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await fetchPage(offset, offset + PAGE_SIZE - 1);
    if (error) {
      throw new Error(error.message || "Falha ao consultar dados.");
    }
    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

async function countByBatchedActionIds(
  supabaseAdmin: ServiceClient,
  table: "action_comments" | "notifications" | "strategy_operations",
  actionIds: string[],
): Promise<number> {
  if (actionIds.length === 0) return 0;
  let total = 0;
  for (let index = 0; index < actionIds.length; index += BATCH_SIZE) {
    const batch = actionIds.slice(index, index + BATCH_SIZE);
    const { count, error } = await supabaseAdmin
      .from(table)
      .select("id", { count: "exact", head: true })
      .in("action_id", batch);
    if (error) throw new Error(error.message);
    total += count ?? 0;
  }
  return total;
}

async function collectCommentContentsForActionIds(
  supabaseAdmin: ServiceClient,
  actionIds: string[],
): Promise<string[]> {
  if (actionIds.length === 0) return [];
  const contents: string[] = [];
  for (let index = 0; index < actionIds.length; index += BATCH_SIZE) {
    const batch = actionIds.slice(index, index + BATCH_SIZE);
    const page = await fetchPaginated<{ content: string }>((from, to) =>
      supabaseAdmin
        .from("action_comments")
        .select("content")
        .in("action_id", batch)
        .range(from, to),
    );
    for (const row of page) {
      if (row.content) contents.push(row.content);
    }
  }
  return contents;
}

async function collectPartnerMediaSummary(
  supabaseAdmin: ServiceClient,
  partnerId: string,
  partnerImage: string | null,
  exclusiveActions: ActionPreviewRow[],
  exclusiveClients: Array<{ id: string; image: string | null }>,
  otherClients: Array<{ image: string | null }>,
) {
  const exclusiveActionIds = exclusiveActions.map((action) => action.id);
  const exclusiveCommentContents = await collectCommentContentsForActionIds(
    supabaseAdmin,
    exclusiveActionIds,
  );

  const partnerSources: unknown[] = [
    partnerImage,
    ...exclusiveClients.map((client) => client.image),
    ...exclusiveActions.map((action) => [
      action.work_files,
      action.content_files,
      action.description,
      action.content_description,
    ]),
    ...exclusiveCommentContents,
  ];

  // Skip scanning surviving records if the deleted partner references no Cloudinary files.
  const partnerKeys = new Set<string>();
  for (const source of partnerSources) {
    for (const url of extractCloudinaryUrls(source)) {
      const key = normalizeCloudinaryAssetKey(url);
      if (key) partnerKeys.add(key);
    }
  }

  if (partnerKeys.size === 0) {
    return {
      totalCount: 0,
      orphanCandidatesCount: 0,
      sharedElsewhereCount: 0,
      sampleOrphanUrls: [],
    };
  }

  const [otherPartners, allPeople] = await Promise.all([
    fetchPaginated<{ image: string | null }>((from, to) =>
      supabaseAdmin
        .from("partners")
        .select("image")
        .neq("id", partnerId)
        .range(from, to),
    ),
    fetchPaginated<{ image: string | null }>((from, to) =>
      supabaseAdmin.from("people").select("image").range(from, to),
    ),
  ]);

  const otherSources: unknown[] = [
    ...otherPartners.map((row) => row.image),
    ...otherClients.map((row) => row.image),
    ...allPeople.map((row) => row.image),
  ];

  const exclusiveActionIdSet = new Set(exclusiveActionIds);
  const survivingActions = await fetchPaginated<ActionMediaRow>((from, to) =>
    supabaseAdmin
      .from("actions")
      .select("id, work_files, content_files, description, content_description")
      .range(from, to),
  );

  for (const action of survivingActions) {
    if (exclusiveActionIdSet.has(action.id)) continue;
    otherSources.push(
      action.work_files,
      action.content_files,
      action.description,
      action.content_description,
    );
  }

  // Also check comments on surviving actions if any partner asset still looks unreferenced.
  const preliminary = classifyPartnerMedia(partnerSources, otherSources);
  if (preliminary.orphanCandidatesCount > 0) {
    const comments = await fetchPaginated<{
      action_id: string;
      content: string;
    }>((from, to) =>
      supabaseAdmin
        .from("action_comments")
        .select("action_id, content")
        .range(from, to),
    );
    for (const comment of comments) {
      if (!exclusiveActionIdSet.has(comment.action_id) && comment.content) {
        otherSources.push(comment.content);
      }
    }
  }

  return classifyPartnerMedia(partnerSources, otherSources);
}

async function handleGetPreview(
  supabaseAdmin: ServiceClient,
  req: VercelRequest,
  res: VercelResponse,
) {
  const slug = typeof req.query.slug === "string" ? req.query.slug.trim() : "";
  if (!slug) {
    return res.status(400).json({ error: "Parceiro não informado." });
  }

  const { data: partner, error: partnerError } = await supabaseAdmin
    .from("partners")
    .select("id, slug, title, short, image, colors, archived, sow")
    .eq("slug", slug)
    .maybeSingle();

  if (partnerError) {
    return res.status(500).json({ error: partnerError.message });
  }
  if (!partner) {
    return res.status(404).json({
      code: "PARTNER_NOT_FOUND",
      error: "Parceiro não encontrado.",
    });
  }
  if (!partner.archived) {
    return res.status(409).json({
      code: "PARTNER_NOT_ARCHIVED",
      error: "Apenas parceiros arquivados podem ser excluídos definitivamente.",
      partner: {
        id: partner.id,
        slug: partner.slug,
        title: partner.title,
        archived: false,
      },
    });
  }

  const [
    partnerActions,
    allClients,
    topicsResult,
    plansResult,
    themeRequestsResult,
    holidaysResult,
    reviewLinksResult,
  ] = await Promise.all([
    fetchPaginated<ActionPreviewRow>((from, to) =>
      supabaseAdmin
        .from("actions")
        .select(
          "id, title, date, category, phase, archived, partners, topic_id, work_files, content_files, description, content_description",
        )
        .contains("partners", [partner.slug])
        .order("date", { ascending: false })
        .range(from, to),
    ),
    fetchPaginated<{
      id: string;
      name: string | null;
      email: string;
      active: boolean;
      partners: string[];
      image: string | null;
    }>((from, to) =>
      supabaseAdmin
        .from("clients")
        .select("id, name, email, active, partners, image")
        .range(from, to),
    ),
    supabaseAdmin
      .from("partner_topics")
      .select("id, title, color")
      .eq("partner_id", partner.id)
      .order("position", { ascending: true }),
    supabaseAdmin
      .from("social_plans")
      .select("id")
      .eq("partner_slug", partner.slug),
    supabaseAdmin
      .from("planning_theme_requests")
      .select("id", { count: "exact", head: true })
      .eq("partner_slug", partner.slug),
    supabaseAdmin
      .from("partner_holidays")
      .select("celebration_id", { count: "exact", head: true })
      .eq("partner_id", partner.id),
    supabaseAdmin
      .from("review_links")
      .select("id, created_at, expires_at, revoked_at, action_ids")
      .eq("partner_slug", partner.slug)
      .order("created_at", { ascending: false }),
  ]);

  if (topicsResult.error) {
    return res.status(500).json({ error: topicsResult.error.message });
  }
  if (plansResult.error) {
    return res.status(500).json({ error: plansResult.error.message });
  }
  if (themeRequestsResult.error) {
    return res.status(500).json({ error: themeRequestsResult.error.message });
  }
  if (holidaysResult.error && !isMissingRelationError(holidaysResult.error)) {
    return res.status(500).json({ error: holidaysResult.error.message });
  }
  if (reviewLinksResult.error) {
    return res.status(500).json({ error: reviewLinksResult.error.message });
  }

  const topics = topicsResult.data ?? [];
  const topicIds = new Set(topics.map((topic) => topic.id));

  const exclusiveActionRows: ActionPreviewRow[] = [];
  const sharedActions: PartnerDeleteSharedActionItem[] = [];

  for (const action of partnerActions) {
    const remainingPartners = (action.partners ?? []).filter(
      (item) => item !== partner.slug,
    );
    if (remainingPartners.length === 0) {
      exclusiveActionRows.push(action);
    } else {
      sharedActions.push({
        id: action.id,
        title: action.title,
        date: action.date,
        phase: action.phase,
        remainingPartners,
        clearsPartnerTopic: Boolean(
          action.topic_id && topicIds.has(action.topic_id),
        ),
      });
    }
  }

  const exclusiveActions: PartnerDeleteActionItem[] = exclusiveActionRows.map(
    (action) => ({
      id: action.id,
      title: action.title,
      date: action.date,
      category: action.category,
      phase: action.phase,
      archived: action.archived === true,
    }),
  );

  const exclusiveClientRows: Array<{ id: string; image: string | null }> = [];
  const otherClientRows: Array<{ image: string | null }> = [];
  const exclusiveClients: PartnerDeleteClientItem[] = [];
  const sharedClients: PartnerDeleteClientItem[] = [];

  for (const client of allClients) {
    const clientPartners = client.partners ?? [];
    if (!clientPartners.includes(partner.slug)) {
      otherClientRows.push({ image: client.image });
      continue;
    }
    const remainingPartners = clientPartners.filter(
      (item) => item !== partner.slug,
    );
    if (remainingPartners.length === 0) {
      exclusiveClientRows.push({ id: client.id, image: client.image });
      exclusiveClients.push({
        id: client.id,
        name: client.name,
        email: client.email,
        active: client.active,
      });
    } else {
      otherClientRows.push({ image: client.image });
      sharedClients.push({
        id: client.id,
        name: client.name,
        email: client.email,
        active: client.active,
        remainingPartners,
      });
    }
  }

  const exclusiveActionIds = exclusiveActionRows.map((action) => action.id);
  const planIds = (plansResult.data ?? []).map((plan) => plan.id);

  let socialPlanActionLinksCount = 0;
  for (let index = 0; index < planIds.length; index += BATCH_SIZE) {
    const batch = planIds.slice(index, index + BATCH_SIZE);
    const { count, error } = await supabaseAdmin
      .from("social_plan_action_links")
      .select("plan_id", { count: "exact", head: true })
      .in("plan_id", batch);
    if (error) return res.status(500).json({ error: error.message });
    socialPlanActionLinksCount += count ?? 0;
  }

  const [
    commentsCount,
    notificationsCount,
    strategyOperationsCount,
    mediaSummary,
  ] = await Promise.all([
    countByBatchedActionIds(
      supabaseAdmin,
      "action_comments",
      exclusiveActionIds,
    ),
    countByBatchedActionIds(supabaseAdmin, "notifications", exclusiveActionIds),
    countByBatchedActionIds(
      supabaseAdmin,
      "strategy_operations",
      exclusiveActionIds,
    ),
    collectPartnerMediaSummary(
      supabaseAdmin,
      partner.id,
      partner.image,
      exclusiveActionRows,
      exclusiveClientRows,
      otherClientRows,
    ),
  ]);

  const now = Date.now();
  const reviewLinkItems: PartnerDeleteReviewLinkItem[] = (
    reviewLinksResult.data ?? []
  ).map((link) => {
    const expiresMs = new Date(link.expires_at).getTime();
    return {
      id: link.id,
      createdAt: link.created_at,
      expiresAt: link.expires_at,
      revokedAt: link.revoked_at,
      active: !link.revoked_at && !Number.isNaN(expiresMs) && expiresMs > now,
      actionsCount: Array.isArray(link.action_ids) ? link.action_ids.length : 0,
    };
  });

  const preview: PartnerDeletePreview = {
    partner: {
      id: partner.id,
      slug: partner.slug,
      title: partner.title,
      short: partner.short,
      image: partner.image,
      colors: partner.colors ?? [],
      archived: partner.archived,
      sow: partner.sow,
    },
    snapshot: {
      exclusiveActions: exclusiveActions.length,
      sharedActions: sharedActions.length,
      exclusiveClients: exclusiveClients.length,
      sharedClients: sharedClients.length,
    },
    exclusiveActions,
    sharedActions,
    cascadesFromExclusiveActions: {
      commentsCount,
      notificationsCount,
      strategyOperationsCount,
    },
    exclusiveClients,
    sharedClients,
    topics,
    planning: {
      socialPlansCount: planIds.length,
      socialPlanActionLinksCount,
      themeRequestsCount: themeRequestsResult.count ?? 0,
    },
    holidaysCount: holidaysResult.error ? 0 : (holidaysResult.count ?? 0),
    reviewLinks: {
      totalCount: reviewLinkItems.length,
      activeCount: reviewLinkItems.filter((item) => item.active).length,
      items: reviewLinkItems,
    },
    media: mediaSummary,
  };

  return res.status(200).json(preview);
}

async function handlePostDelete(
  supabaseAdmin: ServiceClient,
  req: VercelRequest,
  res: VercelResponse,
) {
  let rawBody: unknown = req.body;
  if (typeof req.body === "string") {
    try {
      rawBody = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ error: "Corpo JSON inválido." });
    }
  }

  const parsed = deleteBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Dados de confirmação inválidos.",
    });
  }

  const { partnerId, slug, expectedCounts } = parsed.data;
  const { data, error } = await supabaseAdmin.rpc("delete_archived_partner", {
    p_partner_id: partnerId,
    p_expected_slug: slug,
    p_expected_exclusive_action_count: expectedCounts.exclusiveActions,
    p_expected_shared_action_count: expectedCounts.sharedActions,
    p_expected_exclusive_client_count: expectedCounts.exclusiveClients,
    p_expected_shared_client_count: expectedCounts.sharedClients,
  });

  if (error) {
    const message = error.message ?? "";
    if (message.includes("PARTNER_NOT_FOUND")) {
      return res.status(404).json({
        code: "PARTNER_NOT_FOUND",
        error: "Parceiro não encontrado.",
      });
    }
    if (message.includes("PARTNER_NOT_ARCHIVED")) {
      return res.status(409).json({
        code: "PARTNER_NOT_ARCHIVED",
        error: "O parceiro foi reativado e não pode mais ser excluído.",
      });
    }
    if (message.includes("IMPACT_CHANGED")) {
      return res.status(409).json({
        code: "IMPACT_CHANGED",
        error:
          "Os registros vinculados a este parceiro mudaram durante a revisão. Confira os números atualizados antes de excluir.",
      });
    }
    if (message.includes("PARTNER_MISMATCH")) {
      return res.status(409).json({
        code: "PARTNER_MISMATCH",
        error: "Os dados do parceiro mudaram antes da confirmação.",
      });
    }
    if (isMissingRpcError(error)) {
      return res.status(503).json({
        code: "MIGRATION_PENDING",
        error:
          "A função de exclusão definitiva ainda não foi aplicada no banco de dados.",
      });
    }
    return res.status(500).json({
      error: "Não foi possível excluir o parceiro definitivamente.",
    });
  }

  const result: PartnerDeleteResult = {
    deleted: true,
    summary: data as PartnerDeleteResult["summary"],
  };

  return res.status(200).json(result);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  const allowedMethods = ["GET", "POST"];
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const serviceConfig = getServiceConfig();
  if (!serviceConfig) {
    return res
      .status(503)
      .json({ error: "Configuração do servidor incompleta." });
  }

  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Token de autenticação ausente." });
  }

  const supabaseAdmin = createServiceClient(serviceConfig);
  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }

  const { data: person, error: personError } = await supabaseAdmin
    .from("people")
    .select("admin, visible")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (personError) {
    return res.status(500).json({ error: "Falha ao validar permissões." });
  }

  if (!person?.visible || !person.admin) {
    return res.status(403).json({
      error:
        "Acesso negado. Apenas administradores ativos podem excluir parceiros.",
    });
  }

  if (req.method === "GET") {
    return handleGetPreview(supabaseAdmin, req, res);
  }
  return handlePostDelete(supabaseAdmin, req, res);
}
