import { useEffect, useRef, useState } from "react";
import type { ThemePlanningRequest } from "~/lib/social-planning/theme-contract";
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

type GenerationState = {
  scope: string;
  requestId: string | null;
  message?: string;
  error?: boolean;
};

export function useThemePlanningGeneration(userId: string, partner: string) {
  const scope = `uzzina-planning-theme:${JSON.stringify([userId, partner])}`;
  const [state, setState] = useState<GenerationState | null>(null);
  const activeScope = useRef<string | null>(scope);
  const activeRequests = useRef(new Set<string>());
  const current = state?.scope === scope ? state : null;
  const requestId = current ? current.requestId : pendingRequest(scope);
  const isBusy = activeRequests.current.has(scope);

  useEffect(() => {
    activeScope.current = scope;
    return () => {
      activeScope.current = null;
    };
  }, [scope]);

  const run = async (
    request: ThemePlanningRequest,
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
    setState({ scope, requestId: request.requestId });

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
      const response = await fetch("/api/planning-theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(request),
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
        result.proposal.mode === "theme" &&
        result.proposal.partner_slug === partner &&
        result.proposal.user_id === userId
      ) {
        finish(null);
        if (activeScope.current === scope) onComplete(result.proposal);
        return;
      }
      if (
        response.status === 202 &&
        "state" in result &&
        result.state === "running"
      ) {
        finish(request.requestId, "A geração ainda está em andamento.");
        return;
      }
      const message =
        "error" in result && typeof result.error === "string"
          ? result.error
          : unknownResult;
      const terminal = "state" in result && result.state === "failed";
      finish(terminal ? null : request.requestId, message, true);
    } catch {
      finish(request.requestId, unknownResult, true);
    }
  };

  return {
    requestId,
    isBusy,
    message: current?.message,
    isError: current?.error,
    run,
  };
}
