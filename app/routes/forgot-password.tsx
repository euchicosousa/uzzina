import { CircleAlertIcon, ArrowLeftIcon, MailCheckIcon } from "lucide-react";
import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { UzzinaLogo } from "~/components/logo";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Por favor, digite um e-mail válido.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao solicitar recuperação de senha.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {error && (
          <Alert
            variant="destructive"
            className="mb-8 border-destructive/10 bg-destructive/5"
          >
            <CircleAlertIcon className="size-4" />
            <AlertTitle>Erro ao solicitar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Recuperar Senha</h2>
              <p className="text-xs text-muted-foreground mb-6">
                Digite seu e-mail cadastrado e enviaremos um link de redefinição.
              </p>
            </div>

            <div>
              <span className="mb-2 block w-full font-medium">E-mail</span>
              <Input
                variant="inset"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu-email@dominio.com"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar E-mail de Recuperação"}
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="border-l"></div>
    </div>
  );
}
