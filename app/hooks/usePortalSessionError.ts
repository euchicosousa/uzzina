import { useQueryClient } from "@tanstack/react-query";
import { resetQuerySession } from "~/lib/query-client";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PortalHttpError } from "~/services/portal-http";

export function usePortalSessionError(error: unknown) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (error instanceof PortalHttpError && error.status === 401) {
      resetQuerySession(queryClient);
      void navigate({ to: "/dash/login", replace: true });
    }
  }, [error, navigate, queryClient]);
}

export function retryPortalQuery(failureCount: number, error: unknown) {
  return (
    !(error instanceof PortalHttpError && error.status < 500) &&
    failureCount < 1
  );
}
