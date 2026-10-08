import {afterEach, beforeEach, expect, it, mock} from "bun:test";
import {act, cleanup, fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AppContext} from "../app/contexts/AppContext";
import {ActionFormDrawer} from "../app/components/features/action-drawer/ActionFormDrawer";
import type {Action, Person, Partner} from "../app/types";
import {QUERY_KEYS} from "../app/lib/query-keys";

type Row = Record<string, unknown>;
let writes: Row[] = [];
let fail = false;
let resolveWrite: ((value: {data: Action; error: null}) => void) | null = null;
let delay = false;
let conflict = false;
const action: Action = {id:"11111111-1111-4111-8111-111111111111", title:"Original title", date:"2026-10-06 10:00:00", category:"design", phase:"do", priority:"medium", color:"#666666", time:10, partners:["agency"], responsibles:[], archived:false, description:null, content_description:null, instagram_caption:null, content_files:[], work_files:[], sprints:[], strategies:[], user_id:"test-user", created_at:"2026-10-06T10:00:00Z", updated_at:"2026-10-06T10:00:00Z"};
const person = {id:"test-person", user_id:"test-user", name:"User", surname:"Test", initials:"UT", short:"User", email:"user@test.invalid", admin:true, visible:true, image:null, areas:[], preferences:null,created_at:"2026-10-06T10:00:00Z"} satisfies Person;
const partner = {id:"partner", slug:"agency", title:"Agency", short:"Agency", colors:["#666666"], users_ids:[], archived:false, image:null, sow:"socialmedia", created_at:"2026-10-06T10:00:00Z", instagram_caption_tail:null, context:null,voice:null} satisfies Partner;

// Only the external database boundary is controlled; drawer, editors, hooks and validation remain real.
mock.module("~/lib/supabase.client", () => ({createSupabaseBrowserClient: () => ({from: () => {
  let patch: Row | null = null;
  const chain = {
    select: () => chain, eq: () => chain, is: () => chain, order: () => chain,
    insert: (value: Row) => {patch=value; return chain;}, update: (value: Row) => {patch=value; return chain;},
    single: async () => {
      if (patch) writes.push({...patch});
      if (patch && conflict) return {data:null,error:{code:"PGRST116",message:"Version changed"}};
      if (fail) return {data:null,error:{message:"Unavailable"}};
      if (delay) return new Promise<{data:Action;error:null}>(resolve => {resolveWrite=resolve;});
      return {data:{...action,...patch,updated_at:"2026-10-06T10:01:00Z"},error:null};
    },
  };
  return chain;
}})}));

beforeEach(() => {writes=[];fail=false;delay=false;resolveWrite=null;conflict=false;});
afterEach(cleanup);
function draft(overrides: Partial<Action>): Action {return {...action,...overrides};}
function mount(base: Action = action, onClose = () => {}, partnerFilters: string[] = []) {
  const client = new QueryClient({defaultOptions:{queries:{retry:false}, mutations:{retry:false}}});
  client.setQueryData(QUERY_KEYS.people("test-user"), []);
  const view = (selected: Action, version: number) => <QueryClientProvider client={client}><AppContext.Provider value={{person, partners:[partner], cloudName:"test", uploadPreset:"test", setBaseAction:()=>{}, partnerFilters,setPartnerFilters:()=>{}}}><ActionFormDrawer partnerFilters={partnerFilters} key={`${selected.id || "draft"}:${version}`} BaseAction={selected} onClose={onClose}/></AppContext.Provider></QueryClientProvider>;
  const mounted = render(view(base, 0));
  return {...mounted, select: (selected: Action, version: number) => mounted.rerender(view(selected, version))};
}
it("a draft is recognised by the missing id, not by created_at", async () => {
  mount(draft({id:undefined,title:"Stale stamp",partners:[],created_at:"2026-01-01T00:00:00Z",updated_at:undefined}), () => {}, ["agency"]);
  fireEvent.click(screen.getByRole("button",{name:"Criar"}));
  await waitFor(()=>expect(writes.length).toBe(1));
  expect(writes[0]?.partners).toEqual(["agency"]);
});
it("a new draft is shown as just created, not hours ago, outside UTC", () => {
  const previousTZ = process.env.TZ;
  process.env.TZ = "America/Sao_Paulo";
  try {
    mount(draft({id:undefined,title:"Fresh draft",created_at:undefined,updated_at:undefined}));
    expect(screen.getByText(/Criada há menos de um minuto/)).toBeTruthy();
  } finally {
    process.env.TZ = previousTZ;
  }
});
it("real drawer closes unchanged without writing", async () => {
  let closed=0; mount(action,()=>closed++);
  fireEvent.click(screen.getByRole("button",{name:"Fechar"}));
  await waitFor(()=>expect(closed).toBe(1));
  expect(writes.length).toBe(0);
});
it("real manual create sends complete draft and one insert", async () => {
  mount(draft({id:undefined,title:"Manual create",created_at:undefined,updated_at:undefined}));
  fireEvent.click(screen.getByRole("button",{name:"Criar"}));
  await waitFor(()=>expect(writes.length).toBe(1));
  expect(writes[0]?.date).toBe("2026-10-06 10:00:00");
  expect(writes[0]?.partners).toEqual(["agency"]);
  expect(writes[0]?.category).toBe("design");
  expect(typeof writes[0]?.updated_at).toBe("string");
});
it("real drawer preserves typed title and stays open when save fails", async () => {
  let closed=0; mount(action,()=>closed++); fail=true;
  fireEvent.change(screen.getByRole("textbox",{name:"Título da ação"}),{target:{value:"Unsaved title"}});
  fireEvent.click(screen.getByRole("button",{name:"Fechar"}));
  await screen.findByTestId("drawer-error-banner");
  expect(closed).toBe(0);
  expect((screen.getByRole("textbox",{name:"Título da ação"}) as HTMLTextAreaElement).value).toBe("Unsaved title");
});
it("edits made during INSERT survive its response and reach UPDATE", async () => {
  delay=true;
  mount(draft({id:undefined,title:"First title",created_at:undefined,updated_at:undefined}));
  fireEvent.click(screen.getByRole("button",{name:"Criar"}));
  await waitFor(()=>expect(writes.length).toBe(1));
  fireEvent.change(screen.getByRole("textbox",{name:"Título da ação"}),{target:{value:"Latest title"}});
  delay=false;
  await act(async()=>{resolveWrite?.({data:{...action,title:"First title"},error:null});});
  await waitFor(()=>expect(writes.length).toBe(2));
  expect(writes[1]?.title).toBe("Latest title");
  expect((screen.getByRole("textbox",{name:"Título da ação"}) as HTMLTextAreaElement).value).toBe("Latest title");
});

