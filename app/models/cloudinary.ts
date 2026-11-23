import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "types/database";
import type {
  CloudinaryAuditResponse,
  CloudinaryDeleteRequest,
  CloudinaryDeleteResponse,
} from "~/lib/cloudinary-audit-contract";

export class CloudinaryAuditApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "CloudinaryAuditApiError";
    this.status = status;
    this.code = code;
  }
}

async function getAuthHeader(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token
    ? `Bearer ${data.session.access_token}`
    : null;
}

export async function getCloudinaryAudit(
  supabase: SupabaseClient<Database>,
): Promise<CloudinaryAuditResponse> {
  const authHeader = await getAuthHeader(supabase);

  const response = await fetch("/api/admin-cleanup?scope=cloudinary-audit", {
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  };

  if (!response.ok) {
    throw new CloudinaryAuditApiError(
      payload.error || "Não foi possível consultar o catálogo do Cloudinary.",
      response.status,
      payload.code,
    );
  }

  return payload as unknown as CloudinaryAuditResponse;
}

export async function deleteCloudinaryAssets(
  supabase: SupabaseClient<Database>,
  request: CloudinaryDeleteRequest,
): Promise<CloudinaryDeleteResponse> {
  const authHeader = await getAuthHeader(supabase);

  const response = await fetch("/api/admin-cleanup?scope=cloudinary-audit", {
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
    throw new CloudinaryAuditApiError(
      payload.error || "Não foi possível excluir os arquivos selecionados.",
      response.status,
      payload.code,
    );
  }

  return payload as unknown as CloudinaryDeleteResponse;
}
