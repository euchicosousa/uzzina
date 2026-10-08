import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "uzzina_dash_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias em segundos

/**
 * Gera um token criptograficamente seguro e opaco (32 bytes em base64url).
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Calcula o hash SHA-256 determinístico de um token de sessão para busca e persistência no banco.
 * O token bruto nunca é salvo no banco, apenas este hash.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Calcula o hash SHA-256 legado de senha para compatibilidade com os clientes cadastrados.
 */
export function hashLegacyPassword(password: string): string {
  const salt = "uzzina_v1_salt_";
  return crypto
    .createHash("sha256")
    .update(salt + password)
    .digest("hex");
}

/**
 * Extrai o valor de um cookie específico a partir do cabeçalho "Cookie".
 */
export function extractCookie(
  cookieHeader: string | undefined | null,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return match.slice(name.length + 1).trim();
}

export interface CookieSerializeOptions {
  isProduction?: boolean;
}

/**
 * Serializa o cookie de sessão com todos os atributos de segurança:
 * HttpOnly, SameSite=Lax, Path=/api, Max-Age=604800, Secure (em produção).
 */
export function serializeSessionCookie(
  token: string,
  options?: CookieSerializeOptions,
): string {
  const isProduction =
    options?.isProduction ?? process.env.NODE_ENV === "production";
  const secureFlag = isProduction ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/api; Max-Age=${SESSION_TTL_SECONDS}${secureFlag}`;
}

/**
 * Serializa a remoção do cookie de sessão definindo Max-Age=0.
 */
export function serializeClearSessionCookie(
  options?: CookieSerializeOptions,
): string {
  const isProduction =
    options?.isProduction ?? process.env.NODE_ENV === "production";
  const secureFlag = isProduction ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/api; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`;
}

/**
 * Valida a origem da requisição para prevenir requisições forjadas entre sites (CSRF).
 * Em produção exige correspondência estrita com APP_ORIGIN configurado.
 * Em desenvolvimento/testes, aceita origens localhost caso APP_ORIGIN não esteja fixado.
 */
export function validateRequestOrigin(
  origin: string | undefined | null,
  configuredOrigin: string | undefined | null,
  isProduction: boolean,
): boolean {
  if (!origin) {
    // Rejeita requisições mutantes sem cabeçalho Origin
    return false;
  }

  // Se APP_ORIGIN estiver explicitamente configurado, exige correspondência exata
  if (configuredOrigin) {
    return (
      origin.trim().toLowerCase() === configuredOrigin.trim().toLowerCase()
    );
  }

  // Se for produção e não houver APP_ORIGIN configurado, rejeita por segurança
  if (isProduction) {
    return false;
  }

  // Em ambiente local de desenvolvimento/teste, permite localhost e 127.0.0.1
  try {
    const parsed = new URL(origin);
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}
