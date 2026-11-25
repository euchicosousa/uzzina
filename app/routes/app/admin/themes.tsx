import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronsUpDownIcon,
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
  buildPalettesSource,
  clearDraftFromStorage,
  clonePaletteConfig,
  computeThemeChanges,
  derivePriorities,
  fingerprintPalette,
  fingerprintShared,
  getOriginalShared,
  getPaletteById,
  loadDraftFromStorage,
  saveDraftToStorage,
  setFormulaValue,
  setLateValue,
  setPhaseFormula,
  setSharedNumber,
  setStateColor,
  type DeltaKey,
  type FormulaKey,
  type LateKey,
  type PaletteColorKey,
  type PhaseFormulaKey,
  type SharedNumberKey,
  type StateKey,
  type StatePart,
  type PhaseSlug,
  type ThemePreviewMode,
} from "~/components/features/admin/themes/theme-editor-model";
import {
  PrismButton,
  PrismCommand,
  PrismCommandEmpty,
  PrismCommandInput,
  PrismCommandItem,
  PrismCommandList,
  PrismDialog,
  PrismDialogBody,
  PrismDialogDescription,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogOverlay,
  PrismDialogTitle,
  PrismPopover,
  PrismPopoverTrigger,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { UComboboxTrigger } from "~/components/uzzina/UComboboxTrigger";
import { UThemeSwatch } from "~/components/uzzina/UThemeSwatch";
import { Theme, useAppThemeContext } from "~/hooks/useAppTheme";
import {
  PALLETE,
  type CategorySlug,
  type PaletteConfig,
  type SharedColors,
} from "~/lib/palettes";
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
  const { primaryColorId, theme } = useAppThemeContext();
  const initialPalette = getPaletteById(primaryColorId);
  const [paletteId, setPaletteId] = useState<string>(initialPalette.id);
  const [draftPalette, setDraftPalette] = useState<PaletteConfig>(() =>
    clonePaletteConfig(initialPalette),
  );
  const [palettePickerOpen, setPalettePickerOpen] = useState(false);
  /** States, phases and categories: one block shared by every palette (DS36). */
  const [draftShared, setDraftShared] = useState<SharedColors>(() =>
    getOriginalShared(),
  );
  const [previewMode, setPreviewMode] = useState<ThemePreviewMode>("split");
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);
  const [pendingPaletteId, setPendingPaletteId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadDraftFromStorage();
    // A draft only survives while palettes.ts is unchanged; otherwise it would
    // hide the values that were edited in the file.
    const base = stored ? getPaletteById(stored.paletteId) : null;
    if (
      stored &&
      base &&
      stored.base === fingerprintPalette(base) &&
      stored.sharedBase === fingerprintShared()
    ) {
      setPaletteId(stored.paletteId);
      setDraftPalette(stored.palette);
      setDraftShared(stored.shared);
    }
    setHydrated(true);
  }, []);

  const changes = useMemo(
    () => computeThemeChanges(paletteId, draftPalette, draftShared),
    [paletteId, draftPalette, draftShared],
  );

  const previewPriorities = useMemo(
    () => derivePriorities(draftShared),
    [draftShared],
  );

  useEffect(() => {
    if (!hydrated) return;
    if (changes.length === 0) {
      clearDraftFromStorage();
      return;
    }
    saveDraftToStorage({
      paletteId,
      base: fingerprintPalette(getPaletteById(paletteId)),
      sharedBase: fingerprintShared(),
      palette: draftPalette,
      shared: draftShared,
    });
  }, [hydrated, changes.length, paletteId, draftPalette, draftShared]);

  const baseFingerprint = fingerprintPalette(getPaletteById(paletteId));
  useEffect(() => {
    if (!hydrated || changes.length > 0) return;
    setDraftPalette(clonePaletteConfig(getPaletteById(paletteId)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFingerprint]);

  const applyPaletteSwitch = (nextId: string) => {
    const next = clonePaletteConfig(getPaletteById(nextId));
    setPaletteId(next.id);
    setDraftPalette(next);
    setDraftShared(getOriginalShared());
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

  // The whole palettes.ts is copied: PALLETE and SHARED_COLORS (states, phases
  // and categories) are both rebuilt from the draft.
  const codeOutput = useMemo(
    () => buildPalettesSource(draftPalette, draftShared),
    [draftPalette, draftShared],
  );

  const handleCopy = async () => {
    if (changes.length === 0) return;
    try {
      await navigator.clipboard.writeText(codeOutput);
      toast.success("palettes.ts completo copiado.");
    } catch {
      toast.error("Não foi possível copiar para a área de transferência.");
    }
  };

  const handleSaveDownload = () => {
    if (changes.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const filename = `palettes-${draftPalette.id}-${today}.ts`;
    const blob = new Blob([codeOutput], {
      type: "text/typescript;charset=utf-8",
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

  const handleChangePrimaryFgDelta = (
    mode: "light" | "dark",
    part: "l" | "c" | "h",
    value: number,
  ) => {
    setDraftPalette((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        primaryFgDelta: { ...prev[mode].primaryFgDelta, [part]: value },
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

  const handleChangeRelief = (relief: boolean) => {
    setDraftPalette((prev) => ({
      ...prev,
      relief,
    }));
  };

  const handleChangePhase = (slug: PhaseSlug, color: OklchColor) => {
    setDraftShared((prev) => ({
      ...prev,
      phases: { ...prev.phases, [slug]: color },
    }));
  };

  const handleChangeFormula = (
    key: FormulaKey,
    mode: "light" | "dark",
    value: number,
  ) => {
    setDraftShared((prev) => setFormulaValue(prev, key, mode, value));
  };

  const handleChangePhaseFormula = (
    key: PhaseFormulaKey,
    mode: "light" | "dark",
    value: number,
  ) => {
    setDraftShared((prev) => setPhaseFormula(prev, key, mode, value));
  };

  const handleChangeState = (
    key: StateKey,
    part: StatePart,
    mode: "light" | "dark",
    color: OklchColor,
  ) => {
    setDraftShared((prev) => setStateColor(prev, key, part, mode, color));
  };

  const handleChangeSharedNumber = (
    key: SharedNumberKey,
    mode: "light" | "dark",
    value: number,
  ) => {
    setDraftShared((prev) => setSharedNumber(prev, key, mode, value));
  };

  const handleChangeLate = (
    key: LateKey,
    mode: "light" | "dark",
    value: number,
  ) => {
    setDraftShared((prev) => setLateValue(prev, key, mode, value));
  };

  const handleChangeCategory = (slug: CategorySlug, color: OklchColor) => {
    setDraftShared((prev) => ({
      ...prev,
      categories: { ...prev.categories, [slug]: color },
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

            <div className="w-48 shrink-0">
              <PrismPopoverTrigger
                isOpen={palettePickerOpen}
                onOpenChange={setPalettePickerOpen}
              >
                <UComboboxTrigger
                  aria-label="Selecionar paleta"
                  className="w-full justify-between px-2.5"
                  size="sm"
                  variant="outline"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <UThemeSwatch
                      mode={theme === Theme.DARK ? "dark" : "light"}
                      palette={draftPalette}
                      size="md"
                    />
                    <span className="truncate">{draftPalette.label}</span>
                  </span>
                  <ChevronsUpDownIcon className="size-4 shrink-0 opacity-60" />
                </UComboboxTrigger>
                <PrismPopover className="overflow-hidden p-0">
                  <PrismCommand>
                    <PrismCommandInput placeholder="Procurar tema..." />
                    <PrismCommandList
                      renderEmptyState={() => (
                        <PrismCommandEmpty>
                          Nenhum tema encontrado.
                        </PrismCommandEmpty>
                      )}
                    >
                      {PALLETE.map((p) => (
                        <PrismCommandItem
                          key={p.id}
                          data-selected={p.id === paletteId}
                          onAction={() => {
                            handleSelectPalette(p.id);
                            setPalettePickerOpen(false);
                          }}
                          textValue={p.label}
                        >
                          <UThemeSwatch
                            mode={theme === Theme.DARK ? "dark" : "light"}
                            palette={p}
                            size="md"
                          />
                          <span>{p.label}</span>
                        </PrismCommandItem>
                      ))}
                    </PrismCommandList>
                  </PrismCommand>
                </PrismPopover>
              </PrismPopoverTrigger>
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
        <div className="grid min-h-0 flex-1 grid-cols-[440px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-r border-border">
            <ThemeColorInspector
              onChangeDelta={handleChangeDelta}
              onChangePaletteColor={handleChangePaletteColor}
              onChangePhase={handleChangePhase}
              onChangeCategory={handleChangeCategory}
              onChangeFormula={handleChangeFormula}
              onChangeRelief={handleChangeRelief}
              onChangeLate={handleChangeLate}
              onChangePhaseFormula={handleChangePhaseFormula}
              onChangeSharedNumber={handleChangeSharedNumber}
              onChangePrimaryFgDelta={handleChangePrimaryFgDelta}
              onChangeState={handleChangeState}
              onHoverTarget={setHoveredTarget}
              palette={draftPalette}
              shared={draftShared}
            />
          </aside>

          <div className="min-h-0 overflow-y-auto p-6 pb-32">
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
                  phases={draftShared.phases}
                  shared={draftShared}
                  priorities={previewPriorities}
                />
              )}
              {(previewMode === "dark" || previewMode === "split") && (
                <ThemePreviewPane
                  hoveredTarget={hoveredTarget}
                  mode="dark"
                  palette={draftPalette}
                  phases={draftShared.phases}
                  shared={draftShared}
                  priorities={previewPriorities}
                />
              )}
            </div>
          </div>
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
