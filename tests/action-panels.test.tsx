import { afterEach, expect, it } from "bun:test";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useActionPanels } from "../app/hooks/useActionPanels";
import { createActionDraft } from "../app/utils/factory";

const action = (id: string) => ({
  ...createActionDraft({ userId: "test-user", partners: ["agency"] }),
  id,
  title: `Action ${id}`,
});
afterEach(cleanup);

it("secondary intent opens the primary space when neither action is open", async () => {
  const { result } = renderHook(() => useActionPanels());
  await act(async () => {
    expect(await result.current.setSecondaryAction(action("a"))).toBe(true);
  });
  expect(result.current.primaryAction?.currentAction.id).toBe("a");
  expect(result.current.secondaryAction).toBeNull();
});

it("secondary opening preserves the primary entry and its guard", async () => {
  const { result } = renderHook(() => useActionPanels(action("a")));
  const primary = result.current.primaryAction;
  if (!primary) throw new Error("Missing primary");
  let called = 0;
  result.current.registerLeaveGuard(primary.key, async () => {
    called++;
    return false;
  });
  await act(async () => {
    expect(await result.current.setSecondaryAction(action("b"))).toBe(true);
  });
  expect(result.current.primaryAction).toBe(primary);
  expect(result.current.secondaryAction?.currentAction.id).toBe("b");
  expect(called).toBe(0);
});

it("ordinary opening replaces only primary; secondary opening replaces only secondary", async () => {
  const { result } = renderHook(() => useActionPanels(action("a")));
  await act(async () => {
    await result.current.setSecondaryAction(action("b"));
  });
  const secondary = result.current.secondaryAction;
  await act(async () => {
    await result.current.setPrimaryAction(action("c"));
  });
  expect(result.current.primaryAction?.currentAction.id).toBe("c");
  expect(result.current.secondaryAction).toBe(secondary);
  const primary = result.current.primaryAction;
  await act(async () => {
    await result.current.setSecondaryAction(action("d"));
  });
  expect(result.current.primaryAction).toBe(primary);
  expect(result.current.secondaryAction?.currentAction.id).toBe("d");
});

it("reopening either existing action only activates its stable entry", async () => {
  const { result } = renderHook(() => useActionPanels(action("a")));
  const primary = result.current.primaryAction;
  await act(async () => {
    await result.current.setSecondaryAction(action("b"));
  });
  const secondary = result.current.secondaryAction;
  await act(async () => {
    await result.current.setSecondaryAction(action("a"));
  });
  expect(result.current.primaryAction).toBe(primary);
  expect(result.current.secondaryAction).toBe(secondary);
  expect(result.current.activeKey).toBe(primary?.key ?? null);
  await act(async () => {
    await result.current.setPrimaryAction(action("b"));
  });
  expect(result.current.primaryAction).toBe(primary);
  expect(result.current.secondaryAction).toBe(secondary);
  expect(result.current.activeKey).toBe(secondary?.key ?? null);
});

it("closing primary preserves secondary without promotion, and later ordinary opening fills primary", async () => {
  const { result } = renderHook(() => useActionPanels(action("a")));
  const primaryKey = result.current.primaryAction?.key;
  if (!primaryKey) throw new Error("Missing primary");
  await act(async () => {
    await result.current.setSecondaryAction(action("b"));
  });
  const secondary = result.current.secondaryAction;
  await act(async () => {
    await result.current.closeAction(primaryKey);
  });
  expect(result.current.primaryAction).toBeNull();
  expect(result.current.secondaryAction).toBe(secondary);
  await act(async () => {
    await result.current.setPrimaryAction(action("c"));
  });
  expect(result.current.primaryAction?.currentAction.id).toBe("c");
  expect(result.current.secondaryAction).toBe(secondary);
});

it("secondary intent replaces an isolated secondary without promoting it", async () => {
  const { result } = renderHook(() => useActionPanels(action("a")));
  const primaryKey = result.current.primaryAction?.key;
  if (!primaryKey) throw new Error("Missing primary");
  await act(async () => {
    await result.current.setSecondaryAction(action("b"));
    await result.current.closeAction(primaryKey);
  });
  await act(async () => {
    await result.current.setSecondaryAction(action("c"));
  });
  expect(result.current.primaryAction).toBeNull();
  expect(result.current.secondaryAction?.currentAction.id).toBe("c");
});

it("a blocked replacement preserves both entries and the active action", async () => {
  const { result } = renderHook(() => useActionPanels(action("a")));
  await act(async () => {
    await result.current.setSecondaryAction(action("b"));
  });
  const { primaryAction, secondaryAction, activeKey } = result.current;
  if (!primaryAction) throw new Error("Missing primary");
  result.current.registerLeaveGuard(primaryAction.key, async () => false);
  await act(async () => {
    expect(await result.current.setPrimaryAction(action("c"))).toBe(false);
  });
  expect(result.current.primaryAction).toBe(primaryAction);
  expect(result.current.secondaryAction).toBe(secondaryAction);
  expect(result.current.activeKey).toBe(activeKey);
});

