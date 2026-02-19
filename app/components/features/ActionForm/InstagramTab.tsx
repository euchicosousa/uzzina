import { Wand2Icon } from "lucide-react";
import { type FetcherWithComponents } from "react-router";
import { Button } from "~/components/ui/button";
import { UAvatarGroup } from "~/components/uzzina/UAvatar";
import {
  ContentFilesManager,
  InstagramPreview,
} from "~/components/uzzina/InstagramContent";
import { INTENT } from "~/lib/CONSTANTS";
import { getFormattedPartnersName } from "~/utils/format";

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
    <div className="bg-primary/10 text-primary flex w-full items-center justify-center py-1 text-xs font-medium">
      Gerando legenda com IA...
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
    <div className="flex h-full p-6 pr-0">
      <div className="flex h-full max-w-[320px] shrink-0 grow flex-col">
        <InstagramPreview files={contentFiles} />
        <ContentFilesManager
          files={contentFiles}
          onChange={updateContentFiles}
          cloudName={cloudName}
          uploadPreset={uploadPreset}
        />
      </div>

      <div className="flex w-2/3 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <UAvatarGroup
              isSquircle
              avatars={currentPartners.map((partner) => ({
                fallback: partner.short,
                backgroundColor: partner.colors[0],
                color: partner.colors[1],
              }))}
            />
            <div className="text-sm font-medium">
              {getFormattedPartnersName(currentPartners)}
            </div>
          </div>
          <Button
            variant={"ghost"}
            disabled={isAIProcessing}
            className="disabled:opacity-50"
            onClick={() => {
              fetcher.submit(
                {
                  intent: INTENT.caption_ai,
                  ...RawAction,
                  contexto: `${currentPartners[0].context} — ${RawAction.category}`,
                },
                {
                  method: "post",
                  action: "/action/handle-ai",
                },
              );
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
            className="h-full w-full resize-none p-4 outline-none disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
