import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { UnplugIcon } from "lucide-react";
import { toast } from "sonner";
import {
  PrismButton,
  PrismButtonGroup,
  PrismDialog,
  PrismDialogBody,
  PrismDialogClose,
  PrismDialogDescription,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismDialogTrigger,
} from "~/components/prism";
import type { PartnerInstagramConnection as PartnerInstagramConnectionData } from "~/lib/partner-instagram-contract";
import {
  disconnectPartnerInstagram,
  finishPartnerInstagramConnection,
  getPartnerInstagramConnection,
  startPartnerInstagramConnection,
} from "~/models/partner-instagram";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "types/database";
import { ULoader } from "~/components/uzzina/ULoader";

interface PartnerInstagramConnectionProps {
  partnerId: string | null;
  partnerSlug: string;
  supabase: SupabaseClient<Database>;
  isArchived?: boolean;
  isLoading?: boolean;
  /** Rendered only while the partner has an active Instagram connection. */
  connectedContent?: ReactNode;
}

type CallbackQuery = {
  attemptId: string;
  state: string;
  status: "success" | "failed";
  connectedAccountId: string | null;
};

function readCallbackQuery(): CallbackQuery | null {
  const query = new URLSearchParams(window.location.search);
  const attemptId = query.get("instagram_attempt");
  const state = query.get("instagram_state");
  const status = query.get("status");
  const connectedAccountId = query.get("connected_account_id");
  if (!attemptId || !state || (status !== "success" && status !== "failed")) {
    return null;
  }
  return {
    attemptId,
    state,
    status,
    connectedAccountId,
  };
}

function clearCallbackQuery(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("instagram_attempt");
  url.searchParams.delete("instagram_state");
  url.searchParams.delete("status");
  url.searchParams.delete("connected_account_id");
  window.history.replaceState(window.history.state, "", url.toString());
}

function connectionStatusLabel(
  connection: PartnerInstagramConnectionData,
): string {
  if (connection.verification === "unavailable") {
    return "Não foi possível confirmar agora se a conexão continua ativa.";
  }
  if (connection.status === "active") return "Perfil conectado e verificado.";
  if (connection.status === "revoked") return "A conexão foi revogada.";
  if (connection.status === "superseded")
    return "Esta conexão foi substituída.";
  return "É necessário reconectar o perfil.";
}

