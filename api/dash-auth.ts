import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import type { Database } from "../types/database";

const SALT = "uzzina_v1_salt_";
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias

function hashPassword(password: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(SALT + password);
  return hash.digest("hex");
}

function getSecret(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "uzzina_dash_jwt_fallback_secret_key"
  );
}

function signToken(payload: { id: string; email: string; exp: number }): string {
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payloadStr)
    .digest("base64url");
  return `${payloadStr}.${signature}`;
}

function verifyToken(token: string): { id: string; email: string; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadStr, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", getSecret())
      .update(payloadStr)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "utf-8"),
        Buffer.from(expectedSig, "utf-8"),
      )
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf-8"),
    );

    if (typeof payload.exp !== "number" || Date.now() / 1000 > payload.exp) {
      return null; // Token expirado
    }

    return payload;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    "";

  const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

  const { action = "login", email, password, token } = req.body || {};

  // 1. Verificação / retomada de sessão
  if (action === "verify") {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const checkToken = token || bearerToken;

    if (!checkToken) {
      return res.status(401).json({ error: "Token de sessão não fornecido." });
    }

    const verified = verifyToken(checkToken);
    if (!verified) {
      return res.status(401).json({ error: "Sessão inválida ou expirada." });
    }

    // Valida que o cliente continua ativo no banco de dados
    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .select("id, created_at, name, email, partners, image, active")
      .eq("id", verified.id)
      .eq("active", true)
      .single();

    if (error || !client) {
      return res
        .status(401)
        .json({ error: "Cliente inativo ou não encontrado." });
    }

    return res.status(200).json({ client });
  }

  // 2. Login com e-mail e senha
  if (action === "login") {
    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    // Busca o cliente pelo e-mail e assegura que está ativo
    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .select("id, created_at, name, email, partners, image, active, password_hash")
      .eq("email", email)
      .eq("active", true)
      .single();

    if (error || !client) {
      return res
        .status(401)
        .json({ error: "E-mail ou senha incorretos ou conta desativada." });
    }

    if (!client.password_hash) {
      return res
        .status(401)
        .json({ error: "Credenciais de acesso não configuradas para este cliente." });
    }

    const inputHash = hashPassword(password);
    if (inputHash !== client.password_hash) {
      return res
        .status(401)
        .json({ error: "E-mail ou senha incorretos ou conta desativada." });
    }

    // Gera token de sessão seguro com HMAC
    const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const sessionToken = signToken({
      id: client.id,
      email: client.email,
      exp,
    });

    // Retorna os dados seguros do cliente SEM password_hash
    const { password_hash, ...safeClient } = client;

    return res.status(200).json({
      client: safeClient,
      token: sessionToken,
    });
  }

  return res.status(400).json({ error: "Ação não suportada." });
}
