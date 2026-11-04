import { describe, expect, it, test } from "bun:test";
import {
  calculatePeriodSlots,
  distributeFormats,
  mergeCommemorativeSlots,
  validateFormatDistribution,
  validatePeriodInput,
} from "~/lib/social-planning/slot-calculator";

describe("Social Planning - Slot & Format Calculator", () => {
  describe("calculatePeriodSlots", () => {
    it("calculates slots respecting postsPerWeek and selectedDays", () => {
      // 2 semanas em novembro de 2026: 01/11 (dom) a 14/11 (sab)
      const slots = calculatePeriodSlots({
        startDate: "2026-11-01",
        endDate: "2026-11-14",
        postsPerWeek: 2,
        selectedDays: ["seg", "qua", "sex"],
      });

      // Em cada semana com 3 dias elegíveis (seg, qua, sex), limita a 2 dias por semana
      expect(slots.length).toBe(4);
      // Primeira semana: 02/11 (seg) e 04/11 (qua)
      expect(slots[0]).toBe("2026-11-02");
      expect(slots[1]).toBe("2026-11-04");
      // Segunda semana: 09/11 (seg) e 11/11 (qua)
      expect(slots[2]).toBe("2026-11-09");
      expect(slots[3]).toBe("2026-11-11");
    });

    test("handles partial start and end weeks accurately", () => {
      // Começa quarta 04/11/2026, termina sexta 13/11/2026
      const slots = calculatePeriodSlots({
        startDate: "2026-11-04",
        endDate: "2026-11-13",
        postsPerWeek: 3,
        selectedDays: ["seg", "qua", "sex"],
      });

      expect(slots).toEqual([
        "2026-11-04", // Qua (Semana 1 parcial)
        "2026-11-06", // Sex (Semana 1 parcial)
        "2026-11-09", // Seg (Semana 2)
        "2026-11-11", // Qua (Semana 2)
        "2026-11-13", // Sex (Semana 2)
      ]);
    });

    test("supports weekend selections ('dom', 'sab')", () => {
      const slots = calculatePeriodSlots({
        startDate: "2026-11-01", // Domingo
        endDate: "2026-11-08", // Próximo domingo
        postsPerWeek: 2,
        selectedDays: ["dom", "sab"],
      });

      expect(slots).toEqual([
        "2026-11-01", // Dom S1
        "2026-11-07", // Sab S1
        "2026-11-08", // Dom S2
      ]);
    });

    test("handles leap year transition in February", () => {
      // 2024 é ano bissexto: 29/02/2024 é quinta-feira
      const slots = calculatePeriodSlots({
        startDate: "2024-02-26",
        endDate: "2024-03-03",
        postsPerWeek: 3,
        selectedDays: ["seg", "qui", "dom"],
      });

      expect(slots).toEqual(["2024-02-26", "2024-02-29", "2024-03-03"]);
    });

    test("returns empty array for invalid inputs", () => {
      expect(
        calculatePeriodSlots({
          startDate: "2026-11-10",
          endDate: "2026-11-01",
          postsPerWeek: 2,
          selectedDays: ["seg"],
        }),
      ).toEqual([]);

      expect(
        calculatePeriodSlots({
          startDate: "2026-11-01",
          endDate: "2026-11-07",
          postsPerWeek: 0,
          selectedDays: ["seg"],
        }),
      ).toEqual([]);

      expect(
        calculatePeriodSlots({
          startDate: "2026-11-01",
          endDate: "2026-11-07",
          postsPerWeek: 2,
          selectedDays: [],
        }),
      ).toEqual([]);
    });
  });

  describe("distributeFormats", () => {
    it("distributes formats evenly in auto mode", () => {
      const formats = distributeFormats({
        totalCount: 5,
        formatMode: "auto",
      });

      expect(formats).toEqual([
        "reels",
        "carousel",
        "static",
        "reels",
        "carousel",
      ]);
    });

    it("distributes formats accurately in manual mode", () => {
      const formats = distributeFormats({
        totalCount: 4,
        formatMode: "manual",
        reelsCount: 2,
        carouselCount: 1,
        staticCount: 1,
      });

      expect(formats).toEqual(["reels", "reels", "carousel", "static"]);
    });

    test("throws error in manual mode when sum of formats exceeds or is less than totalCount (Ticket C04)", () => {
      expect(() => {
        distributeFormats({
          totalCount: 2,
          formatMode: "manual",
          reelsCount: 3,
          carouselCount: 2,
        });
      }).toThrow("A soma das quantidades manuais");

      expect(() => {
        distributeFormats({
          totalCount: 5,
          formatMode: "manual",
          reelsCount: 1,
          carouselCount: 1,
          staticCount: 1,
        });
      }).toThrow("A soma das quantidades manuais");
    });

    test("validateFormatDistribution verifies manual composition against target count", () => {
      const valid = validateFormatDistribution({
        formatMode: "manual",
        targetCount: 4,
        reelsCount: 2,
        staticCount: 1,
        carouselCount: 1,
      });
      expect(valid.isValid).toBe(true);
      expect(valid.error).toBeUndefined();

      const invalid = validateFormatDistribution({
        formatMode: "manual",
        targetCount: 6,
        reelsCount: 4,
        staticCount: 0,
        carouselCount: 0,
      });
      expect(invalid.isValid).toBe(false);
      expect(invalid.error).toContain("difere do total de publicações");
    });

    test("returns empty array when totalCount is zero or negative", () => {
      expect(distributeFormats({ totalCount: 0, formatMode: "auto" })).toEqual(
        [],
      );
      expect(
        distributeFormats({ totalCount: -3, formatMode: "manual" }),
      ).toEqual([]);
    });
  });

  describe("mergeCommemorativeSlots", () => {
    it("merges commemorative slots correctly", () => {
      const slots = ["2026-11-02", "2026-11-04"];
      const celebrations = [
        { id: "finados", title: "Finados", date: "2026-11-02" },
        {
          id: "proclamacao",
          title: "Proclamação da República",
          date: "2026-11-15",
        },
      ];

      const merged = mergeCommemorativeSlots({
        slots,
        celebrations,
        selectedCelebrationIds: ["finados", "proclamacao"],
      });

      expect(merged.length).toBe(3);
      expect(merged[0]).toEqual({
        date: "2026-11-02",
        isCommemorative: true,
        celebrationTitle: "Finados",
        isExtra: false,
      });
      expect(merged[1]).toEqual({
        date: "2026-11-04",
        isCommemorative: false,
        celebrationTitle: undefined,
        isExtra: false,
      });
      expect(merged[2]).toEqual({
        date: "2026-11-15",
        isCommemorative: true,
        celebrationTitle: "Proclamação da República",
        isExtra: true,
      });
    });

    test("leaves slots as non-commemorative when no celebrations are selected", () => {
      const slots = ["2026-11-02", "2026-11-04"];
      const celebrations = [
        { id: "finados", title: "Finados", date: "2026-11-02" },
      ];

      const merged = mergeCommemorativeSlots({
        slots,
        celebrations,
        selectedCelebrationIds: [],
      });

      expect(merged).toEqual([
        {
          date: "2026-11-02",
          isCommemorative: false,
          celebrationTitle: undefined,
          isExtra: false,
        },
        {
          date: "2026-11-04",
          isCommemorative: false,
          celebrationTitle: undefined,
          isExtra: false,
        },
      ]);
    });

    test("sorts all merged slots chronologically", () => {
      const slots = ["2026-11-10", "2026-11-20"];
      const celebrations = [
        { id: "c1", title: "Dia de Finados", date: "2026-11-02" },
        { id: "c2", title: "Proclamação da República", date: "2026-11-15" },
        { id: "c3", title: "Black Friday", date: "2026-11-27" },
      ];

      const merged = mergeCommemorativeSlots({
        slots,
        celebrations,
        selectedCelebrationIds: ["c1", "c2", "c3"],
      });

      expect(merged.map((s) => s.date)).toEqual([
        "2026-11-02",
        "2026-11-10",
        "2026-11-15",
        "2026-11-20",
        "2026-11-27",
      ]);
    });

    test("merges multiple celebrations on the same date with combined titles", () => {
      const slots = ["2026-10-12"];
      const celebrations = [
        { id: "c1", title: "Nossa Senhora Aparecida", date: "2026-10-12" },
        { id: "c2", title: "Dia das Crianças", date: "2026-10-12" },
      ];

      const merged = mergeCommemorativeSlots({
        slots,
        celebrations,
        selectedCelebrationIds: ["c1", "c2"],
      });

      expect(merged).toEqual([
        {
          date: "2026-10-12",
          isCommemorative: true,
          celebrationTitle: "Nossa Senhora Aparecida / Dia das Crianças",
          isExtra: false,
        },
      ]);
    });

    test("excludes celebrations outside the startDate and endDate interval (Ticket C03)", () => {
      const slots = ["2026-11-10", "2026-11-12"];
      const celebrations = [
        { id: "past", title: "Data Anterior", date: "2026-11-01" },
        { id: "inside", title: "Data Interna", date: "2026-11-11" },
        { id: "future", title: "Data Posterior", date: "2026-11-25" },
        { id: "wrong-year", title: "Ano Anterior", date: "2025-11-11" },
      ];

      const merged = mergeCommemorativeSlots({
        slots,
        celebrations,
        selectedCelebrationIds: ["past", "inside", "future", "wrong-year"],
        startDate: "2026-11-10",
        endDate: "2026-11-20",
      });

      // Apenas a celebração 'inside' (2026-11-11) está dentro do período 10/11 a 20/11
      expect(merged).toHaveLength(3);
      expect(merged.map((s) => s.date)).toEqual([
        "2026-11-10",
        "2026-11-11",
        "2026-11-12",
      ]);
      expect(merged.find((s) => s.date === "2026-11-11")?.isExtra).toBe(true);
    });
  });

  describe("validatePeriodInput (Ticket C02)", () => {
    test("returns isValid: true and calculated slots for valid parameters", () => {
      const result = validatePeriodInput({
        startDate: "2026-11-01",
        endDate: "2026-11-07",
        postsPerWeek: 3,
        selectedDays: ["seg", "qua", "sex"],
      });

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.calculatedSlots).toEqual([
        "2026-11-02",
        "2026-11-04",
        "2026-11-06",
      ]);
    });

    test("fails when startDate is after endDate", () => {
      const result = validatePeriodInput({
        startDate: "2026-11-15",
        endDate: "2026-11-01",
        postsPerWeek: 3,
        selectedDays: ["seg", "qua"],
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("não pode ser posterior");
      expect(result.calculatedSlots).toEqual([]);
    });

    test("fails when date format is invalid", () => {
      const result = validatePeriodInput({
        startDate: "01/11/2026",
        endDate: "2026-11-15",
        postsPerWeek: 3,
        selectedDays: ["seg"],
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Formato de data inválido");
    });

    test("fails when selectedDays is empty or invalid", () => {
      const result = validatePeriodInput({
        startDate: "2026-11-01",
        endDate: "2026-11-15",
        postsPerWeek: 3,
        selectedDays: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Selecione pelo menos um dia");
    });

    test("fails when postsPerWeek is out of range", () => {
      const result = validatePeriodInput({
        startDate: "2026-11-01",
        endDate: "2026-11-15",
        postsPerWeek: 0,
        selectedDays: ["seg"],
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("entre 1 e 7");
    });

    test("fails with zero occurrences when selected day does not occur in range", () => {
      // 03/11/2026 é terça; 04/11/2026 é quarta. Procurando por 'dom' (domingo)
      const result = validatePeriodInput({
        startDate: "2026-11-03",
        endDate: "2026-11-04",
        postsPerWeek: 2,
        selectedDays: ["dom"],
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain(
        "Nenhum dia selecionado ocorre dentro do intervalo",
      );
      expect(result.calculatedSlots).toEqual([]);
    });
  });
});
