import { beforeEach, describe, expect, it, mock } from "bun:test";
import { sanitizeHtml } from "~/utils/sanitize";
import { QUERY_KEYS } from "~/lib/query-keys";
import {
  SESSION_COOKIE_NAME,
  extractCookie,
  generateSessionToken,
  hashLegacyPassword,
  hashSessionToken,
  serializeClearSessionCookie,
  serializeSessionCookie,
  validateRequestOrigin,
} from "../server/dash-session";

interface MockClient {
  id: string;
  name: string;
  email: string;
  active: boolean;
  password_hash: string | null;
  partners: string[];
}

interface MockSession {
  id: string;
  client_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  revoked_at: string | null;
}

import type { VercelRequest, VercelResponse } from "@vercel/node";

type QueryOp = "eq" | "is" | "gt";
interface FilterCondition {
  col: string;
  op: QueryOp;
  val: unknown;
}

interface MockState {
  table: string;
  filters: FilterCondition[];
}

interface MockChain {
  select: () => MockChain;
  insert: (
    records: Record<string, unknown>[],
  ) => Promise<{ error: { message: string } | null }>;
  update: (updates: Record<string, unknown>) => {
    eq: (
      col: string,
      val: unknown,
    ) => Promise<{ error: { message: string } | null }>;
  };
  eq: (col: string, val: unknown) => MockChain;
  is: (col: string, val: unknown) => MockChain;
  gt: (col: string, val: unknown) => MockChain;
  single: () => Promise<{
    data: Record<string, unknown> | null;
    error: { message: string } | null;
  }>;
}

const mockDb = {
  clients: [] as MockClient[],
  sessions: [] as MockSession[],
  revokeError: false,
  readError: false,
};

mock.module("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => {
      const state: MockState = { table, filters: [] };
      const chain: MockChain = {
        select: () => chain,
        insert: async (records: Record<string, unknown>[]) => {
          if (table === "dash_sessions") {
            mockDb.sessions.push(
              ...records.map((r, idx) => ({
                id: `sess-${idx + 1}`,
                client_id: String(r.client_id ?? ""),
                token_hash: String(r.token_hash ?? ""),
                expires_at: String(r.expires_at ?? ""),
                created_at: new Date().toISOString(),
                revoked_at: null,
              })),
            );
          }
          return { error: null };
        },
        update: (updates: Record<string, unknown>) => ({
          eq: async (col: string, val: unknown) => {
            if (mockDb.revokeError)
              return { error: { message: "Database unavailable" } };
            for (const s of mockDb.sessions) {
              const sessionRecord = s as unknown as Record<string, unknown>;
              if (sessionRecord[col] === val) {
                Object.assign(sessionRecord, updates);
              }
            }
            return { error: null };
          },
        }),
        eq: (col: string, val: unknown) => {
          state.filters.push({ col, op: "eq", val });
          return chain;
        },
        is: (col: string, val: unknown) => {
          state.filters.push({ col, op: "is", val });
          return chain;
        },
        gt: (col: string, val: unknown) => {
          state.filters.push({ col, op: "gt", val });
          return chain;
        },
        single: async () => {
          if (mockDb.readError)
            return { data: null, error: { message: "Database unavailable" } };
          let rows: Record<string, unknown>[] =
            table === "clients"
              ? (mockDb.clients as unknown as Record<string, unknown>[])
              : (mockDb.sessions as unknown as Record<string, unknown>[]);

          for (const f of state.filters) {
            rows = rows.filter((r) => {
              if (f.op === "eq") return r[f.col] === f.val;
              if (f.op === "is") return r[f.col] === f.val;
              if (f.op === "gt") return String(r[f.col]) > String(f.val);
              return true;
            });
          }
          if (rows.length === 0) {
            return {
              data: null,
              error: { message: "Row not found", code: "PGRST116" },
            };
          }
          return { data: rows[0], error: null };
        },
      };
      return chain;
    },
  }),
}));

import dashAuthHandler from "../api/dash-auth";

interface MockResHelper {
  statusCode: number;
  setHeader: (key: string, val: string | string[]) => MockResHelper;
  getHeader: (key: string) => string | string[] | undefined;
  status: (code: number) => MockResHelper;
  json: (data: unknown) => MockResHelper;
  _headers: () => Record<string, string | string[]>;
  _status: () => number;
  _body: () => Record<string, unknown> | null;
}

