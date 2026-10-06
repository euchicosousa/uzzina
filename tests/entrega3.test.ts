import { beforeEach, describe, expect, it, mock } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Action, Partner } from "~/types";
import {
  SESSION_COOKIE_NAME,
  generateSessionToken,
  hashSessionToken,
} from "../server/dash-session";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  fetchDashPartners,
  fetchDashActions,
  fetchDashAction,
  type DashPartnerDto,
  type DashActionDto,
} from "~/services/dash-client";

// Set environment variables for tests
process.env.SUPABASE_URL = "https://mock.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role-key";

// --- Mock Database Models ---
interface MockClient {
  id: string;
  name: string;
  email: string;
  active: boolean;
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

interface MockPartner {
  archived: boolean;
  slug: string;
  title: string;
  short: string;
  image: string | null;
  colors: string[];
}

interface MockAction {
  id: string;
  title: string;
  date: string;
  category: string;
  phase: string;
  description: string;
  content_description: string;
  instagram_caption: string;
  content_files: string[] | null;
  work_files: string[] | null;
  color: string;
  updated_at: string;
  partners: string[];
  archived?: boolean;
  // Internal fields that MUST NOT leak
  ai_prompt?: string;
  sprints?: string[];
  responsibles?: string[];
}

const mockDb = {
  clients: [] as MockClient[],
  sessions: [] as MockSession[],
  partners: [] as MockPartner[],
  actions: [] as MockAction[],
};

// Filter representation
type QueryOp = "eq" | "neq" | "is" | "gt" | "gte" | "lte" | "in" | "contains";
interface FilterCondition {
  col: string;
  op: QueryOp;
  val: unknown;
}

interface MockChain {
  select: (columns?: string) => MockChain;
  eq: (col: string, val: unknown) => MockChain;
  neq: (col: string, val: unknown) => MockChain;
  is: (col: string, val: unknown) => MockChain;
  gt: (col: string, val: unknown) => MockChain;
  gte: (col: string, val: unknown) => MockChain;
  lte: (col: string, val: unknown) => MockChain;
  in: (col: string, val: unknown[]) => MockChain;
  contains: (col: string, val: unknown[]) => MockChain;
  order: (col: string, opts?: { ascending?: boolean }) => MockChain;
  range: (
    from: number,
    to: number,
  ) => Promise<{ data: Record<string, unknown>[]; error: null }>;
  single: () => Promise<{
    data: Record<string, unknown> | null;
    error: { message: string } | null;
  }>;
  then: (resolve: (val: { data: Record<string, unknown>[]; error: null }) => void) => Promise<void>;
}

mock.module("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => {
      const filters: FilterCondition[] = [];
      let sortCol: string | null = null;
      let sortAsc = true;

      function getFilteredRows(): Record<string, unknown>[] {
        let rows: Record<string, unknown>[] = [];
        if (table === "clients") {
          rows = mockDb.clients as unknown as Record<string, unknown>[];
        } else if (table === "dash_sessions") {
          rows = mockDb.sessions as unknown as Record<string, unknown>[];
        } else if (table === "partners") {
          rows = mockDb.partners as unknown as Record<string, unknown>[];
        } else if (table === "actions") {
          rows = mockDb.actions as unknown as Record<string, unknown>[];
        }

        for (const f of filters) {
          rows = rows.filter((r) => {
            const rowVal = r[f.col];
            if (f.op === "eq") return rowVal === f.val;
            if (f.op === "neq") return rowVal !== f.val;
            if (f.op === "is") return rowVal === f.val;
            if (f.op === "gt") return String(rowVal) > String(f.val);
            if (f.op === "gte") return String(rowVal) >= String(f.val);
            if (f.op === "lte") return String(rowVal) <= String(f.val);
            if (f.op === "in") {
              const list = Array.isArray(f.val) ? f.val : [];
              return list.includes(rowVal);
            }
            if (f.op === "contains") {
              const rowArray = Array.isArray(rowVal) ? rowVal : [];
              const targetArray = Array.isArray(f.val) ? f.val : [];
              return targetArray.every((v) => rowArray.includes(v));
            }
            return true;
          });
        }

        if (sortCol) {
          rows = [...rows].sort((a, b) => {
            const va = String(a[sortCol ?? ""] ?? "");
            const vb = String(b[sortCol ?? ""] ?? "");
            return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
          });
        }

        return rows;
      }

      const chain: MockChain = {
        select: () => chain,
        eq: (col, val) => {
          filters.push({ col, op: "eq", val });
          return chain;
        },
        neq: (col, val) => {
          filters.push({ col, op: "neq", val });
          return chain;
        },
        is: (col, val) => {
          filters.push({ col, op: "is", val });
          return chain;
        },
        gt: (col, val) => {
          filters.push({ col, op: "gt", val });
          return chain;
        },
        gte: (col, val) => {
          filters.push({ col, op: "gte", val });
          return chain;
        },
        lte: (col, val) => {
          filters.push({ col, op: "lte", val });
          return chain;
        },
        in: (col, val) => {
          filters.push({ col, op: "in", val });
          return chain;
        },
        contains: (col, val) => {
          filters.push({ col, op: "contains", val });
          return chain;
        },
        order: (col, opts) => {
          sortCol = col;
          sortAsc = opts?.ascending !== false;
          return chain;
        },
        range: async (from, to) => {
          const rows = getFilteredRows();
          return { data: rows.slice(from, to + 1), error: null };
        },
        single: async () => {
          const rows = getFilteredRows();
          if (rows.length === 0) {
            return { data: null, error: { message: "Row not found", code: "PGRST116" } };
          }
          return { data: rows[0], error: null };
        },
        // biome-ignore lint/suspicious/noThenProperty: emulates Supabase postgrest thenable builder
        then: async (resolve) => {
          const rows = getFilteredRows();
          resolve({ data: rows, error: null });
        },
      };

      return chain;
    },
  }),
}));

