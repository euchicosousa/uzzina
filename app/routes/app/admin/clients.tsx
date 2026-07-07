import { UserPlusIcon } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { UAvatarGroup } from "~/components/uzzina/UAvatar";
import { getAllClients } from "~/models/clients";
import { AdminItemCard } from "~/components/uzzina/AdminItemCard";
import { useAppContext } from "~/contexts/AppContext";
import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import type { Client, Partner } from "~/types";

export const Route = createFileRoute("/app/admin/clients")({
  component: AdminClientsPage,
});

function AdminClientsPage() {
  const { partners } = useAppContext();
  const supabase = createSupabaseBrowserClient();
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getAllClients(supabase),
  });
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="pb-0 text-2xl font-bold">Clientes</h1>
        <Button asChild className="squircle rounded-2xl" variant="secondary">
          <Link to="/app/admin/clients/$userId" params={{ userId: "new" }}>
            Novo Cliente <UserPlusIcon />
          </Link>
        </Button>
      </div>

      {clients.length === 0 && (
        <p className="text-muted-foreground">Nenhum cliente cadastrado.</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client: Client) => {
          const clientPartners = (client.partners || []).flatMap(
            (slug: string) => {
              const p = partners.find((p: Partner) => p.slug === slug);
              return p ? [p] : [];
            },
          );
          return (
            <AdminItemCard
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
              to={`/app/admin/clients/${client.id}`}
            />
          );
        })}
      </div>
    </div>
  );
}
