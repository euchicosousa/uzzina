import { redirect } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { getClientsByUserId } from "~/models/clients.server";

/**
 * Autentica um usuário do portal /dash.
 * Lê a sessão do cookie (sem chamada de rede ao Auth).
 * Verifica se existe pelo menos um registro em `clients` para o user_id.
 */
export async function getClientSession(request: Request) {
  const { supabase } = createSupabaseClient(request);

  const { data } = await supabase.auth.getSession();
  if (!data?.session) throw redirect("/dash/login");

  const userId = data.session.user.id;
  const clients = await getClientsByUserId(supabase, userId);

  if (!clients || clients.length === 0) throw redirect("/dash/login");

  // Extrai partner_slugs únicos
  const partnerSlugs = [
    ...new Set(
      clients.map((c) => c.partner_slug).filter((s): s is string => !!s),
    ),
  ];

  return {
    supabase,
    userId,
    clientName: clients[0].name || "",
    partnerSlugs,
  };
}
