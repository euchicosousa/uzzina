import { parseU } from "~/utils/date";
import {
  CalendarDaysIcon,
  FilePlus,
  ListIcon,
  LoaderIcon,
  SparklesIcon,
} from "lucide-react";
import { Suspense, lazy, useRef, useState } from "react";
import { ResponsiblesCombobox } from "~/components/features/ResponsiblesCombobox";
const Tiptap = lazy(() =>
  import("~/components/features/RichTextEditor").then((module) => ({
    default: module.Tiptap,
  })),
);
import { PrismButton } from "~/components/prism";
import { CloudinaryUpload } from "~/components/features/media/CloudinaryUpload";
import { INTENT } from "~/lib/CONSTANTS";
import { getNewDateForAction, isInstagramFeed, isLateAction } from "~/lib/helpers";
import { cn } from "cnfast";
import type { Action, Partner, PartnerTopic } from "~/types";
import { ActionDatePicker } from "./ActionDatePicker";
import { ActionTimeDisplay } from "./ActionTimeDisplay";
import { ActionTitleInput } from "./ActionTitleInput";
import { WorkFileThumbnail } from "~/components/features/media/WorkFileThumbnail";
import { TopicsCombobox } from "~/components/features/TopicsCombobox";
interface EssentialsTabProps {
  RawAction: Action;
  setRawAction: (action: Action | ((prev: Action) => Action)) => void;
  updateAction: (
    data?: Record<string, unknown>,
    forceCreate?: boolean,
  ) => Promise<void>;
  workFiles: string[];
  setWorkFiles: (files: string[]) => void;
  currentPartners: Partner[];
  cloudName: string;
  uploadPreset: string;
  isAIProcessing: boolean;
  onOpenStrategyModal?: () => void;
  onDescriptionChange?: (description: string) => void;
  descriptionVersion?: number;
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
  onOpenStrategyModal,
  triggerAIAction,
  uploadPreset,
  onDescriptionChange,
  descriptionVersion,
}: EssentialsTabProps) {
  // Coleta todos os tópicos disponíveis baseados nos parceiros associados à ação
  const partnerSlugSet = new Set(RawAction.partners || []);
  const availableTopics = currentPartners
    .filter((p) => partnerSlugSet.has(p.slug))
    .flatMap((p) => (p.topics as unknown as PartnerTopic[]) || []);
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
  const [isIDVisible, setisIDVisible] = useState(false);
  const handleTriggerAI = async () => {
    await triggerAIAction(INTENT.ai_strategy);
  };
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Título */}
      <ActionTitleInput
        autoFocus
        className="font-medium tracking-[-5%]"
        onBlur={async (title) => {
          await updateAction(
            {
              title,
            },
            true,
          );
        }}
        onChange={async (title) => {
          setRawAction({
            ...RawAction,
            title,
          });
        }}
        tabIndex={0}
        title={RawAction.title}
      />

      <div className="text-sm">
        <div className="flex flex-wrap items-center gap-4 border-b px-4 py-2">
          <div className="opacity-50">
            <ActionTimeDisplay action={RawAction} />
          </div>
          <ResponsiblesCombobox
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

          <TopicsCombobox
            availableTopics={availableTopics}
            onSelect={async (topic_ids) => {
              setRawAction({
                ...RawAction,
                topic_ids,
              });
              await updateAction({
                topic_ids,
              });
            }}
            selectedTopicIds={RawAction.topic_ids || []}
          />

          <PrismButton
            aria-label="Alternar exibição do ID da ação"
            className="ml-auto h-6 px-2 font-mono text-[10px]"
            onClick={() => {
              setisIDVisible(!isIDVisible);
            }}
            variant="ghost"
          >
            {isIDVisible ? RawAction.id : "ID"}
          </PrismButton>
        </div>

        <div className="flex justify-between gap-8 border-b px-4 py-1">
          <div className="flex items-center gap-1">
            <CalendarDaysIcon
              className={cn(
                "size-4",
                isLateAction(RawAction) ? "text-destructive" : "opacity-50",
              )}
            />
            <ActionDatePicker
              className={cn(
                isLateAction(RawAction) ? "text-destructive" : "opacity-50",
              )}
              date={parseU(RawAction.date)}
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
          </div>

          {isInstagramFeed(RawAction.category, true) && (
            <div className="flex gap-1">
              {Array.isArray(RawAction.strategies) &&
                RawAction.strategies.length > 0 && (
                <PrismButton
                  aria-label="Ver estratégias geradas"
                  onClick={onOpenStrategyModal}
                  size="xs"
                  variant="secondary"
                >
                  <ListIcon className="size-3.5" />
                </PrismButton>
              )}
              <PrismButton
                isDisabled={isAIProcessing}
                onClick={handleTriggerAI}
                size="xs"
                variant={"secondary"}
              >
                {isAIProcessing ? "CRIANDO ESTRATÉGIA..." : "CRIAR ESTRATÉGIA"}
                {isAIProcessing ? (
                  <LoaderIcon className="size-3.5 animate-spin" />
                ) : (
                  <SparklesIcon />
                )}
              </PrismButton>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 border-b px-4 py-1">
          <div className="flex flex-wrap items-center gap-1">
            {workFiles.map((url, i) => (
              <WorkFileThumbnail
                key={url}
                onRemove={async () => {
                  const next = workFiles.filter((_, idx) => idx !== i);
                  setWorkFiles(next);
                  setRawAction((prev) => ({
                    ...prev,
                    work_files: next,
                  }));
                  await updateAction({
                    work_files: next,
                  });
                }}
                url={url}
              />
            ))}
            <CloudinaryUpload
              className={cn(
                workFiles.length === 0 &&
                  "h-8 p-0 text-muted-foreground gap-1 font-normal hover:underline",
              )}
              cloudName={cloudName}
              folder="uzzina/work"
              multiple
              onUpload={handleUpload}
              outputWidth={1200}
              resourceType="auto"
              size={workFiles.length === 0 ? "sm" : "icon-xs"}
              uploadPreset={uploadPreset}
              variant={workFiles.length === 0 ? "unstyled" : "secondary"}
            >
              <FilePlus className="size-4" />
              {workFiles.length === 0 && <span>Adicionar arquivo</span>}
            </CloudinaryUpload>
          </div>
        </div>
      </div>
      {/* Descrição */}
      <div className="h-full overflow-hidden">
        <Suspense
          fallback={
            <div className="h-full w-full min-h-50 animate-pulse bg-muted rounded-2xl" />
          }
        >
          <Tiptap
            key={descriptionVersion}
            className={cn(
              "h-full w-full min-h-50 bg-popover",
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
    </div>
  );
}
