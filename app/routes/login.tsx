import {
  AlertTriangleIcon,
  EyeIcon,
  EyeOffIcon,
  LogInIcon,
  LockIcon,
  AtSignIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
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
            <AlertTriangleIcon />
            <PrismAlertTitle>Erro ao fazer login</PrismAlertTitle>
            <PrismAlertDescription>{error}</PrismAlertDescription>
          </PrismAlert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            className="mb-6"
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
            <div className="flex items-center justify-between w-full mb-1.5">
              <Label className="block font-medium text-foreground cursor-pointer">
                Senha
              </Label>
              <Link
                className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                to="/forgot-password"
              >
                Esqueceu sua senha?
              </Link>
            </div>
            <PrismInputGroup className="squircle">
              <PrismInputGroupAddon
                align="inline-start"
                className="[&_svg]:text-foreground/40 pl-4 pr-1"
              >
                <LockIcon className="size-5" />
              </PrismInputGroupAddon>
              <PrismInputGroupInput
                className="px-3 h-full"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
              />
              <PrismInputGroupAddon align="inline-end" className="pr-2 pl-1">
                <PrismButton
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

          <div className="flex justify-end mt-6">
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

        <div className="border-l"></div>
      </div>
    </div>
  );
}
