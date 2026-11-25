import type { Json, Tables } from "types/database";

export interface StrategyItem {
  headline: string;
  angulo: string;
  racional: string;
  direcionamento: string;
  selected?: boolean;
  [key: string]: Json | undefined;
}

export type Action = Tables<"actions"> & {
  strategies?: StrategyItem[] | Json | null;
};
export type Person = Tables<"people">;
export type Client = Tables<"clients">;
type PartnerRow = Tables<"partners">;
export type Partner = Omit<
  PartnerRow,
  "planning_instructions" | "instagram_feed_time" | "instagram_stories_time"
> &
  Partial<
    Pick<
      PartnerRow,
      "planning_instructions" | "instagram_feed_time" | "instagram_stories_time"
    >
  >;
export type PartnerTopic = Tables<"partner_topics">;
export type Celebration = Tables<"celebrations">;
export type Notification = Tables<"notifications">;
export type ActionComment = Tables<"action_comments">;
