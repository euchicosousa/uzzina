import { afterEach, beforeEach, expect, it, mock, spyOn } from "bun:test";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHmac, randomUUID } from "node:crypto";
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
            usage: {
              prompt_tokens: 100,
              completion_tokens: 50,
              total_tokens: 150,
            },
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
    headers = {},
  }: {
    method?: string;
    token?: string | null;
    query?: Record<string, string>;
    body?: unknown;
    headers?: Record<string, string | string[]>;
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
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
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
  const response = await signedWake();
  expect(response.status).toBe(200);
  expect(events.map((event) => event.name)).toEqual([
    "claim_strategy_operation",
    "record_ai_generation",
    "store_strategy_result",
    "finish_strategy_operation",
  ]);
  expect(events[1]?.args).toMatchObject({
    p_operation_id: operationId,
    p_prompt_tokens: 100,
  });
  const claimArgs = events[0]?.args;
  expect(events[1]?.args).toMatchObject({
    p_event_id:
      typeof claimArgs === "object" &&
      claimArgs !== null &&
      "p_lease_id" in claimArgs
        ? claimArgs.p_lease_id
        : undefined,
  });
  expect(events[2]?.args).toMatchObject({ p_result: strategies });
  expect(providerCalls).toBe(1);
  expect(providerOptions).toMatchObject({ timeout: 90000, maxRetries: 0 });
});
it("reuses a retained result on worker retry without model or quota calls", async () => {
  claim = { id: operationId, payload: {}, result: strategies };
  expect((await signedWake()).status).toBe(200);
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
    await signedWake();
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
  await signedWake();
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
  expect((await signedWake()).status).toBe(200);
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
it("runs the configured permanent worker with a signed wake and no rollout flag", async () => {
  delete process.env.UZZINA_DURABLE_STRATEGIES;
  expect((await signedWake()).status).toBe(200);
  expect(events[0]?.name).toBe("claim_strategy_operation");
});

function signedWakeHeaders(
  timestamp = String(Math.floor(Date.now() / 1000)),
  nonce: string = randomUUID(),
  secret = "s".repeat(40),
  target = "POST:/api/strategy-worker",
) {
  return {
    "x-strategy-timestamp": timestamp,
    "x-strategy-nonce": nonce,
    "x-strategy-signature": createHmac("sha256", secret)
      .update(`${timestamp}:${nonce}:${target}`)
      .digest("hex"),
  };
}
const signedWake = () =>
  request(worker, {
    method: "POST",
    token: null,
    headers: signedWakeHeaders(),
  });
it("accepts a fresh correctly signed worker wake without sending the raw worker key", async () => {
  const response = await signedWake();
  expect(response.status).toBe(200);
  expect(events[0]?.name).toBe("claim_strategy_operation");
});
it("rejects the legacy raw worker bearer even when its key is valid", async () => {
  expect(
    (await request(worker, { method: "POST", token: "s".repeat(40) })).status,
  ).toBe(401);
  expect(events).toHaveLength(0);
});

it.each(["x-strategy-timestamp", "x-strategy-nonce", "x-strategy-signature"])(
  "rejects a signed wake missing %s before any claim",
  async (field) => {
    const headers: Record<string, string> = signedWakeHeaders();
    delete headers[field];
    expect(
      (await request(worker, { method: "POST", token: null, headers })).status,
    ).toBe(401);
    expect(events).toHaveLength(0);
  },
);
it.each(["01", "1.5", "-1", "NaN", "", "9007199254740992"])(
  "rejects noncanonical worker timestamp %s even with its matching signature",
  async (timestamp) => {
    expect(
      (
        await request(worker, {
          method: "POST",
          token: null,
          headers: signedWakeHeaders(timestamp),
        })
      ).status,
    ).toBe(401);
    expect(events).toHaveLength(0);
  },
);
it.each([-61, 61])(
  "rejects a correctly signed wake outside the clock window by %s seconds",
  async (offset) => {
    const timestamp = String(Math.floor(Date.now() / 1000) + offset);
    expect(
      (
        await request(worker, {
          method: "POST",
          token: null,
          headers: signedWakeHeaders(timestamp),
        })
      ).status,
    ).toBe(401);
    expect(events).toHaveLength(0);
  },
);
it.each(["GET:/api/strategy-worker", "POST:/api/another-worker"])(
  "rejects a signature issued for %s",
  async (target) => {
    expect(
      (
        await request(worker, {
          method: "POST",
          token: null,
          headers: signedWakeHeaders(undefined, undefined, undefined, target),
        })
      ).status,
    ).toBe(401);
    expect(events).toHaveLength(0);
  },
);
it.each([
  "timestamp",
  "nonce",
  "signature",
  "secret",
  "array",
  "invalid-nonce",
  "invalid-hex",
])("rejects tampered worker %s before claiming", async (field) => {
  const headers: Record<string, string | string[]> = signedWakeHeaders();
  if (field === "timestamp")
    headers["x-strategy-timestamp"] = String(Math.floor(Date.now() / 1000) + 1);
  if (field === "nonce") headers["x-strategy-nonce"] = randomUUID();
  if (field === "signature") {
    const signature = String(headers["x-strategy-signature"]);
    headers["x-strategy-signature"] =
      (signature.startsWith("0") ? "1" : "0") + signature.slice(1);
  }
  if (field === "secret")
    Object.assign(
      headers,
      signedWakeHeaders(undefined, undefined, "wrong".repeat(10)),
    );
  if (field === "array")
    headers["x-strategy-signature"] = [String(headers["x-strategy-signature"])];
  if (field === "invalid-nonce")
    Object.assign(headers, signedWakeHeaders(undefined, "not-a-uuid"));
  if (field === "invalid-hex") headers["x-strategy-signature"] = "g".repeat(64);
  expect(
    (await request(worker, { method: "POST", token: null, headers })).status,
  ).toBe(401);
  expect(events).toHaveLength(0);
});
it("rejects a raw bearer even when valid signed wake headers are also supplied", async () => {
  expect(
    (
      await request(worker, {
        method: "POST",
        token: "s".repeat(40),
        headers: signedWakeHeaders(),
      })
    ).status,
  ).toBe(401);
  expect(events).toHaveLength(0);
});
it("permits a still-valid signed wake to be delivered again while persisted operation leases own work deduplication", async () => {
  const headers = signedWakeHeaders();
  expect(
    (await request(worker, { method: "POST", token: null, headers })).status,
  ).toBe(200);
  expect(
    (await request(worker, { method: "POST", token: null, headers })).status,
  ).toBe(200);
  expect(events.map((event) => event.name)).toEqual([
    "claim_strategy_operation",
    "claim_strategy_operation",
  ]);
  expect(providerCalls).toBe(0);
});

it.each([-60, 60])(
  "accepts the exact signed clock boundary of %s seconds",
  async (offset) => {
    const now = Math.floor(Date.now() / 1000);
    const clock = spyOn(Date, "now").mockReturnValue(now * 1000);
    try {
      expect(
        (
          await request(worker, {
            method: "POST",
            token: null,
            headers: signedWakeHeaders(String(now + offset)),
          })
        ).status,
      ).toBe(200);
    } finally {
      clock.mockRestore();
    }
  },
);
it.each(["leading-zero", "decimal", "exponent"])(
  "rejects the current timestamp in noncanonical %s notation",
  async (notation) => {
    const now = Math.floor(Date.now() / 1000);
    const timestamp =
      notation === "leading-zero"
        ? `0${now}`
        : notation === "decimal"
          ? `${now}.0`
          : now.toExponential();
    expect(
      (
        await request(worker, {
          method: "POST",
          token: null,
          headers: signedWakeHeaders(timestamp),
        })
      ).status,
    ).toBe(401);
    expect(events).toHaveLength(0);
  },
);

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
    expect((await signedWake()).status).toBe(200);
    expect(events.map((event) => event.name)).toEqual([
      "claim_strategy_operation",
      "record_ai_generation",
      "record_ai_generation",
      "store_strategy_result",
      "finish_strategy_operation",
    ]);
    expect(providerCalls).toBe(1);
  } finally {
    error.mockRestore();
  }
});
