import { useAppContext } from "~/contexts/AppContext";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UsersIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { LeadCard } from "~/components/features/leads/LeadCard";
import { LeadDetail } from "~/components/features/leads/LeadDetail";
import {
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupInput,
} from "~/components/prism";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchLeads } from "~/lib/supabase.queries";
const leadsSearchSchema = z.object({
  id: z.string().optional(),
});
export const Route = createFileRoute("/app/leads")({
  validateSearch: leadsSearchSchema,
  component: AppLeads,
});
function AppLeads() {
  const { person } = useAppContext();
  const searchParams = Route.useSearch();
  const navigate = useNavigate({
    from: "/app/leads",
  });
  const selectedLeadId = searchParams.id;
  const [searchTerm, setSearchTerm] = useState("");
  const { data: leads = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.leads.all(person.user_id),
    queryFn: fetchLeads,
  });
  const filteredLeads = useMemo(() => {
    if (!searchTerm.trim()) return leads;
    const term = searchTerm.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        l.whatsapp.includes(term) ||
        l.main_need?.toLowerCase().includes(term),
    );
  }, [leads, searchTerm]);
  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return filteredLeads[0] || null;
    return (
      leads.find((l) => l.id === selectedLeadId) || filteredLeads[0] || null
    );
  }, [leads, filteredLeads, selectedLeadId]);
  const handleSelectLead = (id: string) => {
    navigate({
      search: (old) => ({
        ...old,
        id,
      }),
      replace: true,
    });
  };
  return (
    <div className="page-height flex h-full w-full overflow-hidden">
      {/* Coluna Esquerda: Lista de Leads */}
      <div className="flex w-80 shrink-0 flex-col border-r bg-popover xl:w-96">
        <div className="flex flex-col gap-3 border-b p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium tracking-tight text-foreground">
              Leads
            </h1>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {filteredLeads.length}
            </span>
          </div>

          <PrismInputGroup size="sm">
            <PrismInputGroupAddon align="inline-start">
              <SearchIcon className="ml-1 size-4 text-muted-foreground" />
            </PrismInputGroupAddon>
            <PrismInputGroupInput
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
            />
          </PrismInputGroup>
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Carregando leads...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhum lead encontrado.
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
        </div>
      </div>

      {/* Coluna Direita: Detalhe do Lead */}
      <div className="flex-1 overflow-hidden bg-background">
        {selectedLead ? (
          <LeadDetail lead={selectedLead} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
            <UsersIcon className="size-12 opacity-30" />
            <p className="text-sm">
              Selecione um lead para ver o questionário completo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
