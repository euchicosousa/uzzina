import type { Tables } from "types/database";

declare global {
  type Person = Tables<"people">;
  type Partner = Tables<"partners">;
  type Action = Tables<"actions">;
  type State = Tables<"states">;
  type Category = Tables<"categories">;
  type Priority = Tables<"priorities">;
}
