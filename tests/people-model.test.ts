import { describe, expect, test } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getAllPeople,
  getVisiblePeople,
  updateMyPreferences,
} from "~/models/people";

function client(rpcResult: { data: unknown; error: unknown }) {
  const calls: { filters: string[]; rpc?: [string, unknown] } = { filters: [] };
  const chain = {
    select: () => chain,
    eq: (key: string, value: unknown) => {
      calls.filters.push(`eq:${key}=${String(value)}`);
      return chain;
    },
    order: async (key: string) => {
      calls.filters.push(`order:${key}`);
      return { data: [{ name: "A" }], error: null };
    },
  };
  const supabase = {
    from: () => chain,
    rpc: async (name: string, args: unknown) => {
      calls.rpc = [name, args];
      return rpcResult;
    },
  } as unknown as SupabaseClient;
  return { supabase, calls };
}

describe("people model", () => {
  test("visible people are filtered and ordered by name", async () => {
    const { supabase, calls } = client({ data: null, error: null });
    expect(await getVisiblePeople(supabase)).toEqual([{ name: "A" }] as never);
    expect(calls.filters).toEqual(["eq:visible=true", "order:name"]);
  });
  test("all people are not filtered", async () => {
    const { supabase, calls } = client({ data: null, error: null });
    await getAllPeople(supabase);
    expect(calls.filters).toEqual(["order:name"]);
  });
});

describe("updateMyPreferences", () => {
  test("sends the patch to the RPC and returns the stored record", async () => {
    const { supabase, calls } = client({
      data: { theme: "dark" },
      error: null,
    });
    expect(await updateMyPreferences(supabase, { theme: "dark" })).toEqual({
      theme: "dark",
    });
    expect(calls.rpc).toEqual([
      "update_my_preferences",
      { p_patch: { theme: "dark" } },
    ]);
  });
  test("throws on RPC error and on an invalid confirmation", async () => {
    const failure = new Error("denied");
    await expect(
      updateMyPreferences(client({ data: null, error: failure }).supabase, {}),
    ).rejects.toBe(failure);
    for (const data of [null, [], "x"]) {
      await expect(
        updateMyPreferences(client({ data, error: null }).supabase, {}),
      ).rejects.toThrow("Invalid preferences confirmation");
    }
  });
});
