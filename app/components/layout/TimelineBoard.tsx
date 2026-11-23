import { useQuery } from "@tanstack/react-query";
import { isToday } from "date-fns";
import { FocusIcon, ScanIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { toast } from "sonner";
import { ActionItem } from "~/components/features/ActionItem";
import {
  PrismButton,
  PrismButtonGroup,
  PrismSlider,
  PrismSliderOutput,
  PrismSliderTrack,
  PrismTooltip,
} from "~/components/prism";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { UPeopleCombobox } from "~/components/uzzina/UPeopleCombobox";
import { useAppContext } from "~/contexts/AppContext";
import { useActionData } from "~/hooks/useActionData";
import { useActionMutations } from "~/hooks/useActionMutations";
import { INTENT, VARIANT } from "~/lib/CONSTANTS";
import { QUERY_KEYS } from "~/lib/query-keys";
import { ActionConflictError } from "~/lib/supabase.mutations";
import { fetchPeople } from "~/lib/supabase.queries";
import { cn } from "~/lib/utils";
import type { Action, Person } from "~/types";
import { getFormattedPartnersName } from "~/utils";
import { getActionRevision } from "~/utils/date";
import {
  TIMELINE_PX_PER_MINUTE,
  TIMELINE_STEP_MINUTES,
  TIMELINE_TOTAL_MINUTES,
  applyTimelineMinutesToDate,
  assignTimelineLanes,
  formatTimelineMinutes,
  getActionDurationMinutes,
  getActionStartMinutes,
  getTimelineAutoScrollSpeed,
  getTimelineFitActions,
  getTimelineMinuteMarks,
  getTimelinePeopleRows,
  isTimelineLabelOverlappingNow,
  moveTimelineInterval,
  resizeTimelineDuration,
  resizeTimelineStart,
  type TimelineInterval,
} from "~/utils/timeline";

const TOTAL_HOURS = 24;
const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => i);
const FIVE_MINUTE_OFFSETS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const DRAG_THRESHOLD_PX = 5;
const TIMELINE_RESIZE_DEBOUNCE_MS = 180;
const TIMELINE_MAX_SCALE = TIMELINE_PX_PER_MINUTE * 2;
const TIMELINE_HOUR_STEPS = [1, 2, 3, 4, 6, 8, 12, 24];
const HOUR_LABEL_WIDTH_PX = 34;
const MINUTE_LABEL_WIDTH_PX = 28;

interface LanedTimelineAction extends TimelineInterval {
  action: Action;
  lane: number;
}

type CommitTimelineInterval = (
  action: Action,
  startMin: number,
  durationMin: number,
) => void;

interface TimelineGalleryOptions {
  initialMinute: number;
  onOpenAction: (action: Action) => void;
}

interface TimelineCamera {
  scale: number;
  centerMinute?: number;
}

function clampTimelineScale(scale: number, viewportWidth: number) {
  return Math.min(
    TIMELINE_MAX_SCALE,
    Math.max(viewportWidth / TIMELINE_TOTAL_MINUTES, scale),
  );
}

type TimelineGestureMode = "move" | "resize-start" | "resize-end";

interface TimelinePreviewState extends TimelineInterval {
  mode: TimelineGestureMode;
}

