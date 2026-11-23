import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CloudIcon,
  FileTextIcon,
  LayersIcon,
  Link2Icon,
  ShieldAlertIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminGuard } from "~/components/features/AdminGuard";
import { PartnerDeleteConfirmDialog } from "~/components/features/PartnerDeleteConfirmDialog";
import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import {
  PrismAlert,
  PrismAlertDescription,
  PrismAlertTitle,
  PrismBadge,
  PrismButton,
  PrismCheckbox,
  PrismSeparator,
  buttonVariants,
} from "~/components/prism";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { ULoader } from "~/components/uzzina/ULoader";
import { useAppContext } from "~/contexts/AppContext";
import { CATEGORIES, PHASES } from "~/lib/CONSTANTS";
import type { PartnerDeletePreview } from "~/lib/partner-delete-contract";
import { QUERY_KEYS } from "~/lib/query-keys";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  PartnerDeleteApiError,
  deleteArchivedPartner,
  getPartnerDeletePreview,
} from "~/models/partners";

export const Route = createFileRoute("/app/admin/partner/$slug_/delete")({
  component: AdminPartnerDeletePageWrapper,
});

function AdminPartnerDeletePageWrapper() {
  const { slug } = Route.useParams();
  return (
    <AdminGuard>
      <AdminPartnerDeletePage key={slug} />
    </AdminGuard>
  );
}

function formatDatePtBr(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function formatPhaseTitle(phase: string): string {
  if (phase in PHASES) {
    return PHASES[phase as keyof typeof PHASES].title;
  }
  return phase;
}

function formatCategoryTitle(category: string): string {
  if (category in CATEGORIES) {
    return CATEGORIES[category as keyof typeof CATEGORIES].title;
  }
  return category;
}

function formatCloudinaryDisplayPath(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments.slice(-2).join("/") || rawUrl;
  } catch {
    return rawUrl;
  }
}

const SECTION_KEYS = [
  "exclusiveActions",
  "sharedActions",
  "clients",
  "otherRecords",
  "media",
] as const;

type SectionKey = (typeof SECTION_KEYS)[number];

function createEmptyAcknowledgments(): Record<SectionKey, boolean> {
  return {
    exclusiveActions: false,
    sharedActions: false,
    clients: false,
    otherRecords: false,
    media: false,
  };
}

function SectionCard({
  title,
  description,
  icon,
  badge,
  acknowledgment,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  acknowledgment: {
    label: string;
    isSelected: boolean;
    onChange: (checked: boolean) => void;
  };
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 squircle">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-secondary-foreground">{icon}</span>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-secondary-foreground">{description}</p>
            )}
          </div>
        </div>
        {badge}
      </div>
      <PrismSeparator />
      {children}
      <PrismSeparator />
      <PrismCheckbox
        className="w-fit text-foreground"
        isSelected={acknowledgment.isSelected}
        onChange={acknowledgment.onChange}
      >
        {acknowledgment.label}
      </PrismCheckbox>
    </section>
  );
}

