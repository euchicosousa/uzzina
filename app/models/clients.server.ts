import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "types/database";

export type Client = Tables<"clients">;

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

/** Retorna um cliente específico pelo ID. */
export async function getClientById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Client;
}

/** Cria um novo cliente com e-mail e senha. */
export async function createClient(
  supabase: SupabaseClient,
  clientData: Omit<Client, "id" | "created_at" | "active">,
) {
  const { data, error } = await supabase
    .from("clients")
    .insert([{ ...clientData, active: true }])
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

/** Atualiza os dados de um cliente existente. */
export async function updateClient(
  supabase: SupabaseClient,
  id: string,
  clientData: Partial<Omit<Client, "id" | "created_at" | "active">>,
) {
  const { data, error } = await supabase
    .from("clients")
    .update(clientData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

/**
 * Arquiva (oculta) logicamente o cliente.
 */
export async function archiveClient(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from("clients")
    .update({ active: false })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Autentica um cliente verificando e-mail e senha em texto simples.
 * Retorna o Client se sucesso, null caso contrário.
 */
export async function authenticateClient(
  supabase: SupabaseClient,
  email: string,
  password?: string,
) {
  if (!email || !password) return null;

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .is("active", true)
    .single();

  if (error || !data) return null;
  return data as Client;
}
