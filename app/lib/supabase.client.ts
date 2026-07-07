import { createClient } from "@supabase/supabase-js";
import type { Database } from "types/database";

/**
 * Client Supabase para uso no browser (client-side) usando a biblioteca padrão.
 */
export function createSupabaseBrowserClient() {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  return createClient<Database>(url, key);
}
