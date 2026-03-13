import { PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { Link, useOutletContext, useRouteLoaderData } from "react-router";
import { SIZE, VARIANT } from "~/lib/CONSTANTS";
import { getCleanAction } from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import type { Partner } from "~/models/partners.server";
import type { AppLoaderData } from "~/routes/app";
import { ActionContainer } from "../features/ActionContainer";
import { Button } from "../ui/button";
import { UAvatarGroup } from "../uzzina/UAvatar";

export function PartnersComponent({ actions }: { actions: Action[] }) {
  const { partners } = useRouteLoaderData("routes/app") as AppLoaderData;

  // Descobre todos os parceiros presentes nas ações do dia
  const activePartners = useMemo(() => {
    const slugSet = new Set(actions.flatMap((a) => a.partners));
    return partners.filter((p) => slugSet.has(p.slug));
  }, [actions, partners]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {activePartners.map((partner) => {
          const partnerActions = actions.filter((a) =>
            a.partners.includes(partner.slug),
          );
          return (
            <PartnerColumn
              key={partner.id}
              partner={partner}
              actions={partnerActions}
            />
          );
        })}
      </div>
    </div>
  );
}

function PartnerColumn({
  partner,
  actions,
}: {
  partner: Partner;
  actions: Action[];
}) {
  const { person } = useRouteLoaderData("routes/app") as AppLoaderData;
  const { setBaseAction } = useOutletContext<OutletContext>();

  return (
    <div className="group/column flex flex-col overflow-hidden">
      {/* Header do parceiro */}
      <div className="flex items-center justify-between gap-4 overflow-hidden p-2">
        <Link
          to={`/app/partner/${partner.slug}`}
          className="group flex items-center gap-2 overflow-hidden"
        >
          <UAvatarGroup
            size={SIZE.sm}
            isSquircle
            avatars={[
              {
                id: partner.id,
                fallback: partner.short,
                backgroundColor: partner.colors[0],
                color: partner.colors[1],
              },
            ]}
          />
          <span className="truncate text-sm font-medium tracking-tight underline-offset-3 group-hover:underline">
            {partner.title}
          </span>
        </Link>

        <Button
          size="icon"
          className="size-6 opacity-0 group-hover/column:opacity-100"
          onClick={() =>
            setBaseAction({
              ...(getCleanAction(person.user_id) as unknown as Action),
              partners: [partner.slug],
            })
          }
        >
          <PlusIcon />
        </Button>
      </div>

      {/* Lista de ações */}

      <ActionContainer
        actions={actions}
        variant={VARIANT.hair}
        showLate
        showSprint
      />
    </div>
  );
}
