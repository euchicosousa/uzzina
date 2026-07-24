import { LogInIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { UZZINALogo } from "~/components/logo";
import { PrismButton } from "~/components/prism";
import { Input } from "~/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "~/components/ui/input-group";
import { authenticateClient } from "~/models/clients";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
export const Route = createFileRoute("/dash/login")({
  component: DashLogin,
});
function DashLogin() {
  const navigate = useNavigate();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const client = await authenticateClient(supabase, email, password);
      if (!client) {
        setError("E-mail ou senha incorretos.");
        setIsSubmitting(false);
        return;
      }

      // Salva a sessão localmente
      localStorage.setItem("uzzina_dash_client_id", client.id);
      navigate({
        to: "/dash",
      });
    } catch (err) {
      console.error("Erro na autenticação do cliente:", err);
      setError("Ocorreu um erro no servidor. Tente novamente.");
      setIsSubmitting(false);
    }
  };
  return (
    <div className="grid h-screen w-full grid-cols-[2rem_20rem_2rem] justify-center overflow-x-hidden md:grid-cols-[2rem_30rem_2rem]">
      <div className="border-r"></div>

      <div className="border_after border_before relative my-auto p-8">
        <div className="mb-12">
          <UZZINALogo className="h-12" />
        </div>
        {/* Logo / Título */}
        <div className="text-center">
          <h1 className="p-0 text-2xl font-bold tracking-tight">
            Portal do Parceiro
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Informe seu e-mail e senha para acessar.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              E-mail
            </label>
            <Input
              autoComplete="email"
              autoFocus
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              type="email"
              value={email}
              variant="inset"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Senha
            </label>
            <InputGroup>
              <InputGroupInput
                autoComplete="current-password"
                className="px-4"
                id="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="*******"
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword(!showPassword)}
                  size="icon-xs"
                  type="button"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <PrismButton
            className="squircle w-full rounded-2xl"
            isDisabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Entrando..." : "Entrar no Portal"}
            <LogInIcon className="size-4" />
          </PrismButton>
        </form>
      </div>

      <div className="border-l"></div>
    </div>
  );
}
