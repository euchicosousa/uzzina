import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArchiveIcon,
  CalendarIcon,
  FlagIcon,
  KanbanIcon,
  PaletteIcon,
  SignalIcon,
  TagIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useMatches, useParams } from "react-router";
import { toast } from "sonner";
import { PartnerColorPicker } from "~/components/features/ActionForm/PartnerColorPicker";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { useMultiSelection } from "~/hooks/useMultiSelection";
import { useActionMutations } from "~/hooks/useActionMutations";
import { CATEGORIES, PHASES, PRIORITIES } from "~/lib/CONSTANTS";
import { QUERY_KEYS } from "~/lib/query-keys";
import type { Person } from "~/lib/supabase.queries";
import { fetchPeople } from "~/lib/supabase.queries";
import { cn } from "~/lib/utils";
import type { Partner } from "~/models/partners.server";
import type { AppLoaderData } from "~/routes/app";
import {
  BulkDateTimeDialog,
  type BulkDateTimeResult,
} from "./BulkDateTimeDialog";
import { PhaseIcon } from "./PhaseIcon";

export function BulkActionMenu() {
  // ─── Multi-seleção ───────────────────────────────────────────────────────────
  const { isSelectionMode, selectedIds, clearSelection } = useMultiSelection();
  const _queryClient = useQueryClient();
  const { handleBulkAction, handleBulkDateOnly, handleBulkTimeOnly } =
    useActionMutations();

  // ─── Dados globais do app loader ─────────────────────────────────────────────
  // useMatches()[1] é sempre o loader do route "routes/app" (app shell)
  const { partners } = useMatches()[1].loaderData as AppLoaderData;
  const { data: people = [] } = useQuery({
    queryKey: QUERY_KEYS.people(),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });
  const params = useParams();

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

  // Early return: nada a mostrar fora do modo de seleção ou sem itens selecionados
  if (!isSelectionMode || selectedIds.length === 0) return null;

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
      performBulkAction({ date: result.date });
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
    performBulkAction({ responsibles: pickedResponsibles });
    setPartnersOpen(false);
  };

  // ─── Handlers: Cor ───────────────────────────────────────────────────────────
  const openColorDialog = () => {
    setPickedColor("");
    setColorOpen(true);
  };

  const applyColor = () => {
    if (!pickedColor) return;
    performBulkAction({ color: pickedColor });
    setColorOpen(false);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Dialog: Data e Hora ─────────────────────────────────────────────── */}
      <BulkDateTimeDialog
        open={dateTimeOpen}
        onOpenChange={setDateTimeOpen}
        onApply={applyDateTime}
      />

      {/* ── Dialog: Seleção de responsáveis ───────────────────────────────── */}
      <Dialog open={partnersOpen} onOpenChange={setPartnersOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Responsáveis</DialogTitle>
            <DialogDescription>
              Clique para multi-selecionar.{" "}
              <kbd className="rounded bg-muted px-1 text-xs">Shift</kbd>+clique
              para selecionar somente um.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-2 sm:grid-cols-4">
            {people.map((person: Person) => {
              const isSelected = pickedResponsibles.includes(person.user_id);
              return (
                <button
                  key={person.user_id}
                  type="button"
                  onClick={() => toggleResponsible(person.user_id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg p-3 transition-all hover:bg-muted/50",
                    isSelected ? "bg-muted text-foreground" : "opacity-50",
                  )}
                >
                  <UAvatar
                    image={person.image ?? undefined}
                    fallback={person.initials}
                    size="md"
                  />
                  <span className="w-full truncate text-center text-xs leading-tight font-medium">
                    {person.name}
                  </span>
                </button>
              );
            })}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPartnersOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={applyResponsibles}
              disabled={pickedResponsibles.length === 0}
            >
              Aplicar ({pickedResponsibles.length} selecionado
              {pickedResponsibles.length !== 1 ? "s" : ""})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Seleção de cor do parceiro ────────────────────────────── */}
      <Dialog open={colorOpen} onOpenChange={setColorOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Cor</DialogTitle>
            <DialogDescription>
              Escolha uma cor do parceiro para {selectedIds.length} ação(ões)
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {/* Swatches + hex input unificados — mesmo componente do ActionColorDropdown */}
            <PartnerColorPicker
              colors={partnerColors}
              value={pickedColor}
              onChange={setPickedColor}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setColorOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={applyColor} disabled={!pickedColor}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dropdown principal de ações em lote ───────────────────────────── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="h-10 rounded-xl px-4 font-semibold"
          >
            {selectedIds.length} Selecionado{selectedIds.length > 1 ? "s" : ""}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Estado */}

          {/* Fase */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <KanbanIcon className="mr-2 size-4 opacity-70" /> Alterar Fase
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {Object.values(PHASES)
                  .sort((a, b) => a.order - b.order)
                  .map((phase) => (
                    <DropdownMenuItem
                      key={phase.slug}
                      onClick={() => performBulkAction({ phase: phase.slug })}
                    >
                      <div className="mr-2">
                        <PhaseIcon phase={phase} size="xs" variant="icon" />
                      </div>
                      {phase.title}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Data e Hora */}
          <DropdownMenuItem onSelect={() => setDateTimeOpen(true)}>
            <CalendarIcon className="size-4 opacity-70" /> Alterar Data e Hora
          </DropdownMenuItem>

          {/* Categoria */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <TagIcon className="mr-2 size-4 opacity-70" /> Alterar Categoria
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="max-h-72 overflow-y-auto">
                {Object.values(CATEGORIES)
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((cat) => (
                    <DropdownMenuItem
                      key={cat.slug}
                      onClick={() => performBulkAction({ category: cat.slug })}
                    >
                      <span
                        className="mr-2 size-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.title}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Prioridade */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FlagIcon className="mr-2 size-4 opacity-70" /> Alterar Prioridade
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {Object.values(PRIORITIES).map((priority) => {
                  // Mapeia slug → classe de cor semântica do design system
                  const iconClass =
                    priority.slug === "low"
                      ? "text-info"
                      : priority.slug === "high"
                        ? "text-error"
                        : "text-success";
                  return (
                    <DropdownMenuItem
                      key={priority.slug}
                      onClick={() =>
                        performBulkAction({ priority: priority.slug })
                      }
                    >
                      <SignalIcon className={`mr-2 size-4 ${iconClass}`} />
                      {priority.title}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Cor — abre o dialog com as cores do parceiro atual */}
          <DropdownMenuItem onSelect={openColorDialog}>
            <PaletteIcon className="mr-2 size-4 opacity-70" /> Alterar Cor
          </DropdownMenuItem>

          {/* Responsáveis — abre o dialog de seleção de pessoas */}
          <DropdownMenuItem onSelect={openPartnersDialog}>
            <UserIcon className="mr-2 size-4 opacity-70" /> Alterar Responsáveis
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Arquivar todas as selecionadas de uma vez */}
          <DropdownMenuItem
            onClick={() => performBulkAction({ archived: true })}
          >
            <ArchiveIcon className="mr-2 size-4 opacity-70" /> Arquivar
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Sai do modo de seleção sem aplicar nada */}
          <DropdownMenuItem onClick={clearSelection}>
            <XIcon className="mr-2 size-4 opacity-70" /> Limpar Seleção
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
