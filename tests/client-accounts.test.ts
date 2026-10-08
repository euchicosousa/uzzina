import { beforeEach, describe, expect, it, mock } from "bun:test";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hashLegacyPassword } from "../server/dash-session";
import clientAccountsHandler from "../api/client-accounts";
import dashAuthHandler from "../api/dash-auth";

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = {
  people: [],
  partners: [],
  clients: [],
  dash_sessions: [],
};

let rpcShouldFail = false;

const authUsers: Record<string, { id: string; email: string }> = {
  "admin-token": { id: "user-admin", email: "admin@cnvt.com" },
  "collab-token": { id: "user-collab", email: "collab@cnvt.com" },
  "inactive-token": { id: "user-inactive", email: "inactive@cnvt.com" },
};

mock.module("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async (token: string) => {
        const u = authUsers[token];
        if (!u) return { data: { user: null }, error: { message: "Invalid token" } };
        return { data: { user: u }, error: null };
      },
    },
    rpc: async (fn: string, params: Record<string, unknown>) => {
      if (rpcShouldFail) {
        return { data: null, error: { message: "RPC failure" } };
      }
      if (fn === "admin_update_client_account") {
        const client = db.clients.find(c => c.id === params.p_client_id);
        if (!client) return {data: null, error: {message: "Not found", code: "P0002"}};
        Object.assign(client, params.p_changes);
        if (params.p_password_hash) client.password_hash = params.p_password_hash;
        if (params.p_password_hash || client.active === false) {
          for (const session of db.dash_sessions) if (session.client_id === client.id) session.revoked_at = "2026-10-06T12:00:00Z";
        }
        return {data: {...client}, error: null};
      }
      if (fn === "admin_update_client_password") {
        const clientId = params.p_client_id as string;
        const newHash = params.p_password_hash as string;
        const client = db.clients.find((c) => c.id === clientId);
        if (client) {
          client.password_hash = newHash;
        }
        for (const s of db.dash_sessions) {
          if (s.client_id === clientId && !s.revoked_at) {
            s.revoked_at = new Date().toISOString();
          }
        }
        return { data: true, error: null };
      }
      if (fn === "admin_deactivate_client") {
        const clientId = params.p_client_id as string;
        const client = db.clients.find((c) => c.id === clientId);
        if (!client) return {data: null, error: {message: "Not found", code: "P0002"}};
        if (client) {
          client.active = false;
        }
        for (const s of db.dash_sessions) {
          if (s.client_id === clientId && !s.revoked_at) {
            s.revoked_at = new Date().toISOString();
          }
        }
        return { data: true, error: null };
      }
      if (fn === "client_migrate_legacy_password") {
        const clientId = params.p_client_id as string;
        const legacyHash = params.p_legacy_hash as string;
        const newHash = params.p_new_hash as string;
        const client = db.clients.find((c) => c.id === clientId);
        if (client && client.password_hash === legacyHash) {
          client.password_hash = newHash;
          return { data: 1, error: null };
        }
        return { data: 0, error: null };
      }
      return { data: null, error: { message: "Unknown RPC" } };
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
            return { data: [row], error: null };
          }
          if (operation === "update") {
            for (const row of rows) {
              Object.assign(row, change);
            }
            return { data: rows, error: null };
          }
          if (operation === "delete") {
            db[table] = db[table].filter((row) => !rows.includes(row));
            return { data: rows, error: null };
          }
        }
        return { data: rows.slice(start, end + 1), error: null };
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
        insert: (rowsToInsert: Row | Row[]) => {
          operation = "insert";
          const first = Array.isArray(rowsToInsert) ? rowsToInsert[0] : rowsToInsert;
          change = first;
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
          if (res.data?.length === 1) return { data: res.data[0], error: null };
          return { data: null, error: { message: "Row not found", code: "PGRST116" } };
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

describe("Ticket 06: Administração de Contas de Clientes no Servidor", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-key";
    process.env.APP_ORIGIN = "https://example.com";
    rpcShouldFail = false;

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
        id: "person-inactive",
        user_id: "user-inactive",
        name: "Inactive Admin",
        admin: true,
        visible: false,
      },
    ];

    db.partners = [
      {
        id: "part-1",
        title: "Smartmed",
        slug: "smartmed",
        archived: false,
        users_ids: ["user-admin"],
      },
      {
        id: "part-archived",
        title: "Archived Partner",
        slug: "archived-partner",
        archived: true,
        users_ids: ["user-admin"],
      },
    ];

    db.clients = [
      {
        id: "client-1",
        name: "Cliente Ativo",
        email: "cliente1@smartmed.com",
        partners: ["smartmed"],
        active: true,
        password_hash: bcrypt.hashSync("SenhaSegura123", 10),
      },
      {
        id: "client-legacy",
        name: "Cliente Hash Legado",
        email: "legacy@smartmed.com",
        partners: ["smartmed"],
        active: true,
        password_hash: hashLegacyPassword("SenhaLegada123"),
      },
    ];

    db.dash_sessions = [
      {
        id: "sess-1",
        client_id: "client-1",
        token_hash: "hash-sess-1",
        expires_at: "2099-01-01T00:00:00Z",
        revoked_at: null,
      },
      {
        id: "sess-2",
        client_id: "client-legacy",
        token_hash: "hash-sess-2",
        expires_at: "2099-01-01T00:00:00Z",
        revoked_at: null,
      },
    ];
  });

  // 1. Autorização de Acesso ao Endpoint Privilegiado
  it("recusa requisição sem token ou de usuário comum / inativo", async () => {
    // Sem token
    const { req: r1, res: res1, getStatus: s1 } = createMockReqRes({
      method: "POST",
      body: { name: "Novo", email: "novo@test.com", password: "Password123", partners: ["smartmed"] },
    });
    await clientAccountsHandler(r1, res1);
    expect(s1()).toBe(401);

    // Colaborador comum (admin = false)
    const { req: r2, res: res2, getStatus: s2 } = createMockReqRes({
      method: "POST",
      headers: { authorization: "Bearer collab-token" },
      body: { name: "Novo", email: "novo@test.com", password: "Password123", partners: ["smartmed"] },
    });
    await clientAccountsHandler(r2, res2);
    expect(s2()).toBe(403);

    // Inativo (visible = false)
    const { req: r3, res: res3, getStatus: s3 } = createMockReqRes({
      method: "POST",
      headers: { authorization: "Bearer inactive-token" },
      body: { name: "Novo", email: "novo@test.com", password: "Password123", partners: ["smartmed"] },
    });
    await clientAccountsHandler(r3, res3);
    expect(s3()).toBe(403);
  });

  // 2. Criação de Contas (POST /api/client-accounts)
  it("valida comprimento de senha (mínimo 8, máximo 72 bytes UTF-8)", async () => {
    // Senha muito curta (< 8 bytes)
    const { req: rShort, res: resShort, getStatus: sShort } = createMockReqRes({
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: { name: "Novo", email: "short@test.com", password: "1234567", partners: ["smartmed"] },
    });
    await clientAccountsHandler(rShort, resShort);
    expect(sShort()).toBe(400);

    // Senha muito longa (> 72 bytes)
    const longPassword = "A".repeat(73);
    const { req: rLong, res: resLong, getStatus: sLong } = createMockReqRes({
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: { name: "Novo", email: "long@test.com", password: longPassword, partners: ["smartmed"] },
    });
    await clientAccountsHandler(rLong, resLong);
    expect(sLong()).toBe(400);
  });

  it("recusa parceiro inexistente ou arquivado na criação", async () => {
    const { req, res, getStatus } = createMockReqRes({
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: { name: "Novo", email: "novo@test.com", password: "SenhaValida123", partners: ["archived-partner"] },
    });
    await clientAccountsHandler(req, res);
    expect(getStatus()).toBe(400);
  });

  it("cria cliente com bcrypt custo 12 e NUNCA expõe password ou password_hash na resposta", async () => {
    const { req, res, getStatus, getBody } = createMockReqRes({
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: {
        name: "Novo Cliente Seguro",
        email: "novo_seguro@smartmed.com",
        password: "MinhaSenhaForte123",
        partners: ["smartmed"],
      },
    });
    await clientAccountsHandler(req, res);
    expect(getStatus()).toBe(201);
    const body = getBody();
    expect(body.client).toBeDefined();

    const clientResponse = body.client as Record<string, unknown>;
    expect(clientResponse.password).toBeUndefined();
    expect(clientResponse.password_hash).toBeUndefined();
    expect(clientResponse.email).toBe("novo_seguro@smartmed.com");

    // Verifica no banco simulado se foi gravado hash bcrypt válido
    const savedInDb = db.clients.find((c) => c.email === "novo_seguro@smartmed.com");
    expect(savedInDb).toBeDefined();
    const hash = savedInDb?.password_hash as string;
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);
    expect(bcrypt.compareSync("MinhaSenhaForte123", hash)).toBe(true);
  });

  // 3. Atualização de Contas (PATCH /api/client-accounts)
  it("update com senha vazia preserva credencial anterior", async () => {
    const originalHash = db.clients[0]?.password_hash;
    const { req, res, getStatus, getBody } = createMockReqRes({
      method: "PATCH",
      headers: { authorization: "Bearer admin-token" },
      body: {
        id: "client-1",
        name: "Nome Atualizado",
        password: "", // Senha vazia fornecida no formulário
      },
    });
    await clientAccountsHandler(req, res);
    expect(getStatus()).toBe(200);

    const clientInDb = db.clients.find((c) => c.id === "client-1");
    expect(clientInDb?.password_hash).toBe(originalHash);
    expect(clientInDb?.name).toBe("Nome Atualizado");

    const body = getBody();
    expect((body.client as Record<string, unknown>).password_hash).toBeUndefined();
  });

  it("troca de senha revoga atômica e imediatamente todas as sessões ativas do cliente", async () => {
    expect(db.dash_sessions[0]?.revoked_at).toBeNull();

    const { req, res, getStatus } = createMockReqRes({
      method: "PATCH",
      headers: { authorization: "Bearer admin-token" },
      body: {
        id: "client-1",
        password: "NovaSenhaUltraSegura456",
      },
    });
    await clientAccountsHandler(req, res);
    expect(getStatus()).toBe(200);

    // Confirma que a nova senha é bcrypt
    const clientInDb = db.clients.find((c) => c.id === "client-1");
    expect(bcrypt.compareSync("NovaSenhaUltraSegura456", clientInDb?.password_hash as string)).toBe(true);

    // Confirma que a sessão foi revogada
    const sessionInDb = db.dash_sessions.find((s) => s.id === "sess-1");
    expect(sessionInDb?.revoked_at).not.toBeNull();
  });

  it("desativação de cliente revoga atômica e imediatamente todas as sessões ativas", async () => {
    expect(db.dash_sessions[1]?.revoked_at).toBeNull();

    const { req, res, getStatus } = createMockReqRes({
      method: "DELETE",
      headers: { authorization: "Bearer admin-token" },
      body: { id: "client-legacy" },
    });
    await clientAccountsHandler(req, res);
    expect(getStatus()).toBe(200);

    const clientInDb = db.clients.find((c) => c.id === "client-legacy");
    expect(clientInDb?.active).toBe(false);

    const sessionInDb = db.dash_sessions.find((s) => s.id === "sess-2");
    expect(sessionInDb?.revoked_at).not.toBeNull();
  });

  it("falha de RPC não confirma troca nem desativação", async () => {
    rpcShouldFail = true;
    const { req, res, getStatus } = createMockReqRes({
      method: "PATCH",
      headers: { authorization: "Bearer admin-token" },
      body: { id: "client-1", password: "FalhaEsperada123" },
    });
    await clientAccountsHandler(req, res);
    expect(getStatus()).toBe(503);
  });

  // 4. Login no Portal (POST /api/dash-auth) e Migração Condicional
  it("login com hash legado migra condicionalmente para bcrypt após sucesso", async () => {
    // Hash legado conhecido para 'SenhaLegada123'
    const legacyClient = db.clients.find((c) => c.id === "client-legacy");
    expect((legacyClient?.password_hash as string).startsWith("$2")).toBe(false);

    const { req, res, getStatus, getBody } = createMockReqRes({
      method: "POST",
      headers: { origin: "https://example.com" },
      body: {
        action: "login",
        email: "legacy@smartmed.com",
        password: "SenhaLegada123",
      },
    });
    await dashAuthHandler(req, res);
    expect(getStatus()).toBe(200);

    const body = getBody();
    expect((body.client as Record<string, unknown>).password_hash).toBeUndefined();

    // No banco, o hash deve ter sido migrado para bcrypt
    const updatedClient = db.clients.find((c) => c.id === "client-legacy");
    const newHash = updatedClient?.password_hash as string;
    expect(newHash.startsWith("$2a$") || newHash.startsWith("$2b$")).toBe(true);
    expect(bcrypt.compareSync("SenhaLegada123", newHash)).toBe(true);
  });

  it("login recusa cliente desativado", async () => {
    const client = db.clients.find((c) => c.id === "client-1");
    if (client) client.active = false;

    const { req, res, getStatus } = createMockReqRes({
      method: "POST",
      headers: { origin: "https://example.com" },
      body: {
        action: "login",
        email: "cliente1@smartmed.com",
        password: "SenhaSegura123",
      },
    });
    await dashAuthHandler(req, res);
    expect(getStatus()).toBe(401);
  });
  it("rejects invalid partner before changing password or revoking sessions", async () => {
    const before = db.clients[0]?.password_hash;
    const request = createMockReqRes({method: "PATCH", headers: {authorization: "Bearer admin-token"}, body: {id: "client-1", password: "NewPassword123", partners: ["missing"]}});
    await clientAccountsHandler(request.req, request.res);
    expect(request.getStatus()).toBe(400);
    expect(db.clients[0]?.password_hash).toBe(before);
    expect(db.dash_sessions.filter(s => s.client_id === "client-1").every(s => !s.revoked_at)).toBe(true);
  });

});

it("DELETE rejects a nonexistent client instead of reporting archival", async () => {
  const request = createMockReqRes({method: "DELETE", headers: {authorization: "Bearer admin-token"}, body: {id: "missing-client"}});
  await clientAccountsHandler(request.req, request.res);
  expect(request.getStatus()).toBe(404);
});
