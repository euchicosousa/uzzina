import { beforeEach, expect, it, mock } from "bun:test";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hashSessionToken, SESSION_COOKIE_NAME } from "../server/dash-session";

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = {};
let writes = 0;
let failWrite = false;
let loseWrite = false;
mock.module("@supabase/supabase-js", () => ({createClient: () => ({from: (table: string) => {
  const filters: ((row: Row) => boolean)[] = [];
  let change: Row | undefined;
  let operation = "read";
  let start = 0;
  let end = Infinity;
  const execute = () => {
    const rows = (db[table] || []).filter(row => filters.every(filter => filter(row)));
    if (operation !== "read") {
      if (failWrite) return {data:null,error:{code:"XX000"}};
      if (loseWrite) return {data:[],error:null};
      writes++;
      if (operation === "insert") {
        const row = {id:"new-comment",created_at:"2026-10-06T12:00:00Z",...change};
        db[table].push(row);
        return {data:[row],error:null};
      }
      if (operation === "update") for (const row of rows) Object.assign(row,change);
      if (operation === "delete") db[table] = db[table].filter(row => !rows.includes(row));
    }
    return {data:rows.slice(start,end+1),error:null};
  };
  const chain = {
    select: (_columns?: string) => chain,
    eq: (key:string,value:unknown) => {filters.push(row => row[key] === value);return chain;},
    is: (key:string,value:unknown) => {filters.push(row => row[key] === value);return chain;},
    gt: (key:string,value:string) => {filters.push(row => String(row[key]) > value);return chain;},
    in: (key:string,values:unknown[]) => {filters.push(row => values.includes(row[key]));return chain;},
    contains: (key:string,values:unknown[]) => {filters.push(row => Array.isArray(row[key]) && values.every(v => (row[key] as unknown[]).includes(v)));return chain;},
    overlaps: (key:string,values:unknown[]) => {filters.push(row => Array.isArray(row[key]) && values.some(v => (row[key] as unknown[]).includes(v)));return chain;},
    order: () => chain,
    range: (from:number,to:number) => {start=from;end=to;return chain;},
    insert: (row:Row) => {operation="insert";change=row;return chain;},
    update: (row:Row) => {operation="update";change=row;return chain;},
    delete: () => {operation="delete";return chain;},
    single: async () => {const result=execute();return result.error ? result : result.data?.length===1 ? {data:result.data[0],error:null} : {data:null,error:{code:"PGRST116"}};},
    // biome-ignore lint/suspicious/noThenProperty: external PostgREST boundary
    then: (resolve:(result:ReturnType<typeof execute>) => void) => Promise.resolve(resolve(execute())),
  };
  return chain;
}})}));
import handler from "../api/dash-action";

