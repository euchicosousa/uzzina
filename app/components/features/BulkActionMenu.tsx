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
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { PartnerColorPicker } from "~/components/features/ActionForm/PartnerColorPicker";
import { useMatches, useParams, useSubmit } from "react-router";
import { useMultiSelection } from "~/hooks/useMultiSelection";
import { handleBulkAction } from "~/lib/helpers";
import { CATEGORIES, PRIORITIES, STATES } from "~/lib/CONSTANTS";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Calendar } from "~/components/ui/calendar";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { cn } from "~/lib/utils";
import type { AppLoaderData } from "~/routes/app";
import type { Partner } from "~/models/partners.server";

// "date" é o único target de data por agora — tipo explícito para segurança
type DateTarget = "date";

export function BulkActionMenu() {
  // ─── Multi-seleção ───────────────────────────────────────────────────────────
  const { isSelectionMode, selectedIds, clearSelection } = useMultiSelection();
  const submit = useSubmit();

  // ─── Dados globais do app loader ─────────────────────────────────────────────
  // useMatches()[1] é sempre o loader do route "routes/app" (app shell)
  const { people, partners } = useMatches()[1].loaderData as AppLoaderData;
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
  // ─── Estados dos dialogs ─────────────────────────────────────────────────────
  const [dateTarget, setDateTarget] = useState<DateTarget | null>(null);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [pickedResponsibles, setPickedResponsibles] = useState<string[]>([]);
  const [colorOpen, setColorOpen] = useState(false);
  const [pickedColor, setPickedColor] = useState("");

  // Early return: nada a mostrar fora do modo de seleção ou sem itens selecionados
  if (!isSelectionMode || selectedIds.length === 0) return null;

  // ─── Helpers de ação em lote ─────────────────────────────────────────────────

  /** Aplica `updates` em todas as ações selecionadas e limpa a seleção */
  const performBulkAction = (updates: Record<string, unknown>) => {
    handleBulkAction(selectedIds, updates, submit);
    clearSelection();
    toast.success(`${selectedIds.length} ação(ões) atualizada(s)!`);
  };

  // ─── Handlers: Data ──────────────────────────────────────────────────────────
  const onDateSelect = (date: Date | undefined) => {
    if (!date || !dateTarget) return;
    performBulkAction({ [dateTarget]: date.toISOString() });
    setDateTarget(null);
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
      {/* ── Dialog: Seleção de data ────────────────────────────────────────── */}
      <Dialog
        open={!!dateTarget}
        onOpenChange={(open) => !open && setDateTarget(null)}
      >
        <DialogContent className="w-auto overflow-hidden p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Data</DialogTitle>
            <DialogDescription>
              Selecione uma data para {selectedIds.length} ação(ões)
            </DialogDescription>
          </DialogHeader>
          <Calendar
            mode="single"
            onSelect={onDateSelect}
            autoFocus
            className="w-full"
          />
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Seleção de responsáveis ───────────────────────────────── */}
      <Dialog open={partnersOpen} onOpenChange={setPartnersOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Responsáveis</DialogTitle>
            <DialogDescription>
              Clique para multi-selecionar.{" "}
              <kbd className="bg-muted rounded px-1 text-xs">Shift</kbd>+clique
              para selecionar somente um.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-2 sm:grid-cols-4">
            {people.map((person) => {
              const isSelected = pickedResponsibles.includes(person.user_id);
              return (
                <button
                  key={person.user_id}
                  type="button"
                  onClick={() => toggleResponsible(person.user_id)}
                  className={cn(
                    "hover:bg-muted/50 flex flex-col items-center gap-2 rounded-lg p-3 transition-all",
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
        <DropdownMenuContent align="end" className="font-inter w-56">
          {/* Estado */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <KanbanIcon className="mr-2 size-4 opacity-70" /> Alterar Estado
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {Object.values(STATES)
                  .sort((a, b) => a.order - b.order)
                  .map((state) => (
                    <DropdownMenuItem
                      key={state.slug}
                      onClick={() => performBulkAction({ state: state.slug })}
                    >
                      <span
                        className="mr-2 size-2 rounded-full"
                        style={{ backgroundColor: state.color }}
                      />
                      {state.title}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Data */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CalendarIcon className="mr-2 size-4 opacity-70" /> Alterar Data
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => setDateTarget("date")}>
                  <CalendarIcon className="mr-2 size-4 opacity-70" />
                  Atualizar Data
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

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
          <DropdownMenuItem onClick={() => performBulkAction({ archived: true })}>
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
