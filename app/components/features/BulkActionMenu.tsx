import {
  ArchiveIcon,
  CalendarIcon,
  FlagIcon,
  KanbanIcon,
  PaletteIcon,
  TagIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { ULoader } from "~/components/uzzina/ULoader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getTimeForCategoryChange } from "~/utils/factory";
import { toast } from "sonner";
import {
  BulkArchiveDialog,
  BulkDateTimeDialog,
  type BulkDateTimeResult,
  BulkResponsiblesDialog,
  BulkSprintDialog,
} from "~/components/features/bulk";
import { useAppContext } from "~/contexts/AppContext";
import { useActionMutations } from "~/hooks/useActionMutations";
import { useMultiSelection } from "~/hooks/useMultiSelection";
import { usePartnerTopics } from "~/hooks/usePartnerTopics";
import { getSharedPartnerSet, groupTopicsByPartner } from "~/utils/topics";
import { CATEGORIES, PHASES, PRIORITIES } from "~/lib/CONSTANTS";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import type { BulkActionResult } from "~/lib/supabase.mutations";
import type { ActionPatchInput } from "~/utils/validation";
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
import { UIcons } from "../uzzina/UIcons";

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
  // Topics can change in bulk only when every selected action has the same partners.
  const { topics } = usePartnerTopics();
  const sharedPartnerSlugs = useMemo(
    () =>
      getSharedPartnerSet(
        eligibleActions.filter((action) => selectedIds.includes(action.id)),
      ),
    [selectedIds, eligibleActions],
  );
  const topicGroups = useMemo(
    () =>
      sharedPartnerSlugs
        ? groupTopicsByPartner(topics, partners, sharedPartnerSlugs)
        : [],
    [sharedPartnerSlugs, topics, partners],
  );

  // ─── Estados dos dialogs ─────────────────────────────────────────────────────
  const [dateTimeOpen, setDateTimeOpen] = useState(false);
  const [responsiblesOpen, setResponsiblesOpen] = useState(false);
  const [sprintOpen, setSprintOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // ─── Handlers: Tópico ────────────────────────────────────────────────────────
  const applyTopic = (topic_id: string | null) => {
    performBulkAction({ topic_id });
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
                <ULoader size="sm" inheritColor /> Atualizando...
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
                    <UIcons
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
                      runBulk(() =>
                        handleBulkAction(targets, (action) => ({
                          category: category.slug,
                          time: getTimeForCategoryChange({
                            fromCategory: action.category,
                            toCategory: category.slug,
                            currentTime: action.time,
                          }),
                        })),
                      )
                    }
                    textValue={category.title}
                  >
                    <UIcons
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
            <UIcons slug="sprint" /> Alterar Sprints
          </PrismMenuItem>

          {/* Data e Hora */}
          <PrismMenuItem
            onAction={() => setDateTimeOpen(true)}
            textValue="Data e Hora"
          >
            <CalendarIcon /> Alterar Data e Hora
          </PrismMenuItem>

          {/* Tópico — só para ações com exatamente os mesmos parceiros */}
          {sharedPartnerSlugs ? (
            <PrismMenuSub>
              <PrismMenuSubTrigger textValue="Tópico">
                <PaletteIcon /> Alterar Tópico
              </PrismMenuSubTrigger>
              <PrismMenuSubContent className="max-h-72 overflow-y-auto">
                <PrismMenuItem
                  onAction={() => applyTopic(null)}
                  textValue="Sem tópico"
                >
                  Sem tópico
                </PrismMenuItem>
                {topicGroups.flatMap((group) =>
                  group.topics.map((topic) => (
                    <PrismMenuItem
                      key={topic.id}
                      onAction={() => applyTopic(topic.id)}
                      textValue={`${group.partner.title} ${topic.title}`}
                    >
                      <span
                        aria-hidden="true"
                        className="size-3 shrink-0 rounded-full border border-border"
                        style={{ backgroundColor: topic.color }}
                      />
                      <span className="truncate">
                        {topicGroups.length > 1
                          ? `${group.partner.title} · ${topic.title}`
                          : topic.title}
                      </span>
                    </PrismMenuItem>
                  )),
                )}
                {topicGroups.every((group) => group.topics.length === 0) && (
                  <PrismMenuItem isDisabled textValue="Sem tópicos criados">
                    <span className="text-xs">
                      Os parceiros não têm tópicos. Crie em Admin → Parceiro.
                    </span>
                  </PrismMenuItem>
                )}
              </PrismMenuSubContent>
            </PrismMenuSub>
          ) : (
            <PrismMenuItem
              isDisabled
              textValue="Alterar Tópico. Só para ações com os mesmos parceiros"
            >
              <PaletteIcon />
              <span className="flex min-w-0 flex-col">
                <span>Alterar Tópico</span>
                <span className="text-xs font-normal">
                  Só funciona com ações dos mesmos parceiros
                </span>
              </span>
            </PrismMenuItem>
          )}

          {/* Responsáveis — abre o dialog de seleção de pessoas */}
          <PrismMenuItem
            onAction={() => setResponsiblesOpen(true)}
            textValue="Responsáveis"
          >
            <UserIcon /> Alterar Responsáveis
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
