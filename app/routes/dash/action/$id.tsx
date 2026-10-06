import { retryPortalQuery, usePortalSessionError } from "~/hooks/usePortalSessionError";
import { format } from "date-fns";
import { parseU } from "~/utils/date";
import { ptBR } from "date-fns/locale";
import { ArrowLeftIcon, PlusIcon, AlertCircleIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PrismButton, buttonVariants } from "~/components/prism";
import { CommentInput } from "~/components/features/ActionComments/CommentInput";
import { CommentList } from "~/components/features/ActionComments/CommentList";
import { WorkFileThumbnail } from "~/components/features/media/WorkFileThumbnail";
import { PhaseIcon } from "~/components/features/PhaseIcon";
import { CloudinaryUpload } from "~/components/features/media/CloudinaryUpload";
import { InstagramPreview } from "~/components/features/media/InstagramPreview";
import { CATEGORIES, PHASES, type CATEGORY, type PHASE } from "~/lib/CONSTANTS";
import { Icons } from "~/lib/helpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDashContext } from "~/contexts/DashContext";
import { toast } from "sonner";
import { QUERY_KEYS } from "~/lib/query-keys";
import { sanitizeHtml } from "~/utils/sanitize";
import { fetchDashAction, fetchDashComments, createDashComment, updateDashComment, deleteDashComment, updateDashWorkFiles, type DashActionDto } from "~/services/dash-client";
export const Route = createFileRoute("/dash/action/$id")({
  component: DashActionDetail,
});
function DashActionDetail() {
  const { id: actionId } = Route.useParams();
  const {
    clientId,
    cloudName,
    uploadPreset,
  } = useDashContext();
  const queryClient = useQueryClient();

  // Query para a Ação via endpoint autorizado do servidor
  const {
    data: action,
    isLoading: isLoadingAction,
    isError: isActionError,
    error: actionError,
    refetch: refetchAction,
  } = useQuery<DashActionDto | null>({
    queryKey: ["dashAction", clientId, actionId],
    queryFn: async () => {
      if (!actionId) return null;
      const data = await fetchDashAction(actionId);
      if (!data) throw new Error("Ação não encontrada ou não autorizada.");
      return data;
    },
    enabled: !!actionId,
    retry: retryPortalQuery,
  });

  usePortalSessionError(actionError);

  // Query para os Comentários Públicos (bloqueada até a ação ser autorizada e carregada)
  const { data: comments = [], error: commentsError, isLoading: isLoadingComments, refetch: refetchComments } = useQuery({
    queryKey: ["dashComments", clientId, actionId || ""],
    queryFn: () => fetchDashComments(actionId),
    retry: retryPortalQuery,
    enabled: !!actionId && !!action,
  });

  // Mutação para Atualizar arquivos anexos (work_files)
  const updateWorkFilesMutation = useMutation({
    scope: {id:`dash-work-files:${clientId}:${actionId}`},
    onMutate: () => queryClient.cancelQueries({queryKey:["dashAction",clientId,actionId]}),
    mutationFn: (files: string[]) => updateDashWorkFiles(actionId,files),
    onSuccess: (files,requested) => {
      confirmedWorkFilesRef.current = files;
      setWorkFiles(files);
      if (workFilesRef.current === requested) workFilesRef.current = files;
      queryClient.setQueryData<DashActionDto>(["dashAction",clientId,actionId],current =>
        current ? {...current,work_files:files} : current,
      );
      toast.success("Arquivos atualizados com sucesso!");
    },
    onError: (error,requested) => {
      if (workFilesRef.current === requested) workFilesRef.current = confirmedWorkFilesRef.current;
      console.error("Erro ao salvar arquivos:", error);
      toast.error("Não foi possível salvar os arquivos.");
    },
  });

  // Mutações de Comentários
  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createDashComment(actionId,content),
    onSuccess: (_comment,submitted) => {
      setNewComment(current => current === submitted ? "" : current);
      if (actionId) {
        queryClient.invalidateQueries({
          queryKey: ["dashComments", clientId, actionId],
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.comments.all(actionId),
        });
      }
    },
    onError: (error) => {
      console.error("Erro ao criar comentário:", error);
      toast.error("Não foi possível salvar o comentário.");
    },
  });
  const updateCommentMutation = useMutation({
    mutationFn: async ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => {
      return updateDashComment(actionId, commentId, content);
    },
    onSuccess: () => {
      if (actionId) {
        queryClient.invalidateQueries({
          queryKey: ["dashComments", clientId, actionId],
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.comments.all(actionId),
        });
      }
    },
    onError: (error) => {
      console.error("Erro ao editar comentário:", error);
      toast.error("Não foi possível salvar a alteração.");
    },
  });
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await deleteDashComment(actionId, commentId);
    },
    onSuccess: () => {
      if (actionId) {
        queryClient.invalidateQueries({
          queryKey: ["dashComments", clientId, actionId],
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.comments.all(actionId),
        });
      }
    },
    onError: (error) => {
      console.error("Erro ao deletar comentário:", error);
      toast.error("Não foi possível excluir o comentário.");
    },
  });
  const [newComment, setNewComment] = useState("");
  const [workFiles, setWorkFiles] = useState<string[]>([]);

  const workFilesRef = useRef<string[]>([]);
  const confirmedWorkFilesRef = useRef<string[]>([]);
  const isSavingWorkFilesRef = useRef(false);
  isSavingWorkFilesRef.current = updateWorkFilesMutation.isPending;
  useEffect(() => {
    const files = action?.work_files || [];
    confirmedWorkFilesRef.current = files;
    setWorkFiles(files);
    if (!isSavingWorkFilesRef.current) workFilesRef.current = files;
  }, [action?.work_files]);
  usePortalSessionError(commentsError);
  usePortalSessionError(createCommentMutation.error);
  usePortalSessionError(updateCommentMutation.error);
  usePortalSessionError(deleteCommentMutation.error);
  usePortalSessionError(updateWorkFilesMutation.error);
  const workFilesMetaRef = useRef<
    Record<
      string,
      {
        name: string;
        addedAt: number;
      }
    >
  >({});
  const handleUpload = (
    url: string,
    meta: {
      originalFilename?: string;
    },
  ) => {
    const now = Date.now();
    workFilesMetaRef.current[url] = {
      name: meta.originalFilename || url,
      addedAt: now,
    };
    let next = [...workFilesRef.current, url];
    const splitIndex = next.findIndex((u) => {
      const m = workFilesMetaRef.current[u];
      return m && m.addedAt > now - 5000;
    });
    if (splitIndex !== -1) {
      const oldUrls = next.slice(0, splitIndex);
      const recentUrls = next.slice(splitIndex);
      recentUrls.sort((a, b) => {
        const nameA = workFilesMetaRef.current[a]?.name || a;
        const nameB = workFilesMetaRef.current[b]?.name || b;
        return nameA.localeCompare(nameB);
      });
      next = [...oldUrls, ...recentUrls];
    }
    workFilesRef.current = next;
    updateWorkFilesMutation.mutate(next);
  };
  const currentPhase = useMemo(() => {
    if (!action) return PHASES.idea;
    return PHASES[(action.phase as PHASE) || "idea"];
  }, [action?.phase, action]);
  const currentCategory = useMemo(() => {
    if (!action) return CATEGORIES.design;
    return CATEGORIES[action.category as CATEGORY];
  }, [action?.category, action]);
  if (isLoadingAction) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Carregando detalhes...
        </p>
      </div>
    );
  }

  if (isActionError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background gap-4 p-8 text-center">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
          <AlertCircleIcon className="size-8" />
        </div>
        <h2 className="text-lg font-semibold">Falha ao carregar ação</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Ocorreu um erro ao buscar os dados desta ação no servidor.
        </p>
        <div className="flex items-center gap-3">
          <Link
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            to="/dash"
          >
            Voltar ao painel
          </Link>
          <PrismButton size="sm" onClick={() => refetchAction()}>
            Tentar novamente
          </PrismButton>
        </div>
      </div>
    );
  }

  if (!action) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background gap-4 p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Ação não encontrada ou você não possui permissão para acessá-la.
        </p>
        <Link
          className={buttonVariants({ variant: "default", size: "sm" })}
          to="/dash"
        >
          Voltar ao painel
        </Link>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Voltar */}
      <Link
        className="flex items-center gap-2 p-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/dash"
      >
        <ArrowLeftIcon className="size-4" />
        Voltar ao calendário
      </Link>
      <div className="w-full overflow-y-auto p-4 pt-0">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          <h1 className="p-0 leading-none font-semibold">{action.title}</h1>
          {/* Mídias do Post */}
          <div className="mx-auto w-full sm:max-w-sm">
            <InstagramPreview files={action.content_files} />
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <div className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Data de publicar
              </div>
              <div className="font-medium">
                {format(parseU(action.date), "d 'de' MMMM 'às' HH:mm", {
                  locale: ptBR,
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Categoria
              </div>
              <div className="flex items-center gap-1 font-medium capitalize">
                <Icons
                  className="size-4"
                  slug={currentCategory.slug}
                  style={{
                    color: currentCategory.color,
                  }}
                />
                <span>{action.category}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Fase
              </div>
              <div className="flex items-center gap-2">
                <PhaseIcon phase={currentPhase} variant="icon" />
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: `${currentPhase?.color}22`,
                    color: currentPhase?.color,
                  }}
                >
                  {currentPhase?.title ?? action.phase}
                </span>
              </div>
            </div>
          </div>
          {action.description && (
            <div>
              <div className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Descrição
              </div>
              <div
                className="rounded-xl border bg-card p-4"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: safe rich text description sanitized
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(action.description),
                }}
              />
            </div>
          )}
          {/* Legenda */}

          <div className="mb-8 space-y-3">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Legenda
            </div>
            <div className="min-h-50 w-full resize-none whitespace-pre-wrap">
              {action.instagram_caption}
            </div>
          </div>

          {/* Anexos (Work Files) do Cliente */}
          <div className="mb-8 space-y-3">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Seus Anexos e Materiais
            </div>
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl">
              {workFiles.map((url, i) => (
                <WorkFileThumbnail
                  key={url}
                  onRemove={updateWorkFilesMutation.isPending ? undefined : () => {
                    const next = workFiles.filter((_, idx) => idx !== i);
                    workFilesRef.current = next;
                    updateWorkFilesMutation.mutate(next);
                  }}
                  url={url}
                />
              ))}
              <CloudinaryUpload
                className={`text-foreground/50 ${workFiles.length === 0 ? "text-md flex items-center gap-1.5 py-1.5 underline-offset-2 hover:underline" : "squircle flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary transition hover:bg-secondary/50"}`}
                cloudName={cloudName}
                folder="uzzina/work"
                multiple
                onUpload={handleUpload}
                outputWidth={1200}
                resourceType="auto"
                uploadPreset={uploadPreset}
              >
                {workFiles.length === 0 && <span>Adicionar arquivo</span>}
                <PlusIcon className="size-4 shrink-0" />
              </CloudinaryUpload>
            </div>
          </div>

          {updateWorkFilesMutation.isPending && <p role="status">Salvando anexos...</p>}
          {updateWorkFilesMutation.isError && <p role="alert">Não foi possível salvar os anexos. A lista mostra os arquivos confirmados.</p>}
          {/* Comentários */}

          <div className="flex flex-col gap-4">
            <div className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Observações ({comments.length})
            </div>

            <div className="mb-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
              {isLoadingComments ? <p>Carregando observações...</p> : commentsError ? <div role="alert">
                <p>Não foi possível carregar as observações.</p>
                <PrismButton onClick={() => refetchComments()}>Tentar novamente</PrismButton>
              </div> : <CommentList
                comments={comments}
                currentUserId={clientId}
                emptyMessage="Nenhuma observação ainda."
                isUser={false}
                onDelete={(commentId) => {
                  if (
                    confirm("Tem certeza que deseja excluir esta observação?")
                  ) {
                    deleteCommentMutation.mutate(commentId);
                  }
                }}
                onUpdate={(commentId, content) => {
                  return updateCommentMutation.mutateAsync({
                    commentId,
                    content,
                  });
                }}
              />}
            </div>

            {createCommentMutation.isError && <p role="alert">Não foi possível salvar a observação. Seu texto foi mantido.</p>}
            {updateCommentMutation.isError && <p role="alert">Não foi possível salvar a alteração.</p>}
            {deleteCommentMutation.isError && <p role="alert">Não foi possível excluir a observação.</p>}
            {/* Formulário de novo comentário */}
            <div className="border-t pt-4">
              <CommentInput
                isSubmitting={createCommentMutation.isPending}
                onChange={setNewComment}
                onSend={(content) => {
                  if (!content.trim() || createCommentMutation.isPending) return;
                  createCommentMutation.mutate(content);
                }}
                value={newComment}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
