import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { INTENT } from "~/lib/CONSTANTS";
import { callAI, type AIPayload } from "~/services/ai-client";
import type { Action, Partner } from "~/types";
import { parseStrategies } from "~/utils";

function getCaptionTail(instagram_caption_tail: string | null) {
  return "".concat("\n\n").concat(instagram_caption_tail || "");
}

type SetRawAction = (value: Action | ((prev: Action) => Action)) => void;
type UpdateAction = (
  data?: { [key: string]: unknown },
  forceCreate?: boolean,
) => Promise<Action | null>;

/**
 * AI generation for the action drawer: runs one request at a time, applies the
 * result to the local action and persists it through the save coordinator.
 */
export function useActionAI({
  action,
  rawActionRef,
  descriptionRef,
  contentDescriptionRef,
  currentPartners,
  setRawAction,
  updateAction,
  setIsStrategyModalOpen,
  setDescriptionVersion,
}: {
  action: Action;
  rawActionRef: { current: Action };
  descriptionRef: { current: string };
  contentDescriptionRef: { current: string };
  currentPartners: Partner[];
  setRawAction: SetRawAction;
  updateAction: UpdateAction;
  setIsStrategyModalOpen: (open: boolean) => void;
  setDescriptionVersion: (update: (version: number) => number) => void;
}) {
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const aiProcessingRef = useRef(false);
  const [activeAIIntent, setActiveAIIntent] = useState<string | null>(null);
  const captionTailRef = useRef(currentPartners[0]?.instagram_caption_tail);
  useEffect(() => {
    captionTailRef.current = currentPartners[0]?.instagram_caption_tail;
  }, [currentPartners]);

  const triggerAIAction = async (
    intent: string,
    customPayload?: Record<string, string | string[] | null>,
  ) => {
    if (aiProcessingRef.current) return;
    aiProcessingRef.current = true;
    setIsAIProcessing(true);
    setActiveAIIntent(intent);
    try {
      const aiPayload: AIPayload = {
        intent,
        title: action.title || "",
        description: `DESCRIÇÃO: ${descriptionRef.current} DESCRIÇÃO DO CONTEÚDO: ${contentDescriptionRef.current}`,
        partner_context: `${currentPartners[0]?.context || ""} — ${action.category || ""}`,
        category: action.category || "",
      };
      if (customPayload) {
        for (const [key, val] of Object.entries(customPayload)) {
          if (val !== null && val !== undefined) {
            (aiPayload as unknown as Record<string, string>)[key] = String(val);
          }
        }
      }
      const data = await callAI(aiPayload);
      if (data?.output) {
        const captionTail = captionTailRef.current;
        if (intent === INTENT.ai_strategy) {
          const newStrategies = parseStrategies(data.output);
          // Set strategies in local state FIRST
          setRawAction((prev) => ({
            ...prev,
            strategies: newStrategies,
          }));
          setIsStrategyModalOpen(true);
          // Save to DB — updateAction internally calls setRawAction(result) which
          // will overwrite strategies with the DB's Json type. We re-apply strategies after.
          await updateAction({
            strategies: newStrategies,
          });
          // Re-apply strategies after DB write since setRawAction(result) resets it
          setRawAction((prev) => ({
            ...prev,
            strategies: newStrategies,
          }));
        }
        if (intent === INTENT.ai_content) {
          const out = data.output as
            | {
                content?: string;
              }
            | string;
          const newContent = typeof out === "string" ? out : out.content || "";
          if (newContent) {
            contentDescriptionRef.current = newContent;
            setRawAction((prev) => ({
              ...prev,
              content_description: newContent,
            }));
            updateAction({
              content_description: newContent,
            });
          }
        }
        if (intent === INTENT.ai_caption) {
          const captionText =
            typeof data.output === "string"
              ? data.output
              : (
                  data.output as {
                    caption?: string;
                  }
                ).caption;
          const newCaption = (captionText || "").concat(
            getCaptionTail(captionTail),
          );
          setRawAction((prev) => ({
            ...prev,
            instagram_caption: newCaption,
          }));
          updateAction({
            instagram_caption: newCaption,
          });
        }
        if (
          [
            INTENT.ai_post,
            INTENT.ai_carousel,
            INTENT.ai_stories,
            INTENT.ai_reels,
          ].includes(
            intent as "ai-post" | "ai-carousel" | "ai-stories" | "ai-reels",
          )
        ) {
          const out = data.output as {
            content?: string;
            caption?: string;
          };
          const content = out.content || "";
          const caption = out.caption || "";
          const newCaption = (caption || "").concat(
            getCaptionTail(captionTail),
          );
          const currentDescription = rawActionRef.current.description || "";
          const newDescription = `${content}<hr />${currentDescription}`;
          setRawAction((prev) => ({
            ...prev,
            description: newDescription,
            instagram_caption: newCaption,
          }));
          descriptionRef.current = newDescription;
          setDescriptionVersion((v) => v + 1);
          updateAction({
            description: newDescription,
            instagram_caption: newCaption,
          });
        }
      }
      return data;
    } catch (err) {
      console.error("Erro no processamento de IA:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Falha ao gerar conteúdo com IA. Seu texto foi mantido.",
      );
    } finally {
      aiProcessingRef.current = false;
      setIsAIProcessing(false);
      setActiveAIIntent(null);
    }
  };

  return { isAIProcessing, aiProcessingRef, activeAIIntent, triggerAIAction };
}
