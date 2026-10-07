import { PortalHttpError, portalRequest } from "./portal-http";

export interface DashPartnerDto {
  slug: string;
  title: string;
  short: string | null;
  image: string | null;
  colors: string[];
}

export interface DashActionDto {
  id: string;
  title: string;
  date: string;
  category: string;
  phase: string;
  description: string | null;
  content_description: string | null;
  instagram_caption: string | null;
  content_files: string[] | null;
  work_files: string[] | null;
  color: string;
  updated_at: string;
  partners: string[];
}

/**
 * Busca a lista de parceiros aos quais o cliente autenticado na sessão tem acesso.
 */
export async function fetchDashPartners(): Promise<DashPartnerDto[]> {
  const data = await portalRequest<{ partners: DashPartnerDto[] }>(
    "/api/dash-data?op=partners", { method: "GET" }, "Falha ao buscar parceiros",
  );
  return data.partners || [];
}

/**
 * Busca as ações de um parceiro dentro de um intervalo de datas (máximo 62 dias).
 * Validação de pertencimento e paginação completa são executadas no servidor.
 */
export async function fetchDashActions(params: {
  partner: string;
  from: string;
  to: string;
}): Promise<DashActionDto[]> {
  const query = new URLSearchParams({
    op: "actions",
    partner: params.partner,
    from: params.from,
    to: params.to,
  });

  const data = await portalRequest<{ actions: DashActionDto[] }>(
    `/api/dash-data?${query.toString()}`, { method: "GET" }, "Falha ao consultar ações",
  );
  return data.actions || [];
}

/**
 * Busca os detalhes de uma ação pelo ID com validação de escopo de parceiro no servidor.
 * Retorna null se não encontrada ou não pertencente ao cliente da sessão.
 */
export async function fetchDashAction(id: string): Promise<DashActionDto | null> {
  const query = new URLSearchParams({
    op: "action",
    id,
  });

  try {
    const data = await portalRequest<{ action: DashActionDto }>(
      `/api/dash-data?${query.toString()}`, { method: "GET" }, "Falha ao obter detalhe da ação",
    );
    return data.action || null;
  } catch (error) {
    if (error instanceof PortalHttpError && error.status === 404) return null;
    throw error;
  }
}

export type DashCommentDto = import("~/models/action_comments").AugmentedComment;

export async function fetchDashComments(actionId: string): Promise<DashCommentDto[]> {
  const query = new URLSearchParams({op:"comments",actionId});
  const data = await portalRequest<{comments:DashCommentDto[]}>(`/api/dash-action?${query}`,{method:"GET"},"Falha ao obter observações");
  if (!Array.isArray(data.comments)) throw new PortalHttpError(503,"O servidor não confirmou as observações.");
  return data.comments;
}

export async function createDashComment(actionId:string,content:string): Promise<DashCommentDto> {
  const data = await portalRequest<{comment:DashCommentDto}>("/api/dash-action?op=comment",{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({actionId,content}),
  },"Falha ao salvar observação");
  if (!data.comment?.id) throw new PortalHttpError(503,"O servidor não confirmou a observação.");
  return data.comment;
}

export async function updateDashComment(actionId:string,commentId:string,content:string): Promise<DashCommentDto> {
  const data = await portalRequest<{comment:DashCommentDto}>("/api/dash-action?op=comment",{
    method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({actionId,commentId,content}),
  },"Falha ao atualizar observação");
  if (data.comment?.id !== commentId) throw new PortalHttpError(503,"O servidor não confirmou a alteração.");
  return data.comment;
}

export async function deleteDashComment(actionId:string,commentId:string): Promise<void> {
  const data = await portalRequest<{deletedId:string}>("/api/dash-action?op=comment",{
    method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({actionId,commentId}),
  },"Falha ao excluir observação");
  if (data.deletedId !== commentId) throw new PortalHttpError(503,"O servidor não confirmou a exclusão.");
}

export async function updateDashWorkFiles(
  actionId: string,
  work_files: string[],
  expectedUpdatedAt: string,
): Promise<{ work_files: string[]; updated_at: string }> {
  const data = await portalRequest<{
    actionId: string;
    work_files: string[];
    count: number;
    updated_at: string;
  }>("/api/dash-action?op=work-files", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actionId, work_files, expectedUpdatedAt }),
  }, "Falha ao salvar anexos");
  if (data.actionId !== actionId || !Array.isArray(data.work_files) || data.count !== data.work_files.length)
    throw new PortalHttpError(503, "O servidor não confirmou os anexos.");
  return { work_files: data.work_files, updated_at: data.updated_at };
}
