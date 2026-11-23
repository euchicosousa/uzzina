import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "types/database";
import {
  isPartnerInstagramConnection,
  parsePartnerInstagramInsights,
  parsePartnerInstagramMediaPage,
  type PartnerInstagramConnection,
  type PartnerInstagramInsightsResult,
  type PartnerInstagramMediaPage,
} from "~/lib/partner-instagram-contract";

export class PartnerInstagramApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PartnerInstagramApiError";
    this.status = status;
  }
}

async function requestPartnerInstagram<T>(
  supabase: SupabaseClient<Database>,
  input: { method: "GET" | "POST" | "DELETE"; body?: unknown; query?: string },
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const url = `/api/partner-instagram-connection${input.query ?? ""}`;
  const response = await fetch(url, {
    method: input.method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(input.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(input.body ? { body: JSON.stringify(input.body) } : {}),
  });
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Não foi possível concluir a operação do Instagram.";
    throw new PartnerInstagramApiError(message, response.status);
  }
  return payload as T;
}

export async function getPartnerInstagramConnection(
  supabase: SupabaseClient<Database>,
  partnerSlug: string,
): Promise<PartnerInstagramConnection | null> {
  const result = await requestPartnerInstagram<{ connection: unknown }>(
    supabase,
    {
      method: "GET",
      query: `?partnerSlug=${encodeURIComponent(partnerSlug)}`,
    },
  );
  if (result.connection === null) return null;
  if (!isPartnerInstagramConnection(result.connection)) {
    throw new Error("O estado da conexão do Instagram é inválido.");
  }
  return result.connection;
}

export async function startPartnerInstagramConnection(
  supabase: SupabaseClient<Database>,
  partnerSlug: string,
): Promise<{ attemptId: string; redirectUrl: string }> {
  return requestPartnerInstagram(supabase, {
    method: "POST",
    body: { action: "connect", partnerSlug },
  });
}

export async function finishPartnerInstagramConnection(
  supabase: SupabaseClient<Database>,
  body: {
    partnerSlug: string;
    attemptId: string;
    state: string;
    status: "success" | "failed";
    connectedAccountId: string | null;
  },
): Promise<{ connection: PartnerInstagramConnection | null; failed: boolean }> {
  return requestPartnerInstagram(supabase, {
    method: "POST",
    body: { action: "complete", ...body },
  });
}

export async function disconnectPartnerInstagram(
  supabase: SupabaseClient<Database>,
  partnerSlug: string,
): Promise<void> {
  await requestPartnerInstagram(supabase, {
    method: "DELETE",
    body: { partnerSlug },
  });
}

export async function fetchPartnerInstagramMedia(
  supabase: SupabaseClient<Database>,
  input: {
    partnerSlug: string;
    since?: number;
    until?: number;
    after?: string;
  },
): Promise<PartnerInstagramMediaPage> {
  const result = await requestPartnerInstagram<unknown>(supabase, {
    method: "POST",
    body: { action: "media", ...input },
  });
  const page = parsePartnerInstagramMediaPage(result);
  if (!page)
    throw new Error("A lista de publicações retornou dados inválidos.");
  return page;
}

export async function fetchPartnerInstagramInsights(
  supabase: SupabaseClient<Database>,
  input: { partnerSlug: string; since?: number; until?: number },
): Promise<PartnerInstagramInsightsResult> {
  const result = await requestPartnerInstagram<unknown>(supabase, {
    method: "POST",
    body: { action: "insights", ...input },
  });
  const insights = parsePartnerInstagramInsights(result);
  if (!insights) throw new Error("Os insights retornaram dados inválidos.");
  return insights;
}
