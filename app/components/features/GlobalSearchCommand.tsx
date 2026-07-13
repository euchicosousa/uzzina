import type { Action } from "~/types";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { ArchiveIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandSeparator,
} from "~/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
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
  const [searchResults, setSearchResults] = useState<{ actions: Action[] } | null>(null);
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

          // 1. Slugs permitidos para o usuário
          const partnerSlugs = partners.map((p) => p.slug);
          if (partnerSlugs.length === 0) {
            setSearchResults({ actions: [] });
            return;
          }

          let searchPartnerSlugs = partnerSlugs;

          // 2. Filtro de parceiro ativo se estiver na página dele
          if (activePartnerSlug) {
            if (partnerSlugs.includes(activePartnerSlug)) {
              searchPartnerSlugs = [activePartnerSlug];
            } else {
              setSearchResults({ actions: [] });
              return;
            }
          }

          // 3. Modificador de busca por parceiro explícito (p:parceiro)
          const partnerMatch = query.match(/p:(\S+)/);
          const explicitPartner = partnerMatch ? partnerMatch[1] : null;
          const cleanQuery = query.replace(/p:\S+/, "").trim();

          if (explicitPartner) {
            searchPartnerSlugs = searchPartnerSlugs.filter((slug) =>
              slug.includes(explicitPartner.toLowerCase()),
            );
            if (searchPartnerSlugs.length === 0) {
              setSearchResults({ actions: [] });
              return;
            }
          }

          let supabaseQuery = supabase
            .from("actions")
            .select("*")
            .overlaps("partners", searchPartnerSlugs)
            .order("date", { ascending: false });

          if (!includeArchived) {
            supabaseQuery = supabaseQuery.or("archived.is.false,archived.is.null");
          }

          if (cleanQuery.length > 0) {
            supabaseQuery = supabaseQuery.or(
              `title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`,
            );
          }

          const { data: actions, error } = await supabaseQuery.limit(50);

          if (error) {
            throw error;
          }

          setSearchResults({ actions: (actions as Action[]) || [] });
        } catch (error) {
          console.error("Error searching actions:", error);
          setSearchResults({ actions: [] });
        } finally {
          setIsSearching(false);
        }
      }, 500);

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
  const shouldSearch = query.length >= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="squircle rounded-2xl p-0">
        <DialogTitle className="sr-only">Busca Global</DialogTitle>
        <DialogDescription className="sr-only">
          Pesquise Parceiros e Ações
        </DialogDescription>
        <Command className="squircle rounded-2xl" shouldFilter={false}>
          <CommandInput
            placeholder="Faça sua busca aqui (mínimo de 3 caracteres)"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[60vh] overflow-y-auto p-2 outline-none xl:max-h-96">
            {query.length > 0 &&
              !isSearching &&
              filteredPartners.length === 0 &&
              searchedActions.length === 0 && (
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              )}

            {filteredPartners.length > 0 && (
              <CommandGroup heading="Parceiros">
                {filteredPartners.map((partner) => (
                  <CommandItem
                    key={partner.id}
                    value={`partner-${partner.slug}`}
                    onSelect={() => {
                      navigate({ to: "/app/partner/$slug", params: { slug: partner.slug } });
                      onOpenChange(false);
                      setQuery("");
                    }}
                    className="flex cursor-pointer gap-2"
                  >
                    <UAvatar
                      fallback={partner.short}
                      size={SIZE.sm}
                      image={partner.image}
                      backgroundColor={partner.colors[0]}
                      color={partner.colors[1]}
                    />
                    <div>{partner.title}</div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {shouldSearch && searchedActions.length > 0 && (
              <>
                <CommandSeparator className="my-2" />
                <CommandGroup heading="Ações">
                  {searchedActions.map((action) => {
                    // Encontra o parceiro para pegar a cor e a logo (se existir um partner principal na ação)
                    const partner = partners.find(
                      (p) => p.slug === action.partners[0], // Usamos o primeiro parceiro para simplificar
                    );
                    return (
                      <CommandItem
                        key={action.id}
                        value={`action-${action.id}`}
                        onSelect={() => {
                          setBaseAction(action);
                          onOpenChange(false);
                          setQuery("");
                        }}
                        className="flex cursor-pointer items-center justify-between gap-2 py-3"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {partner && (
                            <UAvatar
                              fallback={partner.short}
                              size={SIZE.sm}
                              image={partner.image}
                              backgroundColor={partner.colors[0]}
                              color={partner.colors[1]}
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
                            variant="icon"
                            size="sm"
                          />
                          <div className="w-30 text-right text-xs whitespace-nowrap text-muted-foreground">
                            {getFormattedDateTime(
                              action.date,
                              DATE_TIME_DISPLAY.DateMonthTime,
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}

            {isSearching && (
              <div className="animate-pulse p-4 text-center text-sm text-muted-foreground">
                Buscando ações...
              </div>
            )}
          </CommandList>
          <div className="flex items-center justify-center border-t p-2">
            <UToggleInput
              id="searchArchived"
              checked={includeArchived}
              className="w-auto scale-90 px-3 py-1 text-sm opacity-70 hover:opacity-100"
              onCheckedChange={(checked) => setIncludeArchived(checked)}
            >
              <ArchiveIcon className="size-4" /> Ações arquivadas
            </UToggleInput>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
