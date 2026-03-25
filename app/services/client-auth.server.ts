import { createCookieSessionStorage, redirect } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { getClientById } from "~/models/clients.server";

// Cria um storage de sessão específico para o Dash (independente do Supabase Auth principal)
export const dashSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "uzzina_dash_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET || "s3cr3t"],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  },
});

export const { getSession, commitSession, destroySession } = dashSessionStorage;

/**
 * Autentica um usuário do portal /dash usando o cookie customizado.
 * Verifica o cliente no banco para garantir que ainda existe e está ativo.
 */
export async function getClientSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const clientId = session.get("clientId");

  if (!clientId) throw redirect("/dash/login");

  const { supabase } = createSupabaseClient(request);

  try {
    const client = await getClientById(supabase, clientId);
    if (!client || !client.active) {
      throw redirect("/dash/login", {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
    }

    const { data: partnersData } = await supabase
      .from("partners")
      .select("id, slug, title, short, colors")
      .in("slug", client.partners || [])
      .order("title");

    return {
      supabase,
      ...client,
      partners: partnersData || [],
    };
  } catch (error) {
    if (error instanceof Response) throw error; // Resposta de redirect
    // Se der erro na busca do banco, desloga
    throw redirect("/dash/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }
}
