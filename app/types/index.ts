import type { Tables } from "types/database";

export type Action = Tables<"actions"> & {
  /** Estação da agência em que a ação está atualmente (adicionada via migration) */
  station?: string | null;
};
export type Person = Tables<"people">;
export type Client = Tables<"clients">;
export type Partner = Tables<"partners">;
export type Celebration = Tables<"celebrations">;
export type Notification = Tables<"notifications">;
export type ActionComment = Tables<"action_comments">;
