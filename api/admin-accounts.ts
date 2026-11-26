import type { VercelRequest, VercelResponse } from "@vercel/node";
import clientAccountsHandler from "../server/admin-client-accounts-handler.js";
import createUserHandler from "../server/admin-create-user-handler.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  const allowedMethods = ["GET", "POST", "PATCH", "DELETE"];
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const rawScope = req.query?.scope;
  const scope = Array.isArray(rawScope) ? rawScope[0] : rawScope;

  if (scope === "clients") {
    return clientAccountsHandler(req, res);
  }
  if (scope === "create-user") {
    return createUserHandler(req, res);
  }

  return res.status(400).json({ error: "Escopo administrativo inválido." });
}