function MetricBox({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "error" | "info" | "warning";
}) {
  const valueClass =
    tone === "error"
      ? "text-error-foreground"
      : tone === "info"
        ? "text-info-foreground"
        : tone === "warning"
          ? "text-warning-foreground"
          : "text-foreground";
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-background p-3 squircle">
      <span className="text-xs text-secondary-foreground">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function AdminPartnerDeletePage() {
  const { person } = useAppContext();
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const supabase = createSupabaseBrowserClient();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState<Record<SectionKey, boolean>>(
    createEmptyAcknowledgments,
  );

  const setSectionAcknowledged = (key: SectionKey, checked: boolean) => {
    setAcknowledged((current) => ({ ...current, [key]: checked }));
  };

  const {
    data: preview,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PartnerDeletePreview, Error>({
    queryKey: ["partner-delete-preview", person.user_id, slug],
    queryFn: () => getPartnerDeletePreview(supabase, slug),
    retry: false,
  });

  const previewSnapshotKey = preview
    ? `${preview.partner.id}:${preview.snapshot.exclusiveActions}:${preview.snapshot.sharedActions}:${preview.snapshot.exclusiveClients}:${preview.snapshot.sharedClients}`
    : "";

  useEffect(() => {
    if (previewSnapshotKey) {
      setAcknowledged(createEmptyAcknowledgments());
    }
  }, [previewSnapshotKey]);

  const deleteMutation = useMutation({
    mutationFn: async (currentPreview: PartnerDeletePreview) =>
      deleteArchivedPartner(supabase, {
        partnerId: currentPreview.partner.id,
        slug: currentPreview.partner.slug,
        expectedCounts: currentPreview.snapshot,
      }),
    onSuccess: async (_, currentPreview) => {
      setIsConfirmOpen(false);
      setConfirmError(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.adminPartners(person.user_id),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.partners(),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.actions.all(),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.partnerTopics(person.user_id),
        }),
        queryClient.invalidateQueries({
          queryKey: ["clients"],
        }),
      ]);
      toast.success(
        `Parceiro "${currentPreview.partner.title}" excluído definitivamente.`,
      );
      void navigate({ to: "/app/admin/partners" });
    },
    onError: (err) => {
      if (err instanceof PartnerDeleteApiError) {
        if (
          err.code === "IMPACT_CHANGED" ||
          err.code === "PARTNER_NOT_ARCHIVED"
        ) {
          setIsConfirmOpen(false);
          setConfirmError(null);
          toast.warning(err.message);
          void refetch();
          return;
        }
        if (err.code === "PARTNER_NOT_FOUND") {
          setIsConfirmOpen(false);
          setConfirmError(null);
          toast.info("Este parceiro já foi excluído.");
          void queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.adminPartners(person.user_id),
          });
          void queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.partners(),
          });
          void navigate({ to: "/app/admin/partners" });
          return;
        }
        setConfirmError(err.message);
        return;
      }
      setConfirmError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o parceiro.",
      );
    },
  });

  if (isLoading) {
    return (
      <div
        className="flex h-full min-h-75 w-full items-center justify-center gap-4 bg-background p-8"
        role="status"
      >
        <ULoader className="text-primary" size="2xl" />
        <p className="animate-pulse text-sm font-medium text-secondary-foreground">
          Levantando registros do parceiro...
        </p>
      </div>
    );
  }

  if (isError || !preview) {
    const apiError = error instanceof PartnerDeleteApiError ? error : null;
    const notArchived = apiError?.code === "PARTNER_NOT_ARCHIVED";
    const notFound = apiError?.code === "PARTNER_NOT_FOUND";

    return (
      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-6 p-8">
        <div>
          <Link
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            params={{ slug }}
            to="/app/admin/partner/$slug"
          >
            <ArrowLeftIcon />
            Voltar para edição
          </Link>
        </div>

        <PrismAlert variant={notArchived ? "warning" : "error"}>
          <ShieldAlertIcon />
          <PrismAlertTitle>
            {notArchived
              ? "Parceiro precisa estar arquivado"
              : notFound
                ? "Parceiro não encontrado"
                : "Erro ao levantar os dados"}
          </PrismAlertTitle>
          <PrismAlertDescription>
            {apiError?.message ||
              "Não foi possível consultar os vínculos deste parceiro."}
          </PrismAlertDescription>
        </PrismAlert>

        <div className="flex flex-wrap gap-3">
          {notArchived ? (
            <Link
              className={buttonVariants({ variant: "outline" })}
              params={{ slug }}
              to="/app/admin/partner/$slug"
            >
              <ArrowLeftIcon />
              Abrir cadastro do parceiro
            </Link>
          ) : notFound ? (
            <Link
              className={buttonVariants({ variant: "outline" })}
              to="/app/admin/partners"
            >
              <ArrowLeftIcon />
              Voltar para parceiros
            </Link>
          ) : (
            <PrismButton onPress={() => void refetch()} variant="outline">
              Tentar novamente
            </PrismButton>
          )}
        </div>
        <AppBarSpacer />
      </div>
    );
  }

  const totalCascadedItems =
    preview.cascadesFromExclusiveActions.commentsCount +
    preview.cascadesFromExclusiveActions.notificationsCount +
    preview.cascadesFromExclusiveActions.strategyOperationsCount;
  const acknowledgedCount = SECTION_KEYS.filter(
    (key) => acknowledged[key],
  ).length;
  const allAcknowledged = acknowledgedCount === SECTION_KEYS.length;

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className={buttonVariants({ variant: "ghost", size: "sm" })}
          params={{ slug: preview.partner.slug }}
          to="/app/admin/partner/$slug"
        >
          <ArrowLeftIcon />
          Voltar para edição
        </Link>

        <Link
          className="text-sm font-medium text-secondary-foreground hover:text-foreground hover:underline"
          to="/app/admin/partners"
        >
          Todos os parceiros
        </Link>
      </div>

      <header className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 squircle">
        <UAvatar
          backgroundColor={preview.partner.colors[0]}
          color={preview.partner.colors[1]}
          fallback={preview.partner.short}
          image={preview.partner.image}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">
              Excluir {preview.partner.title}
            </h1>
            <PrismBadge variant="warning">Arquivado</PrismBadge>
          </div>
          <p className="text-sm text-secondary-foreground">
            Identificador:{" "}
            <code className="font-mono text-foreground">
              {preview.partner.slug}
            </code>
          </p>
        </div>
      </header>

      <PrismAlert variant="error">
        <AlertTriangleIcon />
        <PrismAlertTitle>Revisão obrigatória antes de excluir</PrismAlertTitle>
        <PrismAlertDescription>
          Revise cada seção abaixo. Ao confirmar no botão ao final da página,
          este parceiro e seus registros exclusivos serão apagados do banco de
          forma definitiva. Ações e clientes compartilhados com outros parceiros
          serão mantidos sem esta marca.
        </PrismAlertDescription>
      </PrismAlert>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricBox
          label="Ações excluídas"
          tone={preview.exclusiveActions.length > 0 ? "error" : "default"}
          value={preview.exclusiveActions.length}
        />
        <MetricBox
          label="Ações desvinculadas"
          tone={preview.sharedActions.length > 0 ? "info" : "default"}
          value={preview.sharedActions.length}
        />
        <MetricBox
          label="Contas de cliente excluídas"
          tone={preview.exclusiveClients.length > 0 ? "error" : "default"}
          value={preview.exclusiveClients.length}
        />
        <MetricBox
          label="Arquivos candidatos (Cloudinary)"
          tone={preview.media.orphanCandidatesCount > 0 ? "warning" : "default"}
          value={preview.media.orphanCandidatesCount}
        />
      </div>

      <SectionCard
        acknowledgment={{
          isSelected: acknowledged.exclusiveActions,
          label:
            "Entendi o que será feito com as ações exclusivas e seus registros.",
          onChange: (checked) =>
            setSectionAcknowledged("exclusiveActions", checked),
        }}
        badge={
          <PrismBadge
            variant={preview.exclusiveActions.length > 0 ? "error" : "default"}
          >
            {preview.exclusiveActions.length} ação(ões)
          </PrismBadge>
        }
        description="Ações ligadas apenas a este parceiro serão apagadas junto com seus comentários, notificações e histórico de estratégias."
        icon={<FileTextIcon className="size-5" />}
        title="Ações exclusivas (serão excluídas)"
      >
        <div className="flex flex-wrap gap-2 text-xs text-secondary-foreground">
          <span>
            Comentários removidos:{" "}
            <strong className="text-foreground">
              {preview.cascadesFromExclusiveActions.commentsCount}
            </strong>
          </span>
          <span>·</span>
          <span>
            Notificações removidas:{" "}
            <strong className="text-foreground">
              {preview.cascadesFromExclusiveActions.notificationsCount}
            </strong>
          </span>
          <span>·</span>
          <span>
            Operações de estratégia:{" "}
            <strong className="text-foreground">
              {preview.cascadesFromExclusiveActions.strategyOperationsCount}
            </strong>
          </span>
          {totalCascadedItems === 0 && <span>(nenhum registro derivado)</span>}
        </div>

        {preview.exclusiveActions.length === 0 ? (
          <p className="text-sm text-secondary-foreground">
            Nenhuma ação exclusiva encontrada para este parceiro.
          </p>
        ) : (
          <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
            {preview.exclusiveActions.map((action) => (
              <li
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm squircle"
                key={action.id}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground">
                    {action.title}
                  </div>
                  <div className="text-xs text-secondary-foreground">
                    {formatDatePtBr(action.date)} ·{" "}
                    {formatCategoryTitle(action.category)} ·{" "}
                    {formatPhaseTitle(action.phase)}
                  </div>
                </div>
                {action.archived && (
                  <PrismBadge variant="default">Arquivada</PrismBadge>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        acknowledgment={{
          isSelected: acknowledged.sharedActions,
          label:
            "Entendi que as ações compartilhadas serão mantidas sem este parceiro.",
          onChange: (checked) =>
            setSectionAcknowledged("sharedActions", checked),
        }}
        badge={
          <PrismBadge
            variant={preview.sharedActions.length > 0 ? "info" : "default"}
          >
            {preview.sharedActions.length} ação(ões)
          </PrismBadge>
        }
        description="Estas ações também pertencem a outros parceiros. Elas continuam existindo e apenas perdem o vínculo com esta marca."
        icon={<LayersIcon className="size-5" />}
        title="Ações compartilhadas (serão mantidas)"
      >
        {preview.sharedActions.length === 0 ? (
          <p className="text-sm text-secondary-foreground">
            Nenhuma ação compartilhada com outros parceiros.
          </p>
        ) : (
          <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
            {preview.sharedActions.map((action) => (
              <li
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm squircle"
                key={action.id}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground">
                    {action.title}
                  </div>
                  <div className="text-xs text-secondary-foreground">
                    {formatDatePtBr(action.date)} ·{" "}
                    {formatPhaseTitle(action.phase)} · Mantida em:{" "}
                    <span className="text-foreground">
                      {action.remainingPartners.join(", ")}
                    </span>
                  </div>
                </div>
                {action.clearsPartnerTopic && (
                  <PrismBadge variant="warning">Tópico será limpo</PrismBadge>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        acknowledgment={{
          isSelected: acknowledged.clients,
          label:
            "Entendi o que acontecerá com as contas externas do portal (/dash).",
          onChange: (checked) => setSectionAcknowledged("clients", checked),
        }}
        badge={
          <PrismBadge variant="default">
            {preview.exclusiveClients.length} excluída(s) ·{" "}
            {preview.sharedClients.length} mantida(s)
          </PrismBadge>
        }
        description="Contas que acessavam apenas este parceiro são removidas junto com suas sessões do portal. Contas com outras marcas continuam ativas sem este parceiro."
        icon={<UsersIcon className="size-5" />}
        title="Contas externas do portal (/dash)"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">
              Contas que serão excluídas ({preview.exclusiveClients.length})
            </h3>
            {preview.exclusiveClients.length === 0 ? (
              <p className="text-xs text-secondary-foreground">
                Nenhuma conta exclusiva deste parceiro.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {preview.exclusiveClients.map((client) => (
                  <li
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm squircle"
                    key={client.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-foreground">
                        {client.name || "Sem nome"}
                      </span>
                      <PrismBadge variant="error">Excluir</PrismBadge>
                    </div>
                    <div className="truncate text-xs text-secondary-foreground">
                      {client.email}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">
              Contas que serão mantidas ({preview.sharedClients.length})
            </h3>
            {preview.sharedClients.length === 0 ? (
              <p className="text-xs text-secondary-foreground">
                Nenhuma conta compartilhada com outras marcas.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {preview.sharedClients.map((client) => (
                  <li
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm squircle"
                    key={client.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-foreground">
                        {client.name || "Sem nome"}
                      </span>
                      <PrismBadge variant="info">Desvincular</PrismBadge>
                    </div>
                    <div className="truncate text-xs text-secondary-foreground">
                      {client.email}
                    </div>
                    {client.remainingPartners && (
                      <div className="mt-1 truncate text-xs text-secondary-foreground">
                        Continua em: {client.remainingPartners.join(", ")}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        acknowledgment={{
          isSelected: acknowledged.otherRecords,
          label:
            "Entendi o que acontecerá com tópicos, planejamento, datas e links de revisão.",
          onChange: (checked) =>
            setSectionAcknowledged("otherRecords", checked),
        }}
        description="Tópicos da marca, propostas de planejamento, datas comemorativas vinculadas e links públicos de revisão."
        icon={<CalendarIcon className="size-5" />}
        title="Outros registros do parceiro (serão excluídos)"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">
              Tópicos do parceiro ({preview.topics.length})
            </h3>
            {preview.topics.length === 0 ? (
              <p className="text-xs text-secondary-foreground">
                Nenhum tópico cadastrado.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {preview.topics.map((topic) => (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground"
                    key={topic.id}
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: topic.color }}
                    />
                    {topic.title}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <h3 className="font-medium text-foreground">
              Planejamento, datas e revisão
            </h3>
            <ul className="grid gap-1 text-xs text-secondary-foreground">
              <li>
                Propostas de planejamento:{" "}
                <strong className="text-foreground">
                  {preview.planning.socialPlansCount}
                </strong>{" "}
                ({preview.planning.socialPlanActionLinksCount} vínculo(s) de
                sugestão)
              </li>
              <li>
                Solicitações de geração registradas:{" "}
                <strong className="text-foreground">
                  {preview.planning.themeRequestsCount}
                </strong>
              </li>
              <li>
                Datas comemorativas vinculadas à marca:{" "}
                <strong className="text-foreground">
                  {preview.holidaysCount}
                </strong>
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Link2Icon className="size-3.5" />
                Links públicos de revisão:{" "}
                <strong className="text-foreground">
                  {preview.reviewLinks.totalCount}
                </strong>{" "}
                ({preview.reviewLinks.activeCount} ativo(s) no momento)
              </li>
            </ul>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        acknowledgment={{
          isSelected: acknowledged.media,
          label:
            "Entendi que os arquivos do Cloudinary não serão apagados nesta etapa.",
          onChange: (checked) => setSectionAcknowledged("media", checked),
        }}
        badge={
          <PrismBadge variant="default">Preservados nesta etapa</PrismBadge>
        }
        description="A exclusão do parceiro não apaga mídias no Cloudinary. Os arquivos exclusivos ficam listados para revisão na etapa separada de limpeza do Cloudinary."
        icon={<CloudIcon className="size-5" />}
        title="Arquivos e imagens no Cloudinary"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricBox
            label="Arquivos ligados a este parceiro"
            value={preview.media.totalCount}
          />
          <MetricBox
            label="Ainda em uso em outros lugares da UZZINA"
            tone="info"
            value={preview.media.sharedElsewhereCount}
          />
          <MetricBox
            label="Candidatos sem vínculo após excluir"
            tone={
              preview.media.orphanCandidatesCount > 0 ? "warning" : "default"
            }
            value={preview.media.orphanCandidatesCount}
          />
        </div>

        {preview.media.sampleOrphanUrls.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-secondary-foreground">
              Exemplos de arquivos que ficarão sem vínculo na UZZINA (uso
              externo ao app será verificado na limpeza do Cloudinary):
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {preview.media.sampleOrphanUrls.map((url) => (
                <li
                  className="max-w-full truncate rounded-lg border border-border bg-background px-2 py-1 font-mono text-xs text-secondary-foreground"
                  key={url}
                  title={url}
                >
                  {formatCloudinaryDisplayPath(url)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </SectionCard>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          className={buttonVariants({ variant: "outline" })}
          params={{ slug: preview.partner.slug }}
          to="/app/admin/partner/$slug"
        >
          Cancelar
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {!allAcknowledged && (
            <span className="text-xs text-secondary-foreground">
              Marque todas as seções ({acknowledgedCount}/{SECTION_KEYS.length})
              para liberar a exclusão.
            </span>
          )}
          <PrismButton
            isDisabled={!allAcknowledged}
            onPress={() => {
              setConfirmError(null);
              setIsConfirmOpen(true);
            }}
            type="button"
            variant="error"
          >
            Excluir parceiro
            <Trash2Icon />
          </PrismButton>
        </div>
      </div>

      <PartnerDeleteConfirmDialog
        errorMessage={confirmError}
        isDeleting={deleteMutation.isPending}
        isOpen={isConfirmOpen}
        onConfirm={() => {
          setConfirmError(null);
          deleteMutation.mutate(preview);
        }}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending) {
            setIsConfirmOpen(open);
            if (!open) setConfirmError(null);
          }
        }}
        preview={preview}
      />

      <AppBarSpacer />
    </div>
  );
}
