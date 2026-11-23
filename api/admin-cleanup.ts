import type { VercelRequest, VercelResponse } from "@vercel/node";
import cloudinaryAuditHandler from "../server/cloudinary-audit-handler.js";
import partnerDeleteHandler from "../server/partner-delete-handler.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  const allowedMethods = ["GET", "POST"];
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const rawScope = req.query?.scope;
  const scope = Array.isArray(rawScope) ? rawScope[0] : rawScope;

  if (scope === "partner-delete") {
    return partnerDeleteHandler(req, res);
  }
  if (scope === "cloudinary-audit") {
    return cloudinaryAuditHandler(req, res);
  }

  return res.status(400).json({ error: "Escopo administrativo inválido." });
}
