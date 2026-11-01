import { ListIcon, LoaderIcon, SparkleIcon } from "lucide-react";
import { useRef, useState } from "react";
import { ContentFilesManager } from "~/components/features/media/InstagramContent";
import { InstagramPreview } from "~/components/features/media/InstagramPreview";
import { RichTextEditor } from "~/components/features/RichTextEditor";
import { UAvatarGroup } from "~/components/uzzina/UAvatar";
import {
  PrismTabs,
  PrismTabList,
  PrismTab,
  PrismTabPanel,
  PrismButton,
  PrismButtonGroup,
} from "~/components/prism";
import { INTENT } from "~/lib/CONSTANTS";
import { getFormattedPartnersLinks, parseStrategies } from "~/utils/format";
import type { Action, Partner } from "~/types";
import { cn } from "cnfast";
import {
  useShortWritingPanel,
  useWritingAreaHeight,
} from "./useWritingAreaHeight";
interface InstagramTabProps {
  RawAction: Action;
  setRawAction: (action: Action | ((prev: Action) => Action)) => void;
  updateAction: (data?: { [key: string]: unknown }) => Promise<unknown>;
  contentFiles: string[];
  updateContentFiles: (files: string[]) => void;
  currentPartners: Partner[];
  cloudName: string;
  uploadPreset: string;
  isAIProcessing: boolean;
  strategiesBlocked?: boolean;
  activeAIIntent?: string | null;
  triggerAIAction: (
    intent: string,
    customPayload?: Record<string, string | string[] | null>,
  ) => Promise<unknown>;
  contentDescription: string;
  /** Changes when the content is replaced from outside the editor. */
  contentVersion?: number;
  onContentDescriptionChange: (html: string) => void;
  onOpenStrategyModal?: () => void;
  /** Phone-width panel, measured by the drawer from its own width. */
  compact?: boolean;
}
function getCaptionTail(instagram_caption_tail: string | null) {
  return "".concat("\n\n").concat(instagram_caption_tail || "");
}
function AiProcessingMessage({
  isAIProcessing,
  activeAIIntent,
}: {
  isAIProcessing: boolean;
  activeAIIntent?: string | null;
}) {
  if (!isAIProcessing || activeAIIntent !== INTENT.ai_caption) return null;
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
  strategiesBlocked = false,
  activeAIIntent,
  triggerAIAction,
  contentDescription,
  contentVersion,
  onContentDescriptionChange,
  onOpenStrategyModal,
  compact = false,
}: InstagramTabProps) {
  const [instagramSubTab, setInstagramSubTab] = useState<"content" | "caption">(
    "content",
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  // Phone-width panels, and landscape phones whose panel is wide but short,
  // prioritize writing: media only when present, one-row toolbar, sized column.
  const shortPanel = useShortWritingPanel(scrollerRef);
  const writingLayout = compact || shortPanel;
  // The writing column gets the visible height of this scroll area; media
  // above it scrolls away instead of shrinking the text.
  const { height: writingHeight, keyboardInset } = useWritingAreaHeight({
    enabled: writingLayout,
    scrollerRef,
    columnRef,
    layoutKey: `${instagramSubTab}:${isAIProcessing}`,
  });
  const sizedColumn = writingLayout && writingHeight !== null;
  return (
    <div
      className="flex h-full w-full max-w-full flex-col overflow-x-hidden overflow-y-auto @[47rem]/action:flex-row"
      data-instagram-scroller
      ref={scrollerRef}
    >
      <div
        className={cn(
          "mx-auto flex shrink-0 flex-col p-6",
          writingLayout && "w-full px-4 pt-4 pb-0",
          instagramSubTab === "content"
            ? "@[47rem]/action:w-2/5"
            : "@[47rem]/action:w-1/2",
        )}
      >
        {/* Compact panels show no empty preview: only Adicionar conteúdo. */}
        {(!writingLayout || contentFiles.length > 0) && (
          <InstagramPreview compact={writingLayout} files={contentFiles} />
        )}
        <ContentFilesManager
          cloudName={cloudName}
          compact={writingLayout}
          files={contentFiles}
          onChange={updateContentFiles}
          uploadPreset={uploadPreset}
        />
      </div>

      <PrismTabs
        selectedKey={instagramSubTab}
        onSelectionChange={(key) => {
          if (key === "content" || key === "caption") setInstagramSubTab(key);
        }}
        className={cn(
          "flex flex-col @[47rem]/action:overflow-hidden",
          sizedColumn ? "shrink-0" : "min-h-80",
          instagramSubTab === "content"
            ? "@[47rem]/action:w-3/5"
            : "@[47rem]/action:w-1/2",
        )}
        data-instagram-writing
        ref={columnRef}
        style={sizedColumn ? { height: writingHeight } : undefined}
      >
        <PrismTabList aria-label="Texto do Instagram" data-writing-controls>
          <PrismTab id="content">Conteúdo</PrismTab>
          <PrismTab id="caption">Legenda</PrismTab>
        </PrismTabList>

        {/* Sub-aba CONTEÚDO */}
        {instagramSubTab === "content" && (
          <PrismTabPanel
            id="content"
            className={cn(
              "flex flex-col overflow-hidden",
              writingLayout ? "min-h-0 flex-1" : "h-full",
            )}
          >
            <div
              className="flex min-w-0 shrink-0 items-center justify-between gap-3 border-b px-4 py-4 @[47rem]/action:pl-0"
              data-writing-controls
            >
              <div className="flex min-w-0 shrink items-center gap-2">
                <UAvatarGroup
                  avatars={currentPartners.map((partner) => ({
                    fallback: partner.short,
                    backgroundColor: partner.colors[0],
                    color: partner.colors[1],
                    image: partner.image,
                  }))}
                />
                <div className="truncate text-sm font-medium">
                  {getFormattedPartnersLinks(currentPartners)}
                </div>
              </div>
              {(() => {
                const strategies = parseStrategies(RawAction.strategies);
                const selectedStrat = strategies.find((s) => s.selected);
                const stratTitle = selectedStrat
                  ? selectedStrat.headline
                  : "Selecione a estratégia";
                return (
                  strategies.length > 0 &&
                  onOpenStrategyModal && (
                    <PrismButtonGroup className="max-w-70 min-w-0 shrink @[40rem]/action:max-w-xs @[47rem]/action:max-w-sm">
                      <PrismButton
                        aria-label="Ver estratégias"
                        onClick={onOpenStrategyModal}
                        size="xs"
                        variant="secondary"
                      >
                        <ListIcon />
                      </PrismButton>

                      <PrismButton
                        className="min-w-0 flex-1 shrink truncate"
                        isDisabled={isAIProcessing || strategiesBlocked}
                        onClick={() => {
                          const stratToUse = selectedStrat || strategies[0];
                          if (stratToUse) {
                            triggerAIAction(INTENT.ai_content, {
                              headline: stratToUse.headline,
                              racional: stratToUse.racional,
                              direcionamento: stratToUse.direcionamento,
                            });
                          } else {
                            triggerAIAction(INTENT.ai_content);
                          }
                        }}
                        size="xs"
                        variant="secondary"
                      >
                        <span
                          className="block min-w-0 truncate"
                          title={stratTitle}
                        >
                          {stratTitle}
                        </span>
                        {isAIProcessing &&
                        activeAIIntent === INTENT.ai_content ? (
                          <LoaderIcon className="animate-spin" />
                        ) : (
                          <SparkleIcon className="shrink-0" />
                        )}
                      </PrismButton>
                    </PrismButtonGroup>
                  )
                );
              })()}
            </div>
            <RichTextEditor
              key={contentVersion}
              className={cn(
                "flex-1 overflow-y-auto",
                writingLayout && "min-h-0",
              )}
              compactToolbar={writingLayout}
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
          </PrismTabPanel>
        )}

        {/* Sub-aba LEGENDA */}
        {instagramSubTab === "caption" && (
          <PrismTabPanel
            id="caption"
            className={cn(
              "flex flex-col",
              writingLayout ? "min-h-0 flex-1" : "h-full",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between border-b px-4 py-4 @[47rem]/action:pl-0",
                writingLayout && "shrink-0",
              )}
              data-writing-controls
            >
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
                {isAIProcessing && activeAIIntent === INTENT.ai_caption ? (
                  <LoaderIcon className="animate-spin" />
                ) : (
                  <SparkleIcon />
                )}
              </PrismButton>
            </div>
            <div
              className={cn(
                "flex flex-col",
                writingLayout ? "min-h-0 flex-1" : "h-full",
              )}
            >
              <AiProcessingMessage
                activeAIIntent={activeAIIntent}
                isAIProcessing={isAIProcessing}
              />
              <textarea
                aria-label="Legenda do Instagram"
                className={cn(
                  "w-full resize-none p-4 outline-none disabled:opacity-50 @[47rem]/action:pl-0",
                  writingLayout ? "min-h-0 flex-1" : "h-full",
                )}
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
          </PrismTabPanel>
        )}
      </PrismTabs>
      {/* Room for the part of the scroll area under the iOS keyboard, so the
          writing column can scroll fully into the visible area. */}
      {writingLayout && keyboardInset > 0 && (
        <div
          aria-hidden="true"
          className="shrink-0"
          data-keyboard-inset
          style={{ height: keyboardInset }}
        />
      )}
    </div>
  );
}
