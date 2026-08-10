import type { Json, Tables } from "types/database";

export interface StrategyItem {
  headline: string;
  angulo: string;
  racional: string;
  direcionamento: string;
  [key: string]: Json | undefined;
}

export type Action = Tables<"actions"> & {
  strategies?: StrategyItem[] | Json | null;
};
export type Person = Tables<"people">;
export type Client = Tables<"clients">;
export type Partner = Tables<"partners">;
export type Celebration = Tables<"celebrations">;
export type Notification = Tables<"notifications">;
export type ActionComment = Tables<"action_comments">;

export interface PartnerTopic {
  id: string;
  title: string;
  color: string;
}