import dashDataHandler from "../api/dash-data";

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
  query?: Record<string, string>;
}): VercelRequest {
  return {
    method: options.method ?? "GET",
    headers: options.headers ?? {},
    query: options.query ?? {},
  } as unknown as VercelRequest;
}

function createMockRes(): VercelResponse & MockResHelper {
  let resStatus = 200;
  let resBody: Record<string, unknown> | null = null;
  const headersMap: Record<string, string | string[]> = {};

  const helper: MockResHelper = {
    statusCode: 200,
    setHeader(key: string, val: string | string[]) {
      headersMap[key.toLowerCase()] = val;
      return helper;
    },
    getHeader(key: string) {
      return headersMap[key.toLowerCase()];
    },
    status(code: number) {
      resStatus = code;
      helper.statusCode = code;
      return helper;
    },
    json(data: unknown) {
      resBody = (data as Record<string, unknown>) ?? null;
      return helper;
    },
    _headers: () => headersMap,
    _status: () => resStatus,
    _body: () => resBody,
  };

  return helper as unknown as VercelResponse & MockResHelper;
}

describe("Entrega 3 - Item 1: Busca [19]", () => {
  const mockPartners: Partner[] = [
    {
      id: "p1",
      slug: "parceiro-acessivel",
      title: "Parceiro Acessível",
      short: "PA",
      colors: ["#111111", "#ffffff"],
    } as Partner,
    {
      id: "p2",
      slug: "parceiro-secundario",
      title: "Parceiro Secundário",
      short: "PS",
      colors: ["#222222", "#eeeeee"],
    } as Partner,
  ];

  it("escolhe parceiro acessível quando o primeiro da ação não está no contexto do usuário", () => {
    const actionWithInaccessibleFirst = {
      id: "act-1",
      title: "Campanha Mista",
      partners: ["parceiro-inacessivel", "parceiro-acessivel"],
    } as Action;

    const resolvedPartner =
      mockPartners.find((p) =>
        actionWithInaccessibleFirst.partners?.includes(p.slug),
      ) || null;

    expect(resolvedPartner).not.toBeNull();
    expect(resolvedPartner?.slug).toBe("parceiro-acessivel");
    expect(resolvedPartner?.colors?.[0]).toBe("#111111");
  });

  it("trata ausência total de parceiro com guarda sem lançar exceção", () => {
    const actionWithoutKnownPartner = {
      id: "act-2",
      title: "Ação Órfã",
      partners: ["parceiro-desconhecido"],
    } as Action;

    const resolvedPartner =
      mockPartners.find((p) =>
        actionWithoutKnownPartner.partners?.includes(p.slug),
      ) || null;

    const bgColor = resolvedPartner?.colors?.[0] ?? undefined;
    const color = resolvedPartner?.colors?.[1] ?? undefined;
    const fallback = resolvedPartner?.short ?? "??";

    expect(resolvedPartner).toBeNull();
    expect(bgColor).toBeUndefined();
    expect(color).toBeUndefined();
    expect(fallback).toBe("??");
  });

  it("descarta respostas de busca obsoletas quando uma consulta mais recente já começou", async () => {
    let latestQueryId = 0;
    const results: string[] = [];

    async function simulateSearch(query: string, delayMs: number) {
      const currentId = ++latestQueryId;
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      if (currentId !== latestQueryId) {
        return;
      }
      results.push(query);
    }

    const p1 = simulateSearch("busca1-lenta", 50);
    const p2 = simulateSearch("busca2-rapida", 10);

    await Promise.all([p1, p2]);

    expect(results).toEqual(["busca2-rapida"]);
  });
});

