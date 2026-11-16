import { describe, expect, it } from "bun:test";
import { buildTopicColorMap } from "~/lib/action-color";
import type { PartnerTopic } from "~/types";
import {
  getSharedPartnerSet,
  shouldKeepTopicAfterPartnerChange,
} from "~/utils/topics";
import { DEFAULT_ACTION_COLOR, resolveActionColor } from "~/utils/uzzina-utils";

const topic = (
  id: string,
  partner_id: string,
  color: string,
): PartnerTopic => ({
  id,
  partner_id,
  color,
  title: id,
  position: 0,
  created_at: "2026-11-16T00:00:00Z",
  updated_at: "2026-11-16T00:00:00Z",
});
const topics = [topic("t1", "p1", "#ff0000"), topic("t2", "p2", "#00ff00")];
const colors = buildTopicColorMap(topics);

describe("TOP-01 displayed color", () => {
  it("uses the topic color when the action has a topic", () => {
    expect(
      resolveActionColor({ color: "#123456", topic_id: "t1" }, colors),
    ).toBe("#FF0000");
  });
  it("falls back to the action color without a topic or with an unknown one", () => {
    expect(
      resolveActionColor({ color: "#123456", topic_id: null }, colors),
    ).toBe("#123456");
    expect(
      resolveActionColor({ color: "#123456", topic_id: "gone" }, colors),
    ).toBe("#123456");
  });
  it("falls back to the default gray for invalid or missing colors", () => {
    expect(resolveActionColor({ color: "not-a-color" }, colors)).toBe(
      DEFAULT_ACTION_COLOR,
    );
    expect(resolveActionColor({ color: null }, colors)).toBe(
      DEFAULT_ACTION_COLOR,
    );
  });
});

describe("TOP-01 bulk partner set", () => {
  it("accepts the same partners in any order", () => {
    expect(
      getSharedPartnerSet([{ partners: ["a", "b"] }, { partners: ["b", "a"] }]),
    ).toEqual(["a", "b"]);
  });
  it("rejects mixed sets (A with B+A, or A with C) and empty selections", () => {
    expect(
      getSharedPartnerSet([{ partners: ["a"] }, { partners: ["a", "b"] }]),
    ).toBeNull();
    expect(
      getSharedPartnerSet([{ partners: ["a"] }, { partners: ["c"] }]),
    ).toBeNull();
    expect(getSharedPartnerSet([])).toBeNull();
  });
});

describe("TOP-01 topic after partner change", () => {
  const partners = [
    { id: "p1", slug: "a" },
    { id: "p2", slug: "b" },
  ];
  it("keeps the topic while its owner stays and drops it when the owner leaves", () => {
    expect(
      shouldKeepTopicAfterPartnerChange("t1", ["a", "b"], topics, partners),
    ).toBe(true);
    expect(
      shouldKeepTopicAfterPartnerChange("t1", ["b"], topics, partners),
    ).toBe(false);
    expect(
      shouldKeepTopicAfterPartnerChange(null, ["b"], topics, partners),
    ).toBe(true);
  });
});
