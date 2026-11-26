import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  classifyPartnerMedia,
  extractCloudinaryUrls,
  normalizeCloudinaryAssetKey,
} from "../app/lib/cloudinary-references";

type Row = Record<string, unknown>;

const db: Record<string, Row[]> = {
  people: [],
  partners: [],
  actions: [],
  action_comments: [],
  notifications: [],
  strategy_operations: [],
  clients: [],
  partner_topics: [],
  social_plans: [],
  social_plan_action_links: [],
  planning_theme_requests: [],
  partner_holidays: [],
};

let forcedRpcError: { code?: string; message?: string } | null = null;

const authUsers: Record<string, { id: string; email: string }> = {
  "admin-token": { id: "user-admin", email: "admin@cnvt.com" },
  "collab-token": { id: "user-collab", email: "collab@cnvt.com" },
  "inactive-token": { id: "user-inactive", email: "inactive@cnvt.com" },
};

mock.module("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async (token: string) => {
        const user = authUsers[token];
        if (!user) {
          return { data: { user: null }, error: { message: "Invalid token" } };
        }
        return { data: { user }, error: null };
      },
    },
    rpc: async (fn: string, params: Record<string, unknown>) => {
      if (forcedRpcError) {
        return { data: null, error: forcedRpcError };
      }
      if (fn !== "delete_archived_partner") {
        return { data: null, error: { message: "Unknown RPC" } };
      }

      const partner = db.partners.find((row) => row.id === params.p_partner_id);
      if (!partner) {
        return {
          data: null,
          error: { code: "P0002", message: "PARTNER_NOT_FOUND" },
        };
      }
      if (partner.slug !== params.p_expected_slug) {
        return {
          data: null,
          error: { code: "P0001", message: "PARTNER_MISMATCH" },
        };
      }
      if (partner.archived !== true) {
        return {
          data: null,
          error: { code: "P0001", message: "PARTNER_NOT_ARCHIVED" },
        };
      }

      const slug = String(partner.slug);
      const exclusiveActions = db.actions.filter((action) => {
        const partners = (action.partners as string[]) ?? [];
        return (
          partners.includes(slug) &&
          partners.filter((item) => item !== slug).length === 0
        );
      });
      const sharedActions = db.actions.filter((action) => {
        const partners = (action.partners as string[]) ?? [];
        return (
          partners.includes(slug) &&
          partners.filter((item) => item !== slug).length > 0
        );
      });
      const exclusiveClients = db.clients.filter((client) => {
        const partners = (client.partners as string[]) ?? [];
        return (
          partners.includes(slug) &&
          partners.filter((item) => item !== slug).length === 0
        );
      });
      const sharedClients = db.clients.filter((client) => {
        const partners = (client.partners as string[]) ?? [];
        return (
          partners.includes(slug) &&
          partners.filter((item) => item !== slug).length > 0
        );
      });

      if (
        exclusiveActions.length !== params.p_expected_exclusive_action_count ||
        sharedActions.length !== params.p_expected_shared_action_count ||
        exclusiveClients.length !== params.p_expected_exclusive_client_count ||
        sharedClients.length !== params.p_expected_shared_client_count
      ) {
        return {
          data: null,
          error: { code: "P0001", message: "IMPACT_CHANGED" },
        };
      }

      const exclusiveActionIds = new Set(
        exclusiveActions.map((row) => String(row.id)),
      );
      const commentsCount = db.action_comments.filter((row) =>
        exclusiveActionIds.has(String(row.action_id)),
      ).length;
      const notificationsCount = db.notifications.filter((row) =>
        exclusiveActionIds.has(String(row.action_id)),
      ).length;
      const strategyOperationsCount = db.strategy_operations.filter((row) =>
        exclusiveActionIds.has(String(row.action_id)),
      ).length;
      const topicsCount = db.partner_topics.filter(
        (row) => row.partner_id === partner.id,
      ).length;
      const socialPlansCount = db.social_plans.filter(
        (row) => row.partner_slug === slug,
      ).length;
      const themeRequestsCount = db.planning_theme_requests.filter(
        (row) => row.partner_slug === slug,
      ).length;
      const holidaysCount = db.partner_holidays.filter(
        (row) => row.partner_id === partner.id,
      ).length;
      for (const action of sharedActions) {
        action.partners = ((action.partners as string[]) ?? []).filter(
          (item) => item !== slug,
        );
      }
      db.actions = db.actions.filter(
        (row) => !exclusiveActionIds.has(String(row.id)),
      );
      for (const client of sharedClients) {
        client.partners = ((client.partners as string[]) ?? []).filter(
          (item) => item !== slug,
        );
      }
      const exclusiveClientIds = new Set(
        exclusiveClients.map((row) => String(row.id)),
      );
      db.clients = db.clients.filter(
        (row) => !exclusiveClientIds.has(String(row.id)),
      );
      db.partner_topics = db.partner_topics.filter(
        (row) => row.partner_id !== partner.id,
      );
      db.partners = db.partners.filter((row) => row.id !== partner.id);

      return {
        data: {
          partner: {
            id: partner.id,
            slug,
            title: partner.title,
          },
          deleted: {
            exclusiveActions: exclusiveActions.length,
            comments: commentsCount,
            notifications: notificationsCount,
            strategyOperations: strategyOperationsCount,
            exclusiveClients: exclusiveClients.length,
            topics: topicsCount,
            socialPlans: socialPlansCount,
            themeRequests: themeRequestsCount,
            holidays: holidaysCount,
          },
          unlinked: {
            sharedActions: sharedActions.length,
            sharedClients: sharedClients.length,
          },
        },
        error: null,
      };
    },
    from: (table: string) => {
      const filters: ((row: Row) => boolean)[] = [];
      let headOnly = false;
      let countMode: string | undefined;
      let start = 0;
      let end = Infinity;

      const execute = () => {
        const rows = (db[table] || []).filter((row) =>
          filters.every((filter) => filter(row)),
        );
        const sliced = rows.slice(start, end + 1);
        return {
          data: headOnly ? null : sliced,
          count: countMode === "exact" ? rows.length : null,
          error: null,
        };
      };

      const chain = {
        select: (
          _columns?: string,
          options?: { count?: string; head?: boolean },
        ) => {
          countMode = options?.count;
          headOnly = options?.head === true;
          return chain;
        },
        eq: (key: string, value: unknown) => {
          filters.push((row) => row[key] === value);
          return chain;
        },
        neq: (key: string, value: unknown) => {
          filters.push((row) => row[key] !== value);
          return chain;
        },
        in: (key: string, values: unknown[]) => {
          filters.push((row) => values.includes(row[key]));
          return chain;
        },
        contains: (key: string, values: unknown[]) => {
          filters.push((row) => {
            const cell = row[key];
            if (!Array.isArray(cell)) return false;
            return values.every((item) => cell.includes(item));
          });
          return chain;
        },
        order: () => chain,
        range: (from: number, to: number) => {
          start = from;
          end = to;
          return chain;
        },
        maybeSingle: async () => {
          const res = execute();
          const first =
            Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
          return { data: first, error: null };
        },
        single: async () => {
          const res = execute();
          if (Array.isArray(res.data) && res.data.length === 1) {
            return { data: res.data[0], error: null };
          }
          return {
            data: null,
            error: { message: "Row not found", code: "PGRST116" },
          };
        },
        // biome-ignore lint/suspicious/noThenProperty: PostgREST thenable
        then: (resolve: (res: ReturnType<typeof execute>) => void) =>
          Promise.resolve(resolve(execute())),
      };

      return chain;
    },
  }),
}));

