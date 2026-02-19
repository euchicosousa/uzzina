import { parseISO } from "date-fns";
import { CalendarIcon, InstagramIcon, PlusIcon } from "lucide-react";
import { GMGCombobox } from "~/components/features/GMGCombobox";
import { ResponsiblesCombobox } from "~/components/features/ResponsiblesCombobox";
import { Tiptap } from "~/components/features/Tiptap";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { UBadge } from "~/components/uzzina/UBadge";
import { DATE_TIME_DISPLAY, INTENT } from "~/lib/CONSTANTS";
import {
  getNewDateForAction,
  handleAction,
  isInstagramFeed,
} from "~/lib/helpers";
import { cn } from "~/lib/utils";
import { useSubmit } from "react-router";
import { ActionDatePicker } from "./ActionDatePicker";
import { WorkFileThumbnail } from "./WorkFileThumbnail";
import { ActionTimeDisplay } from "./ActionTimeDisplay";

interface EssentialsTabProps {
  RawAction: Action;
  setRawAction: (action: Action | ((prev: Action) => Action)) => void;
  updateAction: (data?: any) => Promise<void>;
  workFiles: string[];
  setWorkFiles: (files: string[]) => void;
  currentPartners: Partner[];
  cloudName: string;
  uploadPreset: string;
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
}: EssentialsTabProps) {
  const submit = useSubmit();

  return (
    <div className="flex h-full flex-col overflow-hidden p-6">
      {/* Título */}
      <div className="relative">
        <textarea
          value={RawAction.title}
          onChange={(e) =>
            // @ts-ignore
            setRawAction({ ...RawAction, title: e.target.value })
          }
          onBlur={async () => {
            await updateAction();
          }}
          placeholder="Título"
          className={cn(
            "w-full shrink-0 resize-none overflow-hidden pt-2 pb-1 leading-none font-semibold tracking-tighter outline-none",
            RawAction.title.length > 70 ? "text-error text-4xl" : "text-5xl",
          )}
          //   @ts-ignore
          style={{ fieldSizing: "content" }}
          autoFocus
          maxLength={100}
        />
        {RawAction.title.length > 70 && (
          <div className="absolute right-0 bottom-0">
            <UBadge isDynamic value={RawAction.title.length} />
          </div>
        )}
      </div>

      <div className="pb-6 text-sm">
        <div className="flex flex-wrap items-center gap-4 border-b py-2">
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
        <div className="flex gap-8 border-b py-2">
          <div className="flex items-center gap-1 opacity-50">
            <CalendarIcon className="size-3" />
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
          {isInstagramFeed(
            RawAction.category,
            RawAction.category === "stories",
          ) && (
            <div className="flex items-center gap-1 opacity-50">
              <InstagramIcon className="size-3" />
              <ActionDatePicker
                onSelect={async (date) => {
                  // @ts-ignore
                  setRawAction({
                    ...RawAction,
                    ...getNewDateForAction(RawAction, date, true),
                  });
                  await updateAction({
                    ...RawAction,
                    ...getNewDateForAction(RawAction, date, true),
                  });
                }}
                date={parseISO(RawAction.instagram_date)}
              />
            </div>
          )}
        </div>

        {isInstagramFeed(
          RawAction.category,
          RawAction.category === "stories",
        ) && (
          <div className="flex gap-4 border-b text-sm">
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
        )}
        <div className="flex items-start gap-2 border-b py-1">
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
              onUpload={async (url) => {
                const next = [...workFiles, url];
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
      <div className="h-full overflow-hidden">
        <Tiptap
          content={RawAction.description || ""}
          handleBlur={async (content) => {
            if (content === RawAction.description) {
              return;
            }

            // @ts-ignore
            setRawAction({ ...RawAction, description: content });
            await handleAction(
              {
                ...RawAction,
                description: content,
                intent: INTENT.update_action,
              },
              submit,
            );
          }}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
