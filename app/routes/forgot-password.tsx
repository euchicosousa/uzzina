import {
  ArrowLeftIcon,
  AlertTriangleIcon,
  MailOpenIcon,
  AtSignIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { TextField, Label } from "react-aria-components";
import { UZZINALogo } from "~/components/logo";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  PrismButton,
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupInput,
  PrismAlert,
  PrismAlertTitle,
  PrismAlertDescription,
} from "~/components/prism";
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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo,
        },
      );
      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erro ao solicitar recuperação de senha.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="grid h-screen grid-cols-[2rem_20rem_2rem] justify-center overflow-x-hidden md:grid-cols-[2rem_30rem_2rem]">
      <div className="border-r"></div>

      <div className="border_after border_before relative my-auto flex flex-col gap-12 p-8">
        <div className="flex items-center justify-between">
          <UZZINALogo className="h-12" />
          <Link
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
            to="/login"
          >
            <ArrowLeftIcon className="size-3" />
            Voltar ao login
          </Link>
        </div>

        {error && (
          <PrismAlert variant="error">
            <AlertTriangleIcon />
            <PrismAlertTitle>Erro ao solicitar</PrismAlertTitle>
            <PrismAlertDescription>{error}</PrismAlertDescription>
          </PrismAlert>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-pop">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-success-background border border-success/20 text-success">
              <MailOpenIcon className="size-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              E-mail enviado!
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Enviamos um link de redefinição de senha para o e-mail informado.
              Por favor, verifique sua caixa de entrada e spam.
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <h3>Recuperar Senha</h3>
              <p className="text-muted-foreground">
                Digite seu e-mail cadastrado e enviaremos um link de
                redefinição.
              </p>
            </div>

            <div className="space-y-4">
              <TextField
                isRequired
                name="email"
                onChange={setEmail}
                value={email}
              >
                <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                  E-mail
                </Label>
                <PrismInputGroup>
                  <PrismInputGroupAddon
                    align="inline-start"
                    className="[&_svg]:text-foreground/40 pl-4 pr-1"
                  >
                    <AtSignIcon className="size-5" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput
                    className="px-3 h-full"
                    placeholder="seu-email@dominio.com"
                    type="email"
                  />
                </PrismInputGroup>
              </TextField>
            </div>

            <div className="flex justify-end pt-2">
              <PrismButton
                className="w-full"
                isDisabled={isSubmitting}
                type="submit"
                variant="default"
              >
                {isSubmitting ? "Enviando..." : "Enviar E-mail de Recuperação"}
              </PrismButton>
            </div>
          </form>
        )}
      </div>

      <div className="border-l"></div>
    </div>
  );
}
