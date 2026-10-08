import { parseISO } from "date-fns";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import {
  SESSION_COOKIE_NAME,
  extractCookie,
  hashSessionToken,
} from "../server/dash-session.js";

const MAX_PERIOD_DAYS = 62;
const BATCH_SIZE = 500;

interface PublicActionDto {
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

function toPublicActionDto(action: Record<string, unknown>): PublicActionDto {
  return {
    id: String(action.id ?? ""),
    title: String(action.title ?? ""),
    date: String(action.date ?? ""),
    category: String(action.category ?? ""),
    phase: String(action.phase ?? ""),
    description: action.description != null ? String(action.description) : null,
    content_description:
      action.content_description != null
        ? String(action.content_description)
        : null,
    instagram_caption:
      action.instagram_caption != null
        ? String(action.instagram_caption)
        : null,
    content_files: Array.isArray(action.content_files)
      ? (action.content_files as string[])
      : null,
    work_files: Array.isArray(action.work_files)
      ? (action.work_files as string[])
      : null,
    color: String(action.color ?? ""),
    updated_at: String(action.updated_at ?? ""),
    partners: Array.isArray(action.partners)
      ? (action.partners as string[])
      : [],
  };
}

async function handleRequest(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return res
      .status(503)
      .json({ error: "Configuração do servidor incompleta." });
  }

  const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

  // 1. Validação estrita de sessão via cookie HttpOnly
  const rawCookie = req.headers.cookie;
  const sessionToken = extractCookie(rawCookie, SESSION_COOKIE_NAME);

  if (!sessionToken) {
    return res.status(401).json({ error: "Sessão não fornecida." });
  }

  const tokenHash = hashSessionToken(sessionToken);
  const nowIso = new Date().toISOString();

  const { data: session, error: sessionError } = await supabaseAdmin
    .from("dash_sessions")
    .select("client_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", nowIso)
    .single();

  if (sessionError && sessionError.code !== "PGRST116") {
    return res.status(503).json({ error: "Não foi possível consultar a sessão. Tente novamente." });
  }

  if (sessionError || !session) {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }

  const { data: client, error: clientError } = await supabaseAdmin
    .from("clients")
    .select("id, partners, active")
    .eq("id", session.client_id)
    .eq("active", true)
    .single();

  if (clientError && clientError.code !== "PGRST116") {
    return res.status(503).json({ error: "Não foi possível consultar a sessão. Tente novamente." });
  }

  if (clientError || !client) {
    return res.status(401).json({ error: "Cliente inativo ou não encontrado." });
  }

  const assignedPartners = Array.isArray(client.partners) ? client.partners : [];
  const partnerResult = assignedPartners.length ? await supabaseAdmin.from("partners")
    .select("slug, title, short, image, colors").in("slug",assignedPartners)
    .eq("archived",false).order("title",{ascending:true}) : {data:[],error:null};
  if (partnerResult.error) {
    return res.status(503).json({error:"Falha ao obter parceiros do cliente."});
  }
  const visiblePartners = partnerResult.data || [];
  const clientPartners = visiblePartners.map(partner => partner.slug);
  const op = typeof req.query.op === "string" ? req.query.op : undefined;

  // Operational scope excludes archived partners even when still assigned to the account.
  if (op === "partners") return res.status(200).json({partners:visiblePartners});

  // 3. Operação: Ações de um parceiro autorizado com paginação completa
  if (op === "actions") {
    const partner = typeof req.query.partner === "string" ? req.query.partner : undefined;
    const from = typeof req.query.from === "string" ? req.query.from : undefined;
    const to = typeof req.query.to === "string" ? req.query.to : undefined;

    if (!partner || !from || !to) {
      return res
        .status(400)
        .json({ error: "Parâmetros partner, from e to são obrigatórios." });
    }

    // Autorização uniforme: rejeita qualquer parceiro que não pertença à conta
    if (!clientPartners.includes(partner)) {
      return res.status(404).json({ error: "Parceiro não encontrado." });
    }

    const dateFormat = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})?)?$/;
    const fromDate = dateFormat.test(from) ? parseISO(from) : new Date(Number.NaN);
    const toDate = dateFormat.test(to) ? parseISO(to) : new Date(Number.NaN);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return res.status(400).json({ error: "Datas inválidas fornecidas." });
    }

    if (fromDate > toDate) {
      return res
        .status(400)
        .json({ error: "Data inicial posterior à data final." });
    }

    const diffDays = Math.ceil(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays > MAX_PERIOD_DAYS) {
      return res.status(400).json({
        error: `Período solicitado excede o limite máximo de ${MAX_PERIOD_DAYS} dias.`,
      });
    }

    // Pagina até trazer todas as ações dentro do período sem truncar
    const allActions: unknown[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabaseAdmin
        .from("actions")
        .select(
          "id, title, date, category, phase, description, content_description, instagram_caption, content_files, work_files, color, updated_at, partners",
        )
        .is("archived", false)
        .contains("partners", [partner])
        .neq("phase", "idea")
        .gte("date", from)
        .lte("date", to)
        .order("date", { ascending: true })
        .order("id", { ascending: true })
        .range(offset, offset + BATCH_SIZE - 1);

      if (error) {
        return res
          .status(503)
          .json({ error: "Falha ao consultar ações do parceiro." });
      }

      if (batch && batch.length > 0) {
        allActions.push(...batch);
        if (batch.length < BATCH_SIZE) {
          hasMore = false;
        } else {
          offset += BATCH_SIZE;
        }
      } else {
        hasMore = false;
      }
    }

    return res
      .status(200)
      .json({
        actions: allActions.map((a) =>
          toPublicActionDto(a as Record<string, unknown>),
        ),
      });
  }

  // 4. Operação: Detalhe de ação com autorização por interseção de parceiro
  if (op === "action") {
    const id = typeof req.query.id === "string" ? req.query.id : undefined;

    if (!id) {
      return res.status(400).json({ error: "ID da ação é obrigatório." });
    }

    const { data: action, error } = await supabaseAdmin
      .from("actions")
      .select(
        "id, title, date, category, phase, description, content_description, instagram_caption, content_files, work_files, color, updated_at, partners",
      )
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      return res.status(503).json({ error: "Não foi possível consultar a ação. Tente novamente." });
    }
    if (error || !action) {
      return res.status(404).json({ error: "Ação não encontrada." });
    }

    // Verifica se a ação pertence a ao menos um dos parceiros autorizados do cliente
    const actionPartners: string[] = Array.isArray(action.partners)
      ? action.partners
      : [];
    const hasAccess = actionPartners.some((p) => clientPartners.includes(p));

    if (!hasAccess) {
      // 404 uniforme para evitar inferência de IDs de outros parceiros
      return res.status(404).json({ error: "Ação não encontrada." });
    }

    return res
      .status(200)
      .json({ action: toPublicActionDto(action as Record<string, unknown>) });
  }

  return res.status(400).json({ error: "Operação não suportada." });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return await handleRequest(req, res);
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ error: "O portal está temporariamente indisponível. Tente novamente." });
  }
}
