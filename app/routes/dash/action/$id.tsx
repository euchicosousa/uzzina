import { format } from "date-fns";
import { parseU } from "~/utils/date";
import { ptBR } from "date-fns/locale";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { CommentInput } from "~/components/features/ActionComments/CommentInput";
import { CommentList } from "~/components/features/ActionComments/CommentList";
import { WorkFileThumbnail } from "~/components/features/media/WorkFileThumbnail";
import { PhaseIcon } from "~/components/features/PhaseIcon";
import { CloudinaryUpload } from "~/components/features/media/CloudinaryUpload";
import { InstagramPreview } from "~/components/features/media/InstagramPreview";
import { CATEGORIES, PHASES, type CATEGORY, type PHASE } from "~/lib/CONSTANTS";
import { Icons } from "~/lib/helpers";
import {
  createComment,
  deleteComment,
  getCommentsByAction,
  updateComment,
} from "~/models/action_comments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDashContext } from "~/contexts/DashContext";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { toast } from "sonner";
export const Route = createFileRoute("/dash/action/$id")({
  component: DashActionDetail,
});
function DashActionDetail() {
  const { id: actionId } = Route.useParams();
  const {
    name: clientName,
    clientId,
    cloudName,
    uploadPreset,
  } = useDashContext();
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const _navigate = useNavigate();

  // Query para a Ação
  const { data: action, isLoading: isLoadingAction } = useQuery({
    queryKey: ["action", actionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("actions")
        .select("*")
        .eq("id", actionId || "")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!actionId,
  });

  // Query para os Comentários
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", actionId],
    queryFn: () => getCommentsByAction(supabase, actionId || ""),
    enabled: !!actionId,
  });

  // Mutação para Atualizar arquivos anexos (work_files)
  const updateWorkFilesMutation = useMutation({
    mutationFn: async (work_files: string[]) => {
      const { error } = await supabase
        .from("actions")
        .update({
          work_files,
        })
        .eq("id", actionId || "");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["action", actionId],
      });
      toast.success("Arquivos atualizados com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao salvar arquivos:", error);
      toast.error("Não foi possível salvar os arquivos.");
    },
  });

  // Mutações de Comentários
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      await createComment(supabase, {
        action_id: actionId || "",
        author_id: clientId,
        author_name: clientName || "Cliente",
        content,
        is_internal: false,
        is_user: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", actionId],
      });
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
      await updateComment(supabase, commentId, content, clientId, false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", actionId],
      });
    },
    onError: (error) => {
      console.error("Erro ao editar comentário:", error);
      toast.error("Não foi possível salvar a alteração.");
    },
  });
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await deleteComment(supabase, commentId, clientId, false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", actionId],
      });
    },
    onError: (error) => {
      console.error("Erro ao deletar comentário:", error);
      toast.error("Não foi possível excluir o comentário.");
    },
  });
  const [newComment, setNewComment] = useState("");
  const [workFiles, setWorkFiles] = useState<string[]>([]);

  // Sincroniza workFiles locais quando a action carregar
  useEffect(() => {
    if (action?.work_files) {
      setWorkFiles(action.work_files);
    }
  }, [action?.work_files]);
  const workFilesRef = useRef(workFiles);
  workFilesRef.current = workFiles;
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
    setWorkFiles(next);
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
  if (isLoadingAction || !action) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Carregando detalhes...
        </p>
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
                // biome-ignore lint/security/noDangerouslySetInnerHtml: safe rich text description from admin editor
                dangerouslySetInnerHTML={{
                  __html: action.description,
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
                  onRemove={() => {
                    const next = workFiles.filter((_, idx) => idx !== i);
                    setWorkFiles(next);
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

          {/* Comentários */}

          <div className="flex flex-col gap-4">
            <div className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Observações ({comments.length})
            </div>

            <div className="mb-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
              <CommentList
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
                  updateCommentMutation.mutate({
                    commentId,
                    content,
                  });
                }}
              />
            </div>

            {/* Formulário de novo comentário */}
            <div className="border-t pt-4">
              <CommentInput
                isSubmitting={createCommentMutation.isPending}
                onChange={setNewComment}
                onSend={() => {
                  if (!newComment.trim()) return;
                  createCommentMutation.mutate(newComment);
                  setNewComment("");
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
