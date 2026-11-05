import "./dom-setup";
import { afterEach, beforeEach, expect, it, mock, spyOn } from "bun:test";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { resetQuerySession } from "~/lib/query-client";
import type { StrategyOperation } from "~/lib/strategy-operation-contract";
import { calendarAction } from "./fixtures/calendar-height";
import { useDurableStrategies } from "~/components/features/action-drawer/useDurableStrategies";
import type { Action } from "~/types";

mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getSession: async () => ({
        data: { session: { access_token: "fixture-token" } },
      }),
    },
  }),
}));
let legacyCalls = 0;
mock.module("~/services/ai-client", () => ({
  callAI: async () => {
    legacyCalls++;
    return { intent: "ai-strategy", output: { strategies: [] } };
  },
}));
const { useActionAI } =
  await import("~/components/features/action-drawer/useActionAI");
const actionId = "10000000-0000-4000-8000-000000000001";
const operationId = "20000000-0000-4000-8000-000000000001";
const strategies = Array.from({ length: 5 }, (_, index) => ({
  headline: `Headline ${index}`,
  angulo: "Angle",
  racional: "Reason",
  direcionamento: "Direction",
}));
const action: Action = {
  ...calendarAction(1),
  id: actionId,
  updated_at: "2026-10-31T12:00:00.000001",
};
const accepted: StrategyOperation = {
  id: operationId,
  actionId,
  state: "queued",
  result: null,
  errorCode: null,
  createdAt: "2026-10-31T12:00:00Z",
  updatedAt: "2026-10-31T12:00:00Z",
};
const originalFetch = globalThis.fetch;
let serverOperation: StrategyOperation | null;
let ready: boolean;
let posts: Record<string, unknown>[];
let fetches: string[];
let failAccept: boolean;
let rejectAccept: boolean;
let rejectRetry: boolean;
let gate: Promise<void> | undefined;
let observedGate: Promise<void> | undefined;
let nextRead: StrategyOperation | null | undefined;
beforeEach(() => {
  serverOperation = null;
  ready = true;
  posts = [];
  fetches = [];
  failAccept = false;
  rejectAccept = false;
  rejectRetry = false;
  gate = undefined;
  observedGate = undefined;
  nextRead = undefined;
  legacyCalls = 0;
  globalThis.fetch = (async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const url = String(input);
    fetches.push(url);
    expect(url.startsWith("/api/strategy-operations")).toBe(true);
    expect(new Headers(init?.headers).get("Authorization")).toBe(
      "Bearer fixture-token",
    );
    if (url.includes("capability=true")) {
      await gate;
      return Response.json({ configured: true, ready });
    }
    if (init?.method === "POST") {
      const body: unknown = JSON.parse(String(init.body));
      if (!body || typeof body !== "object")
        throw new Error("Invalid fixture request");
      posts.push({ ...body });
      if (rejectAccept)
        return Response.json(
          { error: "Action version changed" },
          { status: 409 },
        );
      if (rejectRetry && "command" in body && body.command === "retry")
        return Response.json(
          { error: "Source review required" },
          { status: 409 },
        );
      if (failAccept) throw new TypeError("fixture connection lost");
      serverOperation = {
        ...accepted,
        id:
          "operationId" in body && typeof body.operationId === "string"
            ? body.operationId
            : operationId,
      };
      nextRead = serverOperation;
      return Response.json({ operation: serverOperation });
    }
    const captured = nextRead === undefined ? serverOperation : nextRead;
    await observedGate;
    return Response.json({ operation: captured });
  }) as typeof fetch;
});
afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});
function mount({
  isActive = true,
  saved = action,
}: { isActive?: boolean; saved?: Action | null } = {}) {
  const client = new QueryClient();
  let preparations = 0;
  let completions = 0;
  const result = renderHook(
    (props: { active: boolean }) =>
      useDurableStrategies({
        actionId: saved?.id,
        isActive: props.active,
        queryClient: client,
        prepareAction: async () => {
          preparations++;
          return saved;
        },
        onComplete: () => {
          completions++;
        },
      }),
    { initialProps: { active: isActive } },
  );
  return {
    ...result,
    client,
    preparations: () => preparations,
    completions: () => completions,
  };
}
it("accepts only after canonical save and releases browser dependence", async () => {
  const fixture = mount();
  await act(async () => {
    expect(await fixture.result.current.start()).toBe(true);
  });
  expect(fixture.preparations()).toBe(1);
  expect(posts[0]).toMatchObject({
    command: "accept",
    actionId,
    expectedVersion: action.updated_at,
  });
  expect(posts[0]).not.toHaveProperty("description");
  expect(fixture.result.current.pending).toBe(true);
  fixture.unmount();
  serverOperation = { ...accepted, state: "succeeded", result: strategies };
  nextRead = serverOperation;
  const reopened = mount();
  await waitFor(() =>
    expect(reopened.result.current.operation?.state).toBe("succeeded"),
  );
  expect(reopened.result.current.operation?.result).toHaveLength(5);
  expect(reopened.completions()).toBe(1);
  expect(posts).toHaveLength(1);
});
it("never submits orphan work when draft creation/save fails", async () => {
  const { result } = mount({ saved: null });
  await expect(result.current.start()).rejects.toThrow("Salve a ação");
  expect(posts).toHaveLength(0);
});
it("configured but unavailable work never falls back, even with an existing pending job", async () => {
  ready = false;
  serverOperation = { ...accepted, state: "generating" };
  const fixture = mount();
  await waitFor(() => expect(fixture.result.current.pending).toBe(true));
  await expect(fixture.result.current.start()).rejects.toThrow(
    "temporariamente indisponível",
  );
  expect(fixture.result.current.pending).toBe(true);
  expect(fixture.preparations()).toBe(0);
  expect(posts).toHaveLength(0);
});
it("reuses operation identity after ambiguous acceptance and never sends editorial inputs", async () => {
  const fixture = mount();
  failAccept = true;
  await expect(fixture.result.current.start()).rejects.toThrow(
    "connection lost",
  );
  failAccept = false;
  await act(async () => {
    await fixture.result.current.start();
  });
  expect(posts).toHaveLength(2);
  expect(posts[1]?.operationId).toBe(posts[0]?.operationId);
  expect(Object.keys(posts[1] ?? {}).sort()).toEqual([
    "actionId",
    "command",
    "expectedVersion",
    "operationId",
  ]);
});
it("discards old-session reads and does not notify completion in the new session", async () => {
  let release: (() => void) | undefined;
  observedGate = new Promise((resolve) => {
    release = resolve;
  });
  serverOperation = { ...accepted, state: "succeeded", result: strategies };
  const fixture = mount();
  await waitFor(() =>
    expect(fetches.some((url) => url.includes("actionId="))).toBe(true),
  );
  await act(async () => {
    resetQuerySession(fixture.client);
    release?.();
  });
  expect(fixture.result.current.operation).toBeNull();
  expect(fixture.completions()).toBe(0);
});
it("does not poll an inactive action and recovers when it becomes active", async () => {
  serverOperation = accepted;
  const fixture = mount({ isActive: false });
  expect(fetches).toHaveLength(0);
  fixture.rerender({ active: true });
  await waitFor(() =>
    expect(fixture.result.current.operation?.id).toBe(operationId),
  );
  fixture.rerender({ active: false });
  const count = fetches.length;
  await new Promise((resolve) => setTimeout(resolve, 25));
  expect(fetches).toHaveLength(count);
});
it("applies preserved results through explicit retry without a model request", async () => {
  serverOperation = {
    ...accepted,
    state: "conflict",
    result: strategies,
    errorCode: "SOURCE_CHANGED",
  };
  const fixture = mount();
  await waitFor(() =>
    expect(fixture.result.current.operation?.state).toBe("conflict"),
  );
  await act(async () => {
    await fixture.result.current.retry(true);
  });
  expect(posts[0]).toMatchObject({
    command: "retry",
    confirmChangedSource: true,
    expectedVersion: action.updated_at,
  });
  expect(legacyCalls).toBe(0);
});
it("the real AI hook releases its leave guard after acceptance and never calls the browser generation endpoint", async () => {
  const client = new QueryClient();
  const modal: boolean[] = [];
  const fixture = renderHook(() => {
    const durable = useDurableStrategies({
      actionId,
      isActive: true,
      queryClient: client,
      prepareAction: async () => action,
      onComplete() {},
    });
    const ai = useActionAI({
      action,
      queryClient: client,
      rawActionRef: { current: action },
      descriptionRef: { current: "Brief" },
      contentDescriptionRef: { current: "Content" },
      currentPartners: [],
      setRawAction() {},
      updateAction: async () => action,
      setIsStrategyModalOpen: (open) => modal.push(open),
      setDescriptionVersion() {},
      startDurableStrategy: durable.start,
    });
    return { ai, durable };
  });
  await act(async () => {
    await fixture.result.current.ai.triggerAIAction("ai-strategy");
  });
  expect(fixture.result.current.ai.aiProcessingRef.current).toBe(false);
  expect(fixture.result.current.ai.strategyGeneration.phase).toBe("idle");
  expect(fixture.result.current.durable.pending).toBe(true);
  expect(modal).toEqual([true]);
  expect(legacyCalls).toBe(0);
});

