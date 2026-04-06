import { parseISO } from "date-fns";
import { CalendarDaysIcon, PlusIcon } from "lucide-react";
import { Suspense, lazy, useRef } from "react";
import { GMGCombobox } from "~/components/features/GMGCombobox";
import { ResponsiblesCombobox } from "~/components/features/ResponsiblesCombobox";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { getNewDateForAction, isInstagramFeed } from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import { ActionDatePicker } from "./ActionDatePicker";
import { ActionTimeDisplay } from "./ActionTimeDisplay";
import { ActionTitleInput } from "./ActionTitleInput";
import { WorkFileThumbnail } from "./WorkFileThumbnail";

const Tiptap = lazy(() =>
  import("~/components/features/Tiptap").then((module) => ({
    default: module.Tiptap,
  })),
);

interface EssentialsTabProps {
  RawAction: Action;
  setRawAction: (action: Action | ((prev: Action) => Action)) => void;
  updateAction: (data?: any) => Promise<void>;
  workFiles: string[];
  setWorkFiles: (files: string[]) => void;
  currentPartners: Partner[];
  cloudName: string;
  uploadPreset: string;
  onDescriptionChange?: (description: string) => void;
}

export function EssentialsTab({
  RawAction,
  setRawAction,
  updateAction,
  workFiles,
  setWorkFiles,
  currentPartners,
  cloudName,
  uploadPreset,
  onDescriptionChange,
}: EssentialsTabProps) {
  const workFilesRef = useRef(workFiles);
  workFilesRef.current = workFiles;

  const workFilesMetaRef = useRef<
    Record<string, { name: string; addedAt: number }>
  >({});

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
          await updateAction({
            title,
          });
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
        </div>
        <div className="flex gap-8 border-b px-4 py-2">
          <div className="flex items-center gap-1 opacity-50">
            <CalendarDaysIcon className="size-4" />
            <ActionDatePicker
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
        </div>

        {/* {isInstagramFeed(
          RawAction.category,
          RawAction.category === "stories",
        ) && (
          <div className="flex gap-4 border-b px-4 text-sm">
            <div>
              <GMGCombobox
                gmg="origem"
                className="py-2 underline-offset-4 opacity-50 hover:underline"
              />
            </div>
            <div>
              <GMGCombobox
                gmg="funil"
                className="py-2 underline-offset-4 opacity-50 hover:underline"
              />
            </div>
            <div>
              <GMGCombobox
                gmg="objetivo"
                className="py-2 underline-offset-4 opacity-50 hover:underline"
              />
            </div>
          </div>
        )} */}
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
              className="font-inter h-full w-full"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
