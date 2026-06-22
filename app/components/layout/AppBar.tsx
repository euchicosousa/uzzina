import { useQuery } from "@tanstack/react-query";
import {
  CopyCheckIcon,
  FilterIcon,
  FilterXIcon,
  HeartHandshakeIcon,
  HomeIcon,
  PlusIcon,
  SearchIcon,
  X as XIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { BulkActionMenu } from "~/components/features/BulkActionMenu";
import { useMultiSelection } from "~/hooks/useMultiSelection";
import { SIZE } from "~/lib/CONSTANTS";
import { getCleanAction } from "~/lib/helpers";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchAllLateActions } from "~/lib/supabase.queries";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import type { Partner } from "~/models/partners.server";
import type { Person } from "~/models/people.server";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { UAvatar, UAvatarGroup } from "../uzzina/UAvatar";
import { UBadge } from "../uzzina/UBadge";

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
  const params = useParams();
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
      <div className="flex items-center gap-2 rounded-3xl border border-border bg-card/20 p-2 shadow-2xl backdrop-blur-xl squircle lg:gap-4">
        {/* Slot 1: Homepage */}
        <Button asChild variant={"ghost"} className={"rounded-xl"}>
          <Link to="/app">
            <HomeIcon />
          </Link>
        </Button>
        {/* Slot 2: Dropdown de Parceiros */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={partnerFilters.length > 0 ? "secondary" : "ghost"}
              className={cn(
                "relative flex items-center justify-center rounded-2xl px-2 squircle",
              )}
            >
              {activePartners.length > 0 ? (
                <UAvatarGroup
                  avatars={activePartners.map((partner) => ({
                    fallback: partner.short,
                    image: partner.image,
                    backgroundColor: partner.colors[0],
                    color: partner.colors[1],
                  }))}
                  size={SIZE.sm}
                  clampAt={3}
                />
              ) : pagePartner ? (
                <UAvatar
                  size={SIZE.sm}
                  fallback={pagePartner.short}
                  image={pagePartner.image}
                  backgroundColor={pagePartner.colors[0]}
                  color={pagePartner.colors[1]}
                />
              ) : (
                <HeartHandshakeIcon className="size-4" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="mx-2 w-64 bg-popover/20 p-0 backdrop-blur-2xl"
            align="start"
          >
            <Command className="bg-transparent">
              <CommandInput placeholder="Procurar parceiro..." />
              <CommandList
                className={cn(
                  "p-2 outline-none",
                  partnerFilters.length > 0 && "pb-8",
                )}
              >
                <CommandEmpty>Nenhum parceiro encontrado.</CommandEmpty>
                {partners.map((partner) => {
                  const partnerLateActions = lateActions.filter((action) =>
                    action.partners.includes(partner.slug),
                  );
                  const isFiltered = partnerFilters.includes(partner.slug);

                  return (
                    <CommandItem
                      key={partner.id}
                      className="group flex cursor-pointer items-center justify-between gap-2"
                      onSelect={() => {
                        navigate(`/app/partner/${partner.slug}`);
                      }}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <UAvatar
                          size={SIZE.sm}
                          fallback={partner.short}
                          image={partner.image}
                          backgroundColor={partner.colors[0]}
                          color={partner.colors[1]}
                        />
                        <div className="truncate">{partner.title}</div>
                      </div>

                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {partnerLateActions.length > 0 && (
                          <UBadge
                            size="sm"
                            value={partnerLateActions.length}
                            isDynamic
                          />
                        )}
                        {isAtHome && (
                          <Button
                            variant={isFiltered ? "secondary" : "ghost"}
                            className={cn(
                              "absolute right-1 size-6 cursor-pointer bg-accent transition",
                              !isFiltered
                                ? "opacity-0 ring-black/5 group-hover:opacity-100 hover:bg-card hover:shadow-xs hover:ring max-sm:opacity-100"
                                : "bg-card shadow-xs ring ring-black/5",
                            )}
                            onClick={() => {
                              if (isFiltered) {
                                setPartnerFilters(
                                  partnerFilters.filter(
                                    (s) => s !== partner.slug,
                                  ),
                                );
                              } else {
                                setPartnerFilters([
                                  ...partnerFilters,
                                  partner.slug,
                                ]);
                              }
                            }}
                          >
                            <FilterIcon className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
                {partnerFilters.length > 0 && (
                  <div className="absolute right-5 bottom-2 left-4 text-center">
                    <Button
                      className="z-1 h-6 w-full rounded-xl bg-foreground/50 text-xs text-background backdrop-blur-md"
                      onClick={() => setPartnerFilters([])}
                    >
                      Limpar seleção
                      <FilterXIcon className="ml-1" />
                    </Button>
                  </div>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Slot 3: Nova Ação OU BulkActionMenu */}
        <div className="flex items-center">
          {isSelectionMode ? (
            <BulkActionMenu />
          ) : (
            <Button
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
              className="flex items-center gap-1 rounded-xl px-3 squircle"
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
              variant="ghost"
              size="icon"
              className="size-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                clearSelection();
                toggleSelectionMode(false);
              }}
            >
              <XIcon className="size-4" />
            </Button>
          ) : (
            <Button
              id="appbar-toggle-multi-selection"
              onClick={() => toggleSelectionMode()}
              variant={"ghost"}
              className="size-10 rounded-xl"
            >
              <CopyCheckIcon className="size-4" />
            </Button>
          )}
        </div>

        {/* Slot 4: Busca / CmdK */}
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-xl"
          onClick={() => setOpenCmdK(true)}
        >
          <SearchIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
