import { useState } from "react";
import { TextField } from "react-aria-components";
import { TimelineGrid } from "~/components/layout/TimelineBoard";
import {
  PrismButton,
  PrismDialog,
  PrismDialogBody,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismInput,
  PrismLabel,
  PrismToggle,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";
import type { Action } from "~/types";
import { getCleanAction } from "~/utils/factory";
import {
  applyTimelineMinutesToDate,
  formatTimelineMinutes,
  getActionStartMinutes,
} from "~/utils/timeline";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  GalleryAppProviders,
  MOCK_APP_CONTEXT,
  MOCK_PEOPLE,
  MOCK_PERSON,
} from "./gallery-mocks";

const PREVIEW_DAY = new Date(2099, 0, 15);
const INITIAL_MINUTE = 9 * 60 + 30;

const INITIAL_ACTIONS = [
  {
    title: "Revisar pauta diária",
    minute: 570,
    time: 10,
    phase: "finished",
    person: 0,
    partner: "alfa",
  },
  {
    title: "Subir Stories de bastidores",
    minute: 580,
    time: 20,
    phase: "doing",
    person: 0,
    partner: "beta",
  },
  {
    title: "Publicar post de bom dia",
    minute: 600,
    time: 30,
    phase: "do",
    person: 0,
    partner: "gama",
  },
  {
    title: "Aprovar cronograma de entregas",
    minute: 605,
    time: 50,
    phase: "analysis",
    person: 0,
    partner: "beta",
  },
  {
    title: "Criar identidade visual da campanha",
    minute: 690,
    time: 70,
    phase: "do",
    person: 0,
    partner: "gama",
  },
  {
    title: "Planejar sequência de publicações",
    minute: 570,
    time: 90,
    phase: "idea",
    person: 1,
    partner: "alfa",
  },
  {
    title: "Revisar os ajustes da campanha",
    minute: 610,
    time: 40,
    phase: "done",
    person: 1,
    partner: "gama",
  },
  {
    title: "Checar roteiro do vídeo",
    minute: 580,
    time: 10,
    phase: "doing",
    person: 2,
    partner: "beta",
  },
  {
    title: "Organizar material para aprovação",
    minute: 620,
    time: 40,
    phase: "doing",
    person: 2,
    partner: "delta",
  },
  {
    title: "Conferir agenda da manhã",
    minute: 420,
    time: 20,
    phase: "done",
    person: 1,
    partner: "alfa",
  },
  {
    title: "Fechar checklist do dia",
    minute: 1290,
    time: 30,
    phase: "do",
    person: 2,
    partner: "delta",
  },
].map(({ title, minute, time, phase, person, partner }, index): Action => {
  const userId = MOCK_PEOPLE[person].user_id;
  const base = getCleanAction({
    user_id: userId,
    date: PREVIEW_DAY,
    partners: [partner],
  });
  return {
    ...base,
    content_description: null,
    content_files: null,
    created_at: base.date,
    date: applyTimelineMinutesToDate(base.date, minute),
    id: `timeline-preview-${index + 1}`,
    instagram_caption: null,
    phase,
    sprints: null,
    strategies: null,
    time,
    title,
    updated_at: base.date,
    user_id: userId,
    work_files: null,
  };
});

