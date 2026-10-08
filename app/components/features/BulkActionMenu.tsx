import {
  ArchiveIcon,
  CalendarIcon,
  FlagIcon,
  KanbanIcon,
  LoaderIcon,
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
import { CATEGORIES, PHASES, PRIORITIES } from "~/lib/CONSTANTS";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import type { BulkActionResult } from "~/lib/supabase.mutations";
import type { ActionPatchInput } from "~/utils/validation";
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
  const {
    isSelectionMode,
    selectedIds,
    clearSelection,
    removeSelected,
    eligibleActions,
  } = useMultiSelection();
  const _queryClient = useQueryClient();
  const { handleBulkAction, handleBulkDateOnly, handleBulkTimeOnly } =
    useActionMutations();

  // ─── Dados globais do app loader ─────────────────────────────────────────────
  const { partners, person } = useAppContext();
  const { data: people = [] } = useQuery({
    queryKey: QUERY_KEYS.people(person.user_id),
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

    const selectedPartnerSlugs = new Set(
      eligibleActions
        .filter((action) => selectedIds.includes(action.id))
        .flatMap((action) => action.partners),
    );

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
  }, [selectedIds, partners, currentPartner, eligibleActions]);

  // ─── Estados dos dialogs ─────────────────────────────────────────────────────
  const [dateTimeOpen, setDateTimeOpen] = useState(false);
  const [responsiblesOpen, setResponsiblesOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [sprintOpen, setSprintOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const [conflictedIds, setConflictedIds] = useState<string[]>([]);

  // Early return: nada a mostrar fora do modo de seleção
  if (!isSelectionMode) return null;

  const targets = eligibleActions.filter((action) =>
    selectedIds.includes(action.id),
  );
  const effectiveCount = targets.length;
  const reloadConflicts = () => {
    void _queryClient
      .invalidateQueries(
        { queryKey: QUERY_KEYS.actions.all() },
        { throwOnError: true },
      )
      .then(() => setConflictedIds([]))
      .catch(() =>
        toast.error(
          "Não foi possível recarregar. Tente novamente antes de salvar.",
          { position: "top-center" },
        ),
      );
  };
  const finishBulk = (result: BulkActionResult) => {
    removeSelected(result.succeededIds);
    if (result.succeededIds.length > 0)
      toast.success(`${result.succeededIds.length} ação(ões) atualizada(s)!`, {
        position: "top-center",
      });
    setConflictedIds((previous) => [
      ...new Set([...previous, ...result.conflicts.map((item) => item.id)]),
    ]);
    const title = (id: string) =>
      targets.find((action) => action.id === id)?.title || id;
    const errors = [
      ...result.failed.map((item) => `${title(item.id)}: ${item.reason}`),
      ...result.conflicts.map(
        (item) =>
          `${title(item.id)}: mudou desde a seleção. Recarregue e confira antes de tentar novamente.`,
      ),
    ];
    if (errors.length > 0)
      toast.error(`${errors.length} ação(ões) não atualizada(s).`, {
        position: "top-center",
        description: errors.join("\n"),
        duration: 10000,
        ...(result.conflicts.length > 0
          ? {
              action: {
                label: "Recarregar ações",
                onClick: reloadConflicts,
              },
            }
          : {}),
      });
  };
  const runBulk = async (operation: () => Promise<BulkActionResult>) => {
    if (targets.length === 0 || isProcessing) return;
    if (targets.some((action) => conflictedIds.includes(action.id))) {
      toast.error(
        "Recarregue e confira as ações em conflito antes de tentar novamente.",
        {
          position: "top-center",
          action: { label: "Recarregar ações", onClick: reloadConflicts },
        },
      );
      return;
    }
    setIsProcessing(true);
    try {
      finishBulk(await operation());
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Falha ao atualizar ações em lote.",
      );
    } finally {
      setIsProcessing(false);
    }
  };
  const performBulkAction = (updates: ActionPatchInput) =>
    runBulk(() => handleBulkAction(targets, updates));
  const applyDateTime = (result: BulkDateTimeResult) =>
    runBulk(() => {
      if (result.mode === "datetime")
        return handleBulkAction(targets, { date: result.date });
      if (result.mode === "date_only")
        return handleBulkDateOnly(targets, result.dateOnly);
      return handleBulkTimeOnly(targets, result.timeOnly);
    });

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
  const applyArchive = async () => {
    setArchiveOpen(false);
    await performBulkAction({
      archived: true,
    });
  };

  // ─── Handler: Enviar para Aprovação ─────────────────────────────────────
  const handleSendForApproval = async () => {
    const targetIds = targets.map((action) => action.id);
    if (!currentPartner || targetIds.length === 0 || isGeneratingLink) return;
    setIsGeneratingLink(true);
    try {
      const { createSupabaseBrowserClient } =
        await import("~/lib/supabase.client");
      const supabase = createSupabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        toast.error("Sessão não encontrada para gerar link.");
        return;
      }

      const res = await fetch("/api/review-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          partner_slug: currentPartner.slug,
          action_ids: targetIds,
        }),
      });

      if (!res.ok) {
        const errorJson = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        toast.error(errorJson.error || "Falha ao gerar link de revisão.");
        return;
      }

      const data = (await res.json()) as { link: { url: string } };
      const fullUrl = `${window.location.origin}${data.link.url}`;
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link seguro de revisão copiado!", {
        description: fullUrl,
        duration: 5000,
      });
    } catch (err) {
      console.error("Erro ao gerar link de revisão:", err);
      toast.error("Erro ao gerar link de revisão.");
    } finally {
      setIsGeneratingLink(false);
    }
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
        selectedCount={effectiveCount}
      />

      <BulkColorDialog
        onApply={applyColor}
        onOpenChange={setColorOpen}
        open={colorOpen}
        partnerColors={partnerColors}
        selectedCount={effectiveCount}
      />

      <BulkSprintDialog
        onApply={applySprints}
        onOpenChange={setSprintOpen}
        open={sprintOpen}
        people={people}
        selectedCount={effectiveCount}
      />

      <BulkArchiveDialog
        onConfirm={applyArchive}
        onOpenChange={setArchiveOpen}
        open={archiveOpen}
        selectedCount={effectiveCount}
      />

      {/* ── Dropdown principal de ações em lote ───────────────────────────── */}
      <PrismMenu>
        <PrismMenuTrigger>
          <PrismButton
            isDisabled={effectiveCount === 0 || isProcessing}
            variant="secondary"
          >
            {isProcessing ? (
              <span className="flex items-center gap-1.5">
                <LoaderIcon className="size-4 animate-spin" /> Atualizando...
              </span>
            ) : effectiveCount > 0 ? (
              `${effectiveCount} Selecionada${effectiveCount > 1 ? "s" : ""}`
            ) : (
              "Selecione as ações"
            )}
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
          <PrismMenuItem onAction={() => setColorOpen(true)} textValue="Cor">
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

          {/* Compartilhar para Revisão */}
          <PrismMenuItem
            isDisabled={!currentPartner || isGeneratingLink}
            onAction={handleSendForApproval}
            textValue="Compartilhar para Revisão"
          >
            <SendIcon /> Compartilhar para Revisão
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
