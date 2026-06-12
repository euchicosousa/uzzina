import type { Tables } from "types/database";

declare global {
  type Person = Tables<"people">;
  type Partner = Tables<"partners">;
  type Action = Tables<"actions">;
  type Celebration = Tables<"celebrations">;
  type OutletContext = {
    BaseAction: Action | null;
    setBaseAction: (action: Action | null) => void;
    partnerFilters: string[];
    setPartnerFilters: (slugs: string[]) => void;
  };
  interface Window {
    __env: {
      SUPABASE_URL: string;
      SUPABASE_PUBLISHABLE_KEY: string;
    };
  }
}
