import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "types/database";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  // 1. Inicializa o cliente do Supabase com o token do usuário para checar a identidade
  const userClient = createClient<Database>(supabaseUrl, process.env.SUPABASE_PUBLISHABLE_KEY || "", {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }

  // 2. Verifica se o usuário que está fazendo a requisição é admin na tabela "people"
  const { data: caller, error: callerError } = await userClient
    .from("people")
    .select("admin")
    .eq("user_id", user.id)
    .single();

  if (callerError || !caller?.admin) {
    return res.status(403).json({ error: "Acesso negado. Apenas administradores podem criar usuários." });
  }

  // 3. Cria o usuário com o cliente admin
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
  }

  const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

  const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
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
