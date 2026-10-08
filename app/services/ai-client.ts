import {aiInputSchema, aiResultSchema, type AIPayload as ValidAIPayload, type AIResult} from "~/lib/ai-contract";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";

export type AIPayload = Omit<ValidAIPayload,"intent"> & {intent:string};
export type {AIResult};
const messages: Record<number,string> = {
  400:"A solicitação de IA contém campos inválidos ou grandes demais. Revise o título, as descrições e a estratégia.",
  401:"Sua sessão expirou. Entre novamente para usar a IA.",
  403:"Seu acesso à IA está desativado. Fale com o administrador.",
  413:"A solicitação de IA excede 64 KB. Reduza as descrições e o contexto do parceiro.",
  429:"Seu limite diário de IA foi atingido. Aguarde a renovação às 00h UTC.",
  502:"A IA não retornou uma resposta válida. Tente novamente; seu texto foi mantido.",
  503:"O serviço de IA está temporariamente indisponível. Tente novamente mais tarde; seu texto foi mantido.",
};
export class AIRequestError extends Error {
  constructor(public readonly status:number, public readonly retryAfter?:number, code?:string) {
    const serviceMessages: Record<string,string> = {
      AI_CONFIGURATION_MISSING: "A IA não está configurada neste ambiente. Peça ao administrador para conferir a configuração; seu texto foi mantido.",
      AI_QUOTA_UNAVAILABLE: "Não foi possível verificar o limite de uso da IA. Peça ao administrador para conferir o serviço; seu texto foi mantido.",
    };
    super((status === 503 && code ? serviceMessages[code] : undefined) || messages[status] || "Não foi possível gerar conteúdo com IA. Seu texto foi mantido.");
    this.name="AIRequestError";
  }
}
export async function callAI(payload: AIPayload): Promise<AIResult> {
  const parsed=aiInputSchema.safeParse(payload);
  if (!parsed.success) throw new AIRequestError(400);
  const body=JSON.stringify(parsed.data);
  if (new TextEncoder().encode(body).byteLength>65536) throw new AIRequestError(413);
  const supabase = createSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new AIRequestError(401);
  let response: Response;
  try {
    response=await fetch("/api/ai", {
      method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body,
    });
  } catch {
    throw new Error("Não foi possível conectar à IA. Verifique sua conexão e tente novamente; seu texto foi mantido.");
  }
  if (!response.ok) {
    const retryAfter=Number(response.headers.get("Retry-After"));
    const failure:unknown=await response.json().catch(()=>null);
    const code=failure && typeof failure==="object" && "code" in failure && typeof failure.code==="string" ? failure.code : undefined;
    throw new AIRequestError(response.status,Number.isFinite(retryAfter)&&retryAfter>0?retryAfter:undefined,code);
  }
  const result=aiResultSchema.safeParse(await response.json().catch(()=>null));
  if (!result.success || result.data.intent!==parsed.data.intent) throw new AIRequestError(502);
  return result.data;
}
