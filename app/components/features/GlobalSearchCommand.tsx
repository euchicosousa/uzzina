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
import { searchActionsByTitle } from "~/models/actions";
import { getFormattedDateTime } from "~/utils/date";
import { UAvatar } from "../uzzina/UAvatar";
import { PhaseIcon } from "./PhaseIcon";
import { ArchiveIcon } from "lucide-react";
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
  const [searchError, setSearchError] = useState(false);
  const [query, setQuery] = useState("");
  // const [includeArchived, setIncludeArchived] = useState(false);
  const location = useLocation();

  // Extract the partner slug if the user is currently looking at a partner page
  const activePartnerMatch = location.pathname.match(
    /^\/app\/partner\/([^/]+)/,
  );
  const activePartnerSlug = activePartnerMatch ? activePartnerMatch[1] : null;

  // Debounce the search query to avoid spamming the database on every keystroke
  useEffect(() => {
    let isCurrent = true;
    const shouldSearch = query.length >= 3;
    const slugs = partners.map((p) => p.slug);
    setSearchError(false);
    if (shouldSearch) {
      setSearchResults(null);
      setIsSearching(true);
      const delayDebounceFn = setTimeout(async () => {
        setIsSearching(true);
        try {
          const supabase = createSupabaseBrowserClient();
          const actions = await searchActionsByTitle(supabase, {
            query,
            partnerSlugs: slugs,
            activePartnerSlug,
          });
          if (!isCurrent) return;
          setSearchResults({ actions });
        } catch (err) {
          if (!isCurrent) return;
          console.error("Erro na busca global:", err);
          setSearchResults(null);
          setSearchError(true);
        } finally {
          if (isCurrent) {
            setIsSearching(false);
          }
        }
      }, 300);
      return () => {
        isCurrent = false;
        clearTimeout(delayDebounceFn);
      };
    } else {
      setSearchResults(null);
      setIsSearching(false);
    }
  }, [query, activePartnerSlug, partners]);
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
        {searchError && (
          <div className="px-4 py-3 text-sm text-error" role="alert">
            Não foi possível buscar ações. Tente novamente.
          </div>
        )}
        <PrismCommandList
          renderEmptyState={() => (
            <PrismCommandEmpty>
              {isSearching
                ? "Buscando..."
                : searchError
                  ? "Altere a busca para tentar novamente."
                  : "Nenhum item foi encontrado."}
            </PrismCommandEmpty>
          )}
        >
          {/* Parceiros */}
          <PrismCommandGroup aria-label="Parceiros" heading="Parceiros">
            {filteredPartners.map((partner) => (
              <PrismCommandItem
                key={partner.slug}
                className={"h-10"}
                onPress={() => {
                  navigate({
                    to: `/app/partner/${partner.slug}`,
                  });
                  setQuery("");
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
                <span className="absolute right-4 text-xs tracking-wide opacity-40">
                  @{partner.slug}
                </span>
              </PrismCommandItem>
            ))}
          </PrismCommandGroup>
          {/* Ações */}
          <PrismCommandGroup aria-label="Ações" heading="Ações">
            {searchedActions.map((action) => {
              const phase = PHASES[action.phase as PHASE];
              const partner =
                partners.find(
                  (p) =>
                    Array.isArray(action.partners) &&
                    action.partners.includes(p.slug),
                ) ||
                partners.find((p) => p.slug === action.partners?.[0]) ||
                null;
              return (
                <PrismCommandItem
                  key={action.id}
                  className={"flex h-10 w-full justify-between"}
                  onPress={() => {
                    setBaseAction(action);
                    onOpenChange(false);
                    setQuery("");
                  }}
                  textValue={action.title}
                >
                  <UAvatar
                    backgroundColor={partner?.colors?.[0]}
                    color={partner?.colors?.[1]}
                    fallback={
                      partner?.short ??
                      action.partners?.[0]?.substring(0, 2).toUpperCase() ??
                      "??"
                    }
                    image={partner?.image}
                    size="sm"
                  />
                  <div className="w-full truncate">{action.title}</div>
                  {action.archived && (
                    <ArchiveIcon className="size-3 opacity-50" />
                  )}
                  <div className="text-xs opacity-40">
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
