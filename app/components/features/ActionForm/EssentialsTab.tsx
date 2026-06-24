import { parseISO } from "date-fns";
import { CalendarDaysIcon, FishingHookIcon, PlusIcon } from "lucide-react";
import { Suspense, lazy, useRef, useState } from "react";
import { ResponsiblesCombobox } from "~/components/features/ResponsiblesCombobox";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { UButtonAI } from "~/components/uzzina/UButtonAI";
import { getNewDateForAction, isLateAction } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import type { Partner } from "~/models/partners.server";
import { ActionDatePicker } from "./ActionDatePicker";
import { ActionTimeDisplay } from "./ActionTimeDisplay";
import { ActionTitleInput } from "./ActionTitleInput";
import { WorkFileThumbnail } from "./WorkFileThumbnail";
import { ArrowRightIcon } from "lucide-react";
import type { FetcherWithComponents } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "~/components/ui/sheet";
import { INTENT } from "~/lib/CONSTANTS";
const Tiptap = lazy(() =>
  import("~/components/features/Tiptap").then((module) => ({
    default: module.Tiptap,
  })),
);
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
  fetcher: FetcherWithComponents<{
    intent?: string;
    output?: {
      racional?: string;
      hooks?: {
        tipo: string;
        texto: string;
      }[];
    };
  }>;
  onDescriptionChange?: (description: string) => void;
  descriptionVersion?: number;
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
  fetcher,
  uploadPreset,
  onDescriptionChange,
  descriptionVersion,
}: EssentialsTabProps) {
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
  const lastDataRef = useRef(fetcher.data);
  if (fetcher.data !== lastDataRef.current) {
    lastDataRef.current = fetcher.data;
    if (fetcher.data?.intent === INTENT.ai_hooks && fetcher.data.output) {
      setRacional(fetcher.data.output.racional ?? "");
      setHooks(fetcher.data.output.hooks ?? []);
      setHooksOpen(true);
      setIsCreatingPost(false);
    }
    if (
      fetcher.data?.intent &&
      (
        [
          INTENT.ai_post,
          INTENT.ai_carousel,
          INTENT.ai_stories,
          INTENT.ai_reels,
        ] as string[]
      ).includes(fetcher.data.intent)
    ) {
      setHooksOpen(false);
      setIsCreatingPost(false);
    }
  }
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

          <button
            type="button"
            className="ml-auto rounded border bg-secondary p-1 font-mono text-[10px] cursor-pointer"
            onClick={() => {
              setisIDVisible(!isIDVisible);
            }}
            aria-label="Alternar exibição do ID da ação"
          >
            {isIDVisible ? RawAction.id : "ID"}
          </button>
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
              date={parseISO(RawAction.date)}
              onSelect={async (date) => {
                setRawAction({
                  ...RawAction,
                  ...getNewDateForAction(RawAction, date),
                });
                await updateAction({
                  ...RawAction,
                  ...getNewDateForAction(RawAction, date),
                });
              }}
            />
          </div>

          <div className="flex gap-1">
            {hooks.length > 0 && (
              <Button
                onClick={() => {
                  setHooksOpen(true);
                }}
                size={"sm"}
                variant={"secondary"}
              >
                <FishingHookIcon />
              </Button>
            )}
            <UButtonAI
              disabled={isAIProcessing}
              onClick={() => {
                fetcher.submit(
                  {
                    intent: INTENT.ai_hooks,
                    title: RawAction.title,
                    description: RawAction.description,
                    partner_context: currentPartners[0].context,
                  },
                  {
                    method: "post",
                    action: "/action/handle-ai",
                  },
                );
              }}
            >
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
              onUpload={async (url, meta) => {
                const getNow = () => Date.now();
                const now = getNow();
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
              }}
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
      <div className="h-full overflow-hidden p-4 focus-within:bg-secondary/50">
        {/* Descrição */}
        <div className="h-full overflow-hidden">
          <Suspense
            fallback={<div className="h-full w-full animate-pulse bg-muted" />}
          >
            <Tiptap
              key={descriptionVersion}
              className={cn("h-full w-full", isAIProcessing && "opacity-40")}
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
                  onSubmit={(data) => {
                    setIsCreatingPost(true);
                    fetcher.submit(data, {
                      method: "post",
                      action: "/action/handle-ai",
                    });
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
          className="w-full resize-none rounded-lg border bg-transparent px-4 py-2 outline-none"
          onChange={(e) => onChange(e.target.value)}
          style={{
            fieldSizing: "content",
          }}
          value={hook.texto}
          aria-label="Texto de apoio da ação"
        />
        <Button
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
        </Button>
      </div>
    </div>
  );
}
