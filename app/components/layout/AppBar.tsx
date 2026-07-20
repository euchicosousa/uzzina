import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CopyCheckIcon,
  FilterIcon,
  FilterXIcon,
  HeartHandshakeIcon,
  Layers2Icon,
  PlusIcon,
  SearchIcon,
  X as XIcon,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
  useLocation,
} from "@tanstack/react-router";
import { BulkActionMenu } from "~/components/features/BulkActionMenu";
import { useMultiSelection } from "~/hooks/useMultiSelection";
import { SIZE } from "~/lib/CONSTANTS";
import { getCleanAction } from "~/lib/helpers";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchAllLateActions } from "~/lib/supabase.queries";
import { cn } from "~/lib/utils";
import type { Action, Partner, Person } from "~/types";
import {
  PrismCombobox,
  PrismComboboxInput,
  PrismListBox,
  PrismListBoxItem,
} from "~/components/old-prism";
import { Button } from "../ui/button";
import { UAvatar, UAvatarGroup } from "../uzzina/UAvatar";
import { UBadge } from "../uzzina/UBadge";
import { PrismButton, PrismPopover } from "../prism";
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
      <div className="flex items-center gap-2 rounded-3xl border border-border bg-card/80 p-2 shadow-2xl backdrop-blur-xl squircle lg:gap-4">
        {/* Home */}
        <Link
          className="flex h-9 px-3 items-center justify-center rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          title="Flow"
          to="/app/flow"
        >
          <Layers2Icon className="size-5" />
        </Link>{" "}
        <PartnerFilterPopover
          activePartners={activePartners}
          isAtHome={isAtHome}
          lateActions={lateActions}
          navigate={navigate}
          pagePartner={pagePartner}
          partnerFilters={partnerFilters}
          partners={partners}
          setPartnerFilters={setPartnerFilters}
        />
        {/* Slot 3: Nova Ação OU BulkActionMenu */}
        <div className="flex items-center">
          {isSelectionMode ? (
            <BulkActionMenu />
          ) : (
            <Button
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
            </Button>
          )}
        </div>
        {/* Slot 3: Multi-seleção Toggle */}
        <div className="flex items-center">
          {isSelectionMode ? (
            <Button
              className="size-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                clearSelection();
                toggleSelectionMode(false);
              }}
              size="icon"
              variant="ghost"
            >
              <XIcon className="size-4" />
            </Button>
          ) : (
            <Button
              className="size-10 rounded-xl"
              id="appbar-toggle-multi-selection"
              onClick={() => toggleSelectionMode()}
              variant={"ghost"}
            >
              <CopyCheckIcon className="size-4" />
            </Button>
          )}
        </div>
        {/* Slot 4: Busca / CmdK */}
        <Button
          className="size-10 rounded-xl"
          onClick={() => setOpenCmdK(true)}
          size="icon"
          variant="ghost"
        >
          <SearchIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
interface PartnerFilterPopoverProps {
  partners: Partner[];
  partnerFilters: string[];
  setPartnerFilters: (slugs: string[]) => void;
  activePartners: Partner[];
  pagePartner: Partner | null | undefined;
  lateActions: Action[];
  isAtHome: boolean;
  navigate: ReturnType<typeof useNavigate>;
}
function PartnerFilterPopover({
  partners,
  partnerFilters,
  setPartnerFilters,
  activePartners,
  pagePartner,
  lateActions,
  isAtHome,
  navigate,
}: PartnerFilterPopoverProps) {
  const [partnerQuery, setPartnerQuery] = React.useState("");
  const [isFilterMode, setIsFilterMode] = React.useState(false);
  return (
    <PrismCombobox
      allowsEmptyCollection
      inputValue={partnerQuery}
      items={partners}
      menuTrigger="focus"
      onInputChange={setPartnerQuery}
    >
      <PrismButton
        size="sm"
        variant={partnerFilters.length > 0 ? "secondary" : "ghost"}
      >
        {activePartners.length > 0 ? (
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
        ) : pagePartner ? (
          <UAvatar
            backgroundColor={pagePartner.colors[0]}
            color={pagePartner.colors[1]}
            fallback={pagePartner.short}
            image={pagePartner.image}
            size={SIZE.sm}
          />
        ) : (
          <HeartHandshakeIcon />
        )}
      </PrismButton>
      <PrismPopover
        className="mx-2 w-64 p-0 flex flex-col overflow-hidden"
        placement="bottom start"
      >
        <div className="flex h-11 w-full items-center border-b bg-transparent px-3 gap-2">
          <SearchIcon className="size-4 text-muted-foreground shrink-0" />
          <PrismComboboxInput
            className="flex h-full w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none border-0"
            placeholder="Procurar parceiro..."
          />
          {isAtHome && (
            <button
              className={cn(
                "size-7 rounded-lg flex items-center justify-center border transition-colors shrink-0",
                isFilterMode
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-secondary border-border text-muted-foreground",
              )}
              onClick={() => setIsFilterMode(!isFilterMode)}
              title={isFilterMode ? "Modo Filtro Ativo" : "Ativar Modo Filtro"}
              type="button"
            >
              <FilterIcon className="size-3.5" />
            </button>
          )}
        </div>

        <PrismListBox
          aria-label="Filtro de parceiros"
          className={cn(
            "max-h-60 overflow-y-auto p-1",
            partnerFilters.length > 0 && "pb-9",
          )}
        >
          {(partner: Partner) => {
            const partnerLateActions = lateActions.filter((action) =>
              action.partners.includes(partner.slug),
            );
            const isSelected = partnerFilters.includes(partner.slug);
            return (
              <PrismListBoxItem
                className={cn(
                  "group flex justify-between items-center py-1.5",
                  isFilterMode && isSelected && "bg-primary/10 text-primary",
                )}
                id={partner.slug}
                onAction={() => {
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
                      to: "/app/partner/$slug",
                      params: {
                        slug: partner.slug,
                      },
                    });
                  }
                }}
                textValue={partner.title}
              >
                <div className="flex flex-1 items-center gap-2 overflow-hidden">
                  <UAvatar
                    backgroundColor={partner.colors[0]}
                    color={partner.colors[1]}
                    fallback={partner.short}
                    image={partner.image}
                    size={SIZE.sm}
                  />
                  <div className="truncate text-sm">{partner.title}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {partnerLateActions.length > 0 && (
                    <UBadge
                      isDynamic
                      size="sm"
                      value={partnerLateActions.length}
                    />
                  )}
                  {isFilterMode && isSelected && (
                    <div className="size-2 rounded-full bg-primary shrink-0 animate-in fade-in zoom-in" />
                  )}
                </div>
              </PrismListBoxItem>
            );
          }}
        </PrismListBox>

        {partnerFilters.length > 0 && (
          <div className="absolute right-2 bottom-1 left-2 text-center bg-popover/40 backdrop-blur-md pt-1.5 border-t border-t-border/20 z-10">
            <button
              className="z-10 h-7 w-full rounded-xl bg-foreground/60 hover:bg-foreground/80 text-[11px] font-semibold text-background flex items-center justify-center gap-1 transition-colors"
              onClick={() => setPartnerFilters([])}
              type="button"
            >
              Limpar seleção
              <FilterXIcon className="size-3.5" />
            </button>
          </div>
        )}
      </PrismPopover>
    </PrismCombobox>
  );
}
