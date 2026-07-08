import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createSupabaseClient } from "../app/lib/supabase";
import { getPartnersByUserId } from "../app/models/partners";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const rawQuery = (req.query.q as string) || "";
  const targetPartner = (req.query.partner as string) || null;
  const includeArchived = req.query.archived === "true";

  const partnerMatch = rawQuery.match(/p:(\S+)/);
  const explicitPartner = partnerMatch ? partnerMatch[1] : null;
  const query = rawQuery.replace(/p:\S+/, "").trim();

  if (query.length < 3) {
    return res.status(200).json({ actions: [] });
  }

  try {
    // 1. Inicializar cliente do Supabase no backend Serverless a partir dos cookies/headers da request
    // Usamos um wrapper adaptado para tratar VercelRequest ou instanciamos diretamente
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    // Criamos o cliente mockando a estrutura de Request padrão ou instanciando diretamente
    // Para simplificar a compatibilidade com a assinatura de createSupabaseClient(request: Request):
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

    const partners = await getPartnersByUserId(supabase, user_id);
    const partnerSlugs = partners.map((p) => p.slug);

    if (partnerSlugs.length === 0) {
      return res.status(200).json({ actions: [] });
    }

    let searchPartnerSlugs = partnerSlugs;
    if (targetPartner) {
      if (partnerSlugs.includes(targetPartner)) {
        searchPartnerSlugs = [targetPartner];
      } else {
        return res.status(200).json({ actions: [] });
      }
    }

    if (explicitPartner) {
      searchPartnerSlugs = searchPartnerSlugs.filter((slug) =>
        slug.includes(explicitPartner.toLowerCase()),
      );
      if (searchPartnerSlugs.length === 0) {
        return res.status(200).json({ actions: [] });
      }
    }

    let supabaseQuery = supabase
      .from("actions")
      .select("*")
      .overlaps("partners", searchPartnerSlugs)
      .order("date", { ascending: false });

    if (!includeArchived) {
      supabaseQuery = supabaseQuery.or("archived.is.false,archived.is.null");
    }

    if (query.length > 0) {
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`,
      );
    }

    const { data: actions, error } = await supabaseQuery.limit(50);

    if (error) {
      console.error("Error searching actions serverless:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ actions });
  } catch (err) {
    console.error("Search handler error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return res.status(500).json({ error: message });
  }
}
