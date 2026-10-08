import { describe, it, expect } from "bun:test";
import { ActionCreateSchema, ActionPatchSchema } from "~/utils/validation";

describe("Entrega 1: Contratos de Validação (C02)", () => {
  it("ActionPatchSchema: campos de texto omitidos permanecem undefined (não viram null)", () => {
    const patch = {
      phase: "doing",
    };
    const parsed = ActionPatchSchema.parse(patch);

    expect(parsed.phase).toBe("doing");
    expect(parsed.description).toBeUndefined();
    expect(parsed.instagram_caption).toBeUndefined();
    expect(parsed.content_description).toBeUndefined();
    expect(parsed.title).toBeUndefined();
    expect(parsed.date).toBeUndefined();
    expect(parsed.partners).toBeUndefined();
    expect(parsed.responsibles).toBeUndefined();
  });

  it("ActionPatchSchema: campo vazio explícito ou 'null' limpa para null", () => {
    const patch = {
      description: "",
      instagram_caption: "null",
      content_description: null,
    };
    const parsed = ActionPatchSchema.parse(patch);

    expect(parsed.description).toBeNull();
    expect(parsed.instagram_caption).toBeNull();
    expect(parsed.content_description).toBeNull();
  });

  it("ActionPatchSchema: valor presente substitui o campo", () => {
    const patch = {
      title: "Novo Título da Ação",
      description: "<p>Conteúdo novo</p>",
      time: 25,
    };
    const parsed = ActionPatchSchema.parse(patch);

    expect(parsed.title).toBe("Novo Título da Ação");
    expect(parsed.description).toBe("<p>Conteúdo novo</p>");
    expect(parsed.time).toBe(25);
  });

  it("ActionPatchSchema: arrays opcionais (sprints, arquivos) preservam undefined quando omitidos", () => {
    const patch = {
      title: "Apenas Título",
    };
    const parsed = ActionPatchSchema.parse(patch);

    expect(parsed.sprints).toBeUndefined();
    expect(parsed.work_files).toBeUndefined();
    expect(parsed.content_files).toBeUndefined();
  });

  it("ActionPatchSchema: arrays opcionais limpam com null ou string vazia", () => {
    const patch = {
      sprints: null,
      work_files: "",
      content_files: "null",
    };
    const parsed = ActionPatchSchema.parse(patch);

    expect(parsed.sprints).toBeNull();
    expect(parsed.work_files).toBeNull();
    expect(parsed.content_files).toBeNull();
  });

  it("ActionPatchSchema / ActionCreateSchema: data inválida é rejeitada", () => {
    const invalidPatch = {
      date: "data-invalida-123",
    };
    const result = ActionPatchSchema.safeParse(invalidPatch);
    expect(result.success).toBe(false);

    const validIso = ActionPatchSchema.safeParse({
      date: "2026-10-05T15:30:00.000Z",
    });
    expect(validIso.success).toBe(true);

    const validSql = ActionPatchSchema.safeParse({
      date: "2026-10-05 15:30:00",
    });
    expect(validSql.success).toBe(true);
  });

  it("ActionCreateSchema: exige parceiro obrigatório (rejeita array vazio)", () => {
    const withoutPartners = {
      title: "Nova Ação Válida",
      date: "2026-10-05 10:00:00",
      category: "post",
      priority: "medium",
      partners: [],
    };
    const result = ActionCreateSchema.safeParse(withoutPartners);
    expect(result.success).toBe(false);
  });

  it("ActionCreateSchema: exige título com no mínimo 2 caracteres", () => {
    const shortTitle = {
      title: "A",
      date: "2026-10-05 10:00:00",
      category: "post",
      priority: "medium",
      partners: ["cnvt"],
    };
    const result = ActionCreateSchema.safeParse(shortTitle);
    expect(result.success).toBe(false);
  });

  it("ActionCreateSchema: preenche defaults apropriados para criação válida", () => {
    const valid = {
      title: "Campanha Uzzina",
      date: "2026-10-05 10:00:00",
      category: "post",
      priority: "medium",
      partners: ["cnvt"],
    };
    const parsed = ActionCreateSchema.parse(valid);

    expect(parsed.title).toBe("Campanha Uzzina");
    expect(parsed.partners).toEqual(["cnvt"]);
    expect(parsed.phase).toBe("idea");
    expect(parsed.archived).toBe(false);
    expect(parsed.description).toBeNull();
    expect(parsed.responsibles).toEqual([]);
    expect(parsed.time).toBe(10);
  });

  it("ActionCreateSchema: preserva user_id quando fornecido", () => {
    const validWithUser = {
      title: "Campanha Uzzina",
      date: "2026-10-05 10:00:00",
      category: "post",
      priority: "medium",
      partners: ["cnvt"],
      user_id: "usr-123",
    };
    const parsed = ActionCreateSchema.parse(validWithUser);
    expect(parsed.user_id).toBe("usr-123");
  });
});
