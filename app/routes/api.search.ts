import type { LoaderFunctionArgs } from "react-router";
import { getUserId } from "~/services/auth.server";
import { getPartnersByUserId } from "~/models/partners.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const targetPartner = url.searchParams.get("partner") || null;

  // Require at least 3 characters to search
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

  // Find all actions that belong to the user's partners
  // where the title OR description contains the query (case insensitive)
  const { data: actions, error } = await supabase
    .from("actions")
    .select("*")
    .overlaps("partners", searchPartnerSlugs)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error searching actions:", error);
    return Response.json(
      { actions: [], error: error.message },
      { status: 500 },
    );
  }

  return { actions };
}
