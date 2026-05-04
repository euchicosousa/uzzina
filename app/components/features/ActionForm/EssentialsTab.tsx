import { parseISO } from "date-fns";
import {
  CalendarDaysIcon,
  FishingHookIcon,
  PlusIcon,
  SparklesIcon,
  Wand2,
} from "lucide-react";
import { Suspense, lazy, useRef, useState } from "react";
import { ResponsiblesCombobox } from "~/components/features/ResponsiblesCombobox";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { getNewDateForAction, isLateAction } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import type { Partner } from "~/models/partners.server";
import { ActionDatePicker } from "./ActionDatePicker";
import { ActionTimeDisplay } from "./ActionTimeDisplay";
import { ActionTitleInput } from "./ActionTitleInput";
import { WorkFileThumbnail } from "./WorkFileThumbnail";

import { ArrowRightIcon } from "lucide-react";
import { useEffect } from "react";
import type { FetcherWithComponents } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
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
    data?: { [key: string]: any },
    forceCreate?: boolean,
  ) => Promise<void>;
  workFiles: string[];
  setWorkFiles: (files: string[]) => void;
  currentPartners: Partner[];
  cloudName: string;
  uploadPreset: string;
  isAIProcessing: boolean;
  fetcher: FetcherWithComponents<any>;
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
    Record<string, { name: string; addedAt: number }>
  >({});

  const [isIDVisible, setisIDVisible] = useState(false);

  const [hooksOpen, setHooksOpen] = useState(false);
  const [hooks, setHooks] = useState<{ tipo: string; texto: string }[]>([]);
  const [racional, setRacional] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  useEffect(() => {
    if (fetcher.data?.intent === INTENT.ai_hooks) {
      setRacional(fetcher.data.output.racional ?? "");
      setHooks(fetcher.data.output.hooks ?? []);
      setHooksOpen(true);
      setIsCreatingPost(false);
    }

    if (
      fetcher.data?.intent &&
      [
        INTENT.ai_post,
        INTENT.ai_carousel,
        INTENT.ai_stories,
        INTENT.ai_reels,
      ].includes(fetcher.data.intent)
    ) {
      setHooksOpen(false);
      setIsCreatingPost(false);
    }
  }, [fetcher.data]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Título */}
      <ActionTitleInput
        title={RawAction.title}
        tabIndex={1}
        onChange={async (title) => {
          setRawAction({ ...RawAction, title });
        }}
        onBlur={async (title) => {
          await updateAction(
            {
              title,
            },
            true,
          );
        }}
      />

      <div className="text-sm">
        <div className="flex flex-wrap items-center gap-4 border-b px-4 py-2">
          <div className="opacity-50">
            <ActionTimeDisplay action={RawAction} />
          </div>
          <ResponsiblesCombobox
            selectedResponsibles={RawAction.responsibles}
            currentPartners={currentPartners}
            onSelect={async (responsibles) => {
              // @ts-ignore
              setRawAction({ ...RawAction, responsibles });
              await updateAction({
                ...RawAction,
                responsibles,
              });
            }}
          />

          <pre
            className="bg-secondary ml-auto rounded border p-1 text-[10px]"
            onClick={() => {
              setisIDVisible(!isIDVisible);
            }}
          >
            {isIDVisible ? RawAction.id : "ID"}
          </pre>
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
              onSelect={async (date) => {
                // @ts-ignore
                setRawAction({
                  ...RawAction,
                  ...getNewDateForAction(RawAction, date),
                });
                await updateAction({
                  ...RawAction,
                  ...getNewDateForAction(RawAction, date),
                });
              }}
              date={parseISO(RawAction.date)}
            />
          </div>
          <div className="flex gap-1">
            {hooks.length > 0 && (
              <Button
                size={"sm"}
                variant={"secondary"}
                onClick={() => {
                  setHooksOpen(true);
                }}
              >
                <FishingHookIcon />
              </Button>
            )}
            <button
              className="relative overflow-hidden rounded-full p-0.5 disabled:opacity-50"
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
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "conic-gradient(from var(--gradient-angle), #fc6, #f63, #96f, #6cf, #fc6)",
                  animation: "spin-gradient 3s linear infinite",
                }}
              />
              <div className="bg-background relative flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold tracking-wide">
                CRIAR COM IA
                <SparklesIcon className="size-3" />
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 border-b px-4 py-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {workFiles.map((url, i) => (
              <WorkFileThumbnail
                key={url + i}
                url={url}
                onRemove={async () => {
                  const next = workFiles.filter((_, idx) => idx !== i);
                  setWorkFiles(next);
                  // @ts-ignore
                  setRawAction((prev) => ({ ...prev, work_files: next }));
                  await updateAction({ work_files: next });
                }}
              />
            ))}
            <CloudinaryUpload
              cloudName={cloudName}
              uploadPreset={uploadPreset}
              folder="uzzina/work"
              resourceType="auto"
              multiple
              outputWidth={1200}
              onUpload={async (url, meta) => {
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
                // @ts-ignore
                setRawAction((prev) => ({ ...prev, work_files: next }));
                await updateAction({ work_files: next });
              }}
              className={`text-foreground/50 ${
                workFiles.length === 0
                  ? "text-md flex items-center gap-1.5 py-1.5 underline-offset-2 hover:underline"
                  : "squircle bg-secondary hover:bg-secondary/50 flex size-10 shrink-0 items-center justify-center rounded-xl transition"
              }`}
            >
              {workFiles.length === 0 && <span>Adicionar arquivo</span>}
              <PlusIcon className="size-3" />
            </CloudinaryUpload>
          </div>
        </div>
      </div>
      {/* Descrição */}
      <div className="focus-within:bg-secondary/50 h-full overflow-hidden p-4">
        {/* Descrição */}
        <div className="h-full overflow-hidden">
          <Suspense
            fallback={<div className="bg-muted h-full w-full animate-pulse" />}
          >
            <Tiptap
              key={descriptionVersion}
              disabled={isAIProcessing}
              content={RawAction.description || ""}
              tabIndex={2}
              handleChange={(content) => {
                // Update the ref in the parent (zero re-renders).
                // The parent's handleSave reads from this ref so Cmd+Enter
                // always includes the latest typed content.
                onDescriptionChange?.(content);
              }}
              handleBlur={async (content) => {
                if (content === RawAction.description) {
                  return;
                }
                // Sync local state so RawAction stays consistent after blur
                // @ts-ignore
                setRawAction({ ...RawAction, description: content });
                await updateAction({ description: content });
              }}
              className={cn(
                "font-inter h-full w-full",
                isAIProcessing && "opacity-40",
              )}
            />
          </Suspense>
        </div>
      </div>
      <Sheet open={hooksOpen} onOpenChange={setHooksOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <div className="sr-only">
            <SheetTitle>Hooks gerados pela IA</SheetTitle>
            <SheetDescription>{racional}</SheetDescription>
          </div>
          {isCreatingPost ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="border-primary size-12 animate-spin rounded-full border-4 border-t-transparent" />
              <div className="text-center">
                <h3 className="text-xl font-bold">Criando conteúdo...</h3>
                <p className="text-muted-foreground text-sm">
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
                  key={i}
                  hook={hook}
                  racional={racional}
                  RawAction={RawAction}
                  category={RawAction.category}
                  partner_context={currentPartners[0]?.context || ""}
                  onChange={(texto) => {
                    setHooks((prev) =>
                      prev.map((h, j) => (j === i ? { ...h, texto } : h)),
                    );
                  }}
                  onSubmit={(data) => {
                    setIsCreatingPost(true);
                    fetcher.submit(data, {
                      method: "post",
                      action: "/action/handle-ai",
                    });
                  }}
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
  hook: { tipo: string; texto: string };
  racional: string;
  RawAction: Record<string, any>;
  onChange: (texto: string) => void;
  category: string;
  onSubmit: (formData: any) => void;
  partner_context: string;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold tracking-widest uppercase opacity-40">
        {hook.tipo}
      </div>

      <div className="flex items-center gap-4">
        <textarea
          value={hook.texto}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none rounded-lg border bg-transparent px-4 py-2 outline-none"
          // @ts-ignore
          style={{ fieldSizing: "content" }}
        />
        <Button
          variant="secondary"
          size="icon"
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
        >
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
