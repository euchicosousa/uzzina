import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CloudIcon,
  ExternalLinkIcon,
  FileIcon,
  ImageIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  Trash2Icon,
  VideoIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminGuard } from "~/components/features/AdminGuard";
import { CloudinaryDeleteConfirmDialog } from "~/components/features/CloudinaryDeleteConfirmDialog";
import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import {
  PrismAlert,
  PrismAlertAction,
  PrismAlertDescription,
  PrismAlertTitle,
  PrismBadge,
  PrismButton,
  PrismCheckbox,
  PrismInput,
  PrismSeparator,
  PrismTab,
  PrismTabList,
  PrismTabPanel,
  PrismTabs,
  buttonVariants,
} from "~/components/prism";
import { ULoader } from "~/components/uzzina/ULoader";
import { useAppContext } from "~/contexts/AppContext";
import {
  type CloudinaryAssetOrigin,
  type CloudinaryAssetReferenceSource,
  type CloudinaryAuditAsset,
  type CloudinaryAuditResponse,
  type CloudinaryDeleteResponse,
  type CloudinaryDeleteSkipReason,
  type CloudinaryResourceType,
  MAX_CLOUDINARY_DELETE_BATCH,
} from "~/lib/cloudinary-audit-contract";
import { QUERY_KEYS } from "~/lib/query-keys";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  CloudinaryAuditApiError,
  deleteCloudinaryAssets,
  getCloudinaryAudit,
} from "~/models/cloudinary";

export const Route = createFileRoute("/app/admin/cloudinary")({
  component: AdminCloudinaryPageWrapper,
});

function AdminCloudinaryPageWrapper() {
  return (
    <AdminGuard>
      <AdminCloudinaryPage />
    </AdminGuard>
  );
}

type AuditTabKey = "orphans" | "in_use" | "recent" | "unknown";
type TypeFilter = "all" | CloudinaryResourceType;
type SortOrder = "size_desc" | "size_asc" | "date_desc" | "date_asc";

const PAGE_LIMIT = 100;

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  const formatted =
    index === 0
      ? String(Math.round(value))
      : value.toFixed(value >= 10 ? 1 : 2);
  return `${formatted.replace(".", ",")} ${units[index]}`;
}

