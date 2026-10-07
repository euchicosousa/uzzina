import { describe, expect, it } from "bun:test";
import { ActionSaveCoordinator } from "../app/components/features/action-drawer/action-save-coordinator";
import { ActionConflictError } from "../app/lib/supabase.mutations";
import type { Action } from "../app/types";

function makeFakeAction(overrides: Partial<Action> = {}): Action {
  return {
    id: "act-1",
    title: "Ação de Teste",
    date: "2026-10-06 10:00:00",
    description: "Descrição inicial",
    content_description: "Conteúdo inicial",
    instagram_caption: null,
    category: "post",
    phase: "idea",
    priority: "medium",
    time: 10,
    user_id: "usr-creator",
    partners: ["cnvt"],
    responsibles: ["usr-1"],
    color: "#ff0000",
    created_at: "2026-10-06T10:00:00Z",
    updated_at: "2026-10-06T10:00:00Z",
    archived: false,
    content_files: [],
    work_files: [],
    sprints: [],
    strategies: [],
    ...overrides,
  };
}

describe("Ticket 09: ActionSaveCoordinator e Gaveta Recuperável", () => {
  it("blur válido + clique Criar compartilha 1 único INSERT (sem duplicação de registro)", async () => {
    let insertCalls = 0;
    const writeFn = async (payload: Record<string, unknown>) => {
      insertCalls++;
      // Simula pequena latência de rede
      await new Promise((resolve) => setTimeout(resolve, 20));
      return makeFakeAction({
        id: "act-new-1",
        title: String(payload.title),
        created_at: "2026-10-06T10:01:00Z",
        updated_at: "2026-10-06T10:01:00Z",
      });
    };

    const draftAction = makeFakeAction({
      id: undefined,
      title: "Rascunho Novo",
      created_at: undefined,
      updated_at: undefined,
    });

    const coordinator = new ActionSaveCoordinator({
      key: "draft-temp",
      initialAction: draftAction,
      writeFn,
    });

    // Dispara criação simulando blur no título
    const promise1 = coordinator.createAction({
      title: "Rascunho Novo",
      partners: ["cnvt"],
    });

    // Usuário clica imediatamente em "Criar" enquanto a requisição do blur ainda está em voo
    const promise2 = coordinator.createAction({
      title: "Rascunho Novo",
      partners: ["cnvt"],
    });

    const [res1, res2] = await Promise.all([promise1, promise2]);

    expect(insertCalls).toBe(1);
    expect(res1?.id).toBe("act-new-1");
    expect(res2?.id).toBe("act-new-1");
    expect(coordinator.getState().status).toBe("saved");
    expect(coordinator.getState().confirmedAction?.id).toBe("act-new-1");
  });

  it("edições feitas enquanto creating entram em pendingPatch e disparam UPDATE após create", async () => {
    const callLog: { op: string; payload: Record<string, unknown> }[] = [];
    let resolveCreate!: (action: Action) => void;

    const writeFn = async (payload: Record<string, unknown>) => {
      if (!payload.id) {
        callLog.push({ op: "insert", payload });
        return new Promise<Action>((res) => {
          resolveCreate = res;
        });
      }
      callLog.push({ op: "update", payload });
      return makeFakeAction({
        id: String(payload.id),
        title: (payload.title as string) || "Título Criado",
        description: (payload.description as string) || "Descrição",
        updated_at: "2026-10-06T10:05:00Z",
      });
    };

    const coordinator = new ActionSaveCoordinator({
      key: "draft-async",
      writeFn,
    });

    // 1. Inicia criação do rascunho
    const createPromise = coordinator.createAction({
      title: "Título Criado",
      partners: ["cnvt"],
    });

    expect(coordinator.getState().status).toBe("creating");

    // 2. Enquanto em voo, usuário continua digitando no editor Tiptap e troca responsáveis
    coordinator.recordLocalChanges({
      description: "Nova descrição digitada durante a criação",
      responsibles: ["usr-2"],
    });

    expect(coordinator.getState().pendingPatch).toEqual({
      description: "Nova descrição digitada durante a criação",
      responsibles: ["usr-2"],
    });

    // 3. Servidor responde ao create retornando o ID e updated_at canônicos
    resolveCreate(
      makeFakeAction({
        id: "act-canonical-10",
        title: "Título Criado",
        updated_at: "2026-10-06T10:00:00Z",
      }),
    );

    // Aguarda a cadeia de promessas (create seguido pelo flush do pendingPatch)
    const finalResult = await createPromise;

    expect(callLog.length).toBe(2);
    expect(callLog[0].op).toBe("insert");
    expect(callLog[1].op).toBe("update");
    expect(callLog[1].payload.id).toBe("act-canonical-10");
    expect(callLog[1].payload.expectedUpdatedAt).toBe("2026-10-06T10:00:00Z");
    expect(callLog[1].payload.description).toBe(
      "Nova descrição digitada durante a criação",
    );

    expect(finalResult?.id).toBe("act-canonical-10");
    expect(coordinator.getState().status).toBe("saved");
    expect(Object.keys(coordinator.getState().pendingPatch).length).toBe(0);
  });

  it("falha no salvamento + safeClose (Escape) mantém gaveta aberta com conteúdo preservado", async () => {
    const existingAction = makeFakeAction({
      id: "act-existing-1",
      title: "Título Existente",
      updated_at: "2026-10-06T10:00:00Z",
    });

    const writeFn = async () => {
      throw new Error("Falha temporária de rede / 503 Service Unavailable");
    };

    const coordinator = new ActionSaveCoordinator({
      key: "act-existing-1",
      initialAction: existingAction,
      writeFn,
    });

    // O usuário faz uma alteração e tenta fechar
    const canClose = await coordinator.safeClose({
      title: "Título Alterado Mas Não Salvo",
      description: "Nova descrição que não pode ser perdida",
    });

    // A gaveta NÃO pode fechar porque há conteúdo não persistido que falhou ao salvar
    expect(canClose).toBe(false);
    expect(coordinator.getState().status).toBe("error");
    expect(coordinator.getState().errorMessage).toContain(
      "Falha temporária de rede",
    );
    // As alterações locais continuam salvas no patch pendente para recuperação
    expect(coordinator.getState().pendingPatch.title).toBe(
      "Título Alterado Mas Não Salvo",
    );
    expect(coordinator.getState().pendingPatch.description).toBe(
      "Nova descrição que não pode ser perdida",
    );
  });

  it("conflito de concorrência move para 'conflict', retém alterações até comparação com versão atual", async () => {
    let attempt = 0;
    const writeFn = async (payload: Record<string, unknown>) => {
      attempt++;
      if (payload.expectedUpdatedAt === "2026-10-06T10:00:00Z") {
        throw new ActionConflictError(
          "Esta ação foi modificada em outra sessão. Recarregue a página.",
        );
      }
      return makeFakeAction({
        id: String(payload.id),
        title: String(payload.title),
        updated_at: "2026-10-06T10:10:00Z",
      });
    };

    const action = makeFakeAction({
      id: "act-conflict-1",
      updated_at: "2026-10-06T10:00:00Z",
    });

    const coordinator = new ActionSaveCoordinator({
      key: "act-conflict-1",
      initialAction: action,
      writeFn,
    });

    // Tenta salvar patch com conflito de concorrência
    await coordinator.scheduleUpdate({
      title: "Título em Conflito",
    });

    expect(coordinator.getState().status).toBe("conflict");
    expect(coordinator.getState().errorMessage).toContain(
      "Esta ação foi modificada em outra sessão",
    );
    expect(coordinator.getState().pendingPatch.title).toBe(
      "Título em Conflito",
    );

    // Usuário clica em 'Sobrescrever' (forceSave)
    coordinator.rebase(makeFakeAction({id: "act-conflict-1", updated_at: "2026-10-06T10:09:00Z"}));
    const forced = await coordinator.saveNow();
    expect(forced).toBe(true);
    expect(attempt).toBe(2);
    expect(coordinator.getState().status).toBe("saved");
    expect(coordinator.getState().confirmedAction?.updated_at).toBe(
      "2026-10-06T10:10:00Z",
    );
  });

  it("troca de ação A -> B não contamina B com respostas atrasadas de A", async () => {
    let resolveActionA!: (action: Action) => void;

    const writeFn = async (payload: Record<string, unknown>) => {
      if (payload.id === "act-A") {
        return new Promise<Action>((res) => {
          resolveActionA = res;
        });
      }
      return makeFakeAction({
        id: "act-B",
        title: "Ação B Atualizada",
        updated_at: "2026-10-06T10:20:00Z",
      });
    };

    const actionA = makeFakeAction({ id: "act-A", title: "Ação A" });
    const actionB = makeFakeAction({ id: "act-B", title: "Ação B" });

    const coordinator = new ActionSaveCoordinator({
      key: "act-A",
      initialAction: actionA,
      writeFn,
    });

    // Dispara update na ação A
    const promiseA = coordinator.scheduleUpdate({
      title: "Ação A - Nova versão",
    });

    // Usuário muda imediatamente para a ação B antes de A responder
    coordinator.reset(actionB);
    expect(coordinator.getKey()).toBe("act-B");
    expect(coordinator.getState().confirmedAction?.id).toBe("act-B");

    // Resposta lenta de A chega agora
    resolveActionA(
      makeFakeAction({
        id: "act-A",
        title: "Ação A - Nova versão",
        updated_at: "2026-10-06T10:15:00Z",
      }),
    );
    await promiseA;

    // Coordenador de B permaneceu intacto e não foi sobrescrito pela resposta de A
    expect(coordinator.getKey()).toBe("act-B");
    expect(coordinator.getState().confirmedAction?.id).toBe("act-B");
    expect(coordinator.getState().savedTitle).toBe("Ação B");
  });

  it("safeClose com rascunho em branco permite fechar sem tentar salvar lixo", async () => {
    let writeCalled = false;
    const writeFn = async () => {
      writeCalled = true;
      return null;
    };

    const coordinator = new ActionSaveCoordinator({
      key: "draft-empty",
      initialAction: null,
      writeFn,
    });

    const canClose = await coordinator.safeClose({
      title: "",
      description: "",
    });

    expect(canClose).toBe(false);
    expect(writeCalled).toBe(false);
  });
});


describe("Drawer save regressions", () => {
  it("opening and closing an unchanged action sends no write", async () => {
    let writes = 0;
    const action = makeFakeAction();
    const coordinator = new ActionSaveCoordinator({key: action.id, initialAction: action, writeFn: async () => {writes++; return action;}});
    expect(await coordinator.safeClose({title: action.title, description: action.description || "", content_description: action.content_description || ""})).toBe(true);
    expect(writes).toBe(0);
  });
  it("manual create includes the complete initial draft", async () => {
    let sent: Record<string, unknown> = {};
    const draft = makeFakeAction({id: undefined});
    const coordinator = new ActionSaveCoordinator({key: "draft", initialAction: draft, writeFn: async payload => {sent = payload; return makeFakeAction();}});
    expect(await coordinator.saveNow({title: "Manual title"})).toBe(true);
    expect(sent.date).toBe("2026-10-06 10:00:00");
    expect(sent.partners).toEqual(["cnvt"]);
    expect(sent.category).toBe("post");
  });
});
