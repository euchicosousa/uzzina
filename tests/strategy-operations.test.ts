import { afterEach, beforeEach, expect, it, mock } from "bun:test";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import handler from "../api/strategy-operations";
import worker from "../api/strategy-worker";

const userId = randomUUID();
const actionId = randomUUID();
const operationId = randomUUID();
const strategies = Array.from({ length: 5 }, (_, i) => ({
  headline: `Headline ${i}`,
  angulo: "Angle",
  racional: "Reason",
  direcionamento: "Direction",
}));
const operation = {
  id: operationId,
  actionId,
  state: "queued",
  result: null,
  errorCode: null,
  createdAt: "2026-10-31T12:00:00Z",
  updatedAt: "2026-10-31T12:00:00Z",
};
let active = true;
let rpcError: string | null = null;
let failRPC: string | null = null;
let claim: unknown = null;
let providerCalls = 0;
let providerFails = false;
let providerOptions: unknown;
const events: { name: string; args: unknown }[] = [];
const originalEnv = { ...process.env };
mock.module("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async (token: string) => ({
        data: { user: token === "valid" ? { id: userId } : null },
        error: null,
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { visible: active }, error: null }),
        }),
      }),
    }),
    rpc: async (name: string, args: unknown) => {
      events.push({ name, args });
      if (rpcError || name === failRPC)
        return { data: null, error: { code: rpcError || "XX000" } };
      return {
        data:
          name === "strategy_ready"
            ? true
            : name === "claim_strategy_operation"
              ? claim
              : name === "store_strategy_result" ||
                  name === "fail_strategy_operation"
                ? null
                : operation,
        error: null,
      };
    },
  }),
}));
mock.module("openai", () => ({
  default: class {
    constructor(options: unknown) {
      providerOptions = options;
    }
    chat = {
      completions: {
        create: async () => {
          providerCalls++;
          if (providerFails) throw new Error("private provider error");
          return {
            choices: [{ message: { content: JSON.stringify({ strategies }) } }],
          };
        },
      },
    };
  },
}));
beforeEach(() => {
  Object.assign(process.env, {
    UZZINA_STRATEGY_ACCEPTING: "true",
    STRATEGY_WORKER_SECRET: "s".repeat(40),
    OPENAI_API_KEY: "fixture",
    SUPABASE_URL: "https://fixture.invalid",
    SUPABASE_SERVICE_ROLE_KEY: "fixture",
    AI_DAILY_LIMIT: "100",
  });
  active = true;
  rpcError = null;
  failRPC = null;
  claim = null;
  providerCalls = 0;
  providerFails = false;
  events.length = 0;
});
afterEach(() => {
  for (const key of [
    "UZZINA_DURABLE_STRATEGIES",
    "UZZINA_STRATEGY_ACCEPTING",
    "STRATEGY_WORKER_SECRET",
    "OPENAI_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "AI_DAILY_LIMIT",
  ]) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});
