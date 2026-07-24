import type { Action, Partner } from "~/types";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { DATE_TIME_DISPLAY, SIZE } from "~/lib/CONSTANTS";
import { getCleanAction } from "~/lib/helpers";
import { useAppContext } from "~/contexts/AppContext";
import { ActionContainer } from "../features/ActionContainer";
import { PrismButton, PrismSkeletonGroup } from "~/components/prism";
import { UAvatarGroup } from "../uzzina/UAvatar";
export function PartnersComponent({
  actions,
  isLoading,
}: {
  actions: Action[];
  isLoading?: boolean;
}) {
  const { partners } = useAppContext();

  // Descobre todos os parceiros presentes nas ações do dia
  const activePartners = useMemo(() => {
    const slugSet = new Set(actions.flatMap((a) => a.partners));
    return partners.filter((p: Partner) => slugSet.has(p.slug));
  }, [actions, partners]);
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 pt-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {isLoading && activePartners.length === 0 && (
          <PrismSkeletonGroup count={12} isWrapped={false} variant="profile" />
        )}
        {!isLoading && activePartners.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border/50 bg-input/20 py-16 text-center text-sm text-muted-foreground">
            Nenhuma ação para hoje.
          </div>
        )}
        {activePartners.map((partner) => {
          const partnerActions = actions.filter((a) =>
            a.partners.includes(partner.slug),
          );
          return (
            <PartnerColumn
              key={partner.id}
              actions={partnerActions}
              partner={partner}
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
  const { person, setBaseAction } = useAppContext();
  return (
    <div className="group/column flex flex-col overflow-hidden">
      {/* Header do parceiro */}
      <div className="flex items-center justify-between gap-4 overflow-hidden p-2 pb-4">
        <Link
          className="group flex items-center gap-2 overflow-hidden"
          params={{
            slug: partner.slug,
          }}
          to="/app/partner/$slug"
        >
          <UAvatarGroup
            avatars={[
              {
                id: partner.id,
                fallback: partner.short,
                image: partner.image,
                backgroundColor: partner.colors[0],
                color: partner.colors[1],
              },
            ]}
            size={SIZE.md}
          />
          <span className="truncate text-sm font-medium tracking-tight underline-offset-3 group-hover:underline">
            {partner.title}
          </span>
        </Link>

        <PrismButton
          className="size-6 opacity-0 group-hover/column:opacity-100"
          onClick={() =>
            setBaseAction({
              ...(getCleanAction({
                user_id: person.user_id,
                partners: [partner.slug],
              }) as unknown as Action),
              responsibles: partner.users_ids,
            })
          }
          size="icon"
        >
          <PlusIcon />
        </PrismButton>
      </div>

      {/* Lista de ações */}

      <ActionContainer
        actions={actions}
        dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
        displayFlags={{
          showLate: true,
          showCategory: true,
        }}
        orderBy="date"
      />
    </div>
  );
}
