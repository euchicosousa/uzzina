import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PortalHttpError } from "~/services/portal-http";

export function usePortalSessionError(error: unknown) {
  const navigate = useNavigate();
  useEffect(() => {
    if (error instanceof PortalHttpError && error.status === 401) {
      void navigate({ to: "/dash/login", replace: true });
    }
  }, [error, navigate]);
}

export function retryPortalQuery(failureCount: number, error: unknown) {
  return !(error instanceof PortalHttpError && error.status < 500) && failureCount < 1;
}
