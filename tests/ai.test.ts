import {beforeEach, afterEach, expect, it, mock} from "bun:test";
import type {VercelRequest,VercelResponse} from "@vercel/node";
import handler from "../api/ai";

let calls = 0;
let rpcCalls = 0;
let eventOrder: string[] = [];
let lastClientKey: string | undefined;
let lastClientUrl: string | undefined;
let lastClientOptions: { auth?: { persistSession?: boolean; autoRefreshToken?: boolean }; global?: { headers?: { Authorization?: string } } } | undefined;
let output = '{"caption":"Legenda válida"}';
let failUpstream = false;
let storeError = false;
let quota = true;
let active = true;
let authThrows = false;

const savedEnv = { ...process.env };
const envKeysToRestore = [
  "NODE_ENV",
  "VERCEL",
  "UZZINA_LOCAL_AI_COMPAT",
  "OPENAI_API_KEY",
  "SUPABASE_URL",
  "VITE_SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "AI_DAILY_LIMIT",
];

mock.module("@supabase/supabase-js", () => ({
  createClient: (url: string, key: string, options?: { auth?: { persistSession?: boolean; autoRefreshToken?: boolean }; global?: { headers?: { Authorization?: string } } }) => {
    lastClientUrl = url;
    lastClientKey = key;
    lastClientOptions = options;
    return {
      auth: {
        getUser: async (token?: string) => {
          if (authThrows) throw new Error("secret auth failure");
          const authBearer = options?.global?.headers?.Authorization?.replace("Bearer ", "");
          const effectiveToken = token || authBearer;
          return {
            data: { user: effectiveToken === "valid" ? { id: "member" } : null },
            error: effectiveToken === "valid" ? null : { message: "Invalid token" },
          };
        },
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { user_id: "member", visible: active },
              error: null,
            }),
          }),
        }),
      }),
      rpc: async (_fn: string, _args: unknown) => {
        rpcCalls++;
        eventOrder.push("rpc");
        return { data: quota, error: storeError ? { message: "private SQL failure" } : null };
      },
    };
  },
}));

mock.module("openai", () => ({
  default: class {
    chat = {
      completions: {
        create: async () => {
          calls++;
          eventOrder.push("openai");
          if (failUpstream) throw new Error("secret provider failure");
          return { choices: [{ message: { content: output } }] };
        },
      },
    };
  },
}));

beforeEach(() => {
  calls = 0;
  rpcCalls = 0;
  eventOrder = [];
  lastClientKey = undefined;
  lastClientUrl = undefined;
  lastClientOptions = undefined;
  output = '{"caption":"Legenda válida"}';
  failUpstream = false;
  storeError = false;
  quota = true;
  active = true;
  authThrows = false;

  process.env.NODE_ENV = "test";
  delete process.env.VERCEL;
  delete process.env.UZZINA_LOCAL_AI_COMPAT;
  process.env.OPENAI_API_KEY = "fake-key";
  process.env.SUPABASE_URL = "https://fake.test";
  delete process.env.VITE_SUPABASE_URL;
  process.env.SUPABASE_PUBLISHABLE_KEY = "fake-anon";
  delete process.env.VITE_SUPABASE_ANON_KEY;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fake-service";
  delete process.env.AI_DAILY_LIMIT;
});

afterEach(() => {
  for (const key of envKeysToRestore) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
});

const payload = { intent: "ai-caption", category: "post", title: "Tema" };

async function request(body: unknown = payload, token = "valid", method = "POST") {
  let status = 0;
  let result: unknown;
  const headers: Record<string, string | number | string[]> = {};
  const res = {
    status: (code: number) => {
      status = code;
      return res;
    },
    json: (data: unknown) => {
      result = data;
      return res;
    },
    setHeader: (name: string, value: string | number | string[]) => {
      headers[name] = value;
      return res;
    },
  };
  await handler({ method, body, headers: token ? { authorization: `Bearer ${token}` } : {} } as VercelRequest, res as unknown as VercelResponse);
  return { status, result, headers };
}

