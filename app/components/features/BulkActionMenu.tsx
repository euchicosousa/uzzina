import {
  ArchiveIcon,
  CalendarIcon,
  FlagIcon,
  KanbanIcon,
  PaletteIcon,
  SendIcon,
  TagIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toHex } from "~/components/features/action-drawer/PartnerColorPicker";
import { toast } from "sonner";
import {
  BulkArchiveDialog,
  BulkColorDialog,
  BulkDateTimeDialog,
  type BulkDateTimeResult,
  BulkResponsiblesDialog,
  BulkSprintDialog,
} from "~/components/features/bulk";
import { useAppContext } from "~/contexts/AppContext";
import { useActionMutations } from "~/hooks/useActionMutations";
import { useMultiSelection } from "~/hooks/useMultiSelection";
import { CATEGORIES, PHASES, PRIORITIES, STATIONS } from "~/lib/CONSTANTS";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import type { Partner } from "~/types";
import {
  PrismButton,
  PrismMenu,
  PrismMenuContent,
  PrismMenuItem,
  PrismMenuSeparator,
  PrismMenuSub,
  PrismMenuSubContent,
  PrismMenuSubTrigger,
  PrismMenuTrigger,
} from "../prism";
import { Icons } from "../uzzina/UIcons";

export function BulkActionMenu() {
  // ─── Multi-seleção ───────────────────────────────────────────────────────────
  const { isSelectionMode, selectedIds, clearSelection } = useMultiSelection();
  const _queryClient = useQueryClient();
  const { handleBulkAction, handleBulkDateOnly, handleBulkTimeOnly } =
    useActionMutations();

  // ─── Dados globais do app loader ─────────────────────────────────────────────
  const { partners } = useAppContext();
  const { data: people = [] } = useQuery({
    queryKey: QUERY_KEYS.people(),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });
  const params = useParams({
    strict: false,
  }) as Record<string, string | undefined>;

  // ─── Parceiro da página atual ────────────────────────────────────────────────
  const currentPartner: Partner | undefined =
    params.slug && params.slug !== "new"
      ? partners.find((p) => p.slug === params.slug)
      : undefined;

  const partnerColors = useMemo(() => {
    if (selectedIds.length === 0) return [];

    const cachedQueries = _queryClient.getQueriesData<unknown>({
      queryKey: QUERY_KEYS.actions.all(),
    });

    const selectedPartnerSlugs = new Set<string>();

    for (const [_, data] of cachedQueries) {
      if (Array.isArray(data)) {
        for (const act of data) {
          if (
            act &&
            typeof act === "object" &&
            "id" in act &&
            selectedIds.includes(String(act.id))
          ) {
            if ("partners" in act && Array.isArray(act.partners)) {
              for (const slug of act.partners) {
                if (slug) selectedPartnerSlugs.add(String(slug));
              }
            } else if ("partner_slug" in act && act.partner_slug) {
              selectedPartnerSlugs.add(String(act.partner_slug));
            }
          }
        }
      }
    }

    const colorsSet = new Set<string>();
    if (selectedPartnerSlugs.size > 0) {
      for (const slug of selectedPartnerSlugs) {
        const partner = partners.find((p) => p.slug === slug);
        if (partner?.colors) {
          for (const c of partner.colors) {
            if (c) colorsSet.add(toHex(c));
          }
        }
      }
    }

    if (colorsSet.size === 0) {
      if (currentPartner?.colors && currentPartner.colors.length > 0) {
        for (const c of currentPartner.colors) {
          if (c) colorsSet.add(toHex(c));
        }
      } else {
        for (const partner of partners) {
          if (partner.colors) {
            for (const c of partner.colors) {
              if (c) colorsSet.add(toHex(c));
            }
          }
        }
      }
    }

    return Array.from(colorsSet);
  }, [selectedIds, partners, currentPartner, _queryClient]);

  // ─── Estados dos dialogs ─────────────────────────────────────────────────────
  const [dateTimeOpen, setDateTimeOpen] = useState(false);
  const [responsiblesOpen, setResponsiblesOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [sprintOpen, setSprintOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  // Early return: nada a mostrar fora do modo de seleção
  if (!isSelectionMode) return null;

  // ─── Helpers de ação em lote ─────────────────────────────────────────────────
  const performBulkAction = (updates: Record<string, unknown>) => {
    handleBulkAction(selectedIds, updates);
    clearSelection();
    toast.success(`${selectedIds.length} ação(ões) atualizada(s)!`);
  };

  // ─── Handlers: Data/Hora ─────────────────────────────────────────────────────
  const applyDateTime = (result: BulkDateTimeResult) => {
    if (result.mode === "datetime") {
      performBulkAction({
        date: result.date,
      });
    } else if (result.mode === "date_only") {
      handleBulkDateOnly(selectedIds, result.dateOnly);
      clearSelection();
      toast.success(`${selectedIds.length} ação(ões) atualizada(s)!`);
    } else {
      handleBulkTimeOnly(selectedIds, result.timeOnly);
      clearSelection();
      toast.success(`${selectedIds.length} ação(ões) atualizada(s)!`);
    }
  };

  // ─── Handlers: Responsáveis ──────────────────────────────────────────────────
  const applyResponsibles = (responsibles: string[]) => {
    performBulkAction({
      responsibles,
    });
  };

  // ─── Handlers: Cor ───────────────────────────────────────────────────────────
  const applyColor = (color: string) => {
    performBulkAction({
      color,
    });
  };

  // ─── Handlers: Sprints ───────────────────────────────────────────────────────
  const applySprints = (sprints: string[] | null) => {
    performBulkAction({
      sprints,
    });
  };

  // ─── Handlers: Arquivar ──────────────────────────────────────────────────────
  const applyArchive = () => {
    performBulkAction({
      archived: true,
    });
    setArchiveOpen(false);
  };

  // ─── Handler: Enviar para Aprovação ─────────────────────────────────────
  const handleSendForApproval = () => {
    if (!currentPartner || selectedIds.length === 0) return;
    const ids = selectedIds.join(",");
    const url = `${window.location.origin}/dash/review/${currentPartner.slug}?ids=${ids}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link de aprovação copiado!", {
        description: url,
        duration: 5000,
      });
    });
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Dialogs Modulares ───────────────────────────────────────────────── */}
      <BulkDateTimeDialog
        onApply={applyDateTime}
        onOpenChange={setDateTimeOpen}
        open={dateTimeOpen}
      />

      <BulkResponsiblesDialog
        onApply={applyResponsibles}
        onOpenChange={setResponsiblesOpen}
        open={responsiblesOpen}
        people={people}
        selectedCount={selectedIds.length}
      />

      <BulkColorDialog
        onApply={applyColor}
        onOpenChange={setColorOpen}
        open={colorOpen}
        partnerColors={partnerColors}
        selectedCount={selectedIds.length}
      />

      <BulkSprintDialog
        onApply={applySprints}
        onOpenChange={setSprintOpen}
        open={sprintOpen}
        people={people}
        selectedCount={selectedIds.length}
      />

      <BulkArchiveDialog
        onConfirm={applyArchive}
        onOpenChange={setArchiveOpen}
        open={archiveOpen}
        selectedCount={selectedIds.length}
      />

      {/* ── Dropdown principal de ações em lote ───────────────────────────── */}
      <PrismMenu>
        <PrismMenuTrigger>
          <PrismButton
            isDisabled={selectedIds.length === 0}
            variant="secondary"
          >
            {selectedIds.length > 0
              ? `${selectedIds.length} Selecionada${selectedIds.length > 1 ? "s" : ""}`
              : "Selecione as ações"}
          </PrismButton>
        </PrismMenuTrigger>
        <PrismMenuContent className="w-56" placement="top end">
          {/* Fase */}
          <PrismMenuSub>
            <PrismMenuSubTrigger textValue="Fase">
              <KanbanIcon /> Alterar Fase
            </PrismMenuSubTrigger>
            <PrismMenuSubContent>
              {Object.values(PHASES)
                .sort((a, b) => a.order - b.order)
                .map((phase) => (
                  <PrismMenuItem
                    key={phase.slug}
                    onAction={() =>
                      performBulkAction({
                        phase: phase.slug,
                      })
                    }
                    textValue={phase.title}
                  >
                    <Icons
                      slug={phase.slug}
                      style={{
                        color: phase.color,
                      }}
                    />
                    {phase.title}
                  </PrismMenuItem>
                ))}
            </PrismMenuSubContent>
          </PrismMenuSub>

          {/* Estação */}
          <PrismMenuSub>
            <PrismMenuSubTrigger textValue="Estação">
              <KanbanIcon /> Alterar Estação
            </PrismMenuSubTrigger>
            <PrismMenuSubContent>
              {Object.values(STATIONS).map((station) => (
                <PrismMenuItem
                  key={station.slug}
                  onAction={() =>
                    performBulkAction({
                      station: station.slug,
                    })
                  }
                  textValue={station.title}
                >
                  <Icons
                    slug={station.slug}
                    style={{
                      color: station.color,
                    }}
                  />

                  {station.title}
                </PrismMenuItem>
              ))}
            </PrismMenuSubContent>
          </PrismMenuSub>

          {/* Categoria */}
          <PrismMenuSub>
            <PrismMenuSubTrigger textValue="Categoria">
              <TagIcon /> Alterar Categoria
            </PrismMenuSubTrigger>
            <PrismMenuSubContent className="max-h-72 overflow-y-auto">
              {Object.values(CATEGORIES)
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((category) => (
                  <PrismMenuItem
                    key={category.slug}
                    onAction={() =>
                      performBulkAction({
                        category: category.slug,
                      })
                    }
                    textValue={category.title}
                  >
                    <Icons
                      slug={category.slug}
                      style={{
                        color: category.color,
                      }}
                    />
                    {category.title}
                  </PrismMenuItem>
                ))}
            </PrismMenuSubContent>
          </PrismMenuSub>

          {/* Prioridade */}
          <PrismMenuSub>
            <PrismMenuSubTrigger textValue="Prioridade">
              <FlagIcon /> Alterar Prioridade
            </PrismMenuSubTrigger>
            <PrismMenuSubContent>
              {Object.values(PRIORITIES).map((priority) => {
                const className =
                  priority.slug === "low"
                    ? "text-info"
                    : priority.slug === "high"
                      ? "text-error"
                      : "text-warning";
                return (
                  <PrismMenuItem
                    key={priority.slug}
                    className={className}
                    onAction={() =>
                      performBulkAction({
                        priority: priority.slug,
                      })
                    }
                    textValue={priority.title}
                  >
                    <FlagIcon />
                    {priority.title}
                  </PrismMenuItem>
                );
              })}
            </PrismMenuSubContent>
          </PrismMenuSub>

          {/* Sprints — abre o dialog de atribuição de sprints */}
          <PrismMenuItem
            onAction={() => setSprintOpen(true)}
            textValue="Sprints"
          >
            <Icons slug="sprint" /> Alterar Sprints
          </PrismMenuItem>

          {/* Data e Hora */}
          <PrismMenuItem
            onAction={() => setDateTimeOpen(true)}
            textValue="Data e Hora"
          >
            <CalendarIcon /> Alterar Data e Hora
          </PrismMenuItem>

          {/* Cor — abre o dialog com as cores do parceiro atual */}
          <PrismMenuItem
            onAction={() => setColorOpen(true)}
            textValue="Cor"
          >
            <PaletteIcon /> Alterar Cor
          </PrismMenuItem>

          {/* Responsáveis — abre o dialog de seleção de pessoas */}
          <PrismMenuItem
            onAction={() => setResponsiblesOpen(true)}
            textValue="Responsáveis"
          >
            <UserIcon /> Alterar Responsáveis
          </PrismMenuItem>

          <PrismMenuSeparator />

          {/* Enviar para Aprovação */}
          <PrismMenuItem
            onAction={handleSendForApproval}
            textValue="Enviar para Aprovação"
          >
            <SendIcon /> Enviar para Aprovação
          </PrismMenuItem>

          <PrismMenuSeparator />

          {/* Arquivar — abre o dialog de confirmação */}
          <PrismMenuItem
            onAction={() => setArchiveOpen(true)}
            textValue="Arquivar"
          >
            <ArchiveIcon /> Arquivar
          </PrismMenuItem>

          <PrismMenuSeparator />

          {/* Limpar Seleção */}
          <PrismMenuItem onAction={clearSelection} textValue="Limpar Seleção">
            <XIcon /> Limpar Seleção
          </PrismMenuItem>
        </PrismMenuContent>
      </PrismMenu>
    </>
  );
}
