import type { LoaderFunctionArgs } from "react-router";
import { getUserId } from "~/services/auth.server";
import { getPartnersByUserId } from "~/models/partners.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const rawQuery = url.searchParams.get("q") || "";
  const targetPartner = url.searchParams.get("partner") || null;

  const partnerMatch = rawQuery.match(/p:(\S+)/);
  const explicitPartner = partnerMatch ? partnerMatch[1] : null;
  const query = rawQuery.replace(/p:\S+/, "").trim();

  // Require at least 3 characters to search text, unless explicitly filtering by partner
  // if (!explicitPartner && query.length < 3) {
  //   return { actions: [] };
  // }
  if (query.length < 3) {
    return { actions: [] };
  }

  const { supabase, user_id } = await getUserId(request);
  const partners = await getPartnersByUserId(supabase, user_id);
  const partnerSlugs = partners.map((p) => p.slug);

  if (partnerSlugs.length === 0) {
    return { actions: [] };
  }

  // Determine which partners to search across
  // If a context targetPartner is provided, restrict to ONLY that partner (if authorized)
  let searchPartnerSlugs = partnerSlugs;
  if (targetPartner) {
    if (partnerSlugs.includes(targetPartner)) {
      searchPartnerSlugs = [targetPartner];
    } else {
      // Security: user requested a partner they do not have access to
      return { actions: [] };
    }
  }

  if (explicitPartner) {
    searchPartnerSlugs = searchPartnerSlugs.filter((slug) =>
      slug.includes(explicitPartner.toLowerCase()),
    );
    if (searchPartnerSlugs.length === 0) {
      return { actions: [] };
    }
  }

  // Find all actions that belong to the user's partners
  // where the title OR description contains the query (case insensitive)
  let supabaseQuery = supabase
    .from("actions")
    .select("*")
    .overlaps("partners", searchPartnerSlugs)
    .order("date", { ascending: false });

  if (query.length > 0) {
    supabaseQuery = supabaseQuery.or(
      `title.ilike.%${query}%,description.ilike.%${query}%`,
    );
  }

  // Added a limit to ensure that "p:" queries do not return unbounded rows
  const { data: actions, error } = await supabaseQuery.limit(50);

  if (error) {
    console.error("Error searching actions:", error);
    return Response.json(
      { actions: [], error: error.message },
      { status: 500 },
    );
  }

  return { actions };
}
