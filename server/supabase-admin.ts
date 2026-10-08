import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

export interface ServiceConfig {
  url: string;
  serviceRoleKey: string;
}

/** Reads the service-role configuration, or null when it is incomplete. */
export function getServiceConfig(): ServiceConfig | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

export function createServiceClient(
  config: ServiceConfig,
): SupabaseClient<Database> {
  return createClient<Database>(config.url, config.serviceRoleKey);
}
