import { XIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PrismButton,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { UPeopleCombobox } from "~/components/uzzina/UPeopleCombobox";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";
import { PHASES, type PHASE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  GalleryAppProviders,
  MOCK_PARTNERS,
  MOCK_PEOPLE,
} from "./gallery-mocks";

type PhaseColorMode = "soft" | "vivid";
type ScalePxPerMinute = 4 | 6 | 8;

interface PreviewTimelineAction {
  id: string;
  title: string;
  startMin: number;
  durationMin: number;
  phase: PHASE;
  partner: string;
  isLate?: boolean;
  isSprint?: boolean;
}

interface PreviewPerson {
  userId: string;
  name: string;
  initials: string;
  image: string | null;
  role: string;
}

interface LanedAction extends PreviewTimelineAction {
  lane: number;
}

const NOW_MINUTES = 11 * 60 + 20; // 11h20
const START_HOUR = 0;
const END_HOUR = 24;
const RANGE_START_MIN = START_HOUR * 60;
const RANGE_END_MIN = END_HOUR * 60;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);
const FIVE_MINUTE_OFFSETS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const ACTIONS_BY_USER_ID: Record<string, PreviewTimelineAction[]> = {
  "user-mock-001": [
    {
      id: "u-1",
      title: "Revisar pauta diária",
      startMin: 9 * 60 + 30,
      durationMin: 10,
      phase: "finished",
      partner: "Alfa Odontologia",
    },
    {
      id: "u-2",
      title: "Subir Stories de bastidores",
      startMin: 9 * 60 + 40,
      durationMin: 20,
      phase: "doing",
      partner: "Beta Studio",
    },
    {
      id: "u-3",
      title: "Publicar post de bom dia",
      startMin: 10 * 60,
      durationMin: 30,
      phase: "do",
      partner: "Gama Clínica",
    },
    {
      id: "u-4",
      title: "Aprovar cronograma de entregas",
      startMin: 11 * 60 + 15,
      durationMin: 50,
      phase: "doing",
      partner: "Beta Studio",
      isSprint: true,
    },
    {
      id: "u-5",
      title: "Criar identidade visual da campanha",
      startMin: 15 * 60,
      durationMin: 70,
      phase: "do",
      partner: "Gama Clínica",
    },
  ],
  "user-mock-002": [
    {
      id: "m-1",
      title: "Planejar calendário editorial",
      startMin: 8 * 60 + 20,
      durationMin: 40,
      phase: "finished",
      partner: "Alfa Odontologia",
    },
    {
      id: "m-2",
      title: "Conferir nota fiscal",
      startMin: 9 * 60,
      durationMin: 10,
      phase: "doing",
      partner: "Beta Studio",
    },
    {
      id: "m-3",
      title: "Responder caixinha de perguntas",
      startMin: 10 * 60 + 15,
      durationMin: 20,
      phase: "do",
      partner: "Gama Clínica",
    },
    {
      id: "m-4",
      title: "Revisar roteiro do Reels",
      startMin: 11 * 60,
      durationMin: 40,
      phase: "doing",
      partner: "Alfa Odontologia",
      isLate: true,
    },
    {
      id: "m-5",
      title: "Ajustar briefing da campanha",
      startMin: 11 * 60 + 5,
      durationMin: 10,
      phase: "idea",
      partner: "Beta Studio",
    },
    {
      id: "m-6",
      title: "Implementar página de captura com formulário",
      startMin: 11 * 60 + 10,
      durationMin: 90,
      phase: "review",
      partner: "Gama Clínica",
    },
    {
      id: "m-7",
      title: "Organizar pauta da próxima semana",
      startMin: 14 * 60 + 30,
      durationMin: 50,
      phase: "done",
      partner: "Delta Foods",
    },
  ],
  "user-mock-003": [
    {
      id: "c-early",
      title: "Agendar publicação matinal",
      startMin: 6 * 60 + 30,
      durationMin: 30,
      phase: "finished",
      partner: "Gama Clínica",
    },
    {
      id: "c-1",
      title: "Montar apresentação de resultados",
      startMin: 9 * 60 + 30,
      durationMin: 70,
      phase: "doing",
      partner: "Alfa Odontologia",
      isLate: true,
      isSprint: true,
    },
    {
      id: "c-2",
      title: "Enviar link de aprovação",
      startMin: 11 * 60,
      durationMin: 10,
      phase: "finished",
      partner: "Beta Studio",
    },
    {
      id: "c-3",
      title: "Sequência de lançamento nos Stories",
      startMin: 11 * 60 + 10,
      durationMin: 20,
      phase: "do",
      partner: "Gama Clínica",
    },
    {
      id: "c-4",
      title: "Subir campanha de remarketing",
      startMin: 11 * 60 + 30,
      durationMin: 30,
      phase: "do",
      partner: "Alfa Odontologia",
    },
    {
      id: "c-5",
      title: "Editar corte de entrevista",
      startMin: 14 * 60,
      durationMin: 40,
      phase: "review",
      partner: "Alfa Odontologia",
    },
    {
      id: "c-6",
      title: "Configurar criativos de tráfego",
      startMin: 14 * 60 + 15,
      durationMin: 30,
      phase: "do",
      partner: "Delta Foods",
    },
    {
      id: "c-7",
      title: "Integrar webhook de leads no painel",
      startMin: 16 * 60,
      durationMin: 90,
      phase: "done",
      partner: "Beta Studio",
    },
    {
      id: "c-late",
      title: "Conferir disparo programado",
      startMin: 22 * 60 + 30,
      durationMin: 20,
      phase: "do",
      partner: "Delta Foods",
    },
  ],
};

