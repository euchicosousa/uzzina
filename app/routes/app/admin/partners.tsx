import { FolderPlusIcon } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PrismButton } from "~/components/prism";
import { AdminItemCard } from "~/components/uzzina/AdminItemCard";
import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import type { Partner } from "~/types";
import { buttonVariants } from "~/components/prism/button";
export const Route = createFileRoute("/app/admin/partners")({
  component: AdminPartnersPage,
});
function AdminPartnersPage() {
  const supabase = createSupabaseBrowserClient();
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("title", {
          ascending: true,
        });
      if (error) throw error;
      return data as Partner[];
    },
  });
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background gap-4 p-8 min-h-75">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Carregando parceiros...
        </p>
      </div>
    );
  }
  const archivedPartners: Partner[] = [];
  const activePartners: Partner[] = [];
  partners.forEach((partner: Partner) => {
    if (partner.archived) {
      archivedPartners.push(partner);
    } else {
      activePartners.push(partner);
    }
  });
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="pb-0 text-2xl font-bold">Parceiros</h1>

        <Link
          className={buttonVariants({
            variant: "ghost",
          })}
          params={{
            slug: "new",
          }}
          to="/app/admin/partner/$slug"
        >
          Novo Parceiro <FolderPlusIcon />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {activePartners.map((partner) => (
          <AdminItemCard
            key={partner.id}
            avatarBgColor={partner.colors[0]}
            avatarColor={partner.colors[1]}
            fallback={partner.short}
            image={partner.image}
            subtitle={partner.slug}
            title={partner.title}
            to={`/app/admin/partner/${partner.slug}`}
          />
        ))}
      </div>

      {archivedPartners.length > 0 && (
        <>
          <div>
            <h2 className="mt-8 text-2xl font-bold">Parceiros Arquivados</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {archivedPartners.map((partner) => (
              <AdminItemCard
                key={partner.id}
                avatarBgColor={partner.colors[0]}
                avatarColor={partner.colors[1]}
                className="opacity-70"
                fallback={partner.short}
                image={partner.image}
                subtitle={partner.slug}
                title={partner.title}
                to={`/app/admin/partner/${partner.slug}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
