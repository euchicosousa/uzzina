import { CircleAlertIcon, EyeIcon, EyeOffIcon, KeyRoundIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, type MetaFunction } from "react-router";
import { toast } from "sonner";
import { UzzinaLogo } from "~/components/logo";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";

export const meta: MetaFunction = () => {
  return [{ title: "Redefinir Senha - UZZINA" }];
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseBrowserClient> | null>(null);

  useEffect(() => {
    const client = createSupabaseBrowserClient();
    setSupabase(client);

    // Dá um tempo pequeno para o Supabase client ler o token do hash da URL ou query
    const checkSession = async () => {
      try {
        console.log("URL completa:", window.location.href);
        console.log("Search (query):", window.location.search);
        console.log("Hash:", window.location.hash);

        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Verifica se o Supabase redirecionou de volta com erro
        const errorDesc = urlParams.get("error_description") || hashParams.get("error_description");
        if (errorDesc) {
          const formattedError = decodeURIComponent(errorDesc).replace(/\+/g, " ");
          setError(formattedError);
          setCheckingSession(false);
          return;
        }

        // Fluxo 1: Verificação direta via token_hash (Evita problemas com Scanners de E-mail)
        const tokenHash = urlParams.get("token_hash") || hashParams.get("token_hash");
        if (tokenHash) {
          console.log("Verificando token_hash...");
          const { error: verifyError } = await client.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (verifyError) {
            console.error("Erro ao verificar token_hash:", verifyError);
            throw verifyError;
          }
          console.log("Token_hash verificado com sucesso!");
        } else {
          // Fluxo 2: Troca tradicional de código (PKCE)
          const code = urlParams.get("code");
          console.log("Code obtido:", code);

          if (code) {
            console.log("Trocando código por sessão...");
            const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              console.error("Erro na troca do código:", exchangeError);
              throw exchangeError;
            }
            console.log("Troca de código concluída com sucesso!");
          }
        }

        const { data } = await client.auth.getSession();
        console.log("Sessão obtida:", data.session);
        if (!data.session) {
          // Se após ler os hashes/code não houver uma sessão ativa, o link pode ser inválido
          setError("Link de recuperação inválido ou expirado. Por favor, solicite um novo.");
        }
      } catch (err) {
        console.error("Erro ao validar sessão:", err);
        setError("Link de recuperação inválido ou expirado. Por favor, solicite um novo.");
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setError(null);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      toast.success("Senha atualizada com sucesso!");
      // Após atualizar a senha com sucesso, redireciona o usuário logado para a dashboard
      navigate("/app", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao atualizar a senha.";
      setError(message);
      setLoading(false);
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
            variant="destructive"
            className="mb-8 border-destructive/10 bg-destructive/5"
          >
            <CircleAlertIcon className="size-4" />
            <AlertTitle>Erro ao redefinir</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {checkingSession ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">
              Validando link de recuperação...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Criar Nova Senha</h2>
              <p className="text-xs text-muted-foreground mb-6">
                Insira sua nova senha de acesso segura para a sua conta.
              </p>
            </div>

            <div className="relative">
              <span className="mb-2 block w-full font-medium">Nova Senha</span>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border border-border pr-12"
                placeholder="Mínimo 6 caracteres"
              />
              <Button
                size={"icon"}
                className="absolute top-8 right-0"
                variant={"ghost"}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </Button>
            </div>

            <div>
              <span className="mb-2 block w-full font-medium">Confirmar Nova Senha</span>
              <Input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border border-border"
                placeholder="Repita a nova senha"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading || !!error} className="w-full">
                {loading ? "Salvando..." : "Redefinir Senha e Entrar"}
                {!loading && <KeyRoundIcon className="ml-2 size-4" />}
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="border-l"></div>
    </div>
  );
}
