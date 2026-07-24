import { parseU } from "~/utils/date";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  FishingHookIcon,
  PlusIcon,
} from "lucide-react";
import { Suspense, lazy, useRef, useState } from "react";
import { ResponsiblesCombobox } from "~/components/features/ResponsiblesCombobox";
const Tiptap = lazy(() =>
  import("~/components/features/Tiptap").then((module) => ({
    default: module.Tiptap,
  })),
);
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "~/components/ui/sheet";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { UButtonAI } from "~/components/uzzina/UButtonAI";
import { INTENT } from "~/lib/CONSTANTS";
import { getNewDateForAction, isLateAction } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action, Partner, PartnerTopic } from "~/types";
import { ActionDatePicker } from "./ActionDatePicker";
import { ActionTimeDisplay } from "./ActionTimeDisplay";
import { ActionTitleInput } from "./ActionTitleInput";
import { WorkFileThumbnail } from "./WorkFileThumbnail";
import { TopicsCombobox } from "~/components/features/TopicsCombobox";
import { PrismButton } from "~/components/prism";
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
  const [hooksOpen, setHooksOpen] = useState(false);
  const [hooks, setHooks] = useState<
    {
      tipo: string;
      texto: string;
    }[]
  >([]);
  const [racional, setRacional] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const handleTriggerAI = async () => {
    const res = await triggerAIAction(INTENT.ai_hooks);
    const data = res as
      | {
          intent: string;
          output: {
            racional?: string;
            hooks?: {
              tipo: string;
              texto: string;
            }[];
          };
        }
      | undefined;
    if (data?.output) {
      setRacional(data.output.racional ?? "");
      setHooks(data.output.hooks ?? []);
      setHooksOpen(true);
    }
  };
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Título */}
      <ActionTitleInput
        autoFocus
        className="font-bold tracking-[-5%]"
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

          <div className="flex gap-1">
            {hooks.length > 0 && (
              <PrismButton
                onClick={() => {
                  setHooksOpen(true);
                }}
                size={"sm"}
                variant={"secondary"}
              >
                <FishingHookIcon />
              </PrismButton>
            )}
            <UButtonAI disabled={isAIProcessing} onClick={handleTriggerAI}>
              CRIAR COM IA
            </UButtonAI>
          </div>
        </div>

        <div className="flex items-start gap-2 border-b px-4 py-1">
          <div className="flex flex-wrap items-center gap-1.5">
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
              className={`text-foreground/50 ${workFiles.length === 0 ? "text-md flex items-center gap-1.5 py-1.5 underline-offset-2 hover:underline" : "squircle flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary transition hover:bg-secondary/50"}`}
              cloudName={cloudName}
              folder="uzzina/work"
              multiple
              onUpload={handleUpload}
              outputWidth={1200}
              resourceType="auto"
              uploadPreset={uploadPreset}
            >
              {workFiles.length === 0 && <span>Adicionar arquivo</span>}
              <PlusIcon className="size-3" />
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
              "h-full w-full min-h-50",
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
      <Sheet onOpenChange={setHooksOpen} open={hooksOpen}>
        <SheetContent className="max-h-[85vh] overflow-y-auto" side="bottom">
          <div className="sr-only">
            <SheetTitle>Hooks gerados pela IA</SheetTitle>
            <SheetDescription>{racional}</SheetDescription>
          </div>
          {isCreatingPost ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <div className="text-center">
                <h3 className="text-xl font-bold">Criando conteúdo...</h3>
                <p className="text-sm text-muted-foreground">
                  Isso pode levar alguns segundos.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4 pb-12 lg:p-8">
              <div className="pt-8 text-3xl font-bold">Hooks</div>
              <div className="pb-8 text-xl">{racional}</div>
              {hooks.map((hook, i) => (
                <HookItem
                  key={hook.tipo}
                  category={RawAction.category}
                  hook={hook}
                  onChange={(texto) => {
                    setHooks((prev) =>
                      prev.map((h, j) =>
                        j === i
                          ? {
                              ...h,
                              texto,
                            }
                          : h,
                      ),
                    );
                  }}
                  onSubmit={async (data) => {
                    const intent = data.intent as string;
                    setIsCreatingPost(true);
                    await triggerAIAction(intent, data);
                    setIsCreatingPost(false);
                    setHooksOpen(false);
                  }}
                  partner_context={currentPartners[0]?.context || ""}
                  racional={racional}
                  RawAction={RawAction}
                />
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
function HookItem({
  hook,
  racional,
  RawAction,
  onChange,
  category,
  onSubmit,
  partner_context,
}: {
  hook: {
    tipo: string;
    texto: string;
  };
  racional: string;
  RawAction: Action;
  onChange: (texto: string) => void;
  category: string;
  onSubmit: (formData: Record<string, string | string[] | null>) => void;
  partner_context: string;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold tracking-widest uppercase opacity-40">
        {hook.tipo}
      </div>

      <div className="flex items-center gap-4">
        <textarea
          aria-label="Texto de apoio da ação"
          className="w-full resize-none rounded-lg border bg-transparent px-4 py-2 outline-none"
          onChange={(e) => onChange(e.target.value)}
          style={{
            fieldSizing: "content",
          }}
          value={hook.texto}
        />
        <PrismButton
          className="h-8 w-8 shrink-0 rounded-full"
          onClick={() => {
            const intent = {
              post: INTENT.ai_post,
              reels: INTENT.ai_reels,
              carousel: INTENT.ai_carousel,
              stories: INTENT.ai_stories,
            }[category];
            onSubmit({
              intent: intent || INTENT.ai_post,
              tipo: hook.tipo,
              hook: hook.texto,
              description: RawAction.description,
              racional: racional,
              partner_context: partner_context,
            });
          }}
          size="icon"
          variant="secondary"
        >
          <ArrowRightIcon className="size-4" />
        </PrismButton>
      </div>
    </div>
  );
}
