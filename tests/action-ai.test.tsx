import "./dom-setup";
import {
  afterAll,
  afterEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import { resetQuerySession } from "~/lib/query-client";
import type { Action, Partner } from "~/types";

let nextOutput: unknown = { caption: "Legenda gerada" };
let calls: unknown[] = [];
let strategyCalls = 0;
let responseGate: Promise<void> | undefined;
let nextError: Error | undefined;
const notifications = spyOn(toast, "error").mockReturnValue("test-toast");
afterAll(() => notifications.mockRestore());
afterEach(() => {
  responseGate = undefined;
  nextError = undefined;
});
// Only the external AI boundary is controlled; the hook and its state logic are real.
mock.module("~/services/ai-client", () => ({
  callAI: async (payload: unknown) => {
    calls.push(payload);
    await responseGate;
    if (nextError) throw nextError;
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
  title: "Hospital Dr. Thomaz Corrêa",
  context: "Contexto",
  instagram_caption_tail: "#tail",
} as unknown as Partner;

function setup(
  initialAction = action,
  initialPartners = [partner],
  accepted = true,
) {
  calls = [];
  strategyCalls = 0;
  notifications.mockClear();
  const updates: Record<string, unknown>[] = [];
  const modalChanges: boolean[] = [];
  const queryClient = new QueryClient();
  const raws: ((prev: Action) => Action)[] = [];
  const { result, rerender, unmount } = renderHook(
    (props: { action: Action; currentPartners: Partner[] }) =>
      useActionAI({
        action: props.action,
        queryClient,
        rawActionRef: { current: props.action },
        descriptionRef: { current: "desc" },
        contentDescriptionRef: { current: "content" },
        currentPartners: props.currentPartners,
        setRawAction: (value) => {
          if (typeof value === "function") raws.push(value);
        },
        updateAction: async (data) => {
          updates.push(data ?? {});
          return null;
        },
        setIsStrategyModalOpen: (open) => modalChanges.push(open),
        setDescriptionVersion: () => {},
        startDurableStrategy: async () => {
          strategyCalls++;
          await responseGate;
          if (nextError) throw nextError;
          return accepted;
        },
      }),
    {
      initialProps: { action: initialAction, currentPartners: initialPartners },
    },
  );
  return {
    result,
    updates,
    raws,
    rerender,
    unmount,
    modalChanges,
    queryClient,
  };
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
      partner_name: "Hospital Dr. Thomaz Corrêa",
      partner_context: "Contexto — post",
    });
    expect(updates).toEqual([{ instagram_caption: "Legenda gerada\n\n#tail" }]);
    expect(result.current.isAIProcessing).toBe(false);
    expect(result.current.activeAIIntent).toBeNull();
  });

  it.each(["ai-hooks", "ai-content", "ai-caption"])(
    "sends the first current partner identity for %s, even without context",
    async (intent) => {
      nextOutput = { content: "<p>Texto</p>", caption: "Legenda" };
      const { result } = setup(action, [
        { ...partner, context: "" },
        { ...partner, slug: "agency", title: "Agência CNVT" },
      ]);
      await act(async () => {
        await result.current.triggerAIAction(intent, {
          partner_name: "Parceiro incorreto",
        });
      });
      expect(calls[0]).toMatchObject({
        intent,
        partner_name: "Hospital Dr. Thomaz Corrêa",
      });
    },
  );

  it.each([
    { currentPartners: [] },
    { currentPartners: [{ ...partner, title: "  " }] },
  ])(
    "does not send or persist generation without a named current partner",
    async ({ currentPartners }) => {
      const { result, updates, raws } = setup(action, [...currentPartners]);
      await act(async () => {
        await result.current.triggerAIAction("ai-caption");
      });
      expect(calls).toEqual([]);
      expect(updates).toEqual([]);
      expect(raws).toEqual([]);
      expect(notifications).toHaveBeenCalledWith(
        "Selecione um parceiro com nome válido antes de gerar conteúdo com IA. Seu texto foi mantido.",
      );
      expect(result.current.isAIProcessing).toBe(false);
    },
  );

  it("uses the changed partner after rerender and preserves it after reopening", async () => {
    nextOutput = { caption: "Legenda hospitalar" };
    const agency = { ...partner, title: "Agência CNVT", slug: "agency" };
    const initial = setup({ ...action, partners: [agency.slug] }, [agency]);
    initial.rerender({ action, currentPartners: [partner] });
    await act(async () => {
      await initial.result.current.triggerAIAction("ai-caption");
    });
    expect(calls[0]).toMatchObject({ partner_name: partner.title });
    expect(initial.updates).toEqual([
      { instagram_caption: "Legenda hospitalar\n\n#tail" },
    ]);
    initial.unmount();
    const reopened = setup();
    await act(async () => {
      await reopened.result.current.triggerAIAction("ai-caption");
    });
    expect(calls[0]).toMatchObject({ partner_name: partner.title });
  });

  it("keeps independently mounted action partners and caption tails separate", async () => {
    const primary = setup();
    const secondary = setup({ ...action, id: "a2", partners: ["agency"] }, [
      {
        ...partner,
        slug: "agency",
        title: "Agência CNVT",
        instagram_caption_tail: "#cnvt",
      },
    ]);
    nextOutput = { caption: "Legenda" };
    await act(async () => {
      await primary.result.current.triggerAIAction("ai-caption");
      await secondary.result.current.triggerAIAction("ai-caption");
    });
    expect(calls).toMatchObject([
      { partner_name: partner.title },
      { partner_name: "Agência CNVT" },
    ]);
    expect(primary.updates).toEqual([
      { instagram_caption: "Legenda\n\n#tail" },
    ]);
    expect(secondary.updates).toEqual([
      { instagram_caption: "Legenda\n\n#cnvt" },
    ]);
  });

  it("keeps the publisher identity and caption tail paired while a request is in flight", async () => {
    let release = () => {};
    responseGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    nextOutput = { caption: "Legenda hospitalar" };
    const { result, rerender, updates } = setup();
    let pending: Promise<unknown> = Promise.resolve();
    act(() => {
      pending = result.current.triggerAIAction("ai-caption");
    });
    rerender({
      action: { ...action, partners: ["agency"] },
      currentPartners: [
        {
          ...partner,
          slug: "agency",
          title: "Agência CNVT",
          instagram_caption_tail: "#cnvt",
        },
      ],
    });
    await act(async () => {
      release();
      await pending;
    });
    expect(calls[0]).toMatchObject({ partner_name: partner.title });
    expect(updates).toEqual([
      { instagram_caption: "Legenda hospitalar\n\n#tail" },
    ]);
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

const strategyOutput = Array.from({ length: 5 }, (_, i) => ({
  headline: `Strategy ${i + 1}`,
  angulo: "Angle",
  racional: "Rationale",
  direcionamento: "Direction",
}));
it("opens strategy progress before generation and never reopens it on completion", async () => {
  let release = () => {};
  responseGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  nextOutput = strategyOutput;
  const { result, modalChanges, raws } = setup();
  let pending: Promise<unknown> = Promise.resolve();
  act(() => {
    pending = result.current.triggerAIAction("ai-strategy");
  });
  expect(modalChanges).toEqual([true]);
  expect(result.current.strategyGeneration.phase).toBe("generating");
  await act(async () => {
    release();
    await pending;
  });
  expect(modalChanges).toEqual([true]);
  expect(raws).toHaveLength(0);
  expect(calls).toHaveLength(0);
  expect(strategyCalls).toBe(1);
  expect(result.current.strategyGeneration.phase).toBe("idle");
});
it("keeps prior strategies untouched and exposes a retryable generation error", async () => {
  nextError = new Error("Provider unavailable");
  const { result, updates, raws, modalChanges } = setup({
    ...action,
    strategies: strategyOutput,
  });
  await act(async () => {
    await result.current.triggerAIAction("ai-strategy");
  });
  expect(result.current.strategyGeneration.phase).toBe("generation-error");
  expect(result.current.strategyGeneration.error).toBe("Provider unavailable");
  expect(updates).toEqual([]);
  expect(raws).toEqual([]);
  expect(modalChanges).toEqual([true]);
});
it.each(["unmount", "session-reset"] as const)(
  "ignores late strategy generation after %s",
  async (change) => {
    let release = () => {};
    responseGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    nextOutput = strategyOutput;
    const fixture = setup();
    let pending: Promise<unknown> = Promise.resolve();
    act(() => {
      pending = fixture.result.current.triggerAIAction("ai-strategy");
    });
    if (change === "unmount") fixture.unmount();
    else resetQuerySession(fixture.queryClient);
    await act(async () => {
      release();
      await pending;
    });
    expect(fixture.updates).toEqual([]);
    expect(fixture.raws).toEqual([]);
  },
);

it("keeps independent strategy panels isolated when one unmounts during generation", async () => {
  let release = () => {};
  responseGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  nextOutput = strategyOutput;
  const primary = setup();
  const secondary = setup({ ...action, id: "a2" });
  let first: Promise<unknown> = Promise.resolve();
  let second: Promise<unknown> = Promise.resolve();
  act(() => {
    first = primary.result.current.triggerAIAction("ai-strategy");
    second = secondary.result.current.triggerAIAction("ai-strategy");
  });
  expect(strategyCalls).toBe(2);
  expect(calls).toHaveLength(0);
  primary.unmount();
  await act(async () => {
    release();
    await Promise.all([first, second]);
  });
  expect(primary.updates).toEqual([]);
  expect(secondary.updates).toHaveLength(0);
  expect(secondary.modalChanges).toEqual([true]);
});

it("never falls back to browser generation when the strategy adapter returns without an acceptance value", async () => {
  const fixture = setup(action, [partner], false);
  await act(async () => {
    await fixture.result.current.triggerAIAction("ai-strategy");
  });
  expect(strategyCalls).toBe(1);
  expect(calls).toHaveLength(0);
  expect(fixture.updates).toHaveLength(0);
  expect(fixture.result.current.strategyGeneration.phase).toBe("idle");
});
