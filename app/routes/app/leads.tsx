import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { useAppContext } from "~/contexts/AppContext";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import {
  ChevronLeftIcon,
  SearchIcon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { z } from "zod";
import { LeadCard } from "~/components/features/leads/LeadCard";
import { LeadDetail } from "~/components/features/leads/LeadDetail";
import {
  PrismButton,
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupInput,
} from "~/components/prism";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { cn } from "~/lib/utils";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchLeads } from "~/lib/supabase.queries";
const leadsSearchSchema = z.object({
  id: z.string().optional(),
});
export const Route = createFileRoute("/app/leads")({
  validateSearch: leadsSearchSchema,
  component: AppLeads,
});

// Matches Tailwind `md` (also used by the partner page): below it, a 320px list leaves under 450px
// for the detail, so phones show either the list or the detail, never both.
const SIDE_BY_SIDE_MIN_WIDTH = 768;

function DetailMessage({
  children,
  icon,
  role,
}: {
  children: ReactNode;
  icon: ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div
        className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-secondary-foreground"
        role={role}
      >
        {icon}
        <p className="text-sm [overflow-wrap:anywhere]">{children}</p>
      </div>
      <AppBarSpacer />
    </div>
  );
}

function AppLeads() {
  const { person } = useAppContext();
  const searchParams = Route.useSearch();
  const navigate = useNavigate({
    from: "/app/leads",
  });
  const router = useRouter();
  const isDesktop = useIsDesktop(SIDE_BY_SIDE_MIN_WIDTH);

  const selectedLeadId = searchParams.id;
  const [searchTerm, setSearchTerm] = useState("");
  // Visit-scoped view state: kept in refs so a list that unmounts on phones can be restored.
  const listScrollTop = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  // True once this visit pushed the detail on top of the list, so Back returns to the list.
  const detailFollowsList = useRef(false);
  const pendingFocus = useRef<"detail" | "list" | null>(null);
  const lastOpenedId = useRef<string | undefined>(undefined);

  const {
    data: leads,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.leads.all(person.user_id),
    queryFn: fetchLeads,
  });
  const loadFailed = isError && !leads;

  const filteredLeads = useMemo(() => {
    const all = leads ?? [];
    if (!searchTerm.trim()) return all;
    const term = searchTerm.toLowerCase();
    return all.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        l.whatsapp.includes(term) ||
        l.main_need?.toLowerCase().includes(term),
    );
  }, [leads, searchTerm]);

  // An explicit id always wins and is never replaced by another lead; only desktop, which shows
  // both columns, falls back to the first lead when no id is present.
  const requestedLead = useMemo(
    () =>
      selectedLeadId
        ? (leads?.find((l) => l.id === selectedLeadId) ?? null)
        : null,
    [leads, selectedLeadId],
  );
  const selectedLead =
    requestedLead ??
    (isDesktop && !selectedLeadId ? (filteredLeads[0] ?? null) : null);

  const showsList = isDesktop || !selectedLeadId;
  const showsDetail = isDesktop || Boolean(selectedLeadId);
  const showsBackButton = !isDesktop && Boolean(selectedLeadId);

  useLayoutEffect(() => {
    if (showsList && listRef.current) {
      listRef.current.scrollTop = listScrollTop.current;
    }
  }, [showsList]);

  useEffect(() => {
    if (pendingFocus.current === "detail" && showsBackButton) {
      pendingFocus.current = null;
      backButtonRef.current?.focus({ preventScroll: true });
    } else if (pendingFocus.current === "list" && showsList) {
      pendingFocus.current = null;
      const id = lastOpenedId.current;
      const card = id
        ? Array.from(
            listRef.current?.querySelectorAll<HTMLElement>("[data-lead-id]") ??
              [],
          ).find((element) => element.dataset.leadId === id)
        : undefined;
      card?.focus({ preventScroll: true });
    }
  }, [showsBackButton, showsList]);

  const handleSelectLead = (id: string) => {
    lastOpenedId.current = id;
    if (isDesktop) {
      // Side by side: choosing a lead is not a page change.
      navigate({
        search: (old) => ({
          ...old,
          id,
        }),
        replace: true,
      });
      return;
    }
    // Phone: the detail is its own screen, so it gets its own history entry.
    detailFollowsList.current = true;
    pendingFocus.current = "detail";
    navigate({
      search: (old) => ({
        ...old,
        id,
      }),
    });
  };

  const handleBackToList = () => {
    pendingFocus.current = "list";
    if (detailFollowsList.current) {
      router.history.back();
      return;
    }
    // Opened by link or reload: there is no list entry before this one, and going back could
    // leave the app, so replace the detail with the list instead.
    navigate({
      search: (old) => ({
        ...old,
        id: undefined,
      }),
      replace: true,
    });
  };

  const renderDetail = () => {
    if (selectedLead) {
      return <LeadDetail key={selectedLead.id} lead={selectedLead} />;
    }
    if (selectedLeadId && isLoading) {
      return (
        <DetailMessage
          icon={<UsersIcon className="size-12 opacity-30" />}
          role="status"
        >
          Carregando lead...
        </DetailMessage>
      );
    }
    if (selectedLeadId && loadFailed) {
      return (
        <DetailMessage
          icon={<TriangleAlertIcon className="size-12 opacity-30" />}
          role="alert"
        >
          Não foi possível carregar este lead. Use “Tentar novamente” na lista
          de leads.
        </DetailMessage>
      );
    }
    if (selectedLeadId) {
      return (
        <DetailMessage
          icon={<UsersIcon className="size-12 opacity-30" />}
          role="alert"
        >
          Este lead não foi encontrado ou você não tem acesso a ele.
        </DetailMessage>
      );
    }
    return (
      <DetailMessage icon={<UsersIcon className="size-12 opacity-30" />}>
        Selecione um lead para ver o questionário completo.
      </DetailMessage>
    );
  };

  return (
    <div className="page-height flex h-full w-full overflow-hidden">
      {/* Lista de Leads */}
      {showsList && (
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-col bg-popover",
            isDesktop ? "w-80 shrink-0 border-r xl:w-96" : "w-full",
          )}
        >
          <div className="flex flex-col gap-3 border-b p-4 md:p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-medium tracking-tight text-foreground">
                Leads
              </h1>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                {filteredLeads.length}
              </span>
            </div>

            <PrismInputGroup size="sm">
              <PrismInputGroupAddon align="inline-start">
                <SearchIcon className="ml-1 size-4" />
              </PrismInputGroupAddon>
              <PrismInputGroupInput
                aria-label="Buscar leads"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
              />
            </PrismInputGroup>
          </div>

          <div
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4"
            onScroll={(e) => {
              listScrollTop.current = e.currentTarget.scrollTop;
            }}
            ref={listRef}
          >
            {isLoading ? (
              <div
                className="p-8 text-center text-sm text-secondary-foreground"
                role="status"
              >
                Carregando leads...
              </div>
            ) : loadFailed ? (
              <div
                className="flex flex-col items-center gap-3 p-8 text-center text-sm text-secondary-foreground"
                role="alert"
              >
                <p>Não foi possível carregar os leads.</p>
                <PrismButton onPress={() => refetch()} size="sm">
                  Tentar novamente
                </PrismButton>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-sm text-secondary-foreground">
                {leads?.length
                  ? "Nenhum lead encontrado."
                  : "Nenhum lead recebido ainda."}
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  isSelected={selectedLead?.id === lead.id}
                  lead={lead}
                  onClick={() => handleSelectLead(lead.id)}
                />
              ))
            )}
            <AppBarSpacer />
          </div>
        </div>
      )}

      {/* Detalhe do Lead */}
      {showsDetail && (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
          {showsBackButton && (
            <div className="flex shrink-0 items-center border-b px-2 py-2">
              <PrismButton
                onPress={handleBackToList}
                ref={backButtonRef}
                size="sm"
                variant="ghost"
              >
                <ChevronLeftIcon />
                Voltar para leads
              </PrismButton>
            </div>
          )}
          {renderDetail()}
        </div>
      )}
    </div>
  );
}
