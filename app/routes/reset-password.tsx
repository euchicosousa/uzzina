import {
  IconAlertTriangle,
  IconEye,
  IconEyeOff,
  IconKey,
  IconLock,
} from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { TextField, Label } from "react-aria-components";
import { toast } from "sonner";
import { UZZINALogo } from "~/components/logo";
import {
  PrismAlert,
  PrismAlertTitle,
  PrismAlertDescription,
} from "~/components/old-prism";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  PrismButton,
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupInput,
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
        console.log("URL completa:", window.location.href);
        console.log("Search (query):", window.location.search);
        console.log("Hash:", window.location.hash);
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
            const { error: exchangeError } =
              await client.auth.exchangeCodeForSession(code);
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
    <div className="grid h-screen grid-cols-[2rem_20rem_2rem] justify-center overflow-x-hidden md:grid-cols-[2rem_30rem_2rem]">
      <div className="border-r"></div>

      <div className="border_after border_before relative my-auto flex flex-col gap-12 p-8">
        <div>
          <UZZINALogo className="h-12" />
        </div>

        {error && (
          <PrismAlert variant="error">
            <IconAlertTriangle />
            <PrismAlertTitle>Erro ao redefinir</PrismAlertTitle>
            <PrismAlertDescription>{error}</PrismAlertDescription>
          </PrismAlert>
        )}

        {checkingSession ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">
              Validando link de recuperação...
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <h3>Criar Nova Senha</h3>
              <p className="text-muted-foreground">
                Insira sua nova senha de acesso segura para a sua conta.
              </p>
            </div>

            <div className="space-y-6">
              <TextField
                isRequired
                name="password"
                onChange={setPassword}
                value={password}
              >
                <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                  Nova Senha
                </Label>
                <PrismInputGroup>
                  <PrismInputGroupAddon
                    align="inline-start"
                    className="[&_svg]:text-foreground/40 pl-4 pr-1"
                  >
                    <IconLock className="size-5" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput
                    className="px-3 h-full"
                    placeholder="Mínimo 6 caracteres"
                    type={showPassword ? "text" : "password"}
                  />
                  <PrismInputGroupAddon
                    align="inline-end"
                    className="pr-2 pl-1"
                  >
                    <PrismButton
                      onPress={() => setShowPassword(!showPassword)}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      {showPassword ? (
                        <IconEye className="size-4" />
                      ) : (
                        <IconEyeOff className="size-4" />
                      )}
                    </PrismButton>
                  </PrismInputGroupAddon>
                </PrismInputGroup>
              </TextField>

              <TextField
                isRequired
                name="confirmPassword"
                onChange={setConfirmPassword}
                value={confirmPassword}
              >
                <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                  Confirmar Nova Senha
                </Label>
                <PrismInputGroup>
                  <PrismInputGroupAddon
                    align="inline-start"
                    className="[&_svg]:text-foreground/40 pl-4 pr-1"
                  >
                    <IconLock className="size-5" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput
                    className="px-3 h-full"
                    placeholder="Repita a nova senha"
                    type="password"
                  />
                </PrismInputGroup>
              </TextField>
            </div>

            <div className="flex justify-end pt-2">
              <PrismButton
                className="w-full"
                isDisabled={loading || !!error}
                type="submit"
                variant="default"
              >
                {loading ? "Salvando..." : "Redefinir Senha e Entrar"}
                {!loading && <IconKey className="ml-2 size-3.5" />}
              </PrismButton>
            </div>
          </form>
        )}
      </div>

      <div className="border-l"></div>
    </div>
  );
}
