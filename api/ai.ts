import type { VercelRequest, VercelResponse } from "@vercel/node";
import aiHandler from "../server/ai-handler.js";
import planningThemeHandler from "../server/planning-theme-handler.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.query?.scope === "planning-theme") {
    return planningThemeHandler(req, res);
  }
  return aiHandler(req, res);
}
