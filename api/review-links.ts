import crypto from "node:crypto";
import { z } from "zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createServiceClient,
  getServiceConfig,
} from "../server/supabase-admin.js";
import { extractBearerToken } from "../server/auth.js";

const MAX_ACTIONS_LIMIT = 100;
const REVIEW_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

const createLinkSchema = z
  .object({
    partner_slug: z.string().trim().min(1).max(200),
    action_ids: z
      .array(z.string().min(1).max(100))
      .min(1)
      .max(MAX_ACTIONS_LIMIT),
  })
  .strict();
const revokeLinkSchema = z
  .object({
    id: z.string().min(1).max(100).optional(),
    token: z.string().min(1).max(256).optional(),
  })
  .strict()
  .refine((body) => !!(body.id || body.token));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST" && req.method !== "DELETE") {
    res.setHeader("Allow", ["POST", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const serviceConfig = getServiceConfig();

  if (!serviceConfig) {
    return res
      .status(503)
      .json({ error: "Configuração do servidor de autenticação incompleta." });
  }

  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Token de autenticação ausente." });
  }

  const supabaseAdmin = createServiceClient(serviceConfig);

  // Validação da identidade da equipe via Supabase Auth
  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }

  // Verifica pessoa ativa no sistema
  const { data: personData, error: personError } = await supabaseAdmin
    .from("people")
    .select("id, user_id, admin, visible")
    .eq("user_id", userData.user.id)
    .single();

  if (personError || !personData) {
    return res.status(403).json({ error: "Usuário não encontrado na equipe." });
  }

  const person = personData as {
    id: string;
    user_id: string;
    admin: boolean;
    visible: boolean;
  };

  if (!person.visible) {
    return res
      .status(403)
      .json({ error: "Usuário inativo ou não autorizado." });
  }

  // ─── POST: Criação de Link de Revisão ──────────────────────────────────────
  if (req.method === "POST") {
    const parsed = createLinkSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Dados do compartilhamento inválidos." });
    const body = parsed.data;
    const partnerSlug = body.partner_slug?.trim();
    const actionIds = Array.isArray(body.action_ids) ? body.action_ids : [];

    if (!partnerSlug) {
      return res.status(400).json({ error: "Parceiro é obrigatório." });
    }

    if (actionIds.length === 0) {
      return res.status(400).json({ error: "Nenhuma ação selecionada." });
    }

    if (actionIds.length > MAX_ACTIONS_LIMIT) {
      return res.status(400).json({
        error: `Máximo de ${MAX_ACTIONS_LIMIT} ações permitidas por link.`,
      });
    }

    // Busca o parceiro
    const { data: partnerData, error: partnerError } = await supabaseAdmin
      .from("partners")
      .select("id, slug, archived, users_ids")
      .eq("slug", partnerSlug)
      .single();

    if (partnerError || !partnerData) {
      return res.status(400).json({ error: "Parceiro não encontrado." });
    }

    const partner = partnerData as {
      id: string;
      slug: string;
      archived: boolean;
      users_ids: string[];
    };

    if (partner.archived) {
      return res.status(400).json({ error: "Parceiro está arquivado." });
    }

    // Colaborador deve pertencer ao parceiro
    if (
      !person.admin &&
      (!Array.isArray(partner.users_ids) ||
        !partner.users_ids.includes(person.user_id))
    ) {
      return res
        .status(403)
        .json({ error: "Acesso não autorizado ao parceiro." });
    }

    // Busca as ações no banco
    const { data: actionsData, error: actionsError } = await supabaseAdmin
      .from("actions")
      .select("id, partners, archived, responsibles")
      .in("id", actionIds);

    if (actionsError || !actionsData) {
      return res.status(503).json({ error: "Falha ao consultar ações." });
    }

    const fetchedActions = actionsData as Array<{
      id: string;
      partners: string[];
      archived: boolean | null;
      responsibles: string[];
    }>;

    // Todas as ações solicitadas devem existir
    if (fetchedActions.length !== actionIds.length) {
      return res
        .status(400)
        .json({ error: "Uma ou mais ações não foram encontradas." });
    }

    // Validações por ação
    for (const act of fetchedActions) {
      if (act.archived) {
        return res
          .status(400)
          .json({ error: "Ações arquivadas não podem ser compartilhadas." });
      }

      if (!Array.isArray(act.partners) || !act.partners.includes(partnerSlug)) {
        return res.status(400).json({
          error: "Todas as ações devem pertencer ao parceiro selecionado.",
        });
      }

      // Colaborador só pode compartilhar se for responsável
      if (!person.admin) {
        const isResponsible =
          Array.isArray(act.responsibles) &&
          (act.responsibles.includes(person.user_id) ||
            act.responsibles.includes(person.id));

        if (!isResponsible) {
          return res.status(403).json({
            error:
              "Colaborador só pode compartilhar ações em que é responsável.",
          });
        }
      }
    }

    // Gera token criptográfico de 32 bytes
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + REVIEW_LINK_TTL_MS).toISOString();

    const { data: newLink, error: insertError } = await supabaseAdmin
      .from("review_links")
      .insert({
        token_hash: tokenHash,
        partner_slug: partnerSlug,
        action_ids: actionIds,
        created_by: person.id,
        expires_at: expiresAt,
        revoked_at: null,
      })
      .select(
        "id, partner_slug, action_ids, created_by, expires_at, created_at",
      )
      .single();

    if (insertError || !newLink) {
      return res
        .status(503)
        .json({ error: "Falha ao persistir link de revisão." });
    }

    const createdRecord = newLink as {
      id: string;
      partner_slug: string;
      action_ids: string[];
      created_by: string;
      expires_at: string;
      created_at: string;
    };

    return res.status(201).json({
      link: {
        id: createdRecord.id,
        partner_slug: createdRecord.partner_slug,
        action_ids: createdRecord.action_ids,
        expires_at: createdRecord.expires_at,
        token: rawToken,
        url: `/dash/review/${partnerSlug}?r=${rawToken}`,
      },
    });
  }

  // ─── DELETE: Revogação de Link de Revisão ──────────────────────────────────
  if (req.method === "DELETE") {
    const parsed = revokeLinkSchema.safeParse({
      ...req.body,
      ...(typeof req.query.id === "string" ? { id: req.query.id } : {}),
      ...(typeof req.query.token === "string"
        ? { token: req.query.token }
        : {}),
    });
    if (!parsed.success)
      return res.status(400).json({ error: "Dados da revogação inválidos." });
    const body = parsed.data;
    const query = req.query ?? {};
    const linkId =
      body.id || (typeof query.id === "string" ? query.id : undefined);
    const tokenToRevoke =
      body.token || (typeof query.token === "string" ? query.token : undefined);

    if (!linkId && !tokenToRevoke) {
      return res
        .status(400)
        .json({ error: "Identificador ou token do link é obrigatório." });
    }

    let linkQuery = supabaseAdmin
      .from("review_links")
      .select("id, created_by, revoked_at");
    if (linkId) {
      linkQuery = linkQuery.eq("id", linkId);
    } else if (tokenToRevoke) {
      const hash = crypto
        .createHash("sha256")
        .update(tokenToRevoke)
        .digest("hex");
      linkQuery = linkQuery.eq("token_hash", hash);
    }

    const { data: linkRecord, error: linkError } = await linkQuery.single();
    if (linkError || !linkRecord) {
      return res.status(404).json({ error: "Link de revisão não encontrado." });
    }

    const targetLink = linkRecord as {
      id: string;
      created_by: string;
      revoked_at: string | null;
    };

    // Apenas admin ou o criador podem revogar
    if (!person.admin && targetLink.created_by !== person.id) {
      return res
        .status(403)
        .json({ error: "Sem permissão para revogar este link." });
    }

    const nowIso = new Date().toISOString();
    const { data: revokedLink, error: updateError } = await supabaseAdmin
      .from("review_links")
      .update({ revoked_at: nowIso })
      .eq("id", targetLink.id)
      .select("id")
      .single();

    if (updateError?.code === "PGRST116" || (!updateError && !revokedLink)) {
      return res.status(404).json({ error: "Link de revisão não encontrado." });
    }
    if (updateError) {
      return res
        .status(503)
        .json({ error: "Falha ao revogar link de revisão." });
    }

    return res.status(200).json({ revoked: true, id: targetLink.id });
  }
}
