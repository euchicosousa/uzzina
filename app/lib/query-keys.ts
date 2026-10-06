export const QUERY_KEYS = {
  actions: {
    all: () => ["actions"] as const,
    home: (userId: string) => ["actions", "home", userId] as const,
    today: (userId: string, dateKey?: string) => ["actions", "today", userId, dateKey ?? "current"] as const,
    flow: (userId: string, dateFilters?: { from?: string; to: string; partners?: string[] }) => ["actions", "flow", userId, dateFilters] as const,
    partner: (slug: string, dateRange?: string) => ["actions", "partner", slug, dateRange] as const,
  },
  lateActions: {
    all: () => ["actions", "late"] as const,
    user: (userId: string) => ["actions", "late", "user", userId] as const,
    partner: (slug: string) => ["actions", "late", "partner", slug] as const,
  },
  celebrations: () => ["celebrations"] as const,
  partners: () => ["partners"] as const,
  operationalPartners: (userId:string,isAdmin:boolean) => ["partners","operational",userId,isAdmin] as const,
  adminPartners: () => ["partners","admin"] as const,
  people: () => ["people"] as const,
  peopleAdmin: () => ["people", "admin"] as const,
  notifications: () => ["notifications"] as const,
  leads: {
    all: () => ["leads"] as const,
    detail: (id: string) => ["leads", id] as const,
  },
  comments: {
    all: (actionId: string) => ["comments", "internal", actionId] as const,
    public: (actionId: string) => ["comments", "public", actionId] as const,
  },
} as const;
