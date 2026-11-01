import { describe, expect, it } from "bun:test";
import { generateSocialPlan } from "~/lib/social-planning/generator";
import {
  deleteSocialPlan,
  getSocialPlan,
  listSocialPlans,
  saveSocialPlan,
  updatePlanSuggestion,
} from "~/lib/social-planning/storage";
import type { SocialPlan } from "~/lib/social-planning/types";

describe("Social Planning Storage & Generator", () => {
  const dummyPartner = {
    slug: "clinica-exemplo",
    title: "Clínica Exemplo",
    context: "Clínica médica focada em saúde preventiva e exames diagnósticos.",
    voice_tone: "técnico e acolhedor",
  };

  it("generates a social plan in theme mode and persists it", () => {
    const plan = generateSocialPlan({
      partner: dummyPartner,
      mode: "theme",
      input: {
        theme: "Histeroscopia e Ultrassom",
        themeCount: 5,
      },
    });

    expect(plan.id).toBeDefined();
    expect(plan.partner_slug).toBe("clinica-exemplo");
    expect(plan.mode).toBe("theme");
    expect(plan.suggestions).toHaveLength(5);
    expect(plan.suggestions[0].id).toBeDefined();
    expect(plan.suggestions[0].title).toBeDefined();
    expect(plan.suggestions[0].objective).toBeDefined();
    expect(plan.suggestions[0].briefing).toBeDefined();
    expect(plan.suggestions[0].status).toBe("pending");

    // Verify it is in storage
    const loaded = getSocialPlan(plan.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.id).toBe(plan.id);
    expect(loaded?.suggestions).toHaveLength(5);
  });

  it("generates a social plan in period mode with commemorative dates", () => {
    const slots = [
      {
        date: "2026-05-10",
        isCommemorative: true,
        celebrationTitle: "Dia das Mães",
      },
      { date: "2026-05-12" },
      { date: "2026-05-15" },
    ];

    const plan = generateSocialPlan({
      partner: dummyPartner,
      mode: "period",
      input: {
        startDate: "2026-05-01",
        endDate: "2026-05-31",
      },
      slots,
    });

    expect(plan.suggestions).toHaveLength(3);
    const motherDaySuggestion = plan.suggestions.find(
      (s) => s.is_commemorative,
    );
    expect(motherDaySuggestion).toBeDefined();
    expect(motherDaySuggestion?.celebration_title).toBe("Dia das Mães");
    expect(motherDaySuggestion?.scheduled_date).toBe("2026-05-10");
    expect(motherDaySuggestion?.title).toContain("Dia das Mães");
  });

  it("updates a suggestion status and edits fields", () => {
    const plan = generateSocialPlan({
      partner: dummyPartner,
      mode: "theme",
      input: { themeCount: 2 },
    });

    const suggestionId = plan.suggestions[0].id;

    const updatedPlan = updatePlanSuggestion(plan.id, suggestionId, {
      status: "approved",
      title: "Título Editado",
    });

    expect(updatedPlan).not.toBeNull();
    expect(updatedPlan?.suggestions[0].status).toBe("approved");
    expect(updatedPlan?.suggestions[0].title).toBe("Título Editado");

    const reloaded = getSocialPlan(plan.id);
    expect(reloaded?.suggestions[0].status).toBe("approved");
    expect(reloaded?.suggestions[0].title).toBe("Título Editado");
  });

  it("filters plans by partner slug", () => {
    const plans = listSocialPlans("clinica-exemplo");
    expect(plans.length).toBeGreaterThan(0);
    expect(plans.every((p) => p.partner_slug === "clinica-exemplo")).toBe(true);

    const nonExistent = listSocialPlans("outro-parceiro-qualquer");
    expect(nonExistent).toHaveLength(0);
  });
});
