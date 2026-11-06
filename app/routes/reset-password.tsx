import {
  AlertTriangleIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  LockIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { TextField } from "react-aria-components";
import { toast } from "sonner";
import { UZZINALogo } from "~/components/logo";
import { ULoader } from "~/components/uzzina/ULoader";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  PrismAlert,
  PrismAlertDescription,
  PrismAlertTitle,
  PrismButton,
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupButton,
  PrismInputGroupInput,
  PrismLabel,
} from "~/components/prism";
export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});
function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const supabaseRef = useRef<ReturnType<
    typeof createSupabaseBrowserClient
  > | null>(null);
  useEffect(() => {
    const client = createSupabaseBrowserClient();
    supabaseRef.current = client;

    // Dá um tempo pequeno para o Supabase client ler o token do hash da URL ou query
    const checkSession = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );

        // Verifica se o Supabase redirecionou de volta com erro
        const errorDesc =
          urlParams.get("error_description") ||
          hashParams.get("error_description");
        if (errorDesc) {
          const formattedError = decodeURIComponent(errorDesc).replace(
            /\+/g,
            " ",
          );
          setError(formattedError);
          setCheckingSession(false);
          return;
        }

        // Fluxo 1: Verificação direta via token_hash (Evita problemas com Scanners de E-mail)
        const tokenHash =
          urlParams.get("token_hash") || hashParams.get("token_hash");
        if (tokenHash) {
          const { error: verifyError } = await client.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (verifyError) {
            console.error("Erro ao verificar token_hash:", verifyError);
            throw verifyError;
          }
        } else {
          // Fluxo 2: Troca tradicional de código (PKCE)
          const code = urlParams.get("code");
          if (code) {
            const { error: exchangeError } =
              await client.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              console.error("Erro na troca do código:", exchangeError);
              throw exchangeError;
            }
          }
        }
        const { data } = await client.auth.getSession();
        if (!data.session) {
          // Se após ler os hashes/code não houver uma sessão ativa, o link pode ser inválido
          setError(
            "Link de recuperação inválido ou expirado. Por favor, solicite um novo.",
          );
        }
      } catch (err) {
        console.error("Erro ao validar sessão:", err);
        setError(
          "Link de recuperação inválido ou expirado. Por favor, solicite um novo.",
        );
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabaseRef.current) return;
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
      const { error: updateError } = await supabaseRef.current.auth.updateUser({
        password: password,
      });
      if (updateError) {
        throw updateError;
      }
      toast.success("Senha atualizada com sucesso!");
      // Após atualizar a senha com sucesso, redireciona o usuário logado para a dashboard
      navigate({
        to: "/app",
        replace: true,
      });
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
    <div className="grid h-screen grid-cols-[1rem_minmax(0,28rem)_1rem] justify-center overflow-x-hidden sm:grid-cols-[2rem_minmax(0,28rem)_2rem]">
      <div className="border-r"></div>

      <div className="border_after border_before relative my-auto flex flex-col gap-12 p-8">
        <div>
          <UZZINALogo className="h-12" />
        </div>

        {error && (
          <PrismAlert variant="error">
            <AlertTriangleIcon />
            <PrismAlertTitle>Erro ao redefinir</PrismAlertTitle>
            <PrismAlertDescription>{error}</PrismAlertDescription>
          </PrismAlert>
        )}

        {checkingSession ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <ULoader size="xl" className="text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Validando link de recuperação...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6 space-y-4">
              <h3>Criar Nova Senha</h3>
              <p className="text-muted-foreground">
                Insira sua nova senha de acesso segura para a sua conta.
              </p>
            </div>

            <div>
              <TextField
                className="mb-6"
                isRequired
                name="password"
                onChange={setPassword}
                value={password}
              >
                <PrismLabel className="mb-1.5 block cursor-pointer">
                  Nova Senha
                </PrismLabel>
                <PrismInputGroup>
                  <PrismInputGroupAddon
                    align="inline-start"
                    className="pr-1 pl-4 [&_svg]:text-foreground/40"
                  >
                    <LockIcon className="size-5" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput
                    className="h-full px-3"
                    placeholder="Mínimo 6 caracteres"
                    type={showPassword ? "text" : "password"}
                  />
                  <PrismInputGroupAddon
                    align="inline-end"
                    className="pr-2 pl-1"
                  >
                    <PrismInputGroupButton
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeIcon className="size-4" />
                      ) : (
                        <EyeOffIcon className="size-4" />
                      )}
                    </PrismInputGroupButton>
                  </PrismInputGroupAddon>
                </PrismInputGroup>
              </TextField>

              <TextField
                className="mb-6"
                isRequired
                name="confirmPassword"
                onChange={setConfirmPassword}
                value={confirmPassword}
              >
                <PrismLabel className="mb-1.5 block cursor-pointer">
                  Confirmar Nova Senha
                </PrismLabel>
                <PrismInputGroup>
                  <PrismInputGroupAddon
                    align="inline-start"
                    className="pr-1 pl-4 [&_svg]:text-foreground/40"
                  >
                    <LockIcon className="size-5" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput
                    className="h-full px-3"
                    placeholder="Repita a nova senha"
                    type="password"
                  />
                </PrismInputGroup>
              </TextField>
            </div>

            <div className="mt-6 flex justify-end">
              <PrismButton
                isDisabled={loading || !!error}
                type="submit"
                variant="default"
              >
                {!loading && <KeyIcon className="size-3.5" />}
                {loading ? "Salvando..." : "Redefinir Senha e Entrar"}
              </PrismButton>
            </div>
          </form>
        )}
      </div>

      <div className="border-l"></div>
    </div>
  );
}
