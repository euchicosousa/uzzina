import { useEffect, useRef, useState } from "react";
import { PLANNING_PERIOD_BATCH_SIZE } from "~/lib/social-planning/period-plan";
import type { PlanningGenerationRequest } from "~/lib/social-planning/theme-contract";
import type { SocialPlan } from "~/lib/social-planning/types";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { isSocialPlan } from "~/models/social_plans";

const unknownResult =
  "Não foi possível confirmar a geração. Use Verificar proposta para recuperar o resultado.";

function pendingRequest(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function rememberRequest(key: string, requestId: string | null) {
  try {
    if (requestId) localStorage.setItem(key, requestId);
    else localStorage.removeItem(key);
  } catch {
    // The current tab can still track the request in component state.
  }
}

const DEFAULT_BATCH_MS = 60_000;
const MIN_BATCH_MS = 5_000;
const MAX_BATCH_MS = 180_000;
const TICK_MS = 250;

/**
 * Fraction (0 to <1) of the running batch assumed done: eases to ~90% at the
 * expected duration, then creeps toward 99% so it never reaches the next
 * real value.
 */
function estimateBatchFraction(elapsedMs: number, durationMs: number) {
  const ratio = elapsedMs / durationMs;
  if (ratio <= 1) return 0.9 * (1 - (1 - ratio) ** 2.2);
  return 0.9 + 0.09 * (1 - Math.exp(-(ratio - 1)));
}

type GenerationState = {
  scope: string;
  requestId: string | null;
  message?: string;
  error?: boolean;
  /** Suggestions already generated (period mode only). */
  progress?: number;
  /** Suggestions requested by the running generation, when known. */
  total?: number;
  /** Running batch (period mode): start time, size and expected duration. */
  batch?: { startedAt: number; length: number; durationMs: number };
};

function nextBatch(
  progress: number,
  total: number,
  durationMs: number,
): NonNullable<GenerationState["batch"]> {
  return {
    startedAt: Date.now(),
    length: Math.min(PLANNING_PERIOD_BATCH_SIZE, total - progress),
    durationMs,
  };
}

export function usePlanningGeneration(userId: string, partner: string) {
  const scope = `uzzina-planning-theme:${JSON.stringify([userId, partner])}`;
  const [state, setState] = useState<GenerationState | null>(null);
  const activeScope = useRef<string | null>(scope);
  const activeRequests = useRef(new Set<string>());
  const current = state?.scope === scope ? state : null;
  const requestId = current ? current.requestId : pendingRequest(scope);
  const isBusy = activeRequests.current.has(scope);
  const [, setTick] = useState(0);
  const hasBatch = isBusy && current?.batch !== undefined;

  useEffect(() => {
    if (!hasBatch) return;
    const timer = setInterval(() => setTick((tick) => tick + 1), TICK_MS);
    return () => clearInterval(timer);
  }, [hasBatch]);

  useEffect(() => {
    activeScope.current = scope;
    return () => {
      activeScope.current = null;
    };
  }, [scope]);

  const run = async (
    request: PlanningGenerationRequest,
    onComplete: (proposal: SocialPlan) => void,
  ) => {
    if (!partner || activeRequests.current.has(scope)) return;
    const pending = pendingRequest(scope);
    if (pending && pending !== request.requestId) {
      setState({ scope, requestId: pending });
      return;
    }
    activeRequests.current.add(scope);
    rememberRequest(scope, request.requestId);
    setState({
      scope,
      requestId: request.requestId,
      ...(request.intent === "start-period"
        ? {
            progress: 0,
            total: request.expectedSlots.length,
            batch: nextBatch(0, request.expectedSlots.length, DEFAULT_BATCH_MS),
          }
        : request.intent === "start"
          ? { total: request.formats.length }
          : {}),
    });

    const finish = (id: string | null, message?: string, error?: boolean) => {
      activeRequests.current.delete(scope);
      if (pendingRequest(scope) === request.requestId) {
        rememberRequest(scope, id);
      }
      if (activeScope.current === scope) {
        setState({ scope, requestId: id, message, error });
      }
    };

    try {
      const {
        data: { session },
      } = await createSupabaseBrowserClient().auth.getSession();
      if (session?.user.id !== userId || !session.access_token) {
        finish(
          request.requestId,
          "Entre novamente para verificar a proposta.",
          true,
        );
        return;
      }
      let command = request;
      let lastProgress = 0;
      let batchStartedAt = Date.now();
      let batchLength = Math.min(
        PLANNING_PERIOD_BATCH_SIZE,
        request.intent === "start-period" ? request.expectedSlots.length : 0,
      );
      for (;;) {
        const response = await fetch("/api/planning-theme", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(command),
        });
        const result: unknown = await response.json().catch(() => null);
        if (typeof result !== "object" || result === null) {
          finish(request.requestId, unknownResult, true);
          return;
        }
        if (
          response.ok &&
          "state" in result &&
          result.state === "completed" &&
          "proposal" in result &&
          isSocialPlan(result.proposal) &&
          result.proposal.partner_slug === partner &&
          result.proposal.user_id === userId
        ) {
          finish(null);
          if (activeScope.current === scope) onComplete(result.proposal);
          return;
        }
        if (response.status === 202 && "state" in result) {
          if (
            result.state === "queued" &&
            "progress" in result &&
            typeof result.progress === "number" &&
            "total" in result &&
            typeof result.total === "number" &&
            result.progress > lastProgress &&
            result.progress < result.total &&
            activeScope.current === scope
          ) {
            lastProgress = result.progress;
            // Calibrate the next batch from the one that just finished.
            const measured = Date.now() - batchStartedAt;
            const next = nextBatch(
              lastProgress,
              result.total,
              DEFAULT_BATCH_MS,
            );
            if (batchLength > 0) {
              next.durationMs = Math.min(
                MAX_BATCH_MS,
                Math.max(MIN_BATCH_MS, (measured / batchLength) * next.length),
              );
            }
            batchStartedAt = next.startedAt;
            batchLength = next.length;
            setState({
              scope,
              requestId: request.requestId,
              message: `${lastProgress} de ${result.total} sugestões geradas.`,
              progress: lastProgress,
              total: result.total,
              batch: next,
            });
            command = {
              intent: "resume",
              requestId: request.requestId,
              partner,
            };
            continue;
          }
          finish(
            request.requestId,
            "Use Verificar proposta para continuar de onde parou.",
          );
          return;
        }
        if (
          request.intent === "resume" &&
          response.status === 404 &&
          "state" in result &&
          result.state === "failed"
        ) {
          // The pending request no longer exists (for example it was deleted):
          // forget it and return to the normal "Gerar planejamento" state.
          finish(
            null,
            "A solicitação pendente não existe mais. Gere um novo planejamento.",
          );
          return;
        }
        const message =
          "error" in result && typeof result.error === "string"
            ? result.error
            : unknownResult;
        const terminal = "state" in result && result.state === "failed";
        finish(terminal ? null : request.requestId, message, true);
        return;
      }
    } catch {
      finish(request.requestId, unknownResult, true);
    }
  };

  const batch = isBusy ? current?.batch : undefined;
  const batchProgress =
    batch && current?.total && current.progress !== undefined
      ? {
          from: current.progress + 1,
          to: current.progress + batch.length,
          percent: Math.min(
            99,
            ((current.progress +
              batch.length *
                estimateBatchFraction(
                  Date.now() - batch.startedAt,
                  batch.durationMs,
                )) /
              current.total) *
              100,
          ),
        }
      : undefined;

  return {
    requestId,
    isBusy,
    batchProgress,
    message: current?.message,
    isError: current?.error,
    progress: current?.progress,
    total: current?.total,
    run,
  };
}
