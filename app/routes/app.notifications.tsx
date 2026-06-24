import type { Action, Notification } from "~/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeftIcon, BellIcon, CheckCheckIcon } from "lucide-react";
import { Link, useNavigate, useOutletContext, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useNotifications } from "~/hooks/useNotifications";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { cn } from "~/lib/utils";
import { getUserId } from "~/services/auth.server";
import { listNotifications, getUnreadCount } from "~/models/notifications.server";


export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, user_id } = await getUserId(request);
  const [notifications, unreadCount] = await Promise.all([
    listNotifications(supabase, user_id),
    getUnreadCount(supabase, user_id),
  ]);
  return { initialNotifications: notifications, initialUnreadCount: unreadCount };
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { initialNotifications, initialUnreadCount } = useLoaderData<typeof loader>();
  const { notifications: activeNotifications, unreadCount: activeUnreadCount, markAsRead, markAllAsRead, isLoading } =
    useNotifications();
  const { setBaseAction } = useOutletContext<{
    setBaseAction: (action: Action | null) => void;
  }>();

  const notifications = activeNotifications.length > 0 || isLoading ? activeNotifications : initialNotifications;
  const unreadCount = activeNotifications.length > 0 || isLoading ? activeUnreadCount : initialUnreadCount;

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read_at) {
      markAsRead([notif.id]);
    }
    try {
      if (!notif.action_id) return;
      const supabase = createSupabaseBrowserClient();
      const { data: actionData, error } = await supabase
        .from("actions")
        .select("*")
        .eq("id", notif.action_id)
        .single();
      if (error) throw error;
      if (actionData) {
        setBaseAction(actionData as Action);
        navigate("/app");
      }
    } catch (err) {
      console.error("Erro ao carregar ação:", err);
      toast.error("Não foi possível abrir os detalhes desta ação.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      {/* Header com botão de voltar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeftIcon className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe menções e atualizações importantes de suas ações.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            className="squircle self-start rounded-xl sm:self-center"
          >
            <CheckCheckIcon className="mr-2 size-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Lista de Notificações */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">
            Carregando notificações...
          </span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-16 text-center">
          <div className="mb-4 rounded-full bg-primary/5 p-4 text-primary">
            <BellIcon className="size-8" />
          </div>
          <h3 className="text-lg font-semibold">Tudo limpo por aqui!</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Você não possui nenhuma notificação no momento. Quando alguém marcar
            você em um comentário de ação, ela aparecerá aqui.
          </p>
          <Link to="/app" className="mt-6">
            <Button className="squircle rounded-xl">Ir para o início</Button>
          </Link>
        </div>
      ) : (
        <div className="squircle overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
          <div className="divide-y divide-border">
            {notifications.map((notif) => {
              const formattedDate = notif.created_at
                ? format(parseISO(notif.created_at), "d 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })
                : "";

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "relative flex cursor-pointer flex-col gap-2 p-6 text-left transition hover:bg-muted/30",
                    !notif.read_at && "bg-primary/5 hover:bg-primary/10",
                  )}
                >
                  {/* Linha indicadora de não lida */}
                  {!notif.read_at && (
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />
                  )}

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {notif.author_name} mencionou você
                      </span>
                      {!notif.read_at && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          Nova
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {formattedDate}
                    </span>
                  </div>

                  <span className="text-xs font-medium text-muted-foreground">
                    na ação:{" "}
                    <span className="font-semibold text-foreground">
                      {notif.action_title}
                    </span>
                  </span>

                  <blockquote className="mt-1 max-w-3xl rounded-r-lg border-l-2 border-border bg-muted/20 py-1.5 pl-4 text-sm text-foreground/80 italic">
                    {notif.comment_excerpt ? notif.comment_excerpt.replace(/<[^>]*>/g, "") : ""}
                  </blockquote>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
