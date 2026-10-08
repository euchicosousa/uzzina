import "./dom-setup";
import { describe, expect, it, mock } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import type { Action, Partner } from "~/types";

let nextOutput: unknown = { caption: "Legenda gerada" };
let calls: unknown[] = [];
// Only the external AI boundary is controlled; the hook and its state logic are real.
mock.module("~/services/ai-client", () => ({
  callAI: async (payload: unknown) => {
    calls.push(payload);
    return { intent: "x", output: nextOutput };
  },
}));
const { useActionAI } =
  await import("../app/components/features/action-drawer/useActionAI");

const action = {
  id: "a1",
  title: "Título",
  category: "post",
  description: "desc",
  content_description: "content",
  partners: ["p"],
} as unknown as Action;
const partner = {
  slug: "p",
  context: "Contexto",
  instagram_caption_tail: "#tail",
} as unknown as Partner;

function setup() {
  calls = [];
  const updates: Record<string, unknown>[] = [];
  const raws: ((prev: Action) => Action)[] = [];
  const { result } = renderHook(() =>
    useActionAI({
      action,
      rawActionRef: { current: action },
      descriptionRef: { current: "desc" },
      contentDescriptionRef: { current: "content" },
      currentPartners: [partner],
      setRawAction: (value) => {
        if (typeof value === "function") raws.push(value);
      },
      updateAction: async (data) => {
        updates.push(data ?? {});
        return null;
      },
      setIsStrategyModalOpen: () => {},
      setDescriptionVersion: () => {},
    }),
  );
  return { result, updates, raws };
}

describe("useActionAI", () => {
  it("sends the action context and persists the caption with the partner tail", async () => {
    nextOutput = { caption: "Legenda gerada" };
    const { result, updates } = setup();
    await act(async () => {
      await result.current.triggerAIAction("ai-caption");
    });
    expect(calls[0]).toMatchObject({
      intent: "ai-caption",
      title: "Título",
      category: "post",
      partner_context: "Contexto — post",
    });
    expect(updates).toEqual([{ instagram_caption: "Legenda gerada\n\n#tail" }]);
    expect(result.current.isAIProcessing).toBe(false);
    expect(result.current.activeAIIntent).toBeNull();
  });

  it("ignores a second request while one is running", async () => {
    nextOutput = { caption: "x" };
    const { result } = setup();
    await act(async () => {
      await Promise.all([
        result.current.triggerAIAction("ai-caption"),
        result.current.triggerAIAction("ai-caption"),
      ]);
    });
    expect(calls.length).toBe(1);
  });
});
