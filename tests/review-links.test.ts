import { beforeEach, describe, expect, it, mock } from "bun:test";
import crypto from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import reviewLinksHandler from "../api/review-links";
import reviewHandler from "../api/review";
type Row = Record<string, unknown>;
const db: Record<string, Row[]> = {
  people: [],
  partners: [],
  actions: [],
  review_links: [],
};
const authUsers: Record<
  string,
  {
    id: string;
    email: string;
  }
> = {
  "admin-token": {
    id: "user-admin",
    email: "admin@cnvt.com",
  },
  "collab-token": {
    id: "user-collab",
    email: "collab@cnvt.com",
  },
  "other-token": {
    id: "user-other",
    email: "other@cnvt.com",
  },
  "inactive-token": {
    id: "user-inactive",
    email: "inactive@cnvt.com",
  },
};
mock.module("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async (token: string) => {
        const u = authUsers[token];
        if (!u)
          return {
            data: {
              user: null,
            },
            error: {
              message: "Invalid token",
            },
          };
        return {
          data: {
            user: u,
          },
          error: null,
        };
      },
    },
    from: (table: string) => {
      const filters: ((row: Row) => boolean)[] = [];
      let change: Row | undefined;
      let operation = "read";
      let start = 0;
      let end = Infinity;
      const execute = () => {
        const rows = (db[table] || []).filter((row) =>
          filters.every((filter) => filter(row)),
        );
        if (operation !== "read") {
          if (operation === "insert") {
            const row = {
              id: change?.id || crypto.randomUUID(),
              created_at: new Date().toISOString(),
              ...change,
            };
            db[table].push(row);
            return {
              data: [row],
              error: null,
            };
          }
          if (operation === "update") {
            for (const row of rows) {
              Object.assign(row, change);
            }
            return {
              data: rows,
              error: null,
            };
          }
          if (operation === "delete") {
            db[table] = db[table].filter((row) => !rows.includes(row));
            return {
              data: rows,
              error: null,
            };
          }
        }
        return {
          data: rows.slice(start, end + 1),
          error: null,
        };
      };
      const chain = {
        select: (_columns?: string) => chain,
        eq: (key: string, value: unknown) => {
          filters.push((row) => row[key] === value);
          return chain;
        },
        is: (key: string, value: unknown) => {
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
        insert: (row: Row) => {
          operation = "insert";
          change = row;
          return chain;
        },
        update: (row: Row) => {
          operation = "update";
          change = row;
          return chain;
        },
        delete: () => {
          operation = "delete";
          return chain;
        },
        single: async () => {
          const res = execute();
          if (res.error) return res;
          if (res.data?.length === 1)
            return {
              data: res.data[0],
              error: null,
            };
          return {
            data: null,
            error: {
              message: "Row not found",
              code: "PGRST116",
            },
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
function createMockReqRes(options: {
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, string | string[]>;
  body?: unknown;
}) {
  const req = {
    method: options.method || "GET",
    headers: options.headers || {},
    query: options.query || {},
    body: options.body || {},
  } as unknown as VercelRequest;
  let statusCode = 200;
  const headers: Record<string, string | string[]> = {};
  let responseData: unknown = null;
  const res = {
    statusCode,
    setHeader: (key: string, val: string | string[]) => {
      headers[key.toLowerCase()] = val;
      return res;
    },
    status: (code: number) => {
      statusCode = code;
      res.statusCode = code;
      return res;
    },
    json: (data: unknown) => {
      responseData = data;
      return res;
    },
    end: () => res,
  } as unknown as VercelResponse;
  return {
    req,
    res,
    getStatus: () => statusCode,
    getBody: () => responseData as Record<string, unknown>,
  };
}
describe("Ticket 05: Links de Revisão Seguros e Limitados", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-key";
    db.people = [
      {
        id: "person-admin",
        user_id: "user-admin",
        name: "Admin User",
        admin: true,
        visible: true,
      },
      {
        id: "person-collab",
        user_id: "user-collab",
        name: "Collab User",
        admin: false,
        visible: true,
      },
      {
        id: "person-other",
        user_id: "user-other",
        name: "Other Collab",
        admin: false,
        visible: true,
      },
      {
        id: "person-inactive",
        user_id: "user-inactive",
        name: "Inactive User",
        admin: false,
        visible: false,
      },
    ];
    db.partners = [
      {
        id: "part-1",
        title: "Smartmed",
        slug: "smartmed",
        archived: false,
        users_ids: ["user-admin", "user-collab", "user-other"],
      },
      {
        id: "part-2",
        title: "Toro",
        slug: "toro",
        archived: false,
        users_ids: ["user-admin"],
      },
      {
        id: "part-archived",
        title: "Archived Partner",
        slug: "archived-partner",
        archived: true,
        users_ids: ["user-admin", "user-collab"],
      },
    ];
    db.actions = [
      {
        id: "act-a1",
        title: "Ação A1 (Collab responsável)",
        partners: ["smartmed"],
        responsibles: ["user-collab"],
        archived: false,
        date: "2026-10-06",
        category: "reels",
        content_description: "<p>Conteúdo A1</p>",
      },
      {
        id: "act-a2",
        title: "Ação A2 (Outro responsável)",
        partners: ["smartmed"],
        responsibles: ["user-other"],
        archived: false,
        date: "2026-10-07",
        category: "post",
        content_description: "<p>Conteúdo A2</p>",
      },
      {
        id: "act-b1",
        title: "Ação B1 (Toro)",
        partners: ["toro"],
        responsibles: ["user-admin"],
        archived: false,
        date: "2026-10-08",
        category: "stories",
      },
      {
        id: "act-archived",
        title: "Ação Arquivada",
        partners: ["smartmed"],
        responsibles: ["user-collab"],
        archived: true,
        date: "2026-10-09",
      },
    ];
    db.review_links = [];
  });

  // 1. Criação (POST /api/review-links)
  it("recusa requisição sem token ou com token inválido", async () => {
    const { req, res, getStatus } = createMockReqRes({
      method: "POST",
      body: {
        partner_slug: "smartmed",
        action_ids: ["act-a1"],
      },
    });
    await reviewLinksHandler(req, res);
    expect(getStatus()).toBe(401);
  });
  it("recusa usuário com visibilidade desativada (visible = false)", async () => {
    const { req, res, getStatus } = createMockReqRes({
      method: "POST",
      headers: {
        authorization: "Bearer inactive-token",
      },
      body: {
        partner_slug: "smartmed",
        action_ids: ["act-a1"],
      },
    });
    await reviewLinksHandler(req, res);
    expect(getStatus()).toBe(403);
  });
  it("recusa criação com lista vazia de IDs ou IDs > 100", async () => {
    const {
      req: reqEmpty,
      res: resEmpty,
      getStatus: getStatusEmpty,
    } = createMockReqRes({
      method: "POST",
      headers: {
        authorization: "Bearer admin-token",
      },
      body: {
        partner_slug: "smartmed",
        action_ids: [],
      },
    });
    await reviewLinksHandler(reqEmpty, resEmpty);
    expect(getStatusEmpty()).toBe(400);
    const manyIds = Array.from(
      {
        length: 101,
      },
      (_, i) => `id-${i}`,
    );
    const {
      req: reqMany,
      res: resMany,
      getStatus: getStatusMany,
    } = createMockReqRes({
      method: "POST",
      headers: {
        authorization: "Bearer admin-token",
      },
      body: {
        partner_slug: "smartmed",
        action_ids: manyIds,
      },
    });
    await reviewLinksHandler(reqMany, resMany);
    expect(getStatusMany()).toBe(400);
  });
  it("recusa se qualquer ação for de outro parceiro ou arquivada", async () => {
    // act-b1 pertence a toro, não a smartmed
    const { req, res, getStatus } = createMockReqRes({
      method: "POST",
      headers: {
        authorization: "Bearer admin-token",
      },
      body: {
        partner_slug: "smartmed",
        action_ids: ["act-a1", "act-b1"],
      },
    });
    await reviewLinksHandler(req, res);
    expect(getStatus()).toBe(400);

    // act-archived é arquivada
    const {
      req: reqArch,
      res: resArch,
      getStatus: getStatusArch,
    } = createMockReqRes({
      method: "POST",
      headers: {
        authorization: "Bearer admin-token",
      },
      body: {
        partner_slug: "smartmed",
        action_ids: ["act-a1", "act-archived"],
      },
    });
    await reviewLinksHandler(reqArch, resArch);
    expect(getStatusArch()).toBe(400);
  });
  it("impede colaborador de compartilhar ação em que não é responsável", async () => {
    // act-a2 tem como responsável user-other, não user-collab
    const { req, res, getStatus } = createMockReqRes({
      method: "POST",
      headers: {
        authorization: "Bearer collab-token",
      },
      body: {
        partner_slug: "smartmed",
        action_ids: ["act-a1", "act-a2"],
      },
    });
    await reviewLinksHandler(req, res);
    expect(getStatus()).toBe(403);
  });
  it("permite colaborador compartilhar apenas ações em que é responsável", async () => {
    const { req, res, getStatus, getBody } = createMockReqRes({
      method: "POST",
      headers: {
        authorization: "Bearer collab-token",
      },
      body: {
        partner_slug: "smartmed",
        action_ids: ["act-a1"],
      },
    });
    await reviewLinksHandler(req, res);
    expect(getStatus()).toBe(201);
    const body = getBody();
    expect(body.link).toBeDefined();
    expect((body.link as Record<string, unknown>).partner_slug).toBe(
      "smartmed",
    );
    expect((body.link as Record<string, unknown>).action_ids).toEqual([
      "act-a1",
    ]);
    expect((body.link as Record<string, unknown>).token).toBeDefined();
    expect((body.link as Record<string, unknown>).url).toContain(
      "/dash/review/smartmed?r=",
    );
  });
  it("permite administrador selecionar múltiplas ações acessíveis do parceiro", async () => {
    const { req, res, getStatus, getBody } = createMockReqRes({
      method: "POST",
      headers: {
        authorization: "Bearer admin-token",
      },
      body: {
        partner_slug: "smartmed",
        action_ids: ["act-a1", "act-a2"],
      },
    });
    await reviewLinksHandler(req, res);
    expect(getStatus()).toBe(201);
    const body = getBody();
    expect((body.link as Record<string, unknown>).action_ids).toEqual([
      "act-a1",
      "act-a2",
    ]);
  });

  // 2. Leitura Pública (GET /api/review)
  it("retorna exclusivamente as ações autorizadas vinculadas ao token no banco", async () => {
    // Cria link no banco para act-a1 e act-a2
    const token = "abcdef1234567890abcdef1234567890";
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
    db.review_links.push({
      id: "link-1",
      token_hash: tokenHash,
      partner_slug: "smartmed",
      action_ids: ["act-a1", "act-a2"],
      created_by: "person-admin",
      expires_at: expiresAt,
      revoked_at: null,
    });
    const { req, res, getStatus, getBody } = createMockReqRes({
      method: "GET",
      query: {
        slug: "smartmed",
        r: token,
      },
    });
    await reviewHandler(req, res);
    expect(getStatus()).toBe(200);
    const body = getBody();
    const actions = body.actions as Array<Record<string, unknown>>;
    expect(actions).toHaveLength(2);
    expect(actions.map((a) => a.id)).toEqual(["act-a1", "act-a2"]);
    expect((body.partner as Record<string, unknown>).slug).toBe("smartmed");
  });
  it("ignora IDs injetados na URL ou adulterações de parâmetros", async () => {
    const token = "token-test-tamper-123456789012345";
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    db.review_links.push({
      id: "link-tamper",
      token_hash: tokenHash,
      partner_slug: "smartmed",
      action_ids: ["act-a1"],
      // Apenas act-a1 está autorizado
      created_by: "person-admin",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      revoked_at: null,
    });

    // Invasor passa ?ids=act-b1,act-a2 na URL tentando expandir acesso
    const { req, res, getStatus, getBody } = createMockReqRes({
      method: "GET",
      query: {
        slug: "smartmed",
        r: token,
        ids: "act-b1,act-a2",
      },
    });
    await reviewHandler(req, res);
    expect(getStatus()).toBe(200);
    const body = getBody();
    const actions = body.actions as Array<Record<string, unknown>>;
    // Deve conter estritamente act-a1
    expect(actions.map((a) => a.id)).toEqual(["act-a1"]);
  });
  it("recusa acesso se o slug for adulterado", async () => {
    const token = "token-slug-mismatch-123456789012";
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    db.review_links.push({
      id: "link-mismatch",
      token_hash: tokenHash,
      partner_slug: "smartmed",
      action_ids: ["act-a1"],
      created_by: "person-admin",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      revoked_at: null,
    });
    const { req, res, getStatus } = createMockReqRes({
      method: "GET",
      query: {
        slug: "toro",
        r: token,
      }, // Slug trocado para toro
    });
    await reviewHandler(req, res);
    expect(getStatus()).toBe(404);
  });
  it("recusa link expirado ou revogado", async () => {
    // Expirado
    const expiredToken = "token-expired-1234567890123456";
    db.review_links.push({
      id: "link-exp",
      token_hash: crypto
        .createHash("sha256")
        .update(expiredToken)
        .digest("hex"),
      partner_slug: "smartmed",
      action_ids: ["act-a1"],
      created_by: "person-admin",
      expires_at: new Date(Date.now() - 1000).toISOString(),
      // no passado
      revoked_at: null,
    });
    const {
      req: reqExp,
      res: resExp,
      getStatus: getStatusExp,
    } = createMockReqRes({
      method: "GET",
      query: {
        slug: "smartmed",
        r: expiredToken,
      },
    });
    await reviewHandler(reqExp, resExp);
    expect(getStatusExp()).toBe(404);

    // Revogado
    const revokedToken = "token-revoked-1234567890123456";
    db.review_links.push({
      id: "link-rev",
      token_hash: crypto
        .createHash("sha256")
        .update(revokedToken)
        .digest("hex"),
      partner_slug: "smartmed",
      action_ids: ["act-a1"],
      created_by: "person-admin",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      revoked_at: new Date().toISOString(),
    });
    const {
      req: reqRev,
      res: resRev,
      getStatus: getStatusRev,
    } = createMockReqRes({
      method: "GET",
      query: {
        slug: "smartmed",
        r: revokedToken,
      },
    });
    await reviewHandler(reqRev, resRev);
    expect(getStatusRev()).toBe(404);
  });
  it("recusa acesso com formato legado ids sem token r", async () => {
    const { req, res, getStatus } = createMockReqRes({
      method: "GET",
      query: {
        slug: "smartmed",
        ids: "act-a1,act-a2",
      },
    });
    await reviewHandler(req, res);
    expect(getStatus()).toBe(404);
  });

  // 3. Revogação (DELETE /api/review-links)
  it("permite ao criador ativo ou admin revogar link, e impede outros colaboradores", async () => {
    const token = "token-to-revoke-123456789012345";
    db.review_links.push({
      id: "link-revoke-target",
      token_hash: crypto.createHash("sha256").update(token).digest("hex"),
      partner_slug: "smartmed",
      action_ids: ["act-a1"],
      created_by: "person-collab",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      revoked_at: null,
    });

    // Outro colaborador tenta revogar
    const {
      req: reqOther,
      res: resOther,
      getStatus: getStatusOther,
    } = createMockReqRes({
      method: "DELETE",
      headers: {
        authorization: "Bearer other-token",
      },
      body: {
        id: "link-revoke-target",
      },
    });
    await reviewLinksHandler(reqOther, resOther);
    expect(getStatusOther()).toBe(403);

    // Criador revoga
    const {
      req: reqOwner,
      res: resOwner,
      getStatus: getStatusOwner,
    } = createMockReqRes({
      method: "DELETE",
      headers: {
        authorization: "Bearer collab-token",
      },
      body: {
        id: "link-revoke-target",
      },
    });
    await reviewLinksHandler(reqOwner, resOwner);
    expect(getStatusOwner()).toBe(200);
    const updated = db.review_links.find((l) => l.id === "link-revoke-target");
    expect(updated?.revoked_at).toBeDefined();
    expect(updated?.revoked_at).not.toBeNull();
  });
});
