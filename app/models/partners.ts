import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "types/database";
import type {
  PartnerDeletePreview,
  PartnerDeleteRequest,
  PartnerDeleteResult,
} from "~/lib/partner-delete-contract";
import type { Partner, PartnerTopic } from "~/types";

export async function getPartnerBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
) {
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .match({ slug })
    .single();

  if (error) throw error;
  return data;
}

export type PartnerFormValues = Omit<
  Database["public"]["Tables"]["partners"]["Insert"],
  "id" | "created_at"
>;

export async function getAllPartners(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .order("title", { ascending: true });
  if (error) throw error;
  return data as Partner[];
}

export async function getPartnersByUserId(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("archived", false)
    .contains("users_ids", [userId])
    .order("title", { ascending: true });

  if (error) throw error;
  return data as Partner[];
}

export async function getOperationalPartners(
  supabase: SupabaseClient,
  userId: string,
  isAdmin: boolean,
) {
  if (!isAdmin) return getPartnersByUserId(supabase, userId);
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("archived", false)
    .order("title", { ascending: true });
  if (error) throw error;
  return data as Partner[];
}

export async function partnerSlugExists(
  supabase: SupabaseClient,
  slug: string,
) {
  const { data } = await supabase
    .from("partners")
    .select("id")
    .eq("slug", slug)
    .single();
  return Boolean(data);
}

export async function createPartner(
  supabase: SupabaseClient<Database>,
  partner: PartnerFormValues,
): Promise<Partner> {
  const { data, error } = await supabase
    .from("partners")
    .insert(partner)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePartnerBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
  partner: PartnerFormValues,
) {
  const { error } = await supabase
    .from("partners")
    .update(partner)
    .eq("slug", slug)
    .select("id")
    .single();
  if (error) throw error;
}

export async function getPartnerHolidayIds(
  supabase: SupabaseClient<Database>,
  partnerId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("partner_holidays")
    .select("celebration_id")
    .eq("partner_id", partnerId);
  if (error) throw error;
  return (data || []).map((row) => row.celebration_id);
}

export async function updatePartnerHolidays(
  supabase: SupabaseClient<Database>,
  partnerId: string,
  celebrationIds: string[],
): Promise<string[]> {
  const { data, error } = await supabase.rpc("replace_partner_holidays", {
    p_partner_id: partnerId,
    p_celebration_ids: celebrationIds,
  });
  if (error) throw error;
  return (data as string[]) || [];
}

export const MAX_TOPICS_PER_PARTNER = 12;
export const MAX_TOPIC_TITLE_LENGTH = 40;

/** Topics the current user can read (RLS limits them to visible partners). */
export async function getPartnerTopics(
  supabase: SupabaseClient<Database>,
): Promise<PartnerTopic[]> {
  const { data, error } = await supabase
    .from("partner_topics")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createPartnerTopic(
  supabase: SupabaseClient<Database>,
  topic: { partner_id: string; title: string; color: string; position: number },
): Promise<PartnerTopic> {
  const { data, error } = await supabase
    .from("partner_topics")
    .insert(topic)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePartnerTopic(
  supabase: SupabaseClient<Database>,
  id: string,
  changes: { title?: string; color?: string },
): Promise<PartnerTopic> {
  const { data, error } = await supabase
    .from("partner_topics")
    .update(changes)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePartnerTopic(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("partner_topics").delete().eq("id", id);
  if (error) throw error;
}

/** Number of actions that use the topic (for the delete confirmation). */
export async function countActionsByTopic(
  supabase: SupabaseClient<Database>,
  topicId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("actions")
    .select("id", { count: "exact", head: true })
    .eq("topic_id", topicId);
  if (error) throw error;
  return count ?? 0;
}

export class PartnerDeleteApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "PartnerDeleteApiError";
    this.status = status;
    this.code = code;
  }
}

async function getPartnerDeleteAuthHeader(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token
    ? `Bearer ${data.session.access_token}`
    : null;
}

export async function getPartnerDeletePreview(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<PartnerDeletePreview> {
  const authHeader = await getPartnerDeleteAuthHeader(supabase);
  const response = await fetch(
    `/api/partner-delete?slug=${encodeURIComponent(slug)}`,
    {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    },
  );
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  };
  if (!response.ok) {
    throw new PartnerDeleteApiError(
      payload.error || "Não foi possível carregar o levantamento do parceiro.",
      response.status,
      payload.code,
    );
  }
  return payload as unknown as PartnerDeletePreview;
}

export async function deleteArchivedPartner(
  supabase: SupabaseClient<Database>,
  request: PartnerDeleteRequest,
): Promise<PartnerDeleteResult> {
  const authHeader = await getPartnerDeleteAuthHeader(supabase);
  const response = await fetch("/api/partner-delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify(request),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  };
  if (!response.ok) {
    throw new PartnerDeleteApiError(
      payload.error || "Não foi possível excluir o parceiro.",
      response.status,
      payload.code,
    );
  }
  return payload as unknown as PartnerDeleteResult;
}
