import {
  AlertTriangleIcon,
  EyeIcon,
  EyeOffIcon,
  LogInIcon,
  LockIcon,
  AtSignIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { TextField, Label } from "react-aria-components";
import { UZZINALogo } from "~/components/logo";
import {
  PrismButton,
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupInput,
  PrismAlert,
  PrismAlertTitle,
  PrismAlertDescription,
} from "~/components/prism";
import { authenticateClient } from "~/models/clients";
import { PortalHttpError } from "~/services/portal-http";
export const Route = createFileRoute("/dash/login")({
  component: DashLogin,
});
function DashLogin() {
  const navigate = useNavigate();
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
      const authResult = await authenticateClient(email, password);
      if (!authResult) {
        setError("E-mail ou senha incorretos ou conta inativa.");
        setIsSubmitting(false);
        return;
      }

      // A sessão segura é gerenciada exclusivamente pelo cookie HttpOnly do servidor
      localStorage.removeItem("uzzina_dash_token");
      navigate({
        to: "/dash",
      });
    } catch (err) {
      console.error("Erro na autenticação do cliente:", err);
      setError(
        err instanceof PortalHttpError && err.status === 503
          ? "O portal está temporariamente indisponível. Tente novamente."
          : "Não foi possível entrar no portal. Tente novamente.",
      );
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
            <AlertTriangleIcon />
            <PrismAlertTitle>Erro ao fazer login</PrismAlertTitle>
            <PrismAlertDescription>{error}</PrismAlertDescription>
          </PrismAlert>
        )}

        <form aria-label="Acesso à UZZINA" onSubmit={handleSubmit}>
          <TextField
            className="mb-6"
            isRequired
            name="email"
            onChange={setEmail}
            value={email}
          >
            <Label className="mb-1.5 block cursor-pointer font-medium text-foreground">
              E-mail
            </Label>
            <PrismInputGroup>
              <PrismInputGroupAddon
                align="inline-start"
                className="pr-1 pl-4 [&_svg]:text-foreground/40"
              >
                <AtSignIcon className="size-5" />
              </PrismInputGroupAddon>
              <PrismInputGroupInput
                className="h-full px-3"
                autoComplete="email"
                autoFocus
                placeholder="name@example.com"
                type="email"
              />
            </PrismInputGroup>
          </TextField>

          <TextField
            className="mb-6"
            isRequired
            name="password"
            onChange={setPassword}
            value={password}
          >
            <div className="mb-1.5 flex w-full items-center justify-between">
              <Label className="block cursor-pointer font-medium text-foreground">
                Senha
              </Label>
            </div>
            <PrismInputGroup className="squircle">
              <PrismInputGroupAddon
                align="inline-start"
                className="pr-1 pl-4 [&_svg]:text-foreground/40"
              >
                <LockIcon className="size-5" />
              </PrismInputGroupAddon>
              <PrismInputGroupInput
                className="h-full px-3"
                autoComplete="current-password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
              />
              <PrismInputGroupAddon align="inline-end" className="pr-2 pl-1">
                <PrismButton
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onPress={() => setShowPassword(!showPassword)}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  {showPassword ? (
                    <EyeIcon className="size-4" />
                  ) : (
                    <EyeOffIcon className="size-4" />
                  )}
                </PrismButton>
              </PrismInputGroupAddon>
            </PrismInputGroup>
          </TextField>

          <div className="mt-6 flex justify-end">
            <PrismButton
              isDisabled={isSubmitting}
              type="submit"
              variant="default"
            >
              {isSubmitting ? "Entrando..." : "Fazer Login"}
              <LogInIcon />
            </PrismButton>
          </div>
        </form>
      </div>

      <div className="border-l"></div>
    </div>
  );
}
