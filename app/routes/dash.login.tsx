import { CheckCircleIcon, MailIcon } from "lucide-react";
import {
  useActionData,
  type ActionFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createSupabaseClient } from "~/lib/supabase";

export const meta: MetaFunction = () => [
  { title: "Acesso ao Portal" },
  {
    name: "description",
    content: "Portal de clientes — acesso via magic link.",
  },
];

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;

  if (!email) return { sent: false, error: "Informe seu e-mail." };

  const { supabase, headers } = createSupabaseClient(request);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/dash/home`,
      shouldCreateUser: false, // Só permite logins de clientes já cadastrados
    },
  });

  if (error) {
    return {
      sent: false,
      error: "E-mail não encontrado. Fale com seu contato na agência.",
    };
  }

  return { sent: true, error: null };
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
            Informe seu e-mail para receber o link de acesso.
          </p>
        </div>

        {data?.sent ? (
          /* Estado de sucesso */
          <div className="bg-card space-y-3 rounded-2xl border p-6 text-center">
            <CheckCircleIcon className="mx-auto size-10 text-green-500" />
            <p className="font-medium">Verifique seu e-mail</p>
            <p className="text-muted-foreground text-sm">
              Enviamos um link de acesso. Clique nele para entrar no portal.
            </p>
          </div>
        ) : (
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

            <Button type="submit" className="squircle w-full rounded-2xl">
              <MailIcon className="size-4" />
              Enviar link de acesso
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
