import type { Action, Partner } from "~/types";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CloudUploadIcon,
  CopyIcon,
  LoaderIcon,
  PlusIcon,
} from "lucide-react";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { ActionColorDropdown } from "./ActionColorDropdown";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import { PhaseCombobox } from "~/components/features/PhaseCombobox";
import { SprintCombobox } from "~/components/features/SprintCombobox";
import { useActionMutations } from "~/hooks/useActionMutations";
import { INTENT } from "~/lib/CONSTANTS";
import { isSocialMediaContent } from "~/utils";
import { PrismButton } from "~/components/prism";
import { cn } from "cnfast";
interface ActionFormFooterProps {
  /** Phone-width panel: one scrolling strip plus an icon-only save button. */
  compact?: boolean;
  RawAction: Action;
  setRawAction: (action: Action) => void;
  updateAction: (data?: Record<string, unknown>) => Promise<unknown>;
  currentPartners: Partner[];
  isPending: boolean;
  handleSave: () => Promise<boolean>;
  handleClose: () => void;
}
export function ActionFormFooter({
  compact = false,
  RawAction,
  setRawAction,
  updateAction,
  currentPartners,
  isPending,
  handleSave,
  handleClose,
}: ActionFormFooterProps) {
  const { handleAction } = useActionMutations();
  const saveLabel = RawAction.id
    ? isPending
      ? "Atualizando..."
      : "Atualizar"
    : isPending
      ? "Criando..."
      : "Criar";
  // In the compact strip each command is its own divided item.
  const command = (node: ReactNode) =>
    compact ? <div className="flex shrink-0 items-center">{node}</div> : node;
  const actionCommands = RawAction.id && (
    <>
      {command(
        <SprintCombobox
          currentPartners={currentPartners}
          onSelect={async (newSprints, newResponsibles) => {
            const finalSprints = newSprints.length > 0 ? newSprints : null;
            setRawAction({
              ...RawAction,
              sprints: finalSprints,
              responsibles: newResponsibles,
            });
            await updateAction({
              sprints: finalSprints,
              responsibles: newResponsibles,
            });
          }}
          responsibles={RawAction.responsibles || []}
          selectedSprints={RawAction.sprints || []}
          tabIndex={0}
        />,
      )}
      {command(
        <PrismButton
          aria-label="Duplicar ação (Shift+D)"
          onClick={() => {
            handleAction({
              id: RawAction.id,
              intent: INTENT.duplicate_action,
            });
            handleClose();
          }}
          size="icon"
          variant="ghost"
        >
          <CopyIcon />
        </PrismButton>,
      )}
      {!RawAction.archived &&
        command(
          <PrismButton
            aria-label="Arquivar ação"
            onClick={async () => {
              if (confirm("Tem certeza que deseja arquivar esta ação?")) {
                setRawAction({
                  ...RawAction,
                  archived: true,
                  sprints: null,
                });
                await updateAction({
                  archived: true,
                });
                handleClose();
              }
            }}
            size="icon"
            variant="ghost"
          >
            <ArchiveIcon />
          </PrismButton>,
        )}
      {RawAction.archived &&
        command(
          <PrismButton
            aria-label="Desarquivar ação"
            className="text-amber-500 hover:text-amber-600"
            onClick={async () => {
              if (confirm("Tem certeza que deseja desarquivar esta ação?")) {
                setRawAction({
                  ...RawAction,
                  archived: false,
                });
                await updateAction({
                  archived: false,
                });
                handleClose();
              }
            }}
            size="icon"
            variant="ghost"
          >
            <ArchiveRestoreIcon />
          </PrismButton>,
        )}
    </>
  );
  return (
    <div className="flex w-full shrink-0 items-center justify-between overflow-hidden border-t">
      {/* Coisas */}
      <FooterStrip compact={compact}>
        {/* Parceiros Partners Combobox */}
        <div className="shrink-0" data-drawer-focus="control">
          <PartnersCombobox
            onSelect={async (selected) => {
              const selectedPartnersData = currentPartners.filter((p) =>
                selected.includes(p.slug),
              );

              let newColor = RawAction.color;
              if (
                !RawAction.id &&
                selectedPartnersData.length > 0 &&
                selectedPartnersData[0].colors &&
                selectedPartnersData[0].colors.length > 0 &&
                (!newColor || newColor === "#666666" || newColor === "#666")
              ) {
                newColor = selectedPartnersData[0].colors[0];
              }

              setRawAction({
                ...RawAction,
                partners: selected,
                color: newColor,
              });
              await updateAction({
                partners: selected,
                color: newColor,
              });
            }}
            selectedPartners={RawAction.partners}
            showText={false}
            tabIndex={0}
          />
        </div>
        {/* Fases Phase Combobox */}
        <div className="shrink-0" data-drawer-focus="control">
          <PhaseCombobox
            triggerVariant="form-footer"
            iconVariant="progress"
            onSelect={async (selected) => {
              const phaseValue =
                typeof selected === "string"
                  ? selected
                  : (
                      selected as {
                        phase: string;
                      }
                    ).phase;
              setRawAction({
                ...RawAction,
                phase: phaseValue as Action["phase"],
              });
              await updateAction({
                phase: phaseValue,
              });
            }}
            selectedPhase={RawAction.phase ?? "idea"}
            showText={false}
            tabIndex={0}
          />
        </div>
        {/* Categorias Categories Combobox */}
        <div className="shrink-0" data-drawer-focus="control">
          <CategoriesCombobox
            triggerVariant="form-footer"
            onSelect={async ({ category }) => {
              setRawAction({
                ...RawAction,
                category,
              });
              await updateAction({
                category,
              });
            }}
            selectedCategories={[RawAction.category]}
            showText={false}
            tabIndex={0}
          />
        </div>
        {isSocialMediaContent(RawAction.category) && (
          <div className="shrink-0" data-drawer-focus="control">
            <ActionColorDropdown
              action={RawAction}
              onSelect={async (color) => {
                setRawAction({
                  ...RawAction,
                  color,
                });
                await updateAction({
                  color,
                });
              }}
              partners={currentPartners}
              tabIndex={0}
            />
          </div>
        )}
        {compact && actionCommands}
      </FooterStrip>
      {/* Botão de criar e atualizar */}
      <div className={cn("flex items-center gap-2 p-2", compact && "shrink-0")}>
        {!compact && actionCommands}
        <div data-drawer-focus="control">
          <PrismButton
            aria-label={compact ? saveLabel : undefined}
            className={cn(
              "overflow-hidden rounded-2xl squircle",
              !compact && "w-32",
            )}
            isDisabled={isPending}
            onClick={async (event) => {
              event.preventDefault();
              event.stopPropagation();
              const success = await handleSave();
              if (success && event.shiftKey) {
                handleClose();
              }
            }}
            size={compact ? "icon" : "default"}
          >
            {!compact && <div className="truncate">{saveLabel}</div>}
            {isPending ? (
              <LoaderIcon className="animate-spin" />
            ) : RawAction.id ? (
              <CloudUploadIcon />
            ) : (
              <PlusIcon />
            )}
          </PrismButton>
        </div>
      </div>
    </div>
  );
}