it("closing all keeps both entries when the second guard fails, then supports retry", async () => {
  const { result } = renderHook(() => useActionPanels(action("a")));
  await act(async () => {
    await result.current.setSecondaryAction(action("b"));
  });
  const { primaryAction, secondaryAction } = result.current;
  if (!primaryAction || !secondaryAction) throw new Error("Missing entries");
  const guards: string[] = [];
  result.current.registerLeaveGuard(primaryAction.key, async () => {
    guards.push("a");
    return true;
  });
  result.current.registerLeaveGuard(secondaryAction.key, async () => {
    guards.push("b");
    return false;
  });
  await act(async () => {
    expect(await result.current.closeAllActions()).toBe(false);
  });
  expect(guards).toEqual(["a", "b"]);
  expect(result.current.primaryAction).toBe(primaryAction);
  expect(result.current.secondaryAction).toBe(secondaryAction);
  result.current.registerLeaveGuard(secondaryAction.key, async () => true);
  await act(async () => {
    expect(await result.current.closeAllActions()).toBe(true);
  });
  expect(result.current.primaryAction).toBeNull();
  expect(result.current.secondaryAction).toBeNull();
});

it("pending close is serialized with opening and repeated close requests", async () => {
  const { result } = renderHook(() => useActionPanels(action("a")));
  const key = result.current.primaryAction?.key;
  if (!key) throw new Error("Missing primary");
  let finish: ((allowed: boolean) => void) | undefined;
  let calls = 0;
  result.current.registerLeaveGuard(key, () => {
    calls++;
    return new Promise<boolean>((resolve) => {
      finish = resolve;
    });
  });
  let closing: Promise<boolean> | undefined;
  act(() => {
    closing = result.current.closeAllActions();
  });
  await act(async () => {
    expect(await result.current.setSecondaryAction(action("b"))).toBe(false);
    expect(await result.current.closeAllActions()).toBe(false);
    finish?.(true);
    expect(await closing).toBe(true);
  });
  expect(calls).toBe(1);
  expect(result.current.primaryAction).toBeNull();
});

it("a reset invalidates pending operations and allows a new identity to open immediately", async () => {
  const { result } = renderHook(() => useActionPanels(action("a")));
  const key = result.current.primaryAction?.key;
  if (!key) throw new Error("Missing primary");
  let finish: ((allowed: boolean) => void) | undefined;
  result.current.registerLeaveGuard(
    key,
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      }),
  );
  let pending: Promise<boolean> | undefined;
  act(() => {
    pending = result.current.setPrimaryAction(action("old-next"));
  });
  await act(async () => {
    result.current.reset();
    await result.current.setPrimaryAction(action("new-user"));
  });
  await act(async () => {
    finish?.(true);
    expect(await pending).toBe(false);
  });
  expect(result.current.primaryAction?.currentAction.id).toBe("new-user");
  expect(result.current.secondaryAction).toBeNull();
});

it("draft confirmation updates deduplication without changing its entry key", async () => {
  const draft = createActionDraft({
    userId: "test-user",
    partners: ["agency"],
  });
  const { result } = renderHook(() => useActionPanels(draft));
  const entry = result.current.primaryAction;
  if (!entry) throw new Error("Missing draft");
  act(() => {
    result.current.updateAction(entry.key, {
      ...draft,
      id: "created",
      title: "Created action",
    });
  });
  await act(async () => {
    await result.current.setSecondaryAction(action("created"));
  });
  expect(result.current.primaryAction?.key).toBe(entry.key);
  expect(result.current.primaryAction?.currentAction.id).toBe("created");
  expect(result.current.secondaryAction).toBeNull();
});

it("each entry retains its own view and updates cannot reach a replaced entry", async () => {
  const { result } = renderHook(() => useActionPanels(action("a")));
  const key = result.current.primaryAction?.key;
  if (!key) throw new Error("Missing primary");
  act(() => {
    result.current.setView(key, "instagram");
  });
  await act(async () => {
    await result.current.setSecondaryAction(action("b"));
  });
  expect(result.current.primaryAction?.view).toBe("instagram");
  expect(result.current.secondaryAction?.view).toBe("essential");
  await act(async () => {
    await result.current.setPrimaryAction(action("c"));
  });
  act(() => {
    result.current.updateAction(key, action("late-a"));
  });
  expect(result.current.primaryAction?.currentAction.id).toBe("c");
});
