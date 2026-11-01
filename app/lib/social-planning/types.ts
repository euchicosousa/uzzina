export type PlanFormat = "reels" | "static" | "carousel";

export type PlanMode = "theme" | "period";

export type PlanSuggestionStatus = "pending" | "approved" | "rejected";

export interface PlanSuggestion {
  id: string;
  title: string;
  format: PlanFormat;
  objective: string;
  briefing: string;
  scheduled_date?: string; // YYYY-MM-DD
  status: PlanSuggestionStatus;
  is_commemorative?: boolean;
  celebration_title?: string;
}

export interface SocialPlan {
  id: string;
  partner_slug: string;
  partner_title?: string;
  mode: PlanMode;
  input: Record<string, unknown>;
  suggestions: PlanSuggestion[];
  status: "draft" | "finalized";
  created_at: string;
  updated_at: string;
}
