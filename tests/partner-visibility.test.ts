import {expect,it} from "bun:test";
import type {SupabaseClient} from "@supabase/supabase-js";
import {getAllPartners,getOperationalPartners} from "~/models/partners";

const rows = [
  {slug:"active",archived:false,users_ids:["member"]},
  {slug:"hidden",archived:true,users_ids:["member"]},
  {slug:"other",archived:false,users_ids:["other-member"]},
];
function database() {
  const filters: ((row: typeof rows[number]) => boolean)[] = [];
  const chain={
    select:()=>chain,
    eq:(key:"archived",value:boolean)=>{filters.push(row=>row[key]===value);return chain;},
    contains:(_key:string,ids:string[])=>{filters.push(row=>ids.every(id=>row.users_ids.includes(id)));return chain;},
    order:()=>chain,
    // biome-ignore lint/suspicious/noThenProperty: database boundary
    then:(resolve:(data:{data:typeof rows;error:null})=>void)=>Promise.resolve(resolve({data:rows.filter(row=>filters.every(f=>f(row))),error:null})),
  };
  return {from:()=>chain} as unknown as SupabaseClient;
}
it("administrador não recebe parceiro arquivado no contexto operacional",async()=>{
  const partners=await getOperationalPartners(database(),"member",true);
  expect(partners.map(p=>p.slug)).toEqual(["active","other"]);
});
it("colaborador só recebe parceiros ativos aos quais pertence",async()=>{
  expect((await getOperationalPartners(database(),"member",false)).map(p=>p.slug)).toEqual(["active"]);
});
it("consulta administrativa preserva parceiros arquivados",async()=>{
  expect((await getAllPartners(database())).map(p=>p.slug)).toEqual(["active","hidden","other"]);
});

import {filterOperationalActions} from "~/utils/partner-visibility";
import {QueryClient} from "@tanstack/react-query";
import {QUERY_KEYS} from "~/lib/query-keys";
it("ações de parceiro oculto não entram na lista ou contagem de atrasados, mesmo em cache antigo",()=>{
  const actions=[{id:"old",partners:["hidden"]},{id:"current",partners:["active"]},{id:"mixed",partners:["hidden","active"]}];
  expect(filterOperationalActions(actions,rows).map(a=>a.id)).toEqual(["current","mixed"]);
  expect(filterOperationalActions(actions,[])).toEqual([]);
});
it("listar parceiros na administração não contamina o contexto operacional",()=>{
  const client=new QueryClient();
  client.setQueryData(QUERY_KEYS.operationalPartners("member",true),[rows[0]]);
  client.setQueryData(QUERY_KEYS.adminPartners("user"),rows);
  expect(client.getQueryData<typeof rows>(QUERY_KEYS.operationalPartners("member",true))).toEqual([rows[0]]);
  expect(client.getQueryData(QUERY_KEYS.operationalPartners("other",false))).toBeUndefined();
  client.clear();
});
