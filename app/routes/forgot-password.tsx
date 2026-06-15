import { CircleAlertIcon, ArrowLeftIcon, MailCheckIcon } from "lucide-react";
import {
  Link,
  data,
  useActionData,
  type ActionFunctionArgs,
  type MetaFunction,
} from "react-router";
import { UzzinaLogo } from "~/components/logo";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createSupabaseClient } from "~/lib/supabase";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;

  if (!email?.trim()) {
    return data({ error: "Por favor, digite um e-mail válido.", success: false });
  }

  const { supabase, headers } = await createSupabaseClient(request);
  const redirectTo = `${new URL(request.url).origin}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo,
  });

  if (error) {
    return data(
      { error: error.message || "Erro ao solicitar recuperação de senha.", success: false },
      { headers }
    );
  }

  return data({ error: null, success: true }, { headers });
};

export const meta: MetaFunction = () => {
  return [{ title: "Recuperar Senha - UZZINA" }];
};

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="grid h-screen grid-cols-[2rem_20rem_2rem] justify-center overflow-x-hidden md:grid-cols-[2rem_30rem_2rem]">
      <div className="border-r"></div>

      <div className="border_after border_before relative my-auto p-8">
        <div className="mb-12 flex items-center justify-between">
          <UzzinaLogo className="h-12" />
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3" />
            Voltar ao login
          </Link>
        </div>

        {actionData?.error && (
          <Alert
            variant="destructive"
            className="mb-8 border-destructive/10 bg-destructive/5"
          >
            <CircleAlertIcon className="size-4" />
            <AlertTitle>Erro ao solicitar</AlertTitle>
            <AlertDescription>{actionData.error}</AlertDescription>
          </Alert>
        )}

        {actionData?.success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailCheckIcon className="size-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              E-mail enviado!
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Enviamos um link de redefinição de senha para o e-mail informado. Por favor, verifique sua caixa de entrada e spam.
            </p>
          </div>
        ) : (
          <form method="post" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Recuperar Senha</h2>
              <p className="text-xs text-muted-foreground mb-6">
                Digite seu e-mail cadastrado e enviaremos um link de redefinição.
              </p>
            </div>

            <div>
              <span className="mb-2 block w-full font-medium">E-mail</span>
              <Input
                type="email"
                name="email"
                required
                className="border border-border"
                placeholder="seu-email@dominio.com"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="w-full">
                Enviar E-mail de Recuperação
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="border-l"></div>
    </div>
  );
}
