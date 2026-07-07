import type { Notification } from "~/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "~/lib/query-keys";
import { useAppContext } from "~/contexts/AppContext";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "~/models/notifications";

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export function useNotifications() {
  const { person } = useAppContext();
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();

  // Query das notificações com cache e polling
  const { data, isLoading, error } = useQuery<NotificationsResponse>({
    queryKey: QUERY_KEYS.notifications(),
    queryFn: async (): Promise<NotificationsResponse> => {
      const [notifications, unreadCount] = await Promise.all([
        listNotifications(supabase, person.user_id),
        getUnreadCount(supabase, person.user_id),
      ]);
      return { notifications, unreadCount };
    },
    refetchInterval: 60_000, // Polling a cada 60 segundos
    refetchOnWindowFocus: true,
  });

  // Mutação para marcar notificações específicas como lidas
  const markReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      await markAsRead(supabase, notificationIds, person.user_id);
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
      await markAllAsRead(supabase, person.user_id);
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
