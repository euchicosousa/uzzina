import { createContext, useContext } from "react";
import type { Partner } from "~/types";

export interface DashContextType {
  name: string;
  image: string | null;
  partners: Partner[];
  clientId: string;
  cloudName: string;
  uploadPreset: string;
}

export const DashContext = createContext<DashContextType | null>(null);

export function useDashContext() {
  const context = useContext(DashContext);
  if (!context) {
    throw new Error("useDashContext must be used within a DashContextProvider");
  }
  return context;
}
