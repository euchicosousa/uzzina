import { afterEach, beforeEach, expect, it, mock, spyOn } from "bun:test";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import handler from "../api/strategy-operations";

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
let providerFetch: ReturnType<typeof spyOn<typeof globalThis, "fetch">>;
let providerRequest: unknown;
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
          name === "claim_direct_strategy_operation"
            ? claim
            : name === "retry_strategy_result"
              ? { ...operation, state: "generated", result: strategies }
              : operation,
        error: null,
      };
    },
  }),
}));
beforeEach(() => {
  providerFetch = spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(
      async (...[input, init]: Parameters<typeof fetch>) => {
        expect(String(input)).toBe(
          "https://api.openai.com/v1/chat/completions",
        );
        expect(init?.signal).toBeInstanceOf(AbortSignal);
        providerRequest = JSON.parse(String(init?.body));
        providerCalls++;
        if (providerFails)
          return Response.json(
            {
              error: {
                message: "private provider error",
                type: "server_error",
              },
            },
            { status: 500 },
          );
        return Response.json({
          id: "chatcmpl-strategy",
          model: "gpt-6-luna",
          service_tier: "default",
          choices: [
            {
              message: {
                role: "assistant",
                content: JSON.stringify({ strategies }),
              },
              finish_reason: "stop",
              index: 0,
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
            prompt_tokens_details: { cached_tokens: 20, cache_write_tokens: 5 },
          },
        });
      },
      { preconnect: globalThis.fetch.preconnect },
    ),
  );
  Object.assign(process.env, {
    UZZINA_STRATEGY_ACCEPTING: "true",
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
  providerFetch?.mockRestore();
  for (const key of [
    "UZZINA_DURABLE_STRATEGIES",
    "UZZINA_STRATEGY_ACCEPTING",
    "OPENAI_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "AI_DAILY_LIMIT",
  ]) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});
async function request({
  method = "GET",
  token = "valid",
  query = {},
  body = {},
}: {
  method?: string;
  token?: string | null;
  query?: Record<string, string>;
  body?: unknown;
} = {}) {
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
  await handler(
    {
      method,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
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
  expect((await request({ token: null })).status).toBe(401);
  expect((await request({ token: "invalid" })).status).toBe(401);
  active = false;
  expect((await request({ query: { capability: "true" } })).status).toBe(403);
  expect((await request({ method: "DELETE" })).status).toBe(405);
  expect(events).toHaveLength(0);
});
it("binds acceptance to the authenticated actor and only accepts canonical identity/version", async () => {
  expect((await request({ method: "POST", body: accept })).status).toBe(200);
  expect(events[0]).toEqual({
    name: "accept_direct_strategy_operation",
    args: {
      p_user_id: userId,
      p_action_id: actionId,
      p_operation_id: operationId,
      p_model: "gpt-6-luna",
      p_expected_version: accept.expectedVersion,
    },
  });
  expect(
    (
      await request({
        method: "POST",
        body: { ...accept, userId: randomUUID() },
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await request({
        method: "POST",
        body: { ...accept, partner_context: "forged" },
      })
    ).status,
  ).toBe(400);
  expect(providerCalls).toBe(0);
});
it("keeps status readable while acceptance is disabled for draining", async () => {
  process.env.UZZINA_STRATEGY_ACCEPTING = "false";
  expect((await request({ method: "POST", body: accept })).status).toBe(503);
  expect((await request({ query: { actionId } })).body).toEqual({
    operation,
  });
  expect((await request({ query: { capability: "true" } })).body).toEqual({
    configured: true,
    ready: false,
  });
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
    const response = await request({ method: "POST", body: accept });
    expect(response.status).toBe(expected);
    expect(JSON.stringify(response.body)).not.toContain(code);
  },
);
it("rejects malformed/large bodies and mismatched recovery identity", async () => {
  expect((await request({ method: "POST", body: "{" })).status).toBe(400);
  expect(
    (await request({ method: "POST", body: "x".repeat(2049) })).status,
  ).toBe(413);
  expect(
    (
      await request({
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
it("generates, records usage and saves the requested operation before responding", async () => {
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
  const response = await request({ method: "POST", body: accept });
  expect(response.status).toBe(200);
  expect(events.map((event) => event.name)).toEqual([
    "accept_direct_strategy_operation",
    "claim_direct_strategy_operation",
    "record_ai_generation",
    "store_strategy_result",
    "finish_strategy_operation",
    "read_direct_strategy_operation",
  ]);
  expect(events[2]?.args).toMatchObject({
    p_operation_id: operationId,
    p_prompt_tokens: 100,
    p_cached_tokens: 20,
    p_meter: {
      provider_id: "chatcmpl-strategy",
      service_tier: "default",
      cache_write_tokens: 5,
      cost_nanos: 33_325,
    },
  });
  const claimArgs = events[1]?.args;
  expect(claimArgs).toMatchObject({ p_operation_id: operationId });
  expect(events[2]?.args).toMatchObject({
    p_event_id:
      typeof claimArgs === "object" &&
      claimArgs !== null &&
      "p_lease_id" in claimArgs
        ? claimArgs.p_lease_id
        : undefined,
  });
  expect(events[3]?.args).toMatchObject({ p_result: strategies });
  expect(providerCalls).toBe(1);
  expect(providerRequest).toMatchObject({
    model: "gpt-6-luna",
    service_tier: "default",
    response_format: { type: "json_object" },
  });
});
it("applies a retained result on retry without generating it again", async () => {
  claim = { id: operationId, payload: {}, result: strategies };
  expect(
    (await request({ method: "POST", body: { ...accept, command: "retry" } }))
      .status,
  ).toBe(200);
  expect(events.map((event) => event.name)).toEqual([
    "read_direct_strategy_operation",
    "retry_strategy_result",
    "claim_direct_strategy_operation",
    "finish_strategy_operation",
    "read_direct_strategy_operation",
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
    await request({ method: "POST", body: accept });
    expect(events.at(-2)).toMatchObject({
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
  await request({ method: "POST", body: accept });
  expect(providerCalls).toBe(1);
  expect(events.at(-2)).toMatchObject({
    name: "fail_strategy_operation",
    args: { p_code: "PROVIDER_UNCERTAIN" },
  });
});

it("accepts permanent strategy work with real configuration and no rollout flag", async () => {
  delete process.env.UZZINA_DURABLE_STRATEGIES;
  expect((await request({ query: { capability: "true" } })).body).toEqual({
    configured: true,
    ready: true,
  });
  expect((await request({ method: "POST", body: accept })).status).toBe(200);
});
it("accounting failure does not prevent retaining and applying a generated strategy result", async () => {
  claim = {
    id: operationId,
    payload: {
      intent: "ai-strategy",
      category: "post",
      partner_name: "Hospital",
    },
    result: null,
  };
  failRPC = "record_ai_generation";
  const error = spyOn(console, "error").mockImplementation(() => {});
  try {
    expect((await request({ method: "POST", body: accept })).status).toBe(200);
    expect(events.map((event) => event.name)).toEqual([
      "accept_direct_strategy_operation",
      "claim_direct_strategy_operation",
      "record_ai_generation",
      "record_ai_generation",
      "store_strategy_result",
      "finish_strategy_operation",
      "read_direct_strategy_operation",
    ]);
    expect(providerCalls).toBe(1);
  } finally {
    error.mockRestore();
  }
});
