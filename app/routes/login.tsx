import { CircleAlertIcon, EyeIcon, EyeOffIcon, LogInIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { UzzinaLogo } from "~/components/logo";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
    <div className="grid h-screen grid-cols-[2rem_20rem_2rem] justify-center overflow-x-hidden md:grid-cols-[2rem_30rem_2rem]">
      <div className="border-r"></div>

      <div className="border_after border_before relative my-auto p-8">
        <div className="mb-12">
          <UzzinaLogo className="h-12" />
        </div>
        {error && (
          <Alert
            className="mb-8 border-destructive/10 bg-destructive/5"
            variant={"destructive"}
          >
            <CircleAlertIcon />
            <AlertTitle>Erro ao fazer login</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <span className="mb-2 block w-full font-medium">E-mail</span>
            <Input
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              value={email}
              variant="inset"
            />
          </div>

          <div className="relative mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">Senha</span>
              <Link
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                to="/forgot-password"
              >
                Esqueceu sua senha?
              </Link>
            </div>
            <Input
              className="pr-12"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
              type={showPassword ? "text" : "password"}
              value={password}
              variant="inset"
            />
            <Button
              className="absolute top-8 right-0"
              onClick={(event) => {
                event.preventDefault();
                setShowPassword(!showPassword);
              }}
              size={"icon"}
              type="button"
              variant={"ghost"}
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </Button>
          </div>

          <div className="flex justify-end">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Entrando..." : "Fazer Login"}{" "}
              <LogInIcon className="ml-2 size-3" />
            </Button>
          </div>
        </form>
      </div>

      <div className="border-l"></div>
    </div>
  );
}
