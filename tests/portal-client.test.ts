import { afterEach, describe, expect, it } from "bun:test";
import { fetchDashAction, fetchDashActions, fetchDashPartners } from "~/services/dash-client";
import { logoutDashSession, verifyDashSession } from "~/models/clients";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

function reply(status: number) {
  globalThis.fetch = Object.assign(async () => new Response(JSON.stringify({ error: "Falha controlada" }), { status }), { preconnect: originalFetch.preconnect });
}

describe("Portal: falhas não são conteúdo vazio", () => {
  it("preserva 503 na retomada em vez de desautenticar", async () => {
    reply(503);
    await expect(verifyDashSession()).rejects.toMatchObject({ status: 503 });
  });
  it("sessão ausente continua retornando null na retomada", async () => {
    reply(401);
    expect(await verifyDashSession()).toBeNull();
  });
  it("401 nas leituras é erro de autenticação", async () => {
    reply(401);
    await expect(fetchDashPartners()).rejects.toMatchObject({ status: 401 });
    await expect(fetchDashActions({ partner: "smartmed", from: "2026-10-01", to: "2026-10-31" })).rejects.toMatchObject({ status: 401 });
    await expect(fetchDashAction("action-1")).rejects.toMatchObject({ status: 401 });
  });
  it("404 de detalhe mantém o contrato de ausência", async () => {
    reply(404);
    expect(await fetchDashAction("unknown")).toBeNull();
  });
  it("503 no logout não confirma saída", async () => {
    reply(503);
    await expect(logoutDashSession()).rejects.toMatchObject({ status: 503 });
  });
  it("falha de rede mantém possibilidade de tentar novamente", async () => {
    globalThis.fetch = Object.assign(async () => { throw new TypeError("Network unavailable"); }, { preconnect: originalFetch.preconnect });
    await expect(verifyDashSession()).rejects.toMatchObject({ status: 503 });
  });
});

describe("Portal: confirmação de comentários e anexos", () => {
  it("não confirma exclusão ou anexos sem representação retornada", async () => {
    const {deleteDashComment,updateDashWorkFiles} = await import("~/services/dash-client");
    reply(200);
    await expect(deleteDashComment("action-1","comment-1")).rejects.toMatchObject({status:503});
    await expect(updateDashWorkFiles("action-1",[])).rejects.toMatchObject({status:503});
  });
  it("preserva 401 e 404 das mutações em vez de sucesso",async()=>{
    const {createDashComment,updateDashComment} = await import("~/services/dash-client");
    reply(401);
    await expect(createDashComment("action-1","Texto")).rejects.toMatchObject({status:401});
    reply(404);
    await expect(updateDashComment("action-1","other","Texto")).rejects.toMatchObject({status:404});
  });
  it("leitura sem lista válida não vira observações vazias",async()=>{
    const {fetchDashComments} = await import("~/services/dash-client");
    reply(200);
    await expect(fetchDashComments("action-1")).rejects.toMatchObject({status:503});
  });
});
