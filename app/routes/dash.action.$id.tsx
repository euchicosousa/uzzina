import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeftIcon, SendIcon } from "lucide-react";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { Button } from "~/components/ui/button";
import { STATES, type STATE } from "~/lib/CONSTANTS";
import {
  createComment,
  getCommentsByAction,
} from "~/models/action_comments.server";
import { getClientSession } from "~/services/client-auth.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase, clientName, userId } = await getClientSession(request);
  const { id } = params;

  const [{ data: action }, comments] = await Promise.all([
    supabase.from("actions").select("*").eq("id", id!).single(),
    getCommentsByAction(supabase, id!),
  ]);

  if (!action) throw new Response("Ação não encontrada", { status: 404 });

  return { action, comments, clientName, userId };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { supabase, clientName, userId } = await getClientSession(request);
  const formData = await request.formData();
  const content = (formData.get("content") as string)?.trim();

  if (!content) return { error: "Escreva um comentário antes de enviar." };

  await createComment(supabase, {
    action_id: params.id!,
    author_id: userId,
    author_name: clientName,
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

  const state = STATES[action.state as STATE];

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden p-4">
      {/* Voltar */}
      <Link
        to="/dash/home"
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="size-4" />
        Voltar ao calendário
      </Link>

      {/* Detalhes da ação */}
      <div className="mb-6 rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold leading-snug">{action.title}</h1>
          <span
            className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: state?.color + "22",
              color: state?.color,
            }}
          >
            {state?.title ?? action.state}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">
              Data
            </div>
            <div className="font-medium">
              {format(parseISO(action.date), "d 'de' MMMM 'às' HH:mm", {
                locale: ptBR,
              })}
            </div>
          </div>

          {action.category && (
            <div>
              <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">
                Categoria
              </div>
              <div className="font-medium capitalize">{action.category}</div>
            </div>
          )}
        </div>

        {action.description && (
          <div>
            <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">
              Descrição
            </div>
            <p className="text-sm leading-relaxed">{action.description}</p>
          </div>
        )}
      </div>

      {/* Comentários */}
      <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Comentários ({comments.length})
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto space-y-3 mb-4">
        {comments.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{comment.author_name}</span>
              <span className="text-muted-foreground text-xs">
                {comment.created_at
                  ? format(parseISO(comment.created_at), "d MMM 'às' HH:mm", {
                      locale: ptBR,
                    })
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
          <p className="text-sm text-destructive">{(actionData as any).error}</p>
        )}
        <textarea
          name="content"
          placeholder="Escreva seu comentário..."
          rows={3}
          required
          className="w-full rounded-xl border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="squircle rounded-2xl gap-2"
          >
            <SendIcon className="size-4" />
            {isSubmitting ? "Enviando..." : "Comentar"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
