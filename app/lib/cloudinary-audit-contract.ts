export type CloudinaryResourceType = "image" | "video" | "raw";

export type CloudinaryAssetOrigin =
  "uzzina_folder" | "partner_legacy_folder" | "unknown_external";

export type CloudinaryAssetStatus =
  | "orphan_candidate"
  | "protected_recent"
  | "protected_unknown_origin"
  | "in_use";

export type CloudinaryAssetReferenceSource =
  | "action_work_files"
  | "action_content_files"
  | "action_text"
  | "partner_image"
  | "person_image"
  | "client_image"
  | "comment"
  | "social_plan"
  | "lead";

export interface CloudinaryAssetReference {
  source: CloudinaryAssetReferenceSource;
  entityId: string;
  label: string;
  partners?: string[];
}

export interface CloudinaryAuditAsset {
  assetKey: string;
  publicId: string;
  resourceType: CloudinaryResourceType;
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  secureUrl: string;
  previewUrl: string | null;
  folder: string;
  origin: CloudinaryAssetOrigin;
  status: CloudinaryAssetStatus;
  references?: CloudinaryAssetReference[];
  canUnlinkFromActions?: boolean;
}

export interface CloudinaryAuditCoverage {
  cloudName: string;
  scannedAt: string;
  resourceTypes: CloudinaryResourceType[];
  pagesScanned: number;
  truncated: boolean;
  recentGraceHours: number;
  databaseSourcesChecked: string[];
  referencedAssetsCount: number;
}

export interface CloudinaryAuditSummary {
  totalCatalogCount: number;
  totalCatalogBytes: number;
  inUseCount: number;
  inUseBytes: number;
  orphanCandidatesCount: number;
  recoverableBytes: number;
  protectedRecentCount: number;
  protectedRecentBytes: number;
  protectedUnknownCount: number;
  protectedUnknownBytes: number;
}

export interface CloudinaryAuditResponse {
  coverage: CloudinaryAuditCoverage;
  summary: CloudinaryAuditSummary;
  inUseAssets: CloudinaryAuditAsset[];
  orphanCandidates: CloudinaryAuditAsset[];
  protectedRecent: CloudinaryAuditAsset[];
  protectedUnknown: CloudinaryAuditAsset[];
}

export const MAX_CLOUDINARY_DELETE_BATCH = 100;

export interface CloudinaryDeleteItemRequest {
  publicId: string;
  resourceType: CloudinaryResourceType;
  assetKey: string;
}

export interface CloudinaryDeleteRequest {
  items: CloudinaryDeleteItemRequest[];
  allowReferencedInActions?: boolean;
}

export type CloudinaryDeleteSkipReason =
  | "now_referenced"
  | "protected_reference"
  | "recent_upload"
  | "unknown_origin"
  | "not_found";

export interface CloudinaryDeleteDeletedItem {
  publicId: string;
  resourceType: CloudinaryResourceType;
  assetKey: string;
  bytes: number;
}

export interface CloudinaryDeleteSkippedItem {
  publicId: string;
  resourceType: CloudinaryResourceType;
  assetKey: string;
  reason: CloudinaryDeleteSkipReason;
}

export interface CloudinaryDeleteFailedItem {
  publicId: string;
  resourceType: CloudinaryResourceType;
  assetKey: string;
  message: string;
}

export interface CloudinaryDeleteResponse {
  deleted: CloudinaryDeleteDeletedItem[];
  deletedCount: number;
  freedBytes: number;
  unlinkedActionsCount: number;
  skipped: CloudinaryDeleteSkippedItem[];
  failed: CloudinaryDeleteFailedItem[];
}
