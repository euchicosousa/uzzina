export interface PartnerDeleteActionItem {
  id: string;
  title: string;
  date: string;
  category: string;
  phase: string;
  archived: boolean;
}

export interface PartnerDeleteSharedActionItem {
  id: string;
  title: string;
  date: string;
  phase: string;
  remainingPartners: string[];
  clearsPartnerTopic: boolean;
}

export interface PartnerDeleteClientItem {
  id: string;
  name: string | null;
  email: string;
  active: boolean;
  remainingPartners?: string[];
}

export interface PartnerDeleteTopicItem {
  id: string;
  title: string;
  color: string;
}

export interface PartnerDeleteReviewLinkItem {
  id: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  active: boolean;
  actionsCount: number;
}

export interface PartnerDeleteMediaSummary {
  totalCount: number;
  orphanCandidatesCount: number;
  sharedElsewhereCount: number;
  sampleOrphanUrls: string[];
}

export interface PartnerDeleteSnapshotCounts {
  exclusiveActions: number;
  sharedActions: number;
  exclusiveClients: number;
  sharedClients: number;
}

export interface PartnerDeletePreview {
  partner: {
    id: string;
    slug: string;
    title: string;
    short: string;
    image: string | null;
    colors: string[];
    archived: boolean;
    sow: string;
  };
  snapshot: PartnerDeleteSnapshotCounts;
  exclusiveActions: PartnerDeleteActionItem[];
  sharedActions: PartnerDeleteSharedActionItem[];
  cascadesFromExclusiveActions: {
    commentsCount: number;
    notificationsCount: number;
    strategyOperationsCount: number;
  };
  exclusiveClients: PartnerDeleteClientItem[];
  sharedClients: PartnerDeleteClientItem[];
  topics: PartnerDeleteTopicItem[];
  planning: {
    socialPlansCount: number;
    socialPlanActionLinksCount: number;
    themeRequestsCount: number;
  };
  holidaysCount: number;
  reviewLinks: {
    totalCount: number;
    activeCount: number;
    items: PartnerDeleteReviewLinkItem[];
  };
  media: PartnerDeleteMediaSummary;
}

export interface PartnerDeleteRequest {
  partnerId: string;
  slug: string;
  expectedCounts: PartnerDeleteSnapshotCounts;
}

export interface PartnerDeleteResult {
  deleted: true;
  summary: {
    partner: {
      id: string;
      slug: string;
      title: string;
    };
    deleted: {
      exclusiveActions: number;
      comments: number;
      notifications: number;
      strategyOperations: number;
      exclusiveClients: number;
      topics: number;
      socialPlans: number;
      themeRequests: number;
      holidays: number;
      reviewLinks: number;
    };
    unlinked: {
      sharedActions: number;
      sharedClients: number;
    };
  };
}
