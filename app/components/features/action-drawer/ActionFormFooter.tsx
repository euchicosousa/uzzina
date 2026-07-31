import type { Action, Partner, PartnerTopic } from "~/types";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CloudUploadIcon,
  CopyIcon,
  LoaderIcon,
  PlusIcon,
} from "lucide-react";
import { ActionColorDropdown } from "./ActionColorDropdown";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import { PhaseCombobox } from "~/components/features/PhaseCombobox";
import { StationCombobox } from "~/components/features/StationCombobox";
import { SprintCombobox } from "~/components/features/SprintCombobox";
import { useActionMutations } from "~/hooks/useActionMutations";
import { INTENT } from "~/lib/CONSTANTS";
import { isInstagramFeed } from "~/lib/helpers";
import { PrismButton } from "~/components/prism";
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
            onSelect={async (selected) => {
              // Limpa tópicos órfãos calculando o conjunto dos tópicos dos novos parceiros selecionados
              const availableTopicIds = new Set(
                currentPartners
                  .filter((p) => selected.includes(p.slug))
                  .flatMap((p) =>
                    ((p.topics as unknown as PartnerTopic[]) || []).map(
                      (t) => t.id,
                    ),
                  ),
              );
              const filteredTopicIds = (RawAction.topic_ids || []).filter(
                (id) => availableTopicIds.has(id),
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
            selectedPartners={RawAction.partners}
            showText={false}
            tabIndex={0}
          />
        </div>
        {/* Fases Phase Combobox */}
        <div>
          <PhaseCombobox
            iconVariant="progress"
            onSelect={async (selected) => {
              const phaseValue =
                typeof selected === "string"
                  ? selected
                  : (
                      selected as {
                        phase: string;
                      }
                    ).phase;
              let finalStation = RawAction.station;
              if (phaseValue === "idea") finalStation = "flow";
              if (phaseValue === "done") finalStation = null;
              setRawAction({
                ...RawAction,
                phase: phaseValue as Action["phase"],
                station: finalStation,
              });
              await updateAction({
                phase: phaseValue,
                station: finalStation,
              });
            }}
            selectedPhase={RawAction.phase ?? "idea"}
            showText={false}
            tabIndex={0}
          />
        </div>
        {/* Estação Station Combobox */}
        <div>
          <StationCombobox
            category={RawAction.category}
            disabled={RawAction.phase === "idea" || RawAction.phase === "done"}
            onSelect={async ({ station }) => {
              if (station) {
                setRawAction({
                  ...RawAction,
                  station: station,
                });
                await updateAction({
                  station: station,
                });
              }
            }}
            selectedStation={RawAction.station}
            showText={false}
            tabIndex={0}
          />
        </div>
        {/* Categorias Categories Combobox */}
        <div>
          <CategoriesCombobox
            onSelect={async ({ category }) => {
              setRawAction({
                ...RawAction,
                category,
              });
              await updateAction({
                category,
              });
            }}
            selectedCategories={[RawAction.category]}
            showText={false}
            tabIndex={0}
          />
        </div>
        {isInstagramFeed(RawAction.category) && (
          <div>
            <ActionColorDropdown
              action={RawAction}
              onSelect={async (color) => {
                setRawAction({
                  ...RawAction,
                  color,
                });
                await updateAction({
                  color,
                });
              }}
              partners={currentPartners}
              tabIndex={0}
            />
          </div>
        )}
      </div>
      {/* Botão de criar e atualizar */}
      <div className="flex items-center gap-2 p-2">
        {RawAction.id && (
          <>
            <SprintCombobox
              currentPartners={currentPartners}
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
              responsibles={RawAction.responsibles || []}
              selectedSprints={RawAction.sprints || []}
              tabIndex={0}
            />
            <PrismButton
              aria-label="Duplicar ação (Shift+D)"
              onClick={() => {
                handleAction({
                  id: RawAction.id,
                  intent: INTENT.duplicate_action,
                });
                handleClose();
              }}
              size="icon"
              variant="ghost"
            >
              <CopyIcon />
            </PrismButton>
            {!RawAction.archived && (
              <PrismButton
                aria-label="Arquivar ação"
                onClick={async () => {
                  if (confirm("Tem certeza que deseja arquivar esta ação?")) {
                    setRawAction({
                      ...RawAction,
                      archived: true,
                      sprints: null,
                    });
                    await updateAction({
                      archived: true,
                    });
                    handleClose();
                  }
                }}
                size="icon"
                variant="ghost"
              >
                <ArchiveIcon />
              </PrismButton>
            )}
            {RawAction.archived && (
              <PrismButton
                aria-label="Desarquivar ação"
                className="text-amber-500 hover:text-amber-600"
                onClick={async () => {
                  if (
                    confirm("Tem certeza que deseja desarquivar esta ação?")
                  ) {
                    setRawAction({
                      ...RawAction,
                      archived: false,
                    });
                    await updateAction({
                      archived: false,
                    });
                    handleClose();
                  }
                }}
                size="icon"
                variant="ghost"
              >
                <ArchiveRestoreIcon />
              </PrismButton>
            )}
          </>
        )}
        <PrismButton
          className="squircle w-32 overflow-hidden rounded-2xl"
          isDisabled={isPending}
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
        </PrismButton>
      </div>
    </div>
  );
}
