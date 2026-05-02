import { parseISO } from "date-fns";
import { CalendarDaysIcon, PlusIcon, Wand2 } from "lucide-react";
import { Suspense, lazy, useRef, useState } from "react";
import { ResponsiblesCombobox } from "~/components/features/ResponsiblesCombobox";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import {
  getNewDateForAction,
  isInstagramFeed,
  isLateAction,
} from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import type { Partner } from "~/models/partners.server";
import { GMGCombobox } from "../GMGCombobox";
import { ActionDatePicker } from "./ActionDatePicker";
import { ActionTimeDisplay } from "./ActionTimeDisplay";
import { ActionTitleInput } from "./ActionTitleInput";
import { WorkFileThumbnail } from "./WorkFileThumbnail";

import { AttributesSection } from "./AttributesSection";

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

  const [isIDVisible, setisIDVisible] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<string | undefined>();
  const [selectedFunnel, setSelectedFunnel] = useState<string | undefined>();
  const [selectedGoal, setSelectedGoal] = useState<string | undefined>();

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
        {isInstagramFeed(RawAction.category) && (
          <div className="flex items-center justify-between border-b px-4 py-1">
            <div className="flex gap-8">
              <GMGCombobox gmg="origem" selected={selectedOrigin} />
              <GMGCombobox gmg="funil" selected={selectedFunnel} />
              <GMGCombobox gmg="objetivo" selected={selectedGoal} />
            </div>
            <button className="hover:bg-secondary rounded-lg border p-2">
              <Wand2 className="size-3" />
            </button>
          </div>
        )}
        <AttributesSection
          RawAction={RawAction}
          setRawAction={setRawAction}
          updateAction={updateAction}
        />
        <div className="flex gap-8 border-b px-4 py-2">
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
