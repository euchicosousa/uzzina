export type PartnerInstagramConnectionStatus =
  "active" | "attention" | "revoked" | "superseded";

export type PartnerInstagramConnection = {
  connectedAccountId: string;
  profileUsername: string;
  profileName: string | null;
  biography: string | null;
  website: string | null;
  profilePictureUrl: string | null;
  mediaCount: number | null;
  status: PartnerInstagramConnectionStatus;
  connectedAt: string;
  verification?: "verified" | "unavailable" | "failed";
};

export type PartnerInstagramLink = {
  connectedAccountId: string;
  redirectUrl: string;
  expiresAt: string;
};

export type PartnerInstagramMediaItem = {
  id: string;
  caption: string | null;
  mediaType: string | null;
  mediaProductType: string | null;
  permalink: string | null;
  timestamp: string | null;
  thumbnailUrl: string | null;
  likeCount: number | null;
  commentsCount: number | null;
  viewCount: number | null;
};

export type PartnerInstagramMediaPage = {
  media: PartnerInstagramMediaItem[];
  nextCursor: string | null;
};

export type PartnerInstagramInsight = {
  name: string;
  title: string;
  period: string;
  values: Array<{ value: number; endTime: string | null }>;
};

export type PartnerInstagramInsightsResult = {
  insights: PartnerInstagramInsight[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInstagramHandle(value: string): boolean {
  return /^@?[a-zA-Z0-9._]{1,30}$/.test(value);
}

export function parsePartnerInstagramLink(
  value: unknown,
): PartnerInstagramLink | null {
  if (!isRecord(value)) return null;
  const connectedAccountId = value.connected_account_id;
  const redirectUrl = value.redirect_url;
  const expiresAt = value.expires_at;
  if (
    typeof connectedAccountId !== "string" ||
    !/^ca_[A-Za-z0-9_-]+$/.test(connectedAccountId) ||
    typeof redirectUrl !== "string" ||
    typeof expiresAt !== "string"
  ) {
    return null;
  }

  try {
    if (new URL(redirectUrl).protocol !== "https:") return null;
  } catch {
    return null;
  }
  if (!Number.isFinite(Date.parse(expiresAt))) return null;

  return { connectedAccountId, redirectUrl, expiresAt };
}

export function parseVerifiedInstagramAccount(
  value: unknown,
  expected: {
    connectedAccountId: string;
    composioUserId: string;
    authConfigId: string;
  },
): { connectedAccountId: string; profileUsername: string } | null {
  const observation = parseInstagramAccountObservation(value, expected);
  if (
    !observation ||
    observation.status !== "ACTIVE" ||
    observation.profileUsername === null
  ) {
    return null;
  }
  return {
    connectedAccountId: observation.connectedAccountId,
    profileUsername: observation.profileUsername,
  };
}

export function parseInstagramAccountObservation(
  value: unknown,
  expected: {
    connectedAccountId: string;
    composioUserId: string;
    authConfigId: string;
  },
): {
  connectedAccountId: string;
  status: string;
  profileUsername: string | null;
} | null {
  if (!isRecord(value)) return null;
  const toolkit = isRecord(value.toolkit) ? value.toolkit : null;
  const authConfig = isRecord(value.auth_config) ? value.auth_config : null;
  const state = isRecord(value.state) ? value.state : null;
  const stateValue = state && isRecord(state.val) ? state.val : null;
  const displayName = stateValue?.displayName;

  if (
    value.id !== expected.connectedAccountId ||
    value.user_id !== expected.composioUserId ||
    typeof value.status !== "string" ||
    toolkit?.slug !== "instagram" ||
    authConfig?.id !== expected.authConfigId
  ) {
    return null;
  }

  const handle =
    typeof displayName === "string" && isInstagramHandle(displayName.trim())
      ? displayName.trim()
      : null;
  return {
    connectedAccountId: expected.connectedAccountId,
    status: value.status,
    profileUsername:
      handle === null ? null : handle.startsWith("@") ? handle : `@${handle}`,
  };
}

export function makePartnerComposioUserId(partnerId: string): string {
  return `uzzina-partner:${partnerId}`;
}

export function isPartnerInstagramConnection(
  value: unknown,
): value is PartnerInstagramConnection {
  if (!isRecord(value)) return false;
  return (
    typeof value.connectedAccountId === "string" &&
    /^ca_[A-Za-z0-9_-]+$/.test(value.connectedAccountId) &&
    typeof value.profileUsername === "string" &&
    isInstagramHandle(value.profileUsername.replace(/^@/, "")) &&
    (value.profileName === null || typeof value.profileName === "string") &&
    (value.biography === null || typeof value.biography === "string") &&
    (value.website === null || typeof value.website === "string") &&
    (value.profilePictureUrl === null ||
      (typeof value.profilePictureUrl === "string" &&
        isHttpsUrl(value.profilePictureUrl))) &&
    (value.mediaCount === null ||
      (typeof value.mediaCount === "number" &&
        Number.isInteger(value.mediaCount) &&
        value.mediaCount >= 0)) &&
    (value.status === "active" ||
      value.status === "attention" ||
      value.status === "revoked" ||
      value.status === "superseded") &&
    typeof value.connectedAt === "string"
  );
}

export function parseComposioInstagramMediaPage(
  value: unknown,
): PartnerInstagramMediaPage | null {
  if (!isRecord(value) || !Array.isArray(value.data)) return null;
  const media: PartnerInstagramMediaItem[] = [];
  for (const entry of value.data) {
    if (!isRecord(entry) || typeof entry.id !== "string") continue;
    media.push({
      id: entry.id,
      caption: optionalString(entry.caption, 2200),
      mediaType: optionalString(entry.media_type, 32),
      mediaProductType: optionalString(entry.media_product_type, 32),
      permalink: optionalHttpsUrl(entry.permalink, 2048),
      timestamp: optionalIsoDate(entry.timestamp),
      thumbnailUrl: optionalHttpsUrl(entry.thumbnail_url, 4096),
      likeCount: optionalCount(entry.like_count),
      commentsCount: optionalCount(entry.comments_count),
      viewCount: optionalCount(entry.view_count ?? entry.total_views_count),
    });
  }
  const paging = isRecord(value.paging) ? value.paging : null;
  const cursors = paging && isRecord(paging.cursors) ? paging.cursors : null;
  const cursor = cursors?.after;
  return {
    media,
    nextCursor:
      typeof cursor === "string" && cursor.length <= 2048 ? cursor : null,
  };
}

export function parseComposioInstagramInsights(
  value: unknown,
): PartnerInstagramInsightsResult | null {
  if (!isRecord(value) || !Array.isArray(value.data)) return null;
  const insights: PartnerInstagramInsight[] = [];
  for (const entry of value.data) {
    if (
      !isRecord(entry) ||
      typeof entry.name !== "string" ||
      typeof entry.period !== "string"
    ) {
      continue;
    }
    const values = Array.isArray(entry.values)
      ? entry.values.flatMap((item) => {
          if (!isRecord(item) || typeof item.value !== "number") return [];
          return [
            {
              value: item.value,
              endTime: optionalIsoDate(item.end_time),
            },
          ];
        })
      : [];
    insights.push({
      name: entry.name,
      title:
        typeof entry.title === "string" && entry.title.length <= 120
          ? entry.title
          : entry.name,
      period: entry.period,
      values,
    });
  }
  return { insights };
}

export function parsePartnerInstagramMediaPage(
  value: unknown,
): PartnerInstagramMediaPage | null {
  if (!isRecord(value) || !Array.isArray(value.media)) return null;
  const media: PartnerInstagramMediaItem[] = [];
  for (const entry of value.media) {
    if (!isRecord(entry) || typeof entry.id !== "string") continue;
    media.push({
      id: entry.id,
      caption: optionalString(entry.caption, 2200),
      mediaType: optionalString(entry.mediaType, 32),
      mediaProductType: optionalString(entry.mediaProductType, 32),
      permalink: optionalHttpsUrl(entry.permalink, 2048),
      timestamp: optionalIsoDate(entry.timestamp),
      thumbnailUrl: optionalHttpsUrl(entry.thumbnailUrl, 4096),
      likeCount: optionalCount(entry.likeCount),
      commentsCount: optionalCount(entry.commentsCount),
      viewCount: optionalCount(entry.viewCount),
    });
  }
  const cursor = value.nextCursor;
  return {
    media,
    nextCursor:
      typeof cursor === "string" && cursor.length <= 2048 ? cursor : null,
  };
}

export function parsePartnerInstagramInsights(
  value: unknown,
): PartnerInstagramInsightsResult | null {
  if (!isRecord(value) || !Array.isArray(value.insights)) return null;
  const insights: PartnerInstagramInsight[] = [];
  for (const entry of value.insights) {
    if (
      !isRecord(entry) ||
      typeof entry.name !== "string" ||
      typeof entry.period !== "string"
    ) {
      continue;
    }
    const values = Array.isArray(entry.values)
      ? entry.values.flatMap((item) => {
          if (!isRecord(item) || typeof item.value !== "number") return [];
          return [
            { value: item.value, endTime: optionalIsoDate(item.endTime) },
          ];
        })
      : [];
    insights.push({
      name: entry.name,
      title:
        typeof entry.title === "string" && entry.title.length <= 120
          ? entry.title
          : entry.name,
      period: entry.period,
      values,
    });
  }
  return { insights };
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function optionalString(value: unknown, maxLength: number): string | null {
  return typeof value === "string" && value.length <= maxLength ? value : null;
}

function optionalHttpsUrl(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string" || value.length > maxLength) return null;
  return isHttpsUrl(value) ? value : null;
}

function optionalCount(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function optionalIsoDate(value: unknown): string | null {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    return null;
  }
  return value;
}