it("refreshes the saved version while preserving the UUID after an unaccepted ambiguous request", async () => {
  let saved = action;
  const client = new QueryClient();
  const fixture = renderHook(() =>
    useDurableStrategies({
      actionId,
      isActive: true,
      queryClient: client,
      prepareAction: async () => saved,
      onComplete() {},
    }),
  );
  failAccept = true;
  await expect(fixture.result.current.start()).rejects.toThrow(
    "connection lost",
  );
  saved = { ...action, updated_at: "2026-10-31T12:05:00.000001" };
  failAccept = false;
  await act(async () => {
    await fixture.result.current.start();
  });
  expect(posts[1]?.operationId).toBe(posts[0]?.operationId);
  expect(posts[1]?.expectedVersion).toBe(saved.updated_at);
});
it("allows corrected retry after a definite version rejection", async () => {
  const fixture = mount();
  rejectAccept = true;
  await expect(fixture.result.current.start()).rejects.toThrow(
    "version changed",
  );
  rejectAccept = false;
  await act(async () => {
    await fixture.result.current.start();
  });
  expect(posts[1]?.operationId).not.toBe(posts[0]?.operationId);
});
it("acknowledges an ambiguously accepted operation and permits a genuinely new generation after it finishes", async () => {
  const fixture = mount();
  failAccept = true;
  await expect(fixture.result.current.start()).rejects.toThrow();
  const id = posts[0]?.operationId;
  if (typeof id !== "string") throw new Error("Missing operation id");
  serverOperation = { ...accepted, id, state: "succeeded", result: strategies };
  nextRead = serverOperation;
  await act(async () => fixture.result.current.refresh());
  await waitFor(() => expect(fixture.result.current.reconciled).toBe(true));
  failAccept = false;
  await act(async () => {
    await fixture.result.current.start();
  });
  expect(posts[1]?.operationId).not.toBe(id);
});
it("requests deliberate source review after a failed-result retry detects new edits", async () => {
  serverOperation = {
    ...accepted,
    state: "failed",
    result: strategies,
    errorCode: "SAVE_FAILED",
  };
  const fixture = mount();
  await waitFor(() =>
    expect(fixture.result.current.operation?.state).toBe("failed"),
  );
  rejectRetry = true;
  await act(async () => {
    await fixture.result.current.retry(false);
  });
  expect(fixture.result.current.needsReview).toBe(true);
  rejectRetry = false;
  await act(async () => {
    await fixture.result.current.retry(true);
  });
  expect(posts.at(-1)).toMatchObject({
    command: "retry",
    confirmChangedSource: true,
  });
});

