import { IconCirclePlus, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  CopyCheckIcon,
  FilterIcon,
  HeartHandshakeIcon,
  Layers2Icon,
  SearchIcon,
} from "lucide-react";
import { useState } from "react";
import { BulkActionMenu } from "~/components/features/BulkActionMenu";
import {
  PrismBadge,
  PrismButton,
  PrismCommand,
  PrismCommandEmpty,
  PrismCommandGroup,
  PrismCommandInput,
  PrismCommandItem,
  PrismCommandList,
  PrismPopover,
  PrismPopoverTrigger,
} from "~/components/prism";
import { buttonVariants } from "~/components/prism/button";
import { useMultiSelection } from "~/hooks/useMultiSelection";
import { SIZE } from "~/lib/CONSTANTS";
import { getCleanAction } from "~/lib/helpers";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchAllLateActions } from "~/lib/supabase.queries";
import type { Action, Partner, Person } from "~/types";
import { UAvatar, UAvatarGroup } from "../uzzina/UAvatar";
export function AppBar({
  partners,
  person,
  setBaseAction,
  setOpenCmdK,
  partnerFilters,
  setPartnerFilters,
}: {
  partners: Partner[];
  person: Person;
  setBaseAction: (action: Action | null) => void;
  setOpenCmdK: (open: boolean) => void;
  partnerFilters: string[];
  setPartnerFilters: (slugs: string[]) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({
    strict: false,
  }) as Record<string, string | undefined>;
  const { isSelectionMode, toggleSelectionMode, clearSelection } =
    useMultiSelection();
  const isAtHome = location.pathname === "/app";
  const { data: lateActions = [] } = useQuery({
    queryKey: QUERY_KEYS.lateActions.user(person.user_id),
    queryFn: () =>
      fetchAllLateActions(
        person.user_id,
        person.admin,
        partners.map((p) => p.slug),
      ),
  });
  const activePartners = partners.filter((p) =>
    partnerFilters.includes(p.slug),
  );
  const pagePartner = params.slug
    ? partners.find((p) => p.slug === params.slug)
    : null;
  return (
    <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 justify-center">
      <div className="flex items-center gap-1 rounded-3xl border border-border bg-card/80 p-2 shadow-2xl backdrop-blur-xl squircle">
        {/* Home */}
        <Link
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
          })}
          title="Flow"
          to="/app/flow"
        >
          <Layers2Icon className="size-5" />
        </Link>
        <PartnerFilterPopover
          activePartners={activePartners}
          isAtHome={isAtHome}
          lateActions={lateActions}
          navigate={navigate}
          partner={pagePartner}
          partnerFilters={partnerFilters}
          partners={partners}
          setPartnerFilters={setPartnerFilters}
        />
        {/* Slot 3: Nova Ação OU BulkActionMenu */}
        <div className="flex items-center">
          {isSelectionMode ? (
            <BulkActionMenu />
          ) : (
            <PrismButton
              onClick={() =>
                setBaseAction({
                  ...getCleanAction({
                    user_id: person.user_id,
                    date: undefined,
                    partners:
                      partnerFilters.length === 1 ? [partnerFilters[0]] : [],
                  }),
                  responsibles: [person.user_id],
                } as unknown as Action)
              }
            >
              <span className="max-sm:hidden">Nova Ação</span>
              <span className="sm:hidden">Ação</span>
              <IconCirclePlus />
            </PrismButton>
          )}
        </div>
        {/* Slot 3: Multi-seleção Toggle */}
        <div className="flex items-center">
          {isSelectionMode ? (
            <PrismButton
              onClick={() => {
                clearSelection();
                toggleSelectionMode(false);
              }}
              size="icon"
              variant="destructive"
            >
              <IconX />
            </PrismButton>
          ) : (
            <PrismButton
              id="appbar-toggle-multi-selection"
              onClick={() => toggleSelectionMode()}
              size={"icon"}
              variant={"ghost"}
            >
              <CopyCheckIcon />
            </PrismButton>
          )}
        </div>
        {/* Slot 4: Busca / CmdK */}
        <PrismButton
          onClick={() => setOpenCmdK(true)}
          size="icon"
          variant="ghost"
        >
          <SearchIcon />
        </PrismButton>
      </div>
    </div>
  );
}
interface PartnerFilterPopoverProps {
  partners: Partner[];
  partnerFilters: string[];
  setPartnerFilters: (slugs: string[]) => void;
  activePartners: Partner[];
  partner: Partner | null | undefined;
  lateActions: Action[];
  isAtHome: boolean;
  navigate: ReturnType<typeof useNavigate>;
}
function PartnerFilterPopover({
  partners,
  partnerFilters,
  setPartnerFilters,
  activePartners,
  lateActions,
  partner,
  isAtHome,
  navigate,
}: PartnerFilterPopoverProps) {
  // const [partnerQuery, setPartnerQuery] = useState("");
  const [isFilterMode, setIsFilterMode] = useState(false);
  return (
    <PrismPopoverTrigger>
      <PrismButton
        className="sm"
        size={partnerFilters.length > 1 ? "default" : "icon"}
        variant={"ghost"}
      >
        {isAtHome ? (
          partnerFilters.length > 0 ? (
            <UAvatarGroup
              avatars={activePartners.map((partner) => ({
                fallback: partner.short,
                image: partner.image,
                backgroundColor: partner.colors[0],
                color: partner.colors[1],
              }))}
              clampAt={3}
              size={SIZE.sm}
            />
          ) : (
            <HeartHandshakeIcon />
          )
        ) : partner ? (
          <UAvatar
            backgroundColor={partner.colors[0]}
            color={partner.colors[1]}
            fallback={partner.short}
            image={partner.image}
            size={SIZE.sm}
          />
        ) : (
          <HeartHandshakeIcon />
        )}
      </PrismButton>
      <PrismPopover className="p-0 rounded-[32px]">
        <PrismCommand className="p-0">
          <div className="flex items-center border-b">
            <PrismCommandInput placeholder="Parceiro..." />
            {isAtHome && (
              <PrismButton
                className="mr-2"
                onPress={() => {
                  if (isFilterMode) {
                    setPartnerFilters([]);
                    setIsFilterMode(false);
                  } else {
                    setIsFilterMode(true);
                  }
                }}
                size={"icon-sm"}
                variant={isFilterMode ? "default" : "ghost"}
              >
                <FilterIcon />
              </PrismButton>
            )}
          </div>
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhum parceiro encontrado.</PrismCommandEmpty>
            )}
          >
            <PrismCommandGroup>
              {partners.map((partner) => {
                const isSelected = partnerFilters.includes(partner.slug);
                const lateActionCount = lateActions.filter((action) =>
                  action.partners.find((p) => p === partner.slug),
                ).length;
                return (
                  <PrismCommandItem
                    key={partner.slug}
                    className={isSelected ? "bg-secondary" : ""}
                    data-checked={isSelected}
                    onPress={() => {
                      if (isFilterMode) {
                        if (isSelected) {
                          setPartnerFilters(
                            partnerFilters.filter((s) => s !== partner.slug),
                          );
                        } else {
                          setPartnerFilters([...partnerFilters, partner.slug]);
                        }
                      } else {
                        navigate({
                          to: `/app/partner/${partner.slug}`,
                        });
                      }
                    }}
                    textValue={partner.title}
                  >
                    <UAvatar
                      backgroundColor={partner.colors[0]}
                      color={partner.colors[1]}
                      fallback={partner.short}
                      image={partner.image}
                      size="sm"
                    />
                    <span>{partner.title}</span>
                    {lateActionCount > 0 && (
                      <PrismBadge
                        className="absolute right-3"
                        variant={lateActionCount >= 3 ? "error" : "warning"}
                      >
                        {lateActionCount}
                      </PrismBadge>
                    )}
                  </PrismCommandItem>
                );
              })}
            </PrismCommandGroup>
          </PrismCommandList>
        </PrismCommand>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
