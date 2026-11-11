import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { PlusIcon } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { UAvatarGroup } from "~/components/uzzina/UAvatar";
import { getAllClients } from "~/models/clients";
import { UAdminItemCard } from "~/components/uzzina/UAdminItemCard";
import { useAppContext } from "~/contexts/AppContext";
import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import type { Client, Partner } from "~/types";
import { buttonVariants } from "~/components/prism/button";
import { AdminGuard } from "~/components/features/AdminGuard";
import { PrismButton } from "~/components/prism";
export const Route = createFileRoute("/app/admin/clients")({
  component: AdminClientsPage,
});
function AdminClientsPage() {
  const { partners, person: viewer } = useAppContext();
  const supabase = createSupabaseBrowserClient();
  const {
    data: clients = [],
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ["clients", "team", viewer.user_id],
    queryFn: () => getAllClients(supabase),
  });
  return (
    <AdminGuard>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="pb-0 text-2xl font-bold">Clientes</h1>
          <Link
            className={buttonVariants()}
            params={{
              userId: "new",
            }}
            to="/app/admin/client/$userId"
          >
            Novo Cliente
            <PlusIcon />
          </Link>
        </div>

        {isLoading ? (
          <p
            className="p-8 text-center text-sm text-secondary-foreground"
            role="status"
          >
            Carregando clientes…
          </p>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 p-8" role="alert">
            <p className="text-sm text-error-foreground">
              Não foi possível carregar os clientes.
            </p>
            <PrismButton onPress={() => void refetch()} size="sm">
              Tentar novamente
            </PrismButton>
          </div>
        ) : (
          isSuccess &&
          clients.length === 0 && (
            <p className="text-secondary-foreground">
              Nenhum cliente cadastrado.
            </p>
          )
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client: Client) => {
              const clientPartners = (client.partners || []).flatMap(
                (slug: string) => {
                  const p = partners.find((p: Partner) => p.slug === slug);
                  return p ? [p] : [];
                },
              );
              return (
                <UAdminItemCard
                  key={client.id}
                  badge={
                    <UAvatarGroup
                      avatars={clientPartners.slice(0, 3).map((p: Partner) => ({
                        id: p?.id || "",
                        fallback: p?.short || "?",
                        image: p?.image,
                        backgroundColor: p?.colors?.[0],
                        color: p?.colors?.[1],
                      }))}
                      size="sm"
                    />
                  }
                  fallback={client.name || "??"}
                  image={client.image}
                  title={client.name || ""}
                  to={`/app/admin/client/${client.id}`}
                />
              );
            })}
          </div>
        )}
        <AppBarSpacer />
      </div>
    </AdminGuard>
  );
}
