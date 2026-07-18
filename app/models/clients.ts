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

/** Cria um novo cliente com e-mail e senha com hash. */
export async function createClient(
  supabase: SupabaseClient,
  clientData: Omit<Client, "id" | "created_at" | "active" | "password_hash">,
) {
  const passwordHash = await hashPassword(clientData.password);
  
  const { data, error } = await supabase
    .from("clients")
    .insert([{ ...clientData, password_hash: passwordHash, active: true }])
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

/** Atualiza os dados de um cliente existente incluindo re-hashing da senha caso alterada. */
export async function updateClient(
  supabase: SupabaseClient,
  id: string,
  clientData: Partial<Omit<Client, "id" | "created_at" | "active" | "password_hash">> & { password_hash?: string | null },
) {
  const updates: Partial<Omit<Client, "id" | "created_at" | "active" | "password_hash">> & { password_hash?: string | null } = { ...clientData };
  
  if (clientData.password) {
    updates.password_hash = await hashPassword(clientData.password);
  }

  const { data, error } = await supabase
    .from("clients")
    .update(updates)
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
    .select("*")
    .eq("email", email)
    .is("active", true)
    .single();

  if (error || !data) return null;

  const client = data as Client & { password_hash?: string | null };

  // 1. Caso haja password_hash no banco
  if (client.password_hash) {
    const inputHash = await hashPassword(password);
    const match = inputHash === client.password_hash;
    if (!match) return null;
    return client as Client;
  }

  // 2. Fallback e auto-upgrade para clients antigos sem password_hash
  if (client.password === password) {
    const passwordHash = await hashPassword(password);
    await supabase
      .from("clients")
      .update({ password_hash: passwordHash })
      .eq("id", client.id);
    
    client.password_hash = passwordHash;
    return client as Client;
  }

  return null;
}
