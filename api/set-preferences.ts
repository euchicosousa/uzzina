import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createSupabaseClient } from "../app/lib/supabase";
import { getPersonByUserId } from "../app/models/people";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host || "localhost";
    const dummyUrl = `${protocol}://${host}${req.url}`;
    const standardRequest = new Request(dummyUrl, {
      headers: new Headers(req.headers as Record<string, string>),
    });

    const { supabase } = createSupabaseClient(standardRequest);

    // Valida o token e pega claims
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    if (claimsError || !claimsData?.claims) {
      return res.status(401).json({ error: "Unauthorized JWT session" });
    }

    const user_id = claimsData.claims.sub;
    if (!user_id) {
      return res.status(401).json({ error: "Invalid user identifier in token" });
    }

    const theme = req.body.theme as string;
    const themeColorIndex = req.body.themeColorIndex !== undefined && req.body.themeColorIndex !== null ? Number(req.body.themeColorIndex) : null;
    const followPartnerColor = req.body.followPartnerColor !== undefined && req.body.followPartnerColor !== null ? req.body.followPartnerColor === "true" : null;

    // Parse do customTheme se enviado
    const customThemeRaw = req.body.customTheme as string;
    let customTheme = null;
    if (customThemeRaw) {
      try {
        customTheme = JSON.parse(customThemeRaw);
      } catch (e) {
        console.error("Error parsing customTheme serverless:", e);
      }
    }

    // Busca preferências atuais para mesclar
    const person = await getPersonByUserId(supabase, user_id);
    const currentPrefs = person.preferences && typeof person.preferences === "object" ? person.preferences : {};

    const preferences = {
      ...currentPrefs,
      ...(theme ? { theme } : {}),
      ...(themeColorIndex !== null ? { themeColorIndex } : {}),
      ...(followPartnerColor !== null ? { followPartnerColor } : {}),
      ...(customTheme ? { customTheme } : {}),
    };

    const { error } = await supabase
      .from("people")
      .update({
        preferences,
      })
      .eq("user_id", user_id);

    if (error) {
      console.error("Error updating quick preferences serverless:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Set preferences handler error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return res.status(500).json({ error: message });
  }
}
