import { ListIcon } from "lucide-react";
import { UAIModelSelect } from "~/components/uzzina/UAIModelSelect";
import { actionAIModels } from "~/lib/action-ai-models";
import { ULoader } from "~/components/uzzina/ULoader";
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
  PrismButtonGroupSeparator,
} from "~/components/prism";
import { INTENT } from "~/lib/CONSTANTS";
import { getFormattedPartnersLinks, parseStrategies } from "~/utils/format";
import type { Action, Partner } from "~/types";
import type { TextDraftField } from "~/components/features/action-drawer/ActionFormDrawer";
import { cn } from "cnfast";
import {
  useShortWritingPanel,
  useWritingAreaHeight,
} from "./useWritingAreaHeight";
import { UAIProgressBar } from "~/components/uzzina/UAIProgressBar";
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
  captionModel: string;
  onCaptionModelChange: (id: string) => void;
  contentModel: string;
  onContentModelChange: (id: string) => void;
  triggerAIAction: (
    intent: string,
    customPayload?: Record<string, string | string[] | null>,
  ) => Promise<unknown>;
  contentDescription: string;
  /** Changes when the content is replaced from outside the editor. */
  contentVersion?: number;
  onContentDescriptionChange: (html: string) => void;
  onOpenStrategyModal?: () => void;
  /** Receives each typed caption without re-rendering the drawer. */
  onTextDraft?: (field: TextDraftField, value: string) => void;
  /** Commits the typed caption to the form on blur. */
  onTextCommit?: (field: TextDraftField, value: string) => void;
  /** Phone-width panel, measured by the drawer from its own width. */
  compact?: boolean;
}
function getCaptionTail(instagram_caption_tail: string | null) {
  return "".concat("\n\n").concat(instagram_caption_tail || "");
}
/** Keeps typing local to the field; the form receives the caption on blur. */
function CaptionTextarea({
  caption,
  fallback,
  className,
  disabled,
  onChange,
  onBlur,
}: {
  caption: string | null | undefined;
  fallback: string;
  className?: string;
  disabled?: boolean;
  onChange: (caption: string) => void;
  /** Receives the typed caption, or null when nothing was typed. */
  onBlur: (caption: string | null) => void;
}) {
  const [typed, setTyped] = useState<string | null>(null);
  return (
    <textarea
      aria-label="Legenda do Instagram"
      className={className}
      disabled={disabled}
      onBlur={() => {
        onBlur(typed);
        setTyped(null);
      }}
      onChange={(e) => {
        setTyped(e.target.value);
        onChange(e.target.value);
      }}
      placeholder="Legenda"
      value={typed ?? (caption || fallback)}
    />
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
  captionModel,
  onCaptionModelChange,
  contentModel,
  onContentModelChange,
  triggerAIAction,
  contentDescription,
  contentVersion,
  onContentDescriptionChange,
  onOpenStrategyModal,
  onTextDraft,
  onTextCommit,
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
              className="relative flex min-w-0 shrink-0 items-center justify-between gap-3 border-b px-4 py-4 @[47rem]/action:pl-0"
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

                return (
                  strategies.length > 0 &&
                  onOpenStrategyModal && (
                    <PrismButtonGroup className="max-w-70 min-w-0 shrink @[40rem]/action:max-w-xs @[47rem]/action:max-w-sm">
                      <PrismButton
                        aria-label="Ver estratégias"
                        onClick={onOpenStrategyModal}
                        variant="secondary"
                        size="sm"
                      >
                        <ListIcon />
                      </PrismButton>

                      <PrismButtonGroupSeparator className="bg-background" />

                      <PrismButton
                        className="min-w-0 flex-1 shrink truncate"
                        isDisabled={isAIProcessing || strategiesBlocked}
                        onClick={() => {
                          const stratToUse = selectedStrat || strategies[0];
                          if (stratToUse) {
                            triggerAIAction(INTENT.ai_content, {
                              model: contentModel,
                              headline: stratToUse.headline,
                              racional: stratToUse.racional,
                              direcionamento: stratToUse.direcionamento,
                            });
                          } else {
                            triggerAIAction(INTENT.ai_content, {
                              model: contentModel,
                            });
                          }
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        <span
                          className="block min-w-0 truncate"
                          title={"Selecione a estratégia"}
                        >
                          {"Selecione a estratégia"}
                        </span>
                        {isAIProcessing &&
                        activeAIIntent === INTENT.ai_content ? (
                          <ULoader size="sm" inheritColor />
                        ) : null}
                      </PrismButton>
                      <PrismButtonGroupSeparator className="bg-background" />
                      <UAIModelSelect
                        models={actionAIModels}
                        value={contentModel}
                        onChange={onContentModelChange}
                        isDisabled={isAIProcessing || strategiesBlocked}
                        variant="secondary"
                        size="sm"
                      />
                    </PrismButtonGroup>
                  )
                );
              })()}
              <UAIProgressBar
                isGenerating={isAIProcessing}
                variant="line"
                durationMs={30000}
                className="absolute right-0 -bottom-px left-0"
              />
            </div>
            <RichTextEditor
              key={contentVersion}
              className={cn(
                "flex-1 overflow-y-auto",
                writingLayout && "min-h-0",
              )}
              compactToolbar
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
                "relative flex flex-wrap items-center justify-between gap-2 border-b px-4 py-4 @[47rem]/action:pl-0",
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
              <PrismButtonGroup
                aria-label="Geração de legenda"
                className="max-w-full"
              >
                <PrismButton
                  isDisabled={isAIProcessing}
                  onPress={() =>
                    void triggerAIAction(INTENT.ai_caption, {
                      model: captionModel,
                    })
                  }
                  variant="secondary"
                  size="sm"
                >
                  Gerar legenda
                  {isAIProcessing && activeAIIntent === INTENT.ai_caption && (
                    <ULoader size="xs" inheritColor />
                  )}
                </PrismButton>
                <PrismButtonGroupSeparator className="bg-background" />
                <UAIModelSelect
                  models={actionAIModels}
                  value={captionModel}
                  onChange={onCaptionModelChange}
                  isDisabled={isAIProcessing}
                  variant="secondary"
                  size="sm"
                />
              </PrismButtonGroup>

              <UAIProgressBar
                isGenerating={isAIProcessing}
                variant="line"
                durationMs={30000}
                className="absolute right-0 -bottom-px left-0"
              />
            </div>
            <div
              className={cn(
                "flex flex-col",
                writingLayout ? "min-h-0 flex-1" : "h-full",
              )}
            >
              <CaptionTextarea
                caption={RawAction.instagram_caption}
                className={cn(
                  "w-full resize-none p-4 outline-none disabled:opacity-50 @[47rem]/action:pl-0",
                  writingLayout ? "min-h-0 flex-1" : "h-full",
                )}
                disabled={isAIProcessing}
                fallback={getCaptionTail(
                  currentPartners.length > 0
                    ? currentPartners[0].instagram_caption_tail
                    : "",
                )}
                onBlur={async (caption) => {
                  if (caption !== null) {
                    if (onTextCommit)
                      onTextCommit("instagram_caption", caption);
                    else
                      setRawAction((prev) => ({
                        ...prev,
                        instagram_caption: caption,
                      }));
                  }
                  await updateAction({
                    instagram_caption: caption ?? RawAction.instagram_caption,
                  });
                }}
                onChange={(caption) =>
                  onTextDraft?.("instagram_caption", caption)
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
