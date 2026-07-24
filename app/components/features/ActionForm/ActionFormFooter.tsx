import type { Action, Partner, PartnerTopic } from "~/types";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CloudUploadIcon,
  CopyIcon,
  LoaderIcon,
  PlusIcon,
} from "lucide-react";
import { ActionColorDropdown } from "~/components/features/ActionForm/ActionColorDropdown";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import { PhaseCombobox } from "~/components/features/PhaseCombobox";
import { StationCombobox } from "~/components/features/StationCombobox";
import { SprintCombobox } from "~/components/features/SprintCombobox";
import { Button } from "~/components/ui/button";
import { useActionMutations } from "~/hooks/useActionMutations";
import { INTENT } from "~/lib/CONSTANTS";
import { isInstagramFeed } from "~/lib/helpers";

interface ActionFormFooterProps {
  RawAction: Action;
  setRawAction: (action: Action) => void;
  updateAction: (data?: Record<string, unknown>) => Promise<void>;
  currentPartners: Partner[];
  isPending: boolean;
  handleSave: () => void;
  handleClose: () => void;
}

export function ActionFormFooter({
  RawAction,
  setRawAction,
  updateAction,
  currentPartners,
  isPending,
  handleSave,
  handleClose,
}: ActionFormFooterProps) {
  const { handleAction } = useActionMutations();

  return (
    <div className="w-fulld flex shrink-0 justify-between overflow-hidden border-t">
      {/* Coisas */}
      <div className="flex items-center divide-x overflow-hidden">
        {/* Parceiros Partners Combobox */}
        <div className="overflow-hidden">
          <PartnersCombobox
            selectedPartners={RawAction.partners}
            tabIndex={0}
            showText={false}
            onSelect={async (selected) => {
              // Limpa tópicos órfãos calculando o conjunto dos tópicos dos novos parceiros selecionados
              const availableTopicIds = new Set(
                currentPartners
                  .filter((p) => selected.includes(p.slug))
                  .flatMap((p) => (((p.topics as unknown) as PartnerTopic[]) || []).map((t) => t.id))
              );
              const filteredTopicIds = (RawAction.topic_ids || []).filter(
                (id) => availableTopicIds.has(id)
              );

              setRawAction({
                ...RawAction,
                partners: selected,
                topic_ids: filteredTopicIds,
              });
              await updateAction({
                partners: selected,
                topic_ids: filteredTopicIds,
              });
            }}
          />
        </div>
        {/* Fases Phase Combobox */}
        <div>
          <PhaseCombobox
            selectedPhase={RawAction.phase ?? "idea"}
            tabIndex={0}
            showText={false}
            iconVariant="progress"
            onSelect={async (selected) => {
              const phaseValue =
                typeof selected === "string" ? selected : (selected as { phase: string }).phase;
              let finalStation = RawAction.station;
              if (phaseValue === "idea") finalStation = "flow";
              if (phaseValue === "done") finalStation = null;

              setRawAction({
                ...RawAction,
                phase: phaseValue as Action["phase"],
                station: finalStation,
              });
              await updateAction({ phase: phaseValue, station: finalStation });
            }}
          />
        </div>
        {/* Estação Station Combobox */}
        <div>
          <StationCombobox
            selectedStation={RawAction.station}
            category={RawAction.category}
            tabIndex={0}
            showText={false}
            disabled={RawAction.phase === "idea" || RawAction.phase === "done"}
            onSelect={async ({ station }) => {
              if (station) {
                setRawAction({
                  ...RawAction,
                  station: station,
                });
                await updateAction({ station: station });
              }
            }}
          />
        </div>
        {/* Categorias Categories Combobox */}
        <div>
          <CategoriesCombobox
            selectedCategories={[RawAction.category]}
            tabIndex={0}
            showText={false}
            onSelect={async ({ category }) => {
              setRawAction({
                ...RawAction,
                category,
              });
              await updateAction({ category });
            }}
          />
        </div>
        {isInstagramFeed(RawAction.category) && (
          <div>
            <ActionColorDropdown
              action={RawAction}
              partners={currentPartners}
              tabIndex={0}
              onSelect={async (color) => {
                setRawAction({ ...RawAction, color });
                await updateAction({ color });
              }}
            />
          </div>
        )}
      </div>
      {/* Botão de criar e atualizar */}
      <div className="flex items-center gap-2 p-2">
        {RawAction.id && (
          <>
            <SprintCombobox
              selectedSprints={RawAction.sprints || []}
              responsibles={RawAction.responsibles || []}
              currentPartners={currentPartners}
              tabIndex={0}
              onSelect={async (newSprints, newResponsibles) => {
                const finalSprints = newSprints.length > 0 ? newSprints : null;

                setRawAction({
                  ...RawAction,
                  sprints: finalSprints,
                  responsibles: newResponsibles,
                });
                await updateAction({
                  sprints: finalSprints,
                  responsibles: newResponsibles,
                });
              }}
            />
            <Button
              variant="muted"
              size="icon"
              title="Duplicar ação (Shift+D)"
              onClick={() => {
                handleAction({
                  id: RawAction.id,
                  intent: INTENT.duplicate_action,
                });
                handleClose();
              }}
            >
              <CopyIcon />
            </Button>
            {!RawAction.archived && (
              <Button
                variant="muted"
                size="icon"
                title="Arquivar ação"
                onClick={async () => {
                  if (confirm("Tem certeza que deseja arquivar esta ação?")) {
                    setRawAction({
                      ...RawAction,
                      archived: true,
                      sprints: null,
                    });
                    await updateAction({ archived: true });
                    handleClose();
                  }
                }}
              >
                <ArchiveIcon />
              </Button>
            )}
            {RawAction.archived && (
              <Button
                variant="muted"
                size="icon"
                title="Desarquivar ação"
                className="text-amber-500 hover:text-amber-600"
                onClick={async () => {
                  if (
                    confirm("Tem certeza que deseja desarquivar esta ação?")
                  ) {
                    setRawAction({ ...RawAction, archived: false });
                    await updateAction({ archived: false });
                    handleClose();
                  }
                }}
              >
                <ArchiveRestoreIcon />
              </Button>
            )}
          </>
        )}
        <Button
          disabled={isPending}
          className="squircle w-32 overflow-hidden rounded-2xl"
          tabIndex={0}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleSave();
            if (event.shiftKey) {
              handleClose();
            }
          }}
        >
          <div className="truncate">
            {RawAction.id
              ? isPending
                ? "Atualizando..."
                : "Atualizar"
              : isPending
                ? "Criando..."
                : "Criar Ação"}
          </div>
          {isPending ? (
            <LoaderIcon className="animate-spin" />
          ) : RawAction.id ? (
            <CloudUploadIcon />
          ) : (
            <PlusIcon />
          )}
        </Button>
      </div>
    </div>
  );
}
