import { UAIModelSelect } from "~/components/uzzina/UAIModelSelect";
import { actionAIModels } from "~/lib/action-ai-models";
import { parseU } from "~/utils/date";
import {
  ChevronDownIcon,
  FileIcon,
  ListIcon,
  PlusIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { ULoader } from "~/components/uzzina/ULoader";
import {
  Suspense,
  lazy,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { UPeopleCombobox } from "~/components/uzzina/UPeopleCombobox";
const Tiptap = lazy(() =>
  import("~/components/features/RichTextEditor").then((module) => ({
    default: module.Tiptap,
  })),
);
import {
  PrismButton,
  PrismButtonGroup,
  PrismButtonGroupSeparator,
  PrismSkeleton,
} from "~/components/prism";
import { CloudinaryUpload } from "~/components/features/media/CloudinaryUpload";
import { INTENT } from "~/lib/CONSTANTS";
import type { TextDraftField } from "~/components/features/action-drawer/ActionFormDrawer";
import {
  getNewDateForAction,
  isSocialMediaContent,
  isLateAction,
  parseStrategies,
} from "~/utils";
import { cn } from "cnfast";
import type { Action, Partner } from "~/types";
import { UActionDatePicker } from "~/components/uzzina/UActionDatePicker";
import { ActionTimeDisplay } from "./ActionTimeDisplay";
import { ActionTitleInput } from "./ActionTitleInput";
import { ContentReorderDialog } from "~/components/features/media/ContentReorderDialog";
import { useShortWritingPanel } from "./useWritingAreaHeight";
interface EssentialsTabProps {
  /** Height Essencial needs without scrolling (title + metadata + description minimum). */
  onNeededHeightChange?: (height: number) => void;
  RawAction: Action;
  setRawAction: (action: Action | ((prev: Action) => Action)) => void;
  updateAction: (
    data?: Record<string, unknown>,
    forceCreate?: boolean,
  ) => Promise<unknown>;
  workFiles: string[];
  setWorkFiles: (files: string[]) => void;
  currentPartners: Partner[];
  cloudName: string;
  uploadPreset: string;
  isAIProcessing: boolean;
  strategyStatus?:
    | "generating"
    | "saving"
    | "saving-selection"
    | "unsaved"
    | "error"
    | "conflict"
    | "saved"
    | null;
  hasStrategyActivity?: boolean;
  autoFocus?: boolean;
  /** Phone-width panel: metadata collapses behind a date summary. */
  compact?: boolean;
  detailsExpanded?: boolean;
  onDetailsExpandedChange?: (expanded: boolean) => void;
  onOpenStrategyModal?: () => void;
  onDescriptionChange?: (description: string) => void;
  onTitleBlur?: (title: string) => Promise<void>;
  /** Receives each typed title without re-rendering the drawer. */
  onTextDraft?: (field: TextDraftField, value: string) => void;
  /** Commits the typed title to the form on blur. */
  onTextCommit?: (field: TextDraftField, value: string) => void;
  descriptionVersion?: number;
  strategyModel: string;
  onStrategyModelChange: (id: string) => void;
  triggerAIAction: (
    intent: string,
    customPayload?: Record<string, string | string[] | null>,
  ) => Promise<unknown>;
}
export function EssentialsTab({
  RawAction,
  setRawAction,
  updateAction,
  workFiles,
  setWorkFiles,
  currentPartners,
  cloudName,
  isAIProcessing,
  strategyStatus,
  hasStrategyActivity = false,
  onOpenStrategyModal,
  strategyModel,
  onStrategyModelChange,
  triggerAIAction,
  uploadPreset,
  onDescriptionChange,
  onTitleBlur,
  onTextDraft,
  onTextCommit,
  descriptionVersion,
  autoFocus = true,
  compact = false,
  detailsExpanded = false,
  onDetailsExpandedChange,
  onNeededHeightChange,
}: EssentialsTabProps) {
  const [workFilesDialogOpen, setWorkFilesDialogOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const shortPanel = useShortWritingPanel(scrollerRef);
  const neededHeightCallback = useRef(onNeededHeightChange);
  neededHeightCallback.current = onNeededHeightChange;
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === "undefined") return;
    // Children: title, metadata (both shrink-0) and the description, whose
    // own height depends on the scroller; only its minimum counts as needed.
    const [title, metadata, description] = Array.from(scroller.children);
    if (!title || !metadata || !description) return;
    const measure = () => {
      const minimum =
        Number.parseFloat(getComputedStyle(description).minHeight) || 0;
      neededHeightCallback.current?.(
        title.getBoundingClientRect().height +
          metadata.getBoundingClientRect().height +
          minimum,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(title);
    observer.observe(metadata);
    return () => observer.disconnect();
  }, []);
  const workFilesRef = useRef(workFiles);
  workFilesRef.current = workFiles;
  const workFilesMetaRef = useRef<
    Record<
      string,
      {
        name: string;
        addedAt: number;
      }
    >
  >({});
  const handleUpload = async (
    url: string,
    meta: {
      originalFilename?: string;
    },
  ) => {
    const now = Date.now();
    workFilesMetaRef.current[url] = {
      name: meta.originalFilename || url,
      addedAt: now,
    };
    let next = [...workFilesRef.current, url];
    const splitIndex = next.findIndex((u) => {
      const m = workFilesMetaRef.current[u];
      return m && m.addedAt > now - 5000;
    });
    if (splitIndex !== -1) {
      const oldUrls = next.slice(0, splitIndex);
      const recentUrls = next.slice(splitIndex);
      recentUrls.sort((a, b) => {
        const nameA = workFilesMetaRef.current[a]?.name || a;
        const nameB = workFilesMetaRef.current[b]?.name || b;
        return nameA.localeCompare(nameB);
      });
      next = [...oldUrls, ...recentUrls];
    }
    workFilesRef.current = next;
    setWorkFiles(next);
    setRawAction((prev) => ({
      ...prev,
      work_files: next,
    }));
    await updateAction({
      work_files: next,
    });
  };
  const handleTriggerAI = async () => {
    await triggerAIAction(INTENT.ai_strategy, { model: strategyModel });
  };
  const detailsId = useId();
  const isSocial = isSocialMediaContent(RawAction.category);
  const dateControl = (
    <UActionDatePicker
      date={parseU(RawAction.date)}
      isLate={isLateAction(RawAction)}
      onSelect={async (date) => {
        setRawAction({
          ...RawAction,
          ...getNewDateForAction(RawAction, date),
        });
        await updateAction({
          ...getNewDateForAction(RawAction, date),
        });
      }}
    />
  );
  return (
    <div
      className="flex h-full min-h-0 w-full max-w-full flex-col overflow-x-hidden overflow-y-auto overscroll-contain"
      data-essential-scroller
      ref={scrollerRef}
    >
      {/* Título */}
      <div className="shrink-0" data-drawer-focus="title">
        <ActionTitleInput
          autoFocus={autoFocus}
          className="font-medium tracking-[-5%] transition-colors focus-within:bg-input"
          onBlur={async (title) => {
            if (onTextCommit) onTextCommit("title", title);
            else setRawAction((prev) => ({ ...prev, title }));
            if (onTitleBlur) {
              await onTitleBlur(title);
            } else {
              await updateAction(
                {
                  title,
                },
                true,
              );
            }
          }}
          onChange={(title) => onTextDraft?.("title", title)}
          tabIndex={0}
          title={RawAction.title}
        />
      </div>

      <div className="max-w-full shrink-0 text-sm">
        {compact && (
          <div className="flex max-w-full items-center gap-2 border-b px-4 py-1">
            {dateControl}
            {workFiles.length > 0 && (
              <span
                aria-label="Com arquivos de trabalho"
                className="flex size-8 shrink-0 items-center justify-center text-muted-foreground"
                role="img"
              >
                <FileIcon aria-hidden="true" className="size-4" />
              </span>
            )}
            <PrismButton
              aria-controls={detailsId}
              aria-expanded={detailsExpanded}
              aria-label="Detalhes da ação"
              className="ml-auto"
              onPress={() => onDetailsExpandedChange?.(!detailsExpanded)}
              size="icon-sm"
              variant="ghost"
            >
              <ChevronDownIcon
                className={cn(
                  "size-4 transition-transform",
                  detailsExpanded && "rotate-180",
                )}
              />
            </PrismButton>
          </div>
        )}
        {/* Collapsed details stay mounted (uploads, ID toggle) but leave focus order. */}
        <div hidden={compact && !detailsExpanded} id={detailsId}>
          <div className="flex max-w-full flex-wrap items-center justify-between gap-2 border-b py-1 pr-4">
            <UPeopleCombobox
              mode="responsibles"
              size="sm"
              variant="link"
              currentPartners={currentPartners}
              onSelect={async (responsibles) => {
                setRawAction({
                  ...RawAction,
                  responsibles,
                });
                await updateAction({
                  ...RawAction,
                  responsibles,
                });
              }}
              selectedResponsibles={RawAction.responsibles}
            />

            <ActionTimeDisplay action={RawAction} />
          </div>

          <div
            className="flex max-w-full flex-wrap items-center justify-between gap-2 border-b py-1 pr-4"
            hidden={compact && !isSocial}
          >
            {!compact && dateControl}

            {isSocial &&
              (() => {
                const hasStrategies =
                  parseStrategies(RawAction.strategies).length > 0;
                const buttonLabel =
                  strategyStatus === "saving"
                    ? "Salvando estratégias..."
                    : strategyStatus === "generating"
                      ? hasStrategies
                        ? "Recriando estratégias..."
                        : "Criando estratégias..."
                      : hasStrategies
                        ? "Recriar estratégias"
                        : "Criar estratégia";
                return (
                  <PrismButtonGroup className="min-w-0 shrink">
                    {(hasStrategies || hasStrategyActivity) &&
                      onOpenStrategyModal && (
                        <>
                          <PrismButton
                            aria-label={
                              hasStrategies &&
                              !["generating", "saving"].includes(
                                strategyStatus || "",
                              )
                                ? "Ver estratégias geradas"
                                : "Ver progresso das estratégias"
                            }
                            onClick={onOpenStrategyModal}
                            size="sm"
                            variant="secondary"
                          >
                            <ListIcon />
                          </PrismButton>
                          <PrismButtonGroupSeparator className="bg-background" />
                        </>
                      )}

                    <PrismButton
                      className="min-w-0 shrink"
                      isDisabled={
                        isAIProcessing || strategyStatus === "unsaved"
                      }
                      onClick={handleTriggerAI}
                      size="sm"
                      variant="secondary"
                    >
                      <span className="min-w-0 truncate" title={buttonLabel}>
                        {buttonLabel}
                      </span>
                      {isAIProcessing ? (
                        <ULoader size="sm" inheritColor />
                      ) : null}
                    </PrismButton>
                    <PrismButtonGroupSeparator className="bg-background" />
                    <UAIModelSelect
                      models={actionAIModels}
                      value={strategyModel}
                      onChange={onStrategyModelChange}
                      isDisabled={
                        isAIProcessing || strategyStatus === "unsaved"
                      }
                      size="sm"
                      variant="secondary"
                    />
                  </PrismButtonGroup>
                );
              })()}
          </div>

          <div className="flex max-w-full items-center justify-between gap-2 overflow-hidden border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <CloudinaryUpload
                cloudName={cloudName}
                folder="uzzina/work"
                multiple
                onUpload={handleUpload}
                outputWidth={1200}
                resourceType="auto"
                size="xs"
                uploadPreset={uploadPreset}
                variant="secondary"
              >
                <PlusIcon className="size-3.5" />
                Adicionar arquivo
              </CloudinaryUpload>
            </div>

            {workFiles.length > 0 && (
              <PrismButton
                onClick={() => setWorkFilesDialogOpen(true)}
                size="xs"
                type="button"
                variant="ghost"
              >
                <SlidersHorizontalIcon />
                {`${workFiles.length} arquivo${workFiles.length !== 1 ? "s" : ""}`}
              </PrismButton>
            )}
          </div>
        </div>
      </div>
      {/* Descrição */}
      <div
        className="min-h-50 w-full max-w-full flex-1 shrink-0 overflow-hidden"
        data-drawer-focus="description"
      >
        <Suspense
          fallback={<PrismSkeleton className="h-full min-h-50 w-full" />}
        >
          <Tiptap
            key={descriptionVersion}
            compactToolbar={compact || shortPanel}
            className={cn(
              "h-full min-h-50 w-full bg-popover [&_.tiptap]:transition-colors [&_.tiptap:focus]:bg-input",
              isAIProcessing && "opacity-40",
            )}
            content={RawAction.description || ""}
            disabled={isAIProcessing}
            handleBlur={async (content) => {
              if (content === RawAction.description) {
                return;
              }
              // Sync local state so RawAction stays consistent after blur
              setRawAction({
                ...RawAction,
                description: content,
              });
              await updateAction({
                description: content,
              });
            }}
            handleChange={(content) => {
              // Update the ref in the parent (zero re-renders).
              // The parent's handleSave reads from this ref so Cmd+Enter
              // always includes the latest typed content.
              onDescriptionChange?.(content);
            }}
            tabIndex={0}
          />
        </Suspense>
      </div>

      <ContentReorderDialog
        cloudName={cloudName}
        files={workFiles}
        onChange={async (next) => {
          workFilesMetaRef.current = {};
          workFilesRef.current = next;
          setWorkFiles(next);
          setRawAction((prev) => ({
            ...prev,
            work_files: next,
          }));
          await updateAction({
            work_files: next,
          });
        }}
        onOpenChange={setWorkFilesDialogOpen}
        open={workFilesDialogOpen}
        uploadPreset={uploadPreset}
        workFiles
      />
    </div>
  );
}
