import { useMemo } from "react";
import { Link, useRouteLoaderData } from "react-router";
import { getShortText } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { getLateActions } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import type { Partner } from "~/models/partners.server";
import { HomeComponentWrapper } from "./HomeComponentWrapper";

export const PartnersHomeComponent = ({ actions }: { actions: Action[] }) => {
  const { partners } = useRouteLoaderData("routes/app") as {
    partners: Partner[];
  };

  const partnersWithActionsLength = useMemo(() => {
    // Create a map of partner slug to actions for O(1) lookup or O(N) build
    const actionsByPartner = new Map<string, Action[]>();

    // Initialize map
    partners.forEach((p) => actionsByPartner.set(p.slug, []));

    // Single pass through actions
    actions.forEach((action) => {
      action.partners.forEach((partnerSlug) => {
        if (actionsByPartner.has(partnerSlug)) {
          actionsByPartner.get(partnerSlug)?.push(action);
        }
      });
    });

    return partners.map((partner) => {
      return {
        ...partner,
        lateActionsLength: getLateActions(
          actionsByPartner.get(partner.slug) || [],
        ).length,
      };
    });
  }, [partners, actions]);

  return (
    <HomeComponentWrapper title="Parceiros">
      <div
        className={cn(
          "grid grid-cols-2 px-8 text-center text-3xl leading-none font-bold uppercase sm:grid-cols-3 md:grid-cols-4 xl:px-16",
          Math.ceil(partnersWithActionsLength.length / 2) === 7
            ? "xl:grid-cols-7"
            : Math.ceil(partnersWithActionsLength.length / 2) === 8
              ? "xl:grid-cols-8"
              : "",
        )}
      >
        {partnersWithActionsLength.map((partner) => (
          <Link
            to={`/app/partner/${partner.slug}`}
            key={partner.id}
            className="group/partner hover:bg-foreground hover:text-background relative grid place-content-center p-8"
          >
            <div className="relative">
              {getShortText(partner.short)}

              <div className="absolute -top-2 -right-6 flex">
                <UBadge isDynamic value={partner.lateActionsLength} size="sm" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </HomeComponentWrapper>
  );
};
