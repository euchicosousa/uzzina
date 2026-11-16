import { useQuery } from "@tanstack/react-query";
import { isToday } from "date-fns";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Focusable } from "react-aria-components";
import { toast } from "sonner";
import { ActionItem } from "~/components/features/ActionItem";
import { PrismTooltip } from "~/components/prism";
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
import type { Action } from "~/types";
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
  getTimelinePeopleRows,
  moveTimelineInterval,
  resizeTimelineDuration,
  resizeTimelineStart,
  type TimelineInterval,
} from "~/utils/timeline";

const TOTAL_HOURS = 24;
const HOUR_WIDTH_PX = 60 * TIMELINE_PX_PER_MINUTE;
const TRACK_WIDTH = TIMELINE_TOTAL_MINUTES * TIMELINE_PX_PER_MINUTE;
const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => i);
const FIVE_MINUTE_OFFSETS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const DRAG_THRESHOLD_PX = 5;

interface LanedTimelineAction extends TimelineInterval {
  action: Action;
  lane: number;
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
  onCommitInterval,
}: {
  item: LanedTimelineAction;
  onCommitInterval: (
    action: Action,
    nextStartMin: number,
    nextDurationMin: number,
  ) => void;
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

  const leftPx = displayStartMin * TIMELINE_PX_PER_MINUTE;
  const widthPx = Math.max(16, displayDurationMin * TIMELINE_PX_PER_MINUTE);

  const startPointerGesture = (
    e: ReactPointerEvent<HTMLElement>,
    mode: TimelineGestureMode,
  ) => {
    if (e.button !== 0) return;
    if (mode === "move" && isEditableTarget(e.target)) return;
    if (mode !== "move") {
      e.stopPropagation();
    }

    cleanupGestureRef.current?.();

    const startClientX = e.clientX;
    const initialStartMin = item.startMin;
    const initialDurationMin = item.durationMin;
    let hasMoved = mode !== "move";
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

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startClientX;
      if (!hasMoved && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;
      hasMoved = true;
      const deltaMinutes = deltaX / TIMELINE_PX_PER_MINUTE;
      latestInterval = computeInterval(deltaMinutes);
      setPreview({
        mode,
        startMin: latestInterval.startMin,
        durationMin: latestInterval.durationMin,
      });
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
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
      cleanup();
      setPreview(null);
    };

    cleanupGestureRef.current = cleanup;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
  };

  const handleBarKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isEditableTarget(e.target)) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const delta =
      e.key === "ArrowLeft" ? -TIMELINE_STEP_MINUTES : TIMELINE_STEP_MINUTES;
    const next = e.shiftKey
      ? resizeTimelineDuration(item.startMin, item.durationMin, delta)
      : moveTimelineInterval(item.startMin, item.durationMin, delta);
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
        "group/bar relative col-start-1 row-start-1 self-center justify-self-start",
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

      <button
        aria-label={`Ajustar início de ${item.action.title}`}
        className={cn(
          "absolute inset-y-0 left-0 z-20 flex w-2.5 cursor-ew-resize touch-none items-center justify-center rounded-l-xl opacity-0 transition-opacity group-focus-within/bar:opacity-100 group-hover/bar:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          isResizingStart && "opacity-100",
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleResizeStartKeyDown}
        onPointerDown={(e) => startPointerGesture(e, "resize-start")}
        type="button"
      >
        <span className="h-4 w-0.5 rounded-full bg-foreground/50" />
      </button>

      <PrismTooltip delay={300} label={tooltipText} placement="top">
        <Focusable>
          <div className="w-full">
            <ActionItem
              action={item.action}
              className="min-h-9 w-full"
              displayFlags={{ showLate: true, showSprint: true }}
              variant={VARIANT.timeline}
            />
          </div>
        </Focusable>
      </PrismTooltip>

      <button
        aria-label={`Ajustar duração de ${item.action.title}`}
        className={cn(
          "absolute inset-y-0 right-0 z-20 flex w-2.5 cursor-ew-resize touch-none items-center justify-center rounded-r-xl opacity-0 transition-opacity group-focus-within/bar:opacity-100 group-hover/bar:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          isResizingEnd && "opacity-100",
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleResizeEndKeyDown}
        onPointerDown={(e) => startPointerGesture(e, "resize-end")}
        type="button"
      >
        <span className="h-4 w-0.5 rounded-full bg-foreground/50" />
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[] | undefined>(
    undefined,
  );
  const [nowMinutes, setNowMinutes] = useState<number>(getCurrentMinutesOfDay);
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

  const defaultSelectedUserIds = useMemo(
    () => (person?.user_id ? [person.user_id] : []),
    [person?.user_id],
  );
  const effectiveSelectedUserIds = selectedUserIds ?? defaultSelectedUserIds;

  const showNowLine = isToday(currentDay);
  const nowLeftPx = nowMinutes * TIMELINE_PX_PER_MINUTE;

  useEffect(() => {
    if (!showNowLine) return;
    setNowMinutes(getCurrentMinutesOfDay());
    const intervalId = window.setInterval(() => {
      setNowMinutes(getCurrentMinutesOfDay());
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, [showNowLine]);

  useEffect(() => {
    if (!showNowLine) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollLeft = Math.max(
      0,
      getCurrentMinutesOfDay() * TIMELINE_PX_PER_MINUTE - 120,
    );
  }, [showNowLine]);

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

  const peopleRows = useMemo(
    () =>
      getTimelinePeopleRows(
        allPeople,
        effectiveActions,
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
    [allPeople, effectiveActions, effectiveSelectedUserIds, person],
  );

  return (
    <div
      className={cn(
        "isolate z-0 w-full",
        fillHeight && "flex h-full min-h-0 flex-col",
      )}
    >
      {person?.admin && (
        <div className="flex flex-wrap items-center justify-end gap-4 pb-2">
          <UPeopleCombobox
            mode="responsibles"
            onSelect={setSelectedUserIds}
            selectedResponsibles={effectiveSelectedUserIds}
            size="sm"
            variant="ghost"
          />
        </div>
      )}

      {/* Scroll region intentionally without tabIndex (not a focus stop) */}
      <div
        className={cn(
          "w-full overflow-x-auto",
          fillHeight && "min-h-0 flex-1 overflow-y-auto",
        )}
        ref={scrollContainerRef}
      >
        <div className="relative min-w-max">
          {/* Header row: sticky person column + hours axis */}
          <div className="flex border-b border-border">
            <div
              aria-label="Responsável"
              className="sticky left-0 z-30 flex h-10 w-14 shrink-0 items-center justify-center"
            />

            <div
              className="relative flex h-10 shrink-0"
              style={{ width: `${TRACK_WIDTH}px` }}
            >
              {HOURS.map((hour) => (
                <div
                  className="relative flex h-full shrink-0 items-center border-l border-border pl-2 text-xs font-medium text-secondary-foreground tabular-nums"
                  key={hour}
                  style={{ width: `${HOUR_WIDTH_PX}px` }}
                >
                  {String(hour).padStart(2, "0")}h
                </div>
              ))}

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
              {peopleRows.map(({ person: rowPerson, lanes }) => {
                const fullName =
                  `${rowPerson.name} ${rowPerson.surname}`.trim();
                return (
                  <div className="flex" key={rowPerson.user_id}>
                    {/* Sticky person header (avatar only) */}
                    <div
                      aria-label={fullName}
                      className="sticky left-0 z-20 flex w-14 shrink-0 items-start justify-center py-3"
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
                      style={{ width: `${TRACK_WIDTH}px` }}
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
                            style={{ width: `${HOUR_WIDTH_PX}px` }}
                          >
                            {FIVE_MINUTE_OFFSETS.map((minuteOffset) => (
                              <div
                                className="absolute inset-y-0 border-l border-border/30"
                                key={minuteOffset}
                                style={{
                                  left: `${minuteOffset * TIMELINE_PX_PER_MINUTE}px`,
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
                      <div className="relative flex flex-col divide-y divide-border/50">
                        {lanes.map((laneItems, laneIndex) => (
                          <div
                            className="relative grid min-h-12 w-full grid-cols-1 py-1.5"
                            key={laneIndex}
                          >
                            {laneItems.map((item) => (
                              <TimelineActionBar
                                item={item}
                                key={item.action.id}
                                onCommitInterval={commitInterval}
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