// Keeps a focused control clear of the fade that covers the strip edges.
const STRIP_FADE_PX = 24;

function FooterStrip({
  compact,
  children,
}: {
  compact: boolean;
  children: ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerFocusRef = useRef(false);
  const [edges, setEdges] = useState({ start: false, end: false });
  const updateEdges = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    const start = scroller.scrollLeft > 1;
    const end = scroller.scrollLeft < maxScroll - 1;
    setEdges((previous) =>
      previous.start === start && previous.end === end
        ? previous
        : { start, end },
    );
  }, []);
  useLayoutEffect(() => {
    if (!compact) return;
    updateEdges();
    if (typeof ResizeObserver === "undefined") return;
    // The track resizes when controls appear or their content loads.
    const observer = new ResizeObserver(updateEdges);
    if (scrollerRef.current) observer.observe(scrollerRef.current);
    if (trackRef.current) observer.observe(trackRef.current);
    return () => observer.disconnect();
  }, [compact, updateEdges]);
  // The drawer's Tab handling focuses without scrolling, so reveal the control here.
  const revealFocused = (event: FocusEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    const target: EventTarget = event.target;
    // React portals (popovers) bubble focus here from outside the strip.
    if (
      !compact ||
      !scroller ||
      !(target instanceof Element) ||
      target === scroller ||
      !scroller.contains(target)
    )
      return;
    // Pointer focus must not move the control away before the press ends.
    if (pointerFocusRef.current) {
      pointerFocusRef.current = false;
      return;
    }
    const frame = scroller.getBoundingClientRect();
    const control = target.getBoundingClientRect();
    if (control.left < frame.left + STRIP_FADE_PX) {
      scroller.scrollLeft -= frame.left + STRIP_FADE_PX - control.left;
    } else if (control.right > frame.right - STRIP_FADE_PX) {
      scroller.scrollLeft += control.right - (frame.right - STRIP_FADE_PX);
    }
    updateEdges();
  };
  return (
    <div className={cn("relative flex min-w-0", compact ? "flex-1" : "shrink")}>
      <div
        className="no-scrollbar flex min-w-0 shrink items-center overflow-x-auto"
        data-action-footer-strip={compact ? "" : undefined}
        onFocus={revealFocused}
        onPointerCancelCapture={() => {
          pointerFocusRef.current = false;
        }}
        onPointerDownCapture={() => {
          pointerFocusRef.current = true;
        }}
        onPointerUpCapture={() => {
          pointerFocusRef.current = false;
        }}
        onScroll={compact ? updateEdges : undefined}
        ref={scrollerRef}
      >
        <div className="flex shrink-0 items-center divide-x" ref={trackRef}>
          {children}
        </div>
      </div>
      {compact && edges.start && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-linear-to-r from-background to-transparent"
          data-strip-fade="start"
        />
      )}
      {compact && edges.end && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-background to-transparent"
          data-strip-fade="end"
        />
      )}
    </div>
  );
}
