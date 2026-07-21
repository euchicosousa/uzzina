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
  PlusIcon,
  SearchIcon,
  X as XIcon,
} from "lucide-react";
import { useState } from "react";
import { BulkActionMenu } from "~/components/features/BulkActionMenu";
import {
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
  const isAtPagePartner = params.slug
    ? partners.find((p) => p.slug === params.slug)
    : null;
  return (
    <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 justify-center">
      <div className="flex items-center gap-2 rounded-3xl border border-border bg-card/80 p-2 shadow-2xl backdrop-blur-xl squircle lg:gap-4">
        {/* Home */}
        <Link
          className="flex h-9 px-3 items-center justify-center rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          title="Flow"
          to="/app/flow"
        >
          <Layers2Icon className="size-5" />
        </Link>
        <PartnerFilterPopover
          activePartners={activePartners}
          isAtHome={isAtHome}
          isAtPagePartner={isAtPagePartner}
          lateActions={lateActions}
          navigate={navigate}
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
              className="flex items-center gap-1 rounded-xl px-3 squircle"
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
              <PlusIcon className="size-4" />
              <span className="max-sm:hidden">Nova Ação</span>
              <span className="sm:hidden">Ação +</span>
            </PrismButton>
          )}
        </div>
        {/* Slot 3: Multi-seleção Toggle */}
        <div className="flex items-center">
          {isSelectionMode ? (
            <PrismButton
              className="size-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                clearSelection();
                toggleSelectionMode(false);
              }}
              size="icon"
              variant="ghost"
            >
              <XIcon className="size-4" />
            </PrismButton>
          ) : (
            <PrismButton
              className="size-10 rounded-xl"
              id="appbar-toggle-multi-selection"
              onClick={() => toggleSelectionMode()}
              variant={"ghost"}
            >
              <CopyCheckIcon className="size-4" />
            </PrismButton>
          )}
        </div>
        {/* Slot 4: Busca / CmdK */}
        <PrismButton
          className="size-10 rounded-xl"
          onClick={() => setOpenCmdK(true)}
          size="icon"
          variant="ghost"
        >
          <SearchIcon className="size-4" />
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
  isAtPagePartner: Partner | null | undefined;
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
  isAtPagePartner,
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
        {partnerFilters.length > 0 ? (
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
