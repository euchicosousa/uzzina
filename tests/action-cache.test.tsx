import {afterEach, beforeEach, expect, it, mock} from "bun:test";
import {act, cleanup, renderHook, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type {ReactNode} from "react";
import {useActionMutations} from "../app/hooks/useActionMutations";
import {QUERY_KEYS} from "../app/lib/query-keys";
import {INTENT} from "../app/lib/CONSTANTS";
import type {Action} from "../app/types";

type Reply = {data: Action | null; error: {message:string} | null};
let requests: {patch: Record<string,unknown>; filters:Record<string,unknown>; resolve: (reply:Reply)=>void}[]=[];
const base: Action = {id:"11111111-1111-4111-8111-111111111111",title:"Original",date:"2026-10-07 10:00:00",category:"design",phase:"do",priority:"medium",color:"#666666",time:10,partners:["agency"],responsibles:["user"],archived:false,description:null,content_description:null,instagram_caption:null,content_files:[],work_files:[],sprints:[],strategies:[],user_id:"user",created_at:"2026-10-07T10:00:00Z",updated_at:"2026-10-07T10:00:00Z"};
// Real hook, QueryClient and production mutations; only database responses are controlled.
mock.module("~/lib/supabase.client",()=>({createSupabaseBrowserClient:()=>({from:()=>{
 let patch:Record<string,unknown>={};const filters:Record<string,unknown>={};
 const chain={select:()=>chain,eq:(key:string,value:unknown)=>{filters[key]=value;return chain;},insert:(value:Record<string,unknown>)=>{patch=value;return chain;},update:(value:Record<string,unknown>)=>{patch=value;return chain;},single:()=>new Promise<Reply>(resolve=>requests.push({patch,filters,resolve}))};return chain;
}})}));
beforeEach(()=>{requests=[];});afterEach(cleanup);
function mount(){const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});const hook=renderHook(()=>useActionMutations(),{wrapper:({children}:{children:ReactNode})=><QueryClientProvider client={client}>{children}</QueryClientProvider>});return {...hook,client};}
it("pending creation does not invent cards in other cached lists",async()=>{
 const {result,client}=mount();
 const tomorrow=QUERY_KEYS.actions.today("user","2026-10-08");const other=QUERY_KEYS.actions.partner("user","other");
 client.setQueryData(tomorrow,[]);client.setQueryData(other,[]);
 let saving:Promise<unknown>;
 act(()=>{saving=result.current.handleAction({...base,id:undefined,intent:INTENT.create_action});});
 await waitFor(()=>expect(requests.length).toBe(1));
 expect(client.getQueryData<Action[]>(tomorrow)).toEqual([]);
 expect(client.getQueryData<Action[]>(other)).toEqual([]);
 await act(async()=>{requests[0]?.resolve({data:base,error:null});await saving;});
});
function period(day:string,partners=["agency"]){return ["actions","period","user",{actionScope:{kind:"period",userId:"user",isAdmin:true,partners,from:`${day} 00:00:00`,to:`${day} 23:59:59`}}] as const;}
it("confirmed date moves the action only into matching cached periods",async()=>{
 const {result,client}=mount();const today=period("2026-10-07");const tomorrow=period("2026-10-08");const other=period("2026-10-08",["other"]);
 client.setQueryData(today,[base]);client.setQueryData(tomorrow,[]);client.setQueryData(other,[]);
 let saving:Promise<unknown>;act(()=>{saving=result.current.handleAction({id:base.id,intent:INTENT.update_action,expectedUpdatedAt:base.updated_at,date:"2026-10-08 10:00:00"});});
 await waitFor(()=>expect(requests.length).toBe(1));
 await act(async()=>{requests[0]?.resolve({data:{...base,date:"2026-10-08 10:00:00",updated_at:"2026-10-07T10:01:00Z"},error:null});await saving;});
 expect(client.getQueryData<Action[]>(today)).toEqual([]);
 expect((client.getQueryData<Action[]>(tomorrow)||[]).map(a=>a.id)).toEqual([base.id]);
 expect(client.getQueryData<Action[]>(other)).toEqual([]);
});
it("a late failure cannot undo a later successful edit",async()=>{
 const {result,client}=mount();const key=period("2026-10-07");client.setQueryData(key,[base]);
 let first:Promise<unknown>;let second:Promise<unknown>;
 act(()=>{first=result.current.handleAction({id:base.id,intent:INTENT.update_action,expectedUpdatedAt:base.updated_at,title:"Fails"}).catch(()=>null);});
 await waitFor(()=>expect(requests.length).toBe(1));
 act(()=>{second=result.current.handleAction({id:base.id,intent:INTENT.update_action,expectedUpdatedAt:base.updated_at,title:"Confirmed"});});
 await waitFor(()=>expect(requests.length).toBe(2));
 await act(async()=>{requests[1]?.resolve({data:{...base,title:"Confirmed",updated_at:"2026-10-07T10:01:00Z"},error:null});await second;});
 await act(async()=>{requests[0]?.resolve({data:null,error:{message:"Controlled failure"}});await first;});
 expect(client.getQueryData<Action[]>(key)?.[0]?.title).toBe("Confirmed");
});
it("an older confirmation cannot resurrect a card in its former period",async()=>{
 const {result,client}=mount();const today=period("2026-10-07");const tomorrow=period("2026-10-08");client.setQueryData(today,[base]);client.setQueryData(tomorrow,[]);
 let first:Promise<unknown>;let second:Promise<unknown>;
 act(()=>{first=result.current.handleAction({id:base.id,intent:INTENT.update_action,expectedUpdatedAt:base.updated_at,title:"Earlier"});});
 await waitFor(()=>expect(requests.length).toBe(1));
 act(()=>{second=result.current.handleAction({id:base.id,intent:INTENT.update_action,expectedUpdatedAt:"2026-10-07T10:00:00.000001Z",date:"2026-10-08 10:00:00"});});
 await waitFor(()=>expect(requests.length).toBe(2));
 await act(async()=>{requests[1]?.resolve({data:{...base,date:"2026-10-08 10:00:00",updated_at:"2026-10-07T10:00:00.000002Z"},error:null});await second;});
 await act(async()=>{requests[0]?.resolve({data:{...base,title:"Earlier",updated_at:"2026-10-07T10:00:00.000001Z"},error:null});await first;});
 expect(client.getQueryData<Action[]>(today)).toEqual([]);
 expect(client.getQueryData<Action[]>(tomorrow)?.[0]?.date).toBe("2026-10-08 10:00:00");
});
it("confirmed creation appears once and only in an allowed list",async()=>{
 const {result,client}=mount();const key=period("2026-10-07");const other=period("2026-10-07",["other"]);const unknown=QUERY_KEYS.actions.home("user");
 client.setQueryData(key,[]);client.setQueryData(other,[]);client.setQueryData(unknown,[]);
 let saving:Promise<unknown>;act(()=>{saving=result.current.handleAction({...base,id:undefined,intent:INTENT.create_action});});
 await waitFor(()=>expect(requests.length).toBe(1));
 expect(client.getQueryData<Action[]>(key)).toEqual([]);
 await act(async()=>{requests[0]?.resolve({data:base,error:null});await saving;});
 expect(client.getQueryData<Action[]>(key)?.map(row=>row.id)).toEqual([base.id]);
 expect(client.getQueryData<Action[]>(other)).toEqual([]);
 expect(client.getQueryData<Action[]>(unknown)).toEqual([]);
 expect(client.getQueryState(unknown)?.isInvalidated).toBe(true);
});
it("duplicate uses the real read/insert contract and adds one confirmed copy",async()=>{
 const {result,client}=mount();const key=period("2026-10-07");client.setQueryData(key,[base]);
 let saving:Promise<unknown>;act(()=>{saving=result.current.handleAction({id:base.id,intent:INTENT.duplicate_action});});
 await waitFor(()=>expect(requests.length).toBe(1));
 await act(async()=>{requests[0]?.resolve({data:base,error:null});});
 await waitFor(()=>expect(requests.length).toBe(2));
 expect(requests[1]?.patch.title).toBe("Original (Cópia)");
 expect(client.getQueryData<Action[]>(key)?.length).toBe(1);
 await act(async()=>{requests[1]?.resolve({data:{...base,id:"22222222-2222-4222-8222-222222222222",title:"Original (Cópia)"},error:null});await saving;});
 expect(client.getQueryData<Action[]>(key)?.map(row=>row.title)).toEqual(["Original","Original (Cópia)"]);
});
it("finished leaves overdue while done remains and members receive only their work",async()=>{
 const {result,client}=mount();const past={...base,date:"2020-01-01 10:00:00",sprints:["user"]};
 const all=period("2020-01-01");const late=QUERY_KEYS.actions.list("late","user",true,["agency"]);const member=QUERY_KEYS.actions.list("today","someone-else",false,["agency"],"2020-01-01 00:00:00","2020-01-01 23:59:59");
 client.setQueryData(all,[past]);client.setQueryData(late,[past]);client.setQueryData(member,[]);
 for (const phase of ["done","finished"]) {
  let saving:Promise<unknown>;act(()=>{saving=result.current.handleAction({id:base.id,intent:INTENT.update_action,expectedUpdatedAt:base.updated_at,phase});});
  await waitFor(()=>expect(requests.length).toBe(phase==="done"?1:2));
  await act(async()=>{requests.at(-1)?.resolve({data:{...past,phase,sprints:phase==="finished"?null:["user"],updated_at:phase==="done"?"2026-10-07T10:01:00Z":"2026-10-07T10:02:00Z"},error:null});await saving;});
  expect(client.getQueryData<Action[]>(late)?.length).toBe(phase==="done"?1:0);
 }
 expect(client.getQueryData<Action[]>(all)?.[0]?.phase).toBe("finished");
 expect(client.getQueryData<Action[]>(all)?.[0]?.sprints).toBeNull();
 expect(client.getQueryData<Action[]>(member)).toEqual([]);
});
it("bulk reports only confirmed actions and preserves each expected version",async()=>{
 const {result,client}=mount();
 const targets=Array.from({length:5},(_,i)=>({...base,id:`${i+1}1111111-1111-4111-8111-111111111111`}));
 const key=period("2026-10-07");client.setQueryData(key,targets);
 let saving:ReturnType<typeof result.current.handleBulkAction>;
 act(()=>{saving=result.current.handleBulkAction(targets,{phase:"finished"});});
 await waitFor(()=>expect(requests.length).toBe(1));
 await act(async()=>{
  requests[0]?.resolve({data:{...targets[0],...base,id:targets[0]?.id||"",phase:"finished",sprints:null},error:null});
 });
 await waitFor(()=>expect(requests.length).toBe(2));
 await act(async()=>{
  requests[1]?.resolve({data:{...base,id:targets[1]?.id||"",phase:"finished",sprints:null},error:null});
 });
 await waitFor(()=>expect(requests.length).toBe(3));
 await act(async()=>{
  requests[2]?.resolve({data:null,error:null});
 });
 await waitFor(()=>expect(requests.length).toBe(4));
 await act(async()=>{
  requests[3]?.resolve({data:null,error:{message:"Forbidden"}});
 });
 await waitFor(()=>expect(requests.length).toBe(5));
 await act(async()=>{
  requests[4]?.resolve({data:null,error:{message:"Offline"}});
  const report=await saving;
  expect(report.succeededIds).toEqual(targets.slice(0,2).map(action=>action.id));
  expect(report.conflicts.map(item=>item.id)).toEqual([targets[2]?.id||""]);
  expect(report.failed.map(item=>item.id)).toEqual(targets.slice(3).map(action=>action.id));
 });
 expect(client.getQueryData<Action[]>(key)?.map(action=>action.phase)).toEqual(["finished","finished","do","do","do"]);
 expect(requests.every(request=>request.filters.updated_at===base.updated_at)).toBe(true);
 expect(requests.every(request=>request.patch.sprints===null && !("updated_at" in request.patch))).toBe(true);
});
it("empty bulk performs no database writes and confirms nothing",async()=>{
 const {result}=mount();
 let report:Awaited<ReturnType<typeof result.current.handleBulkAction>> | undefined;
 await act(async()=>{report=await result.current.handleBulkAction([],{phase:"finished"});});
 expect(report).toEqual({succeededIds:[],failed:[],conflicts:[]});
 expect(requests.length).toBe(0);
});
it("date-only and time-only bulk preserve each action's other date component",async()=>{
 const {result}=mount();const targets=[base,{...base,id:"22222222-2222-4222-8222-222222222222",date:"2026-10-09 18:45:30"}];
 let saving:ReturnType<typeof result.current.handleBulkDateOnly>;
 act(()=>{saving=result.current.handleBulkDateOnly(targets,"2026-10-20");});
 await waitFor(()=>expect(requests.length).toBe(1));
 expect(requests[0]?.patch.date).toBe("2026-10-20 10:00:00");
 await act(async()=>{requests[0]?.resolve({data:{...base,date:"2026-10-20 10:00:00"},error:null});});
 await waitFor(()=>expect(requests.length).toBe(2));
 expect(requests[1]?.patch.date).toBe("2026-10-20 18:45:30");
 await act(async()=>{requests[1]?.resolve({data:targets[1]||null,error:null});await saving;});
 act(()=>{saving=result.current.handleBulkTimeOnly(targets,"08:15");});
 await waitFor(()=>expect(requests.length).toBe(3));
 expect(requests[2]?.patch.date).toBe("2026-10-07 08:15:00");
 await act(async()=>{requests[2]?.resolve({data:base,error:null});});
 await waitFor(()=>expect(requests.length).toBe(4));
 expect(requests[3]?.patch.date).toBe("2026-10-09 08:15:00");
 await act(async()=>{requests[3]?.resolve({data:targets[1]||null,error:null});await saving;});
});

