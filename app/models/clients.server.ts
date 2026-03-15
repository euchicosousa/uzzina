import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "types/database";

export type Client = Tables<"clients">;

/**
 * Retorna todos os registros de clients do usuário logado.
 * Um usuário pode ter múltiplos registros (um por partner).
 */
export async function getClientsByUserId(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .is("active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Client[];
}

/**
 * Retorna todos os partner_slugs acessíveis a um usuário (deduplicados).
 */
export async function getPartnerSlugsByUserId(
  supabase: SupabaseClient,
  userId: string,
) {
  const clients = await getClientsByUserId(supabase, userId);
  const slugs = clients
    .map((c) => c.partner_slug)
    .filter((s): s is string => !!s);
  return [...new Set(slugs)];
}

/** Retorna todos os clientes ativos para o painel admin. */
export async function getAllClients(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .is("active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Client[];
}

/**
 * Arquiva (oculta) logicamente todos os registros client associados a um usuário,
 * garantindo que os ids e relações com comentários continuem existindo no banco.
 */
export async function archiveClient(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase
    .from("clients")
    .update({ active: false })
    .eq("user_id", userId);

  if (error) throw error;
}

/**
 * Retorna os clients agrupados por user_id para exibição no admin.
 * Cada entrada tem nome + lista de partner_slugs.
 */
export type ClientSummary = {
  user_id: string;
  name: string;
  partner_slugs: string[];
};

export function groupClients(clients: Client[]): ClientSummary[] {
  const map = new Map<string, ClientSummary>();
  for (const c of clients) {
    if (!c.user_id) continue;
    if (!map.has(c.user_id)) {
      map.set(c.user_id, {
        user_id: c.user_id,
        name: c.name || "",
        partner_slugs: [],
      });
    }
    if (c.partner_slug) {
      map.get(c.user_id)!.partner_slugs.push(c.partner_slug);
    }
  }
  return [...map.values()];
}

/**
 * Upsert: sincroniza os registros de um usuário na tabela clients.
 * Apaga os registros antigos e recria com os novos partner_slugs.
 */
export async function upsertClientPartners(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  partnerSlugs: string[],
) {
  // Remove registros antigos do usuário
  const { error: deleteError } = await supabase
    .from("clients")
    .delete()
    .eq("user_id", userId);
  if (deleteError) throw deleteError;

  if (partnerSlugs.length === 0) return;

  // Insere novos registros (um por partner)
  const rows = partnerSlugs.map((slug) => ({
    user_id: userId,
    name,
    partner_slug: slug,
  }));

  const { error: insertError } = await supabase.from("clients").insert(rows);
  if (insertError) throw insertError;
}
