import type { Action, Partner } from "~/types";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CloudUploadIcon,
  CopyIcon,
  PlusIcon,
} from "lucide-react";
import {
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { ULoader } from "~/components/uzzina/ULoader";
import { UCategoriesCombobox } from "~/components/uzzina/UCategoriesCombobox";
import { UPartnersCombobox } from "~/components/uzzina/UPartnersCombobox";
import { UPhaseCombobox } from "~/components/uzzina/UPhaseCombobox";
import { UTopicCombobox } from "~/components/uzzina/UTopicCombobox";
import { UPeopleCombobox } from "~/components/uzzina/UPeopleCombobox";
import { AppContext } from "~/contexts/AppContext";
import { useActionMutations } from "~/hooks/useActionMutations";
import { usePartnerTopics } from "~/hooks/usePartnerTopics";
import { INTENT } from "~/lib/CONSTANTS";
import { getTimeForCategoryChange, isSocialMediaContent } from "~/utils";
import { PrismButton } from "~/components/prism";
import {
  groupTopicsByPartner,
  shouldKeepTopicAfterPartnerChange,
} from "~/utils/topics";
interface ActionFormFooterProps {
  /** Phone-width panel: one scrolling strip plus an icon-only save button. */
  compact?: boolean;
  RawAction: Action;
  setRawAction: (action: Action) => void;
  updateAction: (data?: Record<string, unknown>) => Promise<unknown>;
  currentPartners: Partner[];
  isPending: boolean;
  handleSave: () => Promise<boolean>;
  handleClose: () => void;
}
export function ActionFormFooter({
  compact = false,
  RawAction,
  setRawAction,
  updateAction,
  currentPartners,
  isPending,
  handleSave,
  handleClose,
}: ActionFormFooterProps) {
  const { handleAction } = useActionMutations();
  const { topics } = usePartnerTopics();
  const allPartners = useContext(AppContext)?.partners ?? currentPartners;

  const saveLabel = RawAction.id
    ? isPending
      ? "Atualizando..."
      : "Atualizar"
    : isPending
      ? "Criando..."
      : "Criar";
  const actionCommands = RawAction.id && (
    <>
      <PrismButton
        aria-label="Duplicar ação (Shift+D)"
        onClick={() => {
          handleAction({ id: RawAction.id, intent: INTENT.duplicate_action });
          handleClose();
        }}
        size="icon-lg"
        variant="ghost"
      >
        <CopyIcon />
      </PrismButton>

      <PrismButton
        aria-label={RawAction.archived ? "Desarquivar ação" : "Arquivar ação"}
        onClick={async () => {
          const archived = !RawAction.archived;
          if (
            confirm(
              `Tem certeza que deseja ${archived ? "arquivar" : "desarquivar"} esta ação?`,
            )
          ) {
            setRawAction({
              ...RawAction,
              archived,
              ...(archived && { sprints: null }),
            });
            await updateAction({ archived });
            handleClose();
          }
        }}
        size="icon-lg"
        variant="ghost"
      >
        {RawAction.archived ? <ArchiveRestoreIcon /> : <ArchiveIcon />}
      </PrismButton>
    </>
  );
  return (
    <div className="flex w-full shrink-0 items-center justify-between border-t">
      <FooterStrip compact={compact}>
        <div className="contents" data-drawer-focus="control">
          <UPartnersCombobox
            // size={currentPartners.length > 1 ? "lg" : "icon-lg"}
            size={"icon-lg"}
            variant="ghost"
            onSelect={async (selected) => {
              const first = currentPartners.find((p) => p.slug === selected[0]);
              let color = RawAction.color;
              if (
                !RawAction.id &&
                first?.colors?.length &&
                (!color || color === "#666666" || color === "#666")
              ) {
                color = first.colors[0];
              }
              // The topic leaves only when the partner that owns it leaves the action.
              const keepTopic = shouldKeepTopicAfterPartnerChange(
                RawAction.topic_id,
                selected,
                topics,
                allPartners,
              );
              const topicPatch = keepTopic ? {} : { topic_id: null };
              setRawAction({
                ...RawAction,
                partners: selected,
                color,
                ...topicPatch,
              });
              await updateAction({ partners: selected, color, ...topicPatch });
            }}
            selectedPartners={RawAction.partners}
            showText={false}
            tabIndex={0}
          />
        </div>
        <div className="contents" data-drawer-focus="control">
          <UPhaseCombobox
            size="icon-lg"
            variant="ghost"
            iconVariant="progress"
            onSelect={async (selected) => {
              const phase = (
                typeof selected === "string" ? selected : selected.phase
              ) as Action["phase"];
              setRawAction({ ...RawAction, phase });
              await updateAction({ phase });
            }}
            selectedPhase={RawAction.phase ?? "idea"}
            showText={false}
            tabIndex={0}
          />
        </div>
        <div className="contents" data-drawer-focus="control">
          <UCategoriesCombobox
            size="icon-lg"
            variant="ghost"
            onSelect={async ({ category }) => {
              const time = getTimeForCategoryChange({
                fromCategory: RawAction.category,
                toCategory: category,
                currentTime: RawAction.time,
              });
              setRawAction({ ...RawAction, category, time });
              await updateAction({ category, time });
            }}
            selectedCategories={[RawAction.category]}
            showText={false}
            showTime
            tabIndex={0}
          />
        </div>
        {isSocialMediaContent(RawAction.category) && (
          <div className="contents" data-drawer-focus="control">
            <UTopicCombobox
              fallbackColor={RawAction.color}
              groups={groupTopicsByPartner(
                topics,
                allPartners,
                RawAction.partners,
              )}
              onSelect={async (topic_id) => {
                setRawAction({ ...RawAction, topic_id });
                await updateAction({ topic_id });
              }}
              selectedTopicId={RawAction.topic_id}
              size="icon-lg"
              tabIndex={0}
              variant="ghost"
            />
          </div>
        )}
        {RawAction.id && (
          <UPeopleCombobox
            mode="sprint"
            size="icon-lg"
            variant="ghost"
            currentPartners={currentPartners}
            onSelect={async (newSprints, responsibles = []) => {
              const sprints = newSprints.length > 0 ? newSprints : null;
              setRawAction({ ...RawAction, sprints, responsibles });
              await updateAction({ sprints, responsibles });
            }}
            selectedResponsibles={RawAction.responsibles || []}
            selectedSprints={RawAction.sprints || []}
            tabIndex={0}
          />
        )}
        {compact && actionCommands}
      </FooterStrip>
      <div className="flex shrink-0 items-center gap-1 p-2">
        {!compact && actionCommands}
        <div className="contents" data-drawer-focus="control">
          <PrismButton
            aria-label={compact ? saveLabel : undefined}
            isDisabled={isPending}
            onClick={async (event) => {
              event.preventDefault();
              event.stopPropagation();
              const success = await handleSave();
              if (success && event.shiftKey) {
                handleClose();
              }
            }}
            size={compact ? "icon-lg" : "lg"}
          >
            {!compact && saveLabel}
            {isPending ? (
              <ULoader size="default" inheritColor />
            ) : RawAction.id ? (
              <CloudUploadIcon />
            ) : (
              <PlusIcon />
            )}
          </PrismButton>
        </div>
      </div>
    </div>
  );
}

// Keeps a focused control clear of the fade that covers the strip edges.
const STRIP_FADE_PX = 24;

function FooterStrip({
  compact,
  children,
}: {
  compact: boolean;
  children: ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerFocusRef = useRef(false);
  const [edges, setEdges] = useState({ start: false, end: false });
  const updateEdges = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    const start = scroller.scrollLeft > 1;
    const end = scroller.scrollLeft < maxScroll - 1;
    setEdges((previous) =>
      previous.start === start && previous.end === end
        ? previous
        : { start, end },
    );
  }, []);
  useLayoutEffect(() => {
    if (!compact) return;
    updateEdges();
    if (typeof ResizeObserver === "undefined") return;
    // The track resizes when controls appear or their content loads.
    const observer = new ResizeObserver(updateEdges);
    if (scrollerRef.current) observer.observe(scrollerRef.current);
    if (trackRef.current) observer.observe(trackRef.current);
    return () => observer.disconnect();
  }, [compact, updateEdges]);
  // The drawer's Tab handling focuses without scrolling, so reveal the control here.
  const revealFocused = (event: FocusEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    const target: EventTarget = event.target;
    // React portals (popovers) bubble focus here from outside the strip.
    if (
      !compact ||
      !scroller ||
      !(target instanceof Element) ||
      target === scroller ||
      !scroller.contains(target)
    )
      return;
    // Pointer focus must not move the control away before the press ends.
    if (pointerFocusRef.current) {
      pointerFocusRef.current = false;
      return;
    }
    const frame = scroller.getBoundingClientRect();
    const control = target.getBoundingClientRect();
    if (control.left < frame.left + STRIP_FADE_PX) {
      scroller.scrollLeft -= frame.left + STRIP_FADE_PX - control.left;
    } else if (control.right > frame.right - STRIP_FADE_PX) {
      scroller.scrollLeft += control.right - (frame.right - STRIP_FADE_PX);
    }
    updateEdges();
  };
  // p-2 inside the scroller keeps the 3px focus rings (box-shadow) from being
  // clipped by overflow; the mask fades whichever edge has hidden content.
  const fade = (visible: boolean) => (visible ? "transparent" : "#000");
  return (
    <div
      className="no-scrollbar min-w-0 flex-1 overflow-x-auto"
      data-action-footer-strip={compact ? "" : undefined}
      onFocus={revealFocused}
      onPointerCancelCapture={() => {
        pointerFocusRef.current = false;
      }}
      onPointerDownCapture={() => {
        pointerFocusRef.current = true;
      }}
      onPointerUpCapture={() => {
        pointerFocusRef.current = false;
      }}
      onScroll={compact ? updateEdges : undefined}
      ref={scrollerRef}
      style={
        compact && (edges.start || edges.end)
          ? {
              maskImage: `linear-gradient(to right, ${fade(edges.start)}, #000 ${STRIP_FADE_PX}px, #000 calc(100% - ${STRIP_FADE_PX}px), ${fade(edges.end)})`,
            }
          : undefined
      }
    >
      <div className="flex w-max items-center gap-px p-2" ref={trackRef}>
        {children}
      </div>
    </div>
  );
}
