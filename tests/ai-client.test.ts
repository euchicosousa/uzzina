import {afterEach,expect,it,mock} from "bun:test";
import {callAI} from "../app/services/ai-client";
let token:string|null="fake-token";
mock.module("~/lib/supabase.client",()=>({createSupabaseBrowserClient:()=>({auth:{getSession:async()=>({data:{session:token?{access_token:token}:null}})}})}));
const originalFetch=globalThis.fetch;
afterEach(()=>{globalThis.fetch=originalFetch;token="fake-token";});
it("does not accept a successful HTTP response with invalid generated content",async()=>{
 globalThis.fetch=mock(async()=>new Response(JSON.stringify({intent:"ai-caption",output:{caption:42}}),{status:200})) as unknown as typeof fetch;
 await expect(callAI({intent:"ai-caption",category:"post"})).rejects.toThrow("resposta válida");
});
it.each([401,403,429,502,503])("uses a safe specific message for HTTP %s",async(status)=>{
 globalThis.fetch=mock(async()=>new Response(JSON.stringify({error:"secret stack"}),{status,headers:{"Retry-After":"60"}})) as unknown as typeof fetch;
 try {await callAI({intent:"ai-caption",category:"post"});throw new Error("Expected rejection");} catch(error) {
  expect(error).toBeInstanceOf(Error);expect(String(error)).not.toContain("secret");
  const phrases:Record<number,string>={401:"sessão expirou",403:"acesso à IA está desativado",429:"limite diário",502:"resposta válida",503:"temporariamente indisponível"};
  expect(String(error)).toContain(phrases[status] || "unexpected");
 }
});
it("rejects no session and invalid input before network access",async()=>{
 const send=mock(async()=>new Response());globalThis.fetch=send as unknown as typeof fetch;
 token=null;await expect(callAI({intent:"ai-caption",category:"post"})).rejects.toThrow("sessão expirou");
 await expect(callAI({intent:"bad",category:"post"})).rejects.toThrow("campos inválidos");expect(send).not.toHaveBeenCalled();
});
it("preserves legitimate strategy fields and verifies the matching intent",async()=>{
 let sent:unknown;
 globalThis.fetch=mock(async(_input:unknown,init?:RequestInit)=>{sent=JSON.parse(String(init?.body));return new Response(JSON.stringify({intent:"ai-content",output:{content:"<p>Texto</p>"}}));}) as unknown as typeof fetch;
 const payload={intent:"ai-content",category:"post",headline:"Headline",racional:"Racional",direcionamento:"Direção"};
 expect((await callAI(payload)).output).toEqual({content:"<p>Texto</p>"});expect(sent).toMatchObject(payload);
 await expect(callAI({...payload,intent:"ai-caption"})).rejects.toThrow("resposta válida");
});
it("shows a connection error without replacing input",async()=>{
 globalThis.fetch=mock(async()=>{throw new Error("network failed");}) as unknown as typeof fetch;
 const payload={intent:"ai-caption",category:"post",description:"Original"};
 await expect(callAI(payload)).rejects.toThrow("Verifique sua conexão");expect(payload.description).toBe("Original");
});
it.each([
 ["AI_CONFIGURATION_MISSING","não está configurada"],
 ["AI_QUOTA_UNAVAILABLE","limite de uso"],
])("explains actionable service failures: %s",async(code,phrase)=>{
 globalThis.fetch=mock(async()=>new Response(JSON.stringify({code,error:"secret stack"}),{status:503})) as unknown as typeof fetch;
 await expect(callAI({intent:"ai-caption",category:"post"})).rejects.toThrow(phrase);
});
