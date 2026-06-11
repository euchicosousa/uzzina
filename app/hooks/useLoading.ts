import { useQueryClient, useIsFetching } from "@tanstack/react-query";

/**
 * Hook utilitário para checar se alguma query com determinada chave está em andamento (loading/fetching)
 * e ainda não possui dados com status "success" no cache (evita mostrar loading/skeleton durante background refetches).
 *
 * @param queryKey A chave da query para monitorar (ex: ["actions"])
 * @returns boolean true se estiver no carregamento inicial
 */
export function useLoading(queryKey: readonly unknown[]): boolean {
  const queryClient = useQueryClient();
  const fetchingCount = useIsFetching({ queryKey });

  const queries = queryClient.getQueryCache().findAll({ queryKey });
  const hasSuccessfulData = queries.some(
    (query) => query.state.status === "success"
  );

  return fetchingCount > 0 && !hasSuccessfulData;
}