const { default: partnerDeleteHandler } = await import("../api/admin");

function createMockReqRes(options: {
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, string | string[]>;
  body?: unknown;
}) {
  const req = {
    method: options.method || "GET",
    headers: options.headers || {},
    query: { scope: "partner-delete", ...(options.query || {}) },
    body: options.body || {},
  } as unknown as VercelRequest;

  let statusCode = 200;
  const headers: Record<string, string | string[]> = {};
  let responseData: unknown = null;

  const res = {
    setHeader: (key: string, value: string | string[]) => {
      headers[key] = value;
      return res;
    },
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: unknown) => {
      responseData = data;
      return res;
    },
  } as unknown as VercelResponse;

  return {
    req,
    res,
    getStatus: () => statusCode,
    getHeaders: () => headers,
    getBody: () => responseData as Record<string, unknown>,
  };
}

describe("Cloudinary reference extraction and normalization", () => {
  it("extracts URLs from strings, HTML markup, and arrays without trailing punctuation", () => {
    const urls = extractCloudinaryUrls([
      '<p>Veja <img src="https://res.cloudinary.com/demo/image/upload/v12/uzzina/a.png" /> e (https://res.cloudinary.com/demo/video/upload/uzzina/clip.mp4).</p>',
      "https://res.cloudinary.com/demo/image/upload/v12/uzzina/a.png",
    ]);
    expect(urls).toEqual([
      "https://res.cloudinary.com/demo/image/upload/v12/uzzina/a.png",
      "https://res.cloudinary.com/demo/video/upload/uzzina/clip.mp4",
    ]);
  });

  it("normalizes transformed and versioned URLs of the same asset to identical keys", () => {
    const base = normalizeCloudinaryAssetKey(
      "https://res.cloudinary.com/dvfpxjskm/image/upload/v1731000000/uzzina/partners/logo.png",
    );
    const cropped = normalizeCloudinaryAssetKey(
      "https://res.cloudinary.com/dvfpxjskm/image/upload/x_10,y_20,w_400,h_400,c_crop/w_800,q_auto/uzzina/partners/logo.webp",
    );
    const rawPdf = normalizeCloudinaryAssetKey(
      "https://res.cloudinary.com/dvfpxjskm/raw/upload/v1731000000/uzzina/briefing.pdf",
    );

    expect(base).toBe("dvfpxjskm/image/uzzina/partners/logo");
    expect(cropped).toBe(base);
    expect(rawPdf).toBe("dvfpxjskm/raw/uzzina/briefing.pdf");
  });

  it("classifies partner assets into orphan candidates and shared-elsewhere assets", () => {
    const summary = classifyPartnerMedia(
      [
        "https://res.cloudinary.com/dvfpxjskm/image/upload/w_800,q_auto/uzzina/shared-banner.jpg",
        "https://res.cloudinary.com/dvfpxjskm/image/upload/v100/uzzina/exclusive-only.png",
      ],
      [
        "<p><img src='https://res.cloudinary.com/dvfpxjskm/image/upload/v999/uzzina/shared-banner.png'></p>",
      ],
    );

    expect(summary.totalCount).toBe(2);
    expect(summary.sharedElsewhereCount).toBe(1);
    expect(summary.orphanCandidatesCount).toBe(1);
    expect(summary.sampleOrphanUrls).toEqual([
      "https://res.cloudinary.com/dvfpxjskm/image/upload/v100/uzzina/exclusive-only.png",
    ]);
  });
});