import {resetQuerySession} from "../app/lib/query-client";
it("a pending write from A cannot populate B's cache after a session reset",async()=>{
 const {result,client}=mount();
 let saving:Promise<unknown>;
 act(()=>{saving=result.current.handleAction({id:base.id,intent:INTENT.update_action,expectedUpdatedAt:base.updated_at,title:"Private A"});});
 await waitFor(()=>expect(requests.length).toBe(1));
 resetQuerySession(client);
 const key=QUERY_KEYS.actions.list("today","user-b",true,["agency"],"2026-10-07 00:00:00","2026-10-07 23:59:59");
 client.setQueryData(key,[]);
 await act(async()=>{requests[0]?.resolve({data:{...base,title:"Private A",updated_at:"2026-10-07T11:00:00Z"},error:null});await saving;});
 expect(client.getQueryData<Action[]>(key)).toEqual([]);
 expect(client.getQueryState(key)?.isInvalidated).toBe(false);
});
it("a queued callback from an ended session performs no new database write",async()=>{
 const {result,client}=mount();const oldSave=result.current.handleAction;
 resetQuerySession(client);
 await expect(oldSave({id:base.id,intent:INTENT.update_action,expectedUpdatedAt:base.updated_at,title:"Old session"})).rejects.toThrow("A sessão mudou");
 expect(requests.length).toBe(0);
});
it("ending a session stops the remaining items of a bulk write",async()=>{
 const {result,client}=mount();
 let saving:ReturnType<typeof result.current.handleBulkAction>;
 act(()=>{saving=result.current.handleBulkAction([base,{...base,id:"22222222-2222-4222-8222-222222222222"}],{phase:"finished"});});
 await waitFor(()=>expect(requests.length).toBe(1));
 resetQuerySession(client);
 await act(async()=>{requests[0]?.resolve({data:{...base,phase:"finished"},error:null});});
 // A second request would leave the promise pending: observe writes before awaiting it.
 await act(async()=>{await Promise.resolve();});
 expect(requests.length).toBe(1);
 await act(async()=>{const report=await saving;expect(report.failed.map(item=>item.id)).toEqual(["22222222-2222-4222-8222-222222222222"]);});
});
it("ending a session between duplicate read and insert prevents creation",async()=>{
 const {result,client}=mount();let saving:Promise<unknown> | undefined;
 act(()=>{saving=result.current.handleAction({id:base.id,intent:INTENT.duplicate_action}).catch((error:unknown)=>error);});
 await waitFor(()=>expect(requests.length).toBe(1));
 resetQuerySession(client);
 await act(async()=>{requests[0]?.resolve({data:base,error:null});});
 await act(async()=>{await Promise.resolve();});
 expect(requests.length).toBe(1);
 if (!saving) throw new Error("Duplicate was not requested");
 expect(await saving).toBeInstanceOf(Error);
 expect(String(await saving)).toContain("A sessão mudou");
});
