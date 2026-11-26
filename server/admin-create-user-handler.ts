import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { extractBearerToken } from "./auth.js";
import { createServiceClient, getServiceConfig } from "./supabase-admin.js";

const createUserSchema = z
  .object({
    email: z.email().trim().toLowerCase().max(320),
    password: z.string().min(1).max(4096),
    name: z.string().trim().min(1).max(200),
  })
  .strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const serviceConfig = getServiceConfig();
  if (!serviceConfig) {
    return res
      .status(503)
      .json({ error: "Configuração do servidor de autenticação incompleta." });
  }

  const supabaseAdmin = createServiceClient(serviceConfig);
  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }

  const { data: caller, error: callerError } = await supabaseAdmin
    .from("people")
    .select("admin, visible")
    .eq("user_id", userData.user.id)
    .single();

  if (callerError || !caller) {
    return res.status(403).json({
      error: "Usuário não encontrado na equipe.",
    });
  }

  if (!caller.visible || !caller.admin) {
    return res.status(403).json({
      error:
        "Acesso negado. Apenas administradores ativos podem criar usuários.",
    });
  }

  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Nome, e-mail e senha são obrigatórios e válidos." });
  }

  const { email, password, name } = parsed.data;
  const { data: authUser, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

  if (createError) {
    return res.status(400).json({ error: createError.message });
  }

  return res.status(200).json({ user: authUser.user });
}
