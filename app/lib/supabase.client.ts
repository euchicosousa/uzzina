import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "types/database";

/**
 * Singleton do cliente Supabase para uso no browser.
 *
 * IMPORTANTE: deve ser um singleton — o Supabase gerencia o refresh automático
 * do token (autoRefreshToken) internamente na instância. Se uma nova instância
 * for criada a cada chamada, o timer de refresh não é mantido e o usuário é
 * deslogado após a expiração do access_token (~1 hora).
 */
let _browserClient: SupabaseClient<Database> | null = null;

export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  if (_browserClient) return _browserClient;

  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  _browserClient = createClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return _browserClient;
}
