import type { Action, Partner } from "~/types";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
// import { ArchiveIcon, SearchIcon } from "lucide-react";
// import { UAvatar } from "~/components/uzzina/UAvatar";
// import { UToggleInput } from "~/components/uzzina/UToggle";
// import { DATE_TIME_DISPLAY, SIZE, PHASES, type PHASE } from "~/lib/CONSTANTS";
// import { getFormattedDateTime } from "~/lib/helpers";
// import { cn } from "~/lib/utils";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  PrismCommand,
  PrismCommandDialog,
  PrismCommandEmpty,
  PrismCommandGroup,
  PrismCommandInput,
  PrismCommandItem,
  PrismCommandList,
} from "~/components/prism";
import { UAvatar } from "../uzzina/UAvatar";

// import { PhaseIcon } from "./PhaseIcon";
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
  return (
    <PrismCommandDialog onOpenChange={onOpenChange} open={open}>
      <PrismCommand>
        <PrismCommandInput placeholder="Faça sua busca..." />
        <PrismCommandList renderEmptyState={() => <PrismCommandEmpty />}>
          {filteredPartners.length > 0 && (
            <PrismCommandGroup aria-label="Parceiros">
              {filteredPartners.map((partner) => (
                <PrismCommandItem
                  key={partner.slug}
                  onPress={() => {
                    navigate({
                      to: `/app/partner/${partner.slug}`,
                    });
                    onOpenChange(false);
                  }}
                >
                  <UAvatar
                    fallback={partner.short}
                    image={partner.image}
                    size="sm"
                  />
                  <div>{partner.title}</div>
                  <div className="opacity-40 text-xs tracking-wide absolute right-4">
                    @{partner.slug}
                  </div>
                </PrismCommandItem>
              ))}
            </PrismCommandGroup>
          )}
        </PrismCommandList>
      </PrismCommand>
    </PrismCommandDialog>
  );
  // <PrismDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
  //   <PrismDialogOverlay isDismissable>
  //     <PrismDialog className="p-0 sm:max-w-xl md:max-w-2xl max-w-2xl" showCloseButton={false}>
  //       <PrismDialogTitle className="sr-only">Busca Global</PrismDialogTitle>
  //     <PrismCombobox
  //       inputValue={query}
  //       menuTrigger="focus"
  //       onInputChange={setQuery}
  //     >
  //       <PrismComboboxInputGroup className="border-0 rounded-none h-14 bg-transparent focus-within:ring-0 focus-within:bg-card">
  //         <SearchIcon className="size-5 text-muted-foreground mr-2 shrink-0" />
  //         <PrismComboboxInput
  //           autoFocus
  //           className={"text-lg"}
  //           placeholder="Faça sua busca aqui (mínimo de 3 caracteres)"
  //         />
  //       </PrismComboboxInputGroup>

  //       <div className="max-h-[60vh] overflow-hidden outline-none xl:max-h-96 border-t">
  //         {query.length > 0 &&
  //           !isSearching &&
  //           filteredPartners.length === 0 &&
  //           searchedActions.length === 0 && (
  //             <div className="p-8 text-center text-muted-foreground">
  //               Nenhum resultado encontrado.
  //             </div>
  //           )}
  //         <PrismListBox aria-label="Resultados da Busca">
  //           {filteredPartners.length > 0 && (
  //             <PrismListBoxSection aria-label="Parceiros">
  //               <PrismListBoxHeader>Parceiros</PrismListBoxHeader>
  //               {filteredPartners.map((partner) => (
  //                 <PrismListBoxItem
  //                   key={partner.id}
  //                   className="flex cursor-pointer gap-2"
  //                   onAction={() => {
  //                     navigate({
  //                       to: "/app/partner/$slug",
  //                       params: {
  //                         slug: partner.slug,
  //                       },
  //                     });
  //                     onOpenChange(false);
  //                   }}
  //                 >
  //                   <UAvatar
  //                     fallback={partner.title.substring(0, 2)}
  //                     size={SIZE.sm}
  //                   />
  //                   <span>{partner.title}</span>
  //                 </PrismListBoxItem>
  //               ))}
  //             </PrismListBoxSection>
  //           )}

  //           {searchedActions.length > 0 && (
  //             <PrismListBoxSection aria-label="Ações Criativas">
  //               <PrismListBoxHeader>Ações Criativas</PrismListBoxHeader>
  //               {searchedActions.map((action) => {
  //                 const phase = PHASES[action.phase as PHASE];
  //                 return (
  //                   <PrismListBoxItem
  //                     key={action.id}
  //                     className="flex cursor-pointer flex-col gap-0.5"
  //                     onAction={() => {
  //                       navigate({
  //                         to: "/app/partner/$slug",
  //                         params: {
  //                           slug: action.partner_slug || "",
  //                         },
  //                       });
  //                       setBaseAction(action);
  //                       onOpenChange(false);
  //                     }}
  //                   >
  //                     <div className="flex items-center gap-2">
  //                       <PhaseIcon phase={action.phase as PHASE} />
  //                       <span className="font-medium">{action.title}</span>
  //                       <span
  //                         className={cn(
  //                           "text-xs px-2 py-0.5 rounded-full border ml-auto font-normal",
  //                           phase.bgClass,
  //                           phase.textClass,
  //                           phase.borderClass,
  //                         )}
  //                       >
  //                         {phase.name}
  //                       </span>
  //                     </div>
  //                     <div className="flex items-center gap-2 text-xs text-muted-foreground pl-7">
  //                       <span>{action.partner_title}</span>
  //                       <span>•</span>
  //                       <span>
  //                         {getFormattedDateTime(
  //                           action.date,
  //                           DATE_TIME_DISPLAY.short,
  //                         )}
  //                       </span>
  //                     </div>
  //                   </PrismListBoxItem>
  //                 );
  //               })}
  //             </PrismListBoxSection>
  //           )}
  //         </PrismListBox>
  //         {isSearching && (
  //           <div className="animate-pulse p-4 text-center text-muted-foreground">
  //             Buscando ações...
  //           </div>
  //         )}
  //       </div>
  //       {searchedActions.length > 0 && (
  //         <div className="flex items-center justify-center border-t p-2">
  //           <UToggleInput
  //             checked={includeArchived}
  //             className="w-auto scale-90 px-3 py-1 opacity-70 hover:opacity-100"
  //             id="searchArchived"
  //             onCheckedChange={(checked) => setIncludeArchived(checked)}
  //           >
  //             <ArchiveIcon className="size-4" /> Ações arquivadas
  //           </UToggleInput>
  //         </div>
  //       )}
  //     </PrismCombobox>
  //   </PrismDialog>
  //   </PrismDialogOverlay>
  // </PrismDialogTrigger>
}
