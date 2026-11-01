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