it("rejects a title object before spending an OpenAI call", async () => {
  expect((await request({ ...payload, title: { text: "bad" } })).status).toBe(400);
  expect(calls).toBe(0);
});

it("returns 503 without leaking errors when Auth infrastructure throws", async () => {
  authThrows = true;
  const response = await request();
  expect(response.status).toBe(503);
  expect(JSON.stringify(response.result)).not.toContain("secret");
  expect(calls).toBe(0);
});

it.each(["ai-strategy", "ai-hooks", "ai-content", "ai-caption"])("accepts the existing %s output contract", async (intent) => {
  const strategy = { headline: "Título", angulo: "12. Ângulo", racional: "Motivo", direcionamento: "Aplicação" };
  output = intent === "ai-content" ? "<p>Conteúdo</p>" : intent === "ai-caption" ? '{"caption":"Legenda válida"}' : JSON.stringify({ strategies: Array.from({ length: 5 }, () => strategy) });
  const response = await request({ ...payload, intent });
  expect(response.status).toBe(200);
  expect(calls).toBe(1);
});

for (const [index, body] of [
  null,
  [],
  { ...payload, intent: "invented" },
  { ...payload, category: " " },
  { ...payload, title: 123 },
  { ...payload, description: [] },
  { ...payload, partner_context: {} },
  { ...payload, headline: "a".repeat(2001) },
  { ...payload, direcionamento: false },
  { ...payload, hook: "unknown" },
  { ...payload, user_id: "someone-else" },
].entries()) {
  it(`rejects invalid input ${index} without calling OpenAI`, async () => {
    expect((await request(body)).status).toBe(400);
    expect(calls).toBe(0);
  });
}

it("measures the body in UTF-8 bytes and rejects malformed JSON", async () => {
  expect((await request({ ...payload, description: "界".repeat(10000), partner_context: "界".repeat(10000), title: "界".repeat(500), racional: "界".repeat(2000) })).status).toBe(413);
  expect((await request("{")).status).toBe(400);
  expect(calls).toBe(0);
});

it.each(["", "invalid"])("rejects a missing/invalid token (%s)", async (token) => {
  expect((await request(payload, token)).status).toBe(401);
  expect(calls).toBe(0);
});

it("rejects inactive people and non-POST methods", async () => {
  active = false;
  expect((await request()).status).toBe(403);
  const response = await request(payload, "valid", "GET");
  expect(response.status).toBe(405);
  expect(response.headers.Allow).toBe("POST");
  expect(calls).toBe(0);
});

it("rejects exhausted quota with a bounded Retry-After", async () => {
  quota = false;
  const response = await request();
  expect(response.status).toBe(429);
  expect(Number(response.headers["Retry-After"])).toBeGreaterThan(0);
  expect(Number(response.headers["Retry-After"])).toBeLessThanOrEqual(86400);
  expect(calls).toBe(0);
});

it("fails closed when the persistent quota store fails", async () => {
  storeError = true;
  const response = await request();
  expect(response.status).toBe(503);
  expect(JSON.stringify(response.result)).not.toContain("SQL");
  expect(calls).toBe(0);
});

it.each(["0", "10001", "1.5", "abc", ""])("rejects invalid configured limits: %s", async (value) => {
  process.env.AI_DAILY_LIMIT = value;
  expect((await request()).status).toBe(503);
  expect(calls).toBe(0);
});

it.each(["OPENAI_API_KEY", "SUPABASE_SERVICE_ROLE_KEY"])("handles missing configuration: %s", async (key) => {
  delete process.env[key];
  const response = await request();
  expect(response.status).toBe(503);
  expect(response.result).toMatchObject({ code: "AI_CONFIGURATION_MISSING" });
  expect(calls).toBe(0);
});

