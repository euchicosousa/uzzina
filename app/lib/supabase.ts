import { createClient } from "@supabase/supabase-js";
import type { Database } from "types/database";

export const createSupabaseClient = (request: Request) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required.",
    );
  }

  const headers = new Headers();
  const cookies = request.headers.get("Cookie") || "";
  const tokenMatch = cookies.match(/sb-[a-z]+-auth-token=([^;]+)/);
  const accessToken = tokenMatch ? JSON.parse(decodeURIComponent(tokenMatch[1]))?.access_token : undefined;

  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    },
  });

  return { supabase, headers };
};