const PREVIEW_PEOPLE: PreviewPerson[] = MOCK_PEOPLE.map((person) => ({
  userId: person.user_id,
  name: `${person.name} ${person.surname}`.trim(),
  initials: person.initials,
  image: person.image,
  role: person.areas.join(" · "),
}));

function formatMinutes(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, totalMinutes));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, "0")}h${String(minutes).padStart(2, "0")}`;
}

function assignLanes(actions: PreviewTimelineAction[]): {
  items: LanedAction[];
  laneCount: number;
} {
  const sorted = [...actions].sort(
    (a, b) => a.startMin - b.startMin || b.durationMin - a.durationMin,
  );
  const laneEnds: number[] = [];
  const items: LanedAction[] = [];

  for (const action of sorted) {
    let assignedLane = laneEnds.findIndex((end) => end <= action.startMin);
    if (assignedLane === -1) {
      assignedLane = laneEnds.length;
      laneEnds.push(action.startMin + action.durationMin);
    } else {
      laneEnds[assignedLane] = action.startMin + action.durationMin;
    }
    items.push({ ...action, lane: assignedLane });
  }

  return {
    items,
    laneCount: Math.max(1, laneEnds.length),
  };
}

interface TimelineActionBarProps {
  action: LanedAction;
  rangeStartMin: number;
  pxPerMinute: ScalePxPerMinute;
  phaseColorMode: PhaseColorMode;
  onOpen: (action: PreviewTimelineAction) => void;
}

function TimelineActionBar({
  action,
  rangeStartMin,
  pxPerMinute,
  phaseColorMode,
  onOpen,
}: TimelineActionBarProps) {
  const phase = PHASES[action.phase];
  const isLate = Boolean(action.isLate);
  const isSprint = Boolean(action.isSprint);
  const leftPx = (action.startMin - rangeStartMin) * pxPerMinute;
  const widthPx = Math.max(16, action.durationMin * pxPerMinute);
  const timeRange = `${formatMinutes(action.startMin)}–${formatMinutes(
    action.startMin + action.durationMin,
  )}`;

  const phaseColor = !isLate ? phase.color : undefined;
  const phaseSurfaceClass =
    phaseColorMode === "vivid" ? "phase-vivid" : "phase-surface";

  return (
    <div
      className="group/bar col-start-1 row-start-1 self-center justify-self-start"
      style={{
        marginLeft: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
    >
      <div
        aria-label={`${action.title}, ${timeRange}, ${action.durationMin} minutos, fase ${phase.title}`}
        className={cn(
          "relative flex min-h-9 w-full cursor-pointer items-center overflow-hidden rounded-2xl border-t border-action-top-border bg-action px-2 py-1.5 text-foreground shadow-action ring ring-action-ring transition-[color,background-color,border-color,box-shadow] duration-motion-base squircle focus-within:z-20 focus-within:outline-2 focus-within:outline-primary hover:z-10 hover:bg-action-hover hover:shadow-action-hover focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none",
          phaseColor && phaseSurfaceClass,
          isLate &&
            "bg-error-background/70 text-error-foreground ring ring-error late-surface hover:bg-error-background",
          isSprint && (isLate ? "ring-2 ring-error" : "ring-2 ring-primary"),
        )}
        onClick={() => onOpen(action)}
        onKeyDown={(e) => {
          if (
            e.target === e.currentTarget &&
            (e.key === "Enter" || e.key === " ")
          ) {
            e.preventDefault();
            onOpen(action);
          }
        }}
        role="button"
        style={
          phaseColor
            ? ({ "--phase-color": phaseColor } as React.CSSProperties)
            : undefined
        }
        tabIndex={0}
      >
        <span
          className={cn(
            "line-clamp-2 w-full text-left text-xs leading-tight font-medium wrap-break-word whitespace-normal",
            isLate && "text-error-foreground",
          )}
        >
          {action.title}
        </span>

        {/* Left resize handle */}
        <button
          aria-label={`Ajustar início de ${action.title}`}
          className="absolute inset-y-0 left-0 z-10 flex w-2 cursor-ew-resize items-center justify-center rounded-l-2xl opacity-0 transition-opacity duration-motion-fast outline-none group-focus-within/bar:opacity-100 group-hover/bar:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/60"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          type="button"
        >
          <span className="h-3.5 w-0.5 rounded-full bg-foreground/50" />
        </button>

        {/* Right resize handle */}
        <button
          aria-label={`Ajustar duração de ${action.title}`}
          className="absolute inset-y-0 right-0 z-10 flex w-2 cursor-ew-resize items-center justify-center rounded-r-2xl opacity-0 transition-opacity duration-motion-fast outline-none group-focus-within/bar:opacity-100 group-hover/bar:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/60"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          type="button"
        >
          <span className="h-3.5 w-0.5 rounded-full bg-foreground/50" />
        </button>
      </div>
    </div>
  );
}

export function UzzinaTimelinePreviewSection() {
  const [phaseColorMode, setPhaseColorMode] = useState<PhaseColorMode>("soft");
  const [vividTextTone, setVividTextTone] = useState<"dark" | "light">("dark");
  const [pxPerMinute, setPxPerMinute] = useState<ScalePxPerMinute>(6);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(() =>
    PREVIEW_PEOPLE.map((person) => person.userId),
  );
  const [openedActionId, setOpenedActionId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const hourWidthPx = 60 * pxPerMinute;
  const trackWidth = TOTAL_HOURS * hourWidthPx;
  const nowLeftPx = (NOW_MINUTES - RANGE_START_MIN) * pxPerMinute;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollLeft = Math.max(0, nowLeftPx - 120);
  }, [nowLeftPx]);

  const openedAction = useMemo(() => {
    if (!openedActionId) return null;
    for (const actions of Object.values(ACTIONS_BY_USER_ID)) {
      const found = actions.find((action) => action.id === openedActionId);
      if (found) return found;
    }
    return null;
  }, [openedActionId]);

  const visiblePeople = useMemo(() => {
    const selectedSet = new Set(selectedUserIds);
    return PREVIEW_PEOPLE.filter((person) => selectedSet.has(person.userId));
  }, [selectedUserIds]);

  const peopleRows = useMemo(() => {
    return visiblePeople.map((person) => {
      const personActions = ACTIONS_BY_USER_ID[person.userId] ?? [];
      const visibleActions = personActions.filter(
        (action) =>
          action.startMin + action.durationMin > RANGE_START_MIN &&
          action.startMin < RANGE_END_MIN,
      );
      const { items, laneCount } = assignLanes(visibleActions);
      const lanes: LanedAction[][] = Array.from(
        { length: laneCount },
        () => [],
      );
      for (const item of items) {
        lanes[item.lane].push(item);
      }
      return {
        person,
        lanes,
      };
    });
  }, [visiblePeople]);

  return (
    <GalleryAppProviders>
      <MultiSelectionProvider>
        <GallerySection>
          <div id="uzzina-timeline-preview" />
          <GallerySectionHeader
            description="Prévia visual isolada do ticket HOJE-02 (Linha do tempo). Estuda o layout com título sempre dentro da barra em múltiplas linhas para durações realistas (10, 20, 30, 40, 50, 70 e 90 min), ações adjacentes sem intervalo, comparação de escala (4px, 6px, 8px/min) e altura da barra (40px vs 56px)."
            title="Linha do tempo (Prévia HOJE-02)"
          />

          <GallerySectionContent className="flex flex-col gap-6">
            <GalleryItem
              className="w-full"
              label="Grade horária com dados fictícios"
            >
              {/* Controls outside any outer card wrapper */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-secondary-foreground">
                      Cor da fase:
                    </span>
                    <PrismToggleGroup
                      aria-label="Cor da fase"
                      onSelectionChange={(keys) => {
                        const first = Array.from(keys)[0];
                        if (first === "soft" || first === "vivid") {
                          setPhaseColorMode(first);
                        }
                      }}
                      selectedKeys={new Set([phaseColorMode])}
                      selectionMode="single"
                      size="xs"
                      variant="outline"
                    >
                      <PrismToggleGroupItem id="soft">
                        Suave
                      </PrismToggleGroupItem>
                      <PrismToggleGroupItem id="vivid">
                        Viva
                      </PrismToggleGroupItem>
                    </PrismToggleGroup>
                    {phaseColorMode === "vivid" && (
                      <PrismToggleGroup
                        aria-label="Texto na cor viva"
                        onSelectionChange={(keys) => {
                          const first = Array.from(keys)[0];
                          if (first === "dark" || first === "light") {
                            setVividTextTone(first);
                          }
                        }}
                        selectedKeys={new Set([vividTextTone])}
                        selectionMode="single"
                        size="xs"
                        variant="outline"
                      >
                        <PrismToggleGroupItem id="dark">
                          Escuro
                        </PrismToggleGroupItem>
                        <PrismToggleGroupItem id="light">
                          Claro
                        </PrismToggleGroupItem>
                      </PrismToggleGroup>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-secondary-foreground">
                      Escala:
                    </span>
                    <PrismToggleGroup
                      aria-label="Escala em pixels por minuto"
                      onSelectionChange={(keys) => {
                        const first = Array.from(keys)[0];
                        if (first === "4" || first === "6" || first === "8") {
                          setPxPerMinute(Number(first) as ScalePxPerMinute);
                        }
                      }}
                      selectedKeys={new Set([String(pxPerMinute)])}
                      selectionMode="single"
                      size="xs"
                      variant="outline"
                    >
                      <PrismToggleGroupItem id="4">
                        4px (atual)
                      </PrismToggleGroupItem>
                      <PrismToggleGroupItem id="6">6px</PrismToggleGroupItem>
                      <PrismToggleGroupItem id="8">8px</PrismToggleGroupItem>
                    </PrismToggleGroup>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <UPeopleCombobox
                    currentPartners={MOCK_PARTNERS}
                    mode="responsibles"
                    onSelect={setSelectedUserIds}
                    selectedResponsibles={selectedUserIds}
                    size="sm"
                    variant="ghost"
                  />

                  <span className="text-xs text-secondary-foreground tabular-nums">
                    Faixa: 00h–24h · Agora: {formatMinutes(NOW_MINUTES)}
                  </span>
                </div>
              </div>

              {/* Timeline grid directly over the page background (no outer card/row backgrounds) */}
              {/* Scroll region intentionally without tabIndex (not a focus stop) */}
              <div
                className={cn(
                  "w-full overflow-x-auto",
                  vividTextTone === "dark" &&
                    "[&_.phase-vivid]:[--vivid-hover-dl:0.04] [&_.phase-vivid]:[--vivid-ink:oklch(from_var(--phase-color)_0.35_0.07_h)]",
                  vividTextTone === "light" &&
                    "[&_.phase-vivid]:[--vivid-hover-dl:-0.04] [&_.phase-vivid]:[--vivid-ink:oklch(from_var(--phase-color)_0.98_0.025_h)]",
                )}
                data-vivid-text={vividTextTone}
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
                      style={{ width: `${trackWidth}px` }}
                    >
                      {HOURS.map((hour) => (
                        <div
                          className="relative flex h-full shrink-0 items-center border-l border-border pl-2 text-xs font-medium text-secondary-foreground tabular-nums"
                          key={hour}
                          style={{ width: `${hourWidthPx}px` }}
                        >
                          {String(hour).padStart(2, "0")}h
                        </div>
                      ))}

                      <div
                        className="pointer-events-none absolute top-1.5 z-20 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground tabular-nums shadow-xs"
                        style={{ left: `${nowLeftPx}px` }}
                      >
                        Agora · {formatMinutes(NOW_MINUTES)}
                      </div>
                    </div>
                  </div>

                  {/* Person rows */}
                  {peopleRows.length === 0 ? (
                    <div className="py-8 text-center text-sm text-secondary-foreground">
                      Selecione pelo menos um responsável para exibir a linha do
                      tempo.
                    </div>
                  ) : (
                    <div className="relative divide-y divide-border">
                      {peopleRows.map(({ person, lanes }) => (
                        <div className="flex" key={person.userId}>
                          {/* Sticky person header (avatar only) */}
                          <div
                            aria-label={`${person.name} (${person.role})`}
                            className="sticky left-0 z-20 flex w-14 shrink-0 items-start justify-center py-3"
                            title={`${person.name} · ${person.role}`}
                          >
                            <UAvatar
                              alt={person.name}
                              fallback={person.initials}
                              size="md"
                            />
                          </div>

                          {/* Time track */}
                          <div
                            className="relative flex shrink-0 flex-col justify-center"
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
                                  style={{ width: `${hourWidthPx}px` }}
                                >
                                  {FIVE_MINUTE_OFFSETS.map((minuteOffset) => (
                                    <div
                                      className="absolute inset-y-0 border-l border-border/30"
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
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-primary"
                              style={{ left: `${nowLeftPx}px` }}
                            />

                            {/* Lanes */}
                            {lanes.map((laneActions, laneIndex) => (
                              <div
                                className={cn(
                                  "relative grid w-full grid-cols-1 py-1.5",
                                  laneIndex < lanes.length - 1 &&
                                    "border-b border-border/50",
                                )}
                                key={laneIndex}
                              >
                                {laneActions.map((action) => (
                                  <TimelineActionBar
                                    action={action}
                                    key={action.id}
                                    onOpen={(item) =>
                                      setOpenedActionId(item.id)
                                    }
                                    phaseColorMode={phaseColorMode}
                                    pxPerMinute={pxPerMinute}
                                    rangeStartMin={RANGE_START_MIN}
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Opened-action preview strip + visual legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-secondary-foreground">
                <div className="flex items-center gap-2">
                  {openedAction ? (
                    <>
                      <span>
                        Ação aberta:{" "}
                        <strong className="font-medium text-foreground">
                          {openedAction.title}
                        </strong>{" "}
                        · {formatMinutes(openedAction.startMin)}–
                        {formatMinutes(
                          openedAction.startMin + openedAction.durationMin,
                        )}{" "}
                        ({openedAction.durationMin} min ·{" "}
                        {PHASES[openedAction.phase].title}
                        {openedAction.isLate ? " · Atrasada" : ""}
                        {openedAction.isSprint ? " · Sprint" : ""})
                      </span>
                      <PrismButton
                        aria-label="Fechar prévia da ação aberta"
                        onPress={() => setOpenedActionId(null)}
                        size="icon-xs"
                        variant="ghost"
                      >
                        <XIcon className="size-3.5" />
                      </PrismButton>
                    </>
                  ) : (
                    <span>
                      Clique na barra para abrir a ação ou passe o mouse nas
                      bordas para redimensionar.
                    </span>
                  )}
                </div>
                <span className="tabular-nums">
                  Escala: 1h = {hourWidthPx}px ({pxPerMinute}px/min) · Mínimo:
                  10 min ({10 * pxPerMinute}px)
                </span>
              </div>
            </GalleryItem>
          </GallerySectionContent>
        </GallerySection>
      </MultiSelectionProvider>
    </GalleryAppProviders>
  );
}
