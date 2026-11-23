import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildCloudinaryAuditReport } from "../server/cloudinary-admin";

type Row = Record<string, unknown>;

const db: Record<string, Row[]> = {
  people: [],
  partners: [],
  clients: [],
  actions: [],
  action_comments: [],
  social_plans: [],
  leads: [],
};

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
    from: (table: string) => {
      const filters: ((row: Row) => boolean)[] = [];
      let start = 0;
      let end = Infinity;

      const execute = () => {
        const rows = (db[table] || []).filter((row) =>
          filters.every((filter) => filter(row)),
        );
        return { data: rows.slice(start, end + 1), error: null };
      };

      const chain = {
        select: () => chain,
        eq: (key: string, value: unknown) => {
          filters.push((row) => row[key] === value);
          return chain;
        },
        range: (from: number, to: number) => {
          start = from;
          end = to;
          return chain;
        },
        maybeSingle: async () => {
          const res = execute();
          return {
            data: res.data.length > 0 ? res.data[0] : null,
            error: null,
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

const { default: cloudinaryAuditHandler } =
  await import("../api/cloudinary-audit");

function createMockReqRes(options: {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}) {
  const req = {
    method: options.method || "GET",
    headers: options.headers || {},
    query: {},
    body: options.body ?? {},
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
    getBody: () => responseData as Record<string, unknown>,
  };
}

describe("buildCloudinaryAuditReport", () => {
  it("protects referenced, recent, and unknown-origin assets while identifying orphan candidates", () => {
    const nowMs = Date.parse("2026-11-22T20:00:00Z");
    const report = buildCloudinaryAuditReport({
      cloudName: "dvfpxjskm",
      nowMs,
      databaseSourcesChecked: ["actions.content_files"],
      referencedKeys: new Set([
        "dvfpxjskm/image/uzzina/content/used-cropped",
        "dvfpxjskm/raw/uzzina/work/briefing.pdf",
      ]),
      knownPartnerSlugs: new Set(["marca-antiga"]),
      pagesScanned: 4,
      truncated: false,
      resources: [
        {
          public_id: "uzzina/content/used-cropped",
          resource_type: "image",
          format: "png",
          bytes: 500_000,
          width: 1080,
          height: 1080,
          created_at: "2026-01-01T10:00:00Z",
          secure_url:
            "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/uzzina/content/used-cropped.png",
        },
        {
          public_id: "uzzina/work/briefing.pdf",
          resource_type: "raw",
          format: "",
          bytes: 200_000,
          width: null,
          height: null,
          created_at: "2026-01-01T10:00:00Z",
          secure_url:
            "https://res.cloudinary.com/dvfpxjskm/raw/upload/v1/uzzina/work/briefing.pdf",
        },
        {
          public_id: "marca-antiga/2024/10/post-antigo",
          resource_type: "image",
          format: "jpg",
          bytes: 1_200_000,
          width: 1080,
          height: 1350,
          created_at: "2024-10-10T10:00:00Z",
          secure_url:
            "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/marca-antiga/2024/10/post-antigo.jpg",
        },
        {
          public_id: "uzzina/content/upload-recente",
          resource_type: "video",
          format: "mp4",
          bytes: 3_000_000,
          width: 1080,
          height: 1920,
          created_at: "2026-11-22T15:00:00Z",
          secure_url:
            "https://res.cloudinary.com/dvfpxjskm/video/upload/v1/uzzina/content/upload-recente.mp4",
        },
        {
          public_id: "outro-projeto/banner",
          resource_type: "image",
          format: "webp",
          bytes: 800_000,
          width: 1200,
          height: 600,
          created_at: "2024-05-01T10:00:00Z",
          secure_url:
            "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/outro-projeto/banner.webp",
        },
      ],
    });

    expect(report.summary).toEqual({
      totalCatalogCount: 5,
      totalCatalogBytes: 5_700_000,
      inUseCount: 2,
      inUseBytes: 700_000,
      orphanCandidatesCount: 1,
      recoverableBytes: 1_200_000,
      protectedRecentCount: 1,
      protectedRecentBytes: 3_000_000,
      protectedUnknownCount: 1,
      protectedUnknownBytes: 800_000,
    });
    expect(report.orphanCandidates.map((item) => item.publicId)).toEqual([
      "marca-antiga/2024/10/post-antigo",
    ]);
    expect(report.protectedRecent.map((item) => item.publicId)).toEqual([
      "uzzina/content/upload-recente",
    ]);
    expect(report.protectedUnknown.map((item) => item.publicId)).toEqual([
      "outro-projeto/banner",
    ]);
  });
});

describe("API /api/cloudinary-audit", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-secret";
    process.env.CLOUDINARY_CLOUD_NAME = "dvfpxjskm";
    process.env.CLOUDINARY_API_KEY = "key-123";
    process.env.CLOUDINARY_API_SECRET = "secret-456";

    db.people = [
      {
        id: "p-1",
        user_id: "user-admin",
        admin: true,
        visible: true,
        image: null,
      },
      {
        id: "p-2",
        user_id: "user-collab",
        admin: false,
        visible: true,
        image: null,
      },
      {
        id: "p-3",
        user_id: "user-inactive",
        admin: true,
        visible: false,
        image: null,
      },
    ];
    db.partners = [
      {
        slug: "clinicadengo",
        image:
          "https://res.cloudinary.com/dvfpxjskm/image/upload/c_fill,ar_1:1,w_400,q_auto/uzzina/partners/logo-dengo.png",
      },
    ];
    db.clients = [{ image: null }];
    db.actions = [
      {
        work_files: null,
        content_files: [
          "https://res.cloudinary.com/dvfpxjskm/image/upload/w_800,q_auto/clinicadengo/2025/4/post-em-uso.webp",
        ],
        description: null,
        content_description: null,
        instagram_caption: null,
        strategies: null,
      },
    ];
    db.action_comments = [];
    db.social_plans = [];
    db.leads = [];
  });

  it("blocks unsupported methods, unauthenticated callers, non-admins, and inactive admins", async () => {
    const put = createMockReqRes({ method: "PUT" });
    await cloudinaryAuditHandler(put.req, put.res);
    expect(put.getStatus()).toBe(405);

    const collabPost = createMockReqRes({
      method: "POST",
      headers: { authorization: "Bearer collab-token" },
      body: { items: [] },
    });
    await cloudinaryAuditHandler(collabPost.req, collabPost.res);
    expect(collabPost.getStatus()).toBe(403);

    const unauth = createMockReqRes({ method: "GET" });
    await cloudinaryAuditHandler(unauth.req, unauth.res);
    expect(unauth.getStatus()).toBe(401);

    const collab = createMockReqRes({
      method: "GET",
      headers: { authorization: "Bearer collab-token" },
    });
    await cloudinaryAuditHandler(collab.req, collab.res);
    expect(collab.getStatus()).toBe(403);

    const inactive = createMockReqRes({
      method: "GET",
      headers: { authorization: "Bearer inactive-token" },
    });
    await cloudinaryAuditHandler(inactive.req, inactive.res);
    expect(inactive.getStatus()).toBe(403);
  });

  it("returns 503 with clear code when Cloudinary API credentials are missing", async () => {
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const res = createMockReqRes({
      method: "GET",
      headers: { authorization: "Bearer admin-token" },
    });
    await cloudinaryAuditHandler(res.req, res.res);
    expect(res.getStatus()).toBe(503);
    expect(res.getBody().code).toBe("CLOUDINARY_NOT_CONFIGURED");
  });

  it("paginates Cloudinary catalog across types, matches transformed URLs, and classifies orphans", async () => {
    const originalFetch = globalThis.fetch;
    const requestedUrls: string[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const urlStr = String(input);
      requestedUrls.push(urlStr);

      if (
        urlStr.includes("/resources/image/upload") &&
        !urlStr.includes("next_cursor")
      ) {
        return new Response(
          JSON.stringify({
            resources: [
              {
                public_id: "uzzina/partners/logo-dengo",
                resource_type: "image",
                format: "png",
                bytes: 120_000,
                width: 400,
                height: 400,
                created_at: "2025-01-01T10:00:00Z",
                secure_url:
                  "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/uzzina/partners/logo-dengo.png",
              },
            ],
            next_cursor: "page-2-cursor",
          }),
          { status: 200 },
        );
      }

      if (
        urlStr.includes("/resources/image/upload") &&
        urlStr.includes("next_cursor=page-2-cursor")
      ) {
        return new Response(
          JSON.stringify({
            resources: [
              {
                public_id: "clinicadengo/2025/4/post-em-uso",
                resource_type: "image",
                format: "jpg",
                bytes: 220_000,
                width: 1080,
                height: 1080,
                created_at: "2025-04-01T10:00:00Z",
                secure_url:
                  "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/clinicadengo/2025/4/post-em-uso.jpg",
              },
              {
                public_id: "uzzina/work/arquivo-orfao",
                resource_type: "image",
                format: "png",
                bytes: 450_000,
                width: 800,
                height: 600,
                created_at: "2025-05-01T10:00:00Z",
                secure_url:
                  "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/uzzina/work/arquivo-orfao.png",
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (urlStr.includes("/resources/video/upload")) {
        return new Response(
          JSON.stringify({
            resources: [
              {
                public_id: "outro-site/intro",
                resource_type: "video",
                format: "mp4",
                bytes: 1_500_000,
                width: 1920,
                height: 1080,
                created_at: "2024-06-01T10:00:00Z",
                secure_url:
                  "https://res.cloudinary.com/dvfpxjskm/video/upload/v1/outro-site/intro.mp4",
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ resources: [] }), { status: 200 });
    }) as typeof fetch;

    try {
      const res = createMockReqRes({
        method: "GET",
        headers: { authorization: "Bearer admin-token" },
      });
      await cloudinaryAuditHandler(res.req, res.res);
      expect(res.getStatus()).toBe(200);

      const body = res.getBody() as {
        coverage: { pagesScanned: number; truncated: boolean };
        summary: {
          totalCatalogCount: number;
          inUseCount: number;
          orphanCandidatesCount: number;
          recoverableBytes: number;
          protectedUnknownCount: number;
        };
        orphanCandidates: Array<{ publicId: string }>;
        protectedUnknown: Array<{ publicId: string }>;
      };

      expect(requestedUrls.length).toBe(4);
      expect(body.coverage.pagesScanned).toBe(4);
      expect(body.coverage.truncated).toBe(false);
      expect(body.summary).toMatchObject({
        totalCatalogCount: 4,
        inUseCount: 2,
        orphanCandidatesCount: 1,
        recoverableBytes: 450_000,
        protectedUnknownCount: 1,
      });
      expect(body.orphanCandidates.map((item) => item.publicId)).toEqual([
        "uzzina/work/arquivo-orfao",
      ]);
      expect(body.protectedUnknown.map((item) => item.publicId)).toEqual([
        "outro-site/intro",
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("rechecks database links, recent uploads, and origin before deleting, and handles partial failures", async () => {
    const originalFetch = globalThis.fetch;
    const deletedUrls: string[] = [];
    const recentCreatedAt = new Date(Date.now() - 2 * 3600_000).toISOString();

    globalThis.fetch = (async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      const urlStr = String(input);
      const method = init?.method || "GET";

      if (method === "GET" && urlStr.includes("/resources/image/upload")) {
        return new Response(
          JSON.stringify({
            resources: [
              {
                public_id: "uzzina/work/arquivo-orfao",
                resource_type: "image",
                format: "png",
                bytes: 450_000,
                width: 800,
                height: 600,
                created_at: "2025-05-01T10:00:00Z",
                secure_url:
                  "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/uzzina/work/arquivo-orfao.png",
              },
              {
                public_id: "clinicadengo/2025/4/post-em-uso",
                resource_type: "image",
                format: "jpg",
                bytes: 220_000,
                width: 1080,
                height: 1080,
                created_at: "2025-04-01T10:00:00Z",
                secure_url:
                  "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/clinicadengo/2025/4/post-em-uso.jpg",
              },
              {
                public_id: "uzzina/work/recem-enviado",
                resource_type: "image",
                format: "png",
                bytes: 100_000,
                width: 500,
                height: 500,
                created_at: recentCreatedAt,
                secure_url:
                  "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/uzzina/work/recem-enviado.png",
              },
              {
                public_id: "outro-projeto/banner",
                resource_type: "image",
                format: "png",
                bytes: 300_000,
                width: 500,
                height: 500,
                created_at: "2024-01-01T10:00:00Z",
                secure_url:
                  "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/outro-projeto/banner.png",
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (method === "GET" && urlStr.includes("/resources/raw/upload")) {
        return new Response(
          JSON.stringify({
            resources: [
              {
                public_id: "uzzina/work/falha-parcial.pdf",
                resource_type: "raw",
                format: "",
                bytes: 80_000,
                width: null,
                height: null,
                created_at: "2025-01-01T10:00:00Z",
                secure_url:
                  "https://res.cloudinary.com/dvfpxjskm/raw/upload/v1/uzzina/work/falha-parcial.pdf",
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (method === "GET") {
        return new Response(JSON.stringify({ resources: [] }), { status: 200 });
      }

      if (method === "DELETE" && urlStr.includes("/resources/image/upload")) {
        deletedUrls.push(urlStr);
        return new Response(
          JSON.stringify({
            deleted: {
              "uzzina/work/arquivo-orfao": "deleted",
            },
          }),
          { status: 200 },
        );
      }

      if (method === "DELETE" && urlStr.includes("/resources/raw/upload")) {
        deletedUrls.push(urlStr);
        return new Response("upstream error", { status: 500 });
      }

      return new Response(JSON.stringify({}), { status: 200 });
    }) as typeof fetch;

    try {
      const invalidBody = createMockReqRes({
        method: "POST",
        headers: { authorization: "Bearer admin-token" },
        body: { items: [] },
      });
      await cloudinaryAuditHandler(invalidBody.req, invalidBody.res);
      expect(invalidBody.getStatus()).toBe(400);

      const deleteRes = createMockReqRes({
        method: "POST",
        headers: { authorization: "Bearer admin-token" },
        body: {
          items: [
            {
              publicId: "uzzina/work/arquivo-orfao",
              resourceType: "image",
              assetKey: "dvfpxjskm/image/uzzina/work/arquivo-orfao",
            },
            {
              publicId: "clinicadengo/2025/4/post-em-uso",
              resourceType: "image",
              assetKey: "dvfpxjskm/image/clinicadengo/2025/4/post-em-uso",
            },
            {
              publicId: "uzzina/work/recem-enviado",
              resourceType: "image",
              assetKey: "dvfpxjskm/image/uzzina/work/recem-enviado",
            },
            {
              publicId: "outro-projeto/banner",
              resourceType: "image",
              assetKey: "dvfpxjskm/image/outro-projeto/banner",
            },
            {
              publicId: "uzzina/work/sumiu",
              resourceType: "image",
              assetKey: "dvfpxjskm/image/uzzina/work/sumiu",
            },
            {
              publicId: "uzzina/work/falha-parcial.pdf",
              resourceType: "raw",
              assetKey: "dvfpxjskm/raw/uzzina/work/falha-parcial.pdf",
            },
          ],
        },
      });
      await cloudinaryAuditHandler(deleteRes.req, deleteRes.res);
      expect(deleteRes.getStatus()).toBe(200);

      const body = deleteRes.getBody() as {
        deletedCount: number;
        freedBytes: number;
        deleted: Array<{ publicId: string }>;
        skipped: Array<{
          publicId: string;
          resourceType: string;
          assetKey: string;
          reason: string;
        }>;
        failed: Array<{ publicId: string }>;
      };

      expect(body.deletedCount).toBe(1);
      expect(body.freedBytes).toBe(450_000);
      expect(body.deleted.map((item) => item.publicId)).toEqual([
        "uzzina/work/arquivo-orfao",
      ]);
      expect(body.skipped).toEqual([
        {
          publicId: "clinicadengo/2025/4/post-em-uso",
          resourceType: "image",
          assetKey: "dvfpxjskm/image/clinicadengo/2025/4/post-em-uso",
          reason: "now_referenced",
        },
        {
          publicId: "uzzina/work/recem-enviado",
          resourceType: "image",
          assetKey: "dvfpxjskm/image/uzzina/work/recem-enviado",
          reason: "recent_upload",
        },
        {
          publicId: "outro-projeto/banner",
          resourceType: "image",
          assetKey: "dvfpxjskm/image/outro-projeto/banner",
          reason: "unknown_origin",
        },
        {
          publicId: "uzzina/work/sumiu",
          resourceType: "image",
          assetKey: "dvfpxjskm/image/uzzina/work/sumiu",
          reason: "not_found",
        },
      ]);
      expect(body.failed.map((item) => item.publicId)).toEqual([
        "uzzina/work/falha-parcial.pdf",
      ]);

      // Only the eligible image and raw file hit DELETE; protected ones never hit DELETE.
      expect(deletedUrls.length).toBe(2);
      expect(deletedUrls[0]).toContain("arquivo-orfao");
      expect(deletedUrls[0]).not.toContain("post-em-uso");
      expect(deletedUrls[0]).not.toContain("recem-enviado");
      expect(deletedUrls[0]).not.toContain("outro-projeto");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
