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

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
