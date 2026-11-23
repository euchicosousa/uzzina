import type { VercelRequest, VercelResponse } from "@vercel/node";
import dashActionHandler from "../server/dash-action-handler.js";
import dashAuthHandler from "../server/dash-auth-handler.js";
import dashDataHandler from "../server/dash-data-handler.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  const allowedMethods = ["GET", "POST", "PATCH", "DELETE"];
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const rawScope = req.query?.scope;
  const scope = Array.isArray(rawScope) ? rawScope[0] : rawScope;

  if (scope === "auth") {
    return dashAuthHandler(req, res);
  }
  if (scope === "data") {
    return dashDataHandler(req, res);
  }
  if (scope === "action") {
    return dashActionHandler(req, res);
  }

  return res.status(400).json({ error: "Escopo do portal inválido." });
}
