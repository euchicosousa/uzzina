import { afterEach, expect, it, spyOn } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { recordAIUsage } from "../server/ai-usage";
import { getAgencyAIUsage } from "../app/models/ai-usage";

const errors = spyOn(console, "error").mockImplementation(() => {});
afterEach(() => errors.mockClear());

function clientWithRPC(
  rpc: (name: string, args?: Record<string, unknown>) => Promise<unknown>,
) {
  return { rpc } as unknown as SupabaseClient;
}
const usage = {
  prompt_tokens: 120,
  completion_tokens: 30,
  total_tokens: 150,
  prompt_tokens_details: { cached_tokens: 20 },
};

it("records real provider tokens, including cache as a subset, and the exact server-side cost", async () => {
  const calls: Record<string, unknown>[] = [];
  const client = clientWithRPC(async (name, args) => {
    expect(name).toBe("record_ai_generation");
    calls.push(args ?? {});
    return { error: null };
  });
  expect(
    await recordAIUsage(
      client,
      { userId: "member", intent: "ai-caption" },
      usage,
      "gpt-6-luna",
    ),
  ).toBe(true);
  expect(calls).toHaveLength(1);
  expect(calls[0]).toMatchObject({
    p_user_id: "member",
    p_prompt_tokens: 120,
    p_completion_tokens: 30,
    p_total_tokens: 150,
    p_cached_tokens: 20,
    p_meter: { cost_nanos: 25200 },
  });
  expect(calls[0]).not.toHaveProperty("p_units_consumed");
});
it("missing provider usage remains unknown rather than invented zero tokens", async () => {
  const client = clientWithRPC(async (_name, args) => {
    expect(args).toMatchObject({
      p_prompt_tokens: null,
      p_completion_tokens: null,
      p_total_tokens: null,
      p_cached_tokens: null,
      p_meter: { cost_nanos: null, tariff: null },
    });
    return { error: null };
  });
  expect(
    await recordAIUsage(
      client,
      { userId: "member", intent: "ai-caption" },
      undefined,
      "gpt-6-luna",
    ),
  ).toBe(true);
});
it("returned RPC errors retry the same event and never reject a valid generation", async () => {
  const ids: unknown[] = [];
  const client = clientWithRPC(async (_name, args) => {
    ids.push(args?.p_event_id);
    return { error: { code: "XX000" } };
  });
  expect(
    await recordAIUsage(
      client,
      { userId: "member", intent: "ai-caption" },
      usage,
      "gpt-6-luna",
    ),
  ).toBe(false);
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
  expect(errors).toHaveBeenCalledTimes(1);
});
it("ambiguous transport retries preserve event identity and can recover", async () => {
  const ids: unknown[] = [];
  const client = clientWithRPC(async (_name, args) => {
    ids.push(args?.p_event_id);
    if (ids.length === 1)
      throw new Error("transport failed after possible commit");
    return { error: null };
  });
  expect(
    await recordAIUsage(
      client,
      { userId: "member", intent: "ai-caption" },
      usage,
      "gpt-6-luna",
    ),
  ).toBe(true);
  expect(ids[0]).toBe(ids[1]);
});
it("strategy accounting uses the persisted operation and lease, never a browser user identity", async () => {
  const client = clientWithRPC(async (_name, args) => {
    expect(args).toMatchObject({
      p_event_id: "operation",
      p_operation_id: "operation",
      p_lease_id: "lease",
      p_user_id: undefined,
    });
    return { error: null };
  });
  await recordAIUsage(
    client,
    { operationId: "operation", leaseId: "lease", intent: "ai-strategy" },
    usage,
    "gpt-6-luna",
  );
});
it("invalid token values are not accepted as measured token counts", async () => {
  const client = clientWithRPC(async (_name, args) => {
    expect(args).toMatchObject({
      p_prompt_tokens: null,
      p_completion_tokens: null,
      p_total_tokens: null,
    });
    return { error: null };
  });
  await recordAIUsage(
    client,
    { userId: "member", intent: "ai-caption" },
    { prompt_tokens: -1, completion_tokens: 1.5, total_tokens: Infinity },
    "gpt-6-luna",
  );
});
it("aggregation errors are reported as errors rather than no consumption", async () => {
  const client = clientWithRPC(async () => ({
    data: null,
    error: { code: "PGRST202" },
  }));
  await expect(getAgencyAIUsage(client)).rejects.toThrow(
    "Não foi possível consultar",
  );
});
it("malformed aggregation cannot be rendered as known zero usage", async () => {
  const client = clientWithRPC(async () => ({
    data: { percentage: 0 },
    error: null,
  }));
  await expect(getAgencyAIUsage(client)).rejects.toThrow("medição de IA");
});
it("a valid empty measured period keeps explicit partial coverage metadata", async () => {
  const aggregate = {
    period: "Novembro de 2026",
    percentage: 0,
    total_units: 0,
    reference_units: 1000,
    total_generations: 0,
    incomplete_generations: 0,
    measurement_started_at: "2026-11-05T12:00:00Z",
    partial_period: true,
    updated_at: "2026-11-05T12:00:00Z",
  };
  const client = clientWithRPC(async () => ({ data: aggregate, error: null }));
  expect(await getAgencyAIUsage(client)).toEqual(aggregate);
});

it("separates cache writes, preserves reasoning, and switches tariff above 272k", async () => {
  const calls: unknown[] = [];
  const client = clientWithRPC(async (_name, args) => {
    calls.push(args?.p_meter);
    return { error: null };
  });
  for (const input of [272000, 272001]) {
    await recordAIUsage(
      client,
      { userId: "member", intent: "ai-caption" },
      {
        prompt_tokens: input,
        completion_tokens: 30,
        total_tokens: input + 30,
        prompt_tokens_details: { cached_tokens: 20, cache_write_tokens: 10 },
        completion_tokens_details: { reasoning_tokens: 15 },
      },
      "gpt-6-luna",
      { id: `completion-${input}`, service_tier: "default" },
    );
  }
  expect(calls).toMatchObject([
    {
      cost_nanos: 27213450,
      reasoning_tokens: 15,
      cache_write_tokens: 10,
      provider_id: "completion-272000",
      tariff: { maxInputTokens: 272000 },
    },
    {
      cost_nanos: 54419600,
      reasoning_tokens: 15,
      cache_write_tokens: 10,
      provider_id: "completion-272001",
      tariff: { maxInputTokens: 1050000 },
    },
  ]);
});
