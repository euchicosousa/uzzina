import type { Tables } from "types/database";

declare global {
  type Person = Tables<"people">;
  type Partner = Tables<"partners">;
}
