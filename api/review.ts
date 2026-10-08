import crypto from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createServiceClient, getServiceConfig } from "../server/supabase-admin.js";

export interface PublicReviewPartnerDto {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  colors: string[];
  short: string | null;
}

export interface PublicReviewActionDto {
  id: string;
  title: string;
  content_description: string | null;
  instagram_caption: string | null;
  category: string;
  date: string;
  partners: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const slug = typeof req.query.slug === "string" ? req.query.slug.trim() : null;
  const token = typeof req.query.r === "string" ? req.query.r.trim() : null;

  // Rejeita acesso se slug ou token 'r' estiverem ausentes
  // Note: O formato legado ?ids=... é recusado aqui por falta do token 'r'
  if (!slug || !token) {
    return res.status(404).json({ error: "Link de revisão inválido ou não encontrado." });
  }

  const serviceConfig = getServiceConfig();

  if (!serviceConfig) {
    return res
      .status(503)
      .json({ error: "Configuração do servidor de autenticação incompleta." });
  }

  const supabaseAdmin = createServiceClient(serviceConfig);

  // Calcula hash SHA256 do token fornecido
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Localiza o registro de link de revisão
  const { data: linkData, error: linkError } = await supabaseAdmin
    .from("review_links")
    .select("id, partner_slug, action_ids, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .single();

  if (linkError || !linkData) {
    return res.status(404).json({ error: "Link de revisão inválido ou não encontrado." });
  }

  const link = linkData as {
    id: string;
    partner_slug: string;
    action_ids: string[];
    expires_at: string;
    revoked_at: string | null;
  };

  // Verifica revogação
  if (link.revoked_at) {
    return res.status(404).json({ error: "Link de revisão revogado." });
  }

  // Verifica expiração
  const expiresAt = new Date(link.expires_at).getTime();
  if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
    return res.status(404).json({ error: "Link de revisão expirado." });
  }

  // Verifica se o slug bate exatamente com o parceiro gravado no registro
  if (link.partner_slug !== slug) {
    return res.status(404).json({ error: "Link de revisão não corresponde ao parceiro." });
  }

  // Busca dados públicos do parceiro
  const { data: partnerData, error: partnerError } = await supabaseAdmin
    .from("partners")
    .select("id, title, slug, image, colors, short, archived")
    .eq("slug", slug)
    .single();

  if (partnerError || !partnerData) {
    return res.status(404).json({ error: "Parceiro não encontrado." });
  }

  const partnerRecord = partnerData as {
    id: string;
    title: string;
    slug: string;
    image: string | null;
    colors: string[];
    short: string | null;
    archived: boolean;
  };

  if (partnerRecord.archived) {
    return res.status(404).json({ error: "Parceiro arquivado." });
  }

  const partnerDto: PublicReviewPartnerDto = {
    id: String(partnerRecord.id),
    title: String(partnerRecord.title),
    slug: String(partnerRecord.slug),
    image: partnerRecord.image != null ? String(partnerRecord.image) : null,
    colors: Array.isArray(partnerRecord.colors) ? partnerRecord.colors : [],
    short: partnerRecord.short != null ? String(partnerRecord.short) : null,
  };

  // Busca ações autorizadas EXCLUSIVAMENTE a partir do array action_ids gravado no registro
  if (!Array.isArray(link.action_ids) || link.action_ids.length === 0) {
    return res.status(200).json({ partner: partnerDto, actions: [] });
  }

  const { data: actionsData, error: actionsError } = await supabaseAdmin
    .from("actions")
    .select("id, title, content_description, instagram_caption, category, date, partners, archived")
    .in("id", link.action_ids)
    .order("date", { ascending: true });

  if (actionsError || !actionsData) {
    return res.status(503).json({ error: "Falha ao carregar ações para revisão." });
  }

  const rawActions = actionsData as Array<{
    id: string;
    title: string;
    content_description: string | null;
    instagram_caption: string | null;
    category: string;
    date: string;
    partners: string[];
    archived: boolean | null;
  }>;

  // Filtra por garantia para que somente ações não arquivadas e pertencentes ao parceiro sejam retornadas
  const authorizedActions: PublicReviewActionDto[] = rawActions
    .filter((a) => !a.archived && Array.isArray(a.partners) && a.partners.includes(slug))
    .map((a) => ({
      id: String(a.id),
      title: String(a.title),
      content_description: a.content_description != null ? String(a.content_description) : null,
      instagram_caption: a.instagram_caption != null ? String(a.instagram_caption) : null,
      category: String(a.category),
      date: String(a.date),
      partners: a.partners,
    }));

  return res.status(200).json({
    partner: partnerDto,
    actions: authorizedActions,
  });
}
