import { useIsFetching } from "@tanstack/react-query";

/**
 * Hook utilitário para checar se alguma query com determinada chave está em andamento (loading/fetching).
 * Evita prop drilling de estados de loading do React Query.
 *
 * @param queryKey A chave da query para monitorar (ex: ["actions"])
 * @returns boolean true se estiver carregando/buscando
 */
export function useLoading(queryKey: readonly unknown[]): boolean {
  const fetchingCount = useIsFetching({ queryKey });
  return fetchingCount > 0;
}
