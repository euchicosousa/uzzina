import { useState, useEffect } from "react";
import { useNavigate, useFetcher, useLocation } from "react-router";
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
import { DATE_TIME_DISPLAY, SIZE, STATES, type STATE } from "~/lib/CONSTANTS";
import { getFormattedDateTime } from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import { StateIcon } from "./StateIcon";

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
  const fetcher = useFetcher<{ actions: Action[] }>();
  const [query, setQuery] = useState("");
  const location = useLocation();

  // Extract the partner slug if the user is currently looking at a partner page
  const activePartnerMatch = location.pathname.match(
    /^\/app\/partner\/([^/]+)/,
  );
  const activePartnerSlug = activePartnerMatch ? activePartnerMatch[1] : null;

  // Debounce the search query to avoid spamming the database on every keystroke
  useEffect(() => {
    // Check if the query has the 'p:' modifier or is just text
    const hasModifier = query.includes("p:");
    // If it has 'p:', we still need at least 3 characters total (like 'p:a' or 'a p:a') to search
    // Otherwise standard 3 chars rule
    const shouldSearch = hasModifier ? query.length >= 3 : query.length >= 3;

    if (shouldSearch) {
      const delayDebounceFn = setTimeout(() => {
        const searchUrl = new URLSearchParams({ q: query });
        if (activePartnerSlug) {
          searchUrl.append("partner", activePartnerSlug);
        }
        fetcher.load(`/api/search?${searchUrl.toString()}`);
      }, 500); // 500ms debounce

      return () => clearTimeout(delayDebounceFn);
    }
  }, [query, activePartnerSlug]);

  const filteredPartners =
    query.trim() === ""
      ? partners
      : partners.filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.slug.toLowerCase().includes(query.toLowerCase()),
        );

  const searchedActions = fetcher.data?.actions || [];
  const hasModifier = query.includes("p:");
  const shouldSearch = hasModifier ? query.length >= 3 : query.length >= 3;
  const isSearching = fetcher.state === "loading" && shouldSearch;

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
                      navigate(`/app/partner/${partner.slug}`);
                      onOpenChange(false);
                      setQuery("");
                    }}
                    className="flex cursor-pointer gap-2"
                  >
                    <UAvatar
                      fallback={partner.short}
                      size={SIZE.sm}
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
                        className="font-inter flex cursor-pointer items-start justify-between gap-2 py-3"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {partner && (
                            <UAvatar
                              fallback={partner.short}
                              size={SIZE.sm}
                              backgroundColor={partner.colors[0]}
                              color={partner.colors[1]}
                            />
                          )}
                          <div className="truncate">{action.title}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StateIcon state={STATES[action.state as STATE]} />
                          <div className="text-muted-foreground w-30 text-right text-xs whitespace-nowrap">
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
              <div className="text-muted-foreground animate-pulse p-4 text-center text-sm">
                Buscando ações...
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
