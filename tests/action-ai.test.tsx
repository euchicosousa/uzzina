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
import type { Action, Partner } from "~/types";

let nextOutput: unknown = { caption: "Legenda gerada" };
let calls: unknown[] = [];
let responseGate: Promise<void> | undefined;
const notifications = spyOn(toast, "error").mockReturnValue("test-toast");
afterAll(() => notifications.mockRestore());
afterEach(() => {
  responseGate = undefined;
});
// Only the external AI boundary is controlled; the hook and its state logic are real.
mock.module("~/services/ai-client", () => ({
  callAI: async (payload: unknown) => {
    calls.push(payload);
    await responseGate;
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

function setup(initialAction = action, initialPartners = [partner]) {
  calls = [];
  notifications.mockClear();
  const updates: Record<string, unknown>[] = [];
  const raws: ((prev: Action) => Action)[] = [];
  const { result, rerender, unmount } = renderHook(
    (props: { action: Action; currentPartners: Partner[] }) =>
      useActionAI({
        action: props.action,
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
        setIsStrategyModalOpen: () => {},
        setDescriptionVersion: () => {},
      }),
    {
      initialProps: { action: initialAction, currentPartners: initialPartners },
    },
  );
  return { result, updates, raws, rerender, unmount };
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

  it.each(["ai-strategy", "ai-hooks", "ai-content", "ai-caption"])(
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
