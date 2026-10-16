import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContext } from "~/contexts/AppContext";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";
import { QUERY_KEYS } from "~/lib/query-keys";
import type { Action, Person } from "~/types";
import type { ReactNode } from "react";

export const calendarPerson: Person = {
  id: "calendar-person",
  user_id: "calendar-user",
  name: "Calendar",
  surname: "Test",
  initials: "CT",
  short: "Calendar",
  email: "calendar@test.invalid",
  admin: true,
  visible: true,
  image: null,
  areas: [],
  preferences: null,
  created_at: "2026-10-16T10:00:00Z",
};
export function calendarAction(
  index: number,
  overrides: Partial<Action> = {},
): Action {
  return {
    id: `calendar-action-${index}`,
    title: `Action ${index}`,
    date: "2026-10-16 10:00:00",
    category: "design",
    phase: "do",
    priority: "medium",
    color: "#666666",
    time: 10,
    partners: [],
    responsibles: [],
    archived: false,
    description: null,
    content_description: null,
    instagram_caption: null,
    content_files: [],
    work_files: [],
    sprints: [],
    strategies: [],
    user_id: calendarPerson.user_id,
    created_at: "2026-10-16T10:00:00Z",
    updated_at: "2026-10-16T10:00:00Z",
    ...overrides,
  };
}
export function CalendarTestProviders({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(QUERY_KEYS.people(calendarPerson.user_id), []);
  client.setQueryData(QUERY_KEYS.celebrations(calendarPerson.user_id), []);
  return (
    <QueryClientProvider client={client}>
      <AppContext.Provider
        value={{
          person: calendarPerson,
          partners: [],
          cloudName: "test",
          uploadPreset: "test",
          setBaseAction: () => {},
          partnerFilters: [],
          setPartnerFilters: () => {},
        }}
      >
        <MultiSelectionProvider>{children}</MultiSelectionProvider>
      </AppContext.Provider>
    </QueryClientProvider>
  );
}
