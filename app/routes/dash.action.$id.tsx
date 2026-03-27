import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useRouteLoaderData,
  useSubmit,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { CommentInput } from "~/components/features/ActionComments/CommentInput";
import { CommentList } from "~/components/features/ActionComments/CommentList";
import { WorkFileThumbnail } from "~/components/features/ActionForm/WorkFileThumbnail";
import { StateIcon } from "~/components/features/StateIcon";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { InstagramPreview } from "~/components/uzzina/InstagramPreview";
import { CATEGORIES, STATES, type CATEGORY, type STATE } from "~/lib/CONSTANTS";
import { Icons } from "~/lib/helpers";
import {
  createComment,
  deleteComment,
  getCommentsByAction,
  updateComment,
} from "~/models/action_comments.server";
import { getClientSession } from "~/services/client-auth.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const {
    supabase,
    name: clientName,
    id: clientId,
  } = await getClientSession(request);
  const { id } = params;

  const [{ data: action }, comments] = await Promise.all([
    supabase.from("actions").select("*").eq("id", id!).single(),
    getCommentsByAction(supabase, id!),
  ]);

  if (!action) throw new Response("Ação não encontrada", { status: 404 });

  return { action, comments, clientName, clientId };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const {
    supabase,
    name: clientName,
    id: clientId,
  } = await getClientSession(request);
  const formData = await request.formData();

  const workFilesRaw = formData.get("work_files");
  if (workFilesRaw) {
    const work_files = JSON.parse(workFilesRaw as string);
    const { error } = await supabase
      .from("actions")
      .update({ work_files })
      .eq("id", params.id!);
    if (error) return { error: error.message };
    return { error: null };
  }

  const intent = formData.get("intent") as string;

  if (intent === "edit_comment") {
    const commentId = formData.get("commentId") as string;
    const content = (formData.get("content") as string)?.trim();
    if (!content) return { error: "O comentário não pode estar vazio." };

    try {
      await updateComment(supabase, commentId, content, clientId, false);
      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  if (intent === "delete_comment") {
    const commentId = formData.get("commentId") as string;
    try {
      await deleteComment(supabase, commentId, clientId, false);
      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  const content = (formData.get("content") as string)?.trim();
  if (!content) return { error: "Escreva um comentário antes de enviar." };

  await createComment(supabase, {
    action_id: params.id!,
    author_id: clientId,
    author_name: clientName || "Cliente",
    content,
    is_internal: false,
    is_user: false,
  });

  return { error: null };
};

export default function DashActionDetail() {
  const { action, comments, clientId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const submit = useSubmit();

  const [newComment, setNewComment] = useState("");
  const appData = useRouteLoaderData("routes/dash") as any;

  const [workFiles, setWorkFiles] = useState<string[]>(action.work_files || []);
  const workFilesRef = useRef(workFiles);
  workFilesRef.current = workFiles;

  const workFilesMetaRef = useRef<
    Record<string, { name: string; addedAt: number }>
  >({});

  const currentState = useMemo(
    () => STATES[action.state as STATE],
    [action.state],
  );
  const currentCategory = useMemo(
    () => CATEGORIES[action.category as CATEGORY],
    [action.category],
  );

  const partners = (appData?.partners || []) as any[];
  const actionPartner =
    partners.find((p: any) => action.partners?.includes(p.slug)) || partners[0];
  const brandColor = actionPartner?.colors?.[0] || action.color;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Voltar */}
      <Link
        to="/dash"
        className="text-muted-foreground hover:text-foreground flex items-center gap-2 p-4 text-sm transition-colors"
      >
        <ArrowLeftIcon className="size-4" />
        Voltar ao calendário
      </Link>
      <div className="w-full overflow-y-auto p-4 pt-0">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          <h1 className="font-inter p-0 leading-none font-semibold">
            {action.title}
          </h1>
          {/* Mídias do Post */}
          <div className="mx-auto w-full sm:max-w-sm">
            <InstagramPreview files={action.content_files} />
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                Data de publicar
              </div>
              <div className="font-medium">
                {format(parseISO(action.date), "d 'de' MMMM 'às' HH:mm", {
                  locale: ptBR,
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                Categoria
              </div>
              <div className="flex items-center gap-1 font-medium capitalize">
                <Icons
                  slug={currentCategory.slug}
                  className="size-4"
                  style={{ color: currentCategory.color }}
                />
                <span>{action.category}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                Status
              </div>
              <div className="flex items-center gap-2">
                <StateIcon state={currentState} />
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: currentState?.color + "22",
                    color: currentState?.color,
                  }}
                >
                  {currentState?.title ?? action.state}
                </span>
              </div>
            </div>
          </div>
          {action.description && (
            <div>
              <div className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                Descrição
              </div>
              <div
                className="bg-card rounded-xl border p-4"
                dangerouslySetInnerHTML={{
                  __html: action.description,
                }}
              />
            </div>
          )}
          {/* Legenda */}

          <div className="mb-8 space-y-3">
            <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Legenda
            </div>
            <div className="min-h-[200px] w-full resize-none whitespace-pre-wrap">
              {action.instagram_caption}
            </div>
          </div>

          {/* Anexos (Work Files) do Cliente */}
          <div className="mb-8 space-y-3">
            <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Seus Anexos e Materiais
            </div>
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl">
              {workFiles.map((url, i) => (
                <WorkFileThumbnail
                  key={url + i}
                  url={url}
                  onRemove={() => {
                    const next = workFiles.filter((_, idx) => idx !== i);
                    setWorkFiles(next);
                    submit(
                      { work_files: JSON.stringify(next) },
                      { method: "post" },
                    );
                  }}
                />
              ))}
              <CloudinaryUpload
                cloudName={appData.cloudName}
                uploadPreset={appData.uploadPreset}
                folder="uzzina/work"
                resourceType="auto"
                multiple
                outputWidth={1200}
                onUpload={(url: string, meta: any) => {
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
                  submit(
                    { work_files: JSON.stringify(next) },
                    { method: "post" },
                  );
                }}
                className={`text-foreground/50 ${
                  workFiles.length === 0
                    ? "text-md flex items-center gap-1.5 py-1.5 underline-offset-2 hover:underline"
                    : "squircle bg-secondary hover:bg-secondary/50 flex size-10 shrink-0 items-center justify-center rounded-xl transition"
                }`}
              >
                {workFiles.length === 0 && <span>Adicionar arquivo</span>}
                <PlusIcon className="size-4 shrink-0" />
              </CloudinaryUpload>
            </div>
          </div>

          {/* Comentários */}

          <div className="flex flex-col gap-4">
            <div className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
              Observações ({comments.length})
            </div>

            <div className="mb-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
              <CommentList
                comments={comments}
                currentUserId={clientId}
                isUser={false}
                brandColor={brandColor}
                brandTextColor={actionPartner?.colors?.[1]}
                onUpdate={(commentId, content) => {
                  submit(
                    {
                      intent: "edit_comment",
                      commentId,
                      content,
                    },
                    { method: "post" },
                  );
                }}
                onDelete={(commentId) => {
                  if (
                    confirm("Tem certeza que deseja excluir esta observação?")
                  ) {
                    submit(
                      {
                        intent: "delete_comment",
                        commentId,
                      },
                      { method: "post" },
                    );
                  }
                }}
                emptyMessage="Nenhuma observação ainda."
              />
            </div>

            {/* Formulário de novo comentário */}
            <div className="border-t pt-4">
              {(actionData as any)?.error && (
                <p className="text-destructive mb-2 text-sm">
                  {(actionData as any).error}
                </p>
              )}
              <CommentInput
                value={newComment}
                onChange={setNewComment}
                onSend={() => {
                  if (!newComment.trim()) return;
                  submit(
                    {
                      content: newComment,
                    },
                    { method: "post" },
                  );
                  setNewComment("");
                }}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
