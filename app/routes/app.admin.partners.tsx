import { IconFolderPlus } from "@tabler/icons-react";
import {
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { Button } from "~/components/ui/button";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { getUserId } from "~/services/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "Admin | Partners" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await getUserId(request);

  const { data: partners } = await supabase
    .from("partners")
    .select("*")
    .order("title", { ascending: true });

  invariant(partners, "Partners not found");

  return { partners };
};

export default function AdminPartnersPage() {
  const { partners }: { partners: Partner[] } = useLoaderData<typeof loader>();

  const archivedPartners: Partner[] = [];
  const activePartners: Partner[] = [];

  partners.forEach((partner) => {
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
        <Button variant={"secondary"} asChild className="squircle rounded-2xl">
          <Link to="/app/admin/partner/new">
            Novo Parceiro <IconFolderPlus />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {activePartners.map((partner) => (
          <Link
            key={partner.id}
            to={`/app/admin/partner/${partner.slug}`}
            className="hover:bg-muted/50 squircle flex items-center gap-4 rounded-3xl border p-4 transition-colors"
          >
            <UAvatar
              fallback={partner.short}
              backgroundColor={partner.colors[0]}
              color={partner.colors[1]}
              size="lg"
              isSquircle
            />

            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{partner.title}</div>
              <div className="text-muted-foreground truncate text-xs">
                {partner.slug}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {archivedPartners.length > 0 && (
        <>
          <div>
            <h2 className="mt-8 text-2xl font-bold">Parceiros Arquivados</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {archivedPartners.map((partner) => (
              <Link
                key={partner.id}
                to={`/app/admin/partner/${partner.slug}`}
                className="hover:bg-muted/50 squircle flex items-center gap-4 rounded-3xl border p-4 opacity-70 transition-colors"
              >
                <UAvatar
                  fallback={partner.short}
                  backgroundColor={partner.colors[0]}
                  color={partner.colors[1]}
                  size="lg"
                  isSquircle
                />

                <div className="">
                  <div className="truncate font-medium">{partner.title}</div>
                  <div className="text-muted-foreground truncate text-xs">
                    {partner.slug}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
