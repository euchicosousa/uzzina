import type { Partner, Client } from "~/types";
import {
  Outlet,
  useSearchParams,
  useNavigate,
  type MetaFunction,
} from "react-router";
import { LogOutIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";
import { useAppTheme } from "~/hooks/useAppTheme";
import { useEffect, useState } from "react";
import { UAvatar } from "~/components/uzzina/UAvatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { getClientById } from "~/models/clients";
import { DashContext } from "~/contexts/DashContext";

import { useLoaderData } from "react-router";

export const meta: MetaFunction = () => [{ title: "Portal do Cliente" }];

export const loader = async () => {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "",
  };
};

export default function DashLayout() {
  const { cloudName, uploadPreset } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    // Apenas executa no navegador
    const storedId = localStorage.getItem("uzzina_dash_client_id");
    const isLoginPath = window.location.pathname.startsWith("/dash/login");

    if (!storedId) {
      if (!isLoginPath) {
        navigate("/dash/login");
      }
      setLoading(false);
      return;
    }

    setClientId(storedId);

    async function bootstrapClient() {
      try {
        const client = await getClientById(supabase, storedId || "");
        if (!client?.active) {
          localStorage.removeItem("uzzina_dash_client_id");
          navigate("/dash/login");
          setLoading(false);
          return;
        }

        const { data: partnersData } = await supabase
          .from("partners")
          .select("id, slug, title, short, colors")
          .in("slug", client.partners || [])
          .order("title");

        setClientData(client);
        setPartners((partnersData as Partner[]) || []);
      } catch (err) {
        console.error("Erro ao carregar dados do cliente:", err);
      } finally {
        setLoading(false);
      }
    }

    bootstrapClient();
  }, [navigate, supabase
          .from, supabase]);

  const currentPartnerSlug = params.get("partner") || localStorage.getItem("uzzina_dash_last_partner") || partners[0]?.slug;
  const currentPartner =
    partners.find((p) => p.slug === currentPartnerSlug) || partners[0];

  const { applyPartnerColors } = useAppTheme();

  useEffect(() => {
    if (
      currentPartner?.colors &&
      currentPartner.colors.length >= 2
    ) {
      applyPartnerColors(currentPartner.colors[0], currentPartner.colors[1]);
    }
  }, [currentPartner, applyPartnerColors]);

  const handleLogout = () => {
    localStorage.removeItem("uzzina_dash_client_id");
    localStorage.removeItem("uzzina_dash_last_partner");
    navigate("/dash/login");
  };

  const handlePartnerChange = (val: string) => {
    localStorage.setItem("uzzina_dash_last_partner", val);
    navigate(`/dash?partner=${val}`);
  };

  const isLoginPath = typeof window !== "undefined" && window.location.pathname.startsWith("/dash/login");

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
    return <Outlet context={{ setBaseAction: () => {} }} />;
  }

  if (!clientData) {
    return null;
  }

  return (
    <DashContext.Provider value={{ name: clientData.name ?? "", image: clientData.image || null, partners, clientId: clientId || "", cloudName, uploadPreset }}>
      <div className="bg-background flex h-screen w-full flex-col">
        <header className="border_after flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <UAvatar image={clientData.image ?? undefined} fallback={clientData.name ?? "Cliente"} />
            <span className="text-muted-foreground truncate text-sm">
              Olá, <span className="text-foreground font-medium">{clientData.name ?? "Cliente"}</span>
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
                <Select
                  value={currentPartnerSlug}
                  onValueChange={handlePartnerChange}
                >
                  <SelectTrigger className="w-[180px] rounded-xl border-none text-sm font-semibold shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {partners.map((p) => (
                      <SelectItem key={p.slug} value={p.slug}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <Button size="sm" variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOutIcon className="size-4" />
            Sair
          </Button>
        </header>
        <div className="flex min-h-0 flex-1">
          <MultiSelectionProvider>
            <Outlet context={{ setBaseAction: () => {} }} />
          </MultiSelectionProvider>
        </div>
      </div>
    </DashContext.Provider>
  );
}
