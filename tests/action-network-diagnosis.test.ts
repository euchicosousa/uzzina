import { beforeEach, expect, it, mock } from "bun:test";
import type { Action } from "../app/types";
import { createActionDraft } from "../app/utils/factory";
import { INTENT } from "../app/lib/CONSTANTS";

let rows: Action[] = [];
let loseNextWriteResponse = false;
let inserts = 0;
let updates = 0;
let sequence = 0;

mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => ({
    from: () => {
      const filters: Array<[string, unknown]> = [];
      let operation = "read";
      let values: Record<string, unknown> = {};
      const chain = {
        select: () => chain,
        eq: (field: string, value: unknown) => {
          filters.push([field, value]);
          return chain;
        },
        update: (patch: Record<string, unknown>) => {
          operation = "update";
          values = patch;
          return chain;
        },
        insert: (payload: Record<string, unknown>) => {
          operation = "insert";
          values = payload;
          return chain;
        },
        single: async () => {
          let row = rows.find((candidate) =>
            filters.every(([field, value]) =>
              Object.entries(candidate).some(
                ([key, entry]) => key === field && entry === value,
              ),
            ),
          );
          if (operation === "insert") {
            inserts++;
            row = {
              ...values,
              id: `created-${++sequence}`,
            } as unknown as Action;
            rows.push(row);
          } else if (operation === "update" && row) {
            updates++;
            Object.assign(row, values, { updated_at: `version-${++sequence}` });
          }
          if (!row) return { data: null, error: { code: "PGRST116" } };
          if (operation !== "read" && loseNextWriteResponse) {
            loseNextWriteResponse = false;
            throw new TypeError("Failed to fetch");
          }
          return { data: structuredClone(row), error: null };
        },
      };
      return chain;
    },
  }),
}));

const { updateActionClient, duplicateActionClient, ActionConflictError } =
  await import("../app/lib/supabase.mutations");
const { ActionSaveCoordinator } =
  await import("../app/components/features/action-drawer/action-save-coordinator");

beforeEach(() => {
  sequence = 0;
  inserts = 0;
  updates = 0;
  loseNextWriteResponse = false;
  rows = [
    {
      ...createActionDraft({ userId: "user-1", partners: ["toro"] }),
      id: "original",
      title: "Segurando o burger",
      created_at: "2026-10-05T23:10:40Z",
      updated_at: "version-0",
    },
  ];
});

it("lost update confirmation followed by retry conflicts without inserting a duplicate", async () => {
  const original = structuredClone(rows[0]);
  if (!original) throw new Error("Missing fixture");
  const coordinator = new ActionSaveCoordinator({
    key: original.id,
    initialAction: original,
    writeFn: (payload) => {
      expect(payload.intent).toBe(INTENT.update_action);
      expect(payload.id).toBe(original.id);
      return updateActionClient(
        String(payload.id),
        { description: String(payload.description) },
        String(payload.expectedUpdatedAt),
      );
    },
  });
  loseNextWriteResponse = true;
  await coordinator.scheduleUpdate({
    description: "Saved despite lost response",
  });
  expect(coordinator.getStatus()).toBe("error");
  expect(rows[0]?.description).toBe("Saved despite lost response");
  expect(await coordinator.saveNow()).toBe(false);
  expect(coordinator.getStatus()).toBe("conflict");
  expect(coordinator.getState().errorMessage).toBe(
    new ActionConflictError().message,
  );
  expect(rows).toHaveLength(1);
  expect(inserts).toBe(0);
  expect(updates).toBe(1);
});

it("the explicit duplicate operation creates the copy suffix and a different identity", async () => {
  const duplicate = await duplicateActionClient("original");
  expect(duplicate.id).not.toBe("original");
  expect(duplicate.title).toBe("Segurando o burger (Cópia)");
  expect(inserts).toBe(1);
  expect(rows).toHaveLength(2);
});