describe("API /api/partner-delete", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-secret";
    forcedRpcError = null;

    db.people = [
      { id: "p-1", user_id: "user-admin", admin: true, visible: true },
      { id: "p-2", user_id: "user-collab", admin: false, visible: true },
      { id: "p-3", user_id: "user-inactive", admin: true, visible: false },
    ];
    db.partners = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        slug: "marca-arquivada",
        title: "Marca Arquivada",
        short: "MA",
        image:
          "https://res.cloudinary.com/dvfpxjskm/image/upload/c_fill,ar_1:1,w_800,q_auto/uzzina/partners/marca-logo.png",
        colors: ["#111111", "#ffffff"],
        archived: true,
        sow: "marketing",
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        slug: "marca-ativa",
        title: "Marca Ativa",
        short: "AT",
        image: null,
        colors: ["#222222", "#ffffff"],
        archived: false,
        sow: "socialmedia",
      },
    ];
    db.partner_topics = [
      {
        id: "topic-1",
        partner_id: "11111111-1111-4111-8111-111111111111",
        title: "Institucional",
        color: "#aa2200",
        position: 0,
      },
    ];
    db.actions = [
      {
        id: "action-excl-1",
        title: "Post exclusivo",
        date: "2026-11-10T11:00:00",
        category: "post",
        phase: "done",
        archived: false,
        partners: ["marca-arquivada"],
        topic_id: "topic-1",
        work_files: [
          "https://res.cloudinary.com/dvfpxjskm/image/upload/v10/uzzina/excl-art.png",
          "https://res.cloudinary.com/dvfpxjskm/image/upload/v10/uzzina/shared-art.png",
        ],
        content_files: null,
        description: null,
        content_description: null,
      },
      {
        id: "action-shared-1",
        title: "Campanha conjunta",
        date: "2026-11-15T11:00:00",
        category: "carousel",
        phase: "doing",
        archived: false,
        partners: ["marca-arquivada", "marca-ativa"],
        topic_id: "topic-1",
        work_files: [
          "https://res.cloudinary.com/dvfpxjskm/image/upload/w_400,q_auto/uzzina/shared-art.webp",
        ],
        content_files: null,
        description: null,
        content_description: null,
      },
    ];
    db.action_comments = [
      {
        id: "comment-1",
        action_id: "action-excl-1",
        content: "Ajustar logo",
      },
    ];
    db.notifications = [
      { id: "notif-1", action_id: "action-excl-1" },
      { id: "notif-2", action_id: "action-excl-1" },
    ];
    db.strategy_operations = [{ id: "op-1", action_id: "action-excl-1" }];
    db.clients = [
      {
        id: "client-excl",
        name: "Cliente Exclusivo",
        email: "excl@marca.com",
        active: true,
        partners: ["marca-arquivada"],
        image: null,
      },
      {
        id: "client-shared",
        name: "Cliente Compartilhado",
        email: "shared@grupo.com",
        active: true,
        partners: ["marca-arquivada", "marca-ativa"],
        image: null,
      },
    ];
    db.social_plans = [{ id: "plan-1", partner_slug: "marca-arquivada" }];
    db.social_plan_action_links = [
      { plan_id: "plan-1", suggestion_id: "sug-1", action_id: "action-excl-1" },
    ];
    db.planning_theme_requests = [
      { id: "req-1", partner_slug: "marca-arquivada" },
    ];
    db.partner_holidays = [
      {
        partner_id: "11111111-1111-4111-8111-111111111111",
        celebration_id: "cel-1",
      },
    ];
  });

  it("blocks unauthenticated, non-admin, and inactive-admin callers", async () => {
    const unauth = createMockReqRes({
      method: "GET",
      query: { slug: "marca-arquivada" },
    });
    await partnerDeleteHandler(unauth.req, unauth.res);
    expect(unauth.getStatus()).toBe(401);

    const collab = createMockReqRes({
      method: "GET",
      headers: { authorization: "Bearer collab-token" },
      query: { slug: "marca-arquivada" },
    });
    await partnerDeleteHandler(collab.req, collab.res);
    expect(collab.getStatus()).toBe(403);

    const inactive = createMockReqRes({
      method: "POST",
      headers: { authorization: "Bearer inactive-token" },
      body: {},
    });
    await partnerDeleteHandler(inactive.req, inactive.res);
    expect(inactive.getStatus()).toBe(403);
  });

  it("rejects non-archived or missing partners on preview", async () => {
    const activeRes = createMockReqRes({
      method: "GET",
      headers: { authorization: "Bearer admin-token" },
      query: { slug: "marca-ativa" },
    });
    await partnerDeleteHandler(activeRes.req, activeRes.res);
    expect(activeRes.getStatus()).toBe(409);
    expect(activeRes.getBody().code).toBe("PARTNER_NOT_ARCHIVED");

    const missingRes = createMockReqRes({
      method: "GET",
      headers: { authorization: "Bearer admin-token" },
      query: { slug: "nao-existe" },
    });
    await partnerDeleteHandler(missingRes.req, missingRes.res);
    expect(missingRes.getStatus()).toBe(404);
    expect(missingRes.getBody().code).toBe("PARTNER_NOT_FOUND");
  });

  it("builds complete categorized preview with media deduplication across transforms", async () => {
    const previewRes = createMockReqRes({
      method: "GET",
      headers: { authorization: "Bearer admin-token" },
      query: { slug: "marca-arquivada" },
    });
    await partnerDeleteHandler(previewRes.req, previewRes.res);
    expect(previewRes.getStatus()).toBe(200);

    const body = previewRes.getBody();
    expect(body.snapshot).toEqual({
      exclusiveActions: 1,
      sharedActions: 1,
      exclusiveClients: 1,
      sharedClients: 1,
    });
    expect(body.cascadesFromExclusiveActions).toEqual({
      commentsCount: 1,
      notificationsCount: 2,
      strategyOperationsCount: 1,
    });
    expect(body.sharedActions).toEqual([
      {
        id: "action-shared-1",
        title: "Campanha conjunta",
        date: "2026-11-15T11:00:00",
        phase: "doing",
        remainingPartners: ["marca-ativa"],
        clearsPartnerTopic: true,
      },
    ]);
    expect(body.planning).toEqual({
      socialPlansCount: 1,
      socialPlanActionLinksCount: 1,
      themeRequestsCount: 1,
    });
    expect(body.holidaysCount).toBe(1);
    expect(body.media).toEqual({
      totalCount: 3,
      orphanCandidatesCount: 2,
      sharedElsewhereCount: 1,
      sampleOrphanUrls: [
        "https://res.cloudinary.com/dvfpxjskm/image/upload/c_fill,ar_1:1,w_800,q_auto/uzzina/partners/marca-logo.png",
        "https://res.cloudinary.com/dvfpxjskm/image/upload/v10/uzzina/excl-art.png",
      ],
    });
  });

  it("handles optimistic count conflict, missing migration, and clean deletion", async () => {
    const conflict = createMockReqRes({
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: {
        partnerId: "11111111-1111-4111-8111-111111111111",
        slug: "marca-arquivada",
        expectedCounts: {
          exclusiveActions: 99,
          sharedActions: 1,
          exclusiveClients: 1,
          sharedClients: 1,
        },
      },
    });
    await partnerDeleteHandler(conflict.req, conflict.res);
    expect(conflict.getStatus()).toBe(409);
    expect(conflict.getBody().code).toBe("IMPACT_CHANGED");

    forcedRpcError = {
      code: "42883",
      message: "function public.delete_archived_partner does not exist",
    };
    const pendingMigration = createMockReqRes({
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: {
        partnerId: "11111111-1111-4111-8111-111111111111",
        slug: "marca-arquivada",
        expectedCounts: {
          exclusiveActions: 1,
          sharedActions: 1,
          exclusiveClients: 1,
          sharedClients: 1,
        },
      },
    });
    await partnerDeleteHandler(pendingMigration.req, pendingMigration.res);
    expect(pendingMigration.getStatus()).toBe(503);
    expect(pendingMigration.getBody().code).toBe("MIGRATION_PENDING");

    forcedRpcError = null;
    const deleted = createMockReqRes({
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: {
        partnerId: "11111111-1111-4111-8111-111111111111",
        slug: "marca-arquivada",
        expectedCounts: {
          exclusiveActions: 1,
          sharedActions: 1,
          exclusiveClients: 1,
          sharedClients: 1,
        },
      },
    });
    await partnerDeleteHandler(deleted.req, deleted.res);
    expect(deleted.getStatus()).toBe(200);
    expect(deleted.getBody().deleted).toBe(true);

    // Shared action and shared client survive without the deleted partner.
    expect(db.partners.map((p) => p.slug)).toEqual(["marca-ativa"]);
    expect(db.actions).toHaveLength(1);
    expect(db.actions[0].partners).toEqual(["marca-ativa"]);
    expect(db.clients).toHaveLength(1);
    expect(db.clients[0].partners).toEqual(["marca-ativa"]);
    expect(db.partner_topics).toHaveLength(0);
  });
});
