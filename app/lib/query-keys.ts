export const QUERY_KEYS = {
  actions: {
    all: () => ["actions"] as const,
    home: (userId: string) => ["actions", "home", userId] as const,
    partner: (slug: string, dateRange?: string) => ["actions", "partner", slug, dateRange] as const,
  },
  lateActions: {
    all: () => ["actions", "late"] as const,
    user: (userId: string) => ["actions", "late", "user", userId] as const,
    partner: (slug: string) => ["actions", "late", "partner", slug] as const,
  },
  celebrations: () => ["celebrations"] as const,
  partners: () => ["partners"] as const,
  people: () => ["people"] as const,
} as const;
