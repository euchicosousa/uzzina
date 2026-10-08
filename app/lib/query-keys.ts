export interface ActionListScope {
  kind: "period" | "late";
  userId: string;
  isAdmin: boolean;
  partners: string[];
  from?: string;
  to: string;
  strictArchived?: boolean;
}

export function getActionListScope(
  key: readonly unknown[],
): ActionListScope | null {
  const tail = key.at(-1);
  if (!tail || typeof tail !== "object" || !("actionScope" in tail))
    return null;
  const value = tail.actionScope;
  if (!value || typeof value !== "object") return null;
  if (
    !("kind" in value) ||
    (value.kind !== "period" && value.kind !== "late") ||
    !("userId" in value) ||
    typeof value.userId !== "string" ||
    !("isAdmin" in value) ||
    typeof value.isAdmin !== "boolean" ||
    !("partners" in value) ||
    !Array.isArray(value.partners) ||
    !value.partners.every((p) => typeof p === "string") ||
    !("to" in value) ||
    typeof value.to !== "string"
  )
    return null;
  const from =
    "from" in value && typeof value.from === "string" ? value.from : undefined;
  if (value.kind === "period" && !from) return null;
  return {
    kind: value.kind,
    userId: value.userId,
    isAdmin: value.isAdmin,
    partners: value.partners,
    to: value.to,
    from,
    strictArchived: "strictArchived" in value && value.strictArchived === true,
  };
}

export const QUERY_KEYS = {
  actions: {
    list: (
      kind: "home" | "today" | "partner" | "late",
      userId: string,
      isAdmin: boolean,
      partners: string[],
      from?: string,
      to = "now",
    ) =>
      [
        "actions",
        "team",
        kind,
        userId,
        {
          actionScope: {
            kind: kind === "late" ? "late" : "period",
            userId,
            isAdmin,
            partners: [...partners].sort(),
            from,
            to,
            strictArchived: kind === "partner",
          },
        },
      ] as const,
    all: () => ["actions"] as const,
    home: (userId: string) => ["actions", "team", "home", userId] as const,
    today: (userId: string, dateKey?: string) =>
      ["actions", "team", "today", userId, dateKey ?? "current"] as const,
    flow: (
      userId: string,
      dateFilters?: { from?: string; to: string; partners?: string[] },
    ) => ["actions", "team", "flow", userId, dateFilters] as const,
    partner: (userId: string, slug: string, dateRange?: string) =>
      ["actions", "team", "partner", userId, slug, dateRange] as const,
  },
  lateActions: {
    all: () => ["actions", "team", "late"] as const,
    user: (userId: string) =>
      ["actions", "team", "late", "user", userId] as const,
    partner: (userId: string, slug: string) =>
      ["actions", "team", "late", "partner", userId, slug] as const,
  },
  celebrations: (userId: string) => ["celebrations", "team", userId] as const,
  partners: () => ["partners"] as const,
  operationalPartners: (userId: string, isAdmin: boolean) =>
    ["partners", "team", "operational", userId, isAdmin] as const,
  adminPartners: (userId: string) =>
    ["partners", "team", userId, "admin"] as const,
  people: (userId: string) => ["people", "team", userId] as const,
  peopleAdmin: (userId: string) => ["people", "team", userId, "admin"] as const,
  notifications: (userId: string) => ["notifications", "team", userId] as const,
  leads: {
    all: (userId: string) => ["leads", "team", userId] as const,
    detail: (userId: string, id: string) =>
      ["leads", "team", userId, id] as const,
  },
  comments: {
    all: (actionId: string, userId: string) =>
      ["comments", "team", userId, "internal", actionId] as const,
    public: (actionId: string, userId: string) =>
      ["comments", "team", userId, "public", actionId] as const,
  },
} as const;
