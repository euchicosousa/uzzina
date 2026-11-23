import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import {
  MAX_CLOUDINARY_DELETE_BATCH,
  type CloudinaryDeleteDeletedItem,
  type CloudinaryDeleteFailedItem,
  type CloudinaryDeleteResponse,
  type CloudinaryDeleteSkippedItem,
  type CloudinaryResourceType,
} from "../app/lib/cloudinary-audit-contract.js";
import {
  extractCloudinaryUrls,
  normalizeCloudinaryAssetKey,
} from "../app/lib/cloudinary-references.js";
import { extractBearerToken } from "../server/auth.js";
import {
  CloudinaryAdminError,
  type CloudinaryAdminConfig,
  type CloudinaryRawResource,
  RECENT_UPLOAD_GRACE_HOURS,
  buildCloudinaryAssetKey,
  buildCloudinaryAuditReport,
  classifyOrigin,
  deleteCloudinaryResourcesByType,
  getCloudinaryAdminConfig,
  listCloudinaryResources,
} from "../server/cloudinary-admin.js";
import {
  createServiceClient,
  getServiceConfig,
} from "../server/supabase-admin.js";

const deleteBodySchema = z
  .object({
    items: z
      .array(
        z.object({
          publicId: z.string().trim().min(1).max(500),
          resourceType: z.enum(["image", "video", "raw"]),
          assetKey: z.string().trim().min(1).max(600),
        }),
      )
      .min(1)
      .max(MAX_CLOUDINARY_DELETE_BATCH),
  })
  .strict();

const PAGE_SIZE = 1000;

type ServiceClient = ReturnType<typeof createServiceClient>;

const DATABASE_SOURCES_CHECKED = [
  "partners.image",
  "people.image",
  "clients.image",
  "actions.work_files",
  "actions.content_files",
  "actions.description",
  "actions.content_description",
  "actions.instagram_caption",
  "actions.strategies",
  "action_comments.content",
  "social_plans.input",
  "social_plans.suggestions",
  "leads.answers",
];

