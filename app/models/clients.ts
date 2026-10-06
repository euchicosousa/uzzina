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

/** Retorna um cliente específico pelo ID se estiver ativo. */
export async function getClientById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, created_at, name, email, partners, image, active")
    .eq("id", id)
    .eq("active", true)
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

export interface ClientAuthResult {
  client: Client;
  token?: string;
}

/**
 * Autentica um cliente pelo servidor (/api/dash-auth) emitindo cookie HttpOnly no mesmo domínio.
 * Não expõe senha nem token bruto ao código cliente.
 */
export async function authenticateClient(
  _supabase: SupabaseClient,
  email: string,
  password?: string,
): Promise<ClientAuthResult | null> {
  if (!email || !password) return null;

  try {
    const res = await fetch("/api/dash-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: "login", email, password }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.client) return null;
    return { client: data.client as Client };
  } catch (err) {
    console.error("Falha ao comunicar com api/dash-auth:", err);
    return null;
  }
}

/**
 * Valida a sessão ativa do portal com o servidor via Cookie HttpOnly same-origin.
 * Retorna o perfil seguro do cliente caso a sessão continue válida e o cliente ativo.
 */
export async function verifyDashSession(_legacyToken?: string): Promise<Client | null> {
  try {
    const res = await fetch("/api/dash-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: "verify" }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return (data.client as Client) || null;
  } catch (err) {
    console.error("Falha ao validar sessão do portal:", err);
    return null;
  }
}

/**
 * Encerra a sessão do cliente no servidor (/api/dash-auth) revogando o registro e limpando o cookie.
 */
export async function logoutDashSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/dash-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: "logout" }),
    });
    return res.ok;
  } catch (err) {
    console.error("Falha ao revogar sessão do portal:", err);
    return false;
  }
}
