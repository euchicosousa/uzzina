import {afterEach, expect, it} from "bun:test";
import {cleanup, render, screen, within} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ConflictComparison, formatConflictValue} from "../app/components/features/action-drawer/conflict-comparison";
import {AppContext} from "../app/contexts/AppContext";
import type {Action, Person} from "../app/types";
import {QUERY_KEYS} from "../app/lib/query-keys";
afterEach(cleanup);

it("formats action dates consistently without shifting the execution hour",()=>{
 expect(formatConflictValue("date","2026-10-08T12:00:00")).toBe("08/10/2026 às 12h00");
 expect(formatConflictValue("date","2026-10-06 12:00:00")).toBe("06/10/2026 às 12h00");
});
it("resolves partner/person names, attachment names and selected strategies",()=>{
 const names={partners:[{slug:"smartmed",title:"SmartMed"}],people:[{user_id:"designer-id",name:"Ana",surname:"Silva"}]};
 expect(formatConflictValue("partners",["smartmed"],names)).toBe("SmartMed");
 expect(formatConflictValue("responsibles",["designer-id"],names)).toBe("Ana Silva");
 expect(formatConflictValue("sprints",["designer-id"],names)).toBe("Ana Silva");
 expect(formatConflictValue("work_files",["https://files.test/Arte%20final.png"])).toBe("Arte final.png");
 expect(formatConflictValue("strategies",[{headline:"Título",angulo:"Ângulo",racional:"Motivo",direcionamento:"Direção",selected:true}])).toContain("Selecionada: Título");
 expect(formatConflictValue("date","invalid")).toBe("Data inválida");
});
it("keeps multiple fields under each version and preserves long safe rich text",()=>{
 const person={user_id:"test-user",name:"Ana",surname:"Silva"} as Person;
 const longCaption="Último parágrafo preservado. ".repeat(200);
 const latest={title:"Título remoto",date:"2026-10-08T12:00:00",content_description:"<p>Conteúdo remoto</p>",instagram_caption:"Legenda remota"} as Action;
 const pending={title:"Meu título",date:"2026-10-06 12:00:00",content_description:`<p><strong>Conteúdo novo</strong></p><script>bad()</script><img src="javascript:bad()" onerror="bad()">`,instagram_caption:`${longCaption}<texto literal>`};
 const client=new QueryClient();client.setQueryData(QUERY_KEYS.people(person.user_id),[]);
 render(<QueryClientProvider client={client}><AppContext.Provider value={{person,partners:[],cloudName:"",uploadPreset:"",setBaseAction:()=>{},partnerFilters:[],setPartnerFilters:()=>{}}}><ConflictComparison latest={latest} pending={pending}/></AppContext.Provider></QueryClientProvider>);
 const current=screen.getByRole("region",{name:"Versão atual"});
 const mine=screen.getByRole("region",{name:"Sua edição"});
 expect(within(current).getByText("Título remoto")).toBeTruthy();
 expect(within(current).getByText("08/10/2026 às 12h00")).toBeTruthy();
 expect(within(mine).getByText("Meu título")).toBeTruthy();
 expect(within(mine).getByText("06/10/2026 às 12h00")).toBeTruthy();
 expect(mine.textContent).toContain(longCaption);
 expect(mine.querySelector("strong")?.textContent).toBe("Conteúdo novo");
 expect(mine.textContent).toContain("<texto literal>");
 expect(mine.querySelector("script")).toBeNull();
 expect(mine.querySelector("[onerror], [src^='javascript:']")).toBeNull();
});
it("uses domain labels instead of database codes",()=>{
 expect(formatConflictValue("phase","finished")).toBe("Concluído");
 expect(formatConflictValue("category","post")).toBe("Post Estático");
 expect(formatConflictValue("priority","high")).toBe("Alta");
 expect(formatConflictValue("archived",false)).toBe("Não");
 expect(formatConflictValue("time",30)).toBe("30 minutos");
});
