import {
  IconAlertTriangle,
  IconEye,
  IconEyeOff,
  IconLogin,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { UZZINALogo } from "~/components/logo";
import {
  PrismButton,
  PrismInput,
  PrismAlert,
  PrismAlertTitle,
  PrismAlertDescription,
} from "~/components/prism";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
export const Route = createFileRoute("/login")({
  component: Login,
});
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      navigate({
        to: "/app",
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Verifique o email ou a senha usada.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="grid h-screen grid-cols-[2rem_28rem_2rem] justify-center overflow-x-hidden">
      <div className="border-r"></div>

      <div className="border_after border_before relative my-auto flex flex-col gap-12 p-8">
        <div>
          <UZZINALogo className="h-12" />
        </div>
        {error && (
          <PrismAlert variant="error">
            <IconAlertTriangle />
            <PrismAlertTitle>Erro ao fazer login</PrismAlertTitle>
            <PrismAlertDescription>{error}</PrismAlertDescription>
          </PrismAlert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <PrismInput
              label="E-mail"
              name="email"
              onChange={setEmail}
              required
              type="email"
              value={email}
              variant="default"
            />
          </div>

          <div className="relative mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-sm">Senha</span>
              <Link
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                to="/forgot-password"
              >
                Esqueceu sua senha?
              </Link>
            </div>
            <div className="relative">
              <PrismInput
                inputClassName="pr-12"
                name="password"
                onChange={setPassword}
                required
                type={showPassword ? "text" : "password"}
                value={password}
                variant="default"
              />
              <PrismButton
                className="absolute top-0 right-0 h-9"
                onClick={(event) => {
                  event.preventDefault();
                  setShowPassword(!showPassword);
                }}
                size="icon"
                type="button"
                variant="ghost"
              >
                {showPassword ? (
                  <IconEye className="size-4" />
                ) : (
                  <IconEyeOff className="size-4" />
                )}
              </PrismButton>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <PrismButton
              disabled={isSubmitting}
              type="submit"
              variant="default"
            >
              {isSubmitting ? "Entrando..." : "Fazer Login"}
              <IconLogin className="ml-2 size-3" />
            </PrismButton>
          </div>
        </form>
      </div>

      <div className="border-l"></div>
    </div>
  );
}
