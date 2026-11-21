import { describe, expect, it } from "bun:test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "types/database";
import {
  computeActivePartnerSyncDiff,
  syncCelebrationActivePartners,
} from "~/models/celebrations";

function createControlledSupabase(options: {
  initialLinks: Array<{ partner_id: string; celebration_id: string }>;
  failNextInsert?: boolean;
  failNextDelete?: boolean;
}) {
  let links = options.initialLinks.map((row) => ({ ...row }));
  let failInsert = options.failNextInsert ?? false;
  let failDelete = options.failNextDelete ?? false;
  const insertCalls: Array<{ partner_id: string; celebration_id: string }[]> =
    [];
  const deleteCalls: string[][] = [];

  const supabase = createClient<Database>(
    "https://example.supabase.co",
    "test-anon-key",
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: Object.assign(
          async (input: RequestInfo | URL, init?: RequestInit) => {
            const url = new URL(
              typeof input === "string"
                ? input
                : input instanceof URL
                  ? input.href
                  : input.url,
            );
            const method = (init?.method ?? "GET").toUpperCase();

            if (url.pathname.endsWith("/partner_holidays")) {
              if (method === "GET") {
                const celebrationId = (
                  url.searchParams.get("celebration_id") ?? ""
                ).replace(/^eq\./, "");
                const rows = links
                  .filter((row) => row.celebration_id === celebrationId)
                  .map((row) => ({ partner_id: row.partner_id }));
                return new Response(JSON.stringify(rows), {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                });
              }

              if (method === "POST") {
                const body = JSON.parse(String(init?.body ?? "[]")) as Array<{
                  partner_id: string;
                  celebration_id: string;
                }>;
                insertCalls.push(body);
                if (failInsert) {
                  failInsert = false;
                  return new Response(
                    JSON.stringify({ message: "Controlled insert failure" }),
                    {
                      status: 503,
                      headers: { "Content-Type": "application/json" },
                    },
                  );
                }
                for (const row of body) {
                  const exists = links.some(
                    (item) =>
                      item.partner_id === row.partner_id &&
                      item.celebration_id === row.celebration_id,
                  );
                  if (!exists) links.push({ ...row });
                }
                return new Response(null, { status: 201 });
              }

              if (method === "DELETE") {
                const celebrationId = (
                  url.searchParams.get("celebration_id") ?? ""
                ).replace(/^eq\./, "");
                const partnerParam = url.searchParams.get("partner_id") ?? "";
                const ids = partnerParam
                  .replace(/^in\.\(/, "")
                  .replace(/\)$/, "")
                  .split(",")
                  .map((value) => value.replace(/^"|"$/g, ""))
                  .filter(Boolean);
                deleteCalls.push(ids);
                if (failDelete) {
                  failDelete = false;
                  return new Response(
                    JSON.stringify({ message: "Controlled delete failure" }),
                    {
                      status: 503,
                      headers: { "Content-Type": "application/json" },
                    },
                  );
                }
                links = links.filter(
                  (row) =>
                    !(
                      row.celebration_id === celebrationId &&
                      ids.includes(row.partner_id)
                    ),
                );
                return new Response(null, { status: 204 });
              }
            }

            return new Response(JSON.stringify({ message: "Unexpected URL" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          },
          { preconnect: fetch.preconnect },
        ),
      },
    },
  );

  return {
    supabase,
    getLinks: () => links,
    insertCalls,
    deleteCalls,
  };
}

describe("celebration active partners sync (CAL-02)", () => {
  it("preserves inactive partner links while adding and removing active partners", () => {
    const diff = computeActivePartnerSyncDiff(
      ["active-a", "inactive-archived"],
      ["active-a", "active-b", "active-c"],
      ["active-b", "active-b", "inactive-archived"],
    );

    expect(diff.toAdd).toEqual(["active-b"]);
    expect(diff.toRemove).toEqual(["active-a"]);
    expect(diff.desiredActiveIds).toEqual(["active-b"]);
    expect(diff.preservedInactiveIds).toEqual(["inactive-archived"]);
  });

  it("syncs active links, preserves inactive links, and is idempotent after partial failure", async () => {
    const celebrationId = "cel-1";
    const { supabase, getLinks, insertCalls, deleteCalls } =
      createControlledSupabase({
        initialLinks: [
          { partner_id: "active-a", celebration_id: celebrationId },
          { partner_id: "inactive-x", celebration_id: celebrationId },
        ],
        failNextDelete: true,
      });

    // First attempt inserts active-b, then fails while deleting active-a.
    await expect(
      syncCelebrationActivePartners(
        supabase,
        celebrationId,
        ["active-a", "active-b"],
        ["active-b"],
      ),
    ).rejects.toBeDefined();

    // Retry should NOT re-insert active-b, should delete active-a, and keep inactive-x.
    const result = await syncCelebrationActivePartners(
      supabase,
      celebrationId,
      ["active-a", "active-b"],
      ["active-b"],
    );

    expect(insertCalls).toHaveLength(1);
    expect(deleteCalls).toHaveLength(2);
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual(["active-a"]);
    expect(result.preservedInactiveIds).toEqual(["inactive-x"]);
    expect(getLinks()).toEqual([
      { partner_id: "inactive-x", celebration_id: celebrationId },
      { partner_id: "active-b", celebration_id: celebrationId },
    ]);
  });

  it("does not write anything when saving a celebration with no selected partners and no existing links", async () => {
    const celebrationId = "cel-empty";
    const { supabase, getLinks, insertCalls, deleteCalls } =
      createControlledSupabase({
        initialLinks: [],
      });

    const result = await syncCelebrationActivePartners(
      supabase,
      celebrationId,
      ["active-a", "active-b"],
      [],
    );

    expect(insertCalls).toHaveLength(0);
    expect(deleteCalls).toHaveLength(0);
    expect(result.linkedActiveIds).toEqual([]);
    expect(getLinks()).toEqual([]);
  });
});
