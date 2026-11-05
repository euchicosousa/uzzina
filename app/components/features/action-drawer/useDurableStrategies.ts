import { useCallback, useEffect, useRef, useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { getQuerySessionGeneration } from "~/lib/query-client";
import {
  strategyOperationMessage,
  type StrategyOperation,
} from "~/lib/strategy-operation-contract";
import {
  acceptStrategyOperation,
  readStrategyOperation,
  retryStrategyResult,
  strategyCapability,
  StrategyRequestError,
} from "~/services/strategy-operations-client";
import type { Action } from "~/types";

const pendingStates = new Set<StrategyOperation["state"]>([
  "queued",
  "generating",
  "generated",
]);
const usageObservableStates = new Set<StrategyOperation["state"]>([
  "generated",
  "succeeded",
  "failed",
  "conflict",
  "uncertain",
]);

/** Server work survives this hook. The hook only observes the current action/session. */
export function useDurableStrategies({
  actionId,
  isActive,
  queryClient,
  prepareAction,
  onComplete,
}: {
  actionId: string | undefined;
  isActive: boolean;
  queryClient: QueryClient;
  prepareAction: () => Promise<Action | null>;
  onComplete: () => void;
}) {
  const [operation, setOperation] = useState<StrategyOperation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [reconciled, setReconciled] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const mounted = useRef(false);
  const identity = useRef(0);
  const busy = useRef(false);
  const completed = useRef(new Set<string>());
  const usageObserved = useRef(new Set<string>());
  const pendingRequest = useRef<{
    id: string;
    actionId: string;
    version: string;
  } | null>(null);
  const callbacks = useRef({ prepareAction, onComplete });
  callbacks.current = { prepareAction, onComplete };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      identity.current++;
    };
  }, []);
  const latestRefresh = useRef(refreshVersion);
  latestRefresh.current = refreshVersion;
  const capture = useCallback(() => {
    const opening = identity.current;
    const session = getQuerySessionGeneration(queryClient);
    return () =>
      mounted.current &&
      opening === identity.current &&
      session === getQuerySessionGeneration(queryClient);
  }, [queryClient]);
  const observe = useCallback(
    (next: StrategyOperation | null) => {
      if (next && next.id === pendingRequest.current?.id) {
        pendingRequest.current = null;
        setReconciled(true);
      }
      if (next?.state === "generated" || next?.state === "succeeded")
        setNeedsReview(false);
      setOperation(next);
      setError(next ? strategyOperationMessage(next) : null);
      if (next && usageObservableStates.has(next.state)) {
        const usageKey = `${next.id}:${next.state}`;
        if (!usageObserved.current.has(usageKey)) {
          usageObserved.current.add(usageKey);
          void queryClient.invalidateQueries({ queryKey: ["ai-usage"] });
        }
      }
      if (next?.state === "succeeded" && !completed.current.has(next.id)) {
        completed.current.add(next.id);
        callbacks.current.onComplete();
      }
    },
    [queryClient],
  );
  useEffect(() => {
    if (!actionId || !isActive) return;
    const revision = refreshVersion;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let reads = 0;
    const isCurrent = capture();
    const read = async () => {
      if (
        disposed ||
        revision !== latestRefresh.current ||
        !isCurrent() ||
        document.hidden
      )
        return;
      try {
        const next = await readStrategyOperation(actionId);
        if (disposed || revision !== latestRefresh.current || !isCurrent())
          return;
        observe(next);
        if (next && pendingStates.has(next.state) && ++reads < 150)
          timer = setTimeout(read, 2000);
      } catch (failure) {
        if (!disposed && isCurrent())
          setError(
            failure instanceof Error
              ? failure.message
              : "Não foi possível conferir a geração. Reabra a ação.",
          );
      }
    };
    const resume = () => {
      if (!document.hidden) {
        clearTimeout(timer);
        reads = 0;
        void read();
      }
    };
    void read();
    document.addEventListener("visibilitychange", resume);
    return () => {
      disposed = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [actionId, isActive, refreshVersion, capture, observe]);

  const start = async (): Promise<boolean> => {
    if (busy.current) return true;
    const isCurrent = capture();
    busy.current = true;
    setReconciled(false);
    try {
      const capability = await strategyCapability();
      if (!isCurrent()) return true;
      if (!capability.configured || !capability.ready)
        throw new Error(
          "A geração persistente está temporariamente indisponível. A operação existente continua no servidor; confira novamente em instantes.",
        );
      const saved = await callbacks.current.prepareAction();
      if (!isCurrent()) return true;
      if (!saved?.id || !saved.updated_at)
        throw new Error(
          "Salve a ação e resolva os conflitos antes de gerar estratégias.",
        );
      const current = await readStrategyOperation(saved.id);
      if (!isCurrent()) return true;
      if (current && pendingStates.has(current.state)) {
        pendingRequest.current = null;
        setReconciled(true);
        observe(current);
        setRefreshVersion((value) => value + 1);
        return true;
      }
      // An ambiguous HTTP response reuses this exact identity; it never falls back to callAI.
      const request = pendingRequest.current ?? {
        id: crypto.randomUUID(),
        actionId: saved.id,
        version: saved.updated_at,
      };
      request.version = saved.updated_at;
      pendingRequest.current = request;
      const accepted = await acceptStrategyOperation(
        request.actionId,
        request.id,
        request.version,
      );
      if (!isCurrent()) return true;
      if (!accepted)
        throw new Error(
          "Não foi possível confirmar a aceitação. Confira a ação antes de tentar novamente.",
        );
      pendingRequest.current = null;
      setReconciled(true);
      observe(accepted);
      setRefreshVersion((value) => value + 1);
      return true;
    } catch (failure) {
      if (
        failure instanceof StrategyRequestError &&
        failure.status >= 400 &&
        failure.status < 500
      )
        pendingRequest.current = null;
      throw failure;
    } finally {
      busy.current = false;
    }
  };
  const retry = async (confirmChangedSource = false) => {
    if (!operation?.result || busy.current) return;
    const isCurrent = capture();
    busy.current = true;
    try {
      const saved = await callbacks.current.prepareAction();
      if (!isCurrent() || !saved?.id || !saved.updated_at) return;
      const next = await retryStrategyResult(
        saved.id,
        operation.id,
        saved.updated_at,
        confirmChangedSource,
      );
      if (!isCurrent()) return;
      observe(next);
      setRefreshVersion((value) => value + 1);
    } catch (failure) {
      if (isCurrent()) {
        if (failure instanceof StrategyRequestError && failure.status === 409)
          setNeedsReview(true);
        setError(
          failure instanceof Error
            ? failure.message
            : "Não foi possível aplicar o resultado preservado.",
        );
      }
    } finally {
      busy.current = false;
    }
  };
  return {
    operation,
    error,
    reconciled,
    needsReview,
    start,
    retry,
    pending: !!operation && pendingStates.has(operation.state),
    refresh: () => setRefreshVersion((value) => value + 1),
  };
}
