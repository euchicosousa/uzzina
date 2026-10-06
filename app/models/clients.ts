import type { SupabaseClient } from "@supabase/supabase-js";
import type { Client } from "~/types";

/** Helper nativo de browser para gerar hash seguro sem usar bibliotecas Node (que quebram o Vite) */
async function hashPassword(password: string): Promise<string> {
  const salt = "uzzina_v1_salt_";
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Retorna todos os clientes ativos para o painel admin. */
export async function getAllClients(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, created_at, name, email, partners, image, active")
    .is("active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Client[];
}

/** Retorna um cliente específico pelo ID. */
export async function getClientById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, created_at, name, email, partners, image, active")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Client;
}

export type CreateClientInput = Omit<Client, "id" | "created_at" | "active" | "password_hash"> & {
  password?: string | null;
};

export type UpdateClientInput = Partial<Omit<Client, "id" | "created_at" | "active" | "password_hash">> & {
  password?: string | null;
  password_hash?: string | null;
};

/** Cria um novo cliente com e-mail e senha com hash. */
export async function createClient(
  supabase: SupabaseClient,
  clientData: CreateClientInput,
) {
  const { password, ...safeData } = clientData;
  const passwordHash = password ? await hashPassword(password) : null;
  
  const { data, error } = await supabase
    .from("clients")
    .insert([{ ...safeData, password_hash: passwordHash, active: true }])
    .select("id, created_at, name, email, partners, image, active")
    .single();

  if (error) throw error;
  return data as Client;
}

/** Atualiza os dados de um cliente existente incluindo re-hashing da senha caso alterada. */
export async function updateClient(
  supabase: SupabaseClient,
  id: string,
  clientData: UpdateClientInput,
) {
  const { password, ...updates } = clientData;
  
  if (password) {
    updates.password_hash = await hashPassword(password);
  }

  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select("id, created_at, name, email, partners, image, active")
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
 * Autentica um cliente verificando e-mail contra o password_hash.
 * Se password_hash for nulo no banco (registro antigo), faz fallback temporário para a senha normal
 * e faz o update automático para salvar o hash para acessos futuros.
 */
export async function authenticateClient(
  supabase: SupabaseClient,
  email: string,
  password?: string,
) {
  if (!email || !password) return null;

  const { data, error } = await supabase
    .from("clients")
    .select("id, created_at, name, email, partners, image, active, password_hash")
    .eq("email", email)
    .is("active", true)
    .single();

  if (error || !data) return null;

  const client = data as Client & { password_hash?: string | null };

  if (client.password_hash) {
    const inputHash = await hashPassword(password);
    const match = inputHash === client.password_hash;
    if (!match) return null;
    return client as Client;
  }

  return null;
}