async function request(
  target = handler,
  {
    method = "GET",
    token = "valid",
    query = {},
    body = {},
  }: {
    method?: string;
    token?: string | null;
    query?: Record<string, string>;
    body?: unknown;
  } = {},
) {
  let status = 200;
  let response: unknown;
  const res = {
    setHeader() {},
    status(code: number) {
      status = code;
      return this;
    },
    json(value: unknown) {
      response = value;
      return this;
    },
  };
  await target(
    {
      method,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      query,
      body,
    } as VercelRequest,
    res as unknown as VercelResponse,
  );
  return { status, body: response };
}
const accept = {
  command: "accept",
  actionId,
  operationId,
  expectedVersion: "2026-10-31T12:00:00.000001",
};
it("rejects unauthenticated, inactive and unsupported calls before private work", async () => {
  expect((await request(handler, { token: null })).status).toBe(401);
  expect((await request(handler, { token: "invalid" })).status).toBe(401);
  active = false;
  expect(
    (await request(handler, { query: { capability: "true" } })).status,
  ).toBe(403);
  expect((await request(handler, { method: "DELETE" })).status).toBe(405);
  expect(events).toHaveLength(0);
});
it("binds acceptance to the authenticated actor and only accepts canonical identity/version", async () => {
  expect(
    (await request(handler, { method: "POST", body: accept })).status,
  ).toBe(202);
  expect(events[0]).toEqual({
    name: "accept_strategy_operation",
    args: {
      p_user_id: userId,
      p_action_id: actionId,
      p_operation_id: operationId,
      p_expected_version: accept.expectedVersion,
    },
  });
  expect(
    (
      await request(handler, {
        method: "POST",
        body: { ...accept, userId: randomUUID() },
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await request(handler, {
        method: "POST",
        body: { ...accept, partner_context: "forged" },
      })
    ).status,
  ).toBe(400);
  expect(providerCalls).toBe(0);
});
it("keeps status readable while acceptance is disabled for draining", async () => {
  process.env.UZZINA_STRATEGY_ACCEPTING = "false";
  expect(
    (await request(handler, { method: "POST", body: accept })).status,
  ).toBe(503);
  expect((await request(handler, { query: { actionId } })).body).toEqual({
    operation,
  });
  expect(
    (await request(handler, { query: { capability: "true" } })).body,
  ).toEqual({ configured: true, ready: false });
});
it.each([
  ["42501", 403],
  ["40001", 409],
  ["23505", 409],
  ["22023", 400],
  ["55000", 503],
  ["XX000", 503],
] as const)(
  "maps %s without exposing internal details",
  async (code, expected) => {
    rpcError = code;
    const response = await request(handler, { method: "POST", body: accept });
    expect(response.status).toBe(expected);
    expect(JSON.stringify(response.body)).not.toContain(code);
  },
);
it("rejects malformed/large bodies and mismatched recovery identity", async () => {
  expect((await request(handler, { method: "POST", body: "{" })).status).toBe(
    400,
  );
  expect(
    (await request(handler, { method: "POST", body: "x".repeat(2049) })).status,
  ).toBe(413);
  expect(
    (
      await request(handler, {
        method: "POST",
        body: {
          ...accept,
          command: "retry",
          operationId: randomUUID(),
          confirmChangedSource: false,
        },
      })
    ).status,
  ).toBe(409);
});
it("authenticates worker with a separate secret before claiming jobs", async () => {
  expect((await request(worker)).status).toBe(405);
  expect((await request(worker, { method: "POST" })).status).toBe(401);
  expect(events).toHaveLength(0);
});
it("awaits generation, retains output, then finalizes independently of a browser callback", async () => {
  claim = {
    id: operationId,
    payload: {
      intent: "ai-strategy",
      category: "post",
      title: "Title",
      description: "Brief",
      partner_name: "Hospital",
      partner_context: "Context",
    },
    result: null,
  };
  const response = await request(worker, {
    method: "POST",
    token: "s".repeat(40),
  });
  expect(response.status).toBe(200);
  expect(events.map((event) => event.name)).toEqual([
    "claim_strategy_operation",
    "store_strategy_result",
    "finish_strategy_operation",
  ]);
  expect(events[1]?.args).toMatchObject({ p_result: strategies });
  expect(providerCalls).toBe(1);
  expect(providerOptions).toMatchObject({ timeout: 90000, maxRetries: 0 });
});
it("reuses a retained result on worker retry without model or quota calls", async () => {
  claim = { id: operationId, payload: {}, result: strategies };
  expect(
    (await request(worker, { method: "POST", token: "s".repeat(40) })).status,
  ).toBe(200);
  expect(events.map((event) => event.name)).toEqual([
    "claim_strategy_operation",
    "finish_strategy_operation",
  ]);
  expect(providerCalls).toBe(0);
});
it.each(["store_strategy_result", "finish_strategy_operation"])(
  "preserves recovery semantics when %s fails",
  async (failure) => {
    claim = {
      id: operationId,
      payload: {
        intent: "ai-strategy",
        category: "post",
        partner_name: "Hospital",
      },
      result: null,
    };
    failRPC = failure;
    await request(worker, { method: "POST", token: "s".repeat(40) });
    expect(events.at(-1)).toMatchObject({
      name: "fail_strategy_operation",
      args: {
        p_code:
          failure === "store_strategy_result"
            ? "PROVIDER_UNCERTAIN"
            : "SAVE_FAILED",
      },
    });
    expect(providerCalls).toBe(1);
  },
);
it("does not automatically retry an ambiguous provider completion", async () => {
  claim = {
    id: operationId,
    payload: {
      intent: "ai-strategy",
      category: "post",
      partner_name: "Hospital",
    },
    result: null,
  };
  providerFails = true;
  await request(worker, { method: "POST", token: "s".repeat(40) });
  expect(providerCalls).toBe(1);
  expect(events.at(-1)).toMatchObject({
    name: "fail_strategy_operation",
    args: { p_code: "PROVIDER_UNCERTAIN" },
  });
});

it("pauses new acceptance while keeping the worker and authorized status available to drain", async () => {
  process.env.UZZINA_STRATEGY_ACCEPTING = "false";
  expect(
    (await request(handler, { query: { capability: "true" } })).body,
  ).toEqual({ configured: true, ready: false });
  expect(
    (await request(handler, { method: "POST", body: accept })).status,
  ).toBe(503);
  expect((await request(handler, { query: { actionId } })).body).toEqual({
    operation,
  });
  expect(
    (await request(worker, { method: "POST", token: "s".repeat(40) })).status,
  ).toBe(200);
});

it("accepts permanent strategy work with real configuration and no rollout flag", async () => {
  delete process.env.UZZINA_DURABLE_STRATEGIES;
  expect(
    (await request(handler, { query: { capability: "true" } })).body,
  ).toEqual({ configured: true, ready: true });
  expect(
    (await request(handler, { method: "POST", body: accept })).status,
  ).toBe(202);
});
it("runs the configured permanent worker with its valid secret and no rollout flag", async () => {
  delete process.env.UZZINA_DURABLE_STRATEGIES;
  expect(
    (await request(worker, { method: "POST", token: "s".repeat(40) })).status,
  ).toBe(200);
  expect(events[0]?.name).toBe("claim_strategy_operation");
});
