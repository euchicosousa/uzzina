import { FolderPlusIcon } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { AdminItemCard } from "~/components/uzzina/AdminItemCard";
import { useAppContext } from "~/contexts/AppContext";
import type { Partner } from "~/types";

export const Route = createFileRoute("/app/admin/partners")({
  component: AdminPartnersPage,
});

function AdminPartnersPage() {
  const { partners } = useAppContext();
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
        <Button asChild className="squircle rounded-2xl" variant={"raised"}>
          <Link to="/app/admin/partner/$slug" params={{ slug: "new" }}>
            Novo Parceiro <FolderPlusIcon />
          </Link>
        </Button>
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
