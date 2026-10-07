import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { extractCookie, hashSessionToken, SESSION_COOKIE_NAME, validateRequestOrigin } from "../server/dash-session";

async function handleRequest(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "POST", "PATCH", "DELETE"].includes(req.method || "")) {
    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({error:"Método não permitido."});
  }
  if (req.method !== "GET" && !validateRequestOrigin(
    typeof req.headers.origin === "string" ? req.headers.origin : undefined,
    process.env.APP_ORIGIN, process.env.NODE_ENV === "production",
  )) return res.status(403).json({error:"Origem não autorizada."});

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(503).json({error:"Portal temporariamente indisponível."});
  const db = createClient<Database>(url,key);
  const token = extractCookie(req.headers.cookie,SESSION_COOKIE_NAME);
  if (!token) return res.status(401).json({error:"Sessão inválida ou expirada."});
  const {data:session,error:sessionError} = await db.from("dash_sessions")
    .select("client_id").eq("token_hash",hashSessionToken(token))
    .is("revoked_at",null).gt("expires_at",new Date().toISOString()).single();
  if (sessionError && sessionError.code !== "PGRST116") throw sessionError;
  if (!session) return res.status(401).json({error:"Sessão inválida ou expirada."});
  const {data:client,error:clientError} = await db.from("clients")
    .select("id, name, image, partners").eq("id",session.client_id).eq("active",true).single();
  if (clientError && clientError.code !== "PGRST116") throw clientError;
  if (!client) return res.status(401).json({error:"Sessão inválida ou expirada."});

  const partnerResult = client.partners.length ? await db.from("partners").select("slug")
    .in("slug",client.partners).eq("archived",false) : {data:[],error:null};
  if (partnerResult.error) throw partnerResult.error;
  const visiblePartnerSlugs = (partnerResult.data || []).map(partner => partner.slug);

  const body: unknown = req.body;
  const input = body && typeof body === "object" && !Array.isArray(body) ? body as Record<string,unknown> : {};
  const op = req.query.op;
  const actionId = req.method === "GET" ? req.query.actionId : input.actionId;
  if (typeof actionId !== "string" || !actionId || actionId.length > 128)
    return res.status(400).json({error:"Ação inválida."});
  const {data:action,error:actionError} = await db.from("actions").select("id, partners, updated_at")
    .eq("id",actionId).single();
  if (actionError && actionError.code !== "PGRST116") throw actionError;
  if (!action?.partners.some(partner => visiblePartnerSlugs.includes(partner)))
    return res.status(404).json({error:"Ação não encontrada."});

  type Comment = Omit<Database["public"]["Tables"]["action_comments"]["Row"], "mentions">;
  async function publicComments(rows: Comment[]) {
    const userIds = [...new Set(rows.filter(row => row.is_user).map(row => row.author_id))];
    const clientIds = [...new Set(rows.filter(row => !row.is_user).map(row => row.author_id))];
    const images = new Map<string,string | null>();
    if (userIds.length) {
      const {data,error} = await db.from("people").select("user_id, image").in("user_id",userIds);
      if (error) throw error;
      for (const author of data || []) images.set(`user:${author.user_id}`,author.image);
    }
    if (clientIds.length) {
      const {data,error} = await db.from("clients").select("id, image").in("id",clientIds);
      if (error) throw error;
      for (const author of data || []) images.set(`client:${author.id}`,author.image);
    }
    return rows.map(row => ({
      id:row.id, action_id:row.action_id, content:row.content,
      author_id:row.author_id, author_name:row.author_name,
      author_image:images.get(`${row.is_user ? "user" : "client"}:${row.author_id}`) || null,
      created_at:row.created_at, is_user:row.is_user, is_internal:false, mentions:[],
    }));
  }
  if (req.method === "GET" && op === "comments") {
    const rows: Comment[] = [];
    for (let offset=0; ; offset+=500) {
      const {data,error} = await db.from("action_comments")
        .select("id, action_id, author_id, author_name, content, created_at, is_user, is_internal")
        .eq("action_id",actionId).eq("is_internal",false)
        .order("created_at",{ascending:true}).order("id",{ascending:true}).range(offset,offset+499);
      if (error) throw error;
      rows.push(...data || []);
      if (!data || data.length < 500) break;
    }
    return res.status(200).json({comments:await publicComments(rows)});
  }
  const strictKeys = (keys: string[]) => Object.keys(input).every(key => keys.includes(key));
  const content = typeof input.content === "string" ? input.content.trim() : "";
  if (req.method === "POST" && op === "comment") {
    if (!strictKeys(["actionId","content"]) || !content || content.length > 10000)
      return res.status(400).json({error:"Observação inválida. Use de 1 a 10000 caracteres."});
    const {data,error} = await db.from("action_comments").insert({
      action_id:actionId,content,author_id:client.id,author_name:client.name || "Cliente",
      is_user:false,is_internal:false,mentions:[],
    }).select("id, action_id, author_id, author_name, content, created_at, is_user, is_internal").single();
    if (error && error.code !== "PGRST116") throw error;
    if (!data) return res.status(404).json({error:"Observação não encontrada."});
    return res.status(201).json({comment:{
      id:data.id,action_id:data.action_id,author_id:data.author_id,author_name:data.author_name,
      content:data.content,created_at:data.created_at,is_user:false,is_internal:false,
      mentions:[],author_image:client.image,
    }});
  }
  if ((req.method === "PATCH" || req.method === "DELETE") && op === "comment") {
    const commentId = input.commentId;
    const allowed = req.method === "PATCH" ? ["actionId","commentId","content"] : ["actionId","commentId"];
    if (!strictKeys(allowed) || typeof commentId !== "string" || !commentId || commentId.length > 128 ||
      (req.method === "PATCH" && (!content || content.length > 10000)))
      return res.status(400).json({error:"Observação inválida."});
    const ownComment = () => db.from("action_comments").select("id")
      .eq("id",commentId).eq("action_id",actionId).eq("is_internal",false)
      .eq("is_user",false).eq("author_id",client.id);
    const existing = await ownComment().single();
    if (existing.error && existing.error.code !== "PGRST116") throw existing.error;
    if (!existing.data) return res.status(404).json({error:"Observação não encontrada."});
    const mutation = req.method === "PATCH" ? db.from("action_comments").update({content}) : db.from("action_comments").delete();
    const {data,error} = await mutation.eq("id",commentId).eq("action_id",actionId)
      .eq("is_internal",false).eq("is_user",false).eq("author_id",client.id)
      .select("id, action_id, author_id, author_name, content, created_at, is_user, is_internal").single();
    if (error && error.code !== "PGRST116") throw error;
    if (!data) return res.status(404).json({error:"Observação não encontrada."});
    if (req.method === "DELETE") return res.status(200).json({deletedId:data.id});
    return res.status(200).json({comment:{
      id:data.id,action_id:data.action_id,author_id:data.author_id,author_name:data.author_name,
      content:data.content,created_at:data.created_at,is_user:false,is_internal:false,
      mentions:[],author_image:client.image,
    }});
  }
  if (req.method === "PATCH" && op === "work-files") {
    const files = input.work_files;
    const expectedUpdatedAt = input.expectedUpdatedAt;
    const validUrl = (value:unknown): value is string => {
      if (typeof value !== "string" || value.length > 2048 || value !== value.trim()) return false;
      try {const parsed = new URL(value);return parsed.protocol === "http:" || parsed.protocol === "https:";}
      catch {return false;}
    };
    if (!strictKeys(["actionId","work_files","expectedUpdatedAt"]) || !Array.isArray(files) || files.length > 100 || !files.every(validUrl) || typeof expectedUpdatedAt !== "string" || !expectedUpdatedAt)
      return res.status(400).json({error:"Anexos inválidos ou expectedUpdatedAt ausente."});
    if (action.updated_at !== expectedUpdatedAt) {
      return res.status(409).json({error:"Esta ação mudou. Recarregue antes de salvar."});
    }
    const {data,error} = await db.from("actions").update({work_files:files,updated_at:new Date().toISOString()})
      .eq("id",actionId).eq("updated_at",expectedUpdatedAt).overlaps("partners",visiblePartnerSlugs).select("id, work_files, updated_at").single();
    if (error && error.code === "PGRST116") return res.status(409).json({error:"Esta ação mudou. Recarregue antes de salvar."});
    if (error) throw error;
    if (!data) return res.status(409).json({error:"Esta ação mudou. Recarregue antes de salvar."});
    return res.status(200).json({actionId:data.id,work_files:data.work_files || [],count:data.work_files?.length || 0,updated_at:data.updated_at});
  }
  return res.status(400).json({error:"Operação não suportada."});
}
export default async function handler(req: VercelRequest,res: VercelResponse) {
  try { return await handleRequest(req,res); }
  catch {
    res.setHeader("Cache-Control","no-store");
    return res.status(503).json({error:"Não foi possível concluir a operação. Tente novamente."});
  }
}
