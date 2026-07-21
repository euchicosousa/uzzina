import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Action, Partner } from "~/types";
import {
  PrismCommand,
  PrismCommandDialog,
  PrismCommandEmpty,
  PrismCommandGroup,
  PrismCommandInput,
  PrismCommandItem,
  PrismCommandList,
} from "~/components/prism";
import { DATE_TIME_DISPLAY, PHASES, type PHASE } from "~/lib/CONSTANTS";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { getFormattedDateTime } from "~/utils/date";
import { UAvatar } from "../uzzina/UAvatar";
import { PhaseIcon } from "./PhaseIcon";
type GlobalSearchCommandProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partners: Partner[];
  setBaseAction: (action: Action) => void;
};
export function GlobalSearchCommand({
  open,
  onOpenChange,
  partners,
  setBaseAction,
}: GlobalSearchCommandProps) {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<{
    actions: Action[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const location = useLocation();

  // Extract the partner slug if the user is currently looking at a partner page
  const activePartnerMatch = location.pathname.match(
    /^\/app\/partner\/([^/]+)/,
  );
  const activePartnerSlug = activePartnerMatch ? activePartnerMatch[1] : null;

  // Debounce the search query to avoid spamming the database on every keystroke
  useEffect(() => {
    const shouldSearch = query.length >= 3;
    const slugs = partners.map((p) => p.slug);
    if (shouldSearch) {
      const delayDebounceFn = setTimeout(async () => {
        setIsSearching(true);
        try {
          const supabase = createSupabaseBrowserClient();
          let baseQuery = supabase
            .from("actions")
            .select("*")
            .ilike("title", `%${query}%`)
            .overlaps("partners", slugs);
          if (activePartnerSlug) {
            baseQuery = baseQuery.contains("partners", [activePartnerSlug]);
          }
          if (!includeArchived) {
            baseQuery = baseQuery.eq("archived", false);
          }
          const { data, error } = await baseQuery.limit(10);
          if (error) throw error;
          setSearchResults({
            actions: (data as unknown as Action[]) || [],
          });
        } catch (err) {
          console.error("Erro na busca global:", err);
        } finally {
          setIsSearching(false);
        }
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults(null);
      setIsSearching(false);
    }
  }, [query, activePartnerSlug, includeArchived, partners]);
  const filteredPartners =
    query.trim() === ""
      ? partners
      : partners.filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.slug.toLowerCase().includes(query.toLowerCase()),
        );
  const searchedActions = searchResults?.actions || [];
  return (
    <PrismCommandDialog onOpenChange={onOpenChange} open={open}>
      <PrismCommand
        inputValue={query}
        onInputChange={(value) => setQuery(value)}
      >
        <PrismCommandInput placeholder="Faça sua busca..." />
        <PrismCommandList
          renderEmptyState={() => (
            <PrismCommandEmpty>
              {isSearching ? "Buscando..." : "Nenhum item foi encontrado."}
            </PrismCommandEmpty>
          )}
        >
          {/* Parceiros */}
          <PrismCommandGroup aria-label="Parceiros" heading="Parceiros">
            {filteredPartners.map((partner) => (
              <PrismCommandItem
                key={partner.slug}
                onPress={() => {
                  navigate({
                    to: `/app/partner/${partner.slug}`,
                  });
                  onOpenChange(false);
                }}
                textValue={partner.title}
              >
                <UAvatar
                  fallback={partner.short}
                  image={partner.image}
                  size="sm"
                />
                <span>{partner.title}</span>
                <span className="opacity-40 text-xs tracking-wide absolute right-4">
                  @{partner.slug}
                </span>
              </PrismCommandItem>
            ))}
          </PrismCommandGroup>
          {/* Ações */}
          <PrismCommandGroup aria-label="Ações" heading="Ações">
            {searchedActions.map((action) => {
              const phase = PHASES[action.phase as PHASE];
              const partner = partners.find((p) => {
                return p.slug === action.partners[0];
              }) as Partner;
              return (
                <PrismCommandItem
                  key={action.id}
                  className={"flex justify-between w-full"}
                  onPress={() => {
                    setBaseAction(action);
                    onOpenChange(false);
                  }}
                  textValue={action.title}
                >
                  <UAvatar
                    backgroundColor={partner.colors[0]}
                    color={partner.colors[1]}
                    fallback={partner.short}
                    image={partner.image}
                    size="sm"
                  />
                  <div className="truncate w-full">{action.title}</div>
                  <div className="opacity-40 text-xs">
                    {getFormattedDateTime(
                      action.date,
                      DATE_TIME_DISPLAY.DateOnly,
                    )}
                  </div>
                  <div className="absolute right-4">
                    <PhaseIcon phase={phase} />
                  </div>
                </PrismCommandItem>
              );
            })}
          </PrismCommandGroup>
        </PrismCommandList>
      </PrismCommand>
    </PrismCommandDialog>
  );
}