async function fetchAllPages<T>(
  fetchPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message?: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await fetchPage(offset, offset + PAGE_SIZE - 1);
    if (error) {
      throw new Error(error.message || "Falha ao consultar referências.");
    }
    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function addReferencedUrls(value: unknown, referencedKeys: Set<string>): void {
  for (const url of extractCloudinaryUrls(value)) {
    const key = normalizeCloudinaryAssetKey(url);
    if (key) referencedKeys.add(key);
  }
}

async function collectDatabaseReferences(
  supabaseAdmin: ServiceClient,
): Promise<{
  referencedKeys: Set<string>;
  knownPartnerSlugs: Set<string>;
}> {
  const [partners, people, clients, actions, comments, socialPlans, leads] =
    await Promise.all([
      fetchAllPages<{ slug: string; image: string | null }>((from, to) =>
        supabaseAdmin.from("partners").select("slug, image").range(from, to),
      ),
      fetchAllPages<{ image: string | null }>((from, to) =>
        supabaseAdmin.from("people").select("image").range(from, to),
      ),
      fetchAllPages<{ image: string | null }>((from, to) =>
        supabaseAdmin.from("clients").select("image").range(from, to),
      ),
      fetchAllPages<{
        work_files: string[] | null;
        content_files: string[] | null;
        description: string | null;
        content_description: string | null;
        instagram_caption: string | null;
        strategies: unknown;
      }>((from, to) =>
        supabaseAdmin
          .from("actions")
          .select(
            "work_files, content_files, description, content_description, instagram_caption, strategies",
          )
          .range(from, to),
      ),
      fetchAllPages<{ content: string }>((from, to) =>
        supabaseAdmin.from("action_comments").select("content").range(from, to),
      ),
      fetchAllPages<{ input: unknown; suggestions: unknown }>((from, to) =>
        supabaseAdmin
          .from("social_plans")
          .select("input, suggestions")
          .range(from, to),
      ),
      fetchAllPages<{ answers: unknown }>((from, to) =>
        supabaseAdmin.from("leads").select("answers").range(from, to),
      ),
    ]);

  const referencedKeys = new Set<string>();
  const knownPartnerSlugs = new Set<string>();

  for (const partner of partners) {
    if (partner.slug) knownPartnerSlugs.add(partner.slug);
    addReferencedUrls(partner.image, referencedKeys);
  }
  for (const person of people) {
    addReferencedUrls(person.image, referencedKeys);
  }
  for (const client of clients) {
    addReferencedUrls(client.image, referencedKeys);
  }
  for (const action of actions) {
    addReferencedUrls(action.work_files, referencedKeys);
    addReferencedUrls(action.content_files, referencedKeys);
    addReferencedUrls(action.description, referencedKeys);
    addReferencedUrls(action.content_description, referencedKeys);
    addReferencedUrls(action.instagram_caption, referencedKeys);
    addReferencedUrls(action.strategies, referencedKeys);
  }
  for (const comment of comments) {
    addReferencedUrls(comment.content, referencedKeys);
  }
  for (const plan of socialPlans) {
    addReferencedUrls(plan.input, referencedKeys);
    addReferencedUrls(plan.suggestions, referencedKeys);
  }
  for (const lead of leads) {
    addReferencedUrls(lead.answers, referencedKeys);
  }

  return { referencedKeys, knownPartnerSlugs };
}

async function handleGetAudit(
  supabaseAdmin: ServiceClient,
  cloudinaryConfig: CloudinaryAdminConfig,
  res: VercelResponse,
) {
  try {
    const [{ referencedKeys, knownPartnerSlugs }, catalog] = await Promise.all([
      collectDatabaseReferences(supabaseAdmin),
      listCloudinaryResources(cloudinaryConfig),
    ]);

    const report = buildCloudinaryAuditReport({
      cloudName: cloudinaryConfig.cloudName,
      resources: catalog.resources,
      referencedKeys,
      knownPartnerSlugs,
      pagesScanned: catalog.pagesScanned,
      truncated: catalog.truncated,
      databaseSourcesChecked: [...DATABASE_SOURCES_CHECKED],
    });

    return res.status(200).json(report);
  } catch (error) {
    if (error instanceof CloudinaryAdminError) {
      return res
        .status(error.status)
        .json({ code: error.code, error: error.message });
    }
    return res.status(500).json({
      error: "Não foi possível concluir a auditoria do Cloudinary.",
    });
  }
}

async function handlePostDelete(
  supabaseAdmin: ServiceClient,
  cloudinaryConfig: CloudinaryAdminConfig,
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
      error:
        "Seleção inválida para exclusão (envie entre 1 e 100 arquivos por lote).",
    });
  }

  try {
    const [{ referencedKeys, knownPartnerSlugs }, catalog] = await Promise.all([
      collectDatabaseReferences(supabaseAdmin),
      listCloudinaryResources(cloudinaryConfig),
    ]);

    const catalogByKey = new Map<string, CloudinaryRawResource>();
    for (const resource of catalog.resources) {
      const key = buildCloudinaryAssetKey(
        cloudinaryConfig.cloudName,
        resource.resource_type,
        resource.public_id,
      );
      if (!catalogByKey.has(key)) {
        catalogByKey.set(key, resource);
      }
    }

    const nowMs = Date.now();
    const graceMs = RECENT_UPLOAD_GRACE_HOURS * 3600_000;
    const seen = new Set<string>();
    const skipped: CloudinaryDeleteSkippedItem[] = [];
    const eligibleByType: Record<
      CloudinaryResourceType,
      Array<{ publicId: string; assetKey: string; bytes: number }>
    > = {
      image: [],
      video: [],
      raw: [],
    };

    for (const item of parsed.data.items) {
      const expectedKey = buildCloudinaryAssetKey(
        cloudinaryConfig.cloudName,
        item.resourceType,
        item.publicId,
      );
      if (seen.has(expectedKey)) continue;
      seen.add(expectedKey);

      const liveResource =
        item.assetKey === expectedKey
          ? catalogByKey.get(expectedKey)
          : undefined;
      if (!liveResource) {
        skipped.push({ ...item, reason: "not_found" });
        continue;
      }

      if (referencedKeys.has(expectedKey)) {
        skipped.push({ ...item, reason: "now_referenced" });
        continue;
      }

      const origin = classifyOrigin(
        liveResource.public_id,
        liveResource.asset_folder,
        knownPartnerSlugs,
      );
      if (origin === "unknown_external") {
        skipped.push({ ...item, reason: "unknown_origin" });
        continue;
      }

      const createdMs = Date.parse(liveResource.created_at);
      if (Number.isNaN(createdMs) || nowMs - createdMs < graceMs) {
        skipped.push({ ...item, reason: "recent_upload" });
        continue;
      }

      eligibleByType[item.resourceType].push({
        publicId: liveResource.public_id,
        assetKey: expectedKey,
        bytes: liveResource.bytes,
      });
    }

    const deleted: CloudinaryDeleteDeletedItem[] = [];
    const failed: CloudinaryDeleteFailedItem[] = [];
    let freedBytes = 0;

    for (const resourceType of ["image", "video", "raw"] as const) {
      const batch = eligibleByType[resourceType];
      if (batch.length === 0) continue;

      const byPublicId = new Map(batch.map((entry) => [entry.publicId, entry]));
      const outcome = await deleteCloudinaryResourcesByType(
        cloudinaryConfig,
        resourceType,
        batch.map((entry) => entry.publicId),
      );

      for (const publicId of outcome.deletedIds) {
        const entry = byPublicId.get(publicId);
        if (!entry) continue;
        freedBytes += entry.bytes;
        deleted.push({
          publicId,
          resourceType,
          assetKey: entry.assetKey,
          bytes: entry.bytes,
        });
      }

      for (const publicId of outcome.notFoundIds) {
        const entry = byPublicId.get(publicId);
        if (!entry) continue;
        skipped.push({
          publicId,
          resourceType,
          assetKey: entry.assetKey,
          reason: "not_found",
        });
      }

      for (const err of outcome.failed) {
        const entry = byPublicId.get(err.publicId);
        if (!entry) continue;
        failed.push({
          publicId: err.publicId,
          resourceType,
          assetKey: entry.assetKey,
          message: err.message,
        });
      }
    }

    const result: CloudinaryDeleteResponse = {
      deleted,
      deletedCount: deleted.length,
      freedBytes,
      skipped,
      failed,
    };

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof CloudinaryAdminError) {
      return res
        .status(error.status)
        .json({ code: error.code, error: error.message });
    }
    return res.status(500).json({
      error: "Não foi possível excluir os arquivos selecionados.",
    });
  }
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
        "Acesso negado. Apenas administradores ativos podem auditar o Cloudinary.",
    });
  }

  const cloudinaryConfig = getCloudinaryAdminConfig();
  if (!cloudinaryConfig) {
    return res.status(503).json({
      code: "CLOUDINARY_NOT_CONFIGURED",
      error:
        "Credenciais de leitura do Cloudinary não configuradas no servidor (CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET).",
    });
  }

  if (req.method === "GET") {
    return handleGetAudit(supabaseAdmin, cloudinaryConfig, res);
  }
  return handlePostDelete(supabaseAdmin, cloudinaryConfig, req, res);
}