function getWebsiteHref(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function getProfileInitial(connection: PartnerInstagramConnectionData): string {
  return (
    connection.profileName?.trim().charAt(0) ||
    connection.profileUsername.replace(/^@/, "").charAt(0) ||
    "@"
  ).toUpperCase();
}

export function PartnerInstagramConnection({
  partnerId,
  partnerSlug,
  supabase,
  isArchived = false,
  isLoading = false,
  connectedContent,
}: PartnerInstagramConnectionProps) {
  const queryClient = useQueryClient();
  const [callbackQuery, setCallbackQuery] = useState<CallbackQuery | null>(
    null,
  );
  const [callbackMessage, setCallbackMessage] = useState<string | null>(null);
  const [callbackPending, setCallbackPending] = useState(false);
  const connectionKey = useMemo(
    () => ["partner-instagram-connection", partnerId],
    [partnerId],
  );
  const connectionQuery = useQuery({
    queryKey: connectionKey,
    queryFn: () => getPartnerInstagramConnection(supabase, partnerSlug),
    enabled: Boolean(partnerId) && !isArchived,
    staleTime: 30_000,
  });
  const connection = connectionQuery.data ?? null;

  const connectMutation = useMutation({
    mutationFn: () => startPartnerInstagramConnection(supabase, partnerSlug),
    onSuccess: (link) => window.location.assign(link.redirectUrl),
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível conectar o Instagram.",
      ),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectPartnerInstagram(supabase, partnerSlug),
    onSuccess: async ({ method }) => {
      toast.success(
        method === "disabled"
          ? "Perfil desconectado. A conexão foi desativada no Composio."
          : "Perfil desconectado.",
      );
      await queryClient.invalidateQueries({ queryKey: connectionKey });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível desconectar o Instagram.",
      ),
  });

  useEffect(() => {
    const params = readCallbackQuery();
    if (params) setCallbackQuery(params);
  }, []);

  useEffect(() => {
    if (!callbackQuery || !partnerId) return;
    let cancelled = false;
    setCallbackPending(true);
    setCallbackMessage(null);

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token) {
        if (!cancelled) {
          setCallbackMessage(
            "Entre novamente com a conta que iniciou a conexão e tente confirmar o retorno.",
          );
          setCallbackPending(false);
        }
        return;
      }

      try {
        const result = await finishPartnerInstagramConnection(supabase, {
          partnerSlug,
          attemptId: callbackQuery.attemptId,
          state: callbackQuery.state,
          status: callbackQuery.status,
          connectedAccountId: callbackQuery.connectedAccountId,
        });
        if (cancelled) return;
        if (result.failed) {
          setCallbackMessage(
            "A autorização não foi concluída. A conexão anterior continua ativa.",
          );
          clearCallbackQuery();
          setCallbackQuery(null);
        } else {
          setCallbackMessage(null);
          clearCallbackQuery();
          setCallbackQuery(null);
        }
        await queryClient.invalidateQueries({ queryKey: connectionKey });
      } catch (error) {
        if (!cancelled) {
          setCallbackMessage(
            error instanceof Error
              ? error.message
              : "Não foi possível confirmar o retorno da conexão.",
          );
        }
      } finally {
        if (!cancelled) setCallbackPending(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    callbackQuery,
    connectionKey,
    partnerId,
    partnerSlug,
    queryClient,
    supabase,
  ]);

  if (isLoading && !partnerId) {
    return (
      <p className="text-base text-secondary-foreground">
        Carregando o parceiro…
      </p>
    );
  }
  if (!partnerId) {
    return (
      <p className="text-base text-secondary-foreground">
        Salve o parceiro primeiro para vincular uma conta do Instagram.
      </p>
    );
  }
  if (isArchived) {
    return (
      <p className="text-base text-secondary-foreground">
        Desarquive o parceiro para gerenciar a conexão do Instagram.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-1" aria-live="polite">
        {connectionQuery.isPending ? (
          <p className="text-base text-secondary-foreground">
            Verificando conexão do Instagram…
          </p>
        ) : connectionQuery.isError ? (
          <p className="text-base text-error" role="alert">
            Não foi possível verificar a conexão. Atualize a tela ou tente mais
            tarde.
          </p>
        ) : connection ? (
          <>
            {(connection.status !== "active" ||
              connection.verification === "unavailable") && (
              <p className="text-base text-secondary-foreground">
                {connectionStatusLabel(connection)}
              </p>
            )}
            <section
              aria-label="Prévia do perfil do Instagram"
              className="grid gap-5 rounded-2xl border border-border bg-card p-5 squircle sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start"
            >
              {connection.profilePictureUrl ? (
                <img
                  alt={`Foto de perfil de ${connection.profileUsername}`}
                  className="size-24 rounded-full object-cover sm:size-28"
                  src={connection.profilePictureUrl}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="grid size-24 place-items-center rounded-full bg-card text-3xl font-semibold text-secondary-foreground sm:size-28"
                >
                  {getProfileInitial(connection)}
                </div>
              )}
              <div className="grid min-w-0 gap-3">
                <div className="grid gap-1">
                  <p className="text-xl font-semibold break-all">
                    {connection.profileUsername}
                  </p>
                  {connection.profileName && (
                    <p className="text-base">{connection.profileName}</p>
                  )}
                </div>
                {connection.mediaCount !== null && (
                  <p className="text-base">
                    <strong className="font-semibold">
                      {connection.mediaCount.toLocaleString("pt-BR")}
                    </strong>{" "}
                    publicações
                  </p>
                )}
                {connection.biography && (
                  <p className="text-base whitespace-pre-line text-secondary-foreground">
                    {connection.biography}
                  </p>
                )}
                {connection.website && (
                  <a
                    className="w-fit text-base font-medium break-all text-primary underline underline-offset-4"
                    href={getWebsiteHref(connection.website)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {connection.website}
                  </a>
                )}
              </div>
            </section>
            <div className="flex flex-wrap justify-between gap-4 py-2">
              <PrismButtonGroup
                aria-label="Conexão do Instagram"
                className="w-fit"
                size="sm"
              >
                <PrismButton
                  isDisabled={
                    connectionQuery.isError ||
                    connectMutation.isPending ||
                    callbackPending
                  }
                  onPress={() => connectMutation.mutate()}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {connectMutation.isPending && <ULoader className="size-4" />}
                  Reconectar
                </PrismButton>
                {(connection.status === "active" ||
                  connection.status === "attention") && (
                  <PrismDialogTrigger>
                    <PrismButton
                      aria-label="Desconectar Instagram"
                      isDisabled={
                        disconnectMutation.isPending || callbackPending
                      }
                      size="icon-sm"
                      type="button"
                      variant="outline"
                    >
                      {disconnectMutation.isPending ? (
                        <ULoader className="size-4" />
                      ) : (
                        <UnplugIcon />
                      )}
                    </PrismButton>
                    <PrismDialog>
                      <PrismDialogHeader>
                        <PrismDialogTitle>
                          Desconectar o Instagram?
                        </PrismDialogTitle>
                        <PrismDialogDescription className="text-base">
                          O Composio tentará revogar o acesso de{" "}
                          {connection.profileUsername}. Se a revogação estiver
                          indisponível, a conexão será desativada no Composio.
                        </PrismDialogDescription>
                      </PrismDialogHeader>
                      <PrismDialogBody className="text-base">
                        A UZZINA mantém as conexões separadas por parceiro e só
                        altera a referência deste parceiro.
                      </PrismDialogBody>
                      <PrismDialogFooter>
                        <PrismDialogClose>Cancelar</PrismDialogClose>
                        <PrismDialogClose
                          isDisabled={disconnectMutation.isPending}
                          onPress={() => disconnectMutation.mutate()}
                          variant="error"
                        >
                          Desconectar
                        </PrismDialogClose>
                      </PrismDialogFooter>
                    </PrismDialog>
                  </PrismDialogTrigger>
                )}
              </PrismButtonGroup>
              {connection.status === "active" && connectedContent}
            </div>
          </>
        ) : (
          <p className="text-base text-secondary-foreground">
            Nenhum perfil conectado.
          </p>
        )}
        {callbackMessage && (
          <p className="text-base text-secondary-foreground" role="status">
            {callbackMessage}
          </p>
        )}
      </div>

      {callbackMessage && callbackQuery && !callbackPending && (
        <PrismButton
          className="w-fit"
          onPress={() =>
            setCallbackQuery((current) => (current ? { ...current } : null))
          }
          type="button"
          variant="outline"
        >
          Tentar confirmar novamente
        </PrismButton>
      )}

      {!connection && (
        <PrismButton
          className="w-fit"
          isDisabled={
            connectionQuery.isError ||
            connectMutation.isPending ||
            callbackPending
          }
          onPress={() => connectMutation.mutate()}
          type="button"
          variant="outline"
        >
          {connectMutation.isPending && <ULoader className="size-4" />}
          Conectar Instagram
        </PrismButton>
      )}
    </div>
  );
}
