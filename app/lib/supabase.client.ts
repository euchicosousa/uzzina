import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "types/database";

/**
 * Client Supabase para uso no browser (client-side).
 *
 * Responsabilidade principal: manter a sessão viva automaticamente.
 * O @supabase/ssr no browser detecta quando o access token está prestes a
 * expirar e faz o refresh automaticamente, atualizando os cookies — de modo
 * que o servidor nunca precise fazer refresh por conta própria.
 *
 * Deve ser inicializado UMA VEZ no layout raiz via useEffect.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    window.__env.SUPABASE_URL,
    window.__env.SUPABASE_PUBLISHABLE_KEY,
  );
}