it("switching from an existing action to a new draft resets title and files", async () => {
  const mounted = mount(draft({work_files:["https://files.test.invalid/old.png"]}));
  mounted.select(draft({id:undefined,title:"Fresh draft",work_files:[],content_files:[],created_at:undefined,updated_at:undefined}), 1);
  expect((screen.getByRole("textbox",{name:"Título da ação"}) as HTMLTextAreaElement).value).toBe("Fresh draft");
  fireEvent.click(screen.getByRole("button",{name:"Criar"}));
  await waitFor(()=>expect(writes.length).toBe(1));
  expect(writes[0]?.work_files).toEqual([]);
  expect(writes[0]?.content_files).toEqual([]);
});

it("drawer compares a conflict in an app dialog; cancel preserves edits and confirm saves", async () => {
  mount(); conflict=true;
  fireEvent.change(screen.getByRole("textbox",{name:"Título da ação"}),{target:{value:"My pending title"}});
  fireEvent.click(screen.getByRole("button",{name:"Atualizar"}));
  await screen.findByTestId("drawer-conflict-banner");
  conflict=false;
  fireEvent.click(screen.getByRole("button",{name:"Comparar e salvar"}));
  const dialog=await screen.findByRole("dialog",{name:"Comparar alterações"});
  expect(within(dialog).getByText("Versão atual")).toBeTruthy();
  expect(within(dialog).getByText("Sua edição")).toBeTruthy();
  expect(within(dialog).getByText("My pending title")).toBeTruthy();
  const count=writes.length;
  fireEvent.click(screen.getByRole("button",{name:"Cancelar"}));
  await waitFor(()=>expect(screen.queryByRole("dialog",{name:"Comparar alterações"})).toBeNull());
  expect(writes.length).toBe(count);
  expect((screen.getByRole("textbox",{name:"Título da ação"}) as HTMLTextAreaElement).value).toBe("My pending title");
  fireEvent.click(screen.getByRole("button",{name:"Comparar e salvar"}));
  await screen.findByRole("dialog",{name:"Comparar alterações"});
  conflict=true;
  fireEvent.click(screen.getByRole("button",{name:"Salvar minhas alterações"}));
  await waitFor(()=>expect(screen.queryByRole("dialog",{name:"Comparar alterações"})).toBeNull());
  expect(screen.getByTestId("drawer-conflict-banner")).toBeTruthy();
  expect((screen.getByRole("textbox",{name:"Título da ação"}) as HTMLTextAreaElement).value).toBe("My pending title");
  conflict=false;
  const retryCount=writes.length;
  fireEvent.click(screen.getByRole("button",{name:"Comparar e salvar"}));
  await screen.findByRole("dialog",{name:"Comparar alterações"});
  fireEvent.click(screen.getByRole("button",{name:"Salvar minhas alterações"}));
  await waitFor(()=>expect(writes.length).toBe(retryCount+1));
  expect(writes[retryCount]?.title).toBe("My pending title");
  await waitFor(()=>expect(screen.queryByTestId("drawer-conflict-banner")).toBeNull());
});
