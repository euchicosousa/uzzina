import { redirect } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";

/**
 * Protege rotas no servidor usando getClaims() — a forma oficialmente recomendada
 * pelo Supabase para SSR. Ao contrário de getSession(), getClaims() valida a
 * assinatura JWT localmente usando as chaves públicas do projeto (JWKS), que são
 * cacheadas em memória após a primeira requisição — zero network requests.
 *
 * IMPORTANTE: Se o projeto usar algoritmo simétrico (HS256/legacy), getClaims()
 * faz fallback automático para getUser() que SIM faz network request.
 * Verifique em: Supabase Dashboard → Project Settings → API → JWT Signing Keys
 * e migre para RS256/ES256 para obter o benefício máximo.
 *
 * O refresh do token acontece no browser, via onAuthStateChange em app.tsx.
 */
export async function getUserId(request: Request) {
  const { supabase } = createSupabaseClient(request);

  // getClaims() valida o JWT localmente — zero network requests se RS256/ES256.
  // Retorna { data: { claims, header, signature }, error }
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    throw redirect("/login");
  }

  // O user_id está em claims.sub (campo padrão JWT para subject)
  const user_id = data.claims.sub;

  if (!user_id) {
    throw redirect("/login");
  }

  return { user_id, supabase };
}