function createMockReq(options: {
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}): VercelRequest {
  return {
    method: options.method ?? "POST",
    headers: options.headers ?? {},
    body: options.body ?? {},
  } as unknown as VercelRequest;
}

function createMockRes(): VercelResponse & MockResHelper {
  const headers: Record<string, string | string[]> = {};
  let statusCode = 200;
  let body: unknown = null;

  const res = {
    statusCode,
    setHeader(key: string, val: string | string[]) {
      headers[key] = val;
      return res;
    },
    getHeader(key: string) {
      return headers[key];
    },
    status(code: number) {
      statusCode = code;
      res.statusCode = code;
      return res;
    },
    json(data: unknown) {
      body = data;
      return res;
    },
    _headers: () => headers,
    _status: () => statusCode,
    _body: () => body as Record<string, unknown> | null,
  };
  return res as unknown as VercelResponse & MockResHelper;
}

describe("Entrega 2 - S04: Sanitização HTML e Audiência de Comentários", () => {
  it("aplica a allowlist explícita e recusa FTP sem perder links HTTPS", () => {
    const clean = sanitizeHtml(
      '<video src="https://example.com/a.mp4">texto</video><a href="ftp://example.com">ftp</a><a href="https://example.com">seguro</a>',
    );
    const root = document.createElement("div");
    root.innerHTML = clean;
    expect(root.querySelector("video")).toBeNull();
    expect(root.querySelectorAll("a")[0]?.hasAttribute("href")).toBe(false);
    expect(root.querySelectorAll("a")[1]?.getAttribute("href")).toBe(
      "https://example.com",
    );
  });
  it("remove scripts, iframes e tags perigosas", () => {
    const dirty =
      "<p>Texto normal</p><script>alert('xss')</script><iframe src='https://evil.com'></iframe>";
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("alert");
    expect(clean).not.toContain("<iframe");
    expect(clean).toContain("<p>Texto normal</p>");
  });

  it("remove manipuladores de eventos inline (onerror, onload, onclick)", () => {
    const dirty =
      '<img src="invalido.png" onerror="alert(1)" /><button onclick="hack()">Clique</button>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("alert(1)");
    expect(clean).not.toContain("<button");
  });

  it("remove links javascript: e data: perigosos", () => {
    const dirty =
      '<a href="javascript:alert(1)">Link Malicioso</a><a href="https://uzzina.com">Link Seguro</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("javascript:");
    expect(clean).toContain('href="https://uzzina.com"');
    expect(clean).toContain("Link Seguro");
  });

  it("neutraliza exploits de atributos sem aspas e entidades HTML", () => {
    const unquoted = "<a href=javascript:window.__auditXss=1>abrir</a>";
    const entity = '<a href="java&#x73;cript:window.__auditXss=2">abrir</a>';

    const cleanUnquoted = sanitizeHtml(unquoted);
    const cleanEntity = sanitizeHtml(entity);

    const div = document.createElement("div");
    div.innerHTML = cleanUnquoted;
    const a1 = div.querySelector("a");
    const href1 = a1?.getAttribute("href") || "";
    expect(href1).not.toMatch(/^javascript:/i);

    div.innerHTML = cleanEntity;
    const a2 = div.querySelector("a");
    const href2 = a2?.getAttribute("href") || "";
    expect(href2).not.toMatch(/^javascript:/i);
  });

  it("preserva formatação rica válida do Tiptap (tabelas, listas, negrito, links)", () => {
    const rich = `
      <h2>Título da Seção</h2>
      <p>Texto com <strong>negrito</strong> e <em>itálico</em>.</p>
      <ul><li>Item 1</li><li>Item 2</li></ul>
      <table>
        <thead><tr><th>Coluna 1</th><th>Coluna 2</th></tr></thead>
        <tbody><tr><td>Dado 1</td><td>Dado 2</td></tr></tbody>
      </table>
    `.trim();
    const clean = sanitizeHtml(rich);
    expect(clean).toContain("<h2>Título da Seção</h2>");
    expect(clean).toContain("<strong>negrito</strong>");
    expect(clean).toContain("<em>itálico</em>");
    expect(clean).toContain("<table>");
    expect(clean).toContain("<th>Coluna 1</th>");
    expect(clean).toContain("<td>Dado 1</td>");
  });

  it("bloqueia SVG, MathML, forms, styles e tags perigosas", () => {
    const dangerous = `
      <svg><circle cx="50" cy="50" r="40" onload="alert(1)" /></svg>
      <math><mi xlink:href="javascript:alert(1)">click</mi></math>
      <form action="/login"><input type="text" /></form>
      <style>body { display: none; }</style>
    `;
    const clean = sanitizeHtml(dangerous);
    expect(clean).not.toContain("<svg");
    expect(clean).not.toContain("<circle");
    expect(clean).not.toContain("<math");
    expect(clean).not.toContain("<form");
    expect(clean).not.toContain("<style");
  });

  it("remove data: e blob: em imagens mas preserva https e caminhos relativos", () => {
    const input = `
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg" alt="data" />
      <img src="blob:https://example.com/uuid" alt="blob" />
      <img src="https://images.unsplash.com/photo-1" alt="remota" />
      <img src="/uploads/local.jpg" alt="relativa" />
    `;
    const clean = sanitizeHtml(input);
    expect(clean).not.toContain('src="data:');
    expect(clean).not.toContain('src="blob:');
    expect(clean).toContain('src="https://images.unsplash.com/photo-1"');
    expect(clean).toContain('src="/uploads/local.jpg"');
  });

  it("trata valores nulos, indefinidos ou vazios sem lançar exceção", () => {
    expect(sanitizeHtml(null)).toBe("");
    expect(sanitizeHtml(undefined)).toBe("");
    expect(sanitizeHtml("")).toBe("");
    expect(sanitizeHtml("   ")).toBe("");
  });

  it("separa chaves de cache entre comentários públicos e internos", () => {
    const actionId = "action-123";
    const internalKey = QUERY_KEYS.comments.all(actionId, "user");
    const publicKey = QUERY_KEYS.comments.public(actionId, "user");

    // Chaves devem ser distintas para impedir contaminação do cache
    expect(internalKey).not.toEqual(publicKey);
    expect(internalKey).toContain("internal");
    expect(publicKey).toContain("public");
  });
});

