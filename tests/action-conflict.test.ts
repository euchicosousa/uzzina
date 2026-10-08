import { beforeEach, describe, expect, it, mock } from "bun:test";
import {
  ActionConflictError,
  updateActionClient,
} from "../app/lib/supabase.mutations";

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = {
  actions: [],
  dash_sessions: [],
  clients: [],
  partners: [],
  action_comments: [],
};

let capturedUpdatePayload: Row | null = null;
let capturedFilters: Record<string, unknown> = {};
let mockClock = Date.now();

mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => ({
    from: (table: string) => {
      const filters: ((row: Row) => boolean)[] = [];
      let change: Row | undefined;
      let operation = "read";

      const execute = () => {
        const rows = (db[table] || []).filter((row) =>
          filters.every((filter) => filter(row)),
        );
        if (operation === "update") {
          capturedUpdatePayload = change ? { ...change } : null;
          if (rows.length === 0) {
            return { data: null, error: { code: "PGRST116", message: "Row not found" } };
          }
          for (const row of rows) {
            Object.assign(row, change);
            // Simula trigger do banco que avança updated_at monotonicamente
            mockClock += 1000;
            row.updated_at = new Date(mockClock).toISOString();
          }
          return { data: rows[0], error: null };
        }
        return { data: rows, error: null };
      };

      const chain = {
        select: (_cols?: string) => chain,
        eq: (col: string, val: unknown) => {
          capturedFilters[col] = val;
          filters.push((r) => r[col] === val);
          return chain;
        },
        update: (data: Row) => {
          operation = "update";
          change = data;
          return chain;
        },
        single: async () => {
          const res = execute();
          return res;
        },
      };
      return chain;
    },
  }),
}));

describe("Ticket 08: Atualizar ação com conflito explícito", () => {
  beforeEach(() => {
    capturedUpdatePayload = null;
    capturedFilters = {};
    db.actions = [
      {
        id: "act-1",
        title: "Campanha Black Friday",
        date: "2026-11-20",
        category: "post",
        phase: "feed",
        priority: "medium",
        color: "red",
        time: 30,
        responsibles: ["collab-1"],
        partners: ["smartmed"],
        sprints: ["collab-1"],
        created_at: "2026-10-01T10:00:00.000Z",
        updated_at: "2026-10-06T12:00:00.000Z",
      },
    ];
  });

  it("recusa atualização se expectedUpdatedAt não for fornecido ou for inválido", async () => {
    // @ts-expect-error teste de contrato de runtime
    await expect(updateActionClient("act-1", { title: "Novo" })).rejects.toThrow(
      "expectedUpdatedAt é obrigatório para atualização de ação.",
    );
    await expect(updateActionClient("act-1", { title: "Novo" }, "")).rejects.toThrow(
      "expectedUpdatedAt é obrigatório para atualização de ação.",
    );
  });

  it("filtra por id E expectedUpdatedAt e atualiza com sucesso quando versões coincidem", async () => {
    const v0 = "2026-10-06T12:00:00.000Z";
    const updated = await updateActionClient(
      "act-1",
      { title: "Título Atualizado" },
      v0,
    );

    // O filtro aplicado deve conter ambos os campos
    expect(capturedFilters.id).toBe("act-1");
    expect(capturedFilters.updated_at).toBe(v0);

    // O payload enviado não deve conter expectedUpdatedAt nem updated_at forçado pelo browser
    expect(capturedUpdatePayload?.expectedUpdatedAt).toBeUndefined();
    expect(capturedUpdatePayload?.title).toBe("Título Atualizado");

    // Retorna a nova linha com updated_at avançado pelo banco
    expect(updated.title).toBe("Título Atualizado");
    expect(updated.updated_at).not.toBe(v0);
  });

  it("real update serializer omits undefined text without clearing existing fields", async () => {
    const row = db.actions[0];
    if (!row) throw new Error("Missing fixture");
    row.description = "Preserved description";
    const updated = await updateActionClient("act-1", {phase:"doing",description:undefined}, "2026-10-06T12:00:00.000Z");
    expect(capturedUpdatePayload).toEqual({phase:"doing"});
    expect(updated.description).toBe("Preserved description");
  });

  it("lança ActionConflictError tipado quando zero linhas são afetadas por versão conflitante", async () => {
    const versaoObsoleta = "2026-09-01T00:00:00.000Z";

    try {
      await updateActionClient(
        "act-1",
        { title: "Edição Concorrente" },
        versaoObsoleta,
      );
      expect(true).toBe(false); // Não deve chegar aqui
    } catch (err) {
      expect(err instanceof ActionConflictError).toBe(true);
      if (err instanceof ActionConflictError) {
        expect(err.code).toBe("ACTION_CONFLICT");
        expect(err.message).toBe("Esta ação mudou. Recarregue antes de salvar");
      }
    }
  });

  it("exige a nova versão para uma segunda atualização consecutiva", async () => {
    const v0 = "2026-10-06T12:00:00.000Z";

    // 1ª atualização avança para v1
    const res1 = await updateActionClient("act-1", { title: "Versão 1" }, v0);
    const v1 = res1.updated_at;
    expect(v1).not.toBe(v0);

    // Tentar atualizar usando novamente a v0 antiga deve falhar com conflito
    await expect(
      updateActionClient("act-1", { title: "Sobrescrita Indevida" }, v0),
    ).rejects.toThrow(ActionConflictError);

    // Atualizar usando a nova versão v1 deve funcionar perfeitamente
    const res2 = await updateActionClient("act-1", { title: "Versão 2" }, v1);
    expect(res2.title).toBe("Versão 2");
    expect(res2.updated_at).not.toBe(v1);
  });

  it("simula duas abas concorrentes: apenas a primeira salva, a segunda é rejeitada com conflito", async () => {
    const v0 = "2026-10-06T12:00:00.000Z";

    // Aba A salva alteração
    const savedByTabA = await updateActionClient(
      "act-1",
      { title: "Salvo pela Aba A" },
      v0,
    );
    expect(savedByTabA.title).toBe("Salvo pela Aba A");

    // Aba B, que ainda tinha a versão inicial v0 carregada, tenta salvar
    let conflictOccurred = false;
    try {
      await updateActionClient("act-1", { title: "Salvo pela Aba B" }, v0);
    } catch (err) {
      if (err instanceof ActionConflictError) {
        conflictOccurred = true;
      }
    }
    expect(conflictOccurred).toBe(true);

    // O título salvo pela Aba A foi preservado
    expect(db.actions[0].title).toBe("Salvo pela Aba A");
  });
  it("business patch never sends caller-supplied timestamps", async () => {
    await updateActionClient("act-1", {date: "2026-11-21 10:00:00", updated_at: "fake", created_at: "fake"}, "2026-10-06T12:00:00.000Z");
    expect(capturedUpdatePayload).toEqual({date: "2026-11-21 10:00:00"});
  });

});
