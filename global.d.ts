import type { Tables } from "types/database";
import { CATEGORIES } from "./CONSTANTS";

declare global {
  type Person = Tables<"people">;
  type Partner = Tables<"partners">;
  type Action = Tables<"actions">;
  type Celebration = Tables<"celebrations">;
  type OutletContext = {
    BaseAction: Action | null;
    setBaseAction: (action: Action | null) => void;
  };
}
