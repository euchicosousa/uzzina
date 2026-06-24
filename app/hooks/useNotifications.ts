import type { Notification } from "~/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { INTENT } from "~/lib/CONSTANTS";
import { QUERY_KEYS } from "~/lib/query-keys";

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

// Fetcher das notificações e contagem
async function fetchNotifications(): Promise<NotificationsResponse> {
  const res = await fetch("/action/handle-notifications");
  if (!res.ok) {
    throw new Error("Falha ao buscar notificações");
  }
  return res.json();
}

export function useNotifications() {
  const queryClient = useQueryClient();

  // Query das notificações com cache e polling
  const { data, isLoading, error } = useQuery<NotificationsResponse>({
    queryKey: QUERY_KEYS.notifications(),
    queryFn: fetchNotifications,
    refetchInterval: 60_000, // Polling a cada 60 segundos
    refetchOnWindowFocus: true,
  });

  // Mutação para marcar notificações específicas como lidas
  const markReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const res = await fetch("/action/handle-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: INTENT.mark_notification_read,
          notificationIds,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao marcar notificação como lida");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalida a query de notificações para recarregar da API
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications() });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Não foi possível marcar como lida: ${msg}`);
    },
  });

  // Mutação para marcar todas as notificações do usuário como lidas
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/action/handle-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: INTENT.mark_all_notifications_read,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao marcar todas como lidas");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications() });
      toast.success("Todas as notificações foram marcadas como lidas");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Não foi possível marcar todas como lidas: ${msg}`);
    },
  });

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    error,
    markAsRead: (notificationIds: string[]) => markReadMutation.mutate(notificationIds),
    isMarkingRead: markReadMutation.isPending,
    markAllAsRead: () => markAllReadMutation.mutate(),
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
