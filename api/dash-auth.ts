import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  extractCookie,
  generateSessionToken,
  hashLegacyPassword,
  hashSessionToken,
  serializeClearSessionCookie,
  serializeSessionCookie,
  validateRequestOrigin,
} from "../server/dash-session";

async function handleRequest(req: VercelRequest, res: VercelResponse) {
  // Configura cabeçalho para evitar qualquer cache de respostas de autenticação
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const isProduction = process.env.NODE_ENV === "production";
  const appOrigin = process.env.APP_ORIGIN;
  const originHeader = req.headers.origin as string | undefined;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Falha controlada caso o servidor não tenha as variáveis obrigatórias configuradas
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return res
      .status(503)
      .json({ error: "Configuração do servidor de autenticação incompleta." });
  }

  if (req.body && (typeof req.body !== "object" || Array.isArray(req.body))) {
    return res.status(400).json({ error: "Pedido inválido." });
  }
  const { action = "login", email, password } = req.body || {};

  // Validação de Origin para ações que alteram estado (login, logout)
  if (action === "login" || action === "logout") {
    if (!validateRequestOrigin(originHeader, appOrigin, isProduction)) {
      return res.status(403).json({ error: "Origem da requisição não autorizada." });
    }
  }

  const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

  // 1. Verificação / Retomada de sessão via Cookie HttpOnly
  if (action === "verify") {
    const rawCookie = req.headers.cookie;
    const sessionToken = extractCookie(rawCookie, SESSION_COOKIE_NAME);

    if (!sessionToken) {
      return res.status(401).json({ error: "Sessão não fornecida." });
    }

    const tokenHash = hashSessionToken(sessionToken);
    const nowIso = new Date().toISOString();

    // Busca a sessão válida (não revogada e não expirada)
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("dash_sessions")
      .select("id, client_id, expires_at, revoked_at")
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

    // Busca o cliente correspondente e assegura status ativo
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("id, created_at, name, email, partners, image, active")
      .eq("id", session.client_id)
      .eq("active", true)
      .single();

    if (clientError && clientError.code !== "PGRST116") {
      return res.status(503).json({ error: "Não foi possível consultar a sessão. Tente novamente." });
    }

    if (clientError || !client) {
      return res.status(401).json({ error: "Cliente inativo ou não encontrado." });
    }

    // Garante que nenhum hash ou dado sensível do cliente é retornado no verify
    const safeClient = {
      id: client.id,
      created_at: client.created_at,
      name: client.name,
      email: client.email,
      partners: client.partners,
      image: client.image,
      active: client.active,
    };

    return res.status(200).json({ client: safeClient });
  }

  // 2. Login de cliente com e-mail e senha
  if (action === "login") {
    if (typeof email !== "string" || typeof password !== "string" || !email || !password || email.length > 254 || password.length > 4096) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("id, created_at, name, email, partners, image, active, password_hash")
      .eq("email", email)
      .eq("active", true)
      .single();

    if (clientError && clientError.code !== "PGRST116") {
      return res.status(503).json({ error: "Não foi possível consultar a conta. Tente novamente." });
    }
    if (clientError || !client) {
      return res
        .status(401)
        .json({ error: "E-mail ou senha incorretos ou conta desativada." });
    }

    if (!client.password_hash) {
      return res
        .status(401)
        .json({ error: "Credenciais de acesso não configuradas para este cliente." });
    }

    let isPasswordValid = false;
    let shouldMigrateLegacy = false;

    if (
      client.password_hash.startsWith("$2a$") ||
      client.password_hash.startsWith("$2b$") ||
      client.password_hash.startsWith("$2y$")
    ) {
      isPasswordValid = await bcrypt.compare(password, client.password_hash);
    } else {
      const inputHash = hashLegacyPassword(password);
      if (inputHash === client.password_hash) {
        isPasswordValid = true;
        shouldMigrateLegacy = true;
      }
    }

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "E-mail ou senha incorretos ou conta desativada." });
    }

    // Se o login foi bem-sucedido com hash legado, migra condicionalmente para bcrypt
    if (shouldMigrateLegacy) {
      try {
        const newBcryptHash = await bcrypt.hash(password, 12);
        const { error: rpcErr } = await supabaseAdmin.rpc("client_migrate_legacy_password", {
          p_client_id: client.id,
          p_legacy_hash: client.password_hash,
          p_new_hash: newBcryptHash,
        });
        if (rpcErr) {
          await supabaseAdmin
            .from("clients")
            .update({ password_hash: newBcryptHash })
            .eq("id", client.id)
            .eq("password_hash", client.password_hash);
        }
      } catch (migrateErr) {
        console.error("Erro ao migrar senha legada:", migrateErr);
      }
    }

    // Cria sessão opaca persistida no banco
    const sessionToken = generateSessionToken();
    const tokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(
      Date.now() + SESSION_TTL_SECONDS * 1000,
    ).toISOString();

    const { error: insertSessionError } = await supabaseAdmin
      .from("dash_sessions")
      .insert([
        {
          client_id: client.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
      ]);

    if (insertSessionError) {
      return res
        .status(503)
        .json({ error: "Falha ao registrar sessão do cliente." });
    }

    // Injeta cookie HttpOnly com parâmetros estritos
    res.setHeader(
      "Set-Cookie",
      serializeSessionCookie(sessionToken, { isProduction }),
    );

    // Retorna perfil seguro SEM password_hash e SEM o token bruto no JSON
    const { password_hash: _discard, ...safeClient } = client;

    return res.status(200).json({ client: safeClient });
  }

  // 3. Logout com revogação da sessão no banco e expiração do cookie
  if (action === "logout") {
    const rawCookie = req.headers.cookie;
    const sessionToken = extractCookie(rawCookie, SESSION_COOKIE_NAME);

    if (sessionToken) {
      const tokenHash = hashSessionToken(sessionToken);
      const nowIso = new Date().toISOString();

      const { error: revokeError } = await supabaseAdmin
        .from("dash_sessions")
        .update({ revoked_at: nowIso })
        .eq("token_hash", tokenHash);
      if (revokeError) {
        return res.status(503).json({ error: "Não foi possível revogar a sessão. Tente novamente." });
      }
    }

    res.setHeader(
      "Set-Cookie",
      serializeClearSessionCookie({ isProduction }),
    );

    return res.status(200).json({ success: true });
  }

  return res.status(400).json({ error: "Ação não suportada." });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return await handleRequest(req, res);
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ error: "O portal está temporariamente indisponível. Tente novamente." });
  }
}
