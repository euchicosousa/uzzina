import { PortalHttpError, portalRequest } from "~/services/portal-http";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Client } from "~/types";

async function getAuthHeader(
  supabase?: SupabaseClient,
): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token
    ? `Bearer ${data.session.access_token}`
    : null;
}

/** Retorna todos os clientes ativos para o painel admin via API autenticada. */
export async function getAllClients(
  supabase: SupabaseClient,
): Promise<Client[]> {
  const authHeader = await getAuthHeader(supabase);
  const res = await fetch("/api/client-accounts", {
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao listar clientes.");
  }

  const data = await res.json();
  return data.clients as Client[];
}

/** Retorna um cliente específico pelo ID via API autenticada. */
export async function getClientById(
  supabase: SupabaseClient,
  id: string,
): Promise<Client> {
  const authHeader = await getAuthHeader(supabase);
  const res = await fetch(`/api/client-accounts?id=${encodeURIComponent(id)}`, {
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao carregar cliente.");
  }

  const data = await res.json();
  return data.client as Client;
}

export type CreateClientInput = Omit<
  Client,
  "id" | "created_at" | "active" | "password_hash"
> & {
  password?: string | null;
};

export type UpdateClientInput = Partial<
  Omit<Client, "id" | "created_at" | "active" | "password_hash">
> & {
  password?: string | null;
};

/** Cria um novo cliente via servidor com hash bcrypt no backend. */
export async function createClient(
  supabase: SupabaseClient,
  clientData: CreateClientInput,
): Promise<Client> {
  const authHeader = await getAuthHeader(supabase);
  const res = await fetch("/api/client-accounts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify(clientData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao cadastrar cliente.");
  }

  const data = await res.json();
  return data.client as Client;
}

/** Atualiza dados do cliente via servidor. Senha vazia preserva a existente. */
export async function updateClient(
  supabase: SupabaseClient,
  id: string,
  clientData: UpdateClientInput,
): Promise<Client> {
  const authHeader = await getAuthHeader(supabase);
  const res = await fetch("/api/client-accounts", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify({ id, ...clientData }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao atualizar cliente.");
  }

  const data = await res.json();
  return data.client as Client;
}

/** Desativa e revoga sessões ativas do cliente via RPC transacional no servidor. */
export async function archiveClient(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const authHeader = await getAuthHeader(supabase);
  const res = await fetch("/api/client-accounts", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao arquivar cliente.");
  }
}

export interface ClientAuthResult {
  client: Client;
}

/**
 * Autentica um cliente pelo servidor (/api/dash-auth) emitindo cookie HttpOnly no mesmo domínio.
 * Não expõe senha nem token bruto ao código cliente.
 */
export async function authenticateClient(
  email: string,
  password?: string,
): Promise<ClientAuthResult | null> {
  if (!email || !password) return null;

  try {
    const data = await portalRequest<{ client: Client }>(
      "/api/dash-auth",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      },
      "Falha ao autenticar cliente",
    );
    if (!data.client)
      throw new PortalHttpError(503, "Resposta de login inválida.");
    return { client: data.client };
  } catch (error) {
    if (error instanceof PortalHttpError && error.status === 401) return null;
    throw error;
  }
}

/**
 * Valida a sessão ativa do portal com o servidor via Cookie HttpOnly same-origin.
 * Retorna o perfil seguro do cliente caso a sessão continue válida e o cliente ativo.
 */
export async function verifyDashSession(): Promise<Client | null> {
  try {
    const data = await portalRequest<{ client: Client }>(
      "/api/dash-auth",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      },
      "Falha ao validar sessão",
    );
    if (!data.client)
      throw new PortalHttpError(503, "Resposta de sessão inválida.");
    return data.client;
  } catch (error) {
    if (error instanceof PortalHttpError && error.status === 401) return null;
    throw error;
  }
}

/** Revoga a sessão; falha de infraestrutura não confirma saída. */
export async function logoutDashSession(): Promise<boolean> {
  const data = await portalRequest<{ success: boolean }>(
    "/api/dash-auth",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    },
    "Falha ao encerrar sessão",
  );
  if (!data.success)
    throw new PortalHttpError(503, "Não foi possível revogar a sessão.");
  return true;
}
