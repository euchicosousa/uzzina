import bcrypt from "bcryptjs";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const BCRYPT_COST = 12;
const MIN_PASSWORD_BYTES = 8;
const MAX_PASSWORD_BYTES = 72;

function extractAuthToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === "string") {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0]?.toLowerCase() === "bearer") {
      return parts[1] ?? null;
    }
  }
  return null;
}

export interface SafeClientDto {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  partners: string[];
  image: string | null;
  active: boolean;
}

function toSafeClientDto(row: Record<string, unknown>): SafeClientDto {
  return {
    id: String(row.id ?? ""),
    created_at: String(row.created_at ?? ""),
    name: row.name != null ? String(row.name) : null,
    email: row.email != null ? String(row.email) : null,
    partners: Array.isArray(row.partners) ? (row.partners as string[]) : [],
    image: row.image != null ? String(row.image) : null,
    active: row.active === true,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  const allowedMethods = ["GET", "POST", "PATCH", "DELETE"];
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return res
      .status(503)
      .json({ error: "Configuração do servidor de autenticação incompleta." });
  }

  const token = extractAuthToken(req);
  if (!token) {
    return res.status(401).json({ error: "Token de autenticação ausente." });
  }

  const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

  // 1. Validação de identidade e privilégios administrativos
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }

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

  if (!person.visible || !person.admin) {
    return res
      .status(403)
      .json({ error: "Acesso negado. Apenas administradores ativos podem gerenciar contas de clientes." });
  }

  // ─── GET: Consulta de Clientes ──────────────────────────────────────────────
  if (req.method === "GET") {
    const id = typeof req.query.id === "string" ? req.query.id : undefined;

    if (id) {
      const { data: client, error: clientErr } = await supabaseAdmin
        .from("clients")
        .select("id, created_at, name, email, partners, image, active")
        .eq("id", id)
        .single();

      if (clientErr || !client) {
        return res.status(404).json({ error: "Cliente não encontrado." });
      }

      return res.status(200).json({ client: toSafeClientDto(client as Record<string, unknown>) });
    }

    const { data: clients, error: clientsErr } = await supabaseAdmin
      .from("clients")
      .select("id, created_at, name, email, partners, image, active")
      .is("active", true)
      .order("name", { ascending: true });

    if (clientsErr || !clients) {
      return res.status(503).json({ error: "Falha ao listar clientes." });
    }

    const safeList = (clients as Record<string, unknown>[]).map(toSafeClientDto);
    return res.status(200).json({ clients: safeList });
  }

  // ─── POST: Criação de Cliente ───────────────────────────────────────────────
  if (req.method === "POST") {
    const body = (req.body ?? {}) as {
      name?: string;
      email?: string;
      password?: string;
      partners?: string[];
      image?: string | null;
    };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const partnerSlugs = Array.isArray(body.partners) ? body.partners : [];
    const image = body.image ? String(body.image).trim() : null;

    if (!name || name.length < 2) {
      return res.status(400).json({ error: "Nome deve ter pelo menos 2 caracteres." });
    }

    if (!email?.includes("@")) {
      return res.status(400).json({ error: "E-mail inválido." });
    }

    if (!password) {
      return res.status(400).json({ error: "Senha é obrigatória." });
    }

    const passwordBytes = Buffer.byteLength(password, "utf8");
    if (passwordBytes < MIN_PASSWORD_BYTES || passwordBytes > MAX_PASSWORD_BYTES) {
      return res.status(400).json({
        error: `A senha deve ter entre ${MIN_PASSWORD_BYTES} e ${MAX_PASSWORD_BYTES} bytes UTF-8.`,
      });
    }

    // Validação de parceiros: todos devem existir e não estar arquivados
    if (partnerSlugs.length > 0) {
      const { data: partnersData, error: partnersErr } = await supabaseAdmin
        .from("partners")
        .select("slug, archived")
        .in("slug", partnerSlugs);

      if (partnersErr || !partnersData) {
        return res.status(503).json({ error: "Falha ao validar parceiros." });
      }

      const validPartners = partnersData as Array<{ slug: string; archived: boolean }>;
      for (const slug of partnerSlugs) {
        const found = validPartners.find((p) => p.slug === slug);
        if (!found || found.archived) {
          return res.status(400).json({
            error: `O parceiro '${slug}' não existe ou está arquivado.`,
          });
        }
      }
    }

    // Criptografa senha com bcrypt custo 12
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    const { data: newClient, error: insertErr } = await supabaseAdmin
      .from("clients")
      .insert([
        {
          name,
          email,
          password_hash: passwordHash,
          partners: partnerSlugs,
          image,
          active: true,
        },
      ])
      .select("id, created_at, name, email, partners, image, active")
      .single();

    if (insertErr || !newClient) {
      return res.status(503).json({ error: "Falha ao cadastrar cliente no banco." });
    }

    return res.status(201).json({
      client: toSafeClientDto(newClient as Record<string, unknown>),
    });
  }

  // ─── PATCH: Atualização de Cliente ──────────────────────────────────────────
  if (req.method === "PATCH") {
    const body = (req.body ?? {}) as {
      id?: string;
      name?: string;
      email?: string;
      password?: string | null;
      partners?: string[];
      image?: string | null;
      active?: boolean;
    };

    const id = body.id || (typeof req.query.id === "string" ? req.query.id : undefined);
    if (!id) {
      return res.status(400).json({ error: "ID do cliente é obrigatório." });
    }

    const { data: existingClient, error: getErr } = await supabaseAdmin
      .from("clients")
      .select("id, created_at, name, email, partners, image, active, password_hash")
      .eq("id", id)
      .single();

    if (getErr || !existingClient) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    // 1. Atualização de senha, se fornecida não vazia
    if (typeof body.password === "string" && body.password.length > 0) {
      const passwordBytes = Buffer.byteLength(body.password, "utf8");
      if (passwordBytes < MIN_PASSWORD_BYTES || passwordBytes > MAX_PASSWORD_BYTES) {
        return res.status(400).json({
          error: `A senha deve ter entre ${MIN_PASSWORD_BYTES} e ${MAX_PASSWORD_BYTES} bytes UTF-8.`,
        });
      }

      const newHash = await bcrypt.hash(body.password, BCRYPT_COST);

      // Executa RPC transacional para atualizar senha e revogar sessões
      const { error: rpcErr } = await supabaseAdmin.rpc("admin_update_client_password", {
        p_client_id: id,
        p_password_hash: newHash,
      });

      if (rpcErr) {
        return res.status(503).json({
          error: "Falha transacional ao atualizar senha e revogar sessões.",
        });
      }
    }

    // 2. Desativação, se solicitada
    if (body.active === false) {
      const { error: rpcErr } = await supabaseAdmin.rpc("admin_deactivate_client", {
        p_client_id: id,
      });

      if (rpcErr) {
        return res.status(503).json({
          error: "Falha transacional ao desativar cliente e revogar sessões.",
        });
      }
    }

    // 3. Atualização de campos gerais
    const updates: Database["public"]["Tables"]["clients"]["Update"] = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.email !== undefined) updates.email = body.email.trim().toLowerCase();
    if (body.image !== undefined) updates.image = body.image ? String(body.image).trim() : null;
    if (body.active === true) updates.active = true;

    if (body.partners !== undefined) {
      const partnerSlugs = Array.isArray(body.partners) ? body.partners : [];
      if (partnerSlugs.length > 0) {
        const { data: partnersData, error: partnersErr } = await supabaseAdmin
          .from("partners")
          .select("slug, archived")
          .in("slug", partnerSlugs);

        if (partnersErr || !partnersData) {
          return res.status(503).json({ error: "Falha ao validar parceiros." });
        }

        const validPartners = partnersData as Array<{ slug: string; archived: boolean }>;
        for (const slug of partnerSlugs) {
          const found = validPartners.find((p) => p.slug === slug);
          if (!found || found.archived) {
            return res.status(400).json({
              error: `O parceiro '${slug}' não existe ou está arquivado.`,
            });
          }
        }
      }
      updates.partners = partnerSlugs;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await supabaseAdmin
        .from("clients")
        .update(updates)
        .eq("id", id);

      if (updateErr) {
        return res.status(503).json({ error: "Falha ao atualizar dados do cliente." });
      }
    }

    // Busca dados finais do cliente
    const { data: updatedClient, error: fetchErr } = await supabaseAdmin
      .from("clients")
      .select("id, created_at, name, email, partners, image, active")
      .eq("id", id)
      .single();

    if (fetchErr || !updatedClient) {
      return res.status(503).json({ error: "Falha ao carregar cliente atualizado." });
    }

    return res.status(200).json({
      client: toSafeClientDto(updatedClient as Record<string, unknown>),
    });
  }

  // ─── DELETE: Arquivar / Desativar Cliente ────────────────────────────────────
  if (req.method === "DELETE") {
    const body = (req.body ?? {}) as { id?: string };
    const id = body.id || (typeof req.query.id === "string" ? req.query.id : undefined);

    if (!id) {
      return res.status(400).json({ error: "ID do cliente é obrigatório." });
    }

    // Executa RPC transacional que desativa a conta e revoga todas as sessões ativas
    const { error: rpcErr } = await supabaseAdmin.rpc("admin_deactivate_client", {
      p_client_id: id,
    });

    if (rpcErr) {
      return res.status(503).json({
        error: "Falha transacional ao desativar cliente e revogar sessões.",
      });
    }

    return res.status(200).json({ archived: true, id });
  }
}
