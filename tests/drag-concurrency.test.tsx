import { afterEach, expect, it } from "bun:test";
import { act, cleanup, renderHook } from "@testing-library/react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { Action } from "../app/types";
import { useKanbanDnd } from "../app/hooks/useKanbanDnd";

afterEach(cleanup);
const first = {
  id: "a",
  title: "First",
  date: "2026-10-07 10:15:00",
  phase: "do",
  updated_at: "2026-10-07T10:00:00Z",
} as Action;
const second = { ...first, id: "b", title: "Second" };
function start(id: string): DragStartEvent {
  return {
    activatorEvent: new Event("pointerdown"),
    active: {
      id,
      data: { current: {} },
      rect: { current: { initial: null, translated: null } },
    },
  };
}
function drop(id: string, target: string): DragEndEvent {
  return {
    ...start(id),
    delta: { x: 0, y: 0 },
    collisions: null,
    over: {
      id: target,
      data: { current: {} },
      disabled: false,
      rect: {
        top: 0,
        bottom: 100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
      },
    },
  };
}
function deferred() {
  let resolve: (action: Action) => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<Action>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
it("an earlier save cannot clear another action being dragged", async () => {
  const saving = deferred();
  const { result } = renderHook(() =>
    useKanbanDnd({
      actions: [first, second],
      fieldKey: "phase",
      parseTarget: (id) => id,
      onDrop: () => saving.promise,
    }),
  );
  act(() => result.current.handleDragStart(start("a")));
  let ending: Promise<void>;
  act(() => {
    ending = result.current.handleDragEnd(drop("a", "done"));
  });
  act(() => result.current.handleDragStart(start("b")));
  await act(async () => {
    saving.resolve({ ...first, phase: "done" });
    await ending;
  });
  expect(result.current.activeAction?.id).toBe("b");
});
it("an older failure cannot remove a newer preview of the same action", async () => {
  const one = deferred();
  const two = deferred();
  let writes = 0;
  const { result } = renderHook(() =>
    useKanbanDnd({
      actions: [first],
      fieldKey: "phase",
      parseTarget: (id) => id,
      onDrop: () => (++writes === 1 ? one.promise : two.promise),
    }),
  );
  act(() => result.current.handleDragStart(start("a")));
  let old: Promise<void>;
  let newer: Promise<void>;
  act(() => {
    old = result.current.handleDragEnd(drop("a", "done"));
  });
  act(() => result.current.handleDragStart(start("a")));
  act(() => {
    newer = result.current.handleDragEnd(drop("a", "finished"));
  });
  await act(async () => {
    one.reject(new Error("Unavailable"));
    await old;
  });
  expect(result.current.actionsWithOverrides[0]?.phase).toBe("finished");
  await act(async () => {
    two.resolve({ ...first, phase: "finished" });
    await newer;
  });
});
it("successive moves of one action use the preceding confirmed version", async () => {
  const one = deferred();
  const two = deferred();
  const versions: string[] = [];
  const { result } = renderHook(() =>
    useKanbanDnd({
      actions: [first],
      fieldKey: "phase",
      parseTarget: (id) => id,
      onDrop: (action) => {
        versions.push(action.updated_at);
        return versions.length === 1 ? one.promise : two.promise;
      },
    }),
  );
  act(() => result.current.handleDragStart(start("a")));
  let old: Promise<void>;
  let newer: Promise<void>;
  act(() => {
    old = result.current.handleDragEnd(drop("a", "done"));
  });
  act(() => result.current.handleDragStart(start("a")));
  act(() => {
    newer = result.current.handleDragEnd(drop("a", "finished"));
  });
  expect(versions).toEqual([first.updated_at]);
  await act(async () => {
    one.resolve({
      ...first,
      phase: "done",
      updated_at: "2026-10-07T10:00:00.000001Z",
    });
    await old;
  });
  expect(versions).toEqual([first.updated_at, "2026-10-07T10:00:00.000001Z"]);
  expect(result.current.actionsWithOverrides[0]?.phase).toBe("finished");
  await act(async () => {
    two.resolve({
      ...first,
      phase: "finished",
      updated_at: "2026-10-07T10:00:00.000002Z",
    });
    await newer;
  });
});
it("cancelling a new gesture does not cancel a save already sent", async () => {
  const saving = deferred();
  let writes = 0;
  const { result } = renderHook(() =>
    useKanbanDnd({
      actions: [first, second],
      fieldKey: "phase",
      parseTarget: (id) => id,
      onDrop: () => {
        writes++;
        return saving.promise;
      },
    }),
  );
  act(() => result.current.handleDragStart(start("a")));
  let ending: Promise<void>;
  act(() => {
    ending = result.current.handleDragEnd(drop("a", "done"));
  });
  act(() => result.current.handleDragStart(start("b")));
  act(() => result.current.handleDragCancel());
  expect(result.current.activeAction).toBeUndefined();
  expect(writes).toBe(1);
  await act(async () => {
    saving.resolve({ ...first, phase: "done" });
    await ending;
  });
  expect(writes).toBe(1);
});
it("invalid targets and cancelled gestures never write", async () => {
  let writes = 0;
  const { result } = renderHook(() =>
    useKanbanDnd({
      actions: [first],
      fieldKey: "phase",
      parseTarget: () => undefined,
      onDrop: async () => {
        writes++;
        return first;
      },
    }),
  );
  act(() => result.current.handleDragStart(start("a")));
  await act(async () => {
    await result.current.handleDragEnd(drop("a", "invalid"));
  });
  act(() => result.current.handleDragStart(start("a")));
  act(() => result.current.handleDragCancel());
  expect(writes).toBe(0);
  expect(result.current.activeAction).toBeUndefined();
});
it("a queued move is not sent after a version conflict", async () => {
  const { ActionConflictError } = await import("../app/lib/supabase.mutations");
  const saving = deferred();
  let writes = 0;
  const { result } = renderHook(() =>
    useKanbanDnd({
      actions: [first],
      fieldKey: "phase",
      parseTarget: (id) => id,
      onDrop: () => {
        writes++;
        return saving.promise;
      },
    }),
  );
  act(() => result.current.handleDragStart(start("a")));
  let old: Promise<void>;
  let newer: Promise<void>;
  act(() => {
    old = result.current.handleDragEnd(drop("a", "done"));
  });
  act(() => result.current.handleDragStart(start("a")));
  act(() => {
    newer = result.current.handleDragEnd(drop("a", "finished"));
  });
  await act(async () => {
    saving.reject(new ActionConflictError());
    await old;
    await newer;
  });
  expect(writes).toBe(1);
  expect(result.current.actionsWithOverrides[0]?.phase).toBe("do");
});
