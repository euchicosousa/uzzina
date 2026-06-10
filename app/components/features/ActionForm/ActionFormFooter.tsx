import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CloudUploadIcon,
  CopyIcon,
  LoaderIcon,
  PlusIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ActionColorDropdown } from "~/components/features/ActionForm/ActionColorDropdown";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import { PhaseCombobox } from "~/components/features/PhaseCombobox";
import { SprintCombobox } from "~/components/features/SprintCombobox";
import { Button } from "~/components/ui/button";
import { INTENT } from "~/lib/CONSTANTS";
import { isInstagramFeed } from "~/lib/helpers";
import { useActionMutations } from "~/hooks/useActionMutations";
import type { Action } from "~/models/actions.server";
import type { Partner } from "~/models/partners.server";

interface ActionFormFooterProps {
  RawAction: Action;
  setRawAction: (action: Action) => void;
  updateAction: (data?: { [key: string]: any }) => Promise<void>;
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
  const queryClient = useQueryClient();
  const { handleAction } = useActionMutations();

  return (
    <div className="w-fulld flex shrink-0 justify-between overflow-hidden border-t">
      {/* Coisas */}
      <div className="flex items-center divide-x overflow-hidden">
        {/* Parceiros Partners Combobox */}
        <div className="overflow-hidden">
          <PartnersCombobox
            selectedPartners={RawAction.partners}
            tabIndex={3}
            showText={false}
            onSelect={async (selected) => {
              setRawAction({
                ...RawAction,
                partners: selected,
              });
              await updateAction({ partners: selected });
            }}
          />
        </div>
        {/* Fases Phase Combobox */}
        <div>
          <PhaseCombobox
            selectedPhase={RawAction.phase ?? "idea"}
            category={RawAction.category as any}
            tabIndex={4.5}
            showText={false}
            iconVariant="progress"
            onSelect={async (selected) => {
              setRawAction({
                ...RawAction,
                phase: selected,
              });
              await updateAction({ phase: selected });
            }}
          />
        </div>
        {/* Categorias Categories Combobox */}
        <div>
          <CategoriesCombobox
            selectedCategories={[RawAction.category]}
            tabIndex={5}
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
              tabIndex={6}
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
              tabIndex={7}
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
            <button
              title="Duplicar ação (Shift+D)"
              className="flex items-center gap-2 rounded-2xl p-2 text-sm opacity-50 hover:opacity-100 focus:opacity-100"
              onClick={() => {
                handleAction(
                  { id: RawAction.id, intent: INTENT.duplicate_action }
                );
                handleClose();
              }}
            >
              <CopyIcon className="size-5" />
            </button>
            {!RawAction.archived && (
              <button
                title="Arquivar ação"
                className="flex items-center gap-2 rounded-2xl p-2 text-sm opacity-50 hover:opacity-100 focus:opacity-100"
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
                <ArchiveIcon className="size-5" />
              </button>
            )}
            {RawAction.archived && (
              <button
                title="Desarquivar ação"
                className="flex items-center gap-2 rounded-2xl p-2 text-sm text-amber-500 opacity-80 hover:text-amber-600 hover:opacity-100 focus:opacity-100"
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
                <ArchiveRestoreIcon className="size-5" />
              </button>
            )}
          </>
        )}
        <Button
          disabled={isPending}
          className="squircle rounded-2xl w-32 overflow-hidden"
          tabIndex={7}
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
