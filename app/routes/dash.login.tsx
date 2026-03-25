import { LogInIcon } from "lucide-react";
import {
  redirect,
  useActionData,
  type ActionFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createSupabaseClient } from "~/lib/supabase";
import { authenticateClient } from "~/models/clients.server";
import { commitSession, dashSessionStorage } from "~/services/client-auth.server";

export const meta: MetaFunction = () => [
  { title: "Acesso ao Portal" },
  {
    name: "description",
    content: "Portal de parceiros — acesso via senha.",
  },
];

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const { supabase } = createSupabaseClient(request);

  const client = await authenticateClient(supabase, email, password);

  if (!client) {
    return { error: "E-mail ou senha incorretos." };
  }

  // Cria a sessão com o ID do cliente
  const session = await dashSessionStorage.getSession();
  session.set("clientId", client.id);

  return redirect("/dash", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function DashLogin() {
  const data = useActionData<typeof action>();

  return (
    <div className="bg-background grid h-screen w-full place-content-center">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Título */}
        <div className="text-center">
          <h1 className="p-0 text-2xl font-bold tracking-tight">
            Portal do Parceiro
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Informe seu e-mail e senha para acessar.
          </p>
        </div>

        <form method="post" className="space-y-4">
          {data?.error && (
            <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
              {data.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="*******"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="squircle w-full rounded-2xl">
            <LogInIcon className="size-4" />
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