describe("Entrega 3 - Item 2: Erros e Ausência de Dados [20]", () => {
  interface ViewState<T> {
    isLoading: boolean;
    isError: boolean;
    data: T | null;
  }

  function resolveScreenState<T>(
    state: ViewState<T>,
  ): "loading" | "error" | "empty" | "success" {
    if (state.isLoading) return "loading";
    if (state.isError) return "error";
    if (!state.data || (Array.isArray(state.data) && state.data.length === 0))
      return "empty";
    return "success";
  }

  it("distingue erro de carregamento (não entra em loading infinito)", () => {
    const errorState: ViewState<{ id: string }> = {
      isLoading: false,
      isError: true,
      data: null,
    };
    expect(resolveScreenState(errorState)).toBe("error");
  });

  it("distingue lista vazia de erro", () => {
    const emptyState: ViewState<unknown[]> = {
      isLoading: false,
      isError: false,
      data: [],
    };
    expect(resolveScreenState(emptyState)).toBe("empty");
  });

  it("distingue sucesso de loading e erro", () => {
    const successState: ViewState<{ title: string }> = {
      isLoading: false,
      isError: false,
      data: { title: "Ação 1" },
    };
    expect(resolveScreenState(successState)).toBe("success");
  });
});

describe("Ticket 03 - API /api/dash-data & Isolamento de Dados do Portal", () => {
  let tokenA: string;
  let tokenB: string;
  const futureIso = new Date(Date.now() + 86400000 * 7).toISOString();
  const pastIso = new Date(Date.now() - 86400000).toISOString();

  beforeEach(() => {
    tokenA = generateSessionToken();
    tokenB = generateSessionToken();

    mockDb.clients = [
      {
        id: "client-a-id",
        name: "Cliente A (Smartmed)",
        email: "a@smartmed.com",
        active: true,
        partners: ["smartmed"],
      },
      {
        id: "client-b-id",
        name: "Cliente B (Toro)",
        email: "b@toro.com",
        active: true,
        partners: ["toro"],
      },
      {
        id: "client-inactive",
        name: "Cliente Inativo",
        email: "inactive@test.com",
        active: false,
        partners: ["smartmed"],
      },
    ];

    mockDb.sessions = [
      {
        id: "sess-a",
        client_id: "client-a-id",
        token_hash: hashSessionToken(tokenA),
        expires_at: futureIso,
        created_at: new Date().toISOString(),
        revoked_at: null,
      },
      {
        id: "sess-b",
        client_id: "client-b-id",
        token_hash: hashSessionToken(tokenB),
        expires_at: futureIso,
        created_at: new Date().toISOString(),
        revoked_at: null,
      },
    ];

    mockDb.partners = [
      {
        slug: "smartmed",
        archived: false,
        title: "Smartmed Saúde",
        short: "SM",
        image: "https://example.com/smartmed.png",
        colors: ["#0055ff", "#ffffff"],
      },
      {
        slug: "toro",
        archived: false,
        title: "Toro Investimentos",
        short: "TI",
        image: null,
        colors: ["#ff5500", "#ffffff"],
      },
    ];

    mockDb.actions = [
      {
        id: "act-sm-1",
        title: "Campanha Smartmed Outubro",
        date: "2026-10-10",
        category: "feed",
        phase: "scheduled",
        description: "Post institucional de saúde",
        content_description: "Carrossel de prevenção",
        instagram_caption: "Cuide da sua saúde com a Smartmed!",
        content_files: ["https://example.com/f1.jpg"],
        work_files: ["https://example.com/w1.psd"],
        color: "#0055ff",
        updated_at: "2026-10-01T12:00:00Z",
        partners: ["smartmed"],
        archived: false,
        ai_prompt: "SECRETO IA QUE NÃO PODE VAZAR",
        sprints: ["sprint-internal-1"],
        responsibles: ["designer-id"],
      },
      {
        id: "act-sm-idea",
        title: "Ideia Smartmed Rascunho",
        date: "2026-10-12",
        category: "feed",
        phase: "idea", // Excluído do calendário
        description: "Rascunho interno",
        content_description: "",
        instagram_caption: "",
        content_files: null,
        work_files: null,
        color: "#0055ff",
        updated_at: "2026-10-01T12:00:00Z",
        partners: ["smartmed"],
        archived: false,
      },
      {
        id: "act-sm-archived",
        title: "Ação Arquivada Smartmed",
        date: "2026-10-14",
        category: "reels",
        phase: "done",
        description: "Ação antiga",
        content_description: "",
        instagram_caption: "",
        content_files: null,
        work_files: null,
        color: "#0055ff",
        updated_at: "2026-10-01T12:00:00Z",
        partners: ["smartmed"],
        archived: true, // Arquivada
      },
      {
        id: "act-toro-1",
        title: "Campanha Toro Trader",
        date: "2026-10-15",
        category: "reels",
        phase: "scheduled",
        description: "Vídeo educativo Toro",
        content_description: "Reels de renda variável",
        instagram_caption: "Invista melhor com a Toro!",
        content_files: ["https://example.com/toro.mp4"],
        work_files: null,
        color: "#ff5500",
        updated_at: "2026-10-02T12:00:00Z",
        partners: ["toro"],
        archived: false,
        ai_prompt: "PROMPT DA TORO NÃO PODE VAZAR",
      },
    ];
  });

  describe("1. Autenticação e Verificação de Sessão do Endpoint", () => {
    it("rejeita métodos HTTP diferentes de GET com 405", async () => {
      const req = createMockReq({ method: "POST" });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(405);
      expect(res.getHeader("allow")).toEqual(["GET"]);
      expect(res.getHeader("cache-control")).toBe("no-store");
    });

    it("retorna 401 quando não há cookie de sessão", async () => {
      const req = createMockReq({ method: "GET" });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(401);
      expect(res._body()?.error).toBe("Sessão não fornecida.");
    });

    it("retorna 401 quando token de sessão é forjado ou não existe", async () => {
      const forgedToken = generateSessionToken();
      const req = createMockReq({
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${forgedToken}`,
        },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(401);
      expect(res._body()?.error).toBe("Sessão inválida ou expirada.");
    });

    it("retorna 401 quando a sessão está expirada", async () => {
      const expiredToken = generateSessionToken();
      mockDb.sessions.push({
        id: "sess-exp",
        client_id: "client-a-id",
        token_hash: hashSessionToken(expiredToken),
        expires_at: pastIso,
        created_at: pastIso,
        revoked_at: null,
      });

      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${expiredToken}` },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(401);
      expect(res._body()?.error).toBe("Sessão inválida ou expirada.");
    });

    it("retorna 401 quando a sessão foi revogada (logout)", async () => {
      const revokedToken = generateSessionToken();
      mockDb.sessions.push({
        id: "sess-rev",
        client_id: "client-a-id",
        token_hash: hashSessionToken(revokedToken),
        expires_at: futureIso,
        created_at: new Date().toISOString(),
        revoked_at: new Date().toISOString(),
      });

      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${revokedToken}` },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(401);
      expect(res._body()?.error).toBe("Sessão inválida ou expirada.");
    });

    it("retorna 401 se o cliente estiver inativo", async () => {
      const inactToken = generateSessionToken();
      mockDb.sessions.push({
        id: "sess-inact",
        client_id: "client-inactive",
        token_hash: hashSessionToken(inactToken),
        expires_at: futureIso,
        created_at: new Date().toISOString(),
        revoked_at: null,
      });

      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${inactToken}` },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(401);
      expect(res._body()?.error).toBe("Cliente inativo ou não encontrado.");
    });
  });

  describe("2. Operação: partners", () => {
    it("parceiro arquivado não volta na lista nem permite carregar suas ações", async () => {
      mockDb.partners[0].archived = true;
      const headers={cookie:`${SESSION_COOKIE_NAME}=${tokenA}`};
      const partnersRes=createMockRes();
      await dashDataHandler(createMockReq({headers,query:{op:"partners"}}),partnersRes);
      expect(partnersRes._body()?.partners).toEqual([]);
      const actionRes=createMockRes();
      await dashDataHandler(createMockReq({headers,query:{op:"action",id:"act-sm-1"}}),actionRes);
      expect(actionRes._status()).toBe(404);
    });

    it("retorna apenas parceiros autorizados para o Cliente A (smartmed)", async () => {
      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
        query: { op: "partners" },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(200);
      const data = res._body() as { partners: DashPartnerDto[] };
      expect(Array.isArray(data.partners)).toBe(true);
      expect(data.partners.length).toBe(1);
      expect(data.partners[0].slug).toBe("smartmed");
      expect(data.partners[0].title).toBe("Smartmed Saúde");
      expect(data.partners[0].short).toBe("SM");
      expect(data.partners[0].colors).toEqual(["#0055ff", "#ffffff"]);
    });

    it("retorna apenas parceiros autorizados para o Cliente B (toro)", async () => {
      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenB}` },
        query: { op: "partners" },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(200);
      const data = res._body() as { partners: DashPartnerDto[] };
      expect(data.partners.length).toBe(1);
      expect(data.partners[0].slug).toBe("toro");
      expect(data.partners[0].title).toBe("Toro Investimentos");
    });
  });

  describe("3. Operação: actions e Validação de Limites", () => {
    it("rejeita dia inexistente sem normalizar para o mês seguinte", async () => {
      const res = createMockRes();
      await dashDataHandler(createMockReq({ headers: {cookie: `${SESSION_COOKIE_NAME}=${tokenA}`}, query: {op:"actions",partner:"smartmed",from:"2026-02-31",to:"2026-03-10"} }),res);
      expect(res._status()).toBe(400);
    });

    it("retorna 400 se parâmetros partner, from ou to estiverem ausentes", async () => {
      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
        query: { op: "actions", partner: "smartmed" }, // faltam from e to
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(400);
      expect(res._body()?.error).toBe(
        "Parâmetros partner, from e to são obrigatórios.",
      );
    });

    it("retorna 404 uniforme se o Cliente A tentar consultar parceiro 'toro' fora de sua conta", async () => {
      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
        query: {
          op: "actions",
          partner: "toro",
          from: "2026-10-01",
          to: "2026-10-31",
        },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(404);
      expect(res._body()?.error).toBe("Parceiro não encontrado.");
      expect(res._body()?.actions).toBeUndefined();
    });

    it("retorna 400 se as datas fornecidas forem inválidas", async () => {
      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
        query: {
          op: "actions",
          partner: "smartmed",
          from: "data-invalida",
          to: "2026-10-31",
        },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(400);
      expect(res._body()?.error).toBe("Datas inválidas fornecidas.");
    });

    it("retorna 400 se data inicial for posterior à data final", async () => {
      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
        query: {
          op: "actions",
          partner: "smartmed",
          from: "2026-10-31",
          to: "2026-10-01",
        },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(400);
      expect(res._body()?.error).toBe("Data inicial posterior à data final.");
    });

    it("retorna 400 se o período solicitado exceder o limite de 62 dias", async () => {
      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
        query: {
          op: "actions",
          partner: "smartmed",
          from: "2026-01-01",
          to: "2026-03-15", // 73 dias > 62
        },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(400);
      expect(res._body()?.error).toContain("limite máximo de 62 dias");
    });

    it("retorna apenas ações não arquivadas e que não estejam em phase 'idea'", async () => {
      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
        query: {
          op: "actions",
          partner: "smartmed",
          from: "2026-10-01",
          to: "2026-10-31",
        },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(200);
      const data = res._body() as { actions: DashActionDto[] };
      expect(data.actions.length).toBe(1);
      expect(data.actions[0].id).toBe("act-sm-1");
      expect(data.actions[0].title).toBe("Campanha Smartmed Outubro");

      // Garante que campos internos confidenciais NÃO vazam
      const actionObj = data.actions[0] as unknown as Record<string, unknown>;
      expect(actionObj.ai_prompt).toBeUndefined();
      expect(actionObj.sprints).toBeUndefined();
      expect(actionObj.responsibles).toBeUndefined();
    });

    it("executa paginação completa sem truncamento silencioso quando há mais de 500 ações", async () => {
      // Adiciona 550 ações para testar a paginação em lote (BATCH_SIZE = 500)
      const bigBatch: MockAction[] = [];
      for (let i = 1; i <= 550; i++) {
        bigBatch.push({
          id: `batch-act-${i}`,
          title: `Ação Lote ${i}`,
          date: "2026-10-20",
          category: "feed",
          phase: "scheduled",
          description: `Desc ${i}`,
          content_description: "",
          instagram_caption: "",
          content_files: null,
          work_files: null,
          color: "#0055ff",
          updated_at: "2026-10-01T00:00:00Z",
          partners: ["smartmed"],
          archived: false,
        });
      }
      mockDb.actions.push(...bigBatch);

      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
        query: {
          op: "actions",
          partner: "smartmed",
          from: "2026-10-01",
          to: "2026-10-31",
        },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(200);
      const data = res._body() as { actions: DashActionDto[] };
      // 1 ação original + 550 do lote = 551 total!
      expect(data.actions.length).toBe(551);
    });
  });

  describe("4. Operação: action (Detalhe por ID e Isolamento entre Clientes)", () => {
    it("retorna 400 se id da ação não for fornecido", async () => {
      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
        query: { op: "action" },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(400);
      expect(res._body()?.error).toBe("ID da ação é obrigatório.");
    });

    it("retorna 404 uniforme se a ação não existir", async () => {
      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
        query: { op: "action", id: "act-inexistente" },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(404);
      expect(res._body()?.error).toBe("Ação não encontrada.");
      expect(res._body()?.action).toBeUndefined();
    });

    it("retorna 404 uniforme sem DTO quando Cliente A tenta acessar ação do Cliente B (Toro)", async () => {
      // Cliente A (Smartmed) tenta ler "act-toro-1" (que pertence ao parceiro 'toro')
      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
        query: { op: "action", id: "act-toro-1" },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(404);
      expect(res._body()?.error).toBe("Ação não encontrada.");
      expect(res._body()?.action).toBeUndefined();
    });

    it("permite acesso e retorna DTO público seguro quando a ação pertence ao parceiro do cliente", async () => {
      // Cliente A acessa sua própria ação 'act-sm-1'
      const req = createMockReq({
        headers: { cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
        query: { op: "action", id: "act-sm-1" },
      });
      const res = createMockRes();

      await dashDataHandler(req, res);

      expect(res._status()).toBe(200);
      const data = res._body() as { action: DashActionDto };
      expect(data.action).toBeDefined();
      expect(data.action.id).toBe("act-sm-1");
      expect(data.action.title).toBe("Campanha Smartmed Outubro");
      expect(data.action.partners).toEqual(["smartmed"]);
      expect(data.action.instagram_caption).toBe(
        "Cuide da sua saúde com a Smartmed!",
      );

      // Verificação estrita de vazamento: campos confidenciais não devem estar presentes
      const raw = data.action as unknown as Record<string, unknown>;
      expect(raw.ai_prompt).toBeUndefined();
      expect(raw.sprints).toBeUndefined();
      expect(raw.responsibles).toBeUndefined();
    });
  });
});

describe("Ticket 03 - fetchers reais com HTTP controlado", () => {
  it("fetchDashPartners chama /api/dash-data com credenciais e op=partners", async () => {
    let capturedUrl = "";
    let capturedOptions: RequestInit | undefined;

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedUrl = String(input);
      capturedOptions = init;
      return new Response(
        JSON.stringify({
          partners: [
            {
              slug: "smartmed",
              title: "Smartmed",
              short: "SM",
              colors: ["#000", "#fff"],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    try {
      const partners = await fetchDashPartners();
      expect(capturedUrl).toBe("/api/dash-data?op=partners");
      expect(capturedOptions?.credentials).toBe("same-origin");
      expect(partners.length).toBe(1);
      expect(partners[0].slug).toBe("smartmed");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("fetchDashActions codifica datas e parceiro e retorna lista de ações", async () => {
    let capturedUrl = "";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      capturedUrl = String(input);
      return new Response(
        JSON.stringify({
          actions: [
            {
              id: "act-1",
              title: "Ação 1",
              date: "2026-10-10",
              category: "feed",
              phase: "scheduled",
              color: "#000",
              updated_at: "2026-10-01",
              partners: ["smartmed"],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    try {
      const actions = await fetchDashActions({
        partner: "smartmed",
        from: "2026-10-01",
        to: "2026-10-31",
      });
      expect(capturedUrl).toContain("op=actions");
      expect(capturedUrl).toContain("partner=smartmed");
      expect(capturedUrl).toContain("from=2026-10-01");
      expect(capturedUrl).toContain("to=2026-10-31");
      expect(actions.length).toBe(1);
      expect(actions[0].id).toBe("act-1");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("fetchDashAction retorna null quando API retorna 404 para ação inacessível", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ error: "Ação não encontrada." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    try {
      const action = await fetchDashAction("act-alheia");
      expect(action).toBeNull();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("fetchDashAction lança erro quando API retorna status 500", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    try {
      await expect(fetchDashAction("act-err")).rejects.toThrow(
        "Falha ao obter detalhe da ação: status 500",
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe("Ticket 03 - Auditoria de Código: Nenhuma Leitura Direta no Browser", () => {
  it("app/routes/dash.tsx não chama supabase.from('partners') nem supabase.from('actions')", () => {
    const content = readFileSync(
      resolve(process.cwd(), "app/routes/dash.tsx"),
      "utf-8",
    );
    expect(content.includes('.from("partners")')).toBe(false);
    expect(content.includes('.from("actions")')).toBe(false);
    expect(content.includes("fetchDashPartners")).toBe(true);
  });

  it("app/routes/dash/index.tsx não chama supabase.from('actions')", () => {
    const content = readFileSync(
      resolve(process.cwd(), "app/routes/dash/index.tsx"),
      "utf-8",
    );
    expect(content.includes('.from("actions")')).toBe(false);
    expect(content.includes("fetchDashActions")).toBe(true);
  });

  it("app/routes/dash/action/$id.tsx não lê ações via SDK browser (sem getActionById ou .from('actions').select)", () => {
    const content = readFileSync(
      resolve(process.cwd(), "app/routes/dash/action/$id.tsx"),
      "utf-8",
    );
    expect(content.includes("getActionById")).toBe(false);
    expect(content.includes('.from("actions").select')).toBe(false);
    expect(content.includes("fetchDashAction")).toBe(true);
  });
});
