import type { VercelRequest, VercelResponse } from "@vercel/node";
import clientAccountsHandler from "../server/admin-client-accounts-handler.js";
import createUserHandler from "../server/admin-create-user-handler.js";
import cloudinaryAuditHandler from "../server/cloudinary-audit-handler.js";
import partnerDeleteHandler from "../server/partner-delete-handler.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  const legacyRoute = req.query?.legacy;
  const allowedMethods =
    legacyRoute === "cleanup"
      ? ["GET", "POST"]
      : ["GET", "POST", "PATCH", "DELETE"];
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const rawScope = req.query?.scope;
  const scope = Array.isArray(rawScope) ? rawScope[0] : rawScope;

  if (legacyRoute !== "cleanup") {
    if (scope === "clients") return clientAccountsHandler(req, res);
    if (scope === "create-user") return createUserHandler(req, res);
  }
  if (legacyRoute !== "accounts") {
    if (scope === "partner-delete") return partnerDeleteHandler(req, res);
    if (scope === "cloudinary-audit") return cloudinaryAuditHandler(req, res);
  }

  return res.status(400).json({ error: "Escopo administrativo inválido." });
}