it("uses the durable endpoint permanently without a frontend rollout switch", async () => {
  const client = new QueryClient();
  const fixture = renderHook(() =>
    useDurableStrategies({
      actionId,
      isActive: true,
      queryClient: client,
      prepareAction: async () => action,
      onComplete() {},
    }),
  );
  await act(async () => {
    expect(await fixture.result.current.start()).toBe(true);
  });
  expect(posts[0]).toMatchObject({ command: "accept", actionId });
  expect(legacyCalls).toBe(0);
});

it.each(["generated", "conflict", "failed", "uncertain"] as const)(
  "refreshes usage once for a %s operation without reporting successful completion",
  async (state) => {
    serverOperation = { ...accepted, state, result: strategies };
    const fixture = mount();
    const invalidate = spyOn(fixture.client, "invalidateQueries");
    try {
      await waitFor(() =>
        expect(fixture.result.current.operation?.state).toBe(state),
      );
      expect(invalidate).toHaveBeenCalledTimes(1);
      expect(invalidate.mock.calls[0]?.[0]).toMatchObject({
        queryKey: ["ai-usage"],
      });
      expect(fixture.completions()).toBe(0);
      const before = fetches.length;
      await act(async () => fixture.result.current.refresh());
      await waitFor(() => expect(fetches.length).toBeGreaterThan(before));
      expect(invalidate).toHaveBeenCalledTimes(1);
      expect(fixture.completions()).toBe(0);
    } finally {
      invalidate.mockRestore();
    }
  },
);
