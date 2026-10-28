import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import { BellIcon, CheckIcon } from "lucide-react";
import { useRef, useState } from "react";
import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { PrismButton } from "~/components/prism";
import { useAppContext } from "~/contexts/AppContext";
import { useFillScrollViewport } from "~/hooks/useFillScrollViewport";
import { useNotifications } from "~/hooks/useNotifications";
import { getQuerySessionGeneration } from "~/lib/query-client";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { cn } from "~/lib/utils";
import { getActionById } from "~/models/actions";
import type { Notification } from "~/types";
import { notificationExcerptText } from "~/utils/sanitize";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

const PAGE_SIZE = 40;

function formatCreatedAt(value: string) {
  const date = new Date(value);
  return isValid(date) ? format(date, "HH'h'mm 'de' dd/MM/yyyy") : "";
}

export function NotificationsPage() {
  const { setPrimaryAction } = useAppContext();
  const queryClient = useQueryClient();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    isMarkingRead,
    markAllAsRead,
    isMarkingAllRead,
  } = useNotifications(limit);
  const pageRef = useRef<HTMLDivElement>(null);
  useFillScrollViewport(pageRef);

  const openAction = async (notification: Notification) => {
    const generation = getQuerySessionGeneration(queryClient);
    setUnavailable(null);
    if (!notification.read_at) markAsRead([notification.id]);
    try {
      const action = await getActionById(
        createSupabaseBrowserClient(),
        notification.action_id,
      );
      if (generation !== getQuerySessionGeneration(queryClient)) return;
      setPrimaryAction(action);
    } catch {
      if (generation !== getQuerySessionGeneration(queryClient)) return;
      setUnavailable(notification.id);
    }
  };

  // A full page means older records may exist; fewer rows than requested means the history ended.
  const mayHaveEarlier = notifications.length >= limit;

  return (
    <div
      ref={pageRef}
      className="relative mx-auto flex min-h-0 w-full max-w-3xl flex-col overflow-hidden"
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b px-4 py-4 lg:px-8 lg:py-6">
        <h1 className="text-3xl font-semibold lg:text-5xl">Notificações</h1>
        <PrismButton
          isDisabled={unreadCount === 0 || isMarkingAllRead}
          onPress={markAllAsRead}
          size="sm"
          variant="ghost"
        >
          Marcar todas como lidas
        </PrismButton>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {unavailable ? (
          <p
            className="border-b bg-error-background px-4 py-3 text-sm text-error lg:px-8"
            role="alert"
          >
            Esta ação não está disponível ou você não tem acesso a ela.
          </p>
        ) : null}
        {isLoading ? (
          <p
            className="p-8 text-center text-sm text-muted-foreground"
            role="status"
          >
            Carregando notificações…
          </p>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 p-8" role="alert">
            <p className="text-sm text-error">
              Não foi possível carregar as notificações.
            </p>
            <PrismButton onPress={() => refetch()} size="sm">
              Tentar novamente
            </PrismButton>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8 text-muted-foreground">
            <BellIcon className="size-6" />
            <p className="text-sm">Nenhuma notificação.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((notification) => {
              const unread = !notification.read_at;
              const excerpt = notificationExcerptText(
                notification.comment_excerpt,
              );
              return (
                <li
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-5 lg:px-8",
                    unread && "bg-card",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      unread ? "bg-primary" : "bg-transparent",
                    )}
                  />
                  <button
                    className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-md text-left outline-none focus-visible:bg-foreground/5"
                    onClick={() => openAction(notification)}
                    type="button"
                  >
                    {/* The excerpt is the notification; who/where/when is supporting context. */}
                    {excerpt ? (
                      <span
                        className={cn(
                          "line-clamp-3 text-base text-foreground",
                          unread ? "font-medium" : "text-foreground/70",
                        )}
                      >
                        {excerpt}
                      </span>
                    ) : (
                      <span className="text-base text-foreground/70 italic">
                        Você foi mencionado sem texto.
                      </span>
                    )}
                    <span className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground/80">
                        {notification.author_name}
                      </span>
                      <span aria-hidden="true">em</span>
                      <span className="sr-only"> mencionou você em </span>
                      <span className="font-semibold text-foreground/80">
                        {notification.action_title}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatCreatedAt(notification.created_at)}</span>
                      <span className="sr-only">
                        {unread ? "Não lida" : "Lida"}
                      </span>
                    </span>
                  </button>
                  {unread ? (
                    <PrismButton
                      aria-label={`Marcar como lida: ${notification.action_title}`}
                      isDisabled={isMarkingRead}
                      onPress={() => markAsRead([notification.id])}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <CheckIcon className="size-4" />
                    </PrismButton>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        {mayHaveEarlier && !isLoading && !error ? (
          <div className="flex justify-center p-4">
            <PrismButton
              onPress={() => setLimit((current) => current + PAGE_SIZE)}
              size="sm"
              variant="ghost"
            >
              Carregar anteriores
            </PrismButton>
          </div>
        ) : null}
        <AppBarSpacer />
      </div>
    </div>
  );
}
