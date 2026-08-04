import { LoaderIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { ContentFilesManager } from "~/components/features/media/InstagramContent";
import { InstagramPreview } from "~/components/features/media/InstagramPreview";
import { RichTextEditor } from "~/components/features/RichTextEditor";
import { UAvatarGroup } from "~/components/uzzina/UAvatar";
import { PrismButton } from "~/components/prism";
import { INTENT } from "~/lib/CONSTANTS";
import { getFormattedPartnersLinks } from "~/utils/format";
import type { Action, Partner } from "~/types";
import { cn } from "cnfast";
interface InstagramTabProps {
  RawAction: Action;
  setRawAction: (action: Action | ((prev: Action) => Action)) => void;
  updateAction: (data?: { [key: string]: unknown }) => Promise<void>;
  contentFiles: string[];
  updateContentFiles: (files: string[]) => void;
  currentPartners: Partner[];
  cloudName: string;
  uploadPreset: string;
  isAIProcessing: boolean;
  triggerAIAction: (
    intent: string,
    customPayload?: Record<string, string | string[] | null>,
  ) => Promise<unknown>;
  contentDescription: string;
  onContentDescriptionChange: (html: string) => void;
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
  updateAction,
  contentFiles,
  updateContentFiles,
  currentPartners,
  cloudName,
  uploadPreset,
  isAIProcessing,
  triggerAIAction,
  contentDescription,
  onContentDescriptionChange,
}: InstagramTabProps) {
  const [instagramSubTab, setInstagramSubTab] = useState<"caption" | "content">(
    "caption",
  );
  return (
    <div className="flex h-full flex-col overflow-y-auto md:flex-row">
      <div
        className={cn(
          "mx-auto flex shrink-0 flex-col p-6 md:w-2/5",
          instagramSubTab === "content" ? "lg:w-1/3" : "lg:w-1/2",
        )}
      >
        <InstagramPreview files={contentFiles} />
        <ContentFilesManager
          cloudName={cloudName}
          files={contentFiles}
          onChange={updateContentFiles}
          uploadPreset={uploadPreset}
        />
      </div>

      <div
        className={cn(
          "flex min-h-80 flex-col md:w-3/5 md:overflow-hidden",
          instagramSubTab === "content" ? "lg:w-2/3" : "lg:w-1/2",
        )}
      >
        {/* Sub-tab navigation */}
        <div className="flex shrink-0" role="tablist">
          <button
            aria-selected={instagramSubTab === "caption"}
            className={subTabClass(instagramSubTab === "caption")}
            onClick={() => setInstagramSubTab("caption")}
            role="tab"
            type="button"
          >
            Legenda
          </button>
          <button
            aria-selected={instagramSubTab === "content"}
            className={subTabClass(instagramSubTab === "content")}
            onClick={() => setInstagramSubTab("content")}
            role="tab"
            type="button"
          >
            Conteúdo
          </button>
        </div>

        {/* Sub-aba LEGENDA */}
        {instagramSubTab === "caption" && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-4 py-4 md:pl-0">
              <div className="flex items-center gap-2">
                <UAvatarGroup
                  avatars={currentPartners.map((partner) => ({
                    fallback: partner.short,
                    backgroundColor: partner.colors[0],
                    color: partner.colors[1],
                    image: partner.image,
                  }))}
                />
                <div className="text-sm font-medium">
                  {getFormattedPartnersLinks(currentPartners)}
                </div>
              </div>
              <PrismButton
                isDisabled={isAIProcessing}
                onClick={() => triggerAIAction(INTENT.ai_caption)}
                size="xs"
                variant={"secondary"}
              >
                Gerar legenda
                <SparklesIcon />
              </PrismButton>
            </div>
            <div className="flex h-full flex-col">
              <AiProcessingMessage isAIProcessing={isAIProcessing} />
              <textarea
                aria-label="Legenda do Instagram"
                className="h-full w-full resize-none p-4 outline-none disabled:opacity-50 md:pl-0"
                disabled={isAIProcessing}
                onBlur={async () =>
                  await updateAction({
                    instagram_caption: RawAction.instagram_caption,
                  })
                }
                onChange={(e) =>
                  setRawAction((prev) => ({
                    ...prev,
                    instagram_caption: e.target.value,
                  }))
                }
                placeholder="Legenda"
                value={
                  RawAction.instagram_caption ||
                  getCaptionTail(
                    currentPartners.length > 0
                      ? currentPartners[0].instagram_caption_tail
                      : "",
                  )
                }
              />
            </div>
          </div>
        )}

        {/* Sub-aba CONTEÚDO */}
        {instagramSubTab === "content" && (
          <div className="flex h-full flex-col overflow-hidden">
            <RichTextEditor
              className="flex-1 overflow-y-auto"
              content={contentDescription}
              handleBlur={(html) => {
                onContentDescriptionChange(html);
                updateAction({
                  content_description: html,
                });
              }}
              handleChange={onContentDescriptionChange}
              placeholder="Descreva o conteúdo do post: slides do carrossel, roteiro do reel..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
const subTabClass = (active: boolean) =>
  cn(
    "flex-1 cursor-pointer py-3 px-4 text-xs font-semibold tracking-wide uppercase transition-colors text-center border-b-2 border-transparent",
    active
      ? "text-foreground border-b-2 border-foreground"
      : "text-muted-foreground hover:text-foreground",
  );
