import type { SupabaseClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import {
  CLOUDINARY_PERMANENT_CONFIRMATION,
  MAX_CLOUDINARY_DELETE_BATCH,
  MAX_CLOUDINARY_PERMANENT_BATCH,
  type CloudinaryAssetReference,
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
import { extractBearerToken } from "./auth.js";
import {
  CloudinaryAdminError,
  type CloudinaryAdminConfig,
  type CloudinaryRawResource,
  RECENT_UPLOAD_GRACE_HOURS,
  buildCloudinaryAssetKey,
  buildCloudinaryAuditReport,
  canAssetUnlinkFromActions,
  classifyOrigin,
  readCloudinarySelection,
  requestCloudinaryBackupRemoval,
  verifyCloudinaryBackupsBatch,
  deleteCloudinaryResourcesByType,
  getCloudinaryAdminConfig,
  listCloudinaryResources,
} from "./cloudinary-admin.js";
import { createServiceClient, getServiceConfig } from "./supabase-admin.js";

const deleteBodySchema = z
  .object({
    items: z
      .array(
        z.object({
          publicId: z.string().trim().min(1).max(500),
          resourceType: z.enum(["image", "video", "raw"]),
          assetKey: z.string().trim().min(1).max(600),
          providerAssetId: z
            .string()
            .regex(/^[a-z0-9]+$/i)
            .max(128)
            .optional(),
          backupOnly: z.boolean().optional(),
        }),
      )
      .min(1)
      .max(MAX_CLOUDINARY_DELETE_BATCH),
    allowReferencedInActions: z.boolean().optional(),
    backupOnlyWithOriginal: z.boolean().optional(),
    permanentConfirmation: z
      .literal(CLOUDINARY_PERMANENT_CONFIRMATION)
      .optional(),
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

interface ActionFilesRow {
  id: string;
  workFiles: string[] | null;
  contentFiles: string[] | null;
}

function addReferencedUrls(
  value: unknown,
  referencedKeys: Set<string>,
  referencesByKey: Map<string, CloudinaryAssetReference[]>,
  seenRefKeys: Set<string>,
  refMeta: CloudinaryAssetReference,
): void {
  for (const url of extractCloudinaryUrls(value)) {
    const key = normalizeCloudinaryAssetKey(url);
    if (!key) continue;
    referencedKeys.add(key);
    const dedupeKey = `${key}\0${refMeta.source}\0${refMeta.entityId}`;
    if (seenRefKeys.has(dedupeKey)) continue;
    seenRefKeys.add(dedupeKey);
    const list = referencesByKey.get(key);
    if (list) {
      list.push(refMeta);
    } else {
      referencesByKey.set(key, [refMeta]);
    }
  }
}

function filterRemovedCloudinaryUrls(
  urls: string[] | null,
  removedKeys: ReadonlySet<string>,
): { changed: boolean; next: string[] } {
  if (!urls || urls.length === 0) {
    return { changed: false, next: urls ?? [] };
  }
  const next = urls.filter((url) => {
    const key = normalizeCloudinaryAssetKey(url);
    return !key || !removedKeys.has(key);
  });
  return {
    changed: next.length !== urls.length,
    next,
  };
}

async function collectDatabaseReferences(
  supabaseAdmin: ServiceClient,
): Promise<{
  referencedKeys: Set<string>;
  knownPartnerSlugs: Set<string>;
  referencesByKey: Map<string, CloudinaryAssetReference[]>;
  actionRowsById: Map<string, ActionFilesRow>;
}> {
  const [partners, people, clients, actions, comments, socialPlans, leads] =
    await Promise.all([
      fetchAllPages<{
        slug: string;
        title?: string | null;
        image: string | null;
      }>((from, to) =>
        supabaseAdmin
          .from("partners")
          .select("slug, title, image")
          .range(from, to),
      ),
      fetchAllPages<{
        id?: string;
        name?: string | null;
        short?: string | null;
        image: string | null;
      }>((from, to) =>
        supabaseAdmin
          .from("people")
          .select("id, name, short, image")
          .range(from, to),
      ),
      fetchAllPages<{
        id?: string;
        name?: string | null;
        email?: string | null;
        image: string | null;
      }>((from, to) =>
        supabaseAdmin
          .from("clients")
          .select("id, name, email, image")
          .range(from, to),
      ),
      fetchAllPages<{
        id?: string;
        title?: string | null;
        partners?: string[] | null;
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
            "id, title, partners, work_files, content_files, description, content_description, instagram_caption, strategies",
          )
          .range(from, to),
      ),
      fetchAllPages<{ id?: string; content: string }>((from, to) =>
        supabaseAdmin
          .from("action_comments")
          .select("id, content")
          .range(from, to),
      ),
      fetchAllPages<{ id?: string; input: unknown; suggestions: unknown }>(
        (from, to) =>
          supabaseAdmin
            .from("social_plans")
            .select("id, input, suggestions")
            .range(from, to),
      ),
      fetchAllPages<{ id?: string; answers: unknown }>((from, to) =>
        supabaseAdmin.from("leads").select("id, answers").range(from, to),
      ),
    ]);

  const referencedKeys = new Set<string>();
  const knownPartnerSlugs = new Set<string>();
  const referencesByKey = new Map<string, CloudinaryAssetReference[]>();
  const seenRefKeys = new Set<string>();
  const actionRowsById = new Map<string, ActionFilesRow>();

  for (let index = 0; index < partners.length; index += 1) {
    const partner = partners[index];
    if (partner.slug) knownPartnerSlugs.add(partner.slug);
    addReferencedUrls(
      partner.image,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      {
        source: "partner_image",
        entityId: partner.slug || `partner-${index}`,
        label: partner.title?.trim() || partner.slug || "Parceiro",
        partners: partner.slug ? [partner.slug] : undefined,
      },
    );
  }

  for (let index = 0; index < people.length; index += 1) {
    const person = people[index];
    addReferencedUrls(
      person.image,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      {
        source: "person_image",
        entityId: person.id || `person-${index}`,
        label: person.name?.trim() || person.short?.trim() || "Integrante",
      },
    );
  }

  for (let index = 0; index < clients.length; index += 1) {
    const client = clients[index];
    addReferencedUrls(
      client.image,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      {
        source: "client_image",
        entityId: client.id || `client-${index}`,
        label: client.name?.trim() || client.email?.trim() || "Cliente",
      },
    );
  }

  for (let index = 0; index < actions.length; index += 1) {
    const action = actions[index];
    const entityId = action.id || `action-${index}`;
    const label = action.title?.trim() || "Ação sem título";
    const actionPartners = Array.isArray(action.partners)
      ? action.partners
      : [];

    if (action.id) {
      actionRowsById.set(action.id, {
        id: action.id,
        workFiles: action.work_files,
        contentFiles: action.content_files,
      });
    }

    addReferencedUrls(
      action.work_files,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      {
        source: "action_work_files",
        entityId,
        label,
        partners: actionPartners,
      },
    );
    addReferencedUrls(
      action.content_files,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      {
        source: "action_content_files",
        entityId,
        label,
        partners: actionPartners,
      },
    );

    const textRef: CloudinaryAssetReference = {
      source: "action_text",
      entityId,
      label,
      partners: actionPartners,
    };
    addReferencedUrls(
      action.description,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      textRef,
    );
    addReferencedUrls(
      action.content_description,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      textRef,
    );
    addReferencedUrls(
      action.instagram_caption,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      textRef,
    );
    addReferencedUrls(
      action.strategies,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      textRef,
    );
  }

  for (let index = 0; index < comments.length; index += 1) {
    const comment = comments[index];
    addReferencedUrls(
      comment.content,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      {
        source: "comment",
        entityId: comment.id || `comment-${index}`,
        label: "Comentário em ação",
      },
    );
  }

  for (let index = 0; index < socialPlans.length; index += 1) {
    const plan = socialPlans[index];
    const planRef: CloudinaryAssetReference = {
      source: "social_plan",
      entityId: plan.id || `plan-${index}`,
      label: "Planejamento salvo",
    };
    addReferencedUrls(
      plan.input,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      planRef,
    );
    addReferencedUrls(
      plan.suggestions,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      planRef,
    );
  }

  for (let index = 0; index < leads.length; index += 1) {
    const lead = leads[index];
    addReferencedUrls(
      lead.answers,
      referencedKeys,
      referencesByKey,
      seenRefKeys,
      {
        source: "lead",
        entityId: lead.id || `lead-${index}`,
        label: "Lead",
      },
    );
  }

  return {
    referencedKeys,
    knownPartnerSlugs,
    referencesByKey,
    actionRowsById,
  };
}

async function handleGetAudit(
  supabaseAdmin: ServiceClient,
  cloudinaryConfig: CloudinaryAdminConfig,
  res: VercelResponse,
) {
  try {
    const [{ referencedKeys, knownPartnerSlugs, referencesByKey }, catalog] =
      await Promise.all([
        collectDatabaseReferences(supabaseAdmin),
        listCloudinaryResources(cloudinaryConfig),
      ]);

    const report = buildCloudinaryAuditReport({
      cloudName: cloudinaryConfig.cloudName,
      resources: catalog.resources,
      referencedKeys,
      referencesByKey,
      knownPartnerSlugs,
      pagesScanned: catalog.pagesScanned,
      truncated: catalog.truncated,
      databaseSourcesChecked: [...DATABASE_SOURCES_CHECKED],
    });

    report.backups = catalog.backupResources.flatMap((resource) => {
      const assetKey = buildCloudinaryAssetKey(
        cloudinaryConfig.cloudName,
        resource.resource_type,
        resource.public_id,
      );
      const origin = classifyOrigin(
        resource.public_id,
        resource.asset_folder,
        knownPartnerSlugs,
      );
      if (
        !resource.asset_id ||
        origin === "unknown_external" ||
        referencedKeys.has(assetKey)
      )
        return [];
      return [
        {
          assetKey,
          providerAssetId: resource.asset_id,
          publicId: resource.public_id,
          resourceType: resource.resource_type,
          format: resource.format,
          bytes: 0,
          width: null,
          height: null,
          createdAt: resource.created_at,
          secureUrl: "",
          previewUrl: null,
          folder:
            resource.asset_folder ??
            resource.public_id.split("/").slice(0, -1).join("/"),
          origin,
          status: "orphan_candidate",
          backupOnly: true,
        },
      ];
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

  const permanent =
    parsed.data.permanentConfirmation === CLOUDINARY_PERMANENT_CONFIRMATION;
  const backupOnlyWithOriginal = parsed.data.backupOnlyWithOriginal === true;
  if (backupOnlyWithOriginal && !permanent) {
    return res.status(400).json({
      error: "Confirme a exclusão definitiva para remover versões de backup.",
    });
  }
  if (
    permanent &&
    (parsed.data.items.length > MAX_CLOUDINARY_PERMANENT_BATCH ||
      parsed.data.items.some((item) => !item.providerAssetId))
  ) {
    return res.status(400).json({
      error: "Atualize a análise e selecione até 20 arquivos identificados.",
    });
  }
  const allowReferencedInActions =
    parsed.data.allowReferencedInActions === true;

  try {
    const [
      { referencedKeys, knownPartnerSlugs, referencesByKey, actionRowsById },
      catalog,
    ] = await Promise.all([
      collectDatabaseReferences(supabaseAdmin),
      permanent
        ? readCloudinarySelection(
            cloudinaryConfig,
            parsed.data.items.flatMap(({ providerAssetId }) =>
              providerAssetId ? [providerAssetId] : [],
            ),
          )
        : listCloudinaryResources(cloudinaryConfig),
    ]);

    if (catalog.truncated) {
      return res.status(409).json({
        error:
          "O catálogo não pôde ser lido por inteiro. Nenhum arquivo foi excluído.",
      });
    }
    // Pending sends are protected even when their media is no longer attached to an action.
    const pendingKeys = new Set<string>();
    if (permanent) {
      const scheduleClient: SupabaseClient = supabaseAdmin;
      const [schedules, attempts] = await Promise.all([
        fetchAllPages<{ files: unknown }>((from, to) =>
          scheduleClient
            .from("instagram_schedule_batches")
            .select("files, instagram_scheduled_publications!inner(status)")
            .in("instagram_scheduled_publications.status", [
              "scheduled",
              "preparing",
              "processing",
              "uncertain",
              "partial",
            ])
            .order("id")
            .range(from, to),
        ),
        fetchAllPages<{ files: unknown }>((from, to) =>
          scheduleClient
            .from("instagram_publish_attempts")
            .select("files")
            .in("status", ["pending", "uncertain", "partial"])
            .order("id")
            .range(from, to),
        ),
      ]);
      for (const { files } of [...schedules, ...attempts]) {
        for (const url of extractCloudinaryUrls(files)) {
          const key = normalizeCloudinaryAssetKey(url);
          if (key) pendingKeys.add(key);
        }
      }
    }
    const backupsById = new Map(
      catalog.backupResources.map((resource) => [resource.asset_id, resource]),
    );
    const pendingBackups: Array<{
      resource: CloudinaryRawResource;
      assetKey: string;
      backupOnly: boolean;
      originalIsLive?: boolean;
    }> = [];
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
      const backupOnly = backupOnlyWithOriginal || item.backupOnly;
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
      if (pendingKeys.has(expectedKey)) {
        skipped.push({ ...item, reason: "protected_reference" });
        continue;
      }
      const backup =
        permanent && backupOnly && item.assetKey === expectedKey
          ? backupOnlyWithOriginal
            ? liveResource
            : liveResource
              ? undefined
              : backupsById.get(item.providerAssetId)
          : undefined;
      if (
        backup &&
        backup.asset_id === item.providerAssetId &&
        backup.public_id === item.publicId &&
        backup.resource_type === item.resourceType
      ) {
        const origin = classifyOrigin(
          backup.public_id,
          backup.asset_folder,
          knownPartnerSlugs,
        );
        if (origin === "unknown_external" || referencedKeys.has(expectedKey)) {
          skipped.push({
            ...item,
            reason:
              origin === "unknown_external"
                ? "unknown_origin"
                : "now_referenced",
          });
        } else if (
          liveResource &&
          (!Number.isFinite(Date.parse(liveResource.created_at)) ||
            nowMs - Date.parse(liveResource.created_at) < graceMs)
        ) {
          skipped.push({ ...item, reason: "recent_upload" });
        } else {
          pendingBackups.push({
            resource: backup,
            assetKey: expectedKey,
            backupOnly: true,
            originalIsLive: Boolean(liveResource),
          });
        }
        continue;
      }
      if (
        !liveResource ||
        backupOnly ||
        (permanent && liveResource.asset_id !== item.providerAssetId)
      ) {
        skipped.push({ ...item, reason: "not_found" });
        continue;
      }

      const isReferenced = referencedKeys.has(expectedKey);
      if (isReferenced) {
        if (!allowReferencedInActions) {
          skipped.push({ ...item, reason: "now_referenced" });
          continue;
        }
        const refs = referencesByKey.get(expectedKey) ?? [];
        if (!canAssetUnlinkFromActions(refs)) {
          skipped.push({ ...item, reason: "protected_reference" });
          continue;
        }
      } else {
        const origin = classifyOrigin(
          liveResource.public_id,
          liveResource.asset_folder,
          knownPartnerSlugs,
        );
        if (
          origin === "unknown_external" ||
          (origin === "former_client_folder" && !permanent)
        ) {
          skipped.push({ ...item, reason: "unknown_origin" });
          continue;
        }

        const createdMs = Date.parse(liveResource.created_at);
        if (Number.isNaN(createdMs) || nowMs - createdMs < graceMs) {
          skipped.push({ ...item, reason: "recent_upload" });
          continue;
        }
      }

      eligibleByType[item.resourceType].push({
        publicId: liveResource.public_id,
        assetKey: expectedKey,
        bytes: liveResource.bytes,
      });
    }

    const deleted: CloudinaryDeleteDeletedItem[] = [];
    const failed: CloudinaryDeleteFailedItem[] = [];
    const deletedItemsByKey = new Map<
      string,
      {
        publicId: string;
        resourceType: CloudinaryResourceType;
        assetKey: string;
      }
    >();
    let freedBytes = 0;

    for (const resourceType of ["image", "video", "raw"] as const) {
      const batch = eligibleByType[resourceType];
      if (batch.length === 0) continue;

      const byPublicId = new Map(batch.map((entry) => [entry.publicId, entry]));
      const outcome = await deleteCloudinaryResourcesByType(
        cloudinaryConfig,
        resourceType,
        batch.map((entry) => entry.publicId),
        undefined,
        permanent
          ? new Map(
              batch.flatMap(({ publicId, assetKey }) => {
                const assetId = catalogByKey.get(assetKey)?.asset_id;
                return assetId ? [[publicId, assetId] as const] : [];
              }),
            )
          : undefined,
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
        const resource = catalogByKey.get(entry.assetKey);
        if (permanent && resource)
          pendingBackups.push({
            resource,
            assetKey: entry.assetKey,
            backupOnly: false,
          });
        if (allowReferencedInActions) {
          deletedItemsByKey.set(entry.assetKey, {
            publicId,
            resourceType,
            assetKey: entry.assetKey,
          });
        }
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

    let unlinkedActionsCount = 0;

    if (allowReferencedInActions && deletedItemsByKey.size > 0) {
      const removedKeys = new Set(deletedItemsByKey.keys());
      const assetsByActionId = new Map<string, Set<string>>();

      for (const deletedKey of removedKeys) {
        const refs = referencesByKey.get(deletedKey) ?? [];
        for (const ref of refs) {
          if (
            ref.source !== "action_work_files" &&
            ref.source !== "action_content_files"
          ) {
            continue;
          }
          if (!actionRowsById.has(ref.entityId)) continue;
          const set = assetsByActionId.get(ref.entityId);
          if (set) {
            set.add(deletedKey);
          } else {
            assetsByActionId.set(ref.entityId, new Set([deletedKey]));
          }
        }
      }

      for (const [actionId, assetKeys] of assetsByActionId.entries()) {
        const actionRow = actionRowsById.get(actionId);
        if (!actionRow) continue;

        const fresh = permanent
          ? await supabaseAdmin
              .from("actions")
              .select("work_files, content_files, updated_at")
              .eq("id", actionId)
              .maybeSingle()
          : null;
        let updateError: { message: string } | null = null;
        if (fresh?.error) {
          updateError = {
            message:
              "O original foi removido, mas não foi possível reler a ação para limpar o vínculo.",
          };
        } else if (fresh && !fresh.data) {
          // The action no longer exists, so it has no link to clear.
          continue;
        } else {
          const workResult = filterRemovedCloudinaryUrls(
            fresh?.data ? fresh.data.work_files : actionRow.workFiles,
            removedKeys,
          );
          const contentResult = filterRemovedCloudinaryUrls(
            fresh?.data ? fresh.data.content_files : actionRow.contentFiles,
            removedKeys,
          );
          if (!workResult.changed && !contentResult.changed) continue;

          const patch: { work_files?: string[]; content_files?: string[] } = {};
          if (workResult.changed) patch.work_files = workResult.next;
          if (contentResult.changed) patch.content_files = contentResult.next;

          const update = supabaseAdmin
            .from("actions")
            .update(patch)
            .eq("id", actionId);
          if (fresh?.data) {
            const result = await update
              .eq("updated_at", fresh.data.updated_at)
              .select("id")
              .maybeSingle();
            if (result.error || !result.data)
              updateError = {
                message:
                  "O original foi removido, mas a ação mudou durante a limpeza. O backup foi preservado.",
              };
          } else {
            const result = await update;
            updateError = result.error;
          }
        }

        if (updateError) {
          for (const key of assetKeys) {
            const deletedItem = deletedItemsByKey.get(key);
            if (!deletedItem) continue;
            failed.push({
              ...deletedItem,
              message:
                updateError.message ||
                "Arquivo removido no Cloudinary, mas falhou ao limpar link na ação.",
            });
          }
        } else {
          unlinkedActionsCount += 1;
        }
      }
    }

    let backupsCleared = 0;
    const backupVerificationPending: CloudinaryDeleteFailedItem[] = [];
    if (permanent) {
      const unlinkFailures = new Set(failed.map((item) => item.assetKey));
      const candidates = pendingBackups.filter(
        ({ assetKey }) => !unlinkFailures.has(assetKey),
      );
      const liveAssetIds = new Set(
        candidates.flatMap(({ resource, originalIsLive }) =>
          originalIsLive && resource.asset_id ? [resource.asset_id] : [],
        ),
      );
      let batchRateLimited = false;
      const alreadyCleared = await verifyCloudinaryBackupsBatch(
        cloudinaryConfig,
        candidates.map(({ resource }) => resource),
        undefined,
        {
          liveAssetIds,
          requireIndexedAssetIds: new Set(
            candidates.flatMap(({ resource, backupOnly }) =>
              backupOnly && resource.asset_id ? [resource.asset_id] : [],
            ),
          ),
        },
      ).catch((error: unknown) => {
        batchRateLimited =
          error instanceof CloudinaryAdminError && error.status === 429;
        return new Set<string>();
      });
      const submitted: typeof pendingBackups = [];
      const confirmBackup = ({
        resource,
        assetKey,
        backupOnly,
      }: (typeof pendingBackups)[number]) => {
        backupsCleared += 1;
        if (backupOnly) {
          deleted.push({
            publicId: resource.public_id,
            resourceType: resource.resource_type,
            assetKey,
            bytes: 0,
          });
        }
      };
      for (let offset = 0; offset < candidates.length; offset += 5) {
        await Promise.all(
          candidates.slice(offset, offset + 5).map(async (entry) => {
            const { resource, assetKey, originalIsLive } = entry;
            if (resource.asset_id && alreadyCleared.has(resource.asset_id)) {
              confirmBackup(entry);
              return;
            }
            if (batchRateLimited) {
              backupVerificationPending.push({
                publicId: resource.public_id,
                resourceType: resource.resource_type,
                assetKey,
                message:
                  "A cota do Cloudinary impediu a conferência do backup.",
              });
              return;
            }
            try {
              const outcome = await requestCloudinaryBackupRemoval(
                cloudinaryConfig,
                resource,
                undefined,
                originalIsLive,
              );
              if (outcome === "absent") confirmBackup(entry);
              else submitted.push(entry);
            } catch (error) {
              failed.push({
                publicId: resource.public_id,
                resourceType: resource.resource_type,
                assetKey,
                message:
                  error instanceof Error
                    ? error.message
                    : "Não foi possível concluir a remoção do backup.",
              });
            }
          }),
        );
      }
      const verified = await verifyCloudinaryBackupsBatch(
        cloudinaryConfig,
        submitted.map(({ resource }) => resource),
        undefined,
        { liveAssetIds },
      ).catch(() => new Set<string>());
      for (const entry of submitted) {
        const { resource, assetKey } = entry;
        if (resource.asset_id && verified.has(resource.asset_id))
          confirmBackup(entry);
        else
          backupVerificationPending.push({
            publicId: resource.public_id,
            resourceType: resource.resource_type,
            assetKey,
            message: "Pendente de conferência no Cloudinary.",
          });
      }
    }
    const result: CloudinaryDeleteResponse = {
      deleted,
      deletedCount: deleted.length,
      freedBytes,
      unlinkedActionsCount,
      skipped,
      failed,
      ...(permanent
        ? {
            originalsAndDerivativesRemoved: pendingBackups.filter(
              (item) => !item.backupOnly,
            ).length,
            backupsCleared,
            backupVerificationPending,
          }
        : {}),
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

export default async function cloudinaryAuditHandler(
  req: VercelRequest,
  res: VercelResponse,
) {
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
