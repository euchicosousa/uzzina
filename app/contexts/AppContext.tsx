import { createContext, useContext } from "react";
import type { PreferencePatch } from "~/lib/preference-persistence";
import type { Partner, Person, Action } from "~/types";

export interface AppContextType {
  person: Person;
  queueAIPreference?: (patch: PreferencePatch) => void;
  partners: Partner[];
  cloudName: string;
  uploadPreset: string;
  setPrimaryAction: (action: Action | null) => void;
  partnerFilters: string[];
  setPartnerFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AppContext = createContext<AppContextType | null>(null);
const LeaveOpenActionsContext = createContext<(() => Promise<boolean>) | null>(
  null,
);

export const AppNavigationProvider = LeaveOpenActionsContext.Provider;

export function useLeaveOpenActions() {
  const leaveOpenActions = useContext(LeaveOpenActionsContext);
  if (!leaveOpenActions) {
    throw new Error(
      "useLeaveOpenActions must be used within AppNavigationProvider",
    );
  }
  return leaveOpenActions;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
