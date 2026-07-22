import {
  IconArchive,
  IconCalendar,
  IconFlag,
  IconLayoutKanban,
  IconPalette,
  IconTag,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PartnerColorPicker } from "~/components/features/ActionForm/PartnerColorPicker";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { useAppContext } from "~/contexts/AppContext";
import { useActionMutations } from "~/hooks/useActionMutations";
import { useMultiSelection } from "~/hooks/useMultiSelection";
import { CATEGORIES, PHASES, PRIORITIES, STATIONS } from "~/lib/CONSTANTS";
import { QUERY_KEYS } from "~/lib/query-keys";
import type { Person } from "~/lib/supabase.queries";
import { fetchPeople } from "~/lib/supabase.queries";
import { cn } from "~/lib/utils";
import { getGridCols } from "~/lib/uzzina-utils";
import type { Partner } from "~/types";
import {
  PrismButton,
  PrismDialog,
  PrismDialogDescription,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismMenu,
  PrismMenuContent,
  PrismMenuItem,
  PrismMenuSeparator,
  PrismMenuSub,
  PrismMenuSubContent,
  PrismMenuSubTrigger,
  PrismMenuTrigger,
} from "../prism";
import { Icons } from "../uzzina/UIIcons";
import type { BulkDateTimeResult } from "./BulkDateTimeDialog";
import { BulkDateTimeDialog } from "./BulkDateTimeDialog";
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
  // Usa params.slug igual ao Header.tsx — undefined quando não há slug ou é "new"
  const currentPartner: Partner | undefined =
    params.slug && params.slug !== "new"
      ? partners.find((p) => p.slug === params.slug)
      : undefined;

  // Cores brutas do parceiro atual — PartnerColorPicker cuida da normalização internamente
  const partnerColors = currentPartner?.colors ?? [];

  // ─── Estados dos dialogs ─────────────────────────────────────────────────────
  const [dateTimeOpen, setDateTimeOpen] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [pickedResponsibles, setPickedResponsibles] = useState<string[]>([]);
  const [colorOpen, setColorOpen] = useState(false);
  const [pickedColor, setPickedColor] = useState("");

  // Early return: nada a mostrar fora do modo de seleção
  if (!isSelectionMode) return null;

  // ─── Helpers de ação em lote ─────────────────────────────────────────────────

  /** Aplica `updates` em todas as ações selecionadas e limpa a seleção */
  const performBulkAction = (updates: Record<string, unknown>) => {
    handleBulkAction(selectedIds, updates);
    clearSelection();
    toast.success(`${selectedIds.length} ação(ões) atualizada(s)!`);
  };

  // ─── Handlers: Data/Hora ─────────────────────────────────────────────────────
  const applyDateTime = (result: BulkDateTimeResult) => {
    if (result.mode === "datetime") {
      // Situação 1: substitui data + hora completos
      performBulkAction({
        date: result.date,
      });
    } else if (result.mode === "date_only") {
      // Situação 2: só a data — servidor preserva a hora de cada ação
      handleBulkDateOnly(selectedIds, result.dateOnly);
      clearSelection();
      toast.success(`${selectedIds.length} ação(ões) atualizada(s)!`);
    } else {
      // Situação 3: só a hora — servidor preserva a data de cada ação
      handleBulkTimeOnly(selectedIds, result.timeOnly);
      clearSelection();
      toast.success(`${selectedIds.length} ação(ões) atualizada(s)!`);
    }
  };

  // ─── Handlers: Responsáveis ──────────────────────────────────────────────────
  const openPartnersDialog = () => {
    setPickedResponsibles([]);
    setPartnersOpen(true);
  };
  const toggleResponsible = (id: string) => {
    setPickedResponsibles((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };
  const applyResponsibles = () => {
    performBulkAction({
      responsibles: pickedResponsibles,
    });
    setPartnersOpen(false);
  };

  // ─── Handlers: Cor ───────────────────────────────────────────────────────────
  const openColorDialog = () => {
    setPickedColor("");
    setColorOpen(true);
  };
  const applyColor = () => {
    if (!pickedColor) return;
    performBulkAction({
      color: pickedColor,
    });
    setColorOpen(false);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Dialog: Data e Hora ─────────────────────────────────────────────── */}
      <BulkDateTimeDialog
        onApply={applyDateTime}
        onOpenChange={setDateTimeOpen}
        open={dateTimeOpen}
      />

      {/* ── Dialog: Seleção de responsáveis ───────────────────────────────── */}
      {partnersOpen && (
        <PrismDialog
          className="max-w-md"
          isDismissable
          onOpenChange={setPartnersOpen}
        >
          <PrismDialogHeader>
            <PrismDialogTitle>Alterar Responsáveis</PrismDialogTitle>
            <PrismDialogDescription>
              Clique para multi-selecionar.{" "}
              <kbd className="rounded bg-muted px-1 text-xs">Shift</kbd>+clique
              para selecionar somente um.
            </PrismDialogDescription>
          </PrismDialogHeader>
          <div className="grid grid-cols-3 gap-3 py-2 sm:grid-cols-4">
            {people.map((person: Person) => {
              const isSelected = pickedResponsibles.includes(person.user_id);
              return (
                <button
                  key={person.user_id}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg p-3 transition-all hover:bg-muted/50",
                    isSelected ? "bg-muted text-foreground" : "opacity-50",
                  )}
                  onClick={() => toggleResponsible(person.user_id)}
                  type="button"
                >
                  <UAvatar
                    fallback={person.initials}
                    image={person.image ?? undefined}
                    size="md"
                  />
                  <span className="w-full truncate text-center text-xs leading-tight font-medium">
                    {person.name}
                  </span>
                </button>
              );
            })}
          </div>
          <PrismDialogFooter className="gap-2">
            <PrismButton
              onClick={() => setPartnersOpen(false)}
              variant="outline"
            >
              Cancelar
            </PrismButton>
            <PrismButton
              isDisabled={pickedResponsibles.length === 0}
              onClick={applyResponsibles}
            >
              Aplicar ({pickedResponsibles.length} selecionado
              {pickedResponsibles.length !== 1 ? "s" : ""})
            </PrismButton>
          </PrismDialogFooter>
        </PrismDialog>
      )}

      {/* ── Dialog: Seleção de cor do parceiro ────────────────────────────── */}
      {colorOpen && (
        <PrismDialog
          className="max-w-sm"
          isDismissable
          onOpenChange={setColorOpen}
        >
          <PrismDialogHeader>
            <PrismDialogTitle>Alterar Cor</PrismDialogTitle>
            <PrismDialogDescription>
              Escolha uma cor do parceiro para {selectedIds.length} ação(ões)
            </PrismDialogDescription>
          </PrismDialogHeader>
          <div className="py-2">
            <PartnerColorPicker
              className={getGridCols(partnerColors.length)}
              colors={partnerColors}
              onChange={setPickedColor}
              value={pickedColor}
            />
          </div>
          <PrismDialogFooter className="gap-2">
            <PrismButton onClick={() => setColorOpen(false)} variant="outline">
              Cancelar
            </PrismButton>
            <PrismButton isDisabled={!pickedColor} onClick={applyColor}>
              Aplicar
            </PrismButton>
          </PrismDialogFooter>
        </PrismDialog>
      )}

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
              <IconLayoutKanban /> Alterar Fase
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
              <IconLayoutKanban /> Alterar Estação
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
              <IconTag /> Alterar Categoria
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
              <IconFlag /> Alterar Prioridade
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
                    <IconFlag />
                    {priority.title}
                  </PrismMenuItem>
                );
              })}
            </PrismMenuSubContent>
          </PrismMenuSub>

          {/* Data e Hora */}
          <PrismMenuItem
            onAction={() => setDateTimeOpen(true)}
            textValue="Data e Hora"
          >
            <IconCalendar /> Alterar Data e Hora
          </PrismMenuItem>

          {/* Cor — abre o dialog com as cores do parceiro atual */}
          <PrismMenuItem onAction={openColorDialog} textValue="Cor">
            <IconPalette /> Alterar Cor
          </PrismMenuItem>

          {/* Responsáveis — abre o dialog de seleção de pessoas */}
          <PrismMenuItem onAction={openPartnersDialog} textValue="Responsáveis">
            <IconUser /> Alterar Responsáveis
          </PrismMenuItem>

          <PrismMenuSeparator />

          {/* Arquivar todas as selecionadas de uma vez */}
          <PrismMenuItem
            onAction={() =>
              performBulkAction({
                archived: true,
              })
            }
            textValue="Arquivar"
          >
            <IconArchive /> Arquivar
          </PrismMenuItem>

          <PrismMenuSeparator />

          {/* Sai do modo de seleção sem aplicar nada */}
          <PrismMenuItem onAction={clearSelection} textValue="Limpar Seleção">
            <IconX /> Limpar Seleção
          </PrismMenuItem>
        </PrismMenuContent>
      </PrismMenu>
    </>
  );
}
