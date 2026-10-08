import type { VercelRequest } from "@vercel/node";

/** Extracts the token from an `Authorization: Bearer <token>` header. */
export function extractBearerToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === "string") {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0]?.toLowerCase() === "bearer") {
      return parts[1] ?? null;
    }
  }
  return null;
}
