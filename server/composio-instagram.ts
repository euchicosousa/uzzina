import { parsePartnerInstagramLink } from "../app/lib/partner-instagram-contract.js";

const COMPOSIO_API = "https://backend.composio.dev/api/v3.1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class ComposioInstagramError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("Composio request failed.");
    this.name = "ComposioInstagramError";
    this.status = status;
  }
}

async function requestComposio(
  apiKey: string,
  path: string,
  init: RequestInit,
): Promise<{ status: number; body: unknown }> {
  let response: Response;
  try {
    response = await fetch(`${COMPOSIO_API}${path}`, {
      ...init,
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...init.headers,
      },
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ComposioInstagramError(0);
  }

  if (!response.ok) {
    await response.body?.cancel().catch(() => undefined);
    throw new ComposioInstagramError(response.status);
  }

  const body: unknown = await response.json().catch(() => null);
  if (body === null) throw new ComposioInstagramError(response.status);
  return { status: response.status, body };
}

async function getInstagramGraphData(input: {
  apiKey: string;
  connectedAccountId: string;
  composioUserId: string;
  endpoint: string;
  parameters: Array<{ name: string; value: string | number; type: "query" }>;
}): Promise<unknown> {
  const { body } = await requestComposio(input.apiKey, "/tools/execute/proxy", {
    method: "POST",
    body: JSON.stringify({
      connected_account_id: input.connectedAccountId,
      user_id: input.composioUserId,
      endpoint: input.endpoint,
      method: "GET",
      parameters: input.parameters.map((parameter) => ({
        ...parameter,
        value: String(parameter.value),
      })),
    }),
  });
  if (!isRecord(body) || typeof body.status !== "number") {
    throw new ComposioInstagramError(502);
  }
  if (body.status < 200 || body.status >= 300 || !isRecord(body.data)) {
    throw new ComposioInstagramError(
      body.status >= 400 && body.status <= 599 ? body.status : 502,
    );
  }
  return body.data;
}

export async function listInstagramMedia(input: {
  apiKey: string;
  connectedAccountId: string;
  composioUserId: string;
  since: number;
  until: number;
  after?: string;
}): Promise<unknown> {
  const parameters: Array<{
    name: string;
    value: string | number;
    type: "query";
  }> = [
    {
      name: "fields",
      value:
        "id,caption,media_type,media_product_type,permalink,timestamp,thumbnail_url,like_count,comments_count,view_count,total_views_count",
      type: "query",
    },
    { name: "limit", value: 50, type: "query" },
    { name: "since", value: input.since, type: "query" },
    { name: "until", value: input.until, type: "query" },
  ];
  if (input.after) {
    parameters.push({ name: "after", value: input.after, type: "query" });
  }
  return getInstagramGraphData({
    apiKey: input.apiKey,
    connectedAccountId: input.connectedAccountId,
    composioUserId: input.composioUserId,
    endpoint: "/v21.0/me/media",
    parameters,
  });
}

export async function getInstagramUserInsights(input: {
  apiKey: string;
  connectedAccountId: string;
  composioUserId: string;
  since: number;
  until: number;
}): Promise<unknown> {
  return getInstagramGraphData({
    apiKey: input.apiKey,
    connectedAccountId: input.connectedAccountId,
    composioUserId: input.composioUserId,
    endpoint: "/v21.0/me/insights",
    parameters: [
      {
        name: "metric",
        value: "reach,accounts_engaged,total_interactions,views,profile_views",
        type: "query",
      },
      { name: "period", value: "day", type: "query" },
      { name: "metric_type", value: "time_series", type: "query" },
      { name: "since", value: input.since, type: "query" },
      { name: "until", value: input.until, type: "query" },
    ],
  });
}

export async function createInstagramConnectLink(input: {
  apiKey: string;
  authConfigId: string;
  composioUserId: string;
  callbackUrl: string;
}): Promise<{
  connectedAccountId: string;
  redirectUrl: string;
  expiresAt: string;
}> {
  const { body } = await requestComposio(
    input.apiKey,
    "/connected_accounts/link",
    {
      method: "POST",
      body: JSON.stringify({
        auth_config_id: input.authConfigId,
        user_id: input.composioUserId,
        callback_url: input.callbackUrl,
      }),
    },
  );
  const link = parsePartnerInstagramLink(body);
  if (!link) throw new ComposioInstagramError(502);
  return link;
}

export async function getInstagramConnectedAccount(
  apiKey: string,
  connectedAccountId: string,
): Promise<unknown> {
  const { body } = await requestComposio(
    apiKey,
    `/connected_accounts/${encodeURIComponent(connectedAccountId)}`,
    { method: "GET" },
  );
  return body;
}

export async function getInstagramProfileUsername(
  apiKey: string,
  connectedAccountId: string,
  composioUserId: string,
): Promise<string | null> {
  const profile = await getInstagramProfile(
    apiKey,
    connectedAccountId,
    composioUserId,
  );
  return profile?.profileUsername ?? null;
}

export type InstagramProfile = {
  profileUsername: string;
  profileName: string | null;
  biography: string | null;
  website: string | null;
  profilePictureUrl: string | null;
  mediaCount: number | null;
};

export async function getInstagramProfile(
  apiKey: string,
  connectedAccountId: string,
  composioUserId: string,
): Promise<InstagramProfile | null> {
  const { body } = await requestComposio(apiKey, "/tools/execute/proxy", {
    method: "POST",
    body: JSON.stringify({
      connected_account_id: connectedAccountId,
      user_id: composioUserId,
      endpoint: "/v21.0/me",
      method: "GET",
      parameters: [
        {
          name: "fields",
          value:
            "id,username,name,biography,website,profile_picture_url,media_count",
          type: "query",
        },
      ],
    }),
  });
  if (!isRecord(body)) return null;
  const result = body;
  if (
    typeof result.status !== "number" ||
    result.status < 200 ||
    result.status >= 300 ||
    !isRecord(result.data)
  ) {
    return null;
  }
  const profile = result.data;
  const username = profile.username;
  if (
    typeof username !== "string" ||
    !/^@?[a-zA-Z0-9._]{1,30}$/.test(username.trim())
  ) {
    return null;
  }
  const normalized = username.trim();
  const profileUsername = normalized.startsWith("@")
    ? normalized
    : `@${normalized}`;
  const profileName = optionalText(profile.name, 255);
  const biography = optionalText(profile.biography, 2200);
  const website = optionalText(profile.website, 2048);
  const profilePictureUrl = optionalHttpsUrl(profile.profile_picture_url, 4096);
  const mediaCount =
    typeof profile.media_count === "number" &&
    Number.isInteger(profile.media_count) &&
    profile.media_count >= 0
      ? profile.media_count
      : null;
  return {
    profileUsername,
    profileName,
    biography,
    website,
    profilePictureUrl,
    mediaCount,
  };
}

function optionalText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

function optionalHttpsUrl(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string" || value.length > maxLength) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

export async function revokeInstagramConnectedAccount(
  apiKey: string,
  connectedAccountId: string,
): Promise<boolean> {
  const { body } = await requestComposio(
    apiKey,
    `/connected_accounts/${encodeURIComponent(connectedAccountId)}/revoke`,
    { method: "POST" },
  );
  if (typeof body !== "object" || body === null) return false;
  const response = body as Record<string, unknown>;
  const account = response.connected_account;
  return (
    typeof account === "object" &&
    account !== null &&
    "id" in account &&
    account.id === connectedAccountId &&
    "status" in account &&
    account.status === "REVOKED"
  );
}