it.each(["not-json", "{}", '{"caption":42}', '{"caption":" "}'])("rejects malformed provider output: %s", async (value) => {
  output = value;
  expect((await request()).status).toBe(502);
  expect(calls).toBe(1);
});

it("does not expose upstream errors", async () => {
  failUpstream = true;
  const response = await request();
  expect(response.status).toBe(502);
  expect(JSON.stringify(response.result)).not.toContain("secret");
});

// --- Casos 1 a 10 de docs/audits/2026-10-07-correcao-ia-gemini.md ---

it("case 1: local development compat mode returns 200 using public key and Bearer without quota RPC", async () => {
  process.env.NODE_ENV = "development";
  process.env.UZZINA_LOCAL_AI_COMPAT = "true";
  delete process.env.VERCEL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_PUBLISHABLE_KEY = "fake-anon";
  process.env.OPENAI_API_KEY = "fake-key";
  process.env.SUPABASE_URL = "https://fake.test";
  active = true;

  const response = await request(payload, "valid");
  expect(response.status).toBe(200);
  expect(lastClientUrl).toBe("https://fake.test");
  expect(lastClientKey).toBe("fake-anon");
  expect(lastClientOptions?.global?.headers?.Authorization).toBe("Bearer valid");
  expect(lastClientOptions?.auth?.persistSession).toBe(false);
  expect(lastClientOptions?.auth?.autoRefreshToken).toBe(false);
  expect(rpcCalls).toBe(0);
  expect(calls).toBe(1);
});

it("case 2: local development compat mode with invalid token returns 401 without quota or OpenAI calls", async () => {
  process.env.NODE_ENV = "development";
  process.env.UZZINA_LOCAL_AI_COMPAT = "true";
  delete process.env.VERCEL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_PUBLISHABLE_KEY = "fake-anon";
  process.env.OPENAI_API_KEY = "fake-key";
  process.env.SUPABASE_URL = "https://fake.test";

  const response = await request(payload, "invalid");
  expect(response.status).toBe(401);
  expect(rpcCalls).toBe(0);
  expect(calls).toBe(0);
});

it("case 3: local development compat mode with inactive user returns 403 without quota or OpenAI calls", async () => {
  process.env.NODE_ENV = "development";
  process.env.UZZINA_LOCAL_AI_COMPAT = "true";
  delete process.env.VERCEL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_PUBLISHABLE_KEY = "fake-anon";
  process.env.OPENAI_API_KEY = "fake-key";
  process.env.SUPABASE_URL = "https://fake.test";
  active = false;

  const response = await request(payload, "valid");
  expect(response.status).toBe(403);
  expect(rpcCalls).toBe(0);
  expect(calls).toBe(0);
});

it("case 4: local development compat mode without public key returns 503 AI_CONFIGURATION_MISSING without OpenAI calls", async () => {
  process.env.NODE_ENV = "development";
  process.env.UZZINA_LOCAL_AI_COMPAT = "true";
  delete process.env.VERCEL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_PUBLISHABLE_KEY;
  delete process.env.VITE_SUPABASE_ANON_KEY;
  process.env.OPENAI_API_KEY = "fake-key";
  process.env.SUPABASE_URL = "https://fake.test";

  const response = await request(payload, "valid");
  expect(response.status).toBe(503);
  expect(response.result).toMatchObject({ code: "AI_CONFIGURATION_MISSING" });
  expect(rpcCalls).toBe(0);
  expect(calls).toBe(0);
});

it("case 5: production mode with compat flag true but no service_role returns 503 and zero OpenAI calls", async () => {
  process.env.NODE_ENV = "production";
  process.env.UZZINA_LOCAL_AI_COMPAT = "true";
  delete process.env.VERCEL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_PUBLISHABLE_KEY = "fake-anon";
  process.env.OPENAI_API_KEY = "fake-key";
  process.env.SUPABASE_URL = "https://fake.test";

  const response = await request(payload, "valid");
  expect(response.status).toBe(503);
  expect(response.result).toMatchObject({ code: "AI_CONFIGURATION_MISSING" });
  expect(rpcCalls).toBe(0);
  expect(calls).toBe(0);
});

