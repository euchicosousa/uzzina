import { createSupabaseBrowserClient } from "~/lib/supabase.client";

export async function listLeads(): Promise<Lead[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }

  return data as Lead[];
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching lead with id ${id}:`, error);
    return null;
  }

  return data as Lead;
}
