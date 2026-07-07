import { createContext, useContext } from "react";
import type { Partner, Person, Action } from "~/types";

export interface AppContextType {
  person: Person;
  partners: Partner[];
  cloudName: string;
  uploadPreset: string;
  setBaseAction: (action: Action | null) => void;
  partnerFilters: string[];
  setPartnerFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
