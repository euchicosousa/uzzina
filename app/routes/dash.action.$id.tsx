import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeftIcon, SendIcon } from "lucide-react";
import { useMemo } from "react";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { StateIcon } from "~/components/features/StateIcon";
import { Button } from "~/components/ui/button";
import { InstagramPreview } from "~/components/uzzina/InstagramPreview";
import { CATEGORIES, STATES, type CATEGORY, type STATE } from "~/lib/CONSTANTS";
import { Icons } from "~/lib/helpers";
import {
  createComment,
  getCommentsByAction,
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
  const content = (formData.get("content") as string)?.trim();

  if (!content) return { error: "Escreva um comentário antes de enviar." };

  await createComment(supabase, {
    action_id: params.id!,
    author_id: clientId,
    author_name: clientName || "Cliente",
    content,
    is_internal: false,
  });

  return { error: null };
};

export default function DashActionDetail() {
  const { action, comments } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const currentState = useMemo(
    () => STATES[action.state as STATE],
    [action.state],
  );
  const currentCategory = useMemo(
    () => CATEGORIES[action.category as CATEGORY],
    [action.category],
  );

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
                {format(
                  parseISO(action.instagram_date),
                  "d 'de' MMMM 'às' HH:mm",
                  {
                    locale: ptBR,
                  },
                )}
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

          {/* Comentários */}
          {false && (
            <div className="flex flex-col gap-4 opacity-50" aria-disabled>
              <div className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
                Comentários ({comments.length})
              </div>
              <div className="mb-4 min-h-0 flex-1 space-y-3 overflow-y-auto">
                {(!comments || comments.length === 0) && (
                  <p className="text-muted-foreground text-sm">
                    Nenhum comentário ainda. Seja o primeiro a comentar!
                  </p>
                )}
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-card rounded-xl border p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {comment.author_name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {comment.created_at
                          ? format(
                              parseISO(comment.created_at),
                              "d MMM 'às' HH:mm",
                              {
                                locale: ptBR,
                              },
                            )
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>
              {/* Formulário de novo comentário */}
              <Form method="post" className="flex flex-col gap-2 border-t pt-4">
                {(actionData as any)?.error && (
                  <p className="text-destructive text-sm">
                    {(actionData as any).error}
                  </p>
                )}
                <textarea
                  name="content"
                  placeholder="Escreva seu comentário..."
                  rows={3}
                  required
                  disabled
                  className="bg-background focus:ring-ring w-full resize-none rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="squircle gap-2 rounded-2xl"
                  >
                    <SendIcon className="size-4" />
                    {isSubmitting ? "Enviando..." : "Comentar"}
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
