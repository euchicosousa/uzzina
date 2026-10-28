import { getQuerySessionGeneration } from "~/lib/query-client";
import { useRef } from "react";
import type { Notification } from "~/types";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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

const DEFAULT_LIMIT = 40;

export function useNotifications(limit = DEFAULT_LIMIT) {
  const { person } = useAppContext();
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const generation = useRef(getQuerySessionGeneration(queryClient)).current;
  const isCurrentSession = () =>
    generation === getQuerySessionGeneration(queryClient);

  // Query das notificações com cache e polling
  const { data, isLoading, error, refetch } = useQuery<NotificationsResponse>({
    // The limit is the last key segment so the user prefix still invalidates every size.
    queryKey: [...QUERY_KEYS.notifications(person.user_id), limit],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<NotificationsResponse> => {
      const [notifications, unreadCount] = await Promise.all([
        listNotifications(supabase, person.user_id, limit),
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
      if (!isCurrentSession()) return;
      // Invalida a query de notificações para recarregar da API
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notifications(person.user_id),
      });
    },
    onError: (err: unknown) => {
      if (!isCurrentSession()) return;
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
      if (!isCurrentSession()) return;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notifications(person.user_id),
      });
      toast.success("Todas as notificações foram marcadas como lidas");
    },
    onError: (err: unknown) => {
      if (!isCurrentSession()) return;
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Não foi possível marcar todas como lidas: ${msg}`);
    },
  });

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    error,
    refetch,
    markAsRead: (notificationIds: string[]) =>
      markReadMutation.mutate(notificationIds),
    isMarkingRead: markReadMutation.isPending,
    markAllAsRead: () => markAllReadMutation.mutate(),
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