function formatDateTimePtBr(value: string): string {
  if (!value) return "Data desconhecida";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function originBadge(origin: CloudinaryAssetOrigin): {
  label: string;
  variant: "info" | "default" | "warning";
} {
  if (origin === "uzzina_folder") {
    return { label: "Pasta uzzina", variant: "info" };
  }
  if (origin === "partner_legacy_folder") {
    return { label: "Pasta de parceiro", variant: "default" };
  }
  return { label: "Origem desconhecida", variant: "warning" };
}

function resourceTypeLabel(resourceType: CloudinaryResourceType): string {
  if (resourceType === "image") return "Imagem";
  if (resourceType === "video") return "Vídeo";
  return "Arquivo";
}

function AssetThumbnail({ asset }: { asset: CloudinaryAuditAsset }) {
  const [failed, setFailed] = useState(false);

  if (asset.previewUrl && !failed) {
    return (
      <img
        alt={asset.publicId}
        className="size-14 shrink-0 rounded-xl border border-border bg-background object-cover squircle"
        loading="lazy"
        onError={() => setFailed(true)}
        src={asset.previewUrl}
      />
    );
  }

  const Icon =
    asset.resourceType === "video"
      ? VideoIcon
      : asset.resourceType === "image"
        ? ImageIcon
        : FileIcon;

  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-secondary-foreground squircle">
      <Icon className="size-6" />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint: string;
  tone?: "default" | "info" | "warning";
}) {
  const valueClass =
    tone === "info"
      ? "text-info-foreground"
      : tone === "warning"
        ? "text-warning-foreground"
        : "text-foreground";

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 squircle">
      <span className="text-xs text-secondary-foreground">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${valueClass}`}>
        {value}
      </span>
      <span className="text-xs text-secondary-foreground">{hint}</span>
    </div>
  );
}

function skipReasonLabel(reason: CloudinaryDeleteSkipReason): string {
  if (reason === "now_referenced") return "passou a ter vínculo no banco";
  if (reason === "protected_reference") {
    return "uso fora de arquivos de ação (logotipo, avatar ou texto)";
  }
  if (reason === "recent_upload") return "enviado há menos de 24h";
  if (reason === "unknown_origin") return "origem desconhecida";
  return "não encontrado no catálogo";
}

function referenceSourceLabel(source: CloudinaryAssetReferenceSource): string {
  if (source === "action_work_files") return "Arquivos de trabalho";
  if (source === "action_content_files") return "Mídias do Instagram";
  if (source === "action_text") return "Texto/legenda da ação";
  if (source === "partner_image") return "Logotipo do parceiro";
  if (source === "person_image") return "Avatar da equipe";
  if (source === "client_image") return "Avatar de cliente";
  if (source === "comment") return "Comentário";
  if (source === "social_plan") return "Planejamento";
  return "Lead";
}

function sortAssets(
  items: CloudinaryAuditAsset[],
  sortOrder: SortOrder,
): CloudinaryAuditAsset[] {
  return [...items].sort((a, b) => {
    if (sortOrder === "size_desc") {
      return b.bytes - a.bytes || b.createdAt.localeCompare(a.createdAt);
    }
    if (sortOrder === "size_asc") {
      return a.bytes - b.bytes || b.createdAt.localeCompare(a.createdAt);
    }
    const timeA = Date.parse(a.createdAt) || 0;
    const timeB = Date.parse(b.createdAt) || 0;
    if (sortOrder === "date_desc") {
      return timeB - timeA || b.bytes - a.bytes;
    }
    return timeA - timeB || b.bytes - a.bytes;
  });
}

function SelectionActionBar({
  selectableCount,
  selectedCount,
  selectedBytes,
  affectedActionsCount = 0,
  isDeleting,
  actionLabel,
  onSelectVisibleBatch,
  onClearSelection,
  onRequestDelete,
}: {
  selectableCount: number;
  selectedCount: number;
  selectedBytes: number;
  affectedActionsCount?: number;
  isDeleting: boolean;
  actionLabel: string;
  onSelectVisibleBatch: () => void;
  onClearSelection: () => void;
  onRequestDelete: () => void;
}) {
  if (selectableCount === 0 && selectedCount === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 squircle">
      <div className="flex flex-wrap items-center gap-2">
        <PrismButton
          isDisabled={
            selectableCount === 0 ||
            selectedCount >= MAX_CLOUDINARY_DELETE_BATCH
          }
          onPress={onSelectVisibleBatch}
          size="sm"
          type="button"
          variant="outline"
        >
          Selecionar até {MAX_CLOUDINARY_DELETE_BATCH} visíveis
        </PrismButton>
        <PrismButton
          isDisabled={selectedCount === 0}
          onPress={onClearSelection}
          size="sm"
          type="button"
          variant="ghost"
        >
          Limpar seleção
        </PrismButton>
        <span className="text-xs text-secondary-foreground">
          <strong className="text-foreground">{selectedCount}</strong>{" "}
          selecionado(s) · {formatBytes(selectedBytes)} estimados
          {affectedActionsCount > 0 &&
            ` · ${affectedActionsCount} ação(ões) afetada(s)`}
          {selectedCount >= MAX_CLOUDINARY_DELETE_BATCH &&
            ` (limite de ${MAX_CLOUDINARY_DELETE_BATCH} por lote)`}
        </span>
      </div>

      <PrismButton
        isDisabled={selectedCount === 0 || isDeleting}
        onPress={onRequestDelete}
        size="sm"
        type="button"
        variant="error"
      >
        {actionLabel}
        <Trash2Icon />
      </PrismButton>
    </div>
  );
}

function AssetList({
  items,
  emptyMessage,
  notice,
  visibleLimit,
  onShowMore,
  selection,
}: {
  items: CloudinaryAuditAsset[];
  emptyMessage: string;
  notice: string;
  visibleLimit: number;
  onShowMore: () => void;
  selection?: {
    selectedKeys: ReadonlySet<string>;
    maxReached: boolean;
    isSelectable?: (asset: CloudinaryAuditAsset) => boolean;
    onToggle: (assetKey: string, selected: boolean) => void;
  };
}) {
  const visibleItems = items.slice(0, visibleLimit);

  return (
    <div className="flex flex-col gap-4 pt-4">
      <p className="text-sm text-secondary-foreground">{notice}</p>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-secondary-foreground squircle">
          {emptyMessage}
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {visibleItems.map((asset) => {
              const badge = originBadge(asset.origin);
              const isSelected = Boolean(
                selection?.selectedKeys.has(asset.assetKey),
              );
              const canSelect = selection
                ? (selection.isSelectable?.(asset) ?? true)
                : false;
              const references = asset.references ?? [];

              return (
                <li
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-3.5 text-sm squircle"
                  key={asset.assetKey}
                >
                  {selection && (
                    <PrismCheckbox
                      aria-label={`Selecionar ${asset.publicId}`}
                      isDisabled={
                        !canSelect || (!isSelected && selection.maxReached)
                      }
                      isSelected={isSelected}
                      onChange={(checked) =>
                        selection.onToggle(asset.assetKey, checked)
                      }
                    />
                  )}

                  <AssetThumbnail asset={asset} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="truncate font-mono text-xs font-medium text-foreground"
                        title={asset.publicId}
                      >
                        {asset.publicId}
                      </span>
                      <PrismBadge variant={badge.variant}>
                        {badge.label}
                      </PrismBadge>
                      <PrismBadge variant="default">
                        {resourceTypeLabel(asset.resourceType)}
                        {asset.format ? ` · ${asset.format.toUpperCase()}` : ""}
                      </PrismBadge>
                      {asset.status === "in_use" &&
                        !asset.canUnlinkFromActions && (
                          <PrismBadge variant="warning">
                            Protegido (uso fora de arquivos de ação)
                          </PrismBadge>
                        )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-secondary-foreground">
                      <span>Pasta: {asset.folder}</span>
                      <span>Tamanho: {formatBytes(asset.bytes)}</span>
                      {asset.width && asset.height && (
                        <span>
                          {asset.width}×{asset.height}px
                        </span>
                      )}
                      <span>
                        Enviado em: {formatDateTimePtBr(asset.createdAt)}
                      </span>
                    </div>

                    {references.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {references.slice(0, 4).map((ref) => {
                          const isActionFile =
                            ref.source === "action_work_files" ||
                            ref.source === "action_content_files";
                          const partnerSuffix =
                            ref.partners && ref.partners.length > 0
                              ? ` (${ref.partners.join(", ")})`
                              : "";
                          return (
                            <PrismBadge
                              key={`${ref.source}:${ref.entityId}`}
                              variant={isActionFile ? "info" : "warning"}
                            >
                              {referenceSourceLabel(ref.source)}: {ref.label}
                              {partnerSuffix}
                            </PrismBadge>
                          );
                        })}
                        {references.length > 4 && (
                          <PrismBadge variant="default">
                            +{references.length - 4} vínculo(s)
                          </PrismBadge>
                        )}
                      </div>
                    )}
                  </div>

                  {asset.secureUrl && (
                    <a
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                      href={asset.secureUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Abrir
                      <ExternalLinkIcon />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          {items.length > visibleItems.length && (
            <div className="flex justify-center">
              <PrismButton onPress={onShowMore} size="sm" variant="outline">
                Mostrar mais ({items.length - visibleItems.length} restantes)
              </PrismButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdminCloudinaryPage() {
  const { person } = useAppContext();
  const queryClient = useQueryClient();
  const supabase = createSupabaseBrowserClient();

  const [activeTab, setActiveTab] = useState<AuditTabKey>("orphans");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("size_desc");
  const [search, setSearch] = useState("");
  const [visibleLimit, setVisibleLimit] = useState(PAGE_LIMIT);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [lastDeleteResult, setLastDeleteResult] =
    useState<CloudinaryDeleteResponse | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    CloudinaryAuditResponse,
    Error
  >({
    queryKey: ["cloudinary-audit", person.user_id],
    queryFn: () => getCloudinaryAudit(supabase),
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!data) return;
    const validKeys = new Set<string>([
      ...data.orphanCandidates.map((item) => item.assetKey),
      ...(data.inUseAssets ?? [])
        .filter((item) => item.canUnlinkFromActions === true)
        .map((item) => item.assetKey),
    ]);
    setSelectedKeys((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set<string>();
      for (const key of prev) {
        if (validKeys.has(key)) next.add(key);
      }
      return next.size === prev.size ? prev : next;
    });
  }, [data]);

  const deleteMutation = useMutation({
    mutationFn: async ({
      items,
      allowReferencedInActions,
    }: {
      items: CloudinaryAuditAsset[];
      allowReferencedInActions: boolean;
    }) =>
      deleteCloudinaryAssets(supabase, {
        items: items.map((item) => ({
          publicId: item.publicId,
          resourceType: item.resourceType,
          assetKey: item.assetKey,
        })),
        ...(allowReferencedInActions ? { allowReferencedInActions: true } : {}),
      }),
    onSuccess: (result) => {
      setIsDeleteOpen(false);
      setDeleteError(null);
      setSelectedKeys(new Set());
      setLastDeleteResult(result);
      if (result.unlinkedActionsCount > 0) {
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.actions.all(),
        });
      }
      if (result.deletedCount > 0 && result.unlinkedActionsCount > 0) {
        toast.success(
          `${result.deletedCount} arquivo(s) excluído(s) (${formatBytes(result.freedBytes)} liberados) e ${result.unlinkedActionsCount} ação(ões) atualizada(s).`,
        );
      } else if (result.deletedCount > 0) {
        toast.success(
          `${result.deletedCount} arquivo(s) excluído(s) (${formatBytes(result.freedBytes)} liberados).`,
        );
      } else {
        toast.info("Nenhum arquivo foi excluído após a rechecagem.");
      }
      void refetch();
    },
    onError: (err) => {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir os arquivos selecionados.",
      );
    },
  });

  const filterAndSortItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (items: CloudinaryAuditAsset[]) => {
      const filtered = items.filter((item) => {
        if (typeFilter !== "all" && item.resourceType !== typeFilter) {
          return false;
        }
        if (!query) return true;
        if (
          item.publicId.toLowerCase().includes(query) ||
          item.folder.toLowerCase().includes(query) ||
          item.format.toLowerCase().includes(query)
        ) {
          return true;
        }
        return (item.references ?? []).some(
          (ref) =>
            ref.label.toLowerCase().includes(query) ||
            (ref.partners ?? []).some((partner) =>
              partner.toLowerCase().includes(query),
            ),
        );
      });
      return sortAssets(filtered, sortOrder);
    };
  }, [search, typeFilter, sortOrder]);

  const filteredOrphans = useMemo(
    () => (data ? filterAndSortItems(data.orphanCandidates) : []),
    [data, filterAndSortItems],
  );
  const filteredInUse = useMemo(
    () => (data ? filterAndSortItems(data.inUseAssets ?? []) : []),
    [data, filterAndSortItems],
  );
  const filteredRecent = useMemo(
    () => (data ? filterAndSortItems(data.protectedRecent) : []),
    [data, filterAndSortItems],
  );
  const filteredUnknown = useMemo(
    () => (data ? filterAndSortItems(data.protectedUnknown) : []),
    [data, filterAndSortItems],
  );

  const selectedAssets = useMemo(() => {
    if (!data || selectedKeys.size === 0) return [];
    const pool =
      activeTab === "in_use"
        ? (data.inUseAssets ?? []).filter(
            (item) => item.canUnlinkFromActions === true,
          )
        : activeTab === "orphans"
          ? data.orphanCandidates
          : [];
    return pool.filter((item) => selectedKeys.has(item.assetKey));
  }, [activeTab, data, selectedKeys]);

  const selectedBytes = useMemo(
    () => selectedAssets.reduce((sum, item) => sum + item.bytes, 0),
    [selectedAssets],
  );

  const affectedActionsCount = useMemo(() => {
    if (activeTab !== "in_use" || selectedAssets.length === 0) return 0;
    const actionIds = new Set<string>();
    for (const asset of selectedAssets) {
      for (const ref of asset.references ?? []) {
        if (
          ref.source === "action_work_files" ||
          ref.source === "action_content_files"
        ) {
          actionIds.add(ref.entityId);
        }
      }
    }
    return actionIds.size;
  }, [activeTab, selectedAssets]);

  const toggleAsset = (assetKey: string, checked: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (checked) {
        if (next.size >= MAX_CLOUDINARY_DELETE_BATCH) return prev;
        next.add(assetKey);
      } else {
        next.delete(assetKey);
      }
      return next;
    });
  };

  const selectVisibleBatch = () => {
    const visibleItems =
      activeTab === "in_use"
        ? filteredInUse
            .slice(0, visibleLimit)
            .filter((item) => item.canUnlinkFromActions === true)
        : filteredOrphans.slice(0, visibleLimit);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      for (const item of visibleItems) {
        if (next.size >= MAX_CLOUDINARY_DELETE_BATCH) break;
        next.add(item.assetKey);
      }
      return next;
    });
  };

  const selectableInUseCount = useMemo(
    () =>
      filteredInUse.filter((item) => item.canUnlinkFromActions === true).length,
    [filteredInUse],
  );

  const apiError = error instanceof CloudinaryAuditApiError ? error : null;
  const missingCredentials = apiError?.code === "CLOUDINARY_NOT_CONFIGURED";

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <CloudIcon className="size-6 text-secondary-foreground" />
            <h1 className="pb-0 text-2xl font-bold text-foreground">
              Arquivos no Cloudinary
            </h1>
          </div>
          <p className="text-sm text-secondary-foreground">
            Compara o catálogo completo do Cloudinary com todas as referências
            salvas na UZZINA. Exclua arquivos sem vínculo (&gt; 24h) ou remova
            mídias em uso ligadas a ações limpando os anexos automaticamente.
          </p>
        </div>

        <PrismButton
          isDisabled={isFetching}
          onPress={() => {
            setVisibleLimit(PAGE_LIMIT);
            void refetch();
          }}
          variant="secondary"
        >
          {isFetching ? "Analisando..." : "Atualizar análise"}
          <RefreshCwIcon className={isFetching ? "animate-spin" : undefined} />
        </PrismButton>
      </div>

      {isLoading ? (
        <div
          className="flex min-h-60 items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8 squircle"
          role="status"
        >
          <ULoader className="text-primary" size="2xl" />
          <p className="animate-pulse text-sm font-medium text-secondary-foreground">
            Consultando catálogo do Cloudinary e referências no banco...
          </p>
        </div>
      ) : isError || !data ? (
        <div className="flex flex-col gap-4">
          <PrismAlert variant={missingCredentials ? "warning" : "error"}>
            <AlertTriangleIcon />
            <PrismAlertTitle>
              {missingCredentials
                ? "Credenciais do Cloudinary necessárias no servidor"
                : "Não foi possível auditar o Cloudinary"}
            </PrismAlertTitle>
            <PrismAlertDescription>
              {missingCredentials
                ? "Adicione CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET nas variáveis de ambiente privadas do servidor (.env.production.local e Vercel) para listar o catálogo com segurança."
                : apiError?.message ||
                  error?.message ||
                  "Erro inesperado ao consultar o catálogo."}
            </PrismAlertDescription>
          </PrismAlert>
          <div>
            <PrismButton onPress={() => void refetch()} variant="outline">
              Tentar novamente
            </PrismButton>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryCard
              hint={`Total: ${formatBytes(data.summary.totalCatalogBytes)}`}
              label="Catálogo no Cloudinary"
              value={data.summary.totalCatalogCount}
            />
            <SummaryCard
              hint={`Em uso: ${formatBytes(data.summary.inUseBytes)}`}
              label="Em uso na UZZINA"
              tone="info"
              value={data.summary.inUseCount}
            />
            <SummaryCard
              hint={`Recuperável estimado: ${formatBytes(data.summary.recoverableBytes)}`}
              label="Candidatos sem vínculo"
              tone={
                data.summary.orphanCandidatesCount > 0 ? "warning" : "default"
              }
              value={data.summary.orphanCandidatesCount}
            />
            <SummaryCard
              hint={`${data.summary.protectedRecentCount} recentes · ${data.summary.protectedUnknownCount} origem desconhecida`}
              label="Protegidos fora da exclusão"
              value={
                data.summary.protectedRecentCount +
                data.summary.protectedUnknownCount
              }
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-xs text-secondary-foreground squircle">
            <div className="flex flex-wrap items-center gap-2">
              <ShieldCheckIcon className="size-4 text-success" />
              <span>
                Conta:{" "}
                <strong className="text-foreground">
                  {data.coverage.cloudName}
                </strong>
              </span>
              <span>·</span>
              <span>
                Referências únicas no banco:{" "}
                <strong className="text-foreground">
                  {data.coverage.referencedAssetsCount}
                </strong>
              </span>
              <span>·</span>
              <span>
                Páginas lidas:{" "}
                <strong className="text-foreground">
                  {data.coverage.pagesScanned}
                </strong>
              </span>
              <span>·</span>
              <span>
                Proteção para envios recentes:{" "}
                <strong className="text-foreground">
                  {data.coverage.recentGraceHours}h
                </strong>
              </span>
            </div>
            <span>
              Última leitura: {formatDateTimePtBr(data.coverage.scannedAt)}
            </span>
          </div>

          {lastDeleteResult && (
            <PrismAlert
              variant={
                lastDeleteResult.failed.length > 0 ? "warning" : "success"
              }
            >
              <CheckCircle2Icon />
              <PrismAlertAction>
                <PrismButton
                  onPress={() => setLastDeleteResult(null)}
                  size="xs"
                  variant="ghost"
                >
                  Fechar
                </PrismButton>
              </PrismAlertAction>
              <PrismAlertTitle>
                Resultado da limpeza ({lastDeleteResult.deletedCount}{" "}
                excluído(s) · {formatBytes(lastDeleteResult.freedBytes)}{" "}
                liberados
                {lastDeleteResult.unlinkedActionsCount > 0
                  ? ` · ${lastDeleteResult.unlinkedActionsCount} ação(ões) atualizada(s)`
                  : ""}
                )
              </PrismAlertTitle>
              <PrismAlertDescription>
                {lastDeleteResult.skipped.length > 0 && (
                  <span>
                    {lastDeleteResult.skipped.length} arquivo(s) preservado(s)
                    na rechecagem (
                    {Array.from(
                      new Set(
                        lastDeleteResult.skipped.map((item) =>
                          skipReasonLabel(item.reason),
                        ),
                      ),
                    ).join(", ")}
                    ).
                  </span>
                )}
                {lastDeleteResult.failed.length > 0 && (
                  <span>
                    {lastDeleteResult.failed.length} arquivo(s) falharam:{" "}
                    {lastDeleteResult.failed
                      .slice(0, 3)
                      .map((item) => item.publicId)
                      .join(", ")}
                    .
                  </span>
                )}
                {lastDeleteResult.skipped.length === 0 &&
                  lastDeleteResult.failed.length === 0 && (
                    <span>
                      {lastDeleteResult.unlinkedActionsCount > 0
                        ? `Arquivos removidos do Cloudinary e links limpos em ${lastDeleteResult.unlinkedActionsCount} ação(ões).`
                        : "Todos os arquivos selecionados foram removidos do Cloudinary."}
                    </span>
                  )}
              </PrismAlertDescription>
            </PrismAlert>
          )}

          {data.coverage.truncated && (
            <PrismAlert variant="warning">
              <AlertTriangleIcon />
              <PrismAlertTitle>Varredura parcial do catálogo</PrismAlertTitle>
              <PrismAlertDescription>
                A conta atingiu o limite de páginas desta consulta. Alguns
                arquivos podem não aparecer nesta listagem.
              </PrismAlertDescription>
            </PrismAlert>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-60 flex-1 sm:max-w-sm">
                <PrismInput
                  aria-label="Filtrar arquivos por pasta, nome ou ação vinculada"
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setVisibleLimit(PAGE_LIMIT);
                  }}
                  placeholder="Buscar por pasta, nome, formato ou ação..."
                  value={search}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: "all", label: "Todos" },
                    { id: "image", label: "Imagens" },
                    { id: "video", label: "Vídeos" },
                    { id: "raw", label: "Outros" },
                  ] as const
                ).map((option) => (
                  <PrismButton
                    key={option.id}
                    onPress={() => {
                      setTypeFilter(option.id);
                      setVisibleLimit(PAGE_LIMIT);
                    }}
                    size="sm"
                    type="button"
                    variant={typeFilter === option.id ? "default" : "outline"}
                  >
                    {option.label}
                  </PrismButton>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-secondary-foreground">
                Ordenar por:
              </span>
              {(
                [
                  { id: "size_desc", label: "Maior tamanho" },
                  { id: "size_asc", label: "Menor tamanho" },
                  { id: "date_desc", label: "Mais recentes" },
                  { id: "date_asc", label: "Mais antigos" },
                ] as const
              ).map((option) => (
                <PrismButton
                  key={option.id}
                  onPress={() => {
                    setSortOrder(option.id);
                    setVisibleLimit(PAGE_LIMIT);
                  }}
                  size="sm"
                  type="button"
                  variant={sortOrder === option.id ? "default" : "outline"}
                >
                  {option.label}
                </PrismButton>
              ))}
            </div>
          </div>

          <PrismSeparator />

          <PrismTabs
            onSelectionChange={(key) => {
              setActiveTab(String(key) as AuditTabKey);
              setSelectedKeys(new Set());
              setVisibleLimit(PAGE_LIMIT);
            }}
            selectedKey={activeTab}
          >
            <PrismTabList aria-label="Categorias da auditoria do Cloudinary">
              <PrismTab id="orphans">
                Candidatos sem vínculo ({filteredOrphans.length})
              </PrismTab>
              <PrismTab id="in_use">
                Em uso na UZZINA ({filteredInUse.length})
              </PrismTab>
              <PrismTab id="recent">
                Recentes &lt; {data.coverage.recentGraceHours}h (
                {filteredRecent.length})
              </PrismTab>
              <PrismTab id="unknown">
                Origem desconhecida ({filteredUnknown.length})
              </PrismTab>
            </PrismTabList>

            <PrismTabPanel id="orphans">
              <SelectionActionBar
                actionLabel="Excluir selecionados"
                isDeleting={deleteMutation.isPending}
                onClearSelection={() => setSelectedKeys(new Set())}
                onRequestDelete={() => {
                  setDeleteError(null);
                  setIsDeleteOpen(true);
                }}
                onSelectVisibleBatch={selectVisibleBatch}
                selectableCount={filteredOrphans.length}
                selectedBytes={selectedBytes}
                selectedCount={selectedAssets.length}
              />

              <AssetList
                emptyMessage="Nenhum candidato sem vínculo encontrado com os filtros atuais."
                items={filteredOrphans}
                notice="Arquivos em pastas da UZZINA ou de parceiros conhecidos que não têm nenhuma referência no banco e foram enviados há mais de 24 horas."
                onShowMore={() => setVisibleLimit((prev) => prev + PAGE_LIMIT)}
                selection={{
                  maxReached:
                    selectedAssets.length >= MAX_CLOUDINARY_DELETE_BATCH,
                  onToggle: toggleAsset,
                  selectedKeys,
                }}
                visibleLimit={visibleLimit}
              />
            </PrismTabPanel>

            <PrismTabPanel id="in_use">
              <SelectionActionBar
                actionLabel="Excluir e limpar ações"
                affectedActionsCount={affectedActionsCount}
                isDeleting={deleteMutation.isPending}
                onClearSelection={() => setSelectedKeys(new Set())}
                onRequestDelete={() => {
                  setDeleteError(null);
                  setIsDeleteOpen(true);
                }}
                onSelectVisibleBatch={selectVisibleBatch}
                selectableCount={selectableInUseCount}
                selectedBytes={selectedBytes}
                selectedCount={selectedAssets.length}
              />

              <AssetList
                emptyMessage="Nenhum arquivo em uso encontrado com os filtros atuais."
                items={filteredInUse}
                notice="Arquivos referenciados na UZZINA. Arquivos ligados apenas a anexos ou mídias do Instagram em ações podem ser selecionados para exclusão e limpeza automática dos links. Logotipos, avatares e citações em texto permanecem protegidos."
                onShowMore={() => setVisibleLimit((prev) => prev + PAGE_LIMIT)}
                selection={{
                  isSelectable: (asset) => asset.canUnlinkFromActions === true,
                  maxReached:
                    selectedAssets.length >= MAX_CLOUDINARY_DELETE_BATCH,
                  onToggle: toggleAsset,
                  selectedKeys,
                }}
                visibleLimit={visibleLimit}
              />
            </PrismTabPanel>

            <PrismTabPanel id="recent">
              <AssetList
                emptyMessage="Nenhum arquivo recente sem vínculo no momento."
                items={filteredRecent}
                notice="Arquivos enviados nas últimas 24 horas ficam automaticamente protegidos contra exclusão para não interferir em uploads em andamento."
                onShowMore={() => setVisibleLimit((prev) => prev + PAGE_LIMIT)}
                visibleLimit={visibleLimit}
              />
            </PrismTabPanel>

            <PrismTabPanel id="unknown">
              <AssetList
                emptyMessage="Nenhum arquivo em pasta desconhecida encontrado."
                items={filteredUnknown}
                notice="Arquivos fora da pasta uzzina/ e sem pasta correspondente a um parceiro da UZZINA. Permanecem bloqueados fora da exclusão até você confirmar se pertencem a outro projeto."
                onShowMore={() => setVisibleLimit((prev) => prev + PAGE_LIMIT)}
                visibleLimit={visibleLimit}
              />
            </PrismTabPanel>
          </PrismTabs>
        </>
      )}

      <CloudinaryDeleteConfirmDialog
        affectedActionsCount={affectedActionsCount}
        errorMessage={deleteError}
        formattedTotalBytes={formatBytes(selectedBytes)}
        isDeleting={deleteMutation.isPending}
        isOpen={isDeleteOpen}
        onConfirm={() => {
          setDeleteError(null);
          deleteMutation.mutate({
            items: selectedAssets,
            allowReferencedInActions: activeTab === "in_use",
          });
        }}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending) {
            setIsDeleteOpen(open);
            if (!open) setDeleteError(null);
          }
        }}
        selectedCount={selectedAssets.length}
      />

      <AppBarSpacer />
    </div>
  );
}
