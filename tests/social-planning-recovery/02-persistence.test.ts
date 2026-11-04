import { beforeEach, describe, expect, it } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createSocialPlanClient,
  deleteSocialPlanClient,
  getSocialPlanById,
  listSocialPlansByPartner,
  updateSocialPlanClient,
} from "~/models/social_plans";
import type { SocialPlan } from "~/lib/social-planning/types";

describe("T02 — Canonical Storage & Concurrency Model", () => {
  let mockDatabase: Record<string, SocialPlan[]> = {};

  // Mock Supabase client mimicking Postgres & RLS behavior for social_plans
  function createMockSupabase(): SupabaseClient {
    return {
      from: (table: string) => {
        let filters: ((row: SocialPlan) => boolean)[] = [];
        let orderField = "updated_at";
        let orderAsc = false;

        const chain = {
          select: (_cols?: string) => chain,
          eq: (field: string, value: unknown) => {
            filters.push(
              (row) =>
                (row as unknown as Record<string, unknown>)[field] === value,
            );
            return chain;
          },
          order: (field: string, opts?: { ascending?: boolean }) => {
            orderField = field;
            orderAsc = Boolean(opts?.ascending);
            return chain;
          },
          maybeSingle: async () => {
            const tableRows = mockDatabase[table] || [];
            const filtered = tableRows.filter((r) =>
              filters.every((f) => f(r)),
            );
            return { data: filtered[0] || null, error: null };
          },
          single: async () => {
            const tableRows = mockDatabase[table] || [];
            const filtered = tableRows.filter((r) =>
              filters.every((f) => f(r)),
            );
            if (filtered.length === 0) {
              return {
                data: null,
                error: { message: "Row not found", code: "PGRST116" },
              };
            }
            return { data: filtered[0], error: null };
          },
          insert: (payload: any) => ({
            select: () => ({
              single: async () => {
                const row: SocialPlan = {
                  id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  ...payload,
                };
                if (!mockDatabase[table]) mockDatabase[table] = [];
                mockDatabase[table].push(row);
                return { data: row, error: null };
              },
            }),
          }),
          update: (payload: Record<string, unknown>) => ({
            eq: (f1: string, v1: unknown) => ({
              eq: (f2: string, v2: unknown) => ({
                select: () => ({
                  maybeSingle: async () => {
                    const tableRows = mockDatabase[table] || [];
                    const matchIndex = tableRows.findIndex(
                      (r) =>
                        (r as unknown as Record<string, unknown>)[f1] === v1 &&
                        (r as unknown as Record<string, unknown>)[f2] === v2,
                    );
                    if (matchIndex === -1) {
                      // 0 rows matched (e.g. version mismatch in CAS)
                      return { data: null, error: null };
                    }
                    const updated = {
                      ...tableRows[matchIndex],
                      ...payload,
                      updated_at: new Date().toISOString(),
                    } as SocialPlan;
                    tableRows[matchIndex] = updated;
                    return { data: updated, error: null };
                  },
                }),
              }),
            }),
          }),
          delete: () => ({
            eq: (field: string, value: unknown) => {
              if (mockDatabase[table]) {
                mockDatabase[table] = mockDatabase[table].filter(
                  (r) =>
                    (r as unknown as Record<string, unknown>)[field] !== value,
                );
              }
              return Promise.resolve({ error: null });
            },
          }),
          then: (
            resolve: (val: { data: SocialPlan[]; error: null }) => void,
          ) => {
            const tableRows = mockDatabase[table] || [];
            const filtered = tableRows.filter((r) =>
              filters.every((f) => f(r)),
            );
            filtered.sort((a, b) => {
              const valA = (a as unknown as Record<string, unknown>)[
                orderField
              ];
              const valB = (b as unknown as Record<string, unknown>)[
                orderField
              ];
              if (orderAsc) return String(valA).localeCompare(String(valB));
              return String(valB).localeCompare(String(valA));
            });
            resolve({ data: filtered, error: null });
          },
        };
        return chain as any;
      },
      rpc: async (_fnName: string, _params: any) => {
        // Mock RPC returning error to exercise direct CAS fallback
        return {
          data: null,
          error: { code: "FALLBACK_TO_DIRECT_CAS", message: "RPC fallback" },
        };
      },
    } as unknown as SupabaseClient;
  }

  beforeEach(() => {
    mockDatabase = {
      social_plans: [
        {
          id: "plan-acme-1",
          partner_slug: "acme",
          user_id: "user-123",
          mode: "period",
          version: 1,
          status: "draft",
          input: { startDate: "2026-11-01", endDate: "2026-11-30" },
          suggestions: [
            {
              id: "sug-1",
              title: "Post 1",
              format: "reels",
              objective: "Obj",
              briefing: "Brief",
              status: "pending",
            },
          ],
          created_at: "2026-11-01T10:00:00Z",
          updated_at: "2026-11-01T10:00:00Z",
        },
        {
          id: "plan-other-brand",
          partner_slug: "other-brand",
          user_id: "user-999",
          mode: "theme",
          version: 1,
          status: "draft",
          input: { theme: "Geral" },
          suggestions: [],
          created_at: "2026-11-01T11:00:00Z",
          updated_at: "2026-11-01T11:00:00Z",
        },
      ],
    };
  });

  it("lists plans strictly scoped by partner and ordered by updated_at descending", async () => {
    const supabase = createMockSupabase();
    const acmePlans = await listSocialPlansByPartner(supabase, "acme");

    expect(acmePlans).toHaveLength(1);
    expect(acmePlans[0].id).toBe("plan-acme-1");
    expect(acmePlans[0].partner_slug).toBe("acme");

    // Zero cross-partner leakage
    const otherPlans = acmePlans.filter(
      (p) => p.partner_slug === "other-brand",
    );
    expect(otherPlans).toHaveLength(0);
  });

  it("returns empty array when partner slug is empty", async () => {
    const supabase = createMockSupabase();
    const plans = await listSocialPlansByPartner(supabase, "");
    expect(plans).toHaveLength(0);
  });

  it("creates a plan with version = 1 and assigned user_id", async () => {
    const supabase = createMockSupabase();
    const newPlan = await createSocialPlanClient(supabase, {
      partner_slug: "acme",
      user_id: "user-123",
      mode: "period",
      input: { postsPerWeek: 3 },
      suggestions: [],
    });

    expect(newPlan.id).toBeDefined();
    expect(newPlan.version).toBe(1);
    expect(newPlan.user_id).toBe("user-123");
    expect(newPlan.status).toBe("draft");

    // Can be retrieved
    const fetched = await getSocialPlanById(supabase, newPlan.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(newPlan.id);
  });

  it("updates plan using Compare-And-Swap (CAS) versioning", async () => {
    const supabase = createMockSupabase();

    // 1. Successful update when expectedVersion === 1
    const result = await updateSocialPlanClient(supabase, "plan-acme-1", 1, {
      status: "finalized",
    });

    expect(result.success).toBe(true);
    expect(result.plan?.version).toBe(2);
    expect(result.plan?.status).toBe("finalized");

    // 2. Reject update when expectedVersion is stale (concurrency conflict)
    // Client B tries to update version 1, but database is now on version 2
    const staleResult = await updateSocialPlanClient(
      supabase,
      "plan-acme-1",
      1,
      {
        status: "draft",
      },
    );

    expect(staleResult.success).toBe(false);
    expect(staleResult.conflict).toBe(true);
    expect(staleResult.currentVersion).toBe(2);
    expect(staleResult.error).toContain("Conflito de concorrência detectado");

    // Verify row was NOT overwritten
    const current = await getSocialPlanById(supabase, "plan-acme-1");
    expect(current?.version).toBe(2);
    expect(current?.status).toBe("finalized");
  });

  it("deletes plan cleanly by ID", async () => {
    const supabase = createMockSupabase();
    await deleteSocialPlanClient(supabase, "plan-acme-1");

    const fetched = await getSocialPlanById(supabase, "plan-acme-1");
    expect(fetched).toBeNull();
  });
});
