import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Columns2Icon,
  CopyIcon,
  DownloadIcon,
  MoonIcon,
  RotateCcwIcon,
  SunIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "~/components/features/AdminGuard";
import { ThemeColorInspector } from "~/components/features/admin/themes/ThemeColorInspector";
import { ThemePreviewPane } from "~/components/features/admin/themes/ThemePreviewPane";
import {
  buildThemeChangesMarkdown,
  clearDraftFromStorage,
  clonePaletteConfig,
  computeThemeChanges,
  getOriginalPhasesMap,
  getOriginalPrioritiesMap,
  getPaletteById,
  loadDraftFromStorage,
  saveDraftToStorage,
  type DeltaKey,
  type PaletteColorKey,
  type PhaseSlug,
  type PhasesColorMap,
  type PrioritiesColorMap,
  type PriorityKey,
  type ThemePreviewMode,
} from "~/components/features/admin/themes/theme-editor-model";
import {
  PrismButton,
  PrismDialog,
  PrismDialogBody,
  PrismDialogDescription,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogOverlay,
  PrismDialogTitle,
  PrismSelect,
  PrismSelectContent,
  PrismSelectItem,
  PrismSelectTrigger,
  PrismSelectValue,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { PALLETE, type PaletteConfig } from "~/lib/palettes";
import { formatOklchString, type OklchColor } from "~/utils/color";

export const Route = createFileRoute("/app/admin/themes")({
  component: AdminThemesPageWrapper,
});

function AdminThemesPageWrapper() {
  return (
    <AdminGuard>
      <AdminThemesPage />
    </AdminGuard>
  );
}

function AdminThemesPage() {
  const [paletteId, setPaletteId] = useState<string>(PALLETE[0].id);
  const [draftPalette, setDraftPalette] = useState<PaletteConfig>(() =>
    clonePaletteConfig(PALLETE[0]),
  );
  const [draftPhases, setDraftPhases] = useState<PhasesColorMap>(() =>
    getOriginalPhasesMap(),
  );
  const [draftPriorities, setDraftPriorities] = useState<PrioritiesColorMap>(
    () => getOriginalPrioritiesMap(),
  );
  const [previewMode, setPreviewMode] = useState<ThemePreviewMode>("split");
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);
  const [pendingPaletteId, setPendingPaletteId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadDraftFromStorage();
    if (stored) {
      setPaletteId(stored.paletteId);
      setDraftPalette(stored.palette);
      if (stored.phases) setDraftPhases(stored.phases);
      if (stored.priorities) setDraftPriorities(stored.priorities);
    }
    setHydrated(true);
  }, []);

  const changes = useMemo(
    () =>
      computeThemeChanges(
        paletteId,
        draftPalette,
        draftPhases,
        draftPriorities,
      ),
    [paletteId, draftPalette, draftPhases, draftPriorities],
  );

  useEffect(() => {
    if (!hydrated) return;
    if (changes.length === 0) {
      clearDraftFromStorage();
      return;
    }
    saveDraftToStorage({
      paletteId,
      palette: draftPalette,
      phases: draftPhases,
      priorities: draftPriorities,
    });
  }, [
    hydrated,
    changes.length,
    paletteId,
    draftPalette,
    draftPhases,
    draftPriorities,
  ]);

  const applyPaletteSwitch = (nextId: string) => {
    const next = clonePaletteConfig(getPaletteById(nextId));
    setPaletteId(next.id);
    setDraftPalette(next);
    setDraftPhases(getOriginalPhasesMap());
    setDraftPriorities(getOriginalPrioritiesMap());
    clearDraftFromStorage();
  };

  const handleSelectPalette = (nextId: string) => {
    if (nextId === paletteId) return;
    if (changes.length > 0) {
      setPendingPaletteId(nextId);
      return;
    }
    applyPaletteSwitch(nextId);
  };

  const handleDiscard = () => {
    applyPaletteSwitch(paletteId);
    toast.success("Alterações descartadas.");
  };

  const markdownOutput = useMemo(
    () => buildThemeChangesMarkdown(draftPalette, changes),
    [draftPalette, changes],
  );

  const handleCopy = async () => {
    if (changes.length === 0) return;
    try {
      await navigator.clipboard.writeText(markdownOutput);
      toast.success("Instruções copiadas para a área de transferência.");
    } catch {
      toast.error("Não foi possível copiar para a área de transferência.");
    }
  };

  const handleSaveDownload = () => {
    if (changes.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const filename = `uzzina-cores-${draftPalette.id}-${today}.md`;
    const blob = new Blob([markdownOutput], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success(`Arquivo ${filename} baixado.`);
  };

  const handleChangePaletteColor = (
    mode: "light" | "dark",
    key: PaletteColorKey,
    color: OklchColor,
  ) => {
    setDraftPalette((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [key]: color,
      },
    }));
  };

  const handleChangeDelta = (
    mode: "light" | "dark",
    key: DeltaKey,
    value: number,
  ) => {
    setDraftPalette((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [key]: value,
      },
    }));
  };

  const handleChangeShadowColor = (
    mode: "light" | "dark",
    color: OklchColor,
  ) => {
    setDraftPalette((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        shadowColor: formatOklchString(color),
      },
    }));
  };

  const handleChangeShadowOpacity = (mode: "light" | "dark", value: number) => {
    setDraftPalette((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        shadowOpacity: value,
      },
    }));
  };

  const handleChangeRelief = (relief: boolean) => {
    setDraftPalette((prev) => ({
      ...prev,
      relief,
    }));
  };

  const handleChangePhase = (slug: PhaseSlug, color: OklchColor) => {
    setDraftPhases((prev) => ({
      ...prev,
      [slug]: color,
    }));
  };

  const handleChangePriority = (
    mode: "light" | "dark",
    key: PriorityKey,
    color: OklchColor,
  ) => {
    setDraftPriorities((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [key]: color,
      },
    }));
  };

  const changesLabel =
    changes.length === 0
      ? "Nenhuma alteração"
      : changes.length === 1
        ? "1 alteração"
        : `${changes.length} alterações`;

  return (
    <>
      <div className="flex h-[calc(100dvh-65px)] flex-col items-center justify-center p-8 text-center lg:hidden">
        <p className="text-base font-semibold text-foreground">
          Editor disponível em telas maiores
        </p>
        <p className="mt-1 max-w-sm text-sm text-secondary-foreground">
          Abra esta página em um computador ou tablet deitado (largura mínima de
          1024 px) para comparar os modos lado a lado.
        </p>
      </div>

      <div className="hidden h-[calc(100dvh-65px)] flex-col overflow-hidden bg-background lg:flex">
        {/* Cabeçalho em uma linha */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="shrink-0 text-lg font-bold text-foreground">
              Cores dos temas
            </h1>

            <div className="w-44 shrink-0">
              <PrismSelect
                aria-label="Selecionar paleta"
                onSelectionChange={(key) => {
                  if (key !== null) handleSelectPalette(String(key));
                }}
                selectedKey={paletteId}
              >
                <PrismSelectTrigger size="sm">
                  <PrismSelectValue />
                </PrismSelectTrigger>
                <PrismSelectContent>
                  {PALLETE.map((p) => (
                    <PrismSelectItem key={p.id} id={p.id} textValue={p.label}>
                      {p.label}
                    </PrismSelectItem>
                  ))}
                </PrismSelectContent>
              </PrismSelect>
            </div>

            <PrismToggleGroup
              aria-label="Modo de visualização"
              onSelectionChange={(keys) => {
                const first = Array.from(keys)[0];
                if (
                  first === "light" ||
                  first === "dark" ||
                  first === "split"
                ) {
                  setPreviewMode(first);
                }
              }}
              selectedKeys={[previewMode]}
              size="sm"
              variant="outline"
            >
              <PrismToggleGroupItem id="light">
                <SunIcon className="size-3.5" />
                <span>Claro</span>
              </PrismToggleGroupItem>
              <PrismToggleGroupItem id="dark">
                <MoonIcon className="size-3.5" />
                <span>Escuro</span>
              </PrismToggleGroupItem>
              <PrismToggleGroupItem id="split">
                <Columns2Icon className="size-3.5" />
                <span>Lado a lado</span>
              </PrismToggleGroupItem>
            </PrismToggleGroup>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="mr-1 text-xs text-secondary-foreground tabular-nums">
              {changesLabel}
            </span>

            <PrismButton
              isDisabled={changes.length === 0}
              onPress={handleDiscard}
              size="sm"
              variant="ghost"
            >
              Descartar
              <RotateCcwIcon />
            </PrismButton>

            <PrismButton
              isDisabled={changes.length === 0}
              onPress={() => void handleCopy()}
              size="sm"
              variant="outline"
            >
              Copiar código
              <CopyIcon />
            </PrismButton>

            <PrismButton
              isDisabled={changes.length === 0}
              onPress={handleSaveDownload}
              size="sm"
              variant="default"
            >
              Salvar
              <DownloadIcon />
            </PrismButton>
          </div>
        </header>

        {/* Duas colunas com rolagem independente */}
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-h-0 overflow-y-auto p-6">
            <div
              className={
                previewMode === "split"
                  ? "grid grid-cols-2 items-start gap-4"
                  : "mx-auto max-w-2xl"
              }
            >
              {(previewMode === "light" || previewMode === "split") && (
                <ThemePreviewPane
                  hoveredTarget={hoveredTarget}
                  mode="light"
                  palette={draftPalette}
                  phases={draftPhases}
                  priorities={draftPriorities}
                />
              )}
              {(previewMode === "dark" || previewMode === "split") && (
                <ThemePreviewPane
                  hoveredTarget={hoveredTarget}
                  mode="dark"
                  palette={draftPalette}
                  phases={draftPhases}
                  priorities={draftPriorities}
                />
              )}
            </div>
          </div>

          <aside className="min-h-0 overflow-y-auto border-l border-border p-4">
            <ThemeColorInspector
              onChangeDelta={handleChangeDelta}
              onChangePaletteColor={handleChangePaletteColor}
              onChangePhase={handleChangePhase}
              onChangePriority={handleChangePriority}
              onChangeRelief={handleChangeRelief}
              onChangeShadowColor={handleChangeShadowColor}
              onChangeShadowOpacity={handleChangeShadowOpacity}
              onHoverTarget={setHoveredTarget}
              palette={draftPalette}
              phases={draftPhases}
              priorities={draftPriorities}
            />
          </aside>
        </div>
      </div>

      <PrismDialogOverlay
        isOpen={pendingPaletteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingPaletteId(null);
        }}
      >
        <PrismDialog size="sm">
          <PrismDialogHeader>
            <PrismDialogTitle>Descartar alterações?</PrismDialogTitle>
            <PrismDialogDescription>
              Você fez {changes.length} alteração(ões) na paleta{" "}
              {draftPalette.label}. Trocar de paleta agora descarta essas
              mudanças não salvas.
            </PrismDialogDescription>
          </PrismDialogHeader>
          <PrismDialogBody>
            <p className="text-xs text-secondary-foreground">
              Se quiser guardar antes de trocar, cancele e clique em Salvar ou
              Copiar código.
            </p>
          </PrismDialogBody>
          <PrismDialogFooter>
            <PrismButton
              onPress={() => setPendingPaletteId(null)}
              size="sm"
              variant="ghost"
            >
              Cancelar
            </PrismButton>
            <PrismButton
              onPress={() => {
                if (pendingPaletteId) {
                  applyPaletteSwitch(pendingPaletteId);
                }
                setPendingPaletteId(null);
              }}
              size="sm"
              variant="error"
            >
              Descartar e trocar
            </PrismButton>
          </PrismDialogFooter>
        </PrismDialog>
      </PrismDialogOverlay>
    </>
  );
}
