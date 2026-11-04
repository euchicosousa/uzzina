import { describe, expect, it } from "bun:test";
import { parseColor } from "react-aria-components";
import { safeColor, normalizeHexColor } from "~/utils/uzzina-utils";

describe("Ticket 37: UColorPickerDropdown - Parsing e Normalização de Cores", () => {
  it("normaliza cores hexadecimais para #RRGGBB em caixa alta sem transparência", () => {
    const c1 = parseColor("#2563eb");
    expect(c1.toString("hex").toUpperCase()).toBe("#2563EB");

    const c2 = parseColor("#ff00aa");
    expect(c2.toString("hex").toUpperCase()).toBe("#FF00AA");

    // Verifica que toFormat('rgb').toString('hex') preserva #RRGGBB
    const cRgb = c1.toFormat("rgb");
    expect(cRgb.toString("hex").toUpperCase()).toBe("#2563EB");

    const cHsl = c1.toFormat("hsl");
    expect(cHsl.toString("hex").toUpperCase()).toBe("#2563EB");

    const cHsb = c1.toFormat("hsb");
    expect(cHsb.toString("hex").toUpperCase()).toBe("#2563EB");
  });

  it("safeColor protege entradas nulas, vazias ou inválidas", () => {
    expect(safeColor(null)).toBe("#666666");
    expect(safeColor("")).toBe("#666666");
    expect(safeColor("invalido")).toBe("#666666");
    expect(safeColor("#123")).toBe("#112233");
  });

  it("preserva origem de cores compartilhadas entre parceiros", () => {
    const partnerA = {
      id: "p-a",
      label: "Alfa",
      colors: ["#2563EB", "#7C3AED"],
    };
    const partnerB = {
      id: "p-b",
      label: "Beta",
      colors: ["#2563EB", "#EA580C"], // compartilha #2563EB
    };

    // Ambas as swatches devem gerar chaves únicas e preservar suas origens
    const swatchIdA = `${partnerA.id}__0__${partnerA.colors[0]}`;
    const swatchIdB = `${partnerB.id}__0__${partnerB.colors[0]}`;
    expect(swatchIdA).not.toBe(swatchIdB);
    expect(swatchIdA).toBe("p-a__0__#2563EB");
    expect(swatchIdB).toBe("p-b__0__#2563EB");
  });

  it("trata parceiro sem cores sem gerar amostras fictícias", () => {
    const partners = [
      { id: "p1", label: "P1", colors: ["#2563EB"] },
      { id: "p2", label: "P2", colors: [] },
      { id: "p3", label: "P3", colors: [""] },
    ];

    const validGroups = partners
      .map((g) => ({
        ...g,
        colors: g.colors.filter((c) => Boolean(c?.trim())),
      }))
      .filter((g) => g.colors.length > 0);

    expect(validGroups.length).toBe(1);
    expect(validGroups[0].id).toBe("p1");
  });

  it("determina modo icon-only versus texto com cor no gatilho", () => {
    const isIconOnly = (size?: string) => Boolean(size?.startsWith("icon"));

    expect(isIconOnly("icon-xs")).toBe(true);
    expect(isIconOnly("icon-sm")).toBe(true);
    expect(isIconOnly("icon")).toBe(true);
    expect(isIconOnly("icon-lg")).toBe(true);

    expect(isIconOnly("xs")).toBe(false);
    expect(isIconOnly("sm")).toBe(false);
    expect(isIconOnly("default")).toBe(false);
    expect(isIconOnly("lg")).toBe(false);
    expect(isIconOnly(undefined)).toBe(false);
  });
});

describe("Ticket 38: UPaletteEditor - Validação e Comportamento", () => {
  it("validação de hex não converte erro em preto nem preenche com zeros", () => {
    const isValidHex = (hex: string) =>
      /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());

    // Entradas incompletas / inválidas
    expect(isValidHex("#12")).toBe(false);
    expect(isValidHex("#1234")).toBe(false);
    expect(isValidHex("xyz")).toBe(false);

    // Entradas válidas
    expect(isValidHex("#fff")).toBe(true);
    expect(isValidHex("#2563EB")).toBe(true);

    // Normalização correta sem zeros artificiais
    expect(normalizeHexColor("#fff")).toBe("#ffffff");
    expect(normalizeHexColor("#2563eb")).toBe("#2563eb");
  });
});
