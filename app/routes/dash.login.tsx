import { LogInIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, type MetaFunction } from "react-router";
import { UzzinaLogo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authenticateClient } from "~/models/clients";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";

export const meta: MetaFunction = () => [
  { title: "Acesso ao Portal" },
  {
    name: "description",
    content: "Portal de parceiros — acesso via senha.",
  },
];

export default function DashLogin() {
  const navigate = useNavigate();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      navigate("/dash");
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
          <UzzinaLogo className="h-12" />
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <Input
              variant="inset"
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              variant="inset"
              id="password"
              name="password"
              type="password"
              placeholder="*******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="squircle w-full rounded-2xl">
            <LogInIcon className="size-4" />
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>

      <div className="border-l"></div>
    </div>
  );
}