function getCurrentMinutesOfDay(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function TimelineActionBar({
  item,
  onOpenAction,
  pxPerMinute,
  onCommitInterval,
  scrollContainerRef,
  personColumnRef,
}: {
  item: LanedTimelineAction;
  pxPerMinute: number;
  onOpenAction?: TimelineGalleryOptions["onOpenAction"];
  onCommitInterval: CommitTimelineInterval;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  personColumnRef: RefObject<HTMLDivElement | null>;
}) {
  const { currentPartners, currentCategory } = useActionData(item.action);
  const partnersLabel = getFormattedPartnersName(currentPartners);
  const tooltipText = [partnersLabel, item.action.title, currentCategory?.title]
    .filter(Boolean)
    .join(" - ");

  const [preview, setPreview] = useState<TimelinePreviewState | null>(null);
  const suppressNextClickRef = useRef(false);
  const cleanupGestureRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cleanupGestureRef.current?.();
    };
  }, []);

  const displayStartMin = preview ? preview.startMin : item.startMin;
  const displayDurationMin = preview ? preview.durationMin : item.durationMin;

  const leftPx = displayStartMin * pxPerMinute;
  const widthPx = displayDurationMin * pxPerMinute;
  // Pointer handles stay available to keyboard users at every zoom level.
  // Fine pointers reveal them on hover only when the bar has room for them.
  const showPointerHandles = item.durationMin * pxPerMinute >= 16;
  const handleSize = "w-[min(10px,25%)]";

  const startPointerGesture = (
    e: ReactPointerEvent<HTMLElement>,
    mode: TimelineGestureMode,
  ) => {
    if (e.button !== 0) return;
    if (e.pointerType === "touch") return;
    if (mode === "move" && isEditableTarget(e.target)) return;
    if (mode !== "move") {
      e.stopPropagation();
    }

    cleanupGestureRef.current?.();
    suppressNextClickRef.current = false;

    const container = scrollContainerRef.current;
    const startClientX = e.clientX;
    const startScrollLeft = container ? container.scrollLeft : 0;
    const initialStartMin = item.startMin;
    const initialDurationMin = item.durationMin;
    let lastClientX = startClientX;
    let hasMoved = mode !== "move";
    let pointerMoved = false;
    let previewActive = hasMoved;
    let rafId: number | null = null;
    let lastFrameTime: number | null = null;
    let scrollCarry = 0;
    let latestInterval: TimelineInterval = {
      startMin: initialStartMin,
      durationMin: initialDurationMin,
    };

    if (hasMoved) {
      setPreview({
        mode,
        startMin: initialStartMin,
        durationMin: initialDurationMin,
      });
    }

    const computeInterval = (deltaMinutes: number): TimelineInterval => {
      if (mode === "resize-start") {
        return resizeTimelineStart(
          initialStartMin,
          initialDurationMin,
          deltaMinutes,
        );
      }
      if (mode === "resize-end") {
        return resizeTimelineDuration(
          initialStartMin,
          initialDurationMin,
          deltaMinutes,
        );
      }
      return moveTimelineInterval(
        initialStartMin,
        initialDurationMin,
        deltaMinutes,
      );
    };

    const updatePreview = () => {
      const currentScrollLeft = container
        ? container.scrollLeft
        : startScrollLeft;
      const totalDeltaX =
        lastClientX - startClientX + (currentScrollLeft - startScrollLeft);
      if (!hasMoved && Math.abs(totalDeltaX) < DRAG_THRESHOLD_PX) return;
      hasMoved = true;
      const deltaMinutes = totalDeltaX / pxPerMinute;
      const nextInterval = computeInterval(deltaMinutes);
      if (
        !previewActive ||
        nextInterval.startMin !== latestInterval.startMin ||
        nextInterval.durationMin !== latestInterval.durationMin
      ) {
        latestInterval = nextInterval;
        previewActive = true;
        setPreview({
          mode,
          startMin: nextInterval.startMin,
          durationMin: nextInterval.durationMin,
        });
      }
    };

    const stopAutoScroll = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastFrameTime = null;
      scrollCarry = 0;
    };

    const getAutoScrollSpeed = (): number => {
      if (!container || !hasMoved || !pointerMoved) return 0;
      const rect = container.getBoundingClientRect();
      const personWidth = personColumnRef.current?.offsetWidth ?? 0;
      const speed = getTimelineAutoScrollSpeed(
        lastClientX,
        rect.left + personWidth,
        rect.right,
      );
      if (speed === 0) return 0;
      const maxScrollLeft = Math.max(
        0,
        container.scrollWidth - container.clientWidth,
      );
      if (speed < 0 && container.scrollLeft <= 0) return 0;
      if (speed > 0 && container.scrollLeft >= maxScrollLeft) return 0;
      return speed;
    };

    const stepAutoScroll = (timestamp: number) => {
      const speed = getAutoScrollSpeed();
      if (speed === 0 || !container) {
        stopAutoScroll();
        return;
      }
      if (lastFrameTime === null) {
        lastFrameTime = timestamp;
        rafId = window.requestAnimationFrame(stepAutoScroll);
        return;
      }
      const dt = Math.min(timestamp - lastFrameTime, 50) / 1000;
      lastFrameTime = timestamp;
      const rawDelta = speed * dt + scrollCarry;
      const stepPx = rawDelta > 0 ? Math.floor(rawDelta) : Math.ceil(rawDelta);
      scrollCarry = rawDelta - stepPx;

      if (stepPx !== 0) {
        const maxScrollLeft = Math.max(
          0,
          container.scrollWidth - container.clientWidth,
        );
        const prevScrollLeft = container.scrollLeft;
        container.scrollLeft = Math.max(
          0,
          Math.min(maxScrollLeft, prevScrollLeft + stepPx),
        );
        updatePreview();
        if (container.scrollLeft === prevScrollLeft) {
          stopAutoScroll();
          return;
        }
      }

      rafId = window.requestAnimationFrame(stepAutoScroll);
    };

    const syncAutoScroll = () => {
      const speed = getAutoScrollSpeed();
      if (speed === 0) {
        stopAutoScroll();
      } else if (rafId === null) {
        lastFrameTime = null;
        scrollCarry = 0;
        rafId = window.requestAnimationFrame(stepAutoScroll);
      }
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      lastClientX = moveEvent.clientX;
      pointerMoved = true;
      updatePreview();
      syncAutoScroll();
    };

    const handleContainerScroll = () => {
      if (hasMoved) {
        updatePreview();
      }
    };

    const cleanup = () => {
      stopAutoScroll();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("keydown", handleEscapeKey);
      window.removeEventListener("blur", handlePointerCancel);
      container?.removeEventListener("scroll", handleContainerScroll);
      cleanupGestureRef.current = null;
    };

    const handlePointerUp = () => {
      cleanup();
      setPreview(null);
      if (hasMoved) {
        suppressNextClickRef.current = true;
        window.setTimeout(() => {
          suppressNextClickRef.current = false;
        }, 0);
        if (
          latestInterval.startMin !== initialStartMin ||
          latestInterval.durationMin !== initialDurationMin
        ) {
          onCommitInterval(
            item.action,
            latestInterval.startMin,
            latestInterval.durationMin,
          );
        }
      }
    };

    const handlePointerCancel = () => {
      const movedBeforeCancel = hasMoved;
      cleanup();
      setPreview(null);
      if (movedBeforeCancel) {
        suppressNextClickRef.current = true;
      }
    };

    const handleEscapeKey = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key !== "Escape") return;
      keyEvent.preventDefault();
      handlePointerCancel();
    };

    cleanupGestureRef.current = cleanup;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("keydown", handleEscapeKey);
    window.addEventListener("blur", handlePointerCancel);
    container?.addEventListener("scroll", handleContainerScroll);
  };

  const handleBarKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isEditableTarget(e.target)) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const delta =
      e.key === "ArrowLeft" ? -TIMELINE_STEP_MINUTES : TIMELINE_STEP_MINUTES;
    const next = moveTimelineInterval(item.startMin, item.durationMin, delta);
    if (
      next.startMin !== item.startMin ||
      next.durationMin !== item.durationMin
    ) {
      onCommitInterval(item.action, next.startMin, next.durationMin);
    }
  };

  const handleResizeStartKeyDown = (
    e: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    e.stopPropagation();
    const delta =
      e.key === "ArrowLeft" ? -TIMELINE_STEP_MINUTES : TIMELINE_STEP_MINUTES;
    const next = resizeTimelineStart(item.startMin, item.durationMin, delta);
    if (
      next.startMin !== item.startMin ||
      next.durationMin !== item.durationMin
    ) {
      onCommitInterval(item.action, next.startMin, next.durationMin);
    }
  };

  const handleResizeEndKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    e.stopPropagation();
    const delta =
      e.key === "ArrowLeft" ? -TIMELINE_STEP_MINUTES : TIMELINE_STEP_MINUTES;
    const next = resizeTimelineDuration(item.startMin, item.durationMin, delta);
    if (
      next.startMin !== item.startMin ||
      next.durationMin !== item.durationMin
    ) {
      onCommitInterval(item.action, next.startMin, next.durationMin);
    }
  };

  const isResizingStart = preview?.mode === "resize-start";
  const isResizingEnd = preview?.mode === "resize-end";

  return (
    <div
      className={cn(
        "group/bar relative col-start-1 row-start-1 self-center justify-self-start select-none",
        preview && "z-30 select-none",
      )}
      onClickCapture={(e) => {
        if (suppressNextClickRef.current) {
          suppressNextClickRef.current = false;
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onKeyDown={handleBarKeyDown}
      onPointerDown={(e) => startPointerGesture(e, "move")}
      style={{
        marginLeft: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
    >
      {preview && (
        <div
          aria-live="polite"
          className="pointer-events-none absolute -top-7 left-0 z-30 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-background tabular-nums shadow-sm"
        >
          {formatTimelineMinutes(displayStartMin)}–
          {formatTimelineMinutes(displayStartMin + displayDurationMin)}
        </div>
      )}

      <PrismTooltip delay={300} label={tooltipText} placement="top">
        <div className="w-full">
          <ActionItem
            action={item.action}
            className="w-full"
            onClick={onOpenAction}
            displayFlags={{ showLate: true, showSprint: true }}
            variant={VARIANT.timeline}
          />
        </div>
      </PrismTooltip>

      <button
        aria-label={`Ajustar início de ${item.action.title}`}
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-20 flex cursor-ew-resize touch-none items-center justify-center rounded-l-xl border border-transparent opacity-0 transition-opacity focus-visible:pointer-events-auto focus-visible:opacity-100",
          handleSize,
          showPointerHandles &&
            "pointer-fine:group-hover/bar:pointer-events-auto pointer-fine:group-hover/bar:opacity-100",
          isResizingStart && "pointer-events-auto opacity-100",
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleResizeStartKeyDown}
        onPointerDown={(e) => startPointerGesture(e, "resize-start")}
        type="button"
      >
        <span className="h-4 w-0.5 max-w-full rounded-full bg-foreground/50" />
      </button>

      <button
        aria-label={`Ajustar duração de ${item.action.title}`}
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-20 flex cursor-ew-resize touch-none items-center justify-center rounded-r-xl border border-transparent opacity-0 transition-opacity focus-visible:pointer-events-auto focus-visible:opacity-100",
          handleSize,
          showPointerHandles &&
            "pointer-fine:group-hover/bar:pointer-events-auto pointer-fine:group-hover/bar:opacity-100",
          isResizingEnd && "pointer-events-auto opacity-100",
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleResizeEndKeyDown}
        onPointerDown={(e) => startPointerGesture(e, "resize-end")}
        type="button"
      >
        <span className="h-4 w-0.5 max-w-full rounded-full bg-foreground/50" />
      </button>
    </div>
  );
}

export function TimelineBoard({
  actions,
  currentDay,
  fillHeight = false,
}: {
  actions: Action[];
  currentDay: Date;
  fillHeight?: boolean;
}) {
  const { person } = useAppContext();
  const { handleAction } = useActionMutations();
  const [optimisticOverrides, setOptimisticOverrides] = useState<
    Record<string, { date: string; time: number }>
  >({});
  const operationCounter = useRef(0);
  const latestOperationIds = useRef<Record<string, number>>({});
  const writes = useRef(new Map<string, Promise<Action | void>>());

  const { data: allPeople = [] } = useQuery({
    queryKey: QUERY_KEYS.people(person?.user_id ?? ""),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
    enabled: Boolean(person?.user_id),
  });

  const commitInterval = useCallback(
    async (action: Action, nextStartMin: number, nextDurationMin: number) => {
      const currentStartMin = getActionStartMinutes(action.date);
      const currentDurationMin = getActionDurationMinutes(action.time);
      if (
        nextStartMin === currentStartMin &&
        nextDurationMin === currentDurationMin
      ) {
        return;
      }

      const nextDate = applyTimelineMinutesToDate(action.date, nextStartMin);
      const nextTime = nextDurationMin;
      const actionId = action.id;
      const operationId = ++operationCounter.current;
      latestOperationIds.current[actionId] = operationId;

      setOptimisticOverrides((prev) => ({
        ...prev,
        [actionId]: { date: nextDate, time: nextTime },
      }));

      try {
        const previous = writes.current.get(actionId);
        const save = async () => {
          let baseline = action;
          if (previous) {
            try {
              const confirmed = await previous;
              if (
                confirmed &&
                getActionRevision(confirmed.updated_at) >
                  getActionRevision(baseline.updated_at)
              ) {
                baseline = confirmed;
              }
            } catch (error) {
              if (error instanceof ActionConflictError) throw error;
            }
          }
          return await handleAction({
            intent: INTENT.update_action,
            id: baseline.id,
            expectedUpdatedAt: baseline.updated_at,
            date: nextDate,
            time: nextTime,
          });
        };

        const saving = save();
        writes.current.set(actionId, saving);
        try {
          const result = await saving;
          if (!result) {
            toast.error("Não foi possível atualizar o horário da ação.");
          }
        } catch (error) {
          if (writes.current.get(actionId) === saving) {
            writes.current.delete(actionId);
          }
          throw error;
        }
      } catch (error) {
        console.error("Timeline update failed:", error);
        if (!(error instanceof ActionConflictError)) {
          toast.error("Não foi possível atualizar o horário da ação.");
        }
      } finally {
        if (latestOperationIds.current[actionId] === operationId) {
          setOptimisticOverrides((prev) => {
            if (!(actionId in prev)) return prev;
            const next = { ...prev };
            delete next[actionId];
            return next;
          });
        }
      }
    },
    [handleAction],
  );

  const effectiveActions = useMemo(
    () =>
      actions.map((action) => {
        const override = optimisticOverrides[action.id];
        return override
          ? { ...action, date: override.date, time: override.time }
          : action;
      }),
    [actions, optimisticOverrides],
  );

  return (
    <TimelineGrid
      actions={effectiveActions}
      allPeople={allPeople}
      currentDay={currentDay}
      fillHeight={fillHeight}
      onCommitInterval={commitInterval}
    />
  );
}

export function TimelineGrid({
  actions,
  allPeople,
  currentDay,
  fillHeight = false,
  gallery,
  onCommitInterval,
}: {
  actions: Action[];
  allPeople: Person[];
  currentDay: Date;
  fillHeight?: boolean;
  gallery?: TimelineGalleryOptions;
  onCommitInterval: CommitTimelineInterval;
}) {
  const { person } = useAppContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>();
  const [nowMinutes, setNowMinutes] = useState(getCurrentMinutesOfDay);
  const personColumnRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [camera, setCamera] = useState<TimelineCamera>({
    scale: TIMELINE_PX_PER_MINUTE,
  });
  const settledWidthRef = useRef(0);
  const viewportCenterRef = useRef<number | undefined>(undefined);
  const pxPerMinute = camera.scale;
  const initialMinute = gallery?.initialMinute;
  const hourWidth = 60 * pxPerMinute;
  const trackWidth = TIMELINE_TOTAL_MINUTES * pxPerMinute;
  const minScale = viewportWidth / TIMELINE_TOTAL_MINUTES;
  const hourStep =
    TIMELINE_HOUR_STEPS.find((step) => step * hourWidth >= 42) ?? 24;
  const minuteMarks = hourStep === 1 ? getTimelineMinuteMarks(hourWidth) : [];
  const showFiveMinuteGrid = 5 * pxPerMinute >= 8;

  const isGallery = gallery !== undefined;
  const defaultSelectedUserIds = useMemo(() => {
    if (isGallery) return allPeople.map(({ user_id }) => user_id);
    return person?.user_id ? [person.user_id] : [];
  }, [allPeople, isGallery, person?.user_id]);
  const effectiveSelectedUserIds = selectedUserIds ?? defaultSelectedUserIds;

  const showNowLine = isToday(currentDay);
  const nowLeftPx = nowMinutes * pxPerMinute;

  useEffect(() => {
    if (!showNowLine) return;
    setNowMinutes(getCurrentMinutesOfDay());
    const intervalId = window.setInterval(() => {
      setNowMinutes(getCurrentMinutesOfDay());
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, [showNowLine]);

  const getViewportWidth = useCallback(() => {
    const container = scrollContainerRef.current;
    const personColumn = personColumnRef.current;
    return container && personColumn
      ? Math.max(0, container.clientWidth - personColumn.offsetWidth)
      : 0;
  }, []);

  const peopleRows = useMemo(
    () =>
      getTimelinePeopleRows(
        allPeople,
        actions,
        person,
        person?.admin ? effectiveSelectedUserIds : undefined,
      ).map((row) => {
        const laned = assignTimelineLanes(
          row.actions.map((action) => ({
            action,
            startMin: getActionStartMinutes(action.date),
            durationMin: getActionDurationMinutes(action.time),
          })),
        );
        const lanes: LanedTimelineAction[][] = Array.from(
          { length: laned.laneCount },
          () => [],
        );
        for (const item of laned.items) {
          lanes[item.lane]?.push(item);
        }

        return {
          ...row,
          lanes,
        };
      }),
    [actions, allPeople, effectiveSelectedUserIds, person],
  );

  const visibleActions = peopleRows.flatMap(({ lanes }) => lanes.flat());

  function getFitCamera(
    width: number,
    includeFinished: boolean,
  ): TimelineCamera | undefined {
    const targetActions = getTimelineFitActions(
      visibleActions,
      includeFinished,
    );
    if (width <= 0 || targetActions.length === 0) return;
    const start = Math.min(...targetActions.map((action) => action.startMin));
    const end = Math.min(
      TIMELINE_TOTAL_MINUTES,
      Math.max(
        ...targetActions.map(
          ({ startMin, durationMin }) => startMin + durationMin,
        ),
      ),
    );
    if (end <= start) return;
    const margin = Math.min(24, Math.max(16, width * 0.04), width / 4);
    return {
      scale: clampTimelineScale((width - 2 * margin) / (end - start), width),
      centerMinute: (start + end) / 2,
    };
  }

  const onViewportSettled = useEffectEvent((width: number) => {
    settledWidthRef.current = width;
    setViewportWidth(width);

    const scale =
      camera.scale * TIMELINE_TOTAL_MINUTES < width
        ? clampTimelineScale(camera.scale, width)
        : camera.scale;
    if (scale > camera.scale) {
      setCamera({ scale, centerMinute: viewportCenterRef.current });
    }
  });

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let observedWidth = getViewportWidth();
    settledWidthRef.current = observedWidth;
    setViewportWidth(observedWidth);
    let settleTimer: number | undefined;
    const observer = new ResizeObserver(() => {
      const width = getViewportWidth();
      if (width === observedWidth) return;
      observedWidth = width;
      window.clearTimeout(settleTimer);
      if (width <= 0) return;
      settleTimer = window.setTimeout(
        () => onViewportSettled(width),
        TIMELINE_RESIZE_DEBOUNCE_MS,
      );
    });

    observer.observe(container);
    return () => {
      window.clearTimeout(settleTimer);
      observer.disconnect();
    };
  }, [getViewportWidth]);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const width = getViewportWidth();
    const left =
      camera.centerMinute === undefined
        ? initialMinute !== undefined
          ? initialMinute * camera.scale - 32
          : showNowLine
            ? getCurrentMinutesOfDay() * camera.scale - 120
            : container.scrollLeft
        : camera.centerMinute * camera.scale - width / 2;
    container.scrollLeft = Math.max(0, left);
    viewportCenterRef.current =
      (container.scrollLeft + width / 2) / camera.scale;
  }, [camera, getViewportWidth, initialMinute, showNowLine]);

  function changeZoom(percent: number) {
    const width = getViewportWidth();
    if (width <= 0) return;
    setCamera({
      scale: clampTimelineScale(
        (percent / 100) * TIMELINE_PX_PER_MINUTE,
        width,
      ),
      centerMinute: viewportCenterRef.current,
    });
  }

  function fitActions(includeFinished: boolean) {
    const fit = getFitCamera(getViewportWidth(), includeFinished);
    if (fit) setCamera(fit);
  }

  return (
    <div
      className={cn(
        "isolate z-0 w-full",
        fillHeight && "flex h-full min-h-0 flex-col",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <PrismSlider
            aria-label="Zoom da linha do tempo"
            className="flex w-32 flex-row items-center lg:w-48 xl:w-80"
            maxValue={200}
            minValue={Math.floor((minScale / TIMELINE_PX_PER_MINUTE) * 100)}
            onChange={changeZoom}
            value={Math.round((camera.scale / TIMELINE_PX_PER_MINUTE) * 100)}
          >
            <PrismSliderOutput>
              {({ state }) => `${state.values[0]}%`}
            </PrismSliderOutput>
            <PrismSliderTrack />
          </PrismSlider>
          <PrismButtonGroup
            aria-label="Ajustar enquadramento da linha do tempo"
            attached={false}
            size="sm"
          >
            <PrismTooltip label="Focar ações em aberto">
              <PrismButton
                aria-label="Focar ações em aberto"
                isDisabled={visibleActions.length === 0 || viewportWidth === 0}
                onPress={() => fitActions(false)}
                size="icon-sm"
                variant="secondary"
              >
                <FocusIcon />
              </PrismButton>
            </PrismTooltip>
            <PrismTooltip label="Focar todas as ações">
              <PrismButton
                aria-label="Focar todas as ações"
                isDisabled={visibleActions.length === 0 || viewportWidth === 0}
                onPress={() => fitActions(true)}
                size="icon-sm"
                variant="secondary"
              >
                <ScanIcon />
              </PrismButton>
            </PrismTooltip>
          </PrismButtonGroup>
        </div>
        {person?.admin && (
          <UPeopleCombobox
            mode="responsibles"
            onSelect={setSelectedUserIds}
            selectedResponsibles={effectiveSelectedUserIds}
            size="sm"
            variant="ghost"
          />
        )}
      </div>

      {/* Scroll region intentionally without tabIndex (not a focus stop) */}
      <div
        className={cn(
          "w-full overflow-x-auto",
          fillHeight && "min-h-0 flex-1 overflow-y-auto",
        )}
        onScroll={(event) => {
          const width = getViewportWidth();
          if (width !== settledWidthRef.current) return;
          viewportCenterRef.current =
            (event.currentTarget.scrollLeft + width / 2) / camera.scale;
        }}
        ref={scrollContainerRef}
      >
        <div className="relative min-w-max">
          {/* Header row: sticky person column + hours axis */}
          <div className="flex border-b border-border">
            <div
              aria-label="Responsável"
              className="sticky left-0 z-30 flex h-10 w-14 shrink-0 items-center justify-center bg-background"
              ref={personColumnRef}
            />

            <div
              className="relative flex h-10 shrink-0"
              style={{ width: `${trackWidth}px` }}
            >
              {HOURS.map((hour) => {
                const hourLeftPx = hour * hourWidth;
                const showHourLabel =
                  hour % hourStep === 0 &&
                  (!showNowLine ||
                    !isTimelineLabelOverlappingNow(
                      hourLeftPx,
                      HOUR_LABEL_WIDTH_PX,
                      nowLeftPx,
                    ));

                return (
                  <div
                    className="relative flex h-full shrink-0 items-center border-l border-border pl-2 text-xs font-semibold text-foreground tabular-nums"
                    key={hour}
                    style={{ width: `${hourWidth}px` }}
                  >
                    {showHourLabel && `${String(hour).padStart(2, "0")}h`}
                    {minuteMarks.map((minuteOffset) => {
                      const offsetPx = minuteOffset * pxPerMinute;
                      const showMinuteLabel =
                        !showNowLine ||
                        !isTimelineLabelOverlappingNow(
                          hourLeftPx + offsetPx,
                          MINUTE_LABEL_WIDTH_PX,
                          nowLeftPx,
                        );

                      return (
                        <div
                          className="pointer-events-none absolute inset-y-0 flex items-center border-l pl-1.5 text-xs font-normal text-secondary-foreground tabular-nums"
                          key={minuteOffset}
                          style={{ left: `${offsetPx}px` }}
                        >
                          {showMinuteLabel &&
                            `${String(minuteOffset).padStart(2, "0")}`}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {showNowLine && (
                <div
                  className="pointer-events-none absolute top-1.5 z-20 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground tabular-nums shadow-xs"
                  style={{ left: `${nowLeftPx}px` }}
                >
                  Agora · {formatTimelineMinutes(nowMinutes)}
                </div>
              )}
            </div>
          </div>

          {/* Person rows */}
          {peopleRows.length === 0 ? (
            <div className="py-8 text-center text-sm text-secondary-foreground">
              Selecione pelo menos um responsável para exibir a linha do tempo.
            </div>
          ) : (
            <div className="relative divide-y divide-border">
              {peopleRows.map(({ person: rowPerson, lanes }, personIndex) => {
                const fullName =
                  `${rowPerson.name} ${rowPerson.surname}`.trim();
                return (
                  <div className="flex" key={rowPerson.user_id}>
                    {/* Sticky person header (avatar only) */}
                    <div
                      aria-label={fullName}
                      className="sticky left-0 z-40 flex w-14 shrink-0 items-start justify-center bg-background py-3"
                      title={fullName}
                    >
                      <UAvatar
                        alt={fullName}
                        fallback={rowPerson.initials}
                        image={rowPerson.image}
                        size="md"
                      />
                    </div>

                    {/* Time track */}
                    <div
                      className="relative shrink-0"
                      style={{ width: `${trackWidth}px` }}
                    >
                      {/* Hour & 5-minute vertical grid lines */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 flex"
                      >
                        {HOURS.map((hour) => (
                          <div
                            className="relative h-full shrink-0 border-l border-border"
                            key={hour}
                            style={{ width: `${hourWidth}px` }}
                          >
                            {showFiveMinuteGrid &&
                              FIVE_MINUTE_OFFSETS.map((minuteOffset) => (
                                <div
                                  className="absolute inset-y-0 border-l"
                                  key={minuteOffset}
                                  style={{
                                    left: `${minuteOffset * pxPerMinute}px`,
                                  }}
                                />
                              ))}
                          </div>
                        ))}
                      </div>

                      {/* Vertical "Agora" line */}
                      {showNowLine && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-primary"
                          style={{ left: `${nowLeftPx}px` }}
                        />
                      )}

                      {/* Lanes */}
                      <div className="relative flex flex-col divide-y">
                        {lanes.map((laneItems, laneIndex) => (
                          <div
                            className={cn(
                              "relative grid min-h-9 w-full grid-cols-1 py-1",
                              personIndex === peopleRows.length - 1 &&
                                laneIndex === lanes.length - 1 &&
                                "pb-6",
                            )}
                            // biome-ignore lint/suspicious/noArrayIndexKey: The lane is a numbered slot; its actions move between slots.
                            key={laneIndex}
                          >
                            {laneItems.map((item) => (
                              <TimelineActionBar
                                item={item}
                                key={item.action.id}
                                onCommitInterval={onCommitInterval}
                                onOpenAction={gallery?.onOpenAction}
                                personColumnRef={personColumnRef}
                                pxPerMinute={pxPerMinute}
                                scrollContainerRef={scrollContainerRef}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
