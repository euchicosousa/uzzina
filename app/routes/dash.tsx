import type { Client } from "~/types";
import { Outlet, useNavigate, useLocation, useRouterState, createFileRoute } from "@tanstack/react-router";
import { LogOutIcon, AlertCircleIcon } from "lucide-react";
import {
  PrismButton,
  PrismSelect,
  PrismSelectContent,
  PrismSelectItem,
  PrismSelectTrigger,
  PrismSelectValue,
} from "~/components/prism";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";
import { useAppTheme } from "~/hooks/useAppTheme";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PortalHttpError } from "~/services/portal-http";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { verifyDashSession, logoutDashSession } from "~/models/clients";
import { fetchDashPartners, type DashPartnerDto } from "~/services/dash-client";
import { DashContext } from "~/contexts/DashContext";
import { z } from "zod";
const dashSearchSchema = z.object({
  partner: z.string().optional(),
  sidebar: z.string().optional(),
});
export const Route = createFileRoute("/dash")({
  validateSearch: dashSearchSchema,
  component: DashLayout,
});
const cloudName =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || "dvfpxjskm";
const uploadPreset =
  (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) ||
  "bussola_unsigned";
function DashLayout() {
  const navigate = useNavigate({
    from: "/dash",
  });
  const location = useLocation();
  const searchParams = Route.useSearch();
  const queryClient = useQueryClient();
  // Use committed matches: the URL can change before the previous child unmounts.
  const isLoginPath = useRouterState({ select: (state) => state.matches.some((match) => match.routeId === "/dash/login") });
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [partners, setPartners] = useState<DashPartnerDto[]>([]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Retry generation deliberately restarts the bootstrap.
  useEffect(() => {
    let cancelled = false;
    setClientId(null);
    setClientData(null);
    setPartners([]);
    setHasError(false);
    setLogoutError(null);
    if (isLoginPath) {
      queryClient.removeQueries({ predicate: (query) => String(query.queryKey[0]).startsWith("dash") });
      setLoading(false);
      return;
    }
    setLoading(true);
    async function bootstrapClient() {
      try {
        const data = await verifyDashSession();
        if (cancelled) return;
        if (!data?.active) {
          localStorage.removeItem("uzzina_dash_token");
          localStorage.removeItem("uzzina_dash_client_id");
          await navigate({ to: "/dash/login", replace: true });
          return;
        }
        const authorizedPartners = await fetchDashPartners();
        if (cancelled) return;
        setClientId(data.id);
        setClientData(data);
        setPartners(authorizedPartners);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof PortalHttpError && error.status === 401) {
          await navigate({ to: "/dash/login", replace: true });
        } else {
          setHasError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void bootstrapClient();
    return () => { cancelled = true; };
  }, [navigate, isLoginPath, queryClient, bootstrapAttempt]);
  const preferredPartner = searchParams.partner || localStorage.getItem("uzzina_dash_last_partner");
  const currentPartnerSlug = partners.some((p) => p.slug === preferredPartner)
    ? preferredPartner
    : partners[0]?.slug;
  const currentPartner =
    partners.find((p) => p.slug === currentPartnerSlug) || partners[0];
  const { applyPartnerColors } = useAppTheme();
  useEffect(() => {
    if (currentPartner?.colors && currentPartner.colors.length >= 2) {
      applyPartnerColors(currentPartner.colors[0], currentPartner.colors[1]);
    }
  }, [currentPartner, applyPartnerColors]);
  const handleLogout = async () => {
    try {
      await logoutDashSession();
      setClientData(null);
      setPartners([]);
      queryClient.removeQueries({ predicate: (query) => String(query.queryKey[0]).startsWith("dash") });
      localStorage.removeItem("uzzina_dash_token");
      localStorage.removeItem("uzzina_dash_client_id");
      localStorage.removeItem("uzzina_dash_last_partner");
      await navigate({ to: "/dash/login", replace: true });
    } catch {
      setLogoutError("Não foi possível encerrar a sessão. Tente novamente.");
    }
  };
  const handlePartnerChange = (val: string) => {
    localStorage.setItem("uzzina_dash_last_partner", val);
    navigate({
      search: (old) => ({
        ...old,
        partner: val,
      }),
    });
  };
  if (loading && !isLoginPath) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Carregando portal...
        </p>
      </div>
    );
  }
  if (isLoginPath) {
    return <Outlet />;
  }
  if (hasError && !clientData) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background gap-4 p-8 text-center">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
          <AlertCircleIcon className="size-8" />
        </div>
        <h2 className="text-lg font-semibold">Falha ao carregar o portal</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Não foi possível sincronizar suas credenciais ou dados do parceiro.
        </p>
        {logoutError && <p role="alert">{logoutError}</p>}
        <div className="flex items-center gap-3">
          <PrismButton size="sm" onClick={() => setBootstrapAttempt((attempt) => attempt + 1)}>
            Tentar novamente
          </PrismButton>
          <PrismButton size="sm" variant="ghost" onClick={handleLogout}>
            Sair e entrar novamente
          </PrismButton>
        </div>
      </div>
    );
  }
  if (!clientData) {
    return null;
  }
  return (
    <DashContext.Provider
      value={{
        name: clientData.name ?? "",
        image: clientData.image || null,
        partners,
        clientId: clientId || "",
        cloudName,
        uploadPreset,
      }}
    >
      <div className="bg-background flex h-screen w-full flex-col">
        <header className="border_after flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <UAvatar
              fallback={clientData.name ?? "Cliente"}
              image={clientData.image ?? undefined}
            />
            <span className="text-muted-foreground truncate text-sm">
              Olá,{" "}
              <span className="text-foreground font-medium">
                {clientData.name ?? "Cliente"}
              </span>
            </span>
          </div>

          {/* Seletor de Parceiro */}
          {partners.length > 0 && (
            <div className="flex max-w-xs items-center gap-3">
              {partners.length === 1 ? (
                <div className="flex items-center gap-2 rounded-xl px-3 py-1.5">
                  <span className="text-sm font-semibold">
                    {partners[0].title}
                  </span>
                </div>
              ) : (
                <PrismSelect
                  aria-label="Selecione o parceiro"
                  onSelectionChange={(key) => {
                    if (key) handlePartnerChange(String(key));
                  }}
                  selectedKey={currentPartnerSlug}
                >
                  <PrismSelectTrigger className="w-45 rounded-xl border-none text-sm font-semibold shadow-none">
                    <PrismSelectValue />
                  </PrismSelectTrigger>
                  <PrismSelectContent>
                    {partners.map((partner) => (
                      <PrismSelectItem key={partner.slug} id={partner.slug}>
                        {partner.title}
                      </PrismSelectItem>
                    ))}
                  </PrismSelectContent>
                </PrismSelect>
              )}
            </div>
          )}

          <PrismButton
            className="gap-2"
            onClick={handleLogout}
            size="sm"
            variant="ghost"
          >
            <LogOutIcon className="size-4" /> Sair
          </PrismButton>
        </header>
        {logoutError && <p role="alert" className="px-6 text-error">{logoutError}</p>}
        <div className="flex min-h-0 flex-1">
          <MultiSelectionProvider locationKey={location.pathname}>
            <Outlet />
          </MultiSelectionProvider>
        </div>
      </div>
    </DashContext.Provider>
  );
}
