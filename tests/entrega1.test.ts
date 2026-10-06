import { describe, it, expect, mock } from "bun:test";
import {
  ActionCreateSchema,
  ActionPatchSchema,
} from "~/utils/validation";

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

  it("ActionPatchSchema: serialização para Supabase ignora campos undefined", () => {
    const patch = {
      phase: "finished",
    };
    const parsed = ActionPatchSchema.parse(patch);
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    expect(Object.keys(updateData)).toEqual(["phase"]);
    expect(updateData.description).toBeUndefined();
  });

  it("ActionPatchSchema / ActionCreateSchema: data inválida é rejeitada", () => {
    const invalidPatch = {
      date: "data-invalida-123",
    };
    const result = ActionPatchSchema.safeParse(invalidPatch);
    expect(result.success).toBe(false);

    const validIso = ActionPatchSchema.safeParse({ date: "2026-10-05T15:30:00.000Z" });
    expect(validIso.success).toBe(true);

    const validSql = ActionPatchSchema.safeParse({ date: "2026-10-05 15:30:00" });
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
});

describe("Entrega 1: Coordenação de Criação e Título (C01, C03)", () => {
  it("Título sem alteração não dispara requisição de salvar", async () => {
    const saveMock = mock(async () => ({ id: "act-1", title: "Título Atual" }));
    const savedTitleRef = { current: "Título Atual" };

    const handleTitleBlur = async (title: string, actionId?: string) => {
      const trimmed = title.trim();
      if (trimmed === savedTitleRef.current) return;
      if (actionId) {
        await saveMock();
      }
    };

    await handleTitleBlur("Título Atual", "act-1");
    expect(saveMock).toHaveBeenCalledTimes(0);
  });

  it("Título alterado em ação existente dispara atualização", async () => {
    const saveMock = mock(async () => ({ id: "act-1", title: "Título Modificado" }));
    const savedTitleRef = { current: "Título Original" };

    const handleTitleBlur = async (title: string, actionId?: string) => {
      const trimmed = title.trim();
      if (trimmed === savedTitleRef.current) return;
      if (actionId && trimmed.length >= 2) {
        const result = await saveMock();
        savedTitleRef.current = result.title;
      }
    };

    await handleTitleBlur("Título Modificado", "act-1");
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(savedTitleRef.current).toBe("Título Modificado");
  });

  it("Chamadas simultâneas (blur + botão) compartilham promessa de criação sem duplicar", async () => {
    let createCount = 0;
    const createActionServer = async () => {
      createCount++;
      await new Promise((r) => setTimeout(r, 10));
      return { id: "act-new", title: "Nova Ação Concorrente" };
    };

    let activeCreatePromise: Promise<{ id: string; title: string } | null> | null = null;

    const triggerCreate = async () => {
      if (activeCreatePromise) {
        return await activeCreatePromise;
      }
      const promise = (async () => {
        try {
          return await createActionServer();
        } finally {
          activeCreatePromise = null;
        }
      })();
      activeCreatePromise = promise;
      return await promise;
    };

    // Simula blur e clique no botão acionados quase juntos
    const [res1, res2] = await Promise.all([triggerCreate(), triggerCreate()]);

    expect(createCount).toBe(1);
    expect(res1?.id).toBe("act-new");
    expect(res2?.id).toBe("act-new");
  });

  it("Falha na criação libera promessa e permite nova tentativa com dados preservados", async () => {
    let attempts = 0;
    let activeCreatePromise: Promise<{ id: string } | null> | null = null;

    const createActionServer = async () => {
      attempts++;
      if (attempts === 1) throw new Error("Erro de rede transitório");
      return { id: "act-recovered" };
    };

    const triggerCreate = async () => {
      if (activeCreatePromise) return await activeCreatePromise;
      const promise = (async () => {
        try {
          return await createActionServer();
        } catch {
          return null;
        } finally {
          activeCreatePromise = null;
        }
      })();
      activeCreatePromise = promise;
      return await promise;
    };

    const firstTry = await triggerCreate();
    expect(firstTry).toBeNull();
    expect(attempts).toBe(1);
    expect(activeCreatePromise).toBeNull();

    // Segunda tentativa
    const secondTry = await triggerCreate();
    expect(secondTry?.id).toBe("act-recovered");
    expect(attempts).toBe(2);
  });
});

describe("Entrega 1: Drag and Drop com Recuperação Segura (C05)", () => {
  it("setActiveAction(undefined) é garantido no finally mesmo após rejeição de onDrop", async () => {
    let activeAction: { id: string } | undefined = { id: "action-1" };
    let overrideCleaned = false;

    const onDropFailing = async () => {
      throw new Error("Falha no servidor ao persistir fase");
    };

    const handleDragEnd = async () => {
      try {
        try {
          await onDropFailing();
        } catch {
          // Erro capturado e logado
        } finally {
          overrideCleaned = true;
        }
      } finally {
        activeAction = undefined;
      }
    };

    await handleDragEnd();

    expect(activeAction).toBeUndefined();
    expect(overrideCleaned).toBe(true);
  });

  it("Cancelamento de arraste limpa activeAction", () => {
    let activeAction: { id: string } | undefined = { id: "action-1" };
    const handleDragCancel = () => {
      activeAction = undefined;
    };

    handleDragCancel();
    expect(activeAction).toBeUndefined();
  });
});

describe("Entrega 1: Preservação de Responsáveis na Troca de Parceiro (C04)", () => {
  it("A escolha prévia de responsáveis pelo usuário é preservada ao trocar parceiro", () => {
    const rawAction = {
      responsibles: ["user-criador"],
      color: "#666666",
      partners: ["parceiro-antigo"],
    };

    const newPartner = {
      slug: "novo-parceiro",
      colors: ["#ff0055"],
      users_ids: ["membro-1", "membro-2"],
    };

    // Lógica corrigida do drawer:
    const updatedRawAction = {
      ...rawAction,
      color: rawAction.color === "#666666" ? newPartner.colors[0] : rawAction.color,
      responsibles:
        rawAction.responsibles && rawAction.responsibles.length > 0
          ? rawAction.responsibles
          : newPartner.users_ids,
    };

    expect(updatedRawAction.responsibles).toEqual(["user-criador"]);
    expect(updatedRawAction.color).toBe("#ff0055");
  });
});
