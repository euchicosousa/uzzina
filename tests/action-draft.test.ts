import { describe, expect, test } from "bun:test";
import { createActionDraft, resolveDraftPartners } from "~/utils/factory";

describe("resolveDraftPartners", () => {
  test("route slug wins over filters", () => {
    expect(
      resolveDraftPartners({ routeSlug: "a", partnerFilters: ["b"] }),
    ).toEqual(["a"]);
  });
  test("derives the slug from the partner pathname", () => {
    expect(
      resolveDraftPartners({
        pathname: "/app/partner/acme/calendar?x=1",
        partnerFilters: [],
      }),
    ).toEqual(["acme"]);
  });
  test("uses a single filter only", () => {
    expect(resolveDraftPartners({ partnerFilters: ["b"] })).toEqual(["b"]);
    expect(resolveDraftPartners({ partnerFilters: ["b", "c"] })).toEqual([]);
    expect(
      resolveDraftPartners({ pathname: "/app", partnerFilters: [] }),
    ).toEqual([]);
  });
});

describe("createActionDraft", () => {
  test("builds a draft without identity or timestamps", () => {
    const draft = createActionDraft({ userId: "u1", partners: ["p"] });
    expect(draft.id).toBeUndefined();
    expect(draft.created_at).toBeUndefined();
    expect(draft.responsibles).toEqual(["u1"]);
    expect(draft.partners).toEqual(["p"]);
    expect(draft.phase).toBe("idea");
  });
  test("applies responsibles and category overrides", () => {
    const draft = createActionDraft({
      userId: "u1",
      responsibles: ["u2", "u3"],
      category: "design",
    });
    expect(draft.responsibles).toEqual(["u2", "u3"]);
    expect(draft.category).toBe("design");
  });
});

describe("isDefaultActionColor", () => {
  test("recognises unset and default grays only", async () => {
    const { isDefaultActionColor } = await import("~/utils/uzzina-utils");
    expect(isDefaultActionColor(null)).toBe(true);
    expect(isDefaultActionColor("#666")).toBe(true);
    expect(isDefaultActionColor("#666666")).toBe(true);
    expect(isDefaultActionColor("#ff0000")).toBe(false);
  });
});
