import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { LoaderCircleIcon, UnplugIcon } from "lucide-react";
import { toast } from "sonner";
import {
  PrismDateRangePicker,
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
import type {
  PartnerInstagramConnection as PartnerInstagramConnectionData,
  PartnerInstagramInsightsResult,
  PartnerInstagramMediaPage,
} from "~/lib/partner-instagram-contract";
import {
  disconnectPartnerInstagram,
  fetchPartnerInstagramInsights,
  fetchPartnerInstagramMedia,
  finishPartnerInstagramConnection,
  getPartnerInstagramConnection,
  startPartnerInstagramConnection,
} from "~/models/partner-instagram";
import type { DateRangeValue } from "~/components/prism";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "types/database";

interface PartnerInstagramConnectionProps {
  partnerId: string | null;
  partnerSlug: string;
  supabase: SupabaseClient<Database>;
  isArchived?: boolean;
  isLoading?: boolean;
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

function getDefaultSearchPeriod(): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return { start, end };
}

function getUnixRange(range: { start: Date; end: Date }) {
  const since = new Date(range.start);
  since.setHours(0, 0, 0, 0);
  const until = new Date(range.end);
  until.setHours(23, 59, 59, 999);
  return {
    since: Math.floor(since.getTime() / 1000),
    until: Math.floor(until.getTime() / 1000),
  };
}

function formatSearchPeriod(range: { start: Date; end: Date }): string {
  return `${format(range.start, "dd/MM/yyyy", { locale: ptBR })} – ${format(
    range.end,
    "dd/MM/yyyy",
    { locale: ptBR },
  )}`;
}

function formatInstagramDate(value: string | null): string {
  if (!value) return "Data não informada";
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
    : "Data não informada";
}

function mediaFormatLabel(media: PartnerInstagramMediaPage["media"][number]) {
  if (media.mediaProductType === "REELS") return "Reel";
  if (media.mediaType === "CAROUSEL_ALBUM") return "Carrossel";
  if (media.mediaType === "VIDEO") return "Vídeo";
  if (media.mediaType === "IMAGE") return "Imagem";
  return media.mediaType ?? "Publicação";
}

export function PartnerInstagramConnection({
  partnerId,
  partnerSlug,
  supabase,
  isArchived = false,
  isLoading = false,
}: PartnerInstagramConnectionProps) {
  const queryClient = useQueryClient();
  const [callbackQuery, setCallbackQuery] = useState<CallbackQuery | null>(
    null,
  );
  const [callbackMessage, setCallbackMessage] = useState<string | null>(null);
  const [callbackPending, setCallbackPending] = useState(false);
  const [searchPeriod, setSearchPeriod] = useState(getDefaultSearchPeriod);
  const [mediaResult, setMediaResult] =
    useState<PartnerInstagramMediaPage | null>(null);
  const [insightsResult, setInsightsResult] =
    useState<PartnerInstagramInsightsResult | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [mediaPeriod, setMediaPeriod] = useState<string | null>(null);
  const [insightsPeriod, setInsightsPeriod] = useState<string | null>(null);
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
    onSuccess: async () => {
      toast.success("Perfil desconectado.");
      await queryClient.invalidateQueries({ queryKey: connectionKey });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível desconectar o Instagram.",
      ),
  });

  const mediaMutation = useMutation({
    mutationFn: (input: { since: number; until: number; after?: string }) =>
      fetchPartnerInstagramMedia(supabase, {
        partnerSlug,
        ...input,
      }),
    onSuccess: (page, input) => {
      setMediaResult((current) =>
        input.after && current
          ? {
              media: [...current.media, ...page.media],
              nextCursor: page.nextCursor,
            }
          : page,
      );
      setMediaError(null);
    },
    onError: (error) =>
      setMediaError(
        error instanceof Error
          ? error.message
          : "Não foi possível buscar as publicações.",
      ),
  });

  const insightsMutation = useMutation({
    mutationFn: (input: { since: number; until: number }) =>
      fetchPartnerInstagramInsights(supabase, { partnerSlug, ...input }),
    onSuccess: (result) => {
      setInsightsResult(result);
      setInsightsError(null);
    },
    onError: (error) =>
      setInsightsError(
        error instanceof Error
          ? error.message
          : "Não foi possível buscar os insights.",
      ),
  });

  const handlePeriodChange = (range: DateRangeValue) => {
    setSearchPeriod({ start: range.start, end: range.end });
  };

  const runMediaSearch = (after?: string) => {
    const range = getUnixRange(searchPeriod);
    if (!after) {
      setMediaResult(null);
      setMediaError(null);
      setMediaPeriod(formatSearchPeriod(searchPeriod));
    }
    mediaMutation.mutate({ ...range, ...(after ? { after } : {}) });
  };

  const runInsightsSearch = () => {
    setInsightsResult(null);
    setInsightsError(null);
    setInsightsPeriod(formatSearchPeriod(searchPeriod));
    insightsMutation.mutate(getUnixRange(searchPeriod));
  };

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
              className="grid gap-5 rounded-2xl bg-card p-5 squircle sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start lg:grid-cols-[auto_minmax(0,1fr)_260px]"
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <PrismButtonGroup aria-label="Conexão do Instagram" size="sm">
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
                  {connectMutation.isPending && (
                    <LoaderCircleIcon className="size-4 animate-spin" />
                  )}
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
                        <LoaderCircleIcon className="size-4 animate-spin" />
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
                          {connection.profileUsername}. Se a revogação não for
                          confirmada, o cadastro continuará conectado.
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
              {connection.status === "active" && (
                <div className="flex flex-wrap items-center gap-3">
                  <PrismDateRangePicker
                    aria-label="Período de busca do Instagram"
                    className="w-full sm:w-64"
                    numberOfMonths={1}
                    onChange={handlePeriodChange}
                    size="sm"
                    value={searchPeriod}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Buscar</span>
                    <PrismButtonGroup
                      aria-label="Buscar dados do Instagram"
                      size="sm"
                    >
                      <PrismButton
                        isDisabled={
                          mediaMutation.isPending ||
                          insightsMutation.isPending ||
                          connectionQuery.isPending
                        }
                        onPress={() => runMediaSearch()}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        {mediaMutation.isPending && (
                          <LoaderCircleIcon className="size-4 animate-spin" />
                        )}
                        Publicações
                      </PrismButton>
                      <PrismButton
                        isDisabled={
                          mediaMutation.isPending ||
                          insightsMutation.isPending ||
                          connectionQuery.isPending
                        }
                        onPress={runInsightsSearch}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        {insightsMutation.isPending && (
                          <LoaderCircleIcon className="size-4 animate-spin" />
                        )}
                        Insights
                      </PrismButton>
                    </PrismButtonGroup>
                  </div>
                </div>
              )}
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

      {mediaError && (
        <p className="text-base text-error" role="alert">
          {mediaError}
        </p>
      )}
      {mediaResult && (
        <section aria-label="Publicações encontradas" className="grid gap-3">
          <div className="grid gap-1">
            <h5>Publicações encontradas</h5>
            <p className="text-base text-secondary-foreground">
              {mediaResult.media.length} publicação(ões) listada(s) · Período:{" "}
              {mediaPeriod}. A listagem inclui as mídias do feed disponíveis na
              conta; Stories podem não aparecer nesta consulta. A busca usa uma
              página por vez; carregue as próximas para percorrer o período
              completo.
            </p>
          </div>
          {mediaResult.media.length === 0 ? (
            <p className="text-base text-secondary-foreground">
              Nenhuma publicação foi retornada neste período.
            </p>
          ) : (
            <ul className="grid gap-3">
              {mediaResult.media.map((media) => (
                <li
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border pb-3"
                  key={media.id}
                >
                  <div className="grid min-w-0 gap-1">
                    <p className="text-base font-medium">
                      {media.caption || mediaFormatLabel(media)}
                    </p>
                    <p className="text-sm text-secondary-foreground">
                      {mediaFormatLabel(media)} ·{" "}
                      {formatInstagramDate(media.timestamp)}
                    </p>
                    <p className="text-sm text-secondary-foreground">
                      {media.likeCount === null
                        ? "Curtidas indisponíveis"
                        : `${media.likeCount.toLocaleString("pt-BR")} curtidas`}
                      {media.commentsCount !== null &&
                        ` · ${media.commentsCount.toLocaleString("pt-BR")} comentários`}
                      {media.viewCount !== null &&
                        ` · ${media.viewCount.toLocaleString("pt-BR")} visualizações`}
                    </p>
                  </div>
                  {media.permalink && (
                    <a
                      className="text-base font-medium text-primary underline underline-offset-4"
                      href={media.permalink}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Abrir publicação
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
          {mediaResult.nextCursor && (
            <PrismButton
              className="w-fit"
              isDisabled={mediaMutation.isPending}
              onPress={() =>
                runMediaSearch(mediaResult.nextCursor ?? undefined)
              }
              type="button"
              variant="outline"
            >
              {mediaMutation.isPending && (
                <LoaderCircleIcon className="size-4 animate-spin" />
              )}
              Carregar mais publicações
            </PrismButton>
          )}
        </section>
      )}
      {insightsError && (
        <p className="text-base text-error" role="alert">
          {insightsError}
        </p>
      )}
      {insightsResult && (
        <section aria-label="Insights do Instagram" className="grid gap-3">
          <div className="grid gap-1">
            <h5>Insights do perfil</h5>
            <p className="text-base text-secondary-foreground">
              Período: {insightsPeriod}. Métricas diárias retornadas pelo
              Instagram no período selecionado. A consulta é somente leitura e
              não grava estes dados.
            </p>
          </div>
          {insightsResult.insights.length === 0 ? (
            <p className="text-base text-secondary-foreground">
              Nenhum insight foi retornado. Métricas ausentes não significam
              valor zero.
            </p>
          ) : (
            <ul className="grid gap-2">
              {insightsResult.insights.map((insight) => (
                <li
                  className="grid gap-1 border-b border-border pb-2"
                  key={insight.name}
                >
                  <p className="text-base font-medium">{insight.title}</p>
                  {insight.values.length === 0 ? (
                    <p className="text-base text-secondary-foreground">
                      Sem valores retornados para esta métrica.
                    </p>
                  ) : (
                    <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                      {insight.values.map((item) => (
                        <li
                          className="text-sm text-secondary-foreground"
                          key={`${item.endTime ?? insight.name}:${item.value}`}
                        >
                          {item.endTime
                            ? `${formatInstagramDate(item.endTime).slice(0, 10)} · `
                            : ""}
                          {item.value.toLocaleString("pt-BR")}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

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
          {connectMutation.isPending && (
            <LoaderCircleIcon className="size-4 animate-spin" />
          )}
          Conectar Instagram
        </PrismButton>
      )}
    </div>
  );
}
