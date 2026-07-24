import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { getShortText, UAvatar } from "~/components/uzzina/UAvatar";
import { useAppContext } from "~/contexts/AppContext";
import { cn } from "~/lib/utils";
import type { Action } from "~/types";
import { HomeComponentWrapper } from "./HomeComponentWrapper";
import { PrismBadge } from "~/components/prism";
export function PartnersHomeComponent({ actions }: { actions: Action[] }) {
  const { partners } = useAppContext();
  const sortedPartners = [...partners].sort((a, b) =>
    a.title.localeCompare(b.title),
  );
  const partnersWithActionsLength = useMemo(() => {
    // Create a map of partner slug to actions for O(1) lookup or O(N) build
    const actionsByPartner = new Map<string, number>();

    // Initialize map
    sortedPartners.forEach((p) => {
      actionsByPartner.set(p.slug, 0);
    });

    // Single pass through actions
    actions.forEach((action) => {
      action.partners.forEach((partnerSlug) => {
        if (actionsByPartner.has(partnerSlug)) {
          actionsByPartner.set(
            partnerSlug,
            (actionsByPartner.get(partnerSlug) || 0) + 1,
          );
        }
      });
    });
    return sortedPartners.map((partner) => ({
      ...partner,
      lateActionsLength: actionsByPartner.get(partner.slug) || 0,
    }));
  }, [sortedPartners, actions]);
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
            key={partner.id}
            className="group/partner relative grid place-content-center p-8"
            params={{
              slug: partner.slug,
            }}
            style={{
              backgroundColor: partner.colors[0],
              color: partner.colors[1],
            }}
            to="/app/partner/$slug"
          >
            <div className="relative group-hover/partner:opacity-50 transition duration-500 group-hover/partner:scale-80">
              {getShortText(partner.short)}

              <div className="absolute -top-2 -right-6 flex">
                <PrismBadge
                  variant={partner.lateActionsLength > 3 ? "error" : "warning"}
                >
                  {partner.lateActionsLength}
                </PrismBadge>
              </div>
            </div>
            {partner.image && (
              <UAvatar
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-120 duration-500 opacity-0 group-hover/partner:opacity-100 group-hover/partner:scale-100"
                fallback={partner.short}
                image={partner.image}
                size="xl"
              />
            )}
          </Link>
        ))}
      </div>
    </HomeComponentWrapper>
  );
}