beforeEach(() => {
  process.env.SUPABASE_URL="https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY="test-only";
  process.env.APP_ORIGIN="https://portal.example";
  writes=0;failWrite=false;loseWrite=false;
  db.dash_sessions=[{client_id:"a",token_hash:hashSessionToken("valid-token"),revoked_at:null,expires_at:"2099-01-01"}];
  db.clients=[{id:"a",name:"Alice",image:null,partners:["smartmed"],active:true},{id:"b",name:"Bob",partners:["toro"],active:true}];
  db.people=[];
  db.partners=[{slug:"smartmed",archived:false},{slug:"toro",archived:false}];
  db.actions=[{id:"action-a",partners:["smartmed"],work_files:[],updated_at:"2026-10-06T12:00:00Z"},{id:"action-b",partners:["toro"],work_files:[],updated_at:"2026-10-06T12:00:00Z"}];
  db.action_comments=[
    {id:"own",action_id:"action-a",author_id:"a",author_name:"Alice",content:"Público",is_user:false,is_internal:false,mentions:[],created_at:"2026-10-06T12:00:00Z"},
    {id:"other",action_id:"action-a",author_id:"b",author_name:"Bob",content:"Outro",is_user:false,is_internal:false,mentions:[]},
    {id:"internal",action_id:"action-a",author_id:"a",author_name:"Alice",content:"SEGREDO",is_user:false,is_internal:true,mentions:[]},
  ];
});
async function request(method:string,op:string,body:Row={},headers:Record<string,string>={}) {
  let status=200;let result:Row={};
  const res={setHeader:()=>res,status:(code:number)=>{status=code;return res;},json:(data:Row)=>{result=data;return res;}};
  await handler({method,query:{op,actionId:typeof body.actionId === "string" ? body.actionId : "action-a"},body,headers:{cookie:`${SESSION_COOKIE_NAME}=valid-token`,origin:"https://portal.example",...headers}} as unknown as VercelRequest,res as unknown as VercelResponse);
  return {status,body:result};
}
it("nega escrita em ação de outro parceiro sem gravar",async()=>{
  const response=await request("POST","comment",{actionId:"action-b",content:"Ataque"});
  expect(response.status).toBe(404);expect(writes).toBe(0);
});
it("lista somente mensagens públicas, com DTO e imagem do servidor",async()=>{
  db.clients[0].password_hash="SEGREDO";
  db.action_comments[0].extra="SEGREDO";
  const response=await request("GET","comments");
  expect(response.status).toBe(200);
  const comments=response.body.comments as Row[];
  expect(comments.map(c=>c.id)).toEqual(["own","other"]);
  expect(comments[0].author_image).toBeNull();
  expect(JSON.stringify(response.body)).not.toContain("SEGREDO");
});
it("cria mensagem com autoria e audiência derivadas da sessão",async()=>{
  const response=await request("POST","comment",{actionId:"action-a",content:"  Material pronto  "});
  expect(response.status).toBe(201);
  expect(response.body.comment).toMatchObject({author_id:"a",author_name:"Alice",content:"Material pronto",is_internal:false,is_user:false,mentions:[]});
});
it("recusa falsificação de autoria e campos extras",async()=>{
  const response=await request("POST","comment",{actionId:"action-a",content:"Texto",author_id:"b",is_internal:true});
  expect(response.status).toBe(400);expect(writes).toBe(0);
});
it("edita e exclui apenas mensagem pública própria, confirmando a gravação",async()=>{
  const edited=await request("PATCH","comment",{actionId:"action-a",commentId:"own",content:"Revisado"});
  expect(edited.status).toBe(200);expect(edited.body.comment).toMatchObject({id:"own",content:"Revisado"});
  const deleted=await request("DELETE","comment",{actionId:"action-a",commentId:"own"});
  expect(deleted.status).toBe(200);expect(deleted.body).toEqual({deletedId:"own"});
  expect((await request("DELETE","comment",{actionId:"action-a",commentId:"own"})).status).toBe(404);
});
for (const commentId of ["other","internal","missing"]) {
  for (const method of ["PATCH","DELETE"]) it(`${method} recusa comentário ${commentId}`,async()=>{
    const body=method==="PATCH" ? {actionId:"action-a",commentId,content:"Ataque"} : {actionId:"action-a",commentId};
    expect((await request(method,"comment",body)).status).toBe(404);expect(writes).toBe(0);
  });
}
it("não confirma escrita que afetou zero linhas",async()=>{
  loseWrite=true;
  expect((await request("PATCH","comment",{actionId:"action-a",commentId:"own",content:"Mudou"})).status).toBe(404);
});
it("confirma apenas os anexos gravados, sem permitir outros campos da ação",async()=>{
  const response=await request("PATCH","work-files",{actionId:"action-a",work_files:["https://cdn.example/material.pdf"],expectedUpdatedAt:"2026-10-06T12:00:00Z"});
  expect(response.status).toBe(200);
  expect(response.body.actionId).toBe("action-a");
  expect(response.body.work_files).toEqual(["https://cdn.example/material.pdf"]);
  expect(response.body.count).toBe(1);
  expect(typeof response.body.updated_at).toBe("string");
  expect((await request("PATCH","work-files",{actionId:"action-a",work_files:[],expectedUpdatedAt:"2026-10-06T12:00:00Z",phase:"done"})).status).toBe(400);
  expect((await request("PATCH","work-files",{actionId:"action-a",work_files:[]})).status).toBe(400);
});
it("rejeita com 409 se expectedUpdatedAt for conflitante",async()=>{
  const response=await request("PATCH","work-files",{actionId:"action-a",work_files:[],expectedUpdatedAt:"2025-01-01T00:00:00Z"});
  expect(response.status).toBe(409);
  expect(response.body.error).toBe("Esta ação mudou. Recarregue antes de salvar.");
});
for (const files of [["javascript:alert(1)"],["ftp://example.com/a"],Array(101).fill("https://example.com/a"),[`https://example.com/${"a".repeat(2048)}`],"invalid"]) {
  it("recusa anexos fora do contrato",async()=>{
    expect((await request("PATCH","work-files",{actionId:"action-a",work_files:files,expectedUpdatedAt:"2026-10-06T12:00:00Z"})).status).toBe(400);expect(writes).toBe(0);
  });
}
it("anexo não confirma zero linhas nem falha do banco",async()=>{
  loseWrite=true;
  expect((await request("PATCH","work-files",{actionId:"action-a",work_files:[],expectedUpdatedAt:"2026-10-06T12:00:00Z"})).status).toBe(409);
  loseWrite=false;failWrite=true;
  expect((await request("PATCH","work-files",{actionId:"action-a",work_files:[],expectedUpdatedAt:"2026-10-06T12:00:00Z"})).status).toBe(503);
});
it("mutações rejeitam origem ausente ou externa",async()=>{
  for (const origin of ["","https://attacker.example"]) {
    expect((await request("POST","comment",{actionId:"action-a",content:"Texto"},{origin})).status).toBe(403);
  }
  expect(writes).toBe(0);
});
it("sessões ausentes, expiradas e revogadas não escrevem",async()=>{
  expect((await request("POST","comment",{actionId:"action-a",content:"Texto"},{cookie:""})).status).toBe(401);
  db.dash_sessions[0].revoked_at="2026-10-06";
  expect((await request("POST","comment",{actionId:"action-a",content:"Texto"})).status).toBe(401);
  db.dash_sessions[0].revoked_at=null;db.dash_sessions[0].expires_at="2000-01-01";
  expect((await request("POST","comment",{actionId:"action-a",content:"Texto"})).status).toBe(401);
  expect(writes).toBe(0);
});
it("nega leitura de comentários e anexos de outra ação",async()=>{
  expect((await request("GET","comments",{actionId:"action-b"})).status).toBe(404);
  expect((await request("PATCH","work-files",{actionId:"action-b",work_files:[]})).status).toBe(404);
  expect(writes).toBe(0);
});
it("não altera mensagem da equipe mesmo com author_id igual",async()=>{
  db.action_comments[0].is_user=true;
  expect((await request("PATCH","comment",{actionId:"action-a",commentId:"own",content:"Ataque"})).status).toBe(404);
  expect(writes).toBe(0);
});
it("não altera comentário vinculado a outra ação",async()=>{
  db.action_comments[0].action_id="action-b";
  expect((await request("DELETE","comment",{actionId:"action-a",commentId:"own"})).status).toBe(404);
  expect(writes).toBe(0);
});
it("recusa comentário vazio e acima de 10000 caracteres",async()=>{
  for (const content of ["   ","a".repeat(10001)]) {
    expect((await request("POST","comment",{actionId:"action-a",content})).status).toBe(400);
  }
  expect(writes).toBe(0);
});
it("falha de gravação não confirma mensagem",async()=>{
  failWrite=true;
  expect((await request("POST","comment",{actionId:"action-a",content:"Texto"})).status).toBe(503);
  expect((await request("DELETE","comment",{actionId:"action-a",commentId:"own"})).status).toBe(503);
});
it("conta desativada perde acesso às mutações",async()=>{
  db.clients[0].active=false;
  expect((await request("POST","comment",{actionId:"action-a",content:"Texto"})).status).toBe(401);
  expect(writes).toBe(0);
});

it("arquivar parceiro remove acesso operacional aos comentários e anexos",async()=>{
  db.partners[0].archived=true;
  expect((await request("GET","comments")).status).toBe(404);
  expect((await request("PATCH","work-files",{actionId:"action-a",work_files:[]})).status).toBe(404);
  expect(writes).toBe(0);
});