it("case 6: VERCEL=1 even with development and compat flag true without service_role returns 503 and zero OpenAI calls", async () => {
  process.env.NODE_ENV = "development";
  process.env.UZZINA_LOCAL_AI_COMPAT = "true";
  process.env.VERCEL = "1";
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_PUBLISHABLE_KEY = "fake-anon";
  process.env.OPENAI_API_KEY = "fake-key";
  process.env.SUPABASE_URL = "https://fake.test";

  const response = await request(payload, "valid");
  expect(response.status).toBe(503);
  expect(response.result).toMatchObject({ code: "AI_CONFIGURATION_MISSING" });
  expect(rpcCalls).toBe(0);
  expect(calls).toBe(0);
});

it("case 7: development mode with compat flag false without service_role returns 503", async () => {
  process.env.NODE_ENV = "development";
  process.env.UZZINA_LOCAL_AI_COMPAT = "false";
  delete process.env.VERCEL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_PUBLISHABLE_KEY = "fake-anon";
  process.env.OPENAI_API_KEY = "fake-key";
  process.env.SUPABASE_URL = "https://fake.test";

  const response = await request(payload, "valid");
  expect(response.status).toBe(503);
  expect(response.result).toMatchObject({ code: "AI_CONFIGURATION_MISSING" });
  expect(rpcCalls).toBe(0);
  expect(calls).toBe(0);
});

it("case 8: strict mode with quota available reserves quota before OpenAI call and returns 200", async () => {
  process.env.NODE_ENV = "production";
  delete process.env.UZZINA_LOCAL_AI_COMPAT;
  delete process.env.VERCEL;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fake-service";
  process.env.OPENAI_API_KEY = "fake-key";
  process.env.SUPABASE_URL = "https://fake.test";
  quota = true;
  active = true;

  const response = await request(payload, "valid");
  expect(response.status).toBe(200);
  expect(lastClientUrl).toBe("https://fake.test");
  expect(lastClientKey).toBe("fake-service");
  expect(lastClientOptions?.auth?.persistSession).toBe(false);
  expect(lastClientOptions?.auth?.autoRefreshToken).toBe(false);
  expect(rpcCalls).toBe(1);
  expect(calls).toBe(1);
  expect(eventOrder).toEqual(["rpc", "openai"]);
});

it("case 9: strict mode with quota store error returns 503 AI_QUOTA_UNAVAILABLE without OpenAI and does not enter compat mode", async () => {
  process.env.NODE_ENV = "production";
  delete process.env.UZZINA_LOCAL_AI_COMPAT;
  delete process.env.VERCEL;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fake-service";
  process.env.OPENAI_API_KEY = "fake-key";
  process.env.SUPABASE_URL = "https://fake.test";
  storeError = true;

  const response = await request(payload, "valid");
  expect(response.status).toBe(503);
  expect(response.result).toMatchObject({ code: "AI_QUOTA_UNAVAILABLE" });
  expect(rpcCalls).toBe(1);
  expect(calls).toBe(0);
});

it("case 10: strict mode with exhausted quota returns 429 and Retry-After without calling OpenAI", async () => {
  process.env.NODE_ENV = "production";
  delete process.env.UZZINA_LOCAL_AI_COMPAT;
  delete process.env.VERCEL;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fake-service";
  process.env.OPENAI_API_KEY = "fake-key";
  process.env.SUPABASE_URL = "https://fake.test";
  quota = false;

  const response = await request(payload, "valid");
  expect(response.status).toBe(429);
  expect(Number(response.headers["Retry-After"])).toBeGreaterThan(0);
  expect(rpcCalls).toBe(1);
  expect(calls).toBe(0);
});