export function UzzinaTimelinePreviewSection() {
  const [actions, setActions] = useState(INITIAL_ACTIONS);
  const [phaseColor, setPhaseColor] = useState<"soft" | "vivid">("soft");
  const [vividTextTone, setVividTextTone] = useState<"dark" | "light">("dark");
  const [openedActionId, setOpenedActionId] = useState<string>();
  const [draftTitle, setDraftTitle] = useState("");
  const openedAction = actions.find(({ id }) => id === openedActionId);
  const openedStart = openedAction && getActionStartMinutes(openedAction.date);

  return (
    <GalleryAppProviders
      context={{
        ...MOCK_APP_CONTEXT,
        person: { ...MOCK_PERSON, preferences: { phaseColor } },
      }}
    >
      <MultiSelectionProvider>
        <GallerySection>
          <div id="uzzina-timeline-preview" />
          <GallerySectionHeader
            description="Arraste pelo título para mover. Passe o mouse para acessar as alças nas barras com espaço. Clique ou toque para abrir a ação. As alterações ficam nesta prévia."
            title="Linha do tempo"
          />
          <GallerySectionContent>
            <GalleryItem className="w-full" label="Ações fictícias">
              <div className="flex w-full min-w-0 flex-col gap-3">
                <div className="flex flex-wrap gap-3">
                  <PrismToggleGroup
                    aria-label="Cor da fase"
                    onSelectionChange={(keys) => {
                      const [color] = keys;
                      if (color === "soft" || color === "vivid")
                        setPhaseColor(color);
                    }}
                    selectedKeys={[phaseColor]}
                    selectionMode="single"
                    size="sm"
                    variant="outline"
                  >
                    <PrismToggleGroupItem id="soft">Suave</PrismToggleGroupItem>
                    <PrismToggleGroupItem id="vivid">Viva</PrismToggleGroupItem>
                  </PrismToggleGroup>
                  {phaseColor === "vivid" && (
                    <PrismToggleGroup
                      aria-label="Texto na cor viva"
                      onSelectionChange={(keys) => {
                        const [tone] = keys;
                        if (tone === "dark" || tone === "light")
                          setVividTextTone(tone);
                      }}
                      selectedKeys={[vividTextTone]}
                      selectionMode="single"
                      size="sm"
                      variant="outline"
                    >
                      <PrismToggleGroupItem id="dark">
                        Texto escuro
                      </PrismToggleGroupItem>
                      <PrismToggleGroupItem id="light">
                        Texto claro
                      </PrismToggleGroupItem>
                    </PrismToggleGroup>
                  )}
                </div>
                <div data-vivid-text={vividTextTone}>
                  <TimelineGrid
                    actions={actions}
                    allPeople={MOCK_PEOPLE}
                    currentDay={PREVIEW_DAY}
                    gallery={{
                      initialMinute: INITIAL_MINUTE,
                      onOpenAction: (action) => {
                        setDraftTitle(action.title);
                        setOpenedActionId(action.id);
                      },
                    }}
                    onCommitInterval={(action, startMin, durationMin) => {
                      setActions((previous) =>
                        previous.map((row) =>
                          row.id === action.id
                            ? {
                                ...row,
                                date: applyTimelineMinutesToDate(
                                  row.date,
                                  startMin,
                                ),
                                time: durationMin,
                              }
                            : row,
                        ),
                      );
                    }}
                  />
                </div>
              </div>
            </GalleryItem>
          </GallerySectionContent>
        </GallerySection>
        <PrismDialog
          isOpen={Boolean(openedAction)}
          onOpenChange={(open) => {
            if (!open) setOpenedActionId(undefined);
          }}
          size="sm"
        >
          {openedAction && openedStart !== undefined && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const title = draftTitle.trim();
                if (!title) return;
                setActions((previous) =>
                  previous.map((action) =>
                    action.id === openedAction.id
                      ? { ...action, title }
                      : action,
                  ),
                );
                setOpenedActionId(undefined);
              }}
            >
              <PrismDialogHeader>
                <PrismDialogTitle>Ação fictícia</PrismDialogTitle>
                <p className="text-secondary-foreground tabular-nums">
                  {formatTimelineMinutes(openedStart)}–
                  {formatTimelineMinutes(openedStart + openedAction.time)}
                </p>
              </PrismDialogHeader>
              <PrismDialogBody>
                <TextField onChange={setDraftTitle} value={draftTitle}>
                  <PrismLabel>Título</PrismLabel>
                  <PrismInput className="w-full" />
                </TextField>
              </PrismDialogBody>
              <PrismDialogFooter>
                <PrismButton isDisabled={!draftTitle.trim()} type="submit">
                  Salvar título
                </PrismButton>
              </PrismDialogFooter>
            </form>
          )}
        </PrismDialog>
      </MultiSelectionProvider>
    </GalleryAppProviders>
  );
}
