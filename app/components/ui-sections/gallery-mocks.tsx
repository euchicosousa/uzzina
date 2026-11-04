import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { AppContext, type AppContextType } from "~/contexts/AppContext";
import type { Action, Partner, Person } from "~/types";

export const MOCK_PARTNERS: Partner[] = [
  {
    archived: false,
    colors: ["#2563eb", "#ffffff"],
    context: null,
    created_at: "2026-01-01T00:00:00.000Z",
    id: "partner-alfa-001",
    image: null,
    instagram_caption_tail: null,
    short: "AO",
    slug: "alfa",
    sow: "marketing",
    title: "Alfa Odontologia",
    users_ids: ["user-mock-001", "user-mock-002", "user-mock-003"],
    voice: null,
  },
  {
    archived: false,
    colors: ["#7c3aed", "#ffffff"],
    context: null,
    created_at: "2026-01-01T00:00:00.000Z",
    id: "partner-beta-002",
    image: null,
    instagram_caption_tail: null,
    short: "BS",
    slug: "beta",
    sow: "marketing",
    title: "Beta Studio",
    users_ids: ["user-mock-001", "user-mock-002", "user-mock-003"],
    voice: null,
  },
  {
    archived: false,
    colors: ["#059669", "#ffffff"],
    context: null,
    created_at: "2026-01-01T00:00:00.000Z",
    id: "partner-gama-003",
    image: null,
    instagram_caption_tail: null,
    short: "GC",
    slug: "gama",
    sow: "marketing",
    title: "Gama Clínica",
    users_ids: ["user-mock-001", "user-mock-002", "user-mock-003"],
    voice: null,
  },
  {
    archived: false,
    colors: ["#ea580c", "#ffffff"],
    context: null,
    created_at: "2026-01-01T00:00:00.000Z",
    id: "partner-delta-004",
    image: null,
    instagram_caption_tail: null,
    short: "DF",
    slug: "delta",
    sow: "marketing",
    title: "Delta Foods",
    users_ids: ["user-mock-001", "user-mock-002", "user-mock-003"],
    voice: null,
  },
];

export const MOCK_PERSON: Person = {
  admin: true,
  areas: ["design", "marketing"],
  created_at: "2026-01-01T00:00:00.000Z",
  email: "contato@uzzina.local",
  id: "person-mock-001",
  image: null,
  initials: "UZ",
  name: "Usuário",
  preferences: null,
  short: "UZ",
  surname: "Uzzina",
  user_id: "user-mock-001",
  visible: true,
};

export const MOCK_PEOPLE: Person[] = [
  MOCK_PERSON,
  {
    admin: false,
    areas: ["design"],
    created_at: "2026-01-01T00:00:00.000Z",
    email: "ana@uzzina.local",
    id: "person-mock-002",
    image: null,
    initials: "AL",
    name: "Ana",
    preferences: null,
    short: "AL",
    surname: "Lima",
    user_id: "user-mock-002",
    visible: true,
  },
  {
    admin: false,
    areas: ["marketing", "copy"],
    created_at: "2026-01-01T00:00:00.000Z",
    email: "bruno@uzzina.local",
    id: "person-mock-003",
    image: null,
    initials: "BR",
    name: "Bruno",
    preferences: null,
    short: "BR",
    surname: "Reis",
    user_id: "user-mock-003",
    visible: true,
  },
];

export const NOOP_ACTION = (_action: Action | null) => {};
export const NOOP_PARTNER_FILTERS: React.Dispatch<
  React.SetStateAction<string[]>
> = () => {};

export const MOCK_APP_CONTEXT: AppContextType = {
  person: MOCK_PERSON,
  partners: MOCK_PARTNERS,
  cloudName: "",
  uploadPreset: "",
  setPrimaryAction: NOOP_ACTION,
  partnerFilters: [],
  setPartnerFilters: NOOP_PARTNER_FILTERS,
};

export const GALLERY_QUERY_CLIENT = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

GALLERY_QUERY_CLIENT.setQueryData(
  QUERY_KEYS.people(MOCK_PERSON.user_id),
  MOCK_PEOPLE,
);

export function GalleryAppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={GALLERY_QUERY_CLIENT}>
      <AppContext.Provider value={MOCK_APP_CONTEXT}>
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
}