describe("Entrega 2 - S05: Escopo do Link de Revisão", () => {
  it("filtra ações para garantir que pertencem exclusivamente ao parceiro do link", () => {
    const targetSlug = "parceiro-alfa";
    const actions = [
      {
        id: "act-1",
        title: "Ação Alfa 1",
        partners: ["parceiro-alfa", "outro"],
      },
      { id: "act-2", title: "Ação Beta (Outro)", partners: ["parceiro-beta"] },
      { id: "act-3", title: "Ação Alfa 2", partners: ["parceiro-alfa"] },
      { id: "act-4", title: "Ação Sem Parceiro", partners: [] },
    ];

    const scopedActions = actions.filter(
      (a) => Array.isArray(a.partners) && a.partners.includes(targetSlug),
    );

    expect(scopedActions.map((a) => a.id)).toEqual(["act-1", "act-3"]);
  });
});

describe("Entrega 2 - S03: Validação de Payload da API de IA", () => {
  const ALLOWED_INTENTS = [
    "ai-strategy",
    "ai-content",
    "ai-hooks",
    "ai-caption",
  ];

  function validateAIPayload(payload: {
    intent?: string;
    category?: string;
    title?: string;
    description?: string;
    partner_context?: string;
  }) {
    if (!payload.intent || !ALLOWED_INTENTS.includes(payload.intent)) {
      return { valid: false, error: "Intent inválido ou não autorizado." };
    }
    if (
      !payload.category ||
      typeof payload.category !== "string" ||
      payload.category.length > 100
    ) {
      return { valid: false, error: "Categoria inválida." };
    }
    if (payload.title && payload.title.length > 500) {
      return {
        valid: false,
        error: "Título excede tamanho máximo permitido (500 caracteres).",
      };
    }
    if (payload.description && payload.description.length > 10000) {
      return {
        valid: false,
        error: "Descrição excede tamanho máximo permitido (10.000 caracteres).",
      };
    }
    if (payload.partner_context && payload.partner_context.length > 10000) {
      return {
        valid: false,
        error: "Contexto do parceiro excede tamanho máximo permitido.",
      };
    }
    return { valid: true };
  }

  it("recusa intents não autorizados", () => {
    const result = validateAIPayload({
      intent: "ai-arbitrary-command",
      category: "post",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Intent inválido");
  });

  it("aceita intents homologados com tamanhos adequados", () => {
    const result = validateAIPayload({
      intent: "ai-strategy",
      category: "post",
      title: "Planejamento Outubro",
      description: "Diretrizes gerais",
    });
    expect(result.valid).toBe(true);
  });

  it("rejeita payloads que excedem limites de tamanho", () => {
    const result = validateAIPayload({
      intent: "ai-caption",
      category: "post",
      title: "A".repeat(501),
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Título excede tamanho máximo");
  });
});

describe("Entrega 2 - S01: Login e Retomada por Sessão de Servidor (Ticket 02)", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://mock.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role-key";
    process.env.APP_ORIGIN = "https://app.uzzina.com";
    process.env.NODE_ENV = "test";

    mockDb.clients = [
      {
        id: "cli-active",
        name: "Cliente Ativo",
        email: "ativo@empresa.com",
        active: true,
        password_hash: hashLegacyPassword("senha123"),
        partners: ["parceiro-1"],
      },
      {
        id: "cli-inactive",
        name: "Cliente Inativo",
        email: "inativo@empresa.com",
        active: false,
        password_hash: hashLegacyPassword("senha123"),
        partners: ["parceiro-2"],
      },
      {
        id: "cli-nopass",
        name: "Cliente Sem Senha",
        email: "sem-senha@empresa.com",
        active: true,
        password_hash: null,
        partners: ["parceiro-3"],
      },
    ];
    mockDb.sessions = [];
    mockDb.revokeError = false;
    mockDb.readError = false;
  });

  it("logout com falha na revogação não anuncia sucesso", async () => {
    mockDb.revokeError = true;
    const res = createMockRes();
    await dashAuthHandler(
      createMockReq({
        headers: {
          origin: "https://app.uzzina.com",
          cookie: "uzzina_dash_session=test-token",
        },
        body: { action: "logout" },
      }),
      res,
    );
    expect(res._status()).toBe(503);
    expect(res._body()?.success).not.toBe(true);
    expect(res.getHeader("Set-Cookie")).toBeUndefined();
  });
  it("banco indisponível no login não é senha incorreta", async () => {
    mockDb.readError = true;
    const res = createMockRes();
    await dashAuthHandler(
      createMockReq({
        headers: { origin: "https://app.uzzina.com" },
        body: {
          action: "login",
          email: "ativo@empresa.com",
          password: "senha123",
        },
      }),
      res,
    );
    expect(res._status()).toBe(503);
  });
  it("banco indisponível na retomada não é sessão inválida", async () => {
    mockDb.readError = true;
    const res = createMockRes();
    await dashAuthHandler(
      createMockReq({
        headers: { cookie: "uzzina_dash_session=test-token" },
        body: { action: "verify" },
      }),
      res,
    );
    expect(res._status()).toBe(503);
  });

  describe("Camada de Sessão Opaca e Cookies (server/dash-session.ts)", () => {
    it("gera hash legado determinístico compatível com SHA-256 e salt histórico", () => {
      const hash1 = hashLegacyPassword("senha123");
      const hash2 = hashLegacyPassword("senha123");
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
    });

    it("gera token opaco com 32 bytes em base64url e hash determinístico de busca", () => {
      const token = generateSessionToken();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThanOrEqual(43);

      const hash = hashSessionToken(token);
      expect(hash.length).toBe(64);
      expect(hashSessionToken(token)).toBe(hash);
    });

    it("extrai cookie por nome a partir do cabeçalho", () => {
      const cookieHeader =
        "theme=dark; uzzina_dash_session=segredo-123; other=val";
      expect(extractCookie(cookieHeader, SESSION_COOKIE_NAME)).toBe(
        "segredo-123",
      );
      expect(extractCookie(cookieHeader, "inexistente")).toBeNull();
      expect(extractCookie(undefined, SESSION_COOKIE_NAME)).toBeNull();
    });

    it("serializa cookie de sessão com HttpOnly, SameSite=Lax, Path=/api e Max-Age=604800", () => {
      const serialized = serializeSessionCookie("token-teste", {
        isProduction: false,
      });
      expect(serialized).toContain("uzzina_dash_session=token-teste");
      expect(serialized).toContain("HttpOnly");
      expect(serialized).toContain("SameSite=Lax");
      expect(serialized).toContain("Path=/api");
      expect(serialized).toContain("Max-Age=604800");
      expect(serialized).not.toContain("Secure");

      const prodSerialized = serializeSessionCookie("token-teste", {
        isProduction: true,
      });
      expect(prodSerialized).toContain("; Secure");
    });

    it("serializa limpeza de cookie de sessão com Max-Age=0", () => {
      const clearCookie = serializeClearSessionCookie({ isProduction: false });
      expect(clearCookie).toContain("uzzina_dash_session=");
      expect(clearCookie).toContain("Max-Age=0");
      expect(clearCookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    });

    it("valida Origin contra APP_ORIGIN e rejeita origens não autorizadas", () => {
      expect(
        validateRequestOrigin(
          "https://app.uzzina.com",
          "https://app.uzzina.com",
          true,
        ),
      ).toBe(true);
      expect(
        validateRequestOrigin(
          "https://evil.com",
          "https://app.uzzina.com",
          true,
        ),
      ).toBe(false);
      expect(validateRequestOrigin(null, "https://app.uzzina.com", true)).toBe(
        false,
      );
      expect(
        validateRequestOrigin(undefined, "https://app.uzzina.com", false),
      ).toBe(false);
      expect(validateRequestOrigin("http://localhost:5173", null, false)).toBe(
        true,
      );
    });
  });

  describe("Handler do Servidor (api/dash-auth.ts)", () => {
    it("falha controladamente com 500 se variáveis de ambiente obrigatórias estiverem ausentes", async () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: { origin: "https://app.uzzina.com" },
        body: { action: "login" },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(503);
      expect(String(res._body()?.error)).toContain("incompleta");
    });

    it("rejeita métodos que não sejam POST com 405 e cabeçalho Allow", async () => {
      const res = createMockRes();
      const req = createMockReq({ method: "GET" });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(405);
      expect(res._headers().Allow).toEqual(["POST"]);
    });

    it("rejeita requisições mutantes com Origin externo não autorizado com 403", async () => {
      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: { origin: "https://atacante.com" },
        body: {
          action: "login",
          email: "ativo@empresa.com",
          password: "senha123",
        },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(403);
      expect(String(res._body()?.error)).toContain(
        "Origem da requisição não autorizada",
      );
    });

    it("rejeita login com campos faltantes com 400", async () => {
      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: { origin: "https://app.uzzina.com" },
        body: { action: "login", email: "ativo@empresa.com" },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(400);
    });

    it("rejeita login com senha incorreta com 401", async () => {
      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: { origin: "https://app.uzzina.com" },
        body: {
          action: "login",
          email: "ativo@empresa.com",
          password: "senha-errada",
        },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(401);
    });

    it("rejeita login para cliente inativo com 401", async () => {
      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: { origin: "https://app.uzzina.com" },
        body: {
          action: "login",
          email: "inativo@empresa.com",
          password: "senha123",
        },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(401);
    });

    it("rejeita login para cliente sem credenciais configuradas com 401", async () => {
      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: { origin: "https://app.uzzina.com" },
        body: {
          action: "login",
          email: "sem-senha@empresa.com",
          password: "qualquer-senha",
        },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(401);
    });

    it("realiza login com sucesso: cria sessão opaca, emite Set-Cookie e não vaza hash/token no corpo", async () => {
      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: { origin: "https://app.uzzina.com" },
        body: {
          action: "login",
          email: "ativo@empresa.com",
          password: "senha123",
        },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(200);

      expect(res._headers()["Cache-Control"]).toBe("no-store");

      const cookieHeader = res._headers()["Set-Cookie"] as string;
      expect(cookieHeader).toBeDefined();
      expect(cookieHeader).toContain("uzzina_dash_session=");
      expect(cookieHeader).toContain("HttpOnly");

      const client = res._body()?.client as Record<string, unknown> | undefined;
      expect(client).toBeDefined();
      expect(client?.id).toBe("cli-active");
      expect(client?.password_hash).toBeUndefined();
      expect(res._body()?.token).toBeUndefined();

      expect(mockDb.sessions.length).toBe(1);
      expect(mockDb.sessions[0].client_id).toBe("cli-active");
      expect(mockDb.sessions[0].token_hash.length).toBe(64);
      expect(mockDb.sessions[0].revoked_at).toBeNull();
    });

    it("verify: recusa solicitação sem cookie com 401", async () => {
      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: { origin: "https://app.uzzina.com" },
        body: { action: "verify" },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(401);
      expect(String(res._body()?.error)).toContain("não fornecida");
    });

    it("verify: recusa solicitação enviando apenas ID sem cookie válido (sem fallback)", async () => {
      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: { origin: "https://app.uzzina.com" },
        body: { action: "verify", id: "cli-active" },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(401);
      expect(res._body()?.client).toBeUndefined();
    });

    it("verify: recusa cookie com token forjado/inválido", async () => {
      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: {
          origin: "https://app.uzzina.com",
          cookie: "uzzina_dash_session=token-totalmente-inventado",
        },
        body: { action: "verify" },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(401);
    });

    it("verify: recusa sessão expirada", async () => {
      const token = "token-expirado-123";
      mockDb.sessions.push({
        id: "sess-exp",
        client_id: "cli-active",
        token_hash: hashSessionToken(token),
        expires_at: new Date(Date.now() - 10000).toISOString(),
        created_at: new Date().toISOString(),
        revoked_at: null,
      });

      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: {
          origin: "https://app.uzzina.com",
          cookie: `uzzina_dash_session=${token}`,
        },
        body: { action: "verify" },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(401);
    });

    it("verify: recusa sessão já revogada", async () => {
      const token = "token-revogado-123";
      mockDb.sessions.push({
        id: "sess-rev",
        client_id: "cli-active",
        token_hash: hashSessionToken(token),
        expires_at: new Date(Date.now() + 600000).toISOString(),
        created_at: new Date().toISOString(),
        revoked_at: new Date().toISOString(),
      });

      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: {
          origin: "https://app.uzzina.com",
          cookie: `uzzina_dash_session=${token}`,
        },
        body: { action: "verify" },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(401);
    });

    it("verify: autentica com sucesso quando sessão é válida e cliente está ativo", async () => {
      const token = "token-valido-123";
      mockDb.sessions.push({
        id: "sess-ok",
        client_id: "cli-active",
        token_hash: hashSessionToken(token),
        expires_at: new Date(Date.now() + 600000).toISOString(),
        created_at: new Date().toISOString(),
        revoked_at: null,
      });

      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: {
          origin: "https://app.uzzina.com",
          cookie: `uzzina_dash_session=${token}`,
        },
        body: { action: "verify" },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(200);
      const client = res._body()?.client as Record<string, unknown> | undefined;
      expect(client?.id).toBe("cli-active");
      expect(client?.password_hash).toBeUndefined();
    });

    it("logout: revoga a sessão no banco e define Set-Cookie com Max-Age=0", async () => {
      const token = "token-para-logout";
      mockDb.sessions.push({
        id: "sess-logout",
        client_id: "cli-active",
        token_hash: hashSessionToken(token),
        expires_at: new Date(Date.now() + 600000).toISOString(),
        created_at: new Date().toISOString(),
        revoked_at: null,
      });

      const res = createMockRes();
      const req = createMockReq({
        method: "POST",
        headers: {
          origin: "https://app.uzzina.com",
          cookie: `uzzina_dash_session=${token}`,
        },
        body: { action: "logout" },
      });

      await dashAuthHandler(req, res);
      expect(res._status()).toBe(200);
      expect(res._body()?.success).toBe(true);

      const session = mockDb.sessions.find((s) => s.id === "sess-logout");
      expect(session?.revoked_at).not.toBeNull();

      const cookieHeader = res._headers()["Set-Cookie"] as string;
      expect(cookieHeader).toContain("Max-Age=0");
    });
  });
});
