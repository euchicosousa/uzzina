import type { Action, Partner } from "~/types";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { ArchiveIcon, SearchIcon } from "lucide-react";
import {
  PrismDialogOverlay,
  PrismDialogContent,
  PrismDialogTitle,
  PrismCombobox,
  PrismComboboxInputGroup,
  PrismComboboxInput,
  PrismListBox,
  PrismListBoxItem,
  PrismListBoxSection,
  PrismListBoxHeader,
} from "~/components/old-prism";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { UToggleInput } from "~/components/uzzina/UToggle";
import { DATE_TIME_DISPLAY, SIZE, PHASES, type PHASE } from "~/lib/CONSTANTS";
import { getFormattedDateTime } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
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
    if (shouldSearch) {
      const delayDebounceFn = setTimeout(async () => {
        setIsSearching(true);
        try {
          const supabase = createSupabaseBrowserClient();
          let baseQuery = supabase
            .from("actions")
            .select("*")
            .ilike("title", `%${query}%`);
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
  }, [query, activePartnerSlug, includeArchived]);
  const filteredPartners =
    query.trim() === ""
      ? partners
      : partners.filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.slug.toLowerCase().includes(query.toLowerCase()),
        );
  const searchedActions = searchResults?.actions || [];
  const shouldSearch = query.length >= 3;
  return (
    <PrismDialogOverlay isOpen={open} onOpenChange={onOpenChange}>
      <PrismDialogContent className={"p-0"}>
        <PrismDialogTitle className="sr-only">Busca Global</PrismDialogTitle>
        <PrismCombobox
          inputValue={query}
          menuTrigger="focus"
          onInputChange={setQuery}
        >
          <PrismComboboxInputGroup className="border-0 rounded-none h-14 bg-transparent focus-within:ring-0 focus-within:bg-card">
            <SearchIcon className="size-5 text-muted-foreground mr-2 shrink-0" />
            <PrismComboboxInput
              autoFocus
              className={"text-lg"}
              placeholder="Faça sua busca aqui (mínimo de 3 caracteres)"
            />
          </PrismComboboxInputGroup>

          <div className="max-h-[60vh] overflow-hidden outline-none xl:max-h-96 border-t">
            {query.length > 0 &&
              !isSearching &&
              filteredPartners.length === 0 &&
              searchedActions.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum resultado encontrado.
                </div>
              )}
            <PrismListBox aria-label="Resultados da Busca">
              {filteredPartners.length > 0 && (
                <PrismListBoxSection aria-label="Parceiros">
                  <PrismListBoxHeader>Parceiros</PrismListBoxHeader>
                  {filteredPartners.map((partner) => (
                    <PrismListBoxItem
                      key={partner.id}
                      className="flex cursor-pointer gap-2"
                      onAction={() => {
                        navigate({
                          to: "/app/partner/$slug",
                          params: {
                            slug: partner.slug,
                          },
                        });
                        onOpenChange(false);
                        setQuery("");
                      }}
                      textValue={partner.title}
                    >
                      <UAvatar
                        backgroundColor={partner.colors[0]}
                        color={partner.colors[1]}
                        fallback={partner.short}
                        image={partner.image}
                        size={SIZE.md}
                      />
                      <div>{partner.title}</div>
                    </PrismListBoxItem>
                  ))}
                </PrismListBoxSection>
              )}
              {shouldSearch && searchedActions.length > 0 && (
                <PrismListBoxSection aria-label="Ações">
                  <PrismListBoxHeader>Ações</PrismListBoxHeader>
                  {searchedActions.map((action) => {
                    const partner = partners.find(
                      (p) => p.slug === action.partners[0],
                    );
                    return (
                      <PrismListBoxItem
                        key={action.id}
                        className="flex cursor-pointer items-center justify-between gap-2 py-3"
                        onAction={() => {
                          setBaseAction(action);
                          onOpenChange(false);
                          setQuery("");
                        }}
                        textValue={action.title}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {partner && (
                            <UAvatar
                              backgroundColor={partner.colors[0]}
                              color={partner.colors[1]}
                              fallback={partner.short}
                              image={partner.image}
                              size={SIZE.sm}
                            />
                          )}
                          <div
                            className={cn(
                              "truncate",
                              action.archived && "line-through opacity-50",
                            )}
                          >
                            {action.title}
                          </div>
                          {action.archived && (
                            <ArchiveIcon className="mr-1 size-3 shrink-0 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <PhaseIcon
                            phase={PHASES[(action.phase as PHASE) || "idea"]}
                            size="sm"
                            variant="icon"
                          />
                          <div className="w-30 text-right text-xs whitespace-nowrap text-muted-foreground">
                            {getFormattedDateTime(
                              action.date,
                              DATE_TIME_DISPLAY.DateMonthTime,
                            )}
                          </div>
                        </div>
                      </PrismListBoxItem>
                    );
                  })}
                </PrismListBoxSection>
              )}
            </PrismListBox>
            {isSearching && (
              <div className="animate-pulse p-4 text-center text-muted-foreground">
                Buscando ações...
              </div>
            )}
          </div>
          {searchedActions.length > 0 && (
            <div className="flex items-center justify-center border-t p-2">
              <UToggleInput
                checked={includeArchived}
                className="w-auto scale-90 px-3 py-1 opacity-70 hover:opacity-100"
                id="searchArchived"
                onCheckedChange={(checked) => setIncludeArchived(checked)}
              >
                <ArchiveIcon className="size-4" /> Ações arquivadas
              </UToggleInput>
            </div>
          )}
        </PrismCombobox>
      </PrismDialogContent>
    </PrismDialogOverlay>
  );
}
