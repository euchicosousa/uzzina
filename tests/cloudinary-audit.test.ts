import {
  deleteCloudinaryResourcesByType,
  verifyCloudinaryBackupsBatch,
  readCloudinarySelection,
} from "../server/cloudinary-admin";
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
      let pendingUpdate: Row | null = null;

      const execute = () => {
        const rows = (db[table] || []).filter((row) =>
          filters.every((filter) => filter(row)),
        );
        if (pendingUpdate) {
          for (const row of rows) {
            Object.assign(row, pendingUpdate);
          }
          return { data: rows, error: null };
        }
        return { data: rows.slice(start, end + 1), error: null };
      };

      const chain = {
        select: () => chain,
        update: (patch: Row) => {
          pendingUpdate = patch;
          return chain;
        },
        eq: (key: string, value: unknown) => {
          filters.push((row) => row[key] === value);
          return chain;
        },
        in: (key: string, values: unknown[]) => {
          filters.push((row) => values.includes(row[key]));
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

const { default: cloudinaryAuditHandler } = await import("../api/admin");

function createMockReqRes(options: {
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, string | string[]>;
  body?: unknown;
}) {
  const req = {
    method: options.method || "GET",
    headers: options.headers || {},
    query: options.query ?? { scope: "cloudinary-audit" },
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
      referencesByKey: new Map([
        [
          "dvfpxjskm/image/uzzina/content/used-cropped",
          [
            {
              source: "action_content_files",
              entityId: "act-1",
              label: "Post utilizado",
              partners: ["marca-antiga"],
            },
          ],
        ],
        [
          "dvfpxjskm/raw/uzzina/work/briefing.pdf",
          [
            {
              source: "action_work_files",
              entityId: "act-1",
              label: "Post utilizado",
              partners: ["marca-antiga"],
            },
            {
              source: "partner_image",
              entityId: "marca-antiga",
              label: "Marca Antiga",
              partners: ["marca-antiga"],
            },
          ],
        ],
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
    expect(
      report.inUseAssets.map((item) => ({
        publicId: item.publicId,
        canUnlinkFromActions: item.canUnlinkFromActions,
      })),
    ).toEqual([
      {
        publicId: "uzzina/content/used-cropped",
        canUnlinkFromActions: true,
      },
      {
        publicId: "uzzina/work/briefing.pdf",
        canUnlinkFromActions: false,
      },
    ]);
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

it("counts assets missing or represented only by backups after the deletion acknowledgment", async () => {
  const requested = [
    "uzzina/work/sumiu",
    "uzzina/work/continua",
    "uzzina/work/backup",
  ];
  const provider = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const ids = new URL(String(input)).searchParams.getAll("public_ids[]");
    expect(ids).toEqual(requested);
    if (init?.method === "DELETE") {
      return Response.json({
        deleted: Object.fromEntries(ids.map((id) => [id, "deleted"])),
      });
    }
    return Response.json({
      resources: [
        { public_id: requested[1] },
        { public_id: requested[2], placeholder: true },
      ],
    });
  }) as typeof fetch;
  const result = await deleteCloudinaryResourcesByType(
    { cloudName: "cloud", apiKey: "fixture", apiSecret: "fixture" },
    "image",
    requested,
    provider,
  );
  expect(result.deletedIds).toEqual([requested[0], requested[2]]);
  expect(result.failed).toMatchObject([{ publicId: requested[1] }]);
});

it("confirms a backup batch by public path and preserves existing or reused assets", async () => {
  const ids = ["cleared", "ambiguous", "stillbacked", "restored", "reused"];
  const rows = ids.map((id) => ({
    asset_id: id,
    public_id: "uzzina/" + id,
    resource_type: "image" as const,
    created_at: "",
    secure_url: "",
    bytes: 0,
    height: null,
    width: null,
    format: "png",
  }));
  let calls = 0;
  const provider = (async (input: RequestInfo | URL) => {
    calls += 1;
    const url = new URL(String(input));
    expect(url.searchParams.get("expression")).toContain(
      'public_id="uzzina/cleared"',
    );
    return Response.json({
      resources: [
        { ...rows[1], status: "deleted" },
        { ...rows[2], status: "deleted", backup_bytes: 1024 },
        { ...rows[3], status: "active", backup_bytes: 0 },
        {
          ...rows[4],
          asset_id: "replacement",
          status: "active",
          backup_bytes: 0,
        },
      ],
    });
  }) as typeof fetch;
  const confirmed = await verifyCloudinaryBackupsBatch(
    { cloudName: "cloud", apiKey: "fixture", apiSecret: "fixture" },
    rows,
    provider,
  );
  expect([...confirmed]).toEqual(["cleared"]);
  expect(calls).toBe(1);
});

it("rechecks the existing subset if Cloudinary rejects a batch with a missing ID", async () => {
  const asset = {
    asset_id: "present",
    public_id: "uzzina/test",
    resource_type: "image",
    type: "upload",
  };
  let calls = 0;
  const provider = (async (input: RequestInfo | URL) => {
    calls += 1;
    const url = new URL(String(input));
    if (url.searchParams.getAll("asset_ids[]").includes("absent"))
      return Response.json(
        { error: { message: "Illegal ids given" } },
        { status: 400 },
      );
    return Response.json({ resources: [asset] });
  }) as typeof fetch;
  const result = await readCloudinarySelection(
    { cloudName: "cloud", apiKey: "fixture", apiSecret: "fixture" },
    ["absent", "present"],
    provider,
  );
  expect(result.resources.map((item) => item.asset_id)).toEqual(["present"]);
  expect(calls).toBe(3);
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

  it("rejects missing or invalid scope on /api/admin", async () => {
    const missingScope = createMockReqRes({
      method: "GET",
      headers: { authorization: "Bearer admin-token" },
      query: {},
    });
    await cloudinaryAuditHandler(missingScope.req, missingScope.res);
    expect(missingScope.getStatus()).toBe(400);

    const invalidScope = createMockReqRes({
      method: "GET",
      headers: { authorization: "Bearer admin-token" },
      query: { scope: "unknown-scope" },
    });
    await cloudinaryAuditHandler(invalidScope.req, invalidScope.res);
    expect(invalidScope.getStatus()).toBe(400);
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
                public_id: "uzzina/work/backup-deleted",
                resource_type: "image",
                placeholder: true,
                bytes: 0,
                created_at: "2025-01-01T10:00:00Z",
              },
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

  it("cleans only the confirmed former-client asset and its backup versions", async () => {
    const originalFetch = globalThis.fetch;
    const id = "executetecnologia/old-file";
    const assetId = "formerasset";
    const restoredId = "anaarcanjoodontologia/restored";
    const restoredAssetId = "restoredasset";
    const media = {
      type: "upload",
      public_id: id,
      asset_id: assetId,
      resource_type: "image",
      bytes: 20,
      created_at: "2025-01-01T00:00:00Z",
    };
    const restored = {
      ...media,
      public_id: restoredId,
      asset_id: restoredAssetId,
    };
    const operations: string[] = [];
    let versionReads = 0;
    let batchReads = 0;
    let searchReads = 0;
    let fullCatalogReads = 0;
    let backupCleared = false;
    globalThis.fetch = (async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      const url = new URL(String(input));
      if (init?.method === "DELETE") {
        if (url.pathname.endsWith("/backup/" + assetId)) {
          expect(url.searchParams.getAll("version_ids[]")).toEqual([
            "version-a",
          ]);
          operations.push("backup");
          backupCleared = true;
          return Response.json({ message: "ok" });
        }
        expect(url.pathname).toMatch(/\/resources$/);
        expect(url.searchParams.getAll("asset_ids[]")).toEqual([assetId]);
        operations.push("original");
        return Response.json({ deleted: { [assetId]: "deleted" } });
      }
      if (url.pathname.endsWith("/by_asset_ids")) {
        batchReads += 1;
        return Response.json(
          { resources: [media, restored] },
          { headers: { "x-featureratelimit-remaining": "450" } },
        );
      }
      if (url.pathname.endsWith("/search")) {
        searchReads += 1;
        return Response.json(
          {
            resources: backupCleared
              ? []
              : [{ ...media, status: "deleted", backup_bytes: 20 }],
          },
          { headers: { "x-featureratelimit-remaining": "450" } },
        );
      }
      if (url.pathname.endsWith("/resources/" + assetId)) {
        expect(url.searchParams.get("versions")).toBe("true");
        versionReads += 1;
        return Response.json({
          ...media,
          placeholder: true,
          backup: !backupCleared,
          versions: backupCleared ? [] : [{ version_id: "version-a" }],
        });
      }
      if (url.searchParams.has("public_ids[]"))
        return Response.json({ resources: [{ ...media, placeholder: true }] });
      fullCatalogReads += 1;
      return Response.json({
        resources: url.pathname.includes("/image/upload")
          ? [media, restored]
          : [],
      });
    }) as typeof fetch;
    const items = [
      {
        publicId: id,
        resourceType: "image",
        assetKey: "dvfpxjskm/image/" + id,
        providerAssetId: assetId,
      },
      {
        publicId: restoredId,
        resourceType: "image",
        assetKey: "dvfpxjskm/image/" + restoredId,
        providerAssetId: restoredAssetId,
        backupOnly: true,
      },
    ];
    try {
      const oldRequest = createMockReqRes({
        method: "POST",
        headers: { authorization: "Bearer admin-token" },
        body: { items },
      });
      await cloudinaryAuditHandler(oldRequest.req, oldRequest.res);
      expect(operations).toEqual([]);
      const legacyReads = fullCatalogReads;
      const confirmed = createMockReqRes({
        method: "POST",
        headers: { authorization: "Bearer admin-token" },
        body: { items, permanentConfirmation: "EXCLUIR DEFINITIVAMENTE" },
      });
      await cloudinaryAuditHandler(confirmed.req, confirmed.res);
      expect(confirmed.getStatus()).toBe(200);
      expect(operations).toEqual(["original", "backup"]);
      expect(versionReads).toBe(1);
      expect(batchReads).toBe(1);
      expect(searchReads).toBe(2);
      expect(fullCatalogReads).toBe(legacyReads);
      expect(confirmed.getBody()).toMatchObject({
        deletedCount: 1,
        originalsAndDerivativesRemoved: 1,
        backupsCleared: 1,
        failed: [],
        skipped: [{ publicId: restoredId, reason: "not_found" }],
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("preserves originals when the reported balance cannot cover the selected backups", async () => {
    const originalFetch = globalThis.fetch;
    const asset = {
      type: "upload",
      public_id: "uzzina/content/orphan",
      resource_type: "image",
      asset_id: "orphan",
      created_at: "2025-01-01T00:00:00Z",
    };
    const reads: string[] = [];
    globalThis.fetch = (async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      const url = new URL(String(input));
      reads.push(init?.method ?? "GET");
      return Response.json(
        { resources: [{ ...asset, status: "active", backup_bytes: 500 }] },
        { headers: { "x-featureratelimit-remaining": "12" } },
      );
    }) as typeof fetch;
    try {
      const request = createMockReqRes({
        method: "POST",
        headers: { authorization: "Bearer admin-token" },
        body: {
          items: [
            {
              publicId: asset.public_id,
              resourceType: "image",
              providerAssetId: asset.asset_id,
              assetKey: "dvfpxjskm/image/" + asset.public_id,
            },
          ],
          permanentConfirmation: "EXCLUIR DEFINITIVAMENTE",
        },
      });
      await cloudinaryAuditHandler(request.req, request.res);
      expect(request.getStatus()).toBe(429);
      expect(request.getBody()).toMatchObject({
        code: "CLOUDINARY_CLEANUP_BUDGET",
      });
      expect(reads).toEqual(["GET", "GET"]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it.each([
    {
      balance: 450,
      receipt: true,
      calls: ["search", "versions", "purge"],
      cleared: 2,
    },
    {
      balance: 450,
      receipt: false,
      calls: ["search", "versions", "purge", "search"],
      cleared: 1,
    },
    { balance: 12, receipt: false, calls: ["search"], cleared: 1 },
  ])(
    "bounds version reads with provider balance $balance and explicit receipt $receipt",
    async (scenario) => {
      const originalFetch = globalThis.fetch;
      const rows = [
        { id: "backed", path: "uzzina/work/has-backup", bytes: 30 },
        { id: "zero", path: "uzzina/work/no-backup", bytes: 0 },
        { id: "linked", path: "clinicadengo/2025/4/post-em-uso", bytes: 30 },
      ].map(({ id, path, bytes }) => ({
        asset_id: id,
        public_id: path,
        type: "upload",
        resource_type: "image",
        status: "active",
        created_at: "2025-01-01T00:00:00Z",
        backup_bytes: bytes,
      }));
      const calls: string[] = [];
      globalThis.fetch = (async (
        input: RequestInfo | URL,
        init?: RequestInit,
      ) => {
        const url = new URL(String(input));
        if (url.pathname.endsWith("/by_asset_ids")) {
          return Response.json({ resources: rows });
        }
        if (url.pathname.endsWith("/search")) {
          const expression = url.searchParams.get("expression");
          calls.push("search");
          return Response.json(
            {
              resources: rows.filter(({ public_id }) =>
                expression?.includes(public_id),
              ),
            },
            {
              headers: {
                "x-featureratelimit-remaining": String(scenario.balance),
              },
            },
          );
        }
        if (
          url.pathname.endsWith("/resources/backed") &&
          url.searchParams.get("versions") === "true"
        ) {
          calls.push("versions");
          return Response.json({
            asset_id: "backed",
            versions: [{ version_id: "v1" }],
          });
        }
        if (
          url.pathname.endsWith("/backup/backed") &&
          init?.method === "DELETE"
        ) {
          calls.push("purge");
          return Response.json(
            scenario.receipt ? { deleted: ["v1"] } : { message: "ok" },
          );
        }
        calls.push("unexpected");
        return Response.json({}, { status: 500 });
      }) as typeof fetch;
      try {
        const request = createMockReqRes({
          method: "POST",
          headers: { authorization: "Bearer admin-token" },
          body: {
            backupOnlyWithOriginal: true,
            permanentConfirmation: "EXCLUIR DEFINITIVAMENTE",
            items: rows.map((row) => ({
              publicId: row.public_id,
              resourceType: row.resource_type,
              assetKey: "dvfpxjskm/image/" + row.public_id,
              providerAssetId: row.asset_id,
            })),
          },
        });
        await cloudinaryAuditHandler(request.req, request.res);
        expect(request.getStatus()).toBe(200);
        expect(calls).toEqual([...scenario.calls]);
        expect(request.getBody()).toMatchObject({
          originalsAndDerivativesRemoved: 0,
          backupsCleared: scenario.cleared,
          backupVerificationPending:
            scenario.cleared === 2 ? [] : [{ publicId: rows[0].public_id }],
          skipped: [
            {
              publicId: "clinicadengo/2025/4/post-em-uso",
              reason: "now_referenced",
            },
          ],
          failed: [],
        });
      } finally {
        globalThis.fetch = originalFetch;
      }
    },
  );

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

      if (
        method === "GET" &&
        new URL(urlStr).searchParams.has("public_ids[]")
      ) {
        return Response.json({ resources: [] });
      }

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

  it("lists in-use references and unlinks deleted action files without touching protected references", async () => {
    const originalFetch = globalThis.fetch;
    const recentCreatedAt = new Date(Date.now() - 2 * 3600_000).toISOString();
    const deletedUrls: string[] = [];

    db.partners = [
      {
        slug: "clinicadengo",
        title: "Clínica Dengo",
        image:
          "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/clinicadengo/logo-compartilhado.png",
      },
    ];
    db.actions = [
      {
        id: "act-1",
        title: "Carrossel Abril",
        partners: ["clinicadengo"],
        work_files: [
          "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/clinicadengo/2025/4/post-em-uso.jpg",
          "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/clinicadengo/2025/4/manter.jpg",
        ],
        content_files: [
          "https://res.cloudinary.com/dvfpxjskm/image/upload/w_400,c_limit/v2/clinicadengo/2025/4/post-em-uso.jpg",
          "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/clinicadengo/logo-compartilhado.png",
        ],
        description: null,
        content_description: null,
        instagram_caption: null,
        strategies: null,
      },
      {
        id: "act-2",
        title: "Post com link no texto",
        partners: ["clinicadengo"],
        work_files: [
          "https://res.cloudinary.com/dvfpxjskm/video/upload/v1/uzzina/video-recente.mp4",
        ],
        content_files: [],
        description:
          "Referência no briefing https://res.cloudinary.com/dvfpxjskm/image/upload/v1/uzzina/citado-no-texto.png",
        content_description: null,
        instagram_caption: null,
        strategies: null,
      },
    ];

    globalThis.fetch = (async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      const urlStr = String(input);
      const method = init?.method || "GET";

      if (
        method === "GET" &&
        new URL(urlStr).searchParams.has("public_ids[]")
      ) {
        return Response.json({ resources: [] });
      }

      if (method === "GET" && urlStr.includes("/resources/image/upload")) {
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
                public_id: "clinicadengo/logo-compartilhado",
                resource_type: "image",
                format: "png",
                bytes: 180_000,
                width: 500,
                height: 500,
                created_at: "2024-04-01T10:00:00Z",
                secure_url:
                  "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/clinicadengo/logo-compartilhado.png",
              },
              {
                public_id: "uzzina/citado-no-texto",
                resource_type: "image",
                format: "png",
                bytes: 90_000,
                width: 500,
                height: 500,
                created_at: "2025-01-01T10:00:00Z",
                secure_url:
                  "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/uzzina/citado-no-texto.png",
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (method === "GET" && urlStr.includes("/resources/video/upload")) {
        return new Response(
          JSON.stringify({
            resources: [
              {
                public_id: "uzzina/video-recente",
                resource_type: "video",
                format: "mp4",
                bytes: 4_500_000,
                width: 1080,
                height: 1920,
                created_at: recentCreatedAt,
                secure_url:
                  "https://res.cloudinary.com/dvfpxjskm/video/upload/v1/uzzina/video-recente.mp4",
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
              "clinicadengo/2025/4/post-em-uso": "deleted",
            },
          }),
          { status: 200 },
        );
      }

      if (method === "DELETE" && urlStr.includes("/resources/video/upload")) {
        deletedUrls.push(urlStr);
        return new Response(
          JSON.stringify({
            deleted: {
              "uzzina/video-recente": "deleted",
            },
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({}), { status: 200 });
    }) as typeof fetch;

    try {
      const auditRes = createMockReqRes({
        method: "GET",
        headers: { authorization: "Bearer admin-token" },
      });
      await cloudinaryAuditHandler(auditRes.req, auditRes.res);
      expect(auditRes.getStatus()).toBe(200);

      const auditBody = auditRes.getBody() as {
        inUseAssets: Array<{
          publicId: string;
          canUnlinkFromActions?: boolean;
          references?: Array<{ source: string; label: string }>;
        }>;
      };

      const byId = new Map(
        auditBody.inUseAssets.map((item) => [item.publicId, item]),
      );
      expect(
        byId.get("clinicadengo/2025/4/post-em-uso")?.canUnlinkFromActions,
      ).toBe(true);
      expect(byId.get("uzzina/video-recente")?.canUnlinkFromActions).toBe(true);
      expect(
        byId.get("clinicadengo/logo-compartilhado")?.canUnlinkFromActions,
      ).toBe(false);
      expect(byId.get("uzzina/citado-no-texto")?.canUnlinkFromActions).toBe(
        false,
      );

      const deleteRes = createMockReqRes({
        method: "POST",
        headers: { authorization: "Bearer admin-token" },
        body: {
          allowReferencedInActions: true,
          items: [
            {
              publicId: "clinicadengo/2025/4/post-em-uso",
              resourceType: "image",
              assetKey: "dvfpxjskm/image/clinicadengo/2025/4/post-em-uso",
            },
            {
              publicId: "uzzina/video-recente",
              resourceType: "video",
              assetKey: "dvfpxjskm/video/uzzina/video-recente",
            },
            {
              publicId: "clinicadengo/logo-compartilhado",
              resourceType: "image",
              assetKey: "dvfpxjskm/image/clinicadengo/logo-compartilhado",
            },
            {
              publicId: "uzzina/citado-no-texto",
              resourceType: "image",
              assetKey: "dvfpxjskm/image/uzzina/citado-no-texto",
            },
          ],
        },
      });
      await cloudinaryAuditHandler(deleteRes.req, deleteRes.res);
      expect(deleteRes.getStatus()).toBe(200);

      const deleteBody = deleteRes.getBody() as {
        deletedCount: number;
        freedBytes: number;
        unlinkedActionsCount: number;
        skipped: Array<{
          publicId: string;
          resourceType: string;
          assetKey: string;
          reason: string;
        }>;
        failed: Array<{ publicId: string }>;
      };

      expect(deleteBody.deletedCount).toBe(2);
      expect(deleteBody.freedBytes).toBe(4_720_000);
      expect(deleteBody.unlinkedActionsCount).toBe(2);
      expect(deleteBody.failed).toEqual([]);
      expect(deleteBody.skipped).toEqual([
        {
          publicId: "clinicadengo/logo-compartilhado",
          resourceType: "image",
          assetKey: "dvfpxjskm/image/clinicadengo/logo-compartilhado",
          reason: "protected_reference",
        },
        {
          publicId: "uzzina/citado-no-texto",
          resourceType: "image",
          assetKey: "dvfpxjskm/image/uzzina/citado-no-texto",
          reason: "protected_reference",
        },
      ]);

      expect(deletedUrls.length).toBe(2);
      expect(db.actions[0].work_files).toEqual([
        "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/clinicadengo/2025/4/manter.jpg",
      ]);
      expect(db.actions[0].content_files).toEqual([
        "https://res.cloudinary.com/dvfpxjskm/image/upload/v1/clinicadengo/logo-compartilhado.png",
      ]);
      expect(db.actions[1].work_files).toEqual([]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
