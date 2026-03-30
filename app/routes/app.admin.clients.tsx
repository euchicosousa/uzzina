import { UserPlusIcon } from "lucide-react";
import {
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Button } from "~/components/ui/button";
import { UAvatar, UAvatarGroup } from "~/components/uzzina/UAvatar";
import { getAllClients } from "~/models/clients.server";
import { getAllPartners } from "~/models/partners.server";
import { getUserId } from "~/services/auth.server";

export const meta: MetaFunction = () => [{ title: "Admin | Clientes" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await getUserId(request);
  const [clients, partners] = await Promise.all([
    getAllClients(supabase),
    getAllPartners(supabase),
  ]);
  return { clients, partners };
};

export default function AdminClientsPage() {
  const { clients, partners } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="pb-0 text-2xl font-bold">Clientes</h1>
        <Button variant="secondary" asChild className="squircle rounded-2xl">
          <Link to="/app/admin/clients/new">
            Novo Cliente <UserPlusIcon />
          </Link>
        </Button>
      </div>

      {clients.length === 0 && (
        <p className="text-muted-foreground">Nenhum cliente cadastrado.</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => {
          const clientPartners = (client.partners || [])
            .map((slug) => partners.find((p) => p.slug === slug))
            .filter(Boolean);

          return (
            <Link
              key={client.id}
              to={`/app/admin/clients/${client.id}`}
              className="hover:bg-muted/50 squircle flex items-center gap-4 rounded-3xl border p-4 transition-colors"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                <UAvatar
                  image={client.image}
                  fallback={client.name || "??"}
                  size="lg"
                />
                <div className="mb-1 w-full truncate text-xl font-medium">
                  {client.name}
                </div>
              </div>
              <UAvatarGroup
                avatars={clientPartners.slice(0, 3).map((p) => ({
                  id: p!.id,
                  fallback: p!.short,
                  backgroundColor: p!.colors[0],
                  color: p!.colors[1],
                }))}
                size="sm"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
