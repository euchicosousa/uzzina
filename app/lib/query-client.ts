import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Dados considerados stale imediatamente, forçando verificação ao navegar/refocar
      gcTime: 5 * 60 * 1000, // Mantém dados inativos por 5 minutos antes do garbage collection
      retry: 1, // Apenas uma tentativa extra em caso de falha de rede
      refetchOnWindowFocus: true, // Atualiza se o usuário mudar de aba e voltar
    },
  },
});

// A cache reset also invalidates callbacks of writes that cannot be cancelled.
const sessionGenerations = new WeakMap<QueryClient, number>();
export function getQuerySessionGeneration(client: QueryClient): number {
  return sessionGenerations.get(client) ?? 0;
}
export function resetQuerySession(client: QueryClient): void {
  sessionGenerations.set(client, getQuerySessionGeneration(client) + 1);
  client.clear();
}
