import { useMutation, useQuery } from "@tanstack/react-query";
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
  type CloudinaryAuditAsset,
  type CloudinaryAuditResponse,
  type CloudinaryDeleteResponse,
  type CloudinaryDeleteSkipReason,
  type CloudinaryResourceType,
  MAX_CLOUDINARY_DELETE_BATCH,
} from "~/lib/cloudinary-audit-contract";
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

type AuditTabKey = "orphans" | "recent" | "unknown";
type TypeFilter = "all" | CloudinaryResourceType;

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
  if (reason === "recent_upload") return "enviado há menos de 24h";
  if (reason === "unknown_origin") return "origem desconhecida";
  return "não encontrado no catálogo";
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
              return (
                <li
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-3.5 text-sm squircle"
                  key={asset.assetKey}
                >
                  {selection && (
                    <PrismCheckbox
                      aria-label={`Selecionar ${asset.publicId}`}
                      isDisabled={!isSelected && selection.maxReached}
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
  const supabase = createSupabaseBrowserClient();

  const [activeTab, setActiveTab] = useState<AuditTabKey>("orphans");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
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
    const validKeys = new Set(
      data.orphanCandidates.map((item) => item.assetKey),
    );
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
    mutationFn: async (items: CloudinaryAuditAsset[]) =>
      deleteCloudinaryAssets(supabase, {
        items: items.map((item) => ({
          publicId: item.publicId,
          resourceType: item.resourceType,
          assetKey: item.assetKey,
        })),
      }),
    onSuccess: (result) => {
      setIsDeleteOpen(false);
      setDeleteError(null);
      setSelectedKeys(new Set());
      setLastDeleteResult(result);
      if (result.deletedCount > 0) {
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

  const filterItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (items: CloudinaryAuditAsset[]) =>
      items.filter((item) => {
        if (typeFilter !== "all" && item.resourceType !== typeFilter) {
          return false;
        }
        if (!query) return true;
        return (
          item.publicId.toLowerCase().includes(query) ||
          item.folder.toLowerCase().includes(query) ||
          item.format.toLowerCase().includes(query)
        );
      });
  }, [search, typeFilter]);

  const filteredOrphans = useMemo(
    () => (data ? filterItems(data.orphanCandidates) : []),
    [data, filterItems],
  );
  const filteredRecent = useMemo(
    () => (data ? filterItems(data.protectedRecent) : []),
    [data, filterItems],
  );
  const filteredUnknown = useMemo(
    () => (data ? filterItems(data.protectedUnknown) : []),
    [data, filterItems],
  );

  const selectedAssets = useMemo(() => {
    if (!data || selectedKeys.size === 0) return [];
    return data.orphanCandidates.filter((item) =>
      selectedKeys.has(item.assetKey),
    );
  }, [data, selectedKeys]);

  const selectedBytes = useMemo(
    () => selectedAssets.reduce((sum, item) => sum + item.bytes, 0),
    [selectedAssets],
  );

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
    const visibleItems = filteredOrphans.slice(0, visibleLimit);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      for (const item of visibleItems) {
        if (next.size >= MAX_CLOUDINARY_DELETE_BATCH) break;
        next.add(item.assetKey);
      }
      return next;
    });
  };

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
            salvas na UZZINA. Apenas candidatos sem vínculo e com mais de 24h
            podem ser selecionados para exclusão.
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
                liberados)
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
                      Todos os arquivos selecionados foram removidos do
                      Cloudinary.
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-60 flex-1 sm:max-w-sm">
              <PrismInput
                aria-label="Filtrar arquivos por pasta ou identificador"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleLimit(PAGE_LIMIT);
                }}
                placeholder="Buscar por pasta, nome ou formato..."
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

          <PrismSeparator />

          <PrismTabs
            onSelectionChange={(key) => {
              setActiveTab(String(key) as AuditTabKey);
              setVisibleLimit(PAGE_LIMIT);
            }}
            selectedKey={activeTab}
          >
            <PrismTabList aria-label="Categorias da auditoria do Cloudinary">
              <PrismTab id="orphans">
                Candidatos sem vínculo ({filteredOrphans.length})
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
              {filteredOrphans.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 squircle">
                  <div className="flex flex-wrap items-center gap-2">
                    <PrismButton
                      isDisabled={
                        selectedAssets.length >= MAX_CLOUDINARY_DELETE_BATCH
                      }
                      onPress={selectVisibleBatch}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Selecionar até {MAX_CLOUDINARY_DELETE_BATCH} visíveis
                    </PrismButton>
                    <PrismButton
                      isDisabled={selectedAssets.length === 0}
                      onPress={() => setSelectedKeys(new Set())}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      Limpar seleção
                    </PrismButton>
                    <span className="text-xs text-secondary-foreground">
                      <strong className="text-foreground">
                        {selectedAssets.length}
                      </strong>{" "}
                      selecionado(s) · {formatBytes(selectedBytes)} estimados
                      {selectedAssets.length >= MAX_CLOUDINARY_DELETE_BATCH &&
                        ` (limite de ${MAX_CLOUDINARY_DELETE_BATCH} por lote)`}
                    </span>
                  </div>

                  <PrismButton
                    isDisabled={
                      selectedAssets.length === 0 || deleteMutation.isPending
                    }
                    onPress={() => {
                      setDeleteError(null);
                      setIsDeleteOpen(true);
                    }}
                    size="sm"
                    type="button"
                    variant="error"
                  >
                    Excluir selecionados
                    <Trash2Icon />
                  </PrismButton>
                </div>
              )}

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
        errorMessage={deleteError}
        formattedTotalBytes={formatBytes(selectedBytes)}
        isDeleting={deleteMutation.isPending}
        isOpen={isDeleteOpen}
        onConfirm={() => {
          setDeleteError(null);
          deleteMutation.mutate(selectedAssets);
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
