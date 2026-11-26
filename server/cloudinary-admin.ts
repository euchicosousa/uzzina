import type {
  CloudinaryAssetOrigin,
  CloudinaryAssetReference,
  CloudinaryAuditAsset,
  CloudinaryAuditResponse,
  CloudinaryResourceType,
} from "../app/lib/cloudinary-audit-contract.js";

const RESOURCE_TYPES: CloudinaryResourceType[] = ["image", "video", "raw"];
const MAX_RESULTS_PER_PAGE = 500;
const MAX_PAGES_PER_TYPE = 40;
export const RECENT_UPLOAD_GRACE_HOURS = 24;

export interface CloudinaryAdminConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface CloudinaryRawResource {
  public_id: string;
  resource_type: CloudinaryResourceType;
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
  secure_url: string;
  asset_folder?: string;
}

export class CloudinaryAdminError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "CloudinaryAdminError";
    this.status = status;
    this.code = code;
  }
}

export function getCloudinaryAdminConfig(): CloudinaryAdminConfig | null {
  const cloudName = (
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.VITE_CLOUDINARY_CLOUD_NAME ||
    ""
  ).trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export function buildCloudinaryAssetKey(
  cloudName: string,
  resourceType: CloudinaryResourceType,
  publicId: string,
): string {
  return `${cloudName.toLowerCase()}/${resourceType}/${publicId}`;
}

function buildThumbnailUrl(
  cloudName: string,
  resourceType: CloudinaryResourceType,
  publicId: string,
  secureUrl: string,
): string | null {
  if (resourceType === "raw") return null;
  if (resourceType === "image") {
    return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/c_fill,w_160,h_160,q_auto,f_auto/${publicId}`;
  }
  if (resourceType === "video") {
    return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/video/upload/so_0,c_fill,w_160,h_160,q_auto,f_jpg/${publicId}.jpg`;
  }
  return secureUrl || null;
}

function extractFolder(publicId: string, assetFolder?: string): string {
  const trimmedFolder = assetFolder?.trim();
  if (trimmedFolder) {
    return trimmedFolder;
  }
  const slashIndex = publicId.lastIndexOf("/");
  return slashIndex > 0 ? publicId.slice(0, slashIndex) : "(raiz)";
}

export function classifyOrigin(
  publicId: string,
  assetFolder: string | undefined,
  knownPartnerSlugs: ReadonlySet<string>,
): CloudinaryAssetOrigin {
  const candidates = [publicId, assetFolder ?? ""].filter(Boolean);
  for (const path of candidates) {
    if (path === "uzzina" || path.startsWith("uzzina/")) {
      return "uzzina_folder";
    }
  }
  for (const path of candidates) {
    const firstSegment = path.split("/")[0]?.trim();
    if (firstSegment && knownPartnerSlugs.has(firstSegment)) {
      return "partner_legacy_folder";
    }
  }
  return "unknown_external";
}

function parseRawResource(
  entry: unknown,
  fallbackType: CloudinaryResourceType,
): CloudinaryRawResource | null {
  if (typeof entry !== "object" || entry === null) return null;
  const item = entry as Record<string, unknown>;
  if (typeof item.public_id !== "string" || !item.public_id) return null;

  if (item.placeholder === true) return null;

  const resourceType: CloudinaryResourceType =
    item.resource_type === "image" ||
    item.resource_type === "video" ||
    item.resource_type === "raw"
      ? item.resource_type
      : fallbackType;

  return {
    public_id: item.public_id,
    resource_type: resourceType,
    format: typeof item.format === "string" ? item.format : "",
    bytes:
      typeof item.bytes === "number" && Number.isFinite(item.bytes)
        ? item.bytes
        : 0,
    width:
      typeof item.width === "number" && Number.isFinite(item.width)
        ? item.width
        : null,
    height:
      typeof item.height === "number" && Number.isFinite(item.height)
        ? item.height
        : null,
    created_at: typeof item.created_at === "string" ? item.created_at : "",
    secure_url:
      typeof item.secure_url === "string"
        ? item.secure_url
        : typeof item.url === "string"
          ? item.url
          : "",
    asset_folder:
      typeof item.asset_folder === "string"
        ? item.asset_folder
        : typeof item.folder === "string"
          ? item.folder
          : undefined,
  };
}

export async function listCloudinaryResources(
  config: CloudinaryAdminConfig,
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<{
  resources: CloudinaryRawResource[];
  pagesScanned: number;
  truncated: boolean;
}> {
  const authHeader = `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64")}`;
  const resources: CloudinaryRawResource[] = [];
  let pagesScanned = 0;
  let truncated = false;

  for (const resourceType of RESOURCE_TYPES) {
    let nextCursor: string | undefined;
    for (let page = 0; page < MAX_PAGES_PER_TYPE; page += 1) {
      const url = new URL(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/resources/${resourceType}/upload`,
      );
      url.searchParams.set("max_results", String(MAX_RESULTS_PER_PAGE));
      if (nextCursor) {
        url.searchParams.set("next_cursor", nextCursor);
      }

      const response = await fetchImpl(url.toString(), {
        headers: { Authorization: authHeader, "Cache-Control": "no-cache" },
        cache: "no-store",
      });
      pagesScanned += 1;

      if (response.status === 401 || response.status === 403) {
        throw new CloudinaryAdminError(
          "Credenciais da Admin API do Cloudinary inválidas ou sem permissão.",
          502,
          "CLOUDINARY_AUTH_FAILED",
        );
      }
      if (response.status === 420 || response.status === 429) {
        throw new CloudinaryAdminError(
          "Limite de consultas do Cloudinary atingido. Tente novamente em alguns minutos.",
          429,
          "CLOUDINARY_RATE_LIMITED",
        );
      }
      if (!response.ok) {
        throw new CloudinaryAdminError(
          `Falha ao consultar o catálogo do Cloudinary (HTTP ${response.status}).`,
          502,
          "CLOUDINARY_UPSTREAM_ERROR",
        );
      }

      const payload = (await response.json()) as {
        resources?: unknown[];
        next_cursor?: string;
      };

      for (const entry of payload.resources ?? []) {
        const parsed = parseRawResource(entry, resourceType);
        if (parsed) resources.push(parsed);
      }

      nextCursor =
        typeof payload.next_cursor === "string" && payload.next_cursor
          ? payload.next_cursor
          : undefined;
      if (!nextCursor) break;
      if (page === MAX_PAGES_PER_TYPE - 1) {
        truncated = true;
      }
    }
  }

  return { resources, pagesScanned, truncated };
}

const MAX_ASSET_REFERENCES_PER_ITEM = 20;

export function isUnlinkableActionReferenceSource(
  source: CloudinaryAssetReference["source"],
): boolean {
  return source === "action_work_files" || source === "action_content_files";
}

export function canAssetUnlinkFromActions(
  references: readonly CloudinaryAssetReference[],
): boolean {
  return (
    references.length > 0 &&
    references.every((ref) => isUnlinkableActionReferenceSource(ref.source))
  );
}

export function buildCloudinaryAuditReport({
  cloudName,
  resources,
  referencedKeys,
  referencesByKey,
  knownPartnerSlugs,
  pagesScanned,
  truncated,
  databaseSourcesChecked,
  nowMs = Date.now(),
  recentGraceHours = RECENT_UPLOAD_GRACE_HOURS,
}: {
  cloudName: string;
  resources: readonly CloudinaryRawResource[];
  referencedKeys: ReadonlySet<string>;
  referencesByKey?: ReadonlyMap<string, readonly CloudinaryAssetReference[]>;
  knownPartnerSlugs: ReadonlySet<string>;
  pagesScanned: number;
  truncated: boolean;
  databaseSourcesChecked: string[];
  nowMs?: number;
  recentGraceHours?: number;
}): CloudinaryAuditResponse {
  const seenKeys = new Set<string>();
  const inUseAssets: CloudinaryAuditAsset[] = [];
  const orphanCandidates: CloudinaryAuditAsset[] = [];
  const protectedRecent: CloudinaryAuditAsset[] = [];
  const protectedUnknown: CloudinaryAuditAsset[] = [];

  let totalCatalogCount = 0;
  let totalCatalogBytes = 0;
  let inUseCount = 0;
  let inUseBytes = 0;
  let recoverableBytes = 0;
  let protectedRecentBytes = 0;
  let protectedUnknownBytes = 0;

  const recentThresholdMs = recentGraceHours * 3600_000;

  for (const resource of resources) {
    const assetKey = buildCloudinaryAssetKey(
      cloudName,
      resource.resource_type,
      resource.public_id,
    );
    if (seenKeys.has(assetKey)) continue;
    seenKeys.add(assetKey);

    totalCatalogCount += 1;
    totalCatalogBytes += resource.bytes;

    const origin = classifyOrigin(
      resource.public_id,
      resource.asset_folder,
      knownPartnerSlugs,
    );
    const folder = extractFolder(resource.public_id, resource.asset_folder);
    const previewUrl = buildThumbnailUrl(
      cloudName,
      resource.resource_type,
      resource.public_id,
      resource.secure_url,
    );

    const baseAsset = {
      assetKey,
      publicId: resource.public_id,
      resourceType: resource.resource_type,
      format: resource.format,
      bytes: resource.bytes,
      width: resource.width,
      height: resource.height,
      createdAt: resource.created_at,
      secureUrl: resource.secure_url,
      previewUrl,
      folder,
      origin,
    };

    if (referencedKeys.has(assetKey)) {
      inUseCount += 1;
      inUseBytes += resource.bytes;
      const rawReferences = referencesByKey?.get(assetKey) ?? [];
      inUseAssets.push({
        ...baseAsset,
        status: "in_use",
        references: rawReferences.slice(0, MAX_ASSET_REFERENCES_PER_ITEM),
        canUnlinkFromActions: canAssetUnlinkFromActions(rawReferences),
      });
      continue;
    }

    const createdMs = Date.parse(resource.created_at);
    const isRecent =
      Number.isNaN(createdMs) || nowMs - createdMs < recentThresholdMs;

    if (origin === "unknown_external") {
      protectedUnknownBytes += resource.bytes;
      protectedUnknown.push({
        ...baseAsset,
        status: "protected_unknown_origin",
      });
      continue;
    }

    if (isRecent) {
      protectedRecentBytes += resource.bytes;
      protectedRecent.push({
        ...baseAsset,
        status: "protected_recent",
      });
      continue;
    }

    recoverableBytes += resource.bytes;
    orphanCandidates.push({
      ...baseAsset,
      status: "orphan_candidate",
    });
  }

  const bySizeDesc = (a: CloudinaryAuditAsset, b: CloudinaryAuditAsset) =>
    b.bytes - a.bytes || b.createdAt.localeCompare(a.createdAt);

  inUseAssets.sort(bySizeDesc);
  orphanCandidates.sort(bySizeDesc);
  protectedRecent.sort(bySizeDesc);
  protectedUnknown.sort(bySizeDesc);

  return {
    coverage: {
      cloudName,
      scannedAt: new Date(nowMs).toISOString(),
      resourceTypes: [...RESOURCE_TYPES],
      pagesScanned,
      truncated,
      recentGraceHours,
      databaseSourcesChecked,
      referencedAssetsCount: referencedKeys.size,
    },
    summary: {
      totalCatalogCount,
      totalCatalogBytes,
      inUseCount,
      inUseBytes,
      orphanCandidatesCount: orphanCandidates.length,
      recoverableBytes,
      protectedRecentCount: protectedRecent.length,
      protectedRecentBytes,
      protectedUnknownCount: protectedUnknown.length,
      protectedUnknownBytes,
    },
    inUseAssets,
    orphanCandidates,
    protectedRecent,
    protectedUnknown,
  };
}

const DELETE_CHUNK_SIZE = 50;

async function verifyCloudinaryDeletion(
  url: URL,
  authorization: string,
  ids: readonly string[],
  fetchImpl: typeof fetch,
): Promise<Set<string>> {
  const options = {
    cache: "no-store" as const,
    signal: AbortSignal.timeout(10_000),
    headers: { Authorization: authorization, "Cache-Control": "no-cache" },
  };
  const stillPresent = new Set<string>();
  const batchIds = ids.filter((id) => !id.includes("+"));
  if (batchIds.length) {
    const lookup = new URL(url.origin + url.pathname);
    lookup.searchParams.set("max_results", String(batchIds.length));
    for (const id of batchIds) lookup.searchParams.append("public_ids[]", id);
    const response = await fetchImpl(lookup.toString(), options);
    if (!response.ok) throw new Error("CLOUDINARY_VERIFY_FAILED");
    const payload: unknown = await response.json();
    if (
      !payload ||
      typeof payload !== "object" ||
      !("resources" in payload) ||
      !Array.isArray(payload.resources) ||
      ("next_cursor" in payload && payload.next_cursor)
    )
      throw new Error("CLOUDINARY_VERIFY_FAILED");
    for (const resource of payload.resources) {
      if (
        !resource ||
        typeof resource !== "object" ||
        typeof resource.public_id !== "string" ||
        !batchIds.includes(resource.public_id)
      )
        throw new Error("CLOUDINARY_VERIFY_FAILED");
      if (resource.placeholder !== true) stillPresent.add(resource.public_id);
    }
  }
  // Cloudinary's bulk lookup does not support public IDs with a plus sign.
  const specialIds = ids.filter((id) => id.includes("+"));
  for (let i = 0; i < specialIds.length; i += 5) {
    await Promise.all(
      specialIds.slice(i, i + 5).map(async (id) => {
        const response = await fetchImpl(
          url.origin + url.pathname + "/" + encodeURIComponent(id),
          options,
        );
        if (response.status === 404) return;
        if (!response.ok) throw new Error("CLOUDINARY_VERIFY_FAILED");
        const resource: unknown = await response.json();
        if (
          !resource ||
          typeof resource !== "object" ||
          !("public_id" in resource) ||
          resource.public_id !== id
        )
          throw new Error("CLOUDINARY_VERIFY_FAILED");
        if (!("placeholder" in resource) || resource.placeholder !== true) {
          stillPresent.add(id);
        }
      }),
    );
  }
  return stillPresent;
}

export async function deleteCloudinaryResourcesByType(
  config: CloudinaryAdminConfig,
  resourceType: CloudinaryResourceType,
  publicIds: readonly string[],
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<{
  deletedIds: string[];
  notFoundIds: string[];
  failed: Array<{ publicId: string; message: string }>;
}> {
  const authHeader = `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64")}`;
  const deletedIds: string[] = [];
  const notFoundIds: string[] = [];
  const failed: Array<{ publicId: string; message: string }> = [];

  for (let index = 0; index < publicIds.length; index += DELETE_CHUNK_SIZE) {
    const chunk = publicIds.slice(index, index + DELETE_CHUNK_SIZE);
    const url = new URL(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/resources/${resourceType}/upload`,
    );
    for (const publicId of chunk) {
      url.searchParams.append("public_ids[]", publicId);
    }

    let response: Response;
    try {
      response = await fetchImpl(url.toString(), {
        method: "DELETE",
        headers: { Authorization: authHeader },
      });
    } catch {
      for (const publicId of chunk) {
        failed.push({
          publicId,
          message: "Falha de conexão ao tentar excluir no Cloudinary.",
        });
      }
      continue;
    }

    if (!response.ok) {
      const message =
        response.status === 401 || response.status === 403
          ? "Sem permissão para excluir arquivos no Cloudinary."
          : response.status === 420 || response.status === 429
            ? "Limite de solicitações do Cloudinary atingido."
            : `Erro ao excluir no Cloudinary (HTTP ${response.status}).`;
      for (const publicId of chunk) {
        failed.push({ publicId, message });
      }
      continue;
    }

    const payload = (await response.json().catch(() => ({}))) as {
      deleted?: Record<string, string>;
    };
    const statusMap = payload.deleted ?? {};
    const acknowledged = chunk.filter((id) => statusMap[id] === "deleted");
    let stillPresent: Set<string> | null = null;
    if (acknowledged.length > 0) {
      try {
        stillPresent = await verifyCloudinaryDeletion(
          url,
          authHeader,
          acknowledged,
          fetchImpl,
        );
      } catch {
        // A delete acknowledgement alone does not establish catalog absence.
      }
    }

    for (const publicId of chunk) {
      const status = statusMap[publicId];
      if (status === "deleted") {
        if (stillPresent && !stillPresent.has(publicId)) {
          deletedIds.push(publicId);
        } else {
          failed.push({
            publicId,
            message: stillPresent
              ? "O Cloudinary informou a exclusão, mas o arquivo ainda aparece na consulta."
              : "O Cloudinary informou a exclusão, mas não foi possível verificá-la.",
          });
        }
      } else if (status === "not_found") {
        notFoundIds.push(publicId);
      } else {
        failed.push({
          publicId,
          message: `Resposta inesperada do Cloudinary (${status || "desconhecido"}).`,
        });
      }
    }
  }

  return { deletedIds, notFoundIds, failed };
}
