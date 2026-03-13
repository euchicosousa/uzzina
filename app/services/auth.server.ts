import { redirect } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";

/**
 * Extrai o user_id da sessão armazenada no cookie, sem fazer requisição de rede
 * ao Supabase Auth. getSession() lê o JWT localmente — ao contrário de getClaims()
 * e getUser() que chamam a API. A segurança é garantida pelo RLS no banco: cada
 * query de dados valida o JWT independentemente.
 */
export async function getUserId(request: Request) {
  const { supabase } = createSupabaseClient(request);

  const { data, error } = await supabase.auth.getSession();

  if (error || !data?.session) {
    throw redirect("/login");
  }

  const user_id = data.session.user.id;

  return { user_id, supabase };
}
