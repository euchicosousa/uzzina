import { type FetcherWithComponents } from "react-router";
import { Button } from "~/components/ui/button";
import { UAvatarGroup } from "~/components/uzzina/UAvatar";
import { LoaderIcon, Wand2Icon } from "lucide-react";
import {
  ContentFilesManager,
  InstagramPreview,
} from "~/components/uzzina/InstagramContent";
import { INTENT } from "~/lib/CONSTANTS";
import { getFormattedPartnersLinks } from "~/utils/format";
import type { Action } from "~/models/actions.server";

interface InstagramTabProps {
  RawAction: Action;
  setRawAction: (action: Action | ((prev: Action) => Action)) => void;
  contentFiles: string[];
  updateContentFiles: (files: string[]) => void;
  currentPartners: Partner[];
  cloudName: string;
  uploadPreset: string;
  isAIProcessing: boolean;
  fetcher: FetcherWithComponents<any>;
}

function getCaptionTail(instagram_caption_tail: string | null) {
  return "".concat("\n\n").concat(instagram_caption_tail || "");
}

function AiProcessingMessage({ isAIProcessing }: { isAIProcessing: boolean }) {
  if (!isAIProcessing) return null;

  return (
    <div className="flex w-full items-center justify-center gap-2 border-b py-4 text-xs font-medium">
      <div className="relative flex items-center justify-center">
        <LoaderIcon className="size-4 animate-spin opacity-50" />
      </div>
      <span className="animate-pulse">Gerando legenda com IA...</span>
    </div>
  );
}

export function InstagramTab({
  RawAction,
  setRawAction,
  contentFiles,
  updateContentFiles,
  currentPartners,
  cloudName,
  uploadPreset,
  isAIProcessing,
  fetcher,
}: InstagramTabProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto md:flex-row">
      <div className="mx-auto flex shrink-0 flex-col p-6 md:w-2/5 lg:w-1/2">
        <InstagramPreview files={contentFiles} />
        <ContentFilesManager
          files={contentFiles}
          onChange={updateContentFiles}
          cloudName={cloudName}
          uploadPreset={uploadPreset}
        />
      </div>

      <div className="flex min-h-80 flex-col md:w-3/5 md:overflow-hidden lg:w-1/2">
        <div className="flex items-center justify-between border-b px-4 py-4 md:pl-0">
          <div className="flex items-center gap-2">
            <UAvatarGroup
              avatars={currentPartners.map((partner) => ({
                fallback: partner.short,
                backgroundColor: partner.colors[0],
                color: partner.colors[1],
              }))}
            />
            <div className="text-sm font-medium">
              {/* {getFormattedPartnersName(currentPartners)} */}
              {getFormattedPartnersLinks(currentPartners)}
            </div>
          </div>
          <Button
            variant={"ghost"}
            disabled={isAIProcessing}
            className="disabled:opacity-50"
            onClick={() => {
              // fetcher.submit(
              //   {
              //     intent: INTENT.caption_ai,
              //     ...RawAction,
              //     contexto: `${currentPartners[0].context} — ${RawAction.category}`,
              //   },
              //   {
              //     method: "post",
              //     action: "/action/handle-ai",
              //   },
              // );
            }}
          >
            <Wand2Icon />
          </Button>
        </div>
        <div className="flex h-full flex-col">
          <AiProcessingMessage isAIProcessing={isAIProcessing} />
          <textarea
            disabled={isAIProcessing}
            autoFocus
            value={
              RawAction.instagram_caption ||
              getCaptionTail(
                currentPartners.length > 0
                  ? currentPartners[0].instagram_caption_tail
                  : "",
              )
            }
            onChange={(e) =>
              // @ts-ignore
              setRawAction({
                ...RawAction,
                instagram_caption: e.target.value,
              })
            }
            placeholder="Legenda"
            className="font-inter h-full w-full resize-none p-4 outline-none disabled:opacity-50 md:pl-0"
          />
        </div>
      </div>
    </div>
  );
}
